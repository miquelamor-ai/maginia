"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Sparkles, ChevronRight, ChevronLeft, Eye, EyeOff, Users, BarChart3, RefreshCw, QrCode, X, Map, Clock } from "lucide-react";

// ─── Shared delegation labels ────────────────────────────────────

const DELEG_LABELS = [
  { n: 0, label: "N0", name: "Preservació", color: "bg-gray-400" },
  { n: 1, label: "N1", name: "Exploració", color: "bg-emerald-500" },
  { n: 2, label: "N2", name: "Suport", color: "bg-blue-500" },
  { n: 3, label: "N3", name: "Cocreació", color: "bg-violet-500" },
  { n: 4, label: "N4", name: "Delegació", color: "bg-amber-500" },
  { n: 5, label: "N5", name: "Agència", color: "bg-rose-500" },
];

// ─── Calibra Scenarios ───────────────────────────────────────────

const CALIBRA_SCENARIOS = [
  {
    id: "cal-1",
    text: "El docent de 2n ESO projecta Gemini a la pissarra i pregunta: «Quins són els principals biomes del planeta?» La classe debat si la resposta és completa i afegeix matisos.",
    context: "2n ESO · Ciències Naturals",
    correctLevel: 1,
    tag: "offloading" as const,
    explanation: "N1 — Exploració: La IA inspira o informa, però el producte intel·lectual (l'anàlisi crítica, el debat) és 100% de l'alumnat.",
  },
  {
    id: "cal-2",
    text: "Una alumna de 4t ESO ha escrit un assaig sobre el canvi climàtic i demana a Copilot: «Revisa l'ortografia i la coherència argumentativa del meu text.»",
    context: "4t ESO · Llengua",
    correctLevel: 2,
    tag: "offloading" as const,
    explanation: "N2 — Suport: L'alumna crea, la IA millora o corregeix. El producte original és de l'alumna.",
  },
  {
    id: "cal-3",
    text: "Un alumne de Batxillerat i la IA col·laboren per crear una infografia: l'alumne decideix el tema, l'estructura i el contingut clau; la IA genera els gràfics estadístics; l'alumne els interpreta, selecciona i modifica.",
    context: "Batxillerat · Projecte de Recerca",
    correctLevel: 3,
    tag: "offloading" as const,
    explanation: "N3 — Cocreació: Persona i IA alternen el lideratge. Cadascú aporta el que fa millor.",
  },
  {
    id: "cal-4",
    text: "Un alumne de 3r ESO demana a Gemini: «Fes-me un resum de 300 paraules del tema 5 de ciències socials.» Copia la resposta directament al treball sense modificar-la.",
    context: "3r ESO · Ciències Socials",
    correctLevel: 4,
    tag: "outsourcing" as const,
    explanation: "N4 — Delegació: La IA genera el gruix del producte. En aquest cas, sense supervisió real, es converteix en outsourcing.",
  },
  {
    id: "cal-5",
    text: "Una plataforma adaptativa ajusta automàticament la dificultat dels exercicis de matemàtiques de 1r ESO basant-se en les respostes de cada alumne, sense intervenció del docent en cada ajust.",
    context: "1r ESO · Matemàtiques",
    correctLevel: 5,
    tag: "offloading" as const,
    explanation: "N5 — Agència: La IA opera autònomament dins un marc supervisat. L'alumne encara treballa; la IA gestiona la personalització.",
  },
];

// ─── Valida Scenarios ────────────────────────────────────────────

const VALIDA_SCENARIOS = [
  { id: "val-01", text: "Un alumne de 3r ESO demana a la IA que li resolgui un problema de matemàtiques pas a pas. Copia la solució al quadern sense intentar-ho ell primer.", context: "3r ESO · Matemàtiques", impliedLevel: 4, tag: "outsourcing" as const, friction: "nul·la" as const },
  { id: "val-02", text: "Una alumna de 4t ESO escriu un assaig. Després demana a la IA: «Reescriu-lo perquè soni més acadèmic.» Li agrada el resultat i el lliura amb petits retocs.", context: "4t ESO · Llengua Catalana", impliedLevel: 3, tag: "outsourcing" as const, friction: "baixa" as const },
  { id: "val-03", text: "El docent utilitza NotebookLM per generar un qüestionari de 20 preguntes adaptat al nivell del grup de 2n ESO, a partir dels apunts del tema.", context: "2n ESO · Qualsevol matèria", impliedLevel: -1, tag: "offloading" as const, friction: "alta" as const },
  { id: "val-04", text: "Un alumne de Batxillerat programa un projecte de tecnologia amb Copilot: ell escriu l'estructura i els comentaris, la IA genera el codi, l'alumne el revisa línia per línia i corregeix errors. Entén el 70% del codi final.", context: "Batxillerat · Tecnologia", impliedLevel: 3, tag: "offloading" as const, friction: "alta" as const },
  { id: "val-05", text: "Una alumna de 6è demana a Gemini: «Explica'm què és la fotosíntesi amb paraules senzilles.» Després ho explica amb les seves pròpies paraules al company de taula.", context: "Cicle Superior · Ciències", impliedLevel: 1, tag: "offloading" as const, friction: "alta" as const },
  { id: "val-06", text: "Un alumne de 1r ESO utilitza la IA per traduir un article científic de l'anglès al català que necessita per a un treball de ciències naturals. L'objectiu del treball és investigar, no traduir.", context: "1r ESO · Ciències Naturals", impliedLevel: 2, tag: "offloading" as const, friction: "baixa" as const },
  { id: "val-07", text: "Una alumna de 2n ESO demana a la IA un resum d'un capítol de 30 pàgines del llibre de text. Llegeix el resum, pren notes i escriu la seva pròpia anàlisi sense consultar el capítol original.", context: "2n ESO · Ciències Socials", impliedLevel: 2, tag: "offloading" as const, friction: "baixa" as const },
  { id: "val-08", text: "Un alumne de 4t ESO fa servir la IA per generar 5 idees per a un projecte d'emprenedoria. Després en tria una, la desenvolupa ell sol i justifica la seva tria davant la classe.", context: "4t ESO · Emprenedoria", impliedLevel: 1, tag: "offloading" as const, friction: "alta" as const },
  { id: "val-09", text: "Una eina d'IA corregeix automàticament tots els exercicis de gramàtica d'un alumne de 1r ESO i li dona la nota sense que ell revisi els errors.", context: "1r ESO · Llengua", impliedLevel: 5, tag: "outsourcing" as const, friction: "nul·la" as const },
  { id: "val-10", text: "Una alumna de Batxillerat crea un podcast: ella investiga el tema, escriu el guió, la IA genera la música de fons, i ella fa l'edició i la locució final.", context: "Batxillerat · Projecte Interdisciplinari", impliedLevel: 3, tag: "offloading" as const, friction: "alta" as const },
  { id: "val-11", text: "Un alumne de 3r ESO escriu un text argumentatiu amb un procés guiat: demana arguments a la IA, en tria 3, escriu un esborrany, la IA suggereix millores d'estructura, l'alumne reescriu, la IA revisa ortografia. 4 interaccions amb la IA, però totes les decisions són de l'alumne.", context: "3r ESO · Llengua", impliedLevel: 2, tag: "offloading" as const, friction: "alta" as const },
  { id: "val-12", text: "Una alumna de 4t ESO fa un projecte de recerca: usa la IA per trobar fonts i resumir-les, formula la hipòtesi ella sola, dissenya l'enquesta, usa la IA per analitzar estadísticament les dades, i escriu les conclusions contrastant amb les fonts. Ha delegat la cerca i l'anàlisi, però la hipòtesi i conclusions són seves.", context: "4t ESO · Projecte de Recerca", impliedLevel: 3, tag: "offloading" as const, friction: "alta" as const },
  { id: "val-13", text: "Un alumne de 2n ESO utilitza la IA com a tutor de mates durant 40 minuts: demana explicacions, fa exercicis sol, els comprova amb la IA, demana pistes quan falla (no solucions), corregeix i torna a intentar. Al final resol 15 exercicis correctament sense ajuda.", context: "2n ESO · Matemàtiques", impliedLevel: 2, tag: "offloading" as const, friction: "alta" as const },
];

// ─── Types ───────────────────────────────────────────────────────

type Phase = "calibra" | "mapa" | "valida";

interface CalibraVote {
  scenario_id: string;
  selected_level: number;
}

interface ValidaVote {
  scenario_id: string;
  approved: boolean;
}

// ─── Component ───────────────────────────────────────────────────

export default function FacilitadorPage() {
  const [phase, setPhase] = useState<Phase>("calibra");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [calibraVotes, setCalibraVotes] = useState<CalibraVote[]>([]);
  const [validaVotes, setValidaVotes] = useState<ValidaVote[]>([]);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");
  const [sessionActive, setSessionActive] = useState(false);
  const [mapaProgress, setMapaProgress] = useState({ participants: 0, declarations: 0 });
  const [mapaTimer, setMapaTimer] = useState(0);
  const [mapaTimerActive, setMapaTimerActive] = useState(false);

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const participantUrl = `${baseUrl}/mapa/sessio`;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(participantUrl)}&bgcolor=1a2744&color=ffffff&format=svg`;

  const scenarios = phase === "calibra" ? CALIBRA_SCENARIOS : phase === "valida" ? VALIDA_SCENARIOS : [];
  const scenario = scenarios[currentIdx] || null;
  const table = phase === "calibra" ? "mapa_calibra" : "mapa_valida";

  // ─── Fetch votes ─────────────────────────────────────────────

  const fetchVotes = useCallback(async () => {
    if (phase === "mapa") {
      // Fetch mapa declarations progress
      const { data } = await supabase.from("mapa_declarations").select("session_id, course_id");
      if (data) {
        const sessions = new Set(data.map((d: { session_id: string }) => d.session_id));
        setMapaProgress({ participants: sessions.size, declarations: data.length });
        setTotalParticipants(sessions.size);
      }
      return;
    }
    if (phase === "calibra" && scenario) {
      const { data } = await supabase
        .from("mapa_calibra")
        .select("scenario_id, selected_level, session_id")
        .eq("scenario_id", scenario.id);

      if (data) {
        setCalibraVotes(data as CalibraVote[]);
        const sessions = new Set(data.map((d: { session_id: string }) => d.session_id));
        setTotalParticipants(sessions.size);
      }
    } else if (phase === "valida" && scenario) {
      const { data } = await supabase
        .from("mapa_valida")
        .select("scenario_id, approved, session_id")
        .eq("scenario_id", scenario.id);

      if (data) {
        setValidaVotes(data as ValidaVote[]);
        const sessions = new Set(data.map((d: { session_id: string }) => d.session_id));
        setTotalParticipants(sessions.size);
      }
    }
  }, [phase, scenario]);

  // Count unique participants across all scenarios
  const fetchTotalParticipants = useCallback(async () => {
    const { data } = await supabase.from(table).select("session_id");
    if (data) {
      const sessions = new Set(data.map((d: { session_id: string }) => d.session_id));
      setTotalParticipants(sessions.size);
    }
  }, [table]);

  useEffect(() => {
    fetchVotes();
    fetchTotalParticipants();
  }, [fetchVotes, fetchTotalParticipants]);

  // Auto-refresh every 3 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchVotes, 3000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchVotes]);

  // ─── Sync state to Supabase ─────────────────────────────────

  const broadcastState = useCallback(async (p: Phase, idx: number, active: boolean) => {
    await supabase.from("mapa_facilitador_state").update({
      phase: p,
      current_idx: idx,
      is_active: active,
      updated_at: new Date().toISOString(),
    }).eq("id", 1);
  }, []);

  // Deactivate on unmount
  useEffect(() => {
    return () => {
      supabase.from("mapa_facilitador_state").update({ is_active: false }).eq("id", 1);
    };
  }, []);

  // ─── Navigation ──────────────────────────────────────────────

  const goNext = useCallback(() => {
    setCurrentIdx(prev => {
      if (prev >= scenarios.length - 1) return prev;
      const next = prev + 1;
      setIsRevealed(false);
      if (sessionActive) broadcastState(phase, next, true);
      return next;
    });
  }, [scenarios.length, sessionActive, phase, broadcastState]);

  const goPrev = useCallback(() => {
    setCurrentIdx(prev => {
      if (prev <= 0) return prev;
      const next = prev - 1;
      setIsRevealed(false);
      if (sessionActive) broadcastState(phase, next, true);
      return next;
    });
  }, [sessionActive, phase, broadcastState]);

  // ─── Keyboard navigation ────────────────────────────────────

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (phase === "mapa") return; // No scenario nav in mapa phase
      if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); goNext(); }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); goPrev(); }
      if (e.key === " ") { e.preventDefault(); setIsRevealed(r => !r); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev, phase]);

  // ─── Mapa timer ──────────────────────────────────────────────

  useEffect(() => {
    if (phase === "mapa" && !mapaTimerActive) {
      setMapaTimer(0);
      setMapaTimerActive(true);
    }
    if (phase !== "mapa") {
      setMapaTimerActive(false);
    }
  }, [phase, mapaTimerActive]);

  useEffect(() => {
    if (!mapaTimerActive) return;
    const interval = setInterval(() => setMapaTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [mapaTimerActive]);

  const switchPhase = (p: Phase) => {
    setPhase(p);
    setCurrentIdx(0);
    setIsRevealed(false);
    if (sessionActive) broadcastState(p, 0, true);
  };

  const toggleSession = () => {
    const next = !sessionActive;
    setSessionActive(next);
    broadcastState(phase, currentIdx, next);
  };

  // ─── Vote counts ──────────────────────────────────────────────

  const calibraDistribution = DELEG_LABELS.map(dl => ({
    ...dl,
    count: calibraVotes.filter(v => v.selected_level === dl.n).length,
  }));
  const calibraTotal = calibraVotes.length;
  const calibraMaxCount = Math.max(1, ...calibraDistribution.map(d => d.count));

  const validaYes = validaVotes.filter(v => v.approved).length;
  const validaNo = validaVotes.filter(v => !v.approved).length;
  const validaTotal = validaVotes.length;

  // ─── Render ────────────────────────────────────────────────────

  return (
    <main className="h-screen bg-[var(--jesuites-blue)] text-white font-sans select-none overflow-hidden">
      <div className="w-full mx-auto px-10 py-4 h-full flex flex-col">

        {/* QR Overlay */}
        {showQR && (
          <div className="fixed inset-0 bg-[var(--jesuites-blue)] z-50 flex flex-col items-center justify-center" onClick={() => setShowQR(false)}>
            <button onClick={() => setShowQR(false)} className="absolute top-6 right-6 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all">
              <X size={20} />
            </button>
            <p className="text-white/30 text-sm font-bold uppercase tracking-[0.4em] mb-8">Escaneja per participar</p>
            <div className="bg-white rounded-3xl p-8 shadow-2xl mb-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrApiUrl} alt="QR Code" width={320} height={320} className="rounded-xl" />
            </div>
            <p className="text-white/90 text-2xl font-bold tracking-wide mb-2 font-mono">
              {participantUrl.replace(/^https?:\/\//, '')}
            </p>
            <p className="text-white/30 text-xs font-bold uppercase tracking-[0.3em] mt-4">
              Clica qualsevol lloc per tancar
            </p>
          </div>
        )}

        {/* Top bar: logo + phase tabs + controls — all in one row */}
        <div className="flex items-center justify-between shrink-0 mb-3">
          {/* Left: phase tabs */}
          <div className="flex items-center gap-3">
            <Sparkles size={20} className="text-white/40" />
            <button
              onClick={() => switchPhase("calibra")}
              className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${phase === "calibra" ? "bg-white text-[var(--jesuites-blue)] shadow-lg" : "bg-white/10 text-white/50 hover:bg-white/20"}`}
            >
              Calibra
            </button>
            {phase !== "mapa" && scenarios.length > 0 && (
              <div className="flex gap-1.5">
                {scenarios.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setCurrentIdx(i); setIsRevealed(false); if (sessionActive) broadcastState(phase, i, true); }}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      i === currentIdx ? "w-10 bg-white" :
                      i < currentIdx ? "w-5 bg-white/40" : "w-5 bg-white/15"
                    }`}
                  />
                ))}
              </div>
            )}
            <button
              onClick={() => switchPhase("mapa")}
              className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${phase === "mapa" ? "bg-violet-400 text-[var(--jesuites-blue)] shadow-lg" : "bg-white/10 text-white/50 hover:bg-white/20"}`}
            >
              Mapa
            </button>
            <button
              onClick={() => switchPhase("valida")}
              className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${phase === "valida" ? "bg-amber-400 text-[var(--jesuites-blue)] shadow-lg" : "bg-white/10 text-white/50 hover:bg-white/20"}`}
            >
              Valida
            </button>
          </div>
          {/* Right: controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSession}
              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${sessionActive ? "bg-emerald-500 text-white animate-pulse" : "bg-white/10 text-white/50 hover:bg-white/20"}`}
            >
              {sessionActive ? "Sessió activa" : "Iniciar sessió"}
            </button>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-2 rounded-xl">
              <Users size={14} />
              <span className="text-sm font-bold">{totalParticipants}</span>
            </div>
            <button onClick={() => setShowQR(true)} className="p-2 rounded-xl bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-all">
              <QrCode size={16} />
            </button>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-xl transition-all ${autoRefresh ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-white/40"}`}
            >
              <RefreshCw size={14} className={autoRefresh ? "animate-spin" : ""} style={autoRefresh ? { animationDuration: "3s" } : {}} />
            </button>
          </div>
        </div>

        {/* ═══ MAPA PHASE — Dashboard ═══ */}
        {phase === "mapa" && (
          <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-8">
            <div className="text-center">
              <Map size={48} className="text-violet-300 mx-auto mb-4" />
              <h2 className="text-4xl font-bold text-white mb-2">Fase 2: Mapa de Delegació</h2>
              <p className="text-lg text-white/60">Els participants estan declarant l&apos;ús de la IA per curs</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 w-full max-w-2xl">
              <div className="bg-white/10 rounded-3xl p-8 text-center border border-white/5">
                <Users size={28} className="text-violet-300 mx-auto mb-3" />
                <span className="text-6xl font-bold text-white block">{mapaProgress.participants}</span>
                <span className="text-sm font-bold text-white/50 uppercase tracking-widest mt-2 block">Participants</span>
              </div>
              <div className="bg-white/10 rounded-3xl p-8 text-center border border-white/5">
                <BarChart3 size={28} className="text-violet-300 mx-auto mb-3" />
                <span className="text-6xl font-bold text-white block">{mapaProgress.declarations}</span>
                <span className="text-sm font-bold text-white/50 uppercase tracking-widest mt-2 block">Declaracions</span>
              </div>
              <div className="bg-white/10 rounded-3xl p-8 text-center border border-white/5">
                <Clock size={28} className="text-violet-300 mx-auto mb-3" />
                <span className="text-6xl font-bold text-white block font-mono">
                  {Math.floor(mapaTimer / 60)}:{String(mapaTimer % 60).padStart(2, "0")}
                </span>
                <span className="text-sm font-bold text-white/50 uppercase tracking-widest mt-2 block">Temps</span>
              </div>
            </div>

            {/* Average per participant */}
            {mapaProgress.participants > 0 && (
              <div className="bg-violet-500/20 rounded-2xl px-8 py-4 border border-violet-400/20 text-center">
                <span className="text-2xl font-bold text-violet-300">
                  {(mapaProgress.declarations / mapaProgress.participants).toFixed(1)}
                </span>
                <span className="text-sm text-violet-300/70 ml-2">cursos declarats de mitjana (d&apos;11)</span>
              </div>
            )}

            <p className="text-white/30 text-sm font-bold uppercase tracking-[0.3em] animate-pulse">
              Passa a Valida quan estiguin llestos
            </p>
          </div>
        )}

        {/* ═══ CALIBRA / VALIDA — Scenario view ═══ */}
        {phase !== "mapa" && scenario && (
          <>
        {/* Scenario: context badge + text */}
        <div className="shrink-0 mb-2">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-white/40 text-sm font-bold uppercase tracking-wider">
              {currentIdx + 1}/{scenarios.length}
            </span>
            <span className="text-sm font-bold bg-white/15 px-3 py-1 rounded-full">
              {scenario.context}
            </span>
            <div className="flex-1" />
            {/* Reveal button inline */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-white/50">
                {phase === "calibra" ? calibraTotal : validaTotal} vots
              </span>
              <button
                onClick={() => setIsRevealed(!isRevealed)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  isRevealed
                    ? "bg-white/20 text-white hover:bg-white/30"
                    : "bg-white text-[var(--jesuites-blue)] shadow-lg hover:shadow-xl"
                }`}
              >
                {isRevealed ? <><EyeOff size={14} /> Amagar</> : <><Eye size={14} /> Revelar</>}
              </button>
            </div>
          </div>
          <p className="text-2xl md:text-[1.7rem] font-medium leading-snug text-white">
            {scenario.text}
          </p>
        </div>

        {/* Results — flex-1 fills all remaining space */}
        <div className={`flex-1 min-h-0 transition-all duration-500 ${isRevealed ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          {phase === "calibra" && (
            <div className="h-full flex flex-col gap-3">
              {/* Distribution bars + labels — fill available height */}
              <div className="flex-1 grid grid-cols-6 gap-3 min-h-0">
                {calibraDistribution.map(dl => {
                  const isCorrect = dl.n === (scenario as typeof CALIBRA_SCENARIOS[number]).correctLevel;
                  return (
                    <div key={dl.n} className="flex flex-col text-center min-h-0">
                      <div className="flex-1 flex flex-col justify-end min-h-0">
                        <div
                          className={`rounded-t-xl transition-all duration-700 ${isCorrect ? "ring-2 ring-white" : ""} ${dl.color}`}
                          style={{ height: `${calibraMaxCount > 0 ? (dl.count / calibraMaxCount) * 100 : 0}%`, minHeight: dl.count > 0 ? "12px" : "0" }}
                        />
                      </div>
                      <div className={`py-2.5 rounded-xl mt-1.5 ${isCorrect ? "bg-white/25 ring-2 ring-white/60" : "bg-white/5"}`}>
                        <span className="text-2xl font-bold block">{dl.count}</span>
                        <span className="text-xs font-bold block opacity-70">{dl.label}</span>
                        <span className="text-[10px] block opacity-40">{dl.name}</span>
                      </div>
                      {isCorrect && (
                        <span className="text-[10px] font-bold text-emerald-300 mt-1 block uppercase tracking-wider">✓ Correcte</span>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Explanation bar */}
              <div className="bg-white/10 rounded-2xl px-5 py-3 flex items-center gap-4 shrink-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${DELEG_LABELS[(scenario as typeof CALIBRA_SCENARIOS[number]).correctLevel].color}`}>
                  <span className="text-sm font-bold">{DELEG_LABELS[(scenario as typeof CALIBRA_SCENARIOS[number]).correctLevel].label}</span>
                </div>
                <p className="text-sm text-white/80 leading-snug flex-1">
                  {(scenario as typeof CALIBRA_SCENARIOS[number]).explanation}
                </p>
                <span className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg shrink-0 ${
                  (scenario as typeof CALIBRA_SCENARIOS[number]).tag === "outsourcing" ? "bg-red-500/30 text-red-200" : "bg-blue-500/30 text-blue-200"
                }`}>
                  {(scenario as typeof CALIBRA_SCENARIOS[number]).tag === "outsourcing" ? "⚠ Outsourcing" : "✓ Offloading"}
                </span>
              </div>
            </div>
          )}

          {phase === "valida" && (
            <div className="h-full flex flex-col gap-3">
              <div className="flex-1 grid grid-cols-2 gap-6 min-h-0">
                <div className="bg-emerald-500/20 rounded-3xl p-6 flex flex-col items-center justify-center border border-emerald-400/20">
                  <span className="text-7xl font-bold text-emerald-300">{validaYes}</span>
                  <span className="text-lg font-bold text-emerald-400/80 mt-2">Sí, ho aprovo</span>
                  {validaTotal > 0 && <span className="text-3xl font-bold text-emerald-300/60 mt-1">{Math.round((validaYes / validaTotal) * 100)}%</span>}
                </div>
                <div className="bg-rose-500/20 rounded-3xl p-6 flex flex-col items-center justify-center border border-rose-400/20">
                  <span className="text-7xl font-bold text-rose-300">{validaNo}</span>
                  <span className="text-lg font-bold text-rose-400/80 mt-2">No, ho rebutjo</span>
                  {validaTotal > 0 && <span className="text-3xl font-bold text-rose-300/60 mt-1">{Math.round((validaNo / validaTotal) * 100)}%</span>}
                </div>
              </div>
              {validaTotal > 0 && (() => {
                const maxPct = Math.max(validaYes, validaNo) / validaTotal * 100;
                const vs = scenario as typeof VALIDA_SCENARIOS[number];
                return (
                  <div className={`rounded-2xl px-5 py-3 flex items-center justify-between shrink-0 ${
                    maxPct >= 80 ? "bg-emerald-500/20 border border-emerald-400/20" :
                    maxPct >= 60 ? "bg-amber-500/20 border border-amber-400/20" :
                    "bg-rose-500/20 border border-rose-400/20"
                  }`}>
                    <span className="text-lg font-bold">
                      {maxPct >= 80 ? "Consens fort" : maxPct >= 60 ? "Tendència clara" : "Divisió — Cal debat!"}
                    </span>
                    <div className="flex gap-2">
                      {vs.impliedLevel >= 0 && (
                        <span className="text-[10px] font-bold bg-white/10 px-3 py-1.5 rounded-lg">{DELEG_LABELS[vs.impliedLevel].label} · {DELEG_LABELS[vs.impliedLevel].name}</span>
                      )}
                      {vs.impliedLevel === -1 && (
                        <span className="text-[10px] font-bold bg-blue-500/30 text-blue-200 px-3 py-1.5 rounded-lg">Ús docent</span>
                      )}
                      <span className={`text-[10px] font-bold px-3 py-1.5 rounded-lg ${vs.tag === "outsourcing" ? "bg-red-500/30 text-red-200" : "bg-blue-500/30 text-blue-200"}`}>
                        {vs.tag === "outsourcing" ? "⚠ Outsourcing" : "✓ Offloading"}
                      </span>
                      <span className={`text-[10px] font-bold px-3 py-1.5 rounded-lg ${
                        vs.friction === "alta" ? "bg-emerald-500/30 text-emerald-200" :
                        vs.friction === "nul·la" ? "bg-red-500/30 text-red-200" : "bg-amber-500/30 text-amber-200"
                      }`}>Fricció {vs.friction}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Bottom nav */}
        <div className="flex items-center justify-between pt-3 shrink-0 border-t border-white/10 mt-2">
          <button
            onClick={goPrev}
            disabled={currentIdx === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 text-sm font-bold uppercase tracking-wider disabled:opacity-20 hover:bg-white/20 transition-all"
          >
            <ChevronLeft size={16} /> Anterior
          </button>
          <span className="text-white/30 text-sm font-bold uppercase">
            {phase === "calibra" ? "Calibra" : "Valida"} · {currentIdx + 1}/{scenarios.length}
          </span>
          <button
            onClick={goNext}
            disabled={currentIdx === scenarios.length - 1}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 text-sm font-bold uppercase tracking-wider disabled:opacity-20 hover:bg-white/20 transition-all"
          >
            Següent <ChevronRight size={16} />
          </button>
        </div>
          </>
        )}
      </div>
    </main>
  );
}
