"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Sparkles, RefreshCw, ChevronRight } from "lucide-react";

// ─── Constants ──────────────────────────────────────────────────

const COURSES = [
  { id: "I3-I5", name: "Infantil", sub: "I3 – I5", age: "3-5 anys" },
  { id: "PRI-CI", name: "Cicle Inicial", sub: "1r – 2n", age: "6-7 anys" },
  { id: "PRI-CM", name: "Cicle Mitjà", sub: "3r – 4t", age: "8-9 anys" },
  { id: "PRI-CS", name: "Cicle Superior", sub: "5è – 6è", age: "10-11 anys" },
  { id: "ESO-1", name: "1r ESO", sub: "", age: "12 anys" },
  { id: "ESO-2", name: "2n ESO", sub: "", age: "13 anys" },
  { id: "ESO-3", name: "3r ESO", sub: "", age: "14 anys" },
  { id: "ESO-4", name: "4t ESO", sub: "", age: "15 anys" },
  { id: "BATX", name: "Batxillerat", sub: "1r – 2n", age: "16-17 anys" },
  { id: "FP-CGM", name: "FP Grau Mitjà", sub: "CGM", age: "16+ anys" },
  { id: "FP-CGS", name: "FP Grau Superior", sub: "CGS", age: "18+ anys" },
];

const MODALITIES = [
  { id: "acompanyat", label: "Acomp.", full: "Acompanyat", desc: "Ús col·lectiu amb el docent present" },
  { id: "guiat", label: "Guiat", full: "Guiat", desc: "Pautes i prompts predefinits" },
  { id: "autonom", label: "Autòn.", full: "Autònom", desc: "Llibertat dins la tasca definida" },
  { id: "lliure", label: "Lliure", full: "Lliure", desc: "Ús no prescriptiu" },
];

const DELEG = [
  { n: 0, label: "N0", name: "Preservació", tip: "Activitat humana directa", color: "bg-gray-400" },
  { n: 1, label: "N1", name: "Exploració", tip: "Font d'idees i informació", color: "bg-emerald-500" },
  { n: 2, label: "N2", name: "Suport", tip: "Millora del treball humà", color: "bg-blue-500" },
  { n: 3, label: "N3", name: "Cocreació", tip: "Diàleg iteratiu persona-IA", color: "bg-violet-500" },
  { n: 4, label: "N4", name: "Delegació", tip: "L'IA fa el gruix, l'humà valida", color: "bg-amber-500" },
  { n: 5, label: "N5", name: "Agència", tip: "Automatització supervisada", color: "bg-rose-500" },
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
  const [declarations, setDeclarations] = useState<Record<string, CourseData>>({});
  const [allData, setAllData] = useState<RowData[]>([]);
  const [viewMode, setViewMode] = useState<"proposta" | "consens">("proposta");
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const sid = getSessionId();
    setSessionId(sid);
    loadMyData(sid);
    loadAllData();
  }, []);

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
    }, { onConflict: "session_id,course_id" });

    setFeedback("Guardat");
    setTimeout(() => setFeedback(null), 1200);
  }, [sessionId, declarations]);

  const toggleDelegation = useCallback((courseId: string, n: number) => {
    const current = declarations[courseId] || emptyDeclaration();
    const newDeleg = [...current.delegation];
    newDeleg[n] = !newDeleg[n];
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">
            {COURSES.map(course => {
              const d = declarations[course.id] || emptyDeclaration();
              return (
                <div key={course.id} className="bg-white rounded-3xl p-6 shadow-sm border border-black/[0.04] transition-all hover:shadow-md">
                  {/* Course Header */}
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-lg font-bold text-[var(--jesuites-blue)] uppercase tracking-tight leading-none">{course.name}</h3>
                      {course.sub && <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{course.sub}</span>}
                    </div>
                    <span className="text-[10px] font-bold text-gray-300 bg-black/5 px-3 py-1 rounded-full uppercase tracking-wider">{course.age}</span>
                  </div>

                  {/* Docent Row */}
                  <div className="mb-4">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.25em] mb-2">Docent</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateCourse(course.id, { teacher_outside: !d.teacher_outside })}
                        className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${d.teacher_outside ? "bg-[var(--jesuites-blue)] text-white shadow-md" : "bg-black/[0.04] text-gray-400 hover:bg-black/[0.08]"}`}
                      >
                        Fora de l&apos;aula
                      </button>
                      <button
                        onClick={() => updateCourse(course.id, { teacher_inside: !d.teacher_inside })}
                        className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${d.teacher_inside ? "bg-[var(--jesuites-blue)] text-white shadow-md" : "bg-black/[0.04] text-gray-400 hover:bg-black/[0.08]"}`}
                      >
                        Dins l&apos;aula
                      </button>
                    </div>
                  </div>

                  {/* Alumnat Toggle */}
                  <div className="mb-4">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.25em] mb-2">Alumnat</p>
                    <button
                      onClick={() => updateCourse(course.id, { student_access: !d.student_access, student_modality: d.student_access ? null : d.student_modality })}
                      className={`w-full py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${d.student_access ? "bg-emerald-500 text-white shadow-md" : "bg-black/[0.04] text-gray-400 hover:bg-black/[0.08]"}`}
                    >
                      {d.student_access ? "Alumnat utilitza IA" : "Alumnat NO utilitza IA"}
                    </button>
                  </div>

                  {/* Modality + Delegation (only if student access) */}
                  <div className={`transition-all duration-500 overflow-hidden ${d.student_access ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"}`}>
                    {/* Modality */}
                    <div className="mb-4">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.25em] mb-2">Modalitat d&apos;ús</p>
                      <div className="grid grid-cols-4 gap-1.5">
                        {MODALITIES.map(m => (
                          <button
                            key={m.id}
                            onClick={() => updateCourse(course.id, { student_modality: d.student_modality === m.id ? null : m.id })}
                            title={m.desc}
                            className={`py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${d.student_modality === m.id ? "bg-violet-500 text-white shadow-md" : "bg-black/[0.04] text-gray-400 hover:bg-black/[0.08]"}`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Delegation Levels */}
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.25em] mb-2">Nivells de delegació permesos</p>
                      <div className="grid grid-cols-6 gap-1.5">
                        {DELEG.map(dl => (
                          <button
                            key={dl.n}
                            onClick={() => toggleDelegation(course.id, dl.n)}
                            title={`${dl.name}: ${dl.tip}`}
                            className={`py-2 rounded-lg text-center transition-all ${d.delegation[dl.n] ? `${dl.color} text-white shadow-md` : "bg-black/[0.04] text-gray-400 hover:bg-black/[0.08]"}`}
                          >
                            <span className="text-[10px] font-bold block leading-none">{dl.label}</span>
                            <span className="text-[7px] font-medium block mt-0.5 leading-none opacity-80">{dl.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
                            <div className="grid grid-cols-4 gap-1.5">
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
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-black/5 flex justify-center gap-8 z-[90]">
        <button onClick={() => window.location.href = "/"} className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--jesuites-blue)] hover:underline">
          &larr; Web
        </button>
        <button onClick={() => window.location.href = "/participar"} className="text-[10px] font-bold uppercase tracking-[0.4em] text-violet-600 hover:underline">
          Participar
        </button>
        <button onClick={() => window.location.href = "/#results-dashboard"} className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-600 hover:underline">
          Resultats <ChevronRight size={10} className="inline" />
        </button>
      </div>
    </main>
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
