"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Sparkles, ChevronRight, ChevronLeft, Eye, EyeOff, Users, BarChart3, RefreshCw, QrCode, X, Map, Clock, Wifi, Plus, Grid3X3 } from "lucide-react";

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
  // ─── Bonus scenarios (mixed difficulty) ──────────────────────
  {
    id: "cal-6",
    text: "Una alumna de 3r ESO escriu un poema en anglès. Després demana a la IA: «Check my grammar and spelling.» Corregeix els errors marcats i entrega la versió final.",
    context: "3r ESO · Anglès",
    correctLevel: 2,
    tag: "offloading" as const,
    explanation: "N2 — Suport: L'alumna ha creat el contingut original. La IA actua com a corrector, similar a un Spell-check. El producte creatiu és de l'alumna.",
  },
  {
    id: "cal-7",
    text: "El departament de filosofia decideix que l'examen d'ètica de 1r Batxillerat es farà a mà, sense cap dispositiu digital, per avaluar el raonament moral autònom de l'alumnat.",
    context: "1r Batxillerat · Filosofia",
    correctLevel: 0,
    tag: "offloading" as const,
    explanation: "N0 — Preservació: Decisió deliberada de no usar IA. L'objectiu pedagògic requereix que el pensament sigui 100% humà i no assistit.",
  },
  {
    id: "cal-8",
    text: "Un alumne de 4t ESO demana a la IA: «Crea'm una presentació de 10 diapositives sobre la Revolució Francesa amb imatges i text.» Revisa les diapositives per sobre i la presenta tal qual.",
    context: "4t ESO · Ciències Socials",
    correctLevel: 4,
    tag: "outsourcing" as const,
    explanation: "N4 — Delegació: La IA ha generat tot el producte. La revisió superficial no constitueix una aportació significativa. És outsourcing del treball cognitiu.",
  },
  {
    id: "cal-9",
    text: "Una alumna de Batxillerat investiga el canvi climàtic: ella busca dades al web, la IA li organitza les dades en taules comparatives, ella interpreta els resultats i escriu les conclusions. Cada pas requereix decisions de l'alumna.",
    context: "Batxillerat · Ciències de la Terra",
    correctLevel: 3,
    tag: "offloading" as const,
    explanation: "N3 — Cocreació: Hi ha alternança genuïna de lideratge. L'alumna aporta la investigació i la interpretació; la IA aporta l'organització de dades.",
  },
  {
    id: "cal-10",
    text: "Alumnes de 2n ESO pregunten a Gemini: «Quins temes d'actualitat podrien generar un bon debat a classe?» La IA suggereix 8 temes. La classe en tria 2 i prepara arguments a favor i en contra sense IA.",
    context: "2n ESO · Tutoria",
    correctLevel: 1,
    tag: "offloading" as const,
    explanation: "N1 — Exploració: La IA només ha inspirat la tria de tema. Tot el treball cognitiu (argumentació, debat) és dels alumnes.",
  },
];

const CORE_CALIBRA_COUNT = 5;

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

const COURSES = [
  { id: "I3-I5", name: "Infantil", sub: "I3–I5" },
  { id: "PRI-CI", name: "C. Inicial", sub: "1r–2n" },
  { id: "PRI-CM", name: "C. Mitjà", sub: "3r–4t" },
  { id: "PRI-CS", name: "C. Superior", sub: "5è–6è" },
  { id: "ESO-1", name: "1r ESO", sub: "" },
  { id: "ESO-2", name: "2n ESO", sub: "" },
  { id: "ESO-3", name: "3r ESO", sub: "" },
  { id: "ESO-4", name: "4t ESO", sub: "" },
  { id: "BATX", name: "Batxillerat", sub: "" },
  { id: "FP-CGM", name: "FP GM", sub: "" },
  { id: "FP-CGS", name: "FP GS", sub: "" },
];

interface MapaRow {
  course_id: string;
  delegation_n0: boolean;
  delegation_n1: boolean;
  delegation_n2: boolean;
  delegation_n3: boolean;
  delegation_n4: boolean;
  delegation_n5: boolean;
  teacher_outside: boolean;
  teacher_inside: boolean;
  student_access: boolean;
  student_modality: string | null;
}

type Phase = "calibra" | "mapa" | "valida";

interface CalibraVote {
  scenario_id: string;
  selected_level: number;
}

interface ValidaVote {
  scenario_id: string;
  approved: boolean;
  session_id: string;
  has_inconsistency: boolean;
  has_fixed: boolean;
}

// ─── Component ───────────────────────────────────────────────────

export default function FacilitadorPage() {
  const [phase, setPhase] = useState<Phase>("calibra");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [calibraVotes, setCalibraVotes] = useState<CalibraVote[]>([]);
  const [validaVotes, setValidaVotes] = useState<ValidaVote[]>([]);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [activeParticipants, setActiveParticipants] = useState(0);
  const [peakParticipants, setPeakParticipants] = useState(0);
  const [currentScenarioVotes, setCurrentScenarioVotes] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");
  const [sessionActive, setSessionActive] = useState(false);
  const [guidedSessionId, setGuidedSessionId] = useState("");
  const [mapaProgress, setMapaProgress] = useState({ participants: 0, declarations: 0 });
  const [mapaTimer, setMapaTimer] = useState(0);
  const [mapaTimerActive, setMapaTimerActive] = useState(false);
  const [showBonusScenarios, setShowBonusScenarios] = useState(false);
  const [mapaShowHeatmap, setMapaShowHeatmap] = useState(false);
  const [mapaAllData, setMapaAllData] = useState<MapaRow[]>([]);
  const [allValidaResults, setAllValidaResults] = useState<Record<string, { yes: number; no: number; total: number }>>({});
  const [showValidaSummary, setShowValidaSummary] = useState(false);
  const [mapaShowDebat, setMapaShowDebat] = useState(false);
  const [mapaFixCount, setMapaFixCount] = useState(0);

  useEffect(() => {
    setBaseUrl(window.location.origin);
    // Pre-load simulation session via ?sim=<id> (read-only, no broadcast)
    const params = new URLSearchParams(window.location.search);
    const simId = params.get("sim");
    if (simId) {
      setGuidedSessionId(simId);
      setSessionActive(true);
      setPhase("mapa");
    }
  }, []);

  // Fetch active participants (heartbeat within last 60s)
  const fetchActiveParticipants = useCallback(async () => {
    if (!guidedSessionId) return;
    const cutoff = new Date(Date.now() - 60000).toISOString();
    const { data } = await supabase
      .from("mapa_sessions")
      .select("session_id")
      .eq("guided_session_id", guidedSessionId)
      .gte("last_heartbeat", cutoff);
    if (data) {
      setActiveParticipants(data.length);
      if (data.length > 0) setPeakParticipants(prev => Math.max(prev, data.length));
    }
  }, [guidedSessionId]);

  const participantUrl = guidedSessionId
    ? `${baseUrl}/mapa/sessio?g=${guidedSessionId}`
    : `${baseUrl}/mapa/sessio`;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(participantUrl)}&bgcolor=1a2744&color=ffffff&format=svg`;

  const calibraActive = showBonusScenarios ? CALIBRA_SCENARIOS : CALIBRA_SCENARIOS.slice(0, CORE_CALIBRA_COUNT);
  const scenarios = phase === "calibra" ? calibraActive : phase === "valida" ? VALIDA_SCENARIOS : [];
  const scenario = scenarios[currentIdx] || null;
  const table = phase === "calibra" ? "mapa_calibra" : "mapa_valida";

  // ─── Fetch votes ─────────────────────────────────────────────

  const fetchVotes = useCallback(async () => {
    if (!sessionActive) return;
    // Also refresh active participants
    fetchActiveParticipants();

    if (phase === "mapa") {
      // Fetch mapa declarations with full data for heatmap
      let query = supabase.from("mapa_declarations").select("session_id, course_id, delegation_n0, delegation_n1, delegation_n2, delegation_n3, delegation_n4, delegation_n5, teacher_outside, teacher_inside, student_access, student_modality");
      if (guidedSessionId) query = query.eq("guided_session_id", guidedSessionId);
      const { data } = await query;
      if (data) {
        const sessions = new Set(data.map((d: { session_id: string }) => d.session_id));
        setMapaProgress({ participants: sessions.size, declarations: data.length });
        setTotalParticipants(sessions.size);
        setMapaAllData(data as MapaRow[]);
      }
      return;
    }
    if (phase === "calibra" && scenario) {
      let query = supabase
        .from("mapa_calibra")
        .select("scenario_id, selected_level, session_id")
        .eq("scenario_id", scenario.id);
      if (guidedSessionId) query = query.eq("guided_session_id", guidedSessionId);
      const { data } = await query;

      if (data) {
        setCalibraVotes(data as CalibraVote[]);
        const sessions = new Set(data.map((d: { session_id: string }) => d.session_id));
        setTotalParticipants(sessions.size);
        setCurrentScenarioVotes(data.length);
      }
    } else if (phase === "valida" && scenario) {
      let query = supabase
        .from("mapa_valida")
        .select("scenario_id, approved, session_id, has_inconsistency, has_fixed")
        .eq("scenario_id", scenario.id);
      if (guidedSessionId) query = query.eq("guided_session_id", guidedSessionId);
      const { data } = await query;

      if (data) {
        setValidaVotes(data as ValidaVote[]);
        const sessions = new Set(data.map((d: { session_id: string }) => d.session_id));
        setTotalParticipants(sessions.size);
        setCurrentScenarioVotes(data.length);
      }
    }
  }, [phase, scenario, guidedSessionId, sessionActive, fetchActiveParticipants]);

  // Count unique participants across all scenarios (filtered by guided session)
  const fetchTotalParticipants = useCallback(async () => {
    if (!sessionActive) return;
    let query = supabase.from(table).select("session_id");
    if (guidedSessionId) query = query.eq("guided_session_id", guidedSessionId);
    const { data } = await query;
    if (data) {
      const sessions = new Set(data.map((d: { session_id: string }) => d.session_id));
      setTotalParticipants(sessions.size);
    }
  }, [table, guidedSessionId, sessionActive]);

  // Fetch results for ALL valida scenarios at once (for progress dots + summary)
  const fetchAllValidaResults = useCallback(async () => {
    if (!sessionActive) return;
    let query = supabase.from("mapa_valida").select("scenario_id, approved, session_id, has_fixed");
    if (guidedSessionId) query = query.eq("guided_session_id", guidedSessionId);
    const { data } = await query;
    if (data) {
      const results: Record<string, { yes: number; no: number; total: number }> = {};
      let fixes = 0;
      for (const row of data as { scenario_id: string; approved: boolean; has_fixed: boolean }[]) {
        if (!results[row.scenario_id]) results[row.scenario_id] = { yes: 0, no: 0, total: 0 };
        results[row.scenario_id].total++;
        if (row.approved) results[row.scenario_id].yes++;
        else results[row.scenario_id].no++;
        if (row.has_fixed) fixes++;
      }
      setAllValidaResults(results);
      setMapaFixCount(fixes);
    }
  }, [sessionActive, guidedSessionId]);

  useEffect(() => {
    fetchVotes();
    fetchTotalParticipants();
  }, [fetchVotes, fetchTotalParticipants]);

  // Auto-refresh every 2 seconds (fallback)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchVotes();
      if (phase === "valida") fetchAllValidaResults();
    }, 2000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchVotes, phase, fetchAllValidaResults]);

  // Fetch all valida results when entering valida phase
  useEffect(() => {
    if (phase === "valida") fetchAllValidaResults();
  }, [phase, fetchAllValidaResults]);

  // Supabase Realtime: instant vote updates
  useEffect(() => {
    if (!guidedSessionId) return;
    const channel = supabase
      .channel(`votes-${guidedSessionId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "mapa_calibra" }, () => fetchVotes())
      .on("postgres_changes", { event: "*", schema: "public", table: "mapa_valida" }, () => { fetchVotes(); fetchAllValidaResults(); })
      .on("postgres_changes", { event: "*", schema: "public", table: "mapa_declarations" }, () => fetchVotes())
      .on("postgres_changes", { event: "*", schema: "public", table: "mapa_sessions" }, () => fetchActiveParticipants())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [guidedSessionId, fetchVotes, fetchActiveParticipants, fetchAllValidaResults]);

  // ─── Sync state to Supabase ─────────────────────────────────

  const broadcastState = useCallback(async (p: Phase, idx: number, active: boolean, gsId?: string) => {
    await supabase.from("mapa_facilitador_state").update({
      phase: p,
      current_idx: idx,
      is_active: active,
      guided_session_id: gsId ?? (guidedSessionId || null),
      updated_at: new Date().toISOString(),
    }).eq("id", 1);
  }, [guidedSessionId]);

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
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "PageDown") { e.preventDefault(); goNext(); }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "PageUp") { e.preventDefault(); goPrev(); }
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
    if (next) {
      // Generate new guided session ID
      const newGsId = crypto.randomUUID().slice(0, 8);
      setGuidedSessionId(newGsId);
      setActiveParticipants(0);
      setPeakParticipants(0);
      setTotalParticipants(0);
      broadcastState(phase, currentIdx, true, newGsId);
    } else {
      setGuidedSessionId("");
      broadcastState(phase, currentIdx, false, "");
    }
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
  const validaYesIncon = validaVotes.filter(v => v.approved && v.has_inconsistency).length;
  const validaNoIncon = validaVotes.filter(v => !v.approved && v.has_inconsistency).length;
  const validaFixed = validaVotes.filter(v => v.has_fixed).length;

  // ─── Debate analysis ──────────────────────────────────────────

  const DEBATE_FIELDS: { key: keyof MapaRow; label: string; question: (c: string, pct: number) => string }[] = [
    {
      key: "teacher_outside", label: "Docent fora",
      question: (c, p) => p >= 50
        ? `Al ${c}, la majoria prepareu o corregiu amb IA, però alguns docents no. Quan la preparació assistida millora realment la classe — i quan pot fer que el docent s'allunyi de la realitat de l'aula?`
        : `Al ${c}, la majoria no usa la IA fora de classe. Quins obstacles —de temps, de confiança o ètics— ho expliquen? Quins beneficis concrets podria aportar a la vostra pràctica diària?`,
    },
    {
      key: "teacher_inside", label: "Docent dins",
      question: (c, p) => p >= 50
        ? `Al ${c}, molts feu servir la IA dins l'aula, però no tots. Quan mostrar o fer servir la IA davant l'alumnat és un model pedagògic vàlid — i quan podria normalitzar la dependència sense sentit crític?`
        : `Al ${c}, pocs docents usen la IA directament a l'aula. Quin valor afegeix mostrar-la en directe? Quins riscos didàctics veieu en introduir-la sense un protocol clar?`,
    },
    {
      key: "student_access", label: "Alumnat accés",
      question: (c, p) => p >= 50
        ? `Al ${c}, la majoria creieu que l'alumnat hauria de tenir accés a la IA, però no tots. Quines competències prèvies hauria de demostrar un alumne per usar-la autònomament — i qui hauria de verificar-ho?`
        : `Al ${c}, la majoria no dóna accés a la IA a l'alumnat. Quin aprenentatge específic creieu que es perdria si s'obrís l'accés? En quin context o edat canviaria la vostra resposta?`,
    },
    {
      key: "delegation_n0", label: "N0 Preservació",
      question: (c) => `Al ${c}, no coincidiu sobre si cal preservar espais totalment lliures de IA. Quines activitats del curs perden valor pedagògic si s'hi permet la IA — i qui ha de prendre aquesta decisió: el docent, el departament o el centre?`,
    },
    {
      key: "delegation_n1", label: "N1 Exploració",
      question: (c) => `Al ${c}, hi ha divisió sobre N1-Exploració, on la IA suggereix però l'alumne decideix i treballa. Com distingiu a la pràctica quan la IA ha inspirat l'alumne i quan li ha estalviat l'esforç de generar les seves pròpies preguntes?`,
    },
    {
      key: "delegation_n2", label: "N2 Suport",
      question: (c) => `Al ${c}, no acordeu fins on arriba N2-Suport. Poseu un exemple concret d'una tasca del vostre curs on usar la IA per corregir o millorar és legítim — i un altre on ja seria una substitució del treball real de l'alumne.`,
    },
    {
      key: "delegation_n3", label: "N3 Cocreació",
      question: (c) => `Al ${c}, esteu dividits sobre N3-Cocreació, on alumne i IA alternen el lideratge. Com podeu saber, en avaluar un treball cocreat, quina part és genuïnament de l'alumne? Quin domini del contingut hauria de demostrar prèviament?`,
    },
    {
      key: "delegation_n4", label: "N4 Delegació",
      question: (c) => `Al ${c}, hi ha divisió sobre N4-Delegació, on la IA genera el gruix del producte. En quin tipus de tasca té sentit pedagògic que la IA produeixi i l'alumne avaluï i seleccioni — i com avalueu l'aprenentatge si l'alumne no ha generat el contingut?`,
    },
    {
      key: "delegation_n5", label: "N5 Agència",
      question: (c) => `Al ${c}, no coincidiu sobre N5-Agència, on la IA opera autònomament dins un marc supervisat. Si l'alumne no intervé en el procés, què s'avalua exactament — la capacitat de dissenyar el marc, d'interpretar resultats, o tots dos? On poseu el límit perquè no sigui pur outsourcing?`,
    },
  ];

  const debatePoints = COURSES.flatMap(course => {
    const rows = mapaAllData.filter(r => r.course_id === course.id);
    const n = rows.length;
    if (n < 2) return [];
    return DEBATE_FIELDS.flatMap(f => {
      const yes = rows.filter(r => r[f.key] as boolean).length;
      const pct = yes / n * 100;
      const div = 1 - Math.abs((pct - 50) / 50); // 1 = perfect split, 0 = consensus
      if (div < 0.35) return []; // only surface real debate
      return [{ course, field: f, pct, div, n, question: f.question(course.name, pct) }];
    });
  }).sort((a, b) => b.div - a.div).slice(0, 6);

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
            {guidedSessionId && (
              <p className="text-emerald-300 text-sm font-bold uppercase tracking-[0.2em] mt-2">
                Sessió: {guidedSessionId}
              </p>
            )}
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
              <div className="flex gap-1.5 items-center">
                {scenarios.map((s, i) => {
                  const r = phase === "valida" ? allValidaResults[s.id] : null;
                  const hasCons = r && r.total > 0;
                  const consPct = hasCons ? Math.max(r.yes, r.no) / r.total * 100 : 0;
                  const dotColor = hasCons
                    ? consPct >= 80 ? "bg-emerald-400" : consPct >= 60 ? "bg-amber-400" : "bg-rose-400"
                    : i < currentIdx ? "bg-white/40" : "bg-white/15";
                  return (
                    <button
                      key={i}
                      onClick={() => { setCurrentIdx(i); setIsRevealed(false); setShowValidaSummary(false); if (sessionActive) broadcastState(phase, i, true); }}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        i === currentIdx ? `w-10 ${hasCons ? dotColor : "bg-white"}` : `w-5 ${dotColor}`
                      } ${phase === "calibra" && i >= CORE_CALIBRA_COUNT ? "opacity-60" : ""}`}
                    />
                  );
                })}
                {phase === "calibra" && (
                  <button
                    onClick={() => setShowBonusScenarios(!showBonusScenarios)}
                    className={`h-6 px-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
                      showBonusScenarios ? "bg-amber-400/20 text-amber-300 border border-amber-400/30" : "bg-white/10 text-white/40 hover:bg-white/20"
                    }`}
                    title={showBonusScenarios ? "Amagar escenaris extra" : "Mostrar escenaris extra"}
                  >
                    <Plus size={10} /> {showBonusScenarios ? "10" : "+5"}
                  </button>
                )}
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
            {/* Active participants (heartbeat) */}
            {sessionActive && (
              <div className="flex items-center gap-1.5 bg-emerald-500/20 px-3 py-2 rounded-xl border border-emerald-400/30">
                <Wifi size={14} className="text-emerald-300" />
                <span className="text-sm font-bold text-emerald-300">{activeParticipants}</span>
              </div>
            )}
            {/* Vote counter for current scenario */}
            {sessionActive && phase !== "mapa" && (() => {
              const expected = activeParticipants > 0 ? activeParticipants : (peakParticipants > 0 ? peakParticipants : totalParticipants);
              const allVoted = expected > 0 && currentScenarioVotes >= expected;
              const mostVoted = expected > 0 && currentScenarioVotes >= Math.ceil(expected * 0.8);
              return (
                <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border ${
                  allVoted ? "bg-emerald-500/20 border-emerald-400/30"
                  : mostVoted ? "bg-amber-500/20 border-amber-400/30"
                  : "bg-white/10 border-white/10"
                }`}>
                  <BarChart3 size={14} className={
                    allVoted ? "text-emerald-300" :
                    mostVoted ? "text-amber-300" : "text-white/50"
                  } />
                  <span className="text-sm font-bold">{currentScenarioVotes}/{expected}</span>
                  <span className="text-[9px] text-white/40 font-bold">vots</span>
                </div>
              );
            })()}
            {sessionActive && (
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-2 rounded-xl">
                <Users size={14} />
                <span className="text-sm font-bold">{totalParticipants}</span>
              </div>
            )}
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
          <div className="flex-1 min-h-0 flex flex-col gap-4">
            {/* Header row */}
            <div className="flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <Map size={24} className="text-violet-300" />
                <h2 className="text-xl font-bold text-white">Mapa de Delegació</h2>
                {!mapaShowDebat && (
                  <div className="flex items-center gap-3 ml-4">
                    <span className="text-sm text-white/50"><span className="text-2xl font-bold text-white">{mapaProgress.participants}</span> participants</span>
                    <span className="text-sm text-white/50"><span className="text-2xl font-bold text-white">{mapaProgress.declarations}</span> declaracions</span>
                    <span className="text-sm text-white/50 font-mono"><span className="text-2xl font-bold text-white">{Math.floor(mapaTimer / 60)}:{String(mapaTimer % 60).padStart(2, "0")}</span></span>
                  </div>
                )}
                {mapaShowDebat && debatePoints.length > 0 && (
                  <span className="ml-4 text-sm text-rose-300/70 font-bold">{debatePoints.length} punts de debat detectats · {mapaProgress.participants} docents</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {mapaFixCount > 0 && (
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/20 px-3 py-1.5 rounded-lg">
                    ✓ {mapaFixCount} correccions aplicades
                  </span>
                )}
                <button
                  onClick={() => { setMapaShowHeatmap(true); setMapaShowDebat(false); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    mapaShowHeatmap && !mapaShowDebat ? "bg-violet-400 text-[var(--jesuites-blue)] shadow-lg" : "bg-white/10 text-white/50 hover:bg-white/20"
                  }`}
                >
                  <Grid3X3 size={14} /> Resultats
                </button>
                <button
                  onClick={() => { setMapaShowDebat(true); setMapaShowHeatmap(false); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    mapaShowDebat ? "bg-rose-400 text-white shadow-lg" : "bg-white/10 text-white/50 hover:bg-white/20"
                  }`}
                >
                  <BarChart3 size={14} /> Debat
                </button>
              </div>
            </div>

            {/* Default: waiting view */}
            {!mapaShowHeatmap && (
              <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-6">
                <p className="text-lg text-white/60">Els participants estan declarant l&apos;ús de la IA per curs</p>
                {mapaProgress.participants > 0 && (
                  <div className="bg-violet-500/20 rounded-2xl px-8 py-4 border border-violet-400/20 text-center">
                    <span className="text-2xl font-bold text-violet-300">
                      {(mapaProgress.declarations / mapaProgress.participants).toFixed(1)}
                    </span>
                    <span className="text-sm text-violet-300/70 ml-2">cursos declarats de mitjana (d&apos;11)</span>
                  </div>
                )}
                <p className="text-white/30 text-sm font-bold uppercase tracking-[0.3em] animate-pulse">
                  Clica &quot;Resultats&quot; per veure el mapa agregat
                </p>
              </div>
            )}

            {/* Heatmap: full mapa results per course */}
            {mapaShowHeatmap && (
              <div className="flex-1 min-h-0 overflow-auto">
                <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                  {/* Header */}
                  <div className="grid grid-cols-[120px_55px_55px_55px_repeat(3,48px)_1px_repeat(6,1fr)_40px] gap-px bg-white/10">
                    <div className="bg-[var(--jesuites-blue)] px-2 py-2 text-[8px] font-bold text-white/40 uppercase tracking-widest">Curs</div>
                    <div className="bg-[var(--jesuites-blue)] px-1 py-2 text-center">
                      <span className="text-[8px] font-bold text-white/50 uppercase">Doc.</span>
                      <span className="text-[7px] text-white/30 block">Fora</span>
                    </div>
                    <div className="bg-[var(--jesuites-blue)] px-1 py-2 text-center">
                      <span className="text-[8px] font-bold text-white/50 uppercase">Doc.</span>
                      <span className="text-[7px] text-white/30 block">Dins</span>
                    </div>
                    <div className="bg-[var(--jesuites-blue)] px-1 py-2 text-center">
                      <span className="text-[8px] font-bold text-emerald-300/70 uppercase">Alum.</span>
                      <span className="text-[7px] text-white/30 block">Accés</span>
                    </div>
                    <div className="bg-[var(--jesuites-blue)] px-1 py-2 text-center">
                      <span className="text-[7px] font-bold text-violet-300/70">Guiat</span>
                    </div>
                    <div className="bg-[var(--jesuites-blue)] px-1 py-2 text-center">
                      <span className="text-[7px] font-bold text-violet-300/70">Autòn.</span>
                    </div>
                    <div className="bg-[var(--jesuites-blue)] px-1 py-2 text-center">
                      <span className="text-[7px] font-bold text-violet-300/70">Lliure</span>
                    </div>
                    <div className="bg-white/20" />
                    {DELEG_LABELS.map(dl => (
                      <div key={dl.n} className="bg-[var(--jesuites-blue)] px-1 py-2 text-center">
                        <span className="text-[9px] font-bold text-white/70">{dl.label}</span>
                      </div>
                    ))}
                    <div className="bg-[var(--jesuites-blue)] px-1 py-2 text-center text-[8px] font-bold text-white/40">n</div>
                  </div>
                  {/* Rows */}
                  {COURSES.map(course => {
                    const rows = mapaAllData.filter(r => r.course_id === course.id);
                    const count = rows.length;
                    const pctTeacherOut = count > 0 ? rows.filter(r => r.teacher_outside).length / count * 100 : 0;
                    const pctTeacherIn = count > 0 ? rows.filter(r => r.teacher_inside).length / count * 100 : 0;
                    const pctStudent = count > 0 ? rows.filter(r => r.student_access).length / count * 100 : 0;
                    const pctGuiat = count > 0 ? rows.filter(r => r.student_modality === "guiat").length / count * 100 : 0;
                    const pctAutonom = count > 0 ? rows.filter(r => r.student_modality === "autonom").length / count * 100 : 0;
                    const pctLliure = count > 0 ? rows.filter(r => r.student_modality === "lliure").length / count * 100 : 0;
                    return (
                      <div key={course.id} className="grid grid-cols-[120px_55px_55px_55px_repeat(3,48px)_1px_repeat(6,1fr)_40px] gap-px bg-white/5">
                        <div className="bg-[var(--jesuites-blue)] px-2 py-2 flex items-center">
                          <span className="text-[11px] font-bold text-white">{course.name}</span>
                          {course.sub && <span className="text-[8px] text-white/30 ml-1">{course.sub}</span>}
                        </div>
                        {/* Docent fora */}
                        <div className="bg-[var(--jesuites-blue)] px-1 py-2 text-center relative">
                          {count > 0 ? (
                            <>
                              <div className="absolute inset-0 bg-blue-500 transition-all duration-500" style={{ opacity: pctTeacherOut / 100 * 0.5 }} />
                              <span className="relative text-[11px] font-bold text-white">{pctTeacherOut > 0 ? `${Math.round(pctTeacherOut)}%` : ""}</span>
                            </>
                          ) : <span className="text-white/10 text-[10px]">—</span>}
                        </div>
                        {/* Docent dins */}
                        <div className="bg-[var(--jesuites-blue)] px-1 py-2 text-center relative">
                          {count > 0 ? (
                            <>
                              <div className="absolute inset-0 bg-blue-500 transition-all duration-500" style={{ opacity: pctTeacherIn / 100 * 0.5 }} />
                              <span className="relative text-[11px] font-bold text-white">{pctTeacherIn > 0 ? `${Math.round(pctTeacherIn)}%` : ""}</span>
                            </>
                          ) : <span className="text-white/10 text-[10px]">—</span>}
                        </div>
                        {/* Alumne accés */}
                        <div className="bg-[var(--jesuites-blue)] px-1 py-2 text-center relative">
                          {count > 0 ? (
                            <>
                              <div className="absolute inset-0 bg-emerald-500 transition-all duration-500" style={{ opacity: pctStudent / 100 * 0.5 }} />
                              <span className="relative text-[11px] font-bold text-white">{pctStudent > 0 ? `${Math.round(pctStudent)}%` : ""}</span>
                            </>
                          ) : <span className="text-white/10 text-[10px]">—</span>}
                        </div>
                        {/* Modalitat: guiat, autònom, lliure */}
                        {[pctGuiat, pctAutonom, pctLliure].map((pct, mi) => (
                          <div key={mi} className="bg-[var(--jesuites-blue)] px-1 py-2 text-center relative">
                            {count > 0 ? (
                              <>
                                <div className="absolute inset-0 bg-violet-500 transition-all duration-500" style={{ opacity: pct / 100 * 0.5 }} />
                                <span className="relative text-[10px] font-bold text-white">{pct > 0 ? `${Math.round(pct)}%` : ""}</span>
                              </>
                            ) : <span className="text-white/10 text-[10px]">—</span>}
                          </div>
                        ))}
                        {/* Separator */}
                        <div className="bg-white/20" />
                        {/* Delegation levels */}
                        {DELEG_LABELS.map((dl, i) => {
                          const delegCount = count > 0 ? rows.filter(r => r[`delegation_n${i}` as keyof MapaRow] as boolean).length : 0;
                          const pct = count > 0 ? delegCount / count * 100 : 0;
                          return (
                            <div key={dl.n} className="bg-[var(--jesuites-blue)] px-1 py-2 text-center relative">
                              {count > 0 && (
                                <>
                                  <div
                                    className={`absolute inset-0 ${dl.color} transition-all duration-500`}
                                    style={{ opacity: pct / 100 * 0.6 }}
                                  />
                                  <span className="relative text-[11px] font-bold text-white">{pct > 0 ? `${Math.round(pct)}%` : ""}</span>
                                </>
                              )}
                              {count === 0 && <span className="text-white/10 text-[10px]">—</span>}
                            </div>
                          );
                        })}
                        <div className="bg-[var(--jesuites-blue)] px-1 py-2 text-center">
                          <span className="text-[10px] font-bold text-white/40">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Debat view */}
            {mapaShowDebat && (
              <div className="flex-1 min-h-0 overflow-auto pb-4">
                {debatePoints.length === 0 && mapaAllData.length > 0 && (
                  <div className="h-full flex flex-col items-center justify-center gap-3">
                    <span className="text-5xl">✓</span>
                    <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Consens general — no hi ha divergències significatives</p>
                  </div>
                )}
                {debatePoints.length === 0 && mapaAllData.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center gap-3">
                    <p className="text-white/30 text-sm font-bold uppercase tracking-widest animate-pulse">Esperant dades del mapa…</p>
                  </div>
                )}
                {debatePoints.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {debatePoints.map((dp, i) => {
                      const yesPct = Math.round(dp.pct);
                      const noPct = 100 - yesPct;
                      const divPct = Math.round(dp.div * 100);
                      // Intensity: how close to 50/50
                      const isMax = dp.div >= 0.9;
                      return (
                        <div key={i} className={`relative rounded-3xl overflow-hidden border ${isMax ? "border-rose-400/40" : "border-amber-400/20"} bg-gradient-to-br from-white/5 to-transparent`}>
                          {/* Top split bar */}
                          <div className="flex h-1.5">
                            <div className="bg-violet-500 transition-all duration-700" style={{ width: `${yesPct}%` }} />
                            <div className="bg-rose-500 flex-1 transition-all duration-700" />
                          </div>

                          <div className="p-5">
                            {/* Tags row */}
                            <div className="flex items-center gap-2 mb-4 flex-wrap">
                              <span className="text-xs font-black text-white bg-white/15 rounded-full px-3 py-1">{dp.course.name}</span>
                              <span className="text-[10px] font-bold text-white/40 bg-white/5 border border-white/10 rounded-full px-2 py-0.5 uppercase tracking-wider">{dp.field.label}</span>
                              {isMax && (
                                <span className="text-[10px] font-black text-rose-300 bg-rose-500/20 border border-rose-400/30 rounded-full px-2 py-0.5 uppercase tracking-wider ml-auto">
                                  Màxim debat
                                </span>
                              )}
                            </div>

                            {/* Split visualization */}
                            <div className="flex items-stretch gap-3 mb-4 bg-white/5 rounded-2xl p-3">
                              <div className="flex flex-col items-center justify-center min-w-[44px]">
                                <span className="text-2xl font-black text-violet-300 leading-none">{yesPct}%</span>
                                <span className="text-[9px] text-violet-300/50 uppercase tracking-wider mt-0.5">Sí</span>
                              </div>
                              <div className="flex-1 flex flex-col justify-center gap-1.5">
                                <div className="relative h-4 rounded-full overflow-hidden bg-white/10">
                                  <div className="absolute inset-y-0 left-0 bg-violet-400/70 rounded-full transition-all duration-700" style={{ width: `${yesPct}%` }} />
                                  {/* Center line */}
                                  <div className="absolute inset-y-0 left-1/2 w-px bg-white/30" />
                                </div>
                                <div className="flex justify-between px-0.5">
                                  <span className="text-[8px] text-white/20">0%</span>
                                  <span className="text-[8px] text-white/40 font-bold">{divPct}% divergència</span>
                                  <span className="text-[8px] text-white/20">100%</span>
                                </div>
                              </div>
                              <div className="flex flex-col items-center justify-center min-w-[44px]">
                                <span className="text-2xl font-black text-rose-300 leading-none">{noPct}%</span>
                                <span className="text-[9px] text-rose-300/50 uppercase tracking-wider mt-0.5">No</span>
                              </div>
                            </div>

                            {/* Question */}
                            <p className="text-sm text-white/85 leading-relaxed">{dp.question}</p>

                            <p className="text-[9px] text-white/20 mt-3 font-bold uppercase tracking-wider">Sobre {dp.n} docents · #{i + 1} per divergència</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ═══ VALIDA — Resum de tots els escenaris ═══ */}
        {phase === "valida" && showValidaSummary && (
          <div className="flex-1 min-h-0 flex flex-col gap-3 overflow-auto">
            <div className="flex items-center justify-between shrink-0">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">Resum de Validació</h2>
              <button
                onClick={() => setShowValidaSummary(false)}
                className="px-4 py-1.5 rounded-xl bg-white/10 text-xs font-bold uppercase tracking-wider hover:bg-white/20 transition-all"
              >
                Tornar
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {VALIDA_SCENARIOS.map((vs, i) => {
                const r = allValidaResults[vs.id];
                const total = r?.total ?? 0;
                const yes = r?.yes ?? 0;
                const no = r?.no ?? 0;
                const yesPct = total > 0 ? Math.round(yes / total * 100) : null;
                const cons = total > 0 ? Math.max(yes, no) / total * 100 : 0;
                const approved = total > 0 && yes > no;
                const consLabel = cons >= 80 ? "Consens" : cons >= 60 ? "Tendència" : total > 0 ? "Debat" : "Sense vots";
                const rowColor = total === 0 ? "border-white/10 bg-white/5"
                  : cons >= 80 ? (approved ? "border-emerald-400/30 bg-emerald-500/10" : "border-rose-400/30 bg-rose-500/10")
                  : cons >= 60 ? "border-amber-400/30 bg-amber-500/10"
                  : "border-rose-400/30 bg-rose-500/15";
                return (
                  <button
                    key={vs.id}
                    onClick={() => { setCurrentIdx(i); setShowValidaSummary(false); }}
                    className={`flex items-center gap-4 px-4 py-3 rounded-2xl border text-left transition-all hover:brightness-110 ${rowColor}`}
                  >
                    <span className="text-white/40 text-xs font-bold w-6 shrink-0">{i + 1}</span>
                    <span className="flex-1 text-sm text-white/80 line-clamp-1">{vs.text}</span>
                    <span className="text-[10px] text-white/40 shrink-0">{vs.context}</span>
                    {total > 0 ? (
                      <>
                        <span className="text-sm font-bold text-emerald-300 shrink-0 w-10 text-right">{yes} Sí</span>
                        <span className="text-sm font-bold text-rose-300 shrink-0 w-10 text-right">{no} No</span>
                        <span className="text-[10px] font-bold shrink-0 w-16 text-center px-2 py-1 rounded-lg bg-white/10">{yesPct}% Sí</span>
                        <span className={`text-[10px] font-bold shrink-0 px-2 py-1 rounded-lg ${
                          cons >= 80 ? "bg-emerald-500/30 text-emerald-200" :
                          cons >= 60 ? "bg-amber-500/30 text-amber-200" :
                          "bg-rose-500/30 text-rose-200"
                        }`}>{consLabel}</span>
                      </>
                    ) : (
                      <span className="text-[10px] text-white/30 font-bold shrink-0">Sense vots</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ CALIBRA / VALIDA — Scenario view ═══ */}
        {phase !== "mapa" && scenario && !showValidaSummary && (
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
              {sessionActive && (
                <span className="text-sm font-bold text-white/50">
                  {phase === "calibra" ? calibraTotal : validaTotal} vots
                </span>
              )}
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
                <div className="bg-emerald-500/20 rounded-3xl p-6 flex flex-col items-center justify-center border border-emerald-400/20 relative">
                  <span className="text-7xl font-bold text-emerald-300">{validaYes}</span>
                  <span className="text-lg font-bold text-emerald-400/80 mt-2">Sí, ho aprovo</span>
                  {validaTotal > 0 && <span className="text-3xl font-bold text-emerald-300/60 mt-1">{Math.round((validaYes / validaTotal) * 100)}%</span>}
                  {validaYesIncon > 0 && (
                    <div className="mt-3 flex items-center gap-1.5 bg-amber-500/20 border border-amber-400/30 rounded-xl px-3 py-1.5">
                      <span className="text-[11px] font-bold text-amber-300">⚠ {validaYesIncon} incoherència{validaYesIncon > 1 ? "s" : ""}</span>
                    </div>
                  )}
                </div>
                <div className="bg-rose-500/20 rounded-3xl p-6 flex flex-col items-center justify-center border border-rose-400/20 relative">
                  <span className="text-7xl font-bold text-rose-300">{validaNo}</span>
                  <span className="text-lg font-bold text-rose-400/80 mt-2">No, ho rebutjo</span>
                  {validaTotal > 0 && <span className="text-3xl font-bold text-rose-300/60 mt-1">{Math.round((validaNo / validaTotal) * 100)}%</span>}
                  {validaNoIncon > 0 && (
                    <div className="mt-3 flex items-center gap-1.5 bg-amber-500/20 border border-amber-400/30 rounded-xl px-3 py-1.5">
                      <span className="text-[11px] font-bold text-amber-300">⚠ {validaNoIncon} incoherència{validaNoIncon > 1 ? "s" : ""}</span>
                    </div>
                  )}
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
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold">
                        {maxPct >= 80 ? "Consens fort" : maxPct >= 60 ? "Tendència clara" : "Divisió — Cal debat!"}
                      </span>
                      {validaFixed > 0 && (
                        <span className="text-[10px] font-bold bg-emerald-500/30 text-emerald-200 px-3 py-1.5 rounded-lg">
                          ✓ {validaFixed} rectificat{validaFixed > 1 ? "s" : ""}
                        </span>
                      )}
                      {(validaYesIncon + validaNoIncon) > 0 && validaFixed === 0 && (
                        <span className="text-[10px] font-bold bg-amber-500/30 text-amber-200 px-3 py-1.5 rounded-lg">
                          ⚠ {validaYesIncon + validaNoIncon} amb incoherència
                        </span>
                      )}
                    </div>
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
          {(() => {
            const expected = activeParticipants > 0 ? activeParticipants : (peakParticipants > 0 ? peakParticipants : totalParticipants);
            const votePct = expected > 0 ? currentScenarioVotes / expected : 0;
            const softBlocked = sessionActive && expected > 0 && votePct < 0.8;
            return (
              <div className="flex items-center gap-2">
                {softBlocked && (
                  <span className="text-[9px] font-bold text-amber-300/70 uppercase tracking-wider">
                    {currentScenarioVotes}/{activeParticipants}
                  </span>
                )}
                {phase === "valida" && currentIdx === scenarios.length - 1 ? (
                  <button
                    onClick={() => setShowValidaSummary(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all bg-violet-500/30 text-violet-200 border border-violet-400/30 hover:bg-violet-500/40"
                  >
                    <BarChart3 size={16} /> Resum
                  </button>
                ) : (
                  <button
                    onClick={goNext}
                    disabled={currentIdx === scenarios.length - 1}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${
                      softBlocked
                        ? "bg-amber-500/20 text-amber-300 border border-amber-400/30 hover:bg-amber-500/30"
                        : "bg-white/10 hover:bg-white/20"
                    } disabled:opacity-20`}
                  >
                    Següent <ChevronRight size={16} />
                  </button>
                )}
              </div>
            );
          })()}
        </div>
          </>
        )}
      </div>
    </main>
  );
}
