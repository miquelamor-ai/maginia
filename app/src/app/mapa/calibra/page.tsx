"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Sparkles, ChevronRight, ChevronLeft, Check, X, RotateCcw } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────

interface Scenario {
  id: string;
  text: string;
  context: string;
  correctLevel: number;
  tag: "offloading" | "outsourcing";
  tagExplain: string;
  explanation: string;
}

const DELEG_LABELS = [
  { n: 0, label: "N0", name: "Preservació", color: "bg-gray-400", desc: "No delegació. 100% humà." },
  { n: 1, label: "N1", name: "Exploració", color: "bg-emerald-500", desc: "La IA inspira. El producte és humà." },
  { n: 2, label: "N2", name: "Suport", color: "bg-blue-500", desc: "L'alumne crea, la IA millora." },
  { n: 3, label: "N3", name: "Cocreació", color: "bg-violet-500", desc: "Alternança de lideratge." },
  { n: 4, label: "N4", name: "Delegació", color: "bg-amber-500", desc: "La IA genera, l'humà supervisa." },
  { n: 5, label: "N5", name: "Agència", color: "bg-rose-500", desc: "La IA opera autònomament." },
];

const SCENARIOS: Scenario[] = [
  {
    id: "cal-1",
    text: "El docent de 2n ESO projecta Gemini a la pissarra i pregunta: «Quins són els principals biomes del planeta?» La classe debat si la resposta és completa i afegeix matisos.",
    context: "2n ESO · Ciències Naturals",
    correctLevel: 1,
    tag: "offloading",
    tagExplain: "La IA aporta informació inicial; l'aprenentatge ve del debat crític posterior. L'alumne no delega la seva tasca cognitiva.",
    explanation: "N1 — Exploració: La IA inspira o informa, però el producte intel·lectual (l'anàlisi crítica, el debat) és 100% de l'alumnat.",
  },
  {
    id: "cal-2",
    text: "Una alumna de 4t ESO ha escrit un assaig sobre el canvi climàtic i demana a Copilot: «Revisa l'ortografia i la coherència argumentativa del meu text.»",
    context: "4t ESO · Llengua",
    correctLevel: 2,
    tag: "offloading",
    tagExplain: "L'alumna ha fet el treball creatiu primer. La IA actua com a eina de revisió, similar a un corrector. La fricció cognitiva ja s'ha produït.",
    explanation: "N2 — Suport: L'alumna crea, la IA millora o corregeix. El producte original és de l'alumna.",
  },
  {
    id: "cal-3",
    text: "Un alumne de Batxillerat i la IA col·laboren per crear una infografia: l'alumne decideix el tema, l'estructura i el contingut clau; la IA genera els gràfics estadístics; l'alumne els interpreta, selecciona i modifica.",
    context: "Batxillerat · Projecte de Recerca",
    correctLevel: 3,
    tag: "offloading",
    tagExplain: "Hi ha una alternança genuïna: l'alumne lidera el contingut i pren decisions crítiques sobre què conservar i modificar.",
    explanation: "N3 — Cocreació: Persona i IA alternen el lideratge. Cadascú aporta el que fa millor.",
  },
  {
    id: "cal-4",
    text: "Un alumne de 3r ESO demana a Gemini: «Fes-me un resum de 300 paraules del tema 5 de ciències socials.» Copia la resposta directament al treball sense modificar-la.",
    context: "3r ESO · Ciències Socials",
    correctLevel: 4,
    tag: "outsourcing",
    tagExplain: "L'alumne externalitza completament la tasca cognitiva. No hi ha fricció cognitiva: no llegeix, no sintetitza, no aprèn. Això és outsourcing pur.",
    explanation: "N4 — Delegació: La IA genera el gruix del producte. En aquest cas, sense supervisió real, es converteix en outsourcing.",
  },
  {
    id: "cal-5",
    text: "Una plataforma adaptativa ajusta automàticament la dificultat dels exercicis de matemàtiques de 1r ESO basant-se en les respostes de cada alumne, sense intervenció del docent en cada ajust.",
    context: "1r ESO · Matemàtiques",
    correctLevel: 5,
    tag: "offloading",
    tagExplain: "La IA opera dins un marc pedagògic dissenyat i supervisat. L'alumne continua fent l'esforç cognitiu (resoldre exercicis); la IA només ajusta el nivell.",
    explanation: "N5 — Agència: La IA opera autònomament dins un marc supervisat. L'alumne encara treballa; la IA gestiona la personalització.",
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

export default function CalibraPage() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [completed, setCompleted] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [facilitatorSync, setFacilitatorSync] = useState(false);

  useEffect(() => {
    setSessionId(getSessionId());
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
        if (data.phase === "calibra") {
          setFacilitatorSync(true);
          setCurrentIdx(data.current_idx);
        } else if (data.phase === "mapa") {
          window.location.href = "/mapa";
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
  }, []);

  const scenario = SCENARIOS[currentIdx];
  const myAnswer = answers[scenario.id] ?? null;
  const isRevealed = revealed[scenario.id] ?? false;
  const isCorrect = myAnswer === scenario.correctLevel;

  const totalAnswered = Object.keys(revealed).length;
  const totalCorrect = SCENARIOS.filter(s => answers[s.id] === s.correctLevel).length;

  const handleSelect = (level: number) => {
    if (isRevealed) return;
    setAnswers(prev => ({ ...prev, [scenario.id]: level }));
  };

  const handleReveal = async () => {
    setRevealed(prev => ({ ...prev, [scenario.id]: true }));

    // Save to Supabase
    await supabase.from("mapa_calibra").upsert({
      session_id: sessionId,
      scenario_id: scenario.id,
      selected_level: myAnswer,
      correct_level: scenario.correctLevel,
      is_correct: myAnswer === scenario.correctLevel,
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

  const handleReset = () => {
    setAnswers({});
    setRevealed({});
    setCurrentIdx(0);
    setCompleted(false);
  };

  // ─── Completed View ────────────────────────────────────────────

  if (completed) {
    return (
      <main className="min-h-screen bg-[var(--jesuites-cream)] pb-32 font-sans select-none overflow-x-hidden">
        <div className="max-w-xl mx-auto px-4">
          <header className="py-10 text-center">
            <div className="w-14 h-14 bg-[var(--jesuites-blue)] rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
              <Sparkles size={28} />
            </div>
            <h1 className="text-2xl font-bold text-[var(--jesuites-blue)] uppercase tracking-tighter">Calibratge Completat</h1>
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1">Fase 1 de 3</p>
          </header>

          {/* Score */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-black/[0.04] text-center mb-8">
            <div className="text-6xl font-bold text-[var(--jesuites-blue)] mb-2">{totalCorrect}/{SCENARIOS.length}</div>
            <p className="text-sm text-gray-500 mb-6">escenaris classificats correctament</p>

            {totalCorrect >= 4 ? (
              <p className="text-sm text-emerald-600 font-bold bg-emerald-50 rounded-2xl px-4 py-3">
                Excel·lent calibratge. Tens una comprensió sòlida dels nivells de delegació.
              </p>
            ) : totalCorrect >= 3 ? (
              <p className="text-sm text-amber-600 font-bold bg-amber-50 rounded-2xl px-4 py-3">
                Bon calibratge. Revisa els casos on has tingut dubtes abans de mapejar.
              </p>
            ) : (
              <p className="text-sm text-rose-600 font-bold bg-rose-50 rounded-2xl px-4 py-3">
                Recomanem revisar les definicions dels nivells. Pots repetir el calibratge o consultar l&apos;ajuda al mapa.
              </p>
            )}
          </div>

          {/* Summary */}
          <div className="space-y-3 mb-8">
            {SCENARIOS.map((s, i) => {
              const ans = answers[s.id];
              const ok = ans === s.correctLevel;
              return (
                <div key={s.id} className={`bg-white rounded-2xl p-4 border ${ok ? "border-emerald-200" : "border-rose-200"}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${ok ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}>
                      {ok ? <Check size={16} /> : <X size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Escenari {i + 1}</p>
                      <p className="text-xs text-gray-600 line-clamp-2 mb-2">{s.text}</p>
                      <div className="flex gap-2 items-center flex-wrap">
                        {ans !== s.correctLevel && (
                          <span className="text-[9px] font-bold bg-rose-100 text-rose-600 px-2 py-1 rounded-lg">
                            Tu: {DELEG_LABELS[ans!].label}
                          </span>
                        )}
                        <span className="text-[9px] font-bold bg-emerald-100 text-emerald-600 px-2 py-1 rounded-lg">
                          Correcte: {DELEG_LABELS[s.correctLevel].label} — {DELEG_LABELS[s.correctLevel].name}
                        </span>
                        <span className={`text-[9px] font-bold px-2 py-1 rounded-lg ${s.tag === "outsourcing" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}>
                          {s.tag === "outsourcing" ? "⚠ Outsourcing" : "✓ Offloading legítim"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-black/5 text-gray-500 text-[11px] font-bold uppercase tracking-widest hover:bg-black/10 transition-all"
            >
              <RotateCcw size={14} /> Repetir
            </button>
            <button
              onClick={() => window.location.href = "/mapa"}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-[var(--jesuites-blue)] text-white text-[11px] font-bold uppercase tracking-widest shadow-lg hover:shadow-xl transition-all"
            >
              Fase 2: Mapa <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {facilitatorSync ? (
        <div className="fixed bottom-0 left-0 right-0 p-3 bg-[var(--jesuites-blue)] text-center z-[90]">
          <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest animate-pulse">Sessió guiada pel facilitador</p>
        </div>
      ) : (
        <BottomNav current="calibra" />
      )}
      </main>
    );
  }

  // ─── Quiz View ─────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-[var(--jesuites-cream)] pb-32 font-sans select-none overflow-x-hidden">
      <div className="max-w-xl mx-auto px-4">

        {/* Header */}
        <header className="py-10 text-center sticky top-0 bg-[var(--jesuites-cream)]/90 backdrop-blur-md z-30 border-b border-black/5">
          <div className="w-14 h-14 bg-[var(--jesuites-blue)] rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
            <Sparkles size={28} />
          </div>
          <h1 className="text-2xl font-bold text-[var(--jesuites-blue)] uppercase tracking-tighter">Calibra</h1>
          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1">Fase 1 · Alinea criteris abans de mapejar</p>

          {/* Progress */}
          <div className="flex justify-center gap-2 mt-5">
            {SCENARIOS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentIdx ? "w-8 bg-[var(--jesuites-blue)]" :
                  revealed[SCENARIOS[i].id] ? "w-4 bg-emerald-400" : "w-4 bg-black/10"
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

            <p className="text-sm text-gray-700 leading-relaxed font-medium">
              {scenario.text}
            </p>

            <p className="text-[11px] text-[var(--jesuites-blue)] font-bold mt-5 mb-3 uppercase tracking-widest">
              Quin nivell de delegació descriu?
            </p>

            {/* Level Buttons */}
            <div className="grid grid-cols-3 gap-2">
              {DELEG_LABELS.map(dl => {
                const isSelected = myAnswer === dl.n;
                const isCorrectAnswer = isRevealed && dl.n === scenario.correctLevel;
                const isWrong = isRevealed && isSelected && !isCorrect && dl.n !== scenario.correctLevel;

                let btnClass = "bg-black/[0.04] text-gray-500 hover:bg-black/[0.08]";
                if (isCorrectAnswer) btnClass = "bg-emerald-500 text-white shadow-lg ring-2 ring-emerald-300";
                else if (isWrong) btnClass = "bg-rose-400 text-white shadow-lg";
                else if (isSelected && !isRevealed) btnClass = `${dl.color} text-white shadow-lg`;

                return (
                  <button
                    key={dl.n}
                    onClick={() => handleSelect(dl.n)}
                    disabled={isRevealed}
                    className={`py-3 rounded-2xl text-center transition-all ${btnClass} ${isRevealed ? "cursor-default" : ""}`}
                  >
                    <span className="text-sm font-bold block leading-none">{dl.label}</span>
                    <span className="text-[8px] font-medium block mt-1 leading-none opacity-80">{dl.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reveal Button */}
          {myAnswer !== null && !isRevealed && (
            <button
              onClick={handleReveal}
              className="w-full py-4 rounded-2xl bg-[var(--jesuites-blue)] text-white text-[11px] font-bold uppercase tracking-widest shadow-lg hover:shadow-xl transition-all"
            >
              Comprovar
            </button>
          )}

          {/* Feedback Card */}
          {isRevealed && (
            <div className={`rounded-3xl p-6 border ${isCorrect ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCorrect ? "bg-emerald-500 text-white" : "bg-rose-400 text-white"}`}>
                  {isCorrect ? <Check size={20} /> : <X size={20} />}
                </div>
                <div>
                  <p className={`text-sm font-bold ${isCorrect ? "text-emerald-700" : "text-rose-700"}`}>
                    {isCorrect ? "Correcte!" : `La resposta és ${DELEG_LABELS[scenario.correctLevel].label} — ${DELEG_LABELS[scenario.correctLevel].name}`}
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                {scenario.explanation}
              </p>

              {/* Offloading vs Outsourcing */}
              <div className={`rounded-2xl px-4 py-3 ${scenario.tag === "outsourcing" ? "bg-red-100/60 border border-red-200" : "bg-blue-100/60 border border-blue-200"}`}>
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${scenario.tag === "outsourcing" ? "text-red-600" : "text-blue-600"}`}>
                  {scenario.tag === "outsourcing" ? "⚠ Outsourcing cognitiu" : "✓ Offloading legítim"}
                </p>
                <p className={`text-[11px] leading-snug ${scenario.tag === "outsourcing" ? "text-red-700" : "text-blue-700"}`}>
                  {scenario.tagExplain}
                </p>
              </div>

              {/* Next Button */}
              {facilitatorSync ? (
                <div className="w-full mt-5 py-4 rounded-2xl bg-black/5 text-gray-400 text-[11px] font-bold uppercase tracking-widest text-center">
                  Esperant el facilitador...
                </div>
              ) : (
                <button
                  onClick={handleNext}
                  className="w-full mt-5 py-4 rounded-2xl bg-[var(--jesuites-blue)] text-white text-[11px] font-bold uppercase tracking-widest shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
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

          {/* Navigation dots */}
          {!facilitatorSync && (
            <div className="flex justify-between items-center pt-4">
              <button
                onClick={handlePrev}
                disabled={currentIdx === 0}
                className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest disabled:opacity-20 hover:text-[var(--jesuites-blue)] transition-all"
              >
                <ChevronLeft size={12} /> Anterior
              </button>
              <span className="text-[10px] font-bold text-gray-300">{totalAnswered}/{SCENARIOS.length} respostos</span>
              <button
                onClick={handleNext}
                disabled={currentIdx === SCENARIOS.length - 1 || !isRevealed}
                className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest disabled:opacity-20 hover:text-[var(--jesuites-blue)] transition-all"
              >
                Següent <ChevronRight size={12} />
              </button>
            </div>
          )}
        </div>
      </div>

      {facilitatorSync ? (
        <div className="fixed bottom-0 left-0 right-0 p-3 bg-[var(--jesuites-blue)] text-center z-[90]">
          <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest animate-pulse">Sessió guiada pel facilitador</p>
        </div>
      ) : (
        <BottomNav current="calibra" />
      )}
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
