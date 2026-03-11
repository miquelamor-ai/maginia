"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Sparkles, RefreshCw, ChevronRight, ChevronLeft, AlertTriangle, Grid3X3, List, Trash2 } from "lucide-react";

// ─── Constants ──────────────────────────────────────────────────

const COURSES = [
  { id: "I3-I5", name: "Infantil", sub: "I3 – I5", age: "3-5 anys", minAge: 3 },
  { id: "PRI-CI", name: "Cicle Inicial", sub: "1r – 2n", age: "6-7 anys", minAge: 6 },
  { id: "PRI-CM", name: "Cicle Mitjà", sub: "3r – 4t", age: "8-9 anys", minAge: 8 },
  { id: "PRI-CS", name: "Cicle Superior", sub: "5è – 6è", age: "10-11 anys", minAge: 10 },
  { id: "ESO-1", name: "1r ESO", sub: "", age: "12 anys", minAge: 12 },
  { id: "ESO-2", name: "2n ESO", sub: "", age: "13 anys", minAge: 13 },
  { id: "ESO-3", name: "3r ESO", sub: "", age: "14 anys", minAge: 14 },
  { id: "ESO-4", name: "4t ESO", sub: "", age: "15 anys", minAge: 15 },
  { id: "BATX", name: "Batxillerat", sub: "1r – 2n", age: "16-17 anys", minAge: 16 },
  { id: "FP-CGM", name: "FP Grau Mitjà", sub: "CGM", age: "16+ anys", minAge: 16 },
  { id: "FP-CGS", name: "FP Grau Superior", sub: "CGS", age: "18+ anys", minAge: 18 },
];

// Eines disponibles a l'ecosistema
const EINES = ["Copilot", "Gemini", "NotebookLM"];

const MODALITIES = [
  { id: "guiat", label: "Guiat", full: "Guiat", desc: "L'alumne interactua amb la IA seguint instruccions o prompts tancats del docent, del sistema o d'un assistent d'IA configurat per la institució.", ex: "L'alumne usa un prompt predefinit o un assistent especialitzat per corregir el seu text o buscar informació específica." },
  { id: "autonom", label: "Autònom", full: "Autònom", desc: "L'alumne decideix com usar la IA dins els límits d'una tasca concreta.", ex: "L'alumne tria si usar la IA per investigar, organitzar idees o revisar el seu treball de síntesi." },
  { id: "lliure", label: "Lliure", full: "Lliure", desc: "L'alumne usa la IA sense restriccions específiques, amb autonomia plena.", ex: "L'alumne integra la IA en el seu flux de treball com consideri, només retre comptes del resultat." },
];

const DELEG = [
  { n: 0, label: "N0", name: "Preservació", tip: "No delegació. Activitat 100% humana.", ex: "Escriure a mà, càlcul mental, debat ètic cara a cara.", color: "bg-gray-400" },
  { n: 1, label: "N1", name: "Exploració", tip: "La IA inspira o informa. El producte és 100% humà.", ex: "\"Dona'm 5 idees per a un conte\" — l'alumne tria i escriu.", color: "bg-emerald-500" },
  { n: 2, label: "N2", name: "Suport", tip: "L'alumne crea, la IA millora o corregeix.", ex: "\"Revisa les comes del meu text\" o \"On m'he equivocat en aquest càlcul?\"", color: "bg-blue-500" },
  { n: 3, label: "N3", name: "Cocreació", tip: "Persona i IA alternen el lideratge.", ex: "Crear una melodia junts: la IA proposa acords, l'alumne la lletra.", color: "bg-violet-500" },
  { n: 4, label: "N4", name: "Delegació", tip: "La IA genera el gruix; l'humà supervisa i valida.", ex: "\"Genera un resum de 200 paraules sobre la Revolució Francesa\" — l'alumne revisa.", color: "bg-amber-500" },
  { n: 5, label: "N5", name: "Agència", tip: "La IA opera autònomament dins un marc supervisat.", ex: "Plataformes adaptatives, anàlisi automàtica de dades, qüestionaris generats.", color: "bg-rose-500" },
];

// ─── Types ──────────────────────────────────────────────────────

interface CourseData {
  teacher_outside: boolean;
  teacher_inside: boolean;
  student_access: boolean;
  student_modality: string | null;
  delegation: boolean[];
}

const emptyDeclaration = (): CourseData => ({
  teacher_outside: false,
  teacher_inside: false,
  student_access: false,
  student_modality: null,
  delegation: [true, false, false, false, false, false],
});

// ─── Session ────────────────────────────────────────────────────

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("maginia_mapa_session");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("maginia_mapa_session", id);
  }
  return id;
}

function getGuidedSessionId(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("maginia_guided_session_id") || "";
}

// ─── Helpers ────────────────────────────────────────────────────

function consensColor(pct: number): string {
  if (pct >= 80) return "bg-emerald-500";
  if (pct >= 60) return "bg-lime-500";
  if (pct >= 40) return "bg-amber-400";
  if (pct >= 20) return "bg-orange-500";
  return "bg-red-400";
}

function consensTextColor(pct: number): string {
  if (pct >= 80) return "text-emerald-600";
  if (pct >= 60) return "text-lime-600";
  if (pct >= 40) return "text-amber-600";
  if (pct >= 20) return "text-orange-600";
  return "text-red-500";
}

// ─── Component ──────────────────────────────────────────────────

interface RowData {
  course_id: string;
  session_id: string;
  teacher_outside: boolean;
  teacher_inside: boolean;
  student_access: boolean;
  student_modality: string | null;
  delegation_n0: boolean;
  delegation_n1: boolean;
  delegation_n2: boolean;
  delegation_n3: boolean;
  delegation_n4: boolean;
  delegation_n5: boolean;
}

export default function MapaPage() {
  const [sessionId, setSessionId] = useState("");
  const [guidedSessionId, setGuidedSessionId] = useState("");
  const [declarations, setDeclarations] = useState<Record<string, CourseData>>({});
  const [allData, setAllData] = useState<RowData[]>([]);
  const [viewMode, setViewMode] = useState<"proposta" | "consens">("proposta");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [helpTip, setHelpTip] = useState<{ courseId: string; type: "modality" | "deleg"; id: string } | null>(null);
  const [facilitatorSync, setFacilitatorSync] = useState(false);
  const [guidedMode, setGuidedMode] = useState(true);
  const [currentCourseIdx, setCurrentCourseIdx] = useState(0);

  useEffect(() => {
    const sid = getSessionId();
    const gsid = getGuidedSessionId();
    setSessionId(sid);
    setGuidedSessionId(gsid);
    loadMyData(sid);
    loadAllData();
    // Auto-open consens tab if URL has ?view=consens
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("view") === "consens") {
      setViewMode("consens");
    }
  }, []);

  // ─── Facilitator sync ──────────────────────────────────────
  useEffect(() => {
    const poll = async () => {
      const { data } = await supabase
        .from("mapa_facilitador_state")
        .select("*")
        .eq("id", 1)
        .single();
      if (data && data.is_active) {
        // Adopt guided_session_id from facilitator if not set
        if (data.guided_session_id && !guidedSessionId) {
          localStorage.setItem("maginia_guided_session_id", data.guided_session_id);
          setGuidedSessionId(data.guided_session_id);
        }
        if (data.phase === "mapa") {
          setFacilitatorSync(true);
        } else if (data.phase === "calibra") {
          window.location.href = "/mapa/calibra";
        } else if (data.phase === "valida") {
          window.location.href = "/mapa/valida";
        }
      } else {
        setFacilitatorSync(false);
      }
    };
    poll();
    const interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, [guidedSessionId]);

  // Heartbeat during guided session
  useEffect(() => {
    if (!sessionId || !guidedSessionId) return;
    const heartbeat = () => {
      supabase.from("mapa_sessions").upsert({
        session_id: sessionId,
        guided_session_id: guidedSessionId,
        last_heartbeat: new Date().toISOString(),
      }, { onConflict: "session_id,guided_session_id" });
    };
    heartbeat();
    const interval = setInterval(heartbeat, 10000);
    return () => clearInterval(interval);
  }, [sessionId, guidedSessionId]);

  const loadMyData = async (sid: string) => {
    const { data } = await supabase
      .from("mapa_declarations")
      .select("*")
      .eq("session_id", sid);

    if (data) {
      const map: Record<string, CourseData> = {};
      data.forEach((row: RowData) => {
        map[row.course_id] = {
          teacher_outside: row.teacher_outside,
          teacher_inside: row.teacher_inside,
          student_access: row.student_access,
          student_modality: row.student_modality,
          delegation: [
            row.delegation_n0, row.delegation_n1, row.delegation_n2,
            row.delegation_n3, row.delegation_n4, row.delegation_n5,
          ],
        };
      });
      setDeclarations(map);
    }
  };

  const loadAllData = async () => {
    const { data } = await supabase.from("mapa_declarations").select("*");
    if (data) setAllData(data as RowData[]);
  };

  const updateCourse = useCallback(async (courseId: string, updates: Partial<CourseData>) => {
    const current = declarations[courseId] || emptyDeclaration();
    const updated = { ...current, ...updates };

    setDeclarations(prev => ({ ...prev, [courseId]: updated }));

    await supabase.from("mapa_declarations").upsert({
      session_id: sessionId,
      course_id: courseId,
      teacher_outside: updated.teacher_outside,
      teacher_inside: updated.teacher_inside,
      student_access: updated.student_access,
      student_modality: updated.student_access ? updated.student_modality : null,
      delegation_n0: updated.delegation[0],
      delegation_n1: updated.delegation[1],
      delegation_n2: updated.delegation[2],
      delegation_n3: updated.delegation[3],
      delegation_n4: updated.delegation[4],
      delegation_n5: updated.delegation[5],
      guided_session_id: guidedSessionId || null,
    }, { onConflict: "session_id,course_id" });

    // Also send heartbeat on save to keep presence alive
    if (guidedSessionId) {
      supabase.from("mapa_sessions").upsert({
        session_id: sessionId,
        guided_session_id: guidedSessionId,
        last_heartbeat: new Date().toISOString(),
      }, { onConflict: "session_id,guided_session_id" });
    }

    setFeedback("Guardat");
    setTimeout(() => setFeedback(null), 1200);
  }, [sessionId, declarations]);

  const toggleDelegation = useCallback((courseId: string, n: number) => {
    const current = declarations[courseId] || emptyDeclaration();
    const currentMax = current.delegation.lastIndexOf(true);

    // Cumulative: clicking N sets all 0..N active, N+1..5 inactive
    // Clicking the current max deactivates it (lowers to N-1)
    let newMax: number;
    if (n === currentMax) {
      newMax = n - 1; // lower by one
    } else {
      newMax = n; // set this as max
    }

    const newDeleg = DELEG.map((_, i) => i <= newMax);
    updateCourse(courseId, { delegation: newDeleg });
  }, [declarations, updateCourse]);

  // ─── Consensus ──────────────────────────────────────────────

  const consensus = useMemo(() => {
    if (!allData.length) return null;
    const sessions = new Set(allData.map(r => r.session_id));
    const total = sessions.size;

    const byCourse: Record<string, {
      total: number;
      responses: number;
      teacher_outside: number;
      teacher_inside: number;
      student_access: number;
      modalities: { id: string; percent: number }[];
      delegation: { n: number; percent: number }[];
    }> = {};

    COURSES.forEach(c => {
      const rows = allData.filter(r => r.course_id === c.id);
      const count = rows.length;
      byCourse[c.id] = {
        total,
        responses: count,
        teacher_outside: count ? rows.filter(r => r.teacher_outside).length / count * 100 : 0,
        teacher_inside: count ? rows.filter(r => r.teacher_inside).length / count * 100 : 0,
        student_access: count ? rows.filter(r => r.student_access).length / count * 100 : 0,
        modalities: MODALITIES.map(m => ({
          id: m.id,
          percent: count ? rows.filter(r => r.student_modality === m.id).length / count * 100 : 0,
        })),
        delegation: DELEG.map((d, i) => ({
          n: d.n,
          percent: count ? rows.filter(r => r[`delegation_n${i}` as keyof RowData] as boolean).length / count * 100 : 0,
        })),
      };
    });

    return { total, byCourse };
  }, [allData]);

  const handleSwitchToConsens = () => {
    loadAllData();
    setViewMode("consens");
  };

  const handleResetMyData = async () => {
    if (!sessionId) return;
    await supabase.from("mapa_declarations").delete().eq("session_id", sessionId);
    setDeclarations({});
    setCurrentCourseIdx(0);
    setFeedback("Dades esborrades");
    setTimeout(() => setFeedback(null), 1500);
  };

  // ─── Render ─────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-[var(--jesuites-cream)] pb-32 font-sans select-none overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4">

        {/* Header */}
        <header className="py-10 text-center sticky top-0 bg-[var(--jesuites-cream)]/90 backdrop-blur-md z-30 border-b border-black/5">
          <div className="w-14 h-14 bg-[var(--jesuites-blue)] rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
            <Sparkles size={28} />
          </div>
          <h1 className="text-2xl font-bold text-[var(--jesuites-blue)] uppercase tracking-tighter">Mapa de Delegació</h1>
          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1">Declara l&apos;ús de la IA per curs</p>

          {/* View Toggle */}
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setViewMode("proposta")}
              className={`px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${viewMode === "proposta" ? "bg-[var(--jesuites-blue)] text-white shadow-lg" : "bg-black/5 text-gray-400 hover:bg-black/10"}`}
            >
              La meva proposta
            </button>
            <button
              onClick={handleSwitchToConsens}
              className={`px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${viewMode === "consens" ? "bg-[var(--jesuites-blue)] text-white shadow-lg" : "bg-black/5 text-gray-400 hover:bg-black/10"}`}
            >
              Consens {consensus ? `(${consensus.total})` : ""}
            </button>
          </div>
        </header>

        {/* ═══ INDIVIDUAL VIEW ═══ */}
        {viewMode === "proposta" && (
          <>
            {/* Mode toggle: guided vs grid + reset */}
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => { if (confirm("Esborrar totes les meves declaracions?")) handleResetMyData(); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-50 hover:bg-red-100 transition-all border border-red-200"
              >
                <Trash2 size={12} /> Esborrar
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setGuidedMode(true)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${guidedMode ? "bg-[var(--jesuites-blue)] text-white shadow-sm" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                >
                  <List size={12} /> Guiat
                </button>
                <button
                  onClick={() => setGuidedMode(false)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${!guidedMode ? "bg-[var(--jesuites-blue)] text-white shadow-sm" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                >
                  <Grid3X3 size={12} /> Tots
                </button>
              </div>
            </div>

            {/* ── Guided mode: one course at a time ── */}
            {guidedMode && (() => {
              const course = COURSES[currentCourseIdx];
              const d = declarations[course.id] || emptyDeclaration();
              const hasVoted = declarations[course.id] !== undefined;
              return (
                <div className="mt-6 max-w-xl mx-auto">
                  {/* Progress bar */}
                  <div className="flex gap-1 mb-4">
                    {COURSES.map((c, i) => {
                      const voted = declarations[c.id] !== undefined;
                      return (
                        <button
                          key={c.id}
                          onClick={() => setCurrentCourseIdx(i)}
                          className={`flex-1 h-2 rounded-full transition-all ${
                            i === currentCourseIdx ? "bg-[var(--jesuites-blue)] scale-y-150" :
                            voted ? "bg-emerald-400" : "bg-gray-200"
                          }`}
                        />
                      );
                    })}
                  </div>
                  <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">
                    Curs {currentCourseIdx + 1} de {COURSES.length}
                  </p>

                  {/* Course card */}
                  <CourseCard
                    course={course}
                    d={d}
                    updateCourse={updateCourse}
                    toggleDelegation={toggleDelegation}
                    helpTip={helpTip}
                    setHelpTip={setHelpTip}
                  />

                  {/* Navigation */}
                  <div className="flex items-center justify-between mt-6 gap-3">
                    <button
                      onClick={() => setCurrentCourseIdx(i => Math.max(0, i - 1))}
                      disabled={currentCourseIdx === 0}
                      className="flex items-center gap-1 px-4 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-gray-500 bg-black/5 hover:bg-black/10 transition-all disabled:opacity-20"
                    >
                      <ChevronLeft size={14} /> Anterior
                    </button>
                    {currentCourseIdx < COURSES.length - 1 ? (
                      <button
                        onClick={() => {
                          updateCourse(course.id, declarations[course.id] || emptyDeclaration());
                          setCurrentCourseIdx(i => i + 1);
                        }}
                        className="flex items-center gap-1 px-4 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-white bg-[var(--jesuites-blue)] shadow-lg hover:shadow-xl transition-all"
                      >
                        Següent <ChevronRight size={14} />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          updateCourse(course.id, declarations[course.id] || emptyDeclaration());
                          handleSwitchToConsens();
                        }}
                        className="flex items-center gap-1 px-5 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-white bg-emerald-500 shadow-lg hover:shadow-xl transition-all"
                      >
                        Veure resultats <ChevronRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* ── Grid mode: all courses ── */}
            {!guidedMode && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                {COURSES.map(course => {
                  const d = declarations[course.id] || emptyDeclaration();
                  return (
                    <CourseCard
                      key={course.id}
                      course={course}
                      d={d}
                      updateCourse={updateCourse}
                      toggleDelegation={toggleDelegation}
                      helpTip={helpTip}
                      setHelpTip={setHelpTip}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ═══ CONSENSUS VIEW ═══ */}
        {viewMode === "consens" && (
          <div className="mt-8">
            {/* Refresh */}
            <div className="flex justify-end mb-4">
              <button
                onClick={loadAllData}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/5 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:bg-black/10 transition-all"
              >
                <RefreshCw size={12} /> Actualitzar
              </button>
            </div>

            {!consensus || consensus.total === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p className="text-lg font-bold">Encara no hi ha propostes</p>
                <p className="text-sm mt-2">Canvia a &quot;La meva proposta&quot; per començar</p>
              </div>
            ) : (
              <>
                {/* Legend */}
                <div className="flex justify-center gap-4 mb-6 flex-wrap">
                  <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-gray-400">
                    <div className="w-3 h-3 rounded bg-emerald-500" /> &gt;80% Consens
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-gray-400">
                    <div className="w-3 h-3 rounded bg-amber-400" /> 40-80% Debat
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-gray-400">
                    <div className="w-3 h-3 rounded bg-red-400" /> &lt;40% Desacord
                  </div>
                </div>

                <p className="text-center text-[11px] text-gray-400 font-bold mb-6">
                  {consensus.total} {consensus.total === 1 ? "proposta rebuda" : "propostes rebudes"}
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {COURSES.map(course => {
                    const c = consensus.byCourse[course.id];
                    if (!c) return null;
                    return (
                      <div key={course.id} className="bg-white rounded-3xl p-6 shadow-sm border border-black/[0.04]">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-5">
                          <div>
                            <h3 className="text-lg font-bold text-[var(--jesuites-blue)] uppercase tracking-tight leading-none">{course.name}</h3>
                            {course.sub && <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{course.sub}</span>}
                          </div>
                          <span className="text-[10px] font-bold text-gray-300 bg-black/5 px-3 py-1 rounded-full">
                            {c.responses}/{c.total} respostes
                          </span>
                        </div>

                        {/* Docent Bars */}
                        <div className="mb-4 space-y-2">
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.25em]">Docent</p>
                          <ConsensusBar label="Fora de l'aula" pct={c.teacher_outside} />
                          <ConsensusBar label="Dins l'aula" pct={c.teacher_inside} />
                        </div>

                        {/* Alumnat Bar */}
                        <div className="mb-4 space-y-2">
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.25em]">Alumnat</p>
                          <ConsensusBar label="Accés IA" pct={c.student_access} />
                        </div>

                        {/* Modality Distribution */}
                        {c.student_access > 0 && (
                          <div className="mb-4">
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.25em] mb-2">Modalitat</p>
                            <div className="grid grid-cols-3 gap-1.5">
                              {c.modalities.map((m, i) => (
                                <div key={m.id} className="text-center">
                                  <div className={`h-2 rounded-full ${m.percent > 0 ? "bg-violet-500" : "bg-black/[0.06]"}`} style={{ opacity: m.percent > 0 ? Math.max(0.3, m.percent / 100) : 1 }} />
                                  <span className="text-[8px] font-bold text-gray-400 block mt-1">{MODALITIES[i].label}</span>
                                  <span className={`text-[10px] font-bold ${m.percent > 0 ? "text-violet-600" : "text-gray-300"}`}>{Math.round(m.percent)}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Delegation Levels */}
                        {c.student_access > 0 && (
                          <div>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.25em] mb-2">Nivells de delegació</p>
                            <div className="grid grid-cols-6 gap-1.5">
                              {c.delegation.map((dl, i) => (
                                <div key={dl.n} className="text-center">
                                  <div className={`py-1.5 rounded-lg ${dl.percent > 0 ? consensColor(dl.percent) : "bg-black/[0.04]"}`}>
                                    <span className={`text-[10px] font-bold block leading-none ${dl.percent > 0 ? "text-white" : "text-gray-300"}`}>
                                      {DELEG[i].label}
                                    </span>
                                  </div>
                                  <span className={`text-[10px] font-bold mt-1 block ${consensTextColor(dl.percent)}`}>
                                    {Math.round(dl.percent)}%
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-[var(--jesuites-blue)] text-white px-8 py-4 rounded-full text-[10px] font-bold shadow-2xl uppercase tracking-[0.3em] z-[100] border border-white/10">
          {feedback}
        </div>
      )}

      {/* Bottom Nav */}
      {facilitatorSync ? (
        <div className="fixed bottom-0 left-0 right-0 p-3 bg-[var(--jesuites-blue)] text-center z-[90]">
          <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest animate-pulse">Sessió guiada pel facilitador</p>
        </div>
      ) : (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-black/5 flex justify-center gap-6 z-[90]">
          <button onClick={() => window.location.href = "/mapa/calibra"} className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 hover:text-[var(--jesuites-blue)] transition-all">
            1. Calibra
          </button>
          <button className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--jesuites-blue)] underline underline-offset-4">
            2. Mapa
          </button>
          <button onClick={() => window.location.href = "/mapa/valida"} className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 hover:text-amber-600 transition-all">
            3. Valida
          </button>
        </div>
      )}
    </main>
  );
}

// ─── Course Card ────────────────────────────────────────────────

function CourseCard({
  course, d, updateCourse, toggleDelegation, helpTip, setHelpTip,
}: {
  course: typeof COURSES[number];
  d: CourseData;
  updateCourse: (courseId: string, updates: Partial<CourseData>) => void;
  toggleDelegation: (courseId: string, n: number) => void;
  helpTip: { courseId: string; type: "modality" | "deleg"; id: string } | null;
  setHelpTip: (tip: { courseId: string; type: "modality" | "deleg"; id: string } | null) => void;
}) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/[0.04] transition-all hover:shadow-md">
      {/* Course Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold text-[var(--jesuites-blue)] uppercase tracking-tight leading-none">{course.name}</h3>
          {course.sub && <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{course.sub}</span>}
        </div>
        <span className="text-[11px] font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">{course.age}</span>
      </div>

      {/* Docent Row */}
      <div className="mb-4">
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.25em] mb-2">Docent</p>
        <div className="flex gap-2">
          <button
            onClick={() => updateCourse(course.id, { teacher_outside: !d.teacher_outside })}
            className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${d.teacher_outside ? "bg-[var(--jesuites-blue)] text-white shadow-md" : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200"}`}
          >
            Fora de l&apos;aula
          </button>
          <button
            onClick={() => updateCourse(course.id, { teacher_inside: !d.teacher_inside })}
            className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${d.teacher_inside ? "bg-[var(--jesuites-blue)] text-white shadow-md" : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200"}`}
          >
            Dins l&apos;aula
          </button>
        </div>
      </div>

      {/* Alumnat */}
      <div className="mb-4">
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.25em] mb-2">Alumnat utilitza IA?</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => updateCourse(course.id, { student_access: false, student_modality: null })}
            className={`py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${!d.student_access ? "bg-gray-600 text-white shadow-md" : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200"}`}
          >
            No
          </button>
          <button
            onClick={() => {
              // When enabling student access, auto-clear N0 and set minimum N1
              const newDeleg = [...d.delegation];
              if (!d.student_access) {
                newDeleg[0] = false;
                if (!newDeleg.some((v, i) => i > 0 && v)) newDeleg[1] = true; // ensure at least N1
              }
              updateCourse(course.id, { student_access: true, delegation: newDeleg });
            }}
            className={`py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${d.student_access ? "bg-emerald-500 text-white shadow-md" : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200"}`}
          >
            Sí
          </button>
        </div>

        {/* Age Warning */}
        {d.student_access && course.minAge < 14 && (
          <div className="mt-2 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold text-amber-700 leading-tight">
                Cal autorització familiar (LOPDGDD &lt;14 anys)
              </p>
              <p className="text-[9px] text-amber-600 mt-0.5 leading-tight">
                Eines gestionades ({EINES.join(", ")}): permès amb consentiment parental
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modality + Delegation (only if student access) */}
      <div className={`transition-all duration-500 overflow-hidden ${d.student_access ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}`}>
        {/* Modality */}
        <div className="mb-4">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.25em] mb-2">Modalitat d&apos;ús <span className="normal-case tracking-normal font-normal">(clica per veure ajuda)</span></p>
          <div className="grid grid-cols-3 gap-1.5">
            {MODALITIES.map(m => (
              <button
                key={m.id}
                onClick={() => {
                  updateCourse(course.id, { student_modality: d.student_modality === m.id ? null : m.id });
                  setHelpTip(d.student_modality === m.id ? null : { courseId: course.id, type: "modality", id: m.id });
                }}
                className={`py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${d.student_modality === m.id ? "bg-violet-500 text-white shadow-md" : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200"}`}
              >
                {m.label}
              </button>
            ))}
          </div>
          {/* Modality Help Tip */}
          {helpTip?.courseId === course.id && helpTip.type === "modality" && (() => {
            const mod = MODALITIES.find(m => m.id === helpTip.id);
            if (!mod) return null;
            return (
              <div className="mt-2 bg-violet-50 border border-violet-200 rounded-xl px-3 py-2.5 animate-fade-in">
                <p className="text-[11px] font-bold text-violet-700 mb-1">{mod.full}</p>
                <p className="text-[10px] text-violet-600 leading-snug">{mod.desc}</p>
                <p className="text-[9px] text-violet-500 mt-1.5 italic leading-snug">&ldquo;{mod.ex}&rdquo;</p>
              </div>
            );
          })()}
        </div>

        {/* Delegation Levels */}
        <div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.25em] mb-2">Nivells de delegació permesos <span className="normal-case tracking-normal font-normal">(clica per veure ajuda)</span></p>
          <div className="grid grid-cols-6 gap-1.5">
            {DELEG.map(dl => {
              const isN0Blocked = dl.n === 0 && d.student_access;
              return (
                <button
                  key={dl.n}
                  disabled={isN0Blocked}
                  onClick={() => {
                    if (isN0Blocked) return;
                    toggleDelegation(course.id, dl.n);
                    setHelpTip({ courseId: course.id, type: "deleg", id: String(dl.n) });
                  }}
                  className={`py-2.5 rounded-xl text-center transition-all ${
                    isN0Blocked ? "bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed opacity-40" :
                    d.delegation[dl.n] ? `${dl.color} text-white shadow-md ring-1 ring-black/10` : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200"
                  }`}
                >
                  <span className="text-[11px] font-bold block leading-none">{dl.label}</span>
                  <span className="text-[8px] font-semibold block mt-0.5 leading-none opacity-80">{dl.name}</span>
                </button>
              );
            })}
          </div>
          {/* Delegation Help Tip */}
          {helpTip?.courseId === course.id && helpTip.type === "deleg" && (() => {
            const dl = DELEG.find(d => String(d.n) === helpTip.id);
            if (!dl) return null;
            return (
              <div className="mt-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 animate-fade-in">
                <p className="text-[11px] font-bold text-slate-700 mb-1">{dl.label}: {dl.name}</p>
                <p className="text-[10px] text-slate-600 leading-snug">{dl.tip}</p>
                <p className="text-[9px] text-slate-500 mt-1.5 italic leading-snug">&ldquo;{dl.ex}&rdquo;</p>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-component ──────────────────────────────────────────────

function ConsensusBar({ label, pct }: { label: string; pct: number }) {
  const rounded = Math.round(pct);
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-bold text-gray-500 w-24 text-right shrink-0">{label}</span>
      <div className="flex-1 h-5 bg-black/[0.04] rounded-full overflow-hidden relative">
        <div
          className={`h-full rounded-full transition-all duration-700 ${consensColor(pct)}`}
          style={{ width: `${Math.max(rounded, 2)}%` }}
        />
        <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold ${rounded > 60 ? "text-white" : consensTextColor(pct)}`}>
          {rounded}%
        </span>
      </div>
    </div>
  );
}
