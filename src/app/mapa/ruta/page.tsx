"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { DELEGATION_LEVELS } from "@/lib/data";
import { Sparkles, Target, GraduationCap, ScrollText, Users, Scale, Map, ArrowDown } from "lucide-react";

function getGuidedSessionId(): string {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams(window.location.search);
  const gParam = params.get("g");
  if (gParam) {
    localStorage.setItem("maginia_guided_session_id", gParam);
    return gParam;
  }
  return localStorage.getItem("maginia_guided_session_id") || "";
}

const LAYERS = [
  {
    id: "visio",
    icon: <Target size={22} className="text-[var(--jesuites-blue)]" />,
    tag: "HORITZÓ",
    title: "La IA augmenta l'aprenentatge",
    subtitle: "Integrada a la gestió, la docència i l'aprenentatge — de manera ètica, segura i humanista",
    accent: "bg-emerald-50 border-emerald-200",
    tagColor: "text-emerald-700 bg-emerald-100",
    isAvui: false,
    special: false,
  },
  {
    id: "alumnat",
    icon: <GraduationCap size={22} className="text-[var(--jesuites-blue)]" />,
    tag: "ALUMNAT",
    title: "Fluïdeses en IA — les 4D",
    subtitle: "Delegació · Descripció · Discerniment · Diligència",
    accent: "bg-violet-50 border-violet-200",
    tagColor: "text-violet-700 bg-violet-100",
    isAvui: false,
    special: false,
  },
  {
    id: "activitats",
    icon: <ScrollText size={22} className="text-[var(--jesuites-blue)]" />,
    tag: "A L'AULA",
    title: "Activitats on la IA té un rol",
    subtitle: "Tasques dissenyades perquè l'alumne pensi, creï i discerneixi amb la IA com a eina",
    accent: "bg-blue-50 border-blue-200",
    tagColor: "text-blue-700 bg-blue-100",
    isAvui: false,
    special: false,
  },
  {
    id: "docents",
    icon: <Users size={22} className="text-[var(--jesuites-blue)]" />,
    tag: "DOCENTS",
    title: "Disseny · Materials · Formació",
    subtitle: "Per dissenyar bé cal temps, criteris clars i acompanyament",
    accent: "bg-amber-50 border-amber-200",
    tagColor: "text-amber-700 bg-amber-100",
    isAvui: false,
    special: false,
  },
  {
    id: "criteris",
    icon: <Scale size={22} className="text-[var(--jesuites-blue)]" />,
    tag: "PONT",
    title: "Criteris i orientacions",
    subtitle: null,
    accent: "bg-rose-50 border-rose-200",
    tagColor: "text-rose-700 bg-rose-100",
    isAvui: false,
    special: true,
  },
  {
    id: "avui",
    icon: <Map size={22} className="text-white" />,
    tag: "AVUI",
    title: "Criteris pedagògics · Delegació",
    subtitle: "Com decidim fins on deleguem a la IA? Quins nivells d'autonomia per cada etapa?",
    accent: "bg-[var(--jesuites-blue)] border-[var(--jesuites-blue)]",
    tagColor: "text-white/80 bg-white/20",
    isAvui: true,
    special: false,
  },
];

const LEVEL_COLORS = [
  { dot: "bg-gray-400", text: "text-gray-700", border: "border-gray-200", bg: "bg-gray-50" },
  { dot: "bg-emerald-500", text: "text-emerald-700", border: "border-emerald-200", bg: "bg-emerald-50" },
  { dot: "bg-blue-500", text: "text-blue-700", border: "border-blue-200", bg: "bg-blue-50" },
  { dot: "bg-violet-500", text: "text-violet-700", border: "border-violet-200", bg: "bg-violet-50" },
  { dot: "bg-amber-500", text: "text-amber-700", border: "border-amber-200", bg: "bg-amber-50" },
  { dot: "bg-rose-500", text: "text-rose-700", border: "border-rose-200", bg: "bg-rose-50" },
];

export default function RutaPage() {
  const [guidedSessionId] = useState(getGuidedSessionId);
  const [visibleCount, setVisibleCount] = useState(1);
  const [phase, setPhase] = useState<string>("intro");

  useEffect(() => {
    if (!guidedSessionId) return;
    const poll = async () => {
      const { data } = await supabase
        .from("mapa_facilitador_state")
        .select("phase, current_idx, is_active, guided_session_id")
        .eq("id", 1)
        .single();
      if (!data || !data.is_active) return;

      if (data.guided_session_id && data.guided_session_id !== guidedSessionId) {
        localStorage.setItem("maginia_guided_session_id", data.guided_session_id);
      }

      const p = data.phase;
      setPhase(p);
      if (p === "intro") {
        setVisibleCount(Math.min((data.current_idx ?? 0) + 1, LAYERS.length));
      } else if (p === "decaleg") {
        window.location.href = "/mapa/decaleg";
      } else if (p !== "repas") {
        window.location.href = "/mapa/sessio?g=" + guidedSessionId;
      }
    };
    poll();
    const interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, [guidedSessionId]);

  return (
    <main className="min-h-screen bg-[var(--jesuites-cream)] font-sans">
      <div className="max-w-lg mx-auto px-4 py-8">

        <div className="text-center mb-6">
          <div className="w-10 h-10 bg-[var(--jesuites-blue)] rounded-xl flex items-center justify-center mx-auto mb-3 shadow">
            <Sparkles size={18} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-[var(--jesuites-blue)] uppercase tracking-tight">MAGINIA</h1>
          <p className="text-xs text-gray-400 font-bold mt-0.5 uppercase tracking-widest">
            {phase === "repas" ? "Nivells de delegació" : "Full de ruta"}
          </p>
        </div>

        {/* ── INTRO: ruta layers ── */}
        {phase === "intro" && (
          <>
            <div className="flex flex-col gap-2">
              {LAYERS.slice(0, visibleCount).map((layer, i) => {
                const isLast = i === visibleCount - 1;
                return (
                  <div key={layer.id}>
                    <div className={`rounded-2xl border-2 px-4 py-3 flex items-center gap-3 transition-all duration-500 ${layer.accent} ${isLast ? "opacity-100 shadow-sm" : "opacity-60"}`}>
                      <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${layer.isAvui ? "bg-white/20" : "bg-white"} shadow-sm`}>
                        {layer.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full ${layer.tagColor}`}>{layer.tag}</span>
                        </div>
                        <p className={`text-base font-black leading-tight ${layer.isAvui ? "text-white" : "text-[var(--jesuites-blue)]"}`}>{layer.title}</p>
                        {layer.special ? (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {["★ Pedagògics", "Tecnològics", "Legals / Ètics"].map((c, ci) => (
                              <span key={c} className={`text-[9px] font-bold px-2 py-0.5 rounded-lg border ${ci === 0 ? "bg-rose-100 border-rose-300 text-rose-700" : "bg-white/60 border-rose-200 text-rose-400"}`}>{c}</span>
                            ))}
                          </div>
                        ) : layer.subtitle && (
                          <p className={`text-xs mt-0.5 ${layer.isAvui ? "text-white/70" : "text-[var(--jesuites-text)]/50"}`}>{layer.subtitle}</p>
                        )}
                      </div>
                    </div>
                    {i < visibleCount - 1 && (
                      <div className="flex justify-center py-1">
                        <ArrowDown size={10} className="text-[var(--jesuites-blue)]/20" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {visibleCount < LAYERS.length && (
              <div className="mt-6 flex justify-center">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <div className="w-3 h-3 rounded-full border-2 border-[var(--jesuites-blue)]/20 border-t-[var(--jesuites-blue)]/60 animate-spin" />
                  Seguint la presentació del facilitador…
                </div>
              </div>
            )}
          </>
        )}

        {/* ── REPAS: delegation levels ── */}
        {phase === "repas" && (
          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-bold text-[var(--jesuites-blue)]/40 uppercase tracking-[0.25em] text-center mb-1">6 Graus de col·laboració Persona–IA</p>
            {DELEGATION_LEVELS.map(level => {
              const c = LEVEL_COLORS[level.lv];
              return (
                <div key={level.lv} className={`rounded-2xl border-2 p-4 ${c.border} ${c.bg}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-9 h-9 rounded-xl ${c.dot} flex items-center justify-center shrink-0 shadow-sm`}>
                      <span className="text-xs font-black text-white">N{level.lv}</span>
                    </div>
                    <div>
                      <p className={`text-sm font-black ${c.text}`}>{level.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{level.sub}</p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className={`text-xs font-bold ${c.text}`}>{level.human}% persona</p>
                      <p className="text-xs text-gray-400">{level.ia}% IA</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{level.desc}</p>
                  {level.examples?.[0] && (
                    <p className="text-[10px] text-gray-400 italic mt-1.5">{level.examples[0].subject}: {level.examples[0].activity}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}
