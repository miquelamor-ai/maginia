"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Sparkles, ChevronRight, ChevronLeft, ThumbsUp, ThumbsDown, AlertTriangle, Check, RotateCcw } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────

interface ValidationScenario {
  id: string;
  text: string;
  context: string;
  impliedLevel: number;
  tag: "offloading" | "outsourcing";
  friction: "alta" | "baixa" | "nul·la";
  frictionNote: string;
  discussion: string;
}

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

const DELEG_LABELS = [
  { n: 0, label: "N0", name: "Preservació" },
  { n: 1, label: "N1", name: "Exploració" },
  { n: 2, label: "N2", name: "Suport" },
  { n: 3, label: "N3", name: "Cocreació" },
  { n: 4, label: "N4", name: "Delegació" },
  { n: 5, label: "N5", name: "Agència" },
];

const SCENARIOS: ValidationScenario[] = [
  {
    id: "val-01",
    text: "Un alumne de 3r ESO demana a la IA que li resolgui un problema de matemàtiques pas a pas. Copia la solució al quadern sense intentar-ho ell primer.",
    context: "3r ESO · Matemàtiques",
    impliedLevel: 4,
    tag: "outsourcing",
    friction: "nul·la",
    frictionNote: "L'alumne no experimenta cap dificultat desitjable. No hi ha esforç cognitiu previ ni posterior.",
    discussion: "Nivell N4 sense supervisió real. L'alumne externalitza la tasca cognitiva completament. Si has declarat que N4 no és permès a 3r ESO, la teva resposta hauria de ser coherent.",
  },
  {
    id: "val-02",
    text: "Una alumna escriu un text creatiu sobre el futur de la seva ciutat. Després, demana a la IA suggeriments per millorar l'estructura i el vocabulari. Decideix què incorporar.",
    context: "4t ESO · Llengua Catalana",
    impliedLevel: 2,
    tag: "offloading",
    friction: "alta",
    frictionNote: "L'alumna ha fet l'esforç creatiu primer. La IA actua com a feedback, i l'alumna manté la decisió final.",
    discussion: "Nivell N2 — Suport clàssic. L'alumna crea, la IA ajuda a millorar. L'aprenentatge ve d'escriure primer i de decidir què acceptar.",
  },
  {
    id: "val-03",
    text: "El docent utilitza NotebookLM per generar un qüestionari de 20 preguntes adaptat al nivell del grup de 2n ESO, a partir dels apunts del tema.",
    context: "2n ESO · Qualsevol matèria",
    impliedLevel: -1,
    tag: "offloading",
    friction: "alta",
    frictionNote: "No aplica — és ús docent fora de l'aula. La fricció cognitiva de l'alumnat no es veu afectada.",
    discussion: "Ús docent fora de l'aula. Si has declarat que el docent pot usar IA fora de l'aula, hauries d'aprovar-ho.",
  },
  {
    id: "val-04",
    text: "Un alumne de Batxillerat utilitza Copilot per generar tot el codi d'un projecte de tecnologia. Presenta el resultat sense entendre el codi.",
    context: "Batxillerat · Tecnologia",
    impliedLevel: 4,
    tag: "outsourcing",
    friction: "nul·la",
    frictionNote: "Zero fricció cognitiva. L'alumne no ha après a programar — ha après a demanar. Outsourcing total de la competència.",
    discussion: "Nivell N4 sense supervisió real. Si permets N4 a Batxillerat, aquest escenari el fa coherent — però és un outsourcing que no genera aprenentatge.",
  },
  {
    id: "val-05",
    text: "Una alumna de 6è demana a Gemini: «Explica'm què és la fotosíntesi amb paraules senzilles.» Després ho explica amb les seves pròpies paraules al company de taula.",
    context: "Cicle Superior · Ciències",
    impliedLevel: 1,
    tag: "offloading",
    friction: "alta",
    frictionNote: "L'alumna utilitza la IA per entendre, no per substituir. Reformular i explicar a un altre és una prova de comprensió genuïna.",
    discussion: "Nivell N1 — Exploració. La IA informa, l'alumna processa i transforma el coneixement. Atenció: l'alumna té 10-11 anys (< 14), cal autorització LOPDGDD.",
  },
  {
    id: "val-06",
    text: "Un alumne de 1r ESO utilitza la IA per traduir un text sencer de l'anglès al català, sense haver-ho intentat primer. Lliura la traducció.",
    context: "1r ESO · Anglès",
    impliedLevel: 4,
    tag: "outsourcing",
    friction: "nul·la",
    frictionNote: "La traducció és exactament la competència que es vol desenvolupar. Delegar-la completament és outsourcing de l'aprenentatge.",
    discussion: "Nivell N4 — Delegació total de la competència objectiu. Diferent de demanar ajuda amb un paràgraf concret (que seria N2).",
  },
  {
    id: "val-07",
    text: "El docent projecta la IA a la pissarra digital i els alumnes de 2n ESO analitzen conjuntament si la IA s'equivoca en respondre preguntes sobre els volcans.",
    context: "2n ESO · Ciències Naturals",
    impliedLevel: 1,
    tag: "offloading",
    friction: "alta",
    frictionNote: "L'alumnat fa pensament crític actiu: avaluar, verificar, argumentar. La IA és l'objecte d'anàlisi, no l'eina de producció.",
    discussion: "Nivell N1 — Exploració amb esperit crític. El docent controla la IA dins l'aula. Si permets docent dins l'aula a 2n ESO, coherent.",
  },
  {
    id: "val-08",
    text: "Un alumne de 4t ESO fa servir la IA per generar 5 idees per a un projecte d'emprenedoria. Després en tria una, la desenvolupa ell sol i justifica la seva tria.",
    context: "4t ESO · Emprenedoria",
    impliedLevel: 1,
    tag: "offloading",
    friction: "alta",
    frictionNote: "Generar idees inicials és una fase divergent. L'alumne fa la feina convergent (triar, justificar, desenvolupar), que és la més valuosa.",
    discussion: "Nivell N1 — La IA inspira, l'alumne crea. El producte final és 100% de l'alumne.",
  },
  {
    id: "val-09",
    text: "Una eina d'IA corregeix automàticament tots els exercicis de gramàtica d'un alumne de 1r ESO i li dona la nota sense que ell revisi els errors.",
    context: "1r ESO · Llengua",
    impliedLevel: 5,
    tag: "outsourcing",
    friction: "nul·la",
    frictionNote: "L'alumne no revisa els seus errors. La IA ha substituït el feedback pedagògic. Sense revisió, no hi ha aprenentatge del procés.",
    discussion: "Nivell N5 — Agència sense valor pedagògic. Si la IA corregeix però l'alumne no revisa, s'ha externalitzat l'aprenentatge. Diferent d'una plataforma adaptativa on l'alumne treballa.",
  },
  {
    id: "val-10",
    text: "Una alumna de Batxillerat crea un podcast: ella investiga el tema, escriu el guió, la IA genera la música de fons, i ella fa l'edició i la locució final.",
    context: "Batxillerat · Projecte Interdisciplinari",
    impliedLevel: 3,
    tag: "offloading",
    friction: "alta",
    frictionNote: "L'alumna lidera tot el procés intel·lectual. La IA contribueix en un aspecte no-central (música). L'esforç cognitiu és complet.",
    discussion: "Nivell N3 — Cocreació. L'alumna fa la investigació, escriptura i producció; la IA aporta un element complementari. Bon equilibri.",
  },
];

// ─── Session ─────────────────────────────────────────────────────

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("maginia_mapa_session");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("maginia_mapa_session", id);
  }
  return id;
}

// ─── Component ───────────────────────────────────────────────────

export default function ValidaPage() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [completed, setCompleted] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [myMap, setMyMap] = useState<Record<string, RowData>>({});
  const [facilitatorSync, setFacilitatorSync] = useState(false);

  useEffect(() => {
    const sid = getSessionId();
    setSessionId(sid);
    loadMyMap(sid);
  }, []);

  // ─── Facilitator sync ──────────────────────────────────────
  useEffect(() => {
    const poll = async () => {
      const { data } = await supabase
        .from("mapa_facilitador_state")
        .select("*")
        .eq("id", 1)
        .single();
      if (data && data.is_active && data.phase === "valida") {
        setFacilitatorSync(true);
        setCurrentIdx(data.current_idx);
      } else {
        setFacilitatorSync(false);
      }
    };
    poll();
    const interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadMyMap = async (sid: string) => {
    const { data } = await supabase
      .from("mapa_declarations")
      .select("*")
      .eq("session_id", sid);

    if (data) {
      const map: Record<string, RowData> = {};
      data.forEach((row: RowData) => {
        map[row.course_id] = row;
      });
      setMyMap(map);
    }
  };

  const scenario = SCENARIOS[currentIdx];
  const myAnswer = answers[scenario.id] ?? null;
  const isRevealed = revealed[scenario.id] ?? false;

  const totalAnswered = Object.keys(answers).filter(k => answers[k] !== null).length;

  // ─── Course mapping ────────────────────────────────────────
  const courseMapping: Record<string, string> = {
    "val-01": "ESO-3",
    "val-02": "ESO-4",
    "val-03": "ESO-2",
    "val-04": "BATX",
    "val-05": "PRI-CS",
    "val-06": "ESO-1",
    "val-07": "ESO-2",
    "val-08": "ESO-4",
    "val-09": "ESO-1",
    "val-10": "BATX",
  };

  interface ConsistencyResult {
    consistent: boolean;
    reason: string;
    fix?: {
      courseId: string;
      field: string;        // e.g. "teacher_outside", "student_access", "delegation_n4"
      currentValue: boolean;
      label: string;        // human-readable action
    };
  }

  // Check consistency with map declarations
  const checkConsistency = (s: ValidationScenario, approved: boolean): ConsistencyResult | null => {
    if (Object.keys(myMap).length === 0) return null;

    const courseId = courseMapping[s.id];
    const courseData = myMap[courseId];
    if (!courseData) return null;

    // Teacher scenario (val-03)
    if (s.impliedLevel === -1) {
      if (approved && !courseData.teacher_outside) {
        return {
          consistent: false,
          reason: `Has aprovat ús docent fora de l'aula, però al mapa has declarat que el docent NO usa IA fora de l'aula a ${courseId}.`,
          fix: { courseId, field: "teacher_outside", currentValue: false, label: `Activar "Docent fora de l'aula" a ${courseId}` },
        };
      }
      if (!approved && courseData.teacher_outside) {
        return {
          consistent: false,
          reason: `Has rebutjat ús docent fora de l'aula, però al mapa has declarat que SÍ que l'usa a ${courseId}.`,
          fix: { courseId, field: "teacher_outside", currentValue: true, label: `Desactivar "Docent fora de l'aula" a ${courseId}` },
        };
      }
      return { consistent: true, reason: "Coherent amb la teva declaració de docent fora de l'aula." };
    }

    // Student scenarios
    if (approved) {
      if (!courseData.student_access) {
        return {
          consistent: false,
          reason: `Has aprovat aquest ús d'alumnat, però al mapa has declarat que l'alumnat NO accedeix a la IA a ${courseId}.`,
          fix: { courseId, field: "student_access", currentValue: false, label: `Activar accés alumnat a IA a ${courseId}` },
        };
      }
      const delegKey = `delegation_n${s.impliedLevel}` as keyof RowData;
      if (!(courseData[delegKey] as boolean)) {
        return {
          consistent: false,
          reason: `Has aprovat un escenari de nivell ${DELEG_LABELS[s.impliedLevel].label} (${DELEG_LABELS[s.impliedLevel].name}), però al mapa no has activat aquest nivell per a ${courseId}.`,
          fix: { courseId, field: `delegation_n${s.impliedLevel}`, currentValue: false, label: `Activar ${DELEG_LABELS[s.impliedLevel].label} (${DELEG_LABELS[s.impliedLevel].name}) a ${courseId}` },
        };
      }
      return { consistent: true, reason: `Coherent: has activat ${DELEG_LABELS[s.impliedLevel].label} per a ${courseId}.` };
    } else {
      if (courseData.student_access) {
        const delegKey = `delegation_n${s.impliedLevel}` as keyof RowData;
        if (courseData[delegKey] as boolean) {
          return {
            consistent: false,
            reason: `Has rebutjat un escenari de nivell ${DELEG_LABELS[s.impliedLevel].label}, però al mapa SÍ que permets aquest nivell a ${courseId}. Potser vols restringir-lo?`,
            fix: { courseId, field: `delegation_n${s.impliedLevel}`, currentValue: true, label: `Desactivar ${DELEG_LABELS[s.impliedLevel].label} (${DELEG_LABELS[s.impliedLevel].name}) a ${courseId}` },
          };
        }
      }
      return { consistent: true, reason: "Coherent amb les teves restriccions." };
    }
  };

  // ─── Fix map directly from Valida ─────────────────────────
  const [fixApplied, setFixApplied] = useState<Record<string, boolean>>({});

  const applyFix = async (scenarioId: string, fix: NonNullable<ConsistencyResult["fix"]>) => {
    const courseData = myMap[fix.courseId];
    if (!courseData) return;

    // Build update
    const newValue = !fix.currentValue;
    const update: Record<string, unknown> = { [fix.field]: newValue };

    // Update local state
    setMyMap(prev => ({
      ...prev,
      [fix.courseId]: { ...prev[fix.courseId], [fix.field]: newValue } as RowData,
    }));

    // Persist to Supabase
    await supabase.from("mapa_declarations").update(update)
      .eq("session_id", sessionId)
      .eq("course_id", fix.courseId);

    // Mark as fixed
    setFixApplied(prev => ({ ...prev, [scenarioId]: true }));
  };

  const handleAnswer = (approved: boolean) => {
    if (isRevealed) return;
    setAnswers(prev => ({ ...prev, [scenario.id]: approved }));
  };

  const handleReveal = async () => {
    setRevealed(prev => ({ ...prev, [scenario.id]: true }));

    await supabase.from("mapa_valida").upsert({
      session_id: sessionId,
      scenario_id: scenario.id,
      approved: myAnswer,
      implied_level: scenario.impliedLevel,
      tag: scenario.tag,
    }, { onConflict: "session_id,scenario_id" }).then(() => {});
  };

  const handleNext = () => {
    if (currentIdx < SCENARIOS.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setCompleted(true);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) setCurrentIdx(currentIdx - 1);
  };

  // ─── Inconsistencies Analysis ──────────────────────────────────

  const inconsistencies = useMemo(() => {
    if (!completed) return [];
    return SCENARIOS.map(s => {
      const ans = answers[s.id];
      if (ans === null || ans === undefined) return null;
      const check = checkConsistency(s, ans);
      if (check && !check.consistent) return { scenario: s, answer: ans, reason: check.reason };
      return null;
    }).filter(Boolean) as { scenario: ValidationScenario; answer: boolean; reason: string }[];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completed, answers, myMap]);

  const outsourcingApproved = useMemo(() => {
    if (!completed) return [];
    return SCENARIOS.filter(s => s.tag === "outsourcing" && answers[s.id] === true);
  }, [completed, answers]);

  // ─── Completed View ────────────────────────────────────────────

  if (completed) {
    const hasMap = Object.keys(myMap).length > 0;

    return (
      <main className="min-h-screen bg-[var(--jesuites-cream)] pb-32 font-sans select-none overflow-x-hidden">
        <div className="max-w-xl mx-auto px-4">
          <header className="py-10 text-center">
            <div className="w-14 h-14 bg-[var(--jesuites-blue)] rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
              <Sparkles size={28} />
            </div>
            <h1 className="text-2xl font-bold text-[var(--jesuites-blue)] uppercase tracking-tighter">Validació Completada</h1>
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1">Fase 3 de 3</p>
          </header>

          {/* Inconsistencies */}
          {hasMap && inconsistencies.length > 0 && (
            <div className="bg-amber-50 rounded-3xl p-6 border border-amber-200 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle size={20} className="text-amber-600" />
                <h3 className="text-sm font-bold text-amber-700">
                  {inconsistencies.length} {inconsistencies.length === 1 ? "incoherència detectada" : "incoherències detectades"}
                </h3>
              </div>
              <p className="text-xs text-amber-600 mb-4">
                Les teves respostes als escenaris no coincideixen amb les declaracions del mapa. Això és normal — serveix per refinar el teu mapa.
              </p>
              <div className="space-y-3">
                {inconsistencies.map((inc, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 border border-amber-100">
                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">{inc.scenario.context}</p>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">{inc.scenario.text}</p>
                    <p className="text-[11px] text-amber-700 font-medium">{inc.reason}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => window.location.href = "/mapa"}
                className="w-full mt-4 py-3 rounded-2xl bg-amber-500 text-white text-[11px] font-bold uppercase tracking-widest shadow-lg hover:shadow-xl transition-all"
              >
                Revisar el meu mapa →
              </button>
            </div>
          )}

          {hasMap && inconsistencies.length === 0 && (
            <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-200 mb-6 text-center">
              <Check size={32} className="text-emerald-500 mx-auto mb-3" />
              <p className="text-sm font-bold text-emerald-700 mb-1">Mapa coherent!</p>
              <p className="text-xs text-emerald-600">Les teves respostes als escenaris coincideixen amb les declaracions del mapa.</p>
            </div>
          )}

          {!hasMap && (
            <div className="bg-blue-50 rounded-3xl p-6 border border-blue-200 mb-6 text-center">
              <p className="text-sm font-bold text-blue-700 mb-2">No tens un mapa declarat</p>
              <p className="text-xs text-blue-600 mb-4">Completa la Fase 2 per poder comparar les teves respostes amb el mapa i detectar incoherències.</p>
              <button
                onClick={() => window.location.href = "/mapa"}
                className="px-6 py-3 rounded-2xl bg-[var(--jesuites-blue)] text-white text-[11px] font-bold uppercase tracking-widest"
              >
                Anar al Mapa →
              </button>
            </div>
          )}

          {/* Outsourcing Warning */}
          {outsourcingApproved.length > 0 && (
            <div className="bg-rose-50 rounded-3xl p-6 border border-rose-200 mb-6">
              <h3 className="text-sm font-bold text-rose-700 mb-3">Alerta d&apos;outsourcing cognitiu</h3>
              <p className="text-xs text-rose-600 mb-4">
                Has aprovat {outsourcingApproved.length} {outsourcingApproved.length === 1 ? "escenari" : "escenaris"} etiquetats com a outsourcing. No vol dir que estigui malament, però convé reflexionar sobre la dificultat desitjable.
              </p>
              <div className="space-y-2">
                {outsourcingApproved.map(s => (
                  <div key={s.id} className="bg-white rounded-xl px-3 py-2 border border-rose-100">
                    <p className="text-[10px] font-bold text-rose-500">{s.context}</p>
                    <p className="text-xs text-gray-600 line-clamp-1">{s.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scenario Summary */}
          <div className="space-y-3 mb-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Resum de respostes</h3>
            {SCENARIOS.map((s, i) => {
              const ans = answers[s.id];
              return (
                <div key={s.id} className={`bg-white rounded-2xl p-4 border ${ans ? "border-emerald-200" : "border-rose-200"}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${ans ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}>
                      {ans ? <ThumbsUp size={14} /> : <ThumbsDown size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Escenari {i + 1} · {s.context}</p>
                      <p className="text-xs text-gray-600 line-clamp-2 mb-2">{s.text}</p>
                      <div className="flex gap-2 flex-wrap">
                        {s.impliedLevel >= 0 && (
                          <span className="text-[9px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-lg">
                            {DELEG_LABELS[s.impliedLevel].label} · {DELEG_LABELS[s.impliedLevel].name}
                          </span>
                        )}
                        {s.impliedLevel === -1 && (
                          <span className="text-[9px] font-bold bg-blue-100 text-blue-600 px-2 py-1 rounded-lg">Ús docent</span>
                        )}
                        <span className={`text-[9px] font-bold px-2 py-1 rounded-lg ${s.tag === "outsourcing" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}>
                          {s.tag === "outsourcing" ? "Outsourcing" : "Offloading"}
                        </span>
                        <span className={`text-[9px] font-bold px-2 py-1 rounded-lg ${
                          s.friction === "alta" ? "bg-emerald-100 text-emerald-600" :
                          s.friction === "baixa" ? "bg-amber-100 text-amber-600" :
                          "bg-red-100 text-red-600"
                        }`}>
                          Fricció {s.friction}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={() => { setAnswers({}); setRevealed({}); setCurrentIdx(0); setCompleted(false); }}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-black/5 text-gray-500 text-[11px] font-bold uppercase tracking-widest hover:bg-black/10 transition-all"
            >
              <RotateCcw size={14} /> Repetir
            </button>
            <button
              onClick={() => window.location.href = "/mapa"}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-[var(--jesuites-blue)] text-white text-[11px] font-bold uppercase tracking-widest shadow-lg hover:shadow-xl transition-all"
            >
              Revisar mapa <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <BottomNav current="valida" />
      </main>
    );
  }

  // ─── Quiz View ─────────────────────────────────────────────────

  const consistency = myAnswer !== null ? checkConsistency(scenario, myAnswer) : null;

  return (
    <main className="min-h-screen bg-[var(--jesuites-cream)] pb-32 font-sans select-none overflow-x-hidden">
      <div className="max-w-xl mx-auto px-4">

        {/* Header */}
        <header className="py-10 text-center sticky top-0 bg-[var(--jesuites-cream)]/90 backdrop-blur-md z-30 border-b border-black/5">
          <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
            <Sparkles size={28} />
          </div>
          <h1 className="text-2xl font-bold text-[var(--jesuites-blue)] uppercase tracking-tighter">Valida</h1>
          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1">Fase 3 · Stress test del teu mapa</p>

          {/* Progress */}
          <div className="flex justify-center gap-1.5 mt-5">
            {SCENARIOS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentIdx ? "w-6 bg-amber-500" :
                  revealed[SCENARIOS[i].id] ? "w-3 bg-emerald-400" : "w-3 bg-black/10"
                }`}
              />
            ))}
          </div>
        </header>

        <div className="mt-8 space-y-6">

          {/* Scenario Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/[0.04]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.25em]">
                Escenari {currentIdx + 1} de {SCENARIOS.length}
              </span>
              <span className="text-[10px] font-bold text-violet-500 bg-violet-50 px-3 py-1 rounded-full">
                {scenario.context}
              </span>
            </div>

            <p className="text-sm text-gray-700 leading-relaxed font-medium mb-6">
              {scenario.text}
            </p>

            <p className="text-[11px] text-[var(--jesuites-blue)] font-bold mb-3 uppercase tracking-widest">
              Aprovar aquest ús?
            </p>

            {/* Yes / No Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleAnswer(true)}
                disabled={isRevealed}
                className={`py-4 rounded-2xl text-center transition-all flex flex-col items-center gap-2 ${
                  myAnswer === true
                    ? "bg-emerald-500 text-white shadow-lg scale-105"
                    : "bg-black/[0.04] text-gray-500 hover:bg-emerald-50"
                } ${isRevealed ? "cursor-default" : ""}`}
              >
                <ThumbsUp size={22} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Sí, ho aprovo</span>
              </button>
              <button
                onClick={() => handleAnswer(false)}
                disabled={isRevealed}
                className={`py-4 rounded-2xl text-center transition-all flex flex-col items-center gap-2 ${
                  myAnswer === false
                    ? "bg-rose-400 text-white shadow-lg scale-105"
                    : "bg-black/[0.04] text-gray-500 hover:bg-rose-50"
                } ${isRevealed ? "cursor-default" : ""}`}
              >
                <ThumbsDown size={22} />
                <span className="text-[10px] font-bold uppercase tracking-widest">No, ho rebutjo</span>
              </button>
            </div>
          </div>

          {/* Reveal Button */}
          {myAnswer !== null && !isRevealed && (
            <button
              onClick={handleReveal}
              className="w-full py-4 rounded-2xl bg-[var(--jesuites-blue)] text-white text-[11px] font-bold uppercase tracking-widest shadow-lg hover:shadow-xl transition-all"
            >
              Veure anàlisi
            </button>
          )}

          {/* Analysis Card */}
          {isRevealed && (
            <div className="space-y-4">
              {/* Consistency Check */}
              {consistency && (
                <div className={`rounded-3xl p-5 border ${
                  fixApplied[scenario.id] ? "bg-emerald-50 border-emerald-200" :
                  consistency.consistent ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"
                }`}>
                  {fixApplied[scenario.id] ? (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <Check size={16} className="text-emerald-600" />
                        <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700">
                          Mapa actualitzat!
                        </p>
                      </div>
                      <p className="text-xs leading-relaxed text-emerald-600">
                        S&apos;ha corregit la teva declaració. Ara el mapa és coherent amb la teva resposta.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        {consistency.consistent ? (
                          <Check size={16} className="text-emerald-600" />
                        ) : (
                          <AlertTriangle size={16} className="text-amber-600" />
                        )}
                        <p className={`text-[11px] font-bold uppercase tracking-widest ${consistency.consistent ? "text-emerald-700" : "text-amber-700"}`}>
                          {consistency.consistent ? "Coherent amb el teu mapa" : "Incoherència detectada"}
                        </p>
                      </div>
                      <p className={`text-xs leading-relaxed ${consistency.consistent ? "text-emerald-600" : "text-amber-700"}`}>
                        {consistency.reason}
                      </p>
                      {!consistency.consistent && consistency.fix && (
                        <button
                          onClick={() => applyFix(scenario.id, consistency.fix!)}
                          className="mt-3 w-full py-3 rounded-2xl bg-amber-500 text-white text-[11px] font-bold uppercase tracking-widest shadow-md hover:shadow-lg hover:bg-amber-600 transition-all flex items-center justify-center gap-2"
                        >
                          <RotateCcw size={14} />
                          {consistency.fix.label}
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Level + Tags */}
              <div className="bg-white rounded-3xl p-5 border border-black/[0.04]">
                <div className="flex gap-2 flex-wrap mb-3">
                  {scenario.impliedLevel >= 0 && (
                    <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1.5 rounded-lg">
                      {DELEG_LABELS[scenario.impliedLevel].label} · {DELEG_LABELS[scenario.impliedLevel].name}
                    </span>
                  )}
                  {scenario.impliedLevel === -1 && (
                    <span className="text-[9px] font-bold bg-blue-100 text-blue-600 px-2.5 py-1.5 rounded-lg">Ús docent (no nivell alumnat)</span>
                  )}
                  <span className={`text-[9px] font-bold px-2.5 py-1.5 rounded-lg ${scenario.tag === "outsourcing" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}>
                    {scenario.tag === "outsourcing" ? "⚠ Outsourcing" : "✓ Offloading legítim"}
                  </span>
                  <span className={`text-[9px] font-bold px-2.5 py-1.5 rounded-lg ${
                    scenario.friction === "alta" ? "bg-emerald-100 text-emerald-600" :
                    scenario.friction === "baixa" ? "bg-amber-100 text-amber-600" :
                    "bg-red-100 text-red-600"
                  }`}>
                    Fricció cognitiva: {scenario.friction}
                  </span>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed mb-3">{scenario.discussion}</p>

                {/* Friction explanation */}
                <div className="bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Fricció cognitiva</p>
                  <p className="text-[11px] text-slate-600 leading-snug">{scenario.frictionNote}</p>
                </div>
              </div>

              {/* Next */}
              {facilitatorSync ? (
                <div className="w-full py-4 rounded-2xl bg-black/5 text-gray-400 text-[11px] font-bold uppercase tracking-widest text-center">
                  Esperant el facilitador...
                </div>
              ) : (
                <button
                  onClick={handleNext}
                  className="w-full py-4 rounded-2xl bg-[var(--jesuites-blue)] text-white text-[11px] font-bold uppercase tracking-widest shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  {currentIdx < SCENARIOS.length - 1 ? (
                    <>Següent escenari <ChevronRight size={14} /></>
                  ) : (
                    <>Veure resultats <ChevronRight size={14} /></>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Navigation */}
          {!facilitatorSync && (
            <div className="flex justify-between items-center pt-4">
              <button
                onClick={handlePrev}
                disabled={currentIdx === 0}
                className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest disabled:opacity-20 hover:text-[var(--jesuites-blue)] transition-all"
              >
                <ChevronLeft size={12} /> Anterior
              </button>
              <span className="text-[10px] font-bold text-gray-300">{totalAnswered}/{SCENARIOS.length}</span>
              <button
                onClick={handleNext}
                disabled={currentIdx === SCENARIOS.length - 1 || !isRevealed}
                className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest disabled:opacity-20 hover:text-[var(--jesuites-blue)] transition-all"
              >
                Següent <ChevronRight size={12} />
              </button>
            </div>
          )}
          {facilitatorSync && (
            <p className="text-center text-[10px] text-[var(--jesuites-blue)] font-bold uppercase tracking-widest pt-4 animate-pulse">
              Sessió guiada activa
            </p>
          )}
        </div>
      </div>

      <BottomNav current="valida" />
    </main>
  );
}

// ─── Bottom Nav ──────────────────────────────────────────────────

function BottomNav({ current }: { current: string }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-black/5 flex justify-center gap-6 z-[90]">
      <button
        onClick={() => window.location.href = "/mapa/calibra"}
        className={`text-[10px] font-bold uppercase tracking-[0.3em] transition-all ${current === "calibra" ? "text-[var(--jesuites-blue)] underline underline-offset-4" : "text-gray-400 hover:text-[var(--jesuites-blue)]"}`}
      >
        1. Calibra
      </button>
      <button
        onClick={() => window.location.href = "/mapa"}
        className={`text-[10px] font-bold uppercase tracking-[0.3em] transition-all ${current === "mapa" ? "text-[var(--jesuites-blue)] underline underline-offset-4" : "text-gray-400 hover:text-[var(--jesuites-blue)]"}`}
      >
        2. Mapa
      </button>
      <button
        onClick={() => window.location.href = "/mapa/valida"}
        className={`text-[10px] font-bold uppercase tracking-[0.3em] transition-all ${current === "valida" ? "text-amber-600 underline underline-offset-4" : "text-gray-400 hover:text-amber-600"}`}
      >
        3. Valida
      </button>
    </div>
  );
}
