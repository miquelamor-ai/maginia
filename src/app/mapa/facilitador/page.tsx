"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { DELEGATION_LEVELS } from "@/lib/data";
import { Sparkles, ChevronRight, ChevronLeft, Eye, EyeOff, Users, BarChart3, RefreshCw, QrCode, X, Map, Clock, Wifi, Plus, Grid3X3, ScrollText, Compass, Layers, Target, GraduationCap, Building2, Scale, CheckCircle, ArrowDown, ArrowUp, MessageSquare, Heart, HelpCircle, AlertCircle, Lightbulb, Minus } from "lucide-react";

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

// Expected maximum delegation level per course (based on developmental progression)
const COURSE_META: Record<string, { ages: string; expectedMax: number }> = {
  "I3-I5":  { ages: "3–5 anys",  expectedMax: 1 },
  "PRI-CI": { ages: "6–8 anys",  expectedMax: 2 },
  "PRI-CM": { ages: "8–10 anys", expectedMax: 3 },
  "PRI-CS": { ages: "10–12 anys",expectedMax: 3 },
  "ESO-1":  { ages: "12–13 anys",expectedMax: 4 },
  "ESO-2":  { ages: "13–14 anys",expectedMax: 4 },
  "ESO-3":  { ages: "14–15 anys",expectedMax: 5 },
  "ESO-4":  { ages: "15–16 anys",expectedMax: 5 },
  "BATX":   { ages: "16–18 anys",expectedMax: 5 },
  "FP-CGM": { ages: "18+ anys",  expectedMax: 5 },
  "FP-CGS": { ages: "18+ anys",  expectedMax: 5 },
};

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

type Phase = "decaleg" | "intro" | "repas" | "calibra" | "mapa" | "valida" | "debate" | "tancament";

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

// ─── DebateHeatmap component ─────────────────────────────────────

function DebateHeatmap({ data, mapNum }: { data: MapaRow[]; mapNum: 1 | 2 | 3 }) {
  const borderColors = ["border-blue-400/30", "border-violet-400/30", "border-rose-400/30"];
  return (
    <div className={`bg-white/5 rounded-2xl border overflow-hidden ${borderColors[mapNum - 1]}`}>
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
        const rows = data.filter(r => r.course_id === course.id);
        const count = rows.length;
        const pctTeacherOut = count > 0 ? rows.filter(r => r.teacher_outside).length / count * 100 : 0;
        const pctTeacherIn  = count > 0 ? rows.filter(r => r.teacher_inside).length  / count * 100 : 0;
        const pctStudent    = count > 0 ? rows.filter(r => r.student_access).length   / count * 100 : 0;
        const pctGuiat   = count > 0 ? rows.filter(r => r.student_modality === "guiat").length   / count * 100 : 0;
        const pctAutonom = count > 0 ? rows.filter(r => r.student_modality === "autonom").length / count * 100 : 0;
        const pctLliure  = count > 0 ? rows.filter(r => r.student_modality === "lliure").length  / count * 100 : 0;
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
            {/* Modalitat */}
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
                      <div className={`absolute inset-0 ${dl.color} transition-all duration-500`} style={{ opacity: pct / 100 * 0.6 }} />
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
  );
}

// ─── Component ───────────────────────────────────────────────────

export default function FacilitadorPage() {
  const [phase, setPhase] = useState<Phase>("decaleg");
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
  const [mapaInitialData, setMapaInitialData] = useState<MapaRow[]>([]);
  const [mapaDebateData, setMapaDebateData] = useState<MapaRow[]>([]);
  const [allValidaResults, setAllValidaResults] = useState<Record<string, { yes: number; no: number; total: number }>>({});
  const [showValidaSummary, setShowValidaSummary] = useState(false);
  const [mapaShowDebat, setMapaShowDebat] = useState(false);
  const [mapaFixCount, setMapaFixCount] = useState(0);
  const [debateRevisionOpen, setDebateRevisionOpen] = useState(false);
  const [debateMapView, setDebateMapView] = useState<1 | 2 | 3>(2);
  const [introStep, setIntroStep] = useState(0);
  const [decalegStep, setDecalegStep] = useState(0);
  const [decalegSubmissions, setDecalegSubmissions] = useState<{session_id: string; principle_1: string; principle_2: string; principle_3: string}[]>([]);
  const [decalegGenerated, setDecalegGenerated] = useState<{orientations: {n: number; title: string; text: string}[]; summary: string} | null>(null);
  const [decalegGenerating, setDecalegGenerating] = useState(false);
  const [tancamentSlide, setTancamentSlide] = useState<0 | 1>(0);
  const [tancamentVotes, setTancamentVotes] = useState<{worry: number; doubt: number; agree: number; inspired: number}>({worry:0,doubt:0,agree:0,inspired:0});

  useEffect(() => {
    setBaseUrl(window.location.origin);
    const params = new URLSearchParams(window.location.search);
    const simId = params.get("sim");
    if (simId) {
      // Simulation mode: load existing session read-only
      setGuidedSessionId(simId);
      setSessionActive(true);
      setPhase("mapa");
    } else {
      // Write directly to Supabase in one shot: new session ID, phase=decaleg, is_active=true
      const newGsId = crypto.randomUUID().slice(0, 8);
      supabase.from("mapa_facilitador_state").update({
        phase: "decaleg",
        current_idx: 0,
        is_active: true,
        guided_session_id: newGsId,
      }).eq("id", 1).then(({ error }) => {
        if (error) console.error("❌ Supabase update failed:", error.message, error.code);
        else console.log("✅ Supabase session started:", newGsId);
        setGuidedSessionId(newGsId);
        setSessionActive(true);
      });
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

    if (phase === "mapa" || phase === "debate") {
      const MAPA_COLS = "session_id, course_id, delegation_n0, delegation_n1, delegation_n2, delegation_n3, delegation_n4, delegation_n5, teacher_outside, teacher_inside, student_access, student_modality";
      // Map 2: current mapa_declarations
      let q2 = supabase.from("mapa_declarations").select(MAPA_COLS);
      if (guidedSessionId) q2 = q2.eq("guided_session_id", guidedSessionId);
      const { data: d2 } = await q2;
      if (d2) {
        const sessions = new Set(d2.map((d: { session_id: string }) => d.session_id));
        setMapaProgress({ participants: sessions.size, declarations: d2.length });
        setTotalParticipants(sessions.size);
        setMapaAllData(d2 as MapaRow[]);
      }
      // Map 1: snapshot pre-valida (only rows where a fix was applied)
      let q1 = supabase.from("mapa_declarations_initial").select(MAPA_COLS);
      if (guidedSessionId) q1 = q1.eq("guided_session_id", guidedSessionId);
      const { data: d1 } = await q1;
      if (d1) {
        // Merge: initial rows where available, fall back to current for unchanged rows
        const fixedKeys = new Set(d1.map((r: { session_id: string; course_id: string }) => `${r.session_id}|${r.course_id}`));
        const unchanged = (d2 ?? []).filter((r: { session_id: string; course_id: string }) => !fixedKeys.has(`${r.session_id}|${r.course_id}`));
        setMapaInitialData([...(d1 as MapaRow[]), ...(unchanged as MapaRow[])]);
      }
      // Map 3: post-debate revisions
      let q3 = supabase.from("mapa_declarations_debate").select(MAPA_COLS);
      if (guidedSessionId) q3 = q3.eq("guided_session_id", guidedSessionId);
      const { data: d3 } = await q3;
      if (d3) {
        // Merge: debate rows where available, fall back to current for non-revised rows
        const revisedKeys = new Set(d3.map((r: { session_id: string; course_id: string }) => `${r.session_id}|${r.course_id}`));
        const nonRevised = (d2 ?? []).filter((r: { session_id: string; course_id: string }) => !revisedKeys.has(`${r.session_id}|${r.course_id}`));
        setMapaDebateData([...(d3 as MapaRow[]), ...(nonRevised as MapaRow[])]);
      }
      return;
    }
    if (phase === "decaleg") {
      let q = supabase.from("mapa_decaleg_submissions").select("session_id, principle_1, principle_2, principle_3");
      if (guidedSessionId) q = q.eq("guided_session_id", guidedSessionId);
      const { data } = await q;
      if (data) setDecalegSubmissions(data as typeof decalegSubmissions);
      return;
    }
    if (phase === "tancament") {
      let q = supabase.from("mapa_tancament_votes").select("vote_type");
      if (guidedSessionId) q = q.eq("guided_session_id", guidedSessionId);
      const { data } = await q;
      if (data) {
        const counts = { worry: 0, doubt: 0, agree: 0, inspired: 0 };
        for (const v of data as {vote_type: string}[]) {
          if (v.vote_type in counts) counts[v.vote_type as keyof typeof counts]++;
        }
        setTancamentVotes(counts);
      }
      // Also load saved decaleg if available
      const { data: fsData } = await supabase.from("mapa_facilitador_state").select("decaleg_json").eq("id", 1).single();
      if (fsData?.decaleg_json) {
        try { setDecalegGenerated(JSON.parse(fsData.decaleg_json)); } catch {}
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

  const switchPhase = useCallback((p: Phase) => {
    setPhase(p);
    setCurrentIdx(0);
    if (p === "decaleg") setDecalegStep(0);
    setIsRevealed(false);
    setIntroStep(0);
    // Always broadcast so participants know when to redirect
    if (sessionActive) broadcastState(p, 0, true);
  }, [sessionActive, broadcastState]);

  // ─── Keyboard navigation ────────────────────────────────────

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Don't intercept when user is typing
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      const isNext = e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ";
      const isPrev = e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "PageUp";
      if (!isNext && !isPrev) return;
      e.preventDefault();

      // Intro: advance/retreat layers; use captured value (not functional updater)
      // to avoid stale-closure counter overflow bug with key repeat
      if (phase === "intro") {
        if (isNext) { if (introStep >= 5) switchPhase("repas"); else setIntroStep(introStep + 1); }
        else setIntroStep(Math.max(0, introStep - 1));
        return;
      }
      // Tancament: switch between slides
      if (phase === "tancament") {
        if (isNext) setTancamentSlide(s => Math.min(1, s + 1) as 0 | 1);
        else setTancamentSlide(s => Math.max(0, s - 1) as 0 | 1);
        return;
      }
      // decaleg: step 0 → step 1 → intro (Ruta); use captured value
      if (phase === "decaleg") {
        if (isNext) { if (decalegStep >= 1) switchPhase("intro"); else setDecalegStep(decalegStep + 1); }
        else setDecalegStep(Math.max(0, decalegStep - 1));
        return;
      }
      // repas: → calibra, ← intro
      if (phase === "repas") {
        if (isNext) switchPhase("calibra");
        else switchPhase("intro");
        return;
      }
      // mapa / debate — no arrow nav
      if (phase === "mapa" || phase === "debate") return;

      // calibra / valida — scenario navigation + Space to reveal
      if (isNext) goNext();
      else goPrev();
      if (e.key === " ") setIsRevealed(r => !r);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev, phase, introStep, decalegStep, switchPhase, setIntroStep, setDecalegStep, setTancamentSlide]);

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

  // Sync introStep to Supabase so participants can follow along
  useEffect(() => {
    if (phase === "intro" && sessionActive) {
      broadcastState("intro", introStep, true);
    }
  }, [introStep, phase, sessionActive, broadcastState]);

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

  const DEBATE_FIELDS: { key: keyof MapaRow; label: string; question: (c: string, pct: number, cid: string) => string }[] = [
    {
      key: "teacher_outside", label: "Docent fora",
      question: (c, p, cid) => {
        const { ages } = COURSE_META[cid] ?? { ages: "" };
        const isYoung = ["I3-I5", "PRI-CI", "PRI-CM"].includes(cid);
        if (isYoung) return p >= 50
          ? `Al ${c}, uns docents preparen materials amb IA per a nens de ${ages}. La IA tendeix a proposar contingut massa abstracte per a aquesta edat? Com filtreu o adapteu el que genera perquè sigui realment adequat?`
          : `Al ${c}, la majoria no usa la IA per preparar per a ${ages}. Creieu que la IA no coneix prou bé el desenvolupament cognitiu d'aquesta etapa — o és una qüestió de confiança i temps?`;
        return p >= 50
          ? `Al ${c}, la majoria prepareu o corregiu amb IA, però alguns docents no. Quan la preparació assistida millora realment la classe — i quan pot fer que el docent s'allunyi de la realitat de l'aula?`
          : `Al ${c}, la majoria no usa la IA fora de classe. Quins obstacles —de temps, de confiança o ètics— ho expliquen? Quins beneficis concrets podria aportar a la vostra pràctica?`;
      },
    },
    {
      key: "teacher_inside", label: "Docent dins",
      question: (c, p, cid) => {
        const { ages } = COURSE_META[cid] ?? { ages: "" };
        const isYoung = ["I3-I5", "PRI-CI"].includes(cid);
        if (isYoung) return `Al ${c}, hi ha divisió sobre si el docent usa la IA davant d'alumnes de ${ages}. Quin marc conceptual doneu als infants per entendre el que veuen? Com eviteu que percebin la IA com un oracle infalible?`;
        return p >= 50
          ? `Al ${c}, molts feu servir la IA dins l'aula, però no tots. Quan mostrar-la en directe és un model pedagògic vàlid — i quan podria normalitzar la dependència sense sentit crític?`
          : `Al ${c}, pocs docents usen la IA directament a l'aula. Quin valor pedagògic afegeix mostrar-la en viu? Quins riscos veieu en introduir-la sense un protocol clar?`;
      },
    },
    {
      key: "student_access", label: "Alumnat accés",
      question: (c, p, cid) => {
        const { ages } = COURSE_META[cid] ?? { ages: "" };
        if (cid === "I3-I5") return p >= 50
          ? `Al ${c}, alguns docents permeten que nens de ${ages} interactuïn directament amb la IA. En quin context concret té sentit — i com garantiu que l'infant no ho percep com un oracle que sempre té raó?`
          : `Al ${c}, la majoria descarta l'accés directe per a ${ages}. En quina condició molt específica canviaria la vostra postura? Quin seria el primer pas previ imprescindible?`;
        if (["PRI-CI", "PRI-CM"].includes(cid)) return p >= 50
          ? `Al ${c}, uns docents donen accés a la IA per a alumnes de ${ages}. Quin tipus d'interacció considereu adequada — dictar, preguntar, explorar? Quines competències de lectura crítica necessiten primer?`
          : `Al ${c}, la majoria no dóna accés a la IA a ${ages}. Quina fita de maduresa cognitiva espereu que assoleixin — i com la mesureu?`;
        return p >= 50
          ? `Al ${c}, la majoria creieu que l'alumnat hauria de tenir accés directe, però no tots. Quines competències prèvies hauria de demostrar l'alumne — i qui hauria de verificar-ho?`
          : `Al ${c}, la majoria no dóna accés a l'alumnat. Quin aprenentatge es perdria si s'obrís l'accés? En quin context o tasca concreta canviaria la vostra resposta?`;
      },
    },
    {
      key: "delegation_n0", label: "N0 Preservació",
      question: (c, p, cid) => {
        const { ages, expectedMax } = COURSE_META[cid] ?? { ages: "", expectedMax: 3 };
        if (expectedMax <= 2) return p >= 50
          ? `Al ${c}, la majoria preserva espais sense IA per a ${ages}, coherent amb l'etapa. Qui descarta N0-Preservació per a nens d'aquesta edat — i quin argument pedagògic al·lega?`
          : `Al ${c}, una part descarta N0-Preservació per a ${ages}. Significa que creieu que la tecnologia ja és inevitable en qualsevol context — o que la preservació és irreal a la pràctica?`;
        return `Al ${c}, no coincidiu sobre si cal preservar espais totalment lliures de IA. Quines activitats del curs perden valor pedagògic si s'hi permet la IA — i qui ha de prendre aquesta decisió: el docent, el departament o el centre?`;
      },
    },
    {
      key: "delegation_n1", label: "N1 Exploració",
      question: (c, p, cid) => {
        const { ages, expectedMax } = COURSE_META[cid] ?? { ages: "", expectedMax: 3 };
        if (expectedMax >= 3) return p >= 50
          ? `Al ${c}, uns docents descarten N1-Exploració com a nivell adequat per a ${ages}. Creieu que és massa poc per a aquesta edat — o que sense estructura clara l'alumne acaba usant la IA per delegar sense adonar-se'n?`
          : `Al ${c}, una part rebutja N1-Exploració. Per a alumnes de ${ages}, quan la IA inspira és una ajuda pedagògica — i quan substitueix l'esforç de generar preguntes o idees pròpies?`;
        return `Al ${c}, hi ha divisió sobre N1-Exploració per a ${ages}. Com distingiu a la pràctica quan la IA ha inspirat l'alumne i quan li ha estalviat l'esforç de formular les seves pròpies preguntes?`;
      },
    },
    {
      key: "delegation_n2", label: "N2 Suport",
      question: (c, _p, cid) => {
        const { ages, expectedMax } = COURSE_META[cid] ?? { ages: "", expectedMax: 3 };
        if (expectedMax < 2) return `Al ${c}, hi ha qui admet N2-Suport per a nens de ${ages}. Usar la IA per millorar textos propis té sentit quan l'alumne ja domina l'escriptura — però a ${ages}, quines garanties hi ha que el text sigui realment seu i no dictat?`;
        return `Al ${c}, no acordeu fins on arriba N2-Suport per a ${ages}. Poseu un exemple concret d'una tasca on usar la IA per corregir o millorar és legítim — i un altre on ja seria una substitució del treball cognitiu de l'alumne.`;
      },
    },
    {
      key: "delegation_n3", label: "N3 Cocreació",
      question: (c, p, cid) => {
        const { ages, expectedMax } = COURSE_META[cid] ?? { ages: "", expectedMax: 3 };
        const diff = 3 - expectedMax;
        if (diff > 0) return p >= 50
          ? `Al ${c}, uns docents admeten N3-Cocreació per a ${ages}, quan la progressió esperada és N${expectedMax}. En quina tasca concreta creieu que un alumne d'aquesta edat pot alternar genuïnament el lideratge amb la IA? Quins indicadors us ho confirmarien?`
          : `Al ${c}, la majoria descarta N3-Cocreació per a ${ages}, coherent amb l'etapa. Quin argument al·leguen els que l'admeten — i en quines condicions excepcionals tindria sentit?`;
        return p >= 50
          ? `Al ${c}, esteu dividits sobre N3-Cocreació per a ${ages}. Com podeu saber, en avaluar un treball cocreat, quina part és genuïnament de l'alumne? Quin domini del contingut hauria de demostrar prèviament?`
          : `Al ${c}, uns docents descarten N3-Cocreació tot i ser l'edat esperada. Quines condicions del vostre context —ratio, equipament, cultura digital— fan que sigueu més restrictius?`;
      },
    },
    {
      key: "delegation_n4", label: "N4 Delegació",
      question: (c, p, cid) => {
        const { ages, expectedMax } = COURSE_META[cid] ?? { ages: "", expectedMax: 3 };
        const diff = 4 - expectedMax;
        if (diff > 1) return p >= 50
          ? `Al ${c}, uns docents admeten N4-Delegació per a ${ages}, quan la progressió esperada és N${expectedMax}. Si la IA genera el producte, quines evidències d'aprenentatge queden? Com avalueu el criteri crític de l'alumne d'aquesta edat sobre el que la IA ha produït?`
          : `Al ${c}, la majoria descarta N4-Delegació per a ${ages}. Quin argument al·leguen els que l'admeten — és una decisió pedagògica o una normalització de la comoditat?`;
        if (diff === 1) return p >= 50
          ? `Al ${c}, uns docents consideren N4-Delegació possible per a ${ages}, un pas per sobre del nivell esperat. En quines tasques específiques té sentit que la IA generi i l'alumne supervisi — i quines competències crítiques necessita prèviament?`
          : `Al ${c}, uns docents descarten N4-Delegació per a ${ages}. Quins riscos pedagògics específics veieu quan la IA genera el gruix del producte en aquesta etapa?`;
        return p >= 50
          ? `Al ${c}, hi ha divisió sobre N4-Delegació per a ${ages}. En quin tipus de tasca té sentit que la IA produeixi i l'alumne avaluï — i com mesures l'aprenentatge real si l'alumne no ha generat el contingut?`
          : `Al ${c}, una part descarta N4-Delegació tot i ser esperable per a ${ages}. Quines condicions del vostre context fan que sigueu més restrictius — és una decisió conscient o de recursos?`;
      },
    },
    {
      key: "delegation_n5", label: "N5 Agència",
      question: (c, p, cid) => {
        const { ages, expectedMax } = COURSE_META[cid] ?? { ages: "", expectedMax: 3 };
        const diff = 5 - expectedMax;
        if (diff > 1) return p >= 50
          ? `Al ${c}, uns docents admeten N5-Agència per a ${ages}, on la IA opera autònomament. Per a alumnes d'aquesta edat, quins mecanismes de supervisió garantirien que no és simplement "deixar fer" la IA sense comprensió ni judici?`
          : `Al ${c}, la majoria descarta N5-Agència per a ${ages}, coherent amb l'etapa. En quin context molt excepcional podria tenir sentit — i quin tipus de metacognició exigiríeu a l'alumne?`;
        if (["FP-CGM", "FP-CGS"].includes(cid)) return p >= 50
          ? `Al ${c}, uns docents descarten N5-Agència per a professionals de ${ages}, quan hauria de ser el nivell esperat en formació professional. Quins arguments pedagògics justifiquen no arribar-hi — és una qüestió de currículum, d'avaluació o de cultura del centre?`
          : `Al ${c}, no tots admeten N5-Agència per a ${ages}. Per a futurs professionals, operar amb sistemes autònoms d'IA és una competència clau — quin argument pedagògic justifica no preparar-los per a això?`;
        return p >= 50
          ? `Al ${c}, hi ha divisió sobre N5-Agència per a ${ages}. Si la IA opera autònomament, què s'avalua exactament — la capacitat de dissenyar el marc, d'interpretar resultats, o tots dos? On poseu el límit perquè no sigui pur outsourcing?`
          : `Al ${c}, uns docents descarten N5-Agència per a ${ages}. En quines condicions —maduresa, context, avaluació— seria acceptable que la IA operi autònomament en tasques d'aquesta etapa?`;
      },
    },
  ];

  // div = 1 - |pct - 50| / 50  →  1.0 = 50/50 split, 0.2 = 90% consensus, 0.0 = 100% consensus
  const DEBATE_THRESHOLD = 0.2; // show anything below ~90% consensus

  const booleanDebatePoints = COURSES.flatMap(course => {
    const rows = mapaAllData.filter(r => r.course_id === course.id);
    const n = rows.length;
    if (n < 2) return [];
    return DEBATE_FIELDS.flatMap(f => {
      const yes = rows.filter(r => r[f.key] as boolean).length;
      const pct = yes / n * 100;
      const div = 1 - Math.abs((pct - 50) / 50);
      if (div < DEBATE_THRESHOLD) return [];
      return [{ course, field: f, pct, div, n, question: f.question(course.name, pct, course.id), modSplit: null as null | { pres: number; hyb: number; onl: number } }];
    });
  });

  // student_modality is a string field — analyse it separately
  const modalityDebatePoints = COURSES.flatMap(course => {
    const rows = mapaAllData.filter(r => r.course_id === course.id && r.student_access && r.student_modality);
    const n = rows.length;
    if (n < 2) return [];
    const pres = rows.filter(r => r.student_modality === "presencial").length;
    const hyb  = rows.filter(r => r.student_modality === "hybrid").length;
    const onl  = rows.filter(r => r.student_modality === "online").length;
    const maxCount = Math.max(pres, hyb, onl);
    const div = 1 - maxCount / n; // 0 = consensus, ~0.67 = even 3-way split
    if (div < DEBATE_THRESHOLD) return [];
    const presPct = Math.round(pres / n * 100);
    const hybPct  = Math.round(hyb  / n * 100);
    const onlPct  = Math.round(onl  / n * 100);
    const { ages } = COURSE_META[course.id] ?? { ages: "" };
    return [{
      course,
      field: { key: "student_modality" as keyof MapaRow, label: "Model alumnat", question: () => "" },
      pct: presPct,
      div,
      n,
      question: `Al ${course.name}, no coincidiu en el model d'accés de l'alumnat de ${ages} a la IA: ${presPct}% presencial, ${hybPct}% híbrid, ${onlPct}% en línia. Quin model afavoreix millor l'autonomia progressiva — o depèn del tipus de tasca i del perfil de l'alumne?`,
      modSplit: { pres: presPct, hyb: hybPct, onl: onlPct },
    }];
  });

  const debatePoints = [...booleanDebatePoints, ...modalityDebatePoints]
    .sort((a, b) => b.div - a.div);

  // ─── Render ────────────────────────────────────────────────────
  const isCream = ["decaleg","intro","repas","tancament"].includes(phase);
  const inactiveTab = isCream
    ? "bg-[var(--jesuites-blue)]/[0.07] text-[var(--jesuites-blue)]/40 hover:bg-[var(--jesuites-blue)]/[0.14]"
    : "bg-white/10 text-white/50 hover:bg-white/20";
  const controlBg = isCream ? "bg-[var(--jesuites-blue)]/[0.07] border-[var(--jesuites-blue)]/20" : "bg-white/10 border-white/10";
  const controlText = isCream ? "text-[var(--jesuites-blue)]/60" : "text-white/70";

  return (
    <main className={`h-screen font-sans select-none overflow-hidden transition-colors duration-300 ${isCream ? "bg-[var(--jesuites-cream)] text-[var(--jesuites-text)]" : "bg-[var(--jesuites-blue)] text-white"}`}>
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
          <div className="flex items-center gap-2">
            <Sparkles size={18} className={isCream ? "text-[var(--jesuites-blue)]/30" : "text-white/30"} />
            <button
              onClick={() => switchPhase("decaleg")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${phase === "decaleg" ? "bg-[var(--jesuites-blue)] text-white shadow-lg" : inactiveTab}`}
            >
              <ScrollText size={12} /> Decàleg
            </button>
            <button
              onClick={() => switchPhase("intro")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${phase === "intro" ? "bg-[var(--jesuites-blue)] text-white shadow-lg" : inactiveTab}`}
            >
              <Compass size={12} /> Ruta
            </button>
            <button
              onClick={() => switchPhase("repas")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${phase === "repas" ? "bg-[var(--jesuites-blue)] text-white shadow-lg" : inactiveTab}`}
            >
              <Layers size={12} /> Nivells
            </button>
            <button
              onClick={() => switchPhase("calibra")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${phase === "calibra" ? "bg-white text-[var(--jesuites-blue)] shadow-lg" : inactiveTab}`}
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
              className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${phase === "mapa" ? "bg-white text-[var(--jesuites-blue)] shadow-lg" : inactiveTab}`}
            >
              Mapa
            </button>
            <button
              onClick={() => switchPhase("valida")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${phase === "valida" ? "bg-white text-[var(--jesuites-blue)] shadow-lg" : inactiveTab}`}
            >
              Valida
            </button>
            <button
              onClick={() => switchPhase("debate")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${phase === "debate" ? "bg-white text-[var(--jesuites-blue)] shadow-lg" : inactiveTab}`}
            >
              Debat
            </button>
            <button
              onClick={() => switchPhase("tancament")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${phase === "tancament" ? "bg-[var(--jesuites-blue)] text-white shadow-lg" : inactiveTab}`}
            >
              <MessageSquare size={12} /> Tancament
            </button>
          </div>
          {/* Right: controls */}
          <div className="flex items-center gap-2">
            {/* Active participants (heartbeat) */}
            {sessionActive && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${controlBg}`}>
                <Wifi size={13} className={controlText} />
                <span className={`text-sm font-bold ${controlText}`}>{activeParticipants}</span>
              </div>
            )}
            {/* Vote counter — only for calibra/valida */}
            {sessionActive && (phase === "calibra" || phase === "valida") && (() => {
              const expected = activeParticipants > 0 ? activeParticipants : (peakParticipants > 0 ? peakParticipants : totalParticipants);
              const allVoted = expected > 0 && currentScenarioVotes >= expected;
              const mostVoted = expected > 0 && currentScenarioVotes >= Math.ceil(expected * 0.8);
              return (
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
                  allVoted ? "bg-emerald-500/20 border-emerald-400/30"
                  : mostVoted ? "bg-amber-500/20 border-amber-400/30"
                  : controlBg
                }`}>
                  <BarChart3 size={13} className={allVoted ? "text-emerald-500" : mostVoted ? "text-amber-500" : controlText} />
                  <span className={`text-sm font-bold ${allVoted ? "text-emerald-600" : mostVoted ? "text-amber-600" : controlText}`}>{currentScenarioVotes}/{expected}</span>
                </div>
              );
            })()}
            {sessionActive && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${controlBg}`}>
                <Users size={13} className={controlText} />
                <span className={`text-sm font-bold ${controlText}`}>{totalParticipants}</span>
              </div>
            )}
            <button onClick={() => setShowQR(true)} className={`p-2 rounded-xl transition-all ${controlBg} ${controlText} hover:opacity-80`}>
              <QrCode size={15} />
            </button>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-xl transition-all ${autoRefresh ? "bg-emerald-500/20 text-emerald-600" : `${controlBg} ${controlText}`}`}
            >
              <RefreshCw size={13} className={autoRefresh ? "animate-spin" : ""} style={autoRefresh ? { animationDuration: "3s" } : {}} />
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
            {!mapaShowHeatmap && !mapaShowDebat && (
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
                      const isMax = dp.div >= 0.9;
                      const isModality = dp.modSplit !== null;
                      const borderColor = isMax ? "border-rose-400/40" : dp.div >= 0.4 ? "border-amber-400/25" : "border-white/10";
                      return (
                        <div key={i} className={`relative rounded-3xl overflow-hidden border ${borderColor} bg-gradient-to-br from-white/5 to-transparent`}>
                          {/* Top split bar */}
                          {isModality && dp.modSplit ? (
                            <div className="flex h-1.5">
                              <div className="bg-blue-400 transition-all duration-700" style={{ width: `${dp.modSplit.pres}%` }} />
                              <div className="bg-violet-500 transition-all duration-700" style={{ width: `${dp.modSplit.hyb}%` }} />
                              <div className="bg-emerald-500 flex-1 transition-all duration-700" />
                            </div>
                          ) : (
                            <div className="flex h-1.5">
                              <div className="bg-violet-500 transition-all duration-700" style={{ width: `${yesPct}%` }} />
                              <div className="bg-rose-500 flex-1 transition-all duration-700" />
                            </div>
                          )}

                          <div className="p-4">
                            {/* Tags row */}
                            <div className="flex items-center gap-2 mb-3 flex-wrap">
                              <span className="text-xs font-black text-white bg-white/15 rounded-full px-3 py-1">{dp.course.name}</span>
                              <span className="text-[10px] font-bold text-white/40 bg-white/5 border border-white/10 rounded-full px-2 py-0.5 uppercase tracking-wider">{dp.field.label}</span>
                              {isMax && (
                                <span className="text-[10px] font-black text-rose-300 bg-rose-500/20 border border-rose-400/30 rounded-full px-2 py-0.5 uppercase tracking-wider ml-auto">
                                  Màxim debat
                                </span>
                              )}
                            </div>

                            {/* Split visualization */}
                            {isModality && dp.modSplit ? (
                              <div className="flex items-center gap-2 mb-3 bg-white/5 rounded-2xl px-3 py-2">
                                {[
                                  { label: "Presencial", pct: dp.modSplit.pres, color: "text-blue-300" },
                                  { label: "Híbrid",     pct: dp.modSplit.hyb,  color: "text-violet-300" },
                                  { label: "Online",     pct: dp.modSplit.onl,  color: "text-emerald-300" },
                                ].map(m => (
                                  <div key={m.label} className="flex-1 text-center">
                                    <div className={`text-xl font-black leading-none ${m.color}`}>{m.pct}%</div>
                                    <div className="text-[8px] text-white/30 uppercase tracking-wider mt-0.5">{m.label}</div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex items-stretch gap-3 mb-3 bg-white/5 rounded-2xl p-3">
                                <div className="flex flex-col items-center justify-center min-w-[40px]">
                                  <span className="text-xl font-black text-violet-300 leading-none">{yesPct}%</span>
                                  <span className="text-[9px] text-violet-300/50 uppercase tracking-wider mt-0.5">Sí</span>
                                </div>
                                <div className="flex-1 flex flex-col justify-center gap-1.5">
                                  <div className="relative h-3 rounded-full overflow-hidden bg-white/10">
                                    <div className="absolute inset-y-0 left-0 bg-violet-400/70 rounded-full transition-all duration-700" style={{ width: `${yesPct}%` }} />
                                    <div className="absolute inset-y-0 left-1/2 w-px bg-white/30" />
                                  </div>
                                  <span className="text-[8px] text-white/35 font-bold text-center">{divPct}% divergència</span>
                                </div>
                                <div className="flex flex-col items-center justify-center min-w-[40px]">
                                  <span className="text-xl font-black text-rose-300 leading-none">{noPct}%</span>
                                  <span className="text-[9px] text-rose-300/50 uppercase tracking-wider mt-0.5">No</span>
                                </div>
                              </div>
                            )}

                            {/* Question */}
                            <p className="text-sm text-white/85 leading-relaxed">{dp.question}</p>
                            <p className="text-[9px] text-white/20 mt-2 font-bold uppercase tracking-wider">Sobre {dp.n} docents · #{i + 1} per divergència</p>
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

        {/* ═══ DEBATE PHASE — 3 Maps ═══ */}
        {phase === "debate" && (
          <div className="flex-1 min-h-0 flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-white">3 Mapes de Delegació</h2>
                <span className="text-sm text-white/40">{mapaProgress.participants} docents</span>
              </div>
              {/* Open/close debate revision for participants */}
              <button
                onClick={async () => {
                  const next = !debateRevisionOpen;
                  setDebateRevisionOpen(next);
                  await supabase.from("mapa_facilitador_state")
                    .update({ debate_revision_open: next, phase: "debate" })
                    .eq("id", 1);
                }}
                className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                  debateRevisionOpen
                    ? "bg-amber-400 text-[var(--jesuites-blue)] shadow-lg"
                    : "bg-white/10 text-white/50 hover:bg-white/20"
                }`}
              >
                {debateRevisionOpen ? "✓ Revisió oberta als participants" : "Obrir revisió als participants"}
              </button>
            </div>

            {/* Map selector */}
            <div className="flex gap-2 shrink-0">
              {([1, 2, 3] as const).map(n => {
                const labels = ["Mapa 1 · Inicial", "Mapa 2 · Post-valida", "Mapa 3 · Post-debat"];
                const counts = [mapaInitialData.length, mapaAllData.length, mapaDebateData.length];
                const colors = [
                  n === debateMapView ? "bg-blue-400 text-[var(--jesuites-blue)]" : "bg-white/10 text-white/40 hover:bg-white/20",
                  n === debateMapView ? "bg-violet-400 text-[var(--jesuites-blue)]" : "bg-white/10 text-white/40 hover:bg-white/20",
                  n === debateMapView ? "bg-rose-400 text-white" : "bg-white/10 text-white/40 hover:bg-white/20",
                ];
                return (
                  <button key={n} onClick={() => setDebateMapView(n)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${colors[n-1]}`}
                  >
                    {labels[n-1]}
                    <span className="text-[9px] opacity-60">{counts[n-1]} decl.</span>
                  </button>
                );
              })}
            </div>

            {/* Heatmap for selected map */}
            {(() => {
              const data = debateMapView === 1 ? mapaInitialData : debateMapView === 2 ? mapaAllData : mapaDebateData;
              if (data.length === 0) return (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-white/30 text-sm font-bold uppercase tracking-widest animate-pulse">
                    {debateMapView === 3 && !debateRevisionOpen
                      ? "Obre la revisió als participants per generar el Mapa 3"
                      : debateMapView === 1
                        ? "El Mapa 1 es genera quan els participants fan correccions al Valida"
                        : "Sense dades"}
                  </p>
                </div>
              );
              return (
                <div className="flex-1 min-h-0 overflow-auto">
                  <DebateHeatmap data={data} mapNum={debateMapView} />
                </div>
              );
            })()}
          </div>
        )}

        {/* ═══ DECÀLEG PHASE ═══ */}
        {phase === "decaleg" && decalegStep === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-8">
            <div className="bg-[var(--jesuites-blue)] rounded-3xl p-8 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrApiUrl} alt="QR Code" width={280} height={280} className="rounded-xl" />
            </div>
            <div className="text-center">
              <p className="text-[var(--jesuites-blue)] text-2xl font-bold font-mono tracking-wide mb-2">
                {participantUrl.replace(/^https?:\/\//, '')}
              </p>
              {guidedSessionId && (
                <p className="text-[var(--jesuites-blue)]/50 text-sm font-bold uppercase tracking-[0.2em]">
                  Sessió: {guidedSessionId}
                </p>
              )}
            </div>
            <p className="text-[var(--jesuites-blue)]/30 text-xs font-bold uppercase tracking-[0.3em]">
              Premeu → per obrir la recollida de principis
            </p>
          </div>
        )}
        {phase === "decaleg" && decalegStep === 1 && (
          <div className="flex-1 min-h-0 flex flex-col gap-3">
            <div className="flex-1 min-h-0 flex gap-6 overflow-hidden">
            {/* Left: submissions */}
            <div className="w-80 shrink-0 flex flex-col gap-3">
              <div className="flex items-center justify-between shrink-0">
                <h3 className="text-sm font-bold text-[var(--jesuites-blue)] uppercase tracking-wider">Aportacions rebudes</h3>
                <span className="text-xs font-bold bg-[var(--jesuites-blue)] text-white px-2 py-1 rounded-lg">{decalegSubmissions.length}</span>
              </div>
              <div className="flex-1 min-h-0 overflow-auto flex flex-col gap-2">
                {decalegSubmissions.length === 0 && (
                  <p className="text-sm text-gray-400 text-center mt-8 animate-pulse">Esperant aportacions dels participants…</p>
                )}
                {decalegSubmissions.map((s, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-black/[0.06] p-3 shadow-sm">
                    <p className="text-[10px] font-bold text-[var(--jesuites-blue)]/40 uppercase tracking-wider mb-1">Participant {i + 1}</p>
                    {[s.principle_1, s.principle_2, s.principle_3].map((p, pi) => (
                      <p key={pi} className="text-xs text-gray-700 leading-snug mb-1 pl-2 border-l-2 border-[var(--jesuites-blue)]/20">{p}</p>
                    ))}
                  </div>
                ))}
              </div>
              {decalegSubmissions.length > 0 && (
                <button
                  onClick={async () => {
                    setDecalegGenerating(true);
                    try {
                      const marcRes = await fetch("/marc_general_ia.md").catch(() => null);
                      const marcText = marcRes ? await marcRes.text() : "";
                      const res = await fetch("/api/decaleg/synthesize", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ submissions: decalegSubmissions, marcContext: marcText }),
                      });
                      const data = await res.json();
                      if (data.orientations) {
                        setDecalegGenerated(data);
                        await supabase.from("mapa_facilitador_state")
                          .update({ decaleg_json: JSON.stringify(data) }).eq("id", 1);
                      }
                    } catch (e) { console.error(e); }
                    setDecalegGenerating(false);
                  }}
                  disabled={decalegGenerating}
                  className="shrink-0 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[var(--jesuites-blue)] text-white text-xs font-bold uppercase tracking-wider disabled:opacity-50 hover:brightness-110 transition-all"
                >
                  {decalegGenerating ? "Generant…" : `Generar decàleg (${decalegSubmissions.length} × 3)`}
                </button>
              )}
            </div>

            {/* Right: generated decaleg */}
            <div className="flex-1 min-h-0 overflow-auto">
              {!decalegGenerated && (
                <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
                  <div className="grid grid-cols-2 gap-3 w-full max-w-2xl opacity-40">
                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                      <div key={n} className="h-16 rounded-2xl bg-[var(--jesuites-blue)]/10 border border-[var(--jesuites-blue)]/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-[var(--jesuites-blue)]/40">{n}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">El decàleg apareixerà aquí</p>
                </div>
              )}
              {decalegGenerated && (
                <div>
                  {decalegGenerated.summary && (
                    <div className="mb-4 bg-[var(--jesuites-blue)]/5 border border-[var(--jesuites-blue)]/10 rounded-2xl px-4 py-3">
                      <p className="text-xs font-bold text-[var(--jesuites-blue)] uppercase tracking-wider mb-1">Consens dels docents</p>
                      <p className="text-sm text-[var(--jesuites-text)]/70 italic">{decalegGenerated.summary}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    {decalegGenerated.orientations.map(item => (
                      <div key={item.n} className="bg-white rounded-2xl border border-black/[0.06] p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                          <span className="shrink-0 w-7 h-7 rounded-lg bg-[var(--jesuites-blue)] text-white text-xs font-black flex items-center justify-center">{item.n}</span>
                          <div>
                            <p className="text-sm font-bold text-[var(--jesuites-blue)] mb-1">{item.title}</p>
                            <p className="text-xs text-gray-600 leading-relaxed">{item.text}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            </div>
          {/* Navigation */}
          <div className="flex items-center justify-between shrink-0 border-t border-[var(--jesuites-blue)]/10 pt-3">
            <button
              onClick={() => setDecalegStep(0)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--jesuites-blue)]/10 text-[var(--jesuites-blue)] text-sm font-bold uppercase tracking-wider hover:bg-[var(--jesuites-blue)]/20 transition-all"
            >
              <ChevronLeft size={16} /> Decàleg
            </button>
            <button
              onClick={() => switchPhase("tancament")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--jesuites-blue)] text-white text-sm font-bold uppercase tracking-wider hover:brightness-110 transition-all"
            >
              Tancament <ChevronRight size={16} />
            </button>
          </div>
          </div>
        )}

        {/* ═══ INTRO PHASE — Full de ruta ═══ */}
        {phase === "intro" && (() => {
          const LAYERS = [
            {
              id: "visio",
              icon: <Target size={28} className="text-[var(--jesuites-blue)]" />,
              tag: "HORITZÓ",
              title: "La IA augmenta l'aprenentatge",
              subtitle: "Integrada a la gestió, la docència i l'aprenentatge — de manera ètica, segura i humanista",
              accent: "bg-emerald-100 border-emerald-300",
              tagColor: "text-emerald-700 bg-emerald-100",
            },
            {
              id: "alumnat",
              icon: <GraduationCap size={28} className="text-[var(--jesuites-blue)]" />,
              tag: "ALUMNAT",
              title: "Fluïdeses en IA — les 4D",
              subtitle: "Delegació · Descripció · Discerniment · Diligència",
              accent: "bg-violet-50 border-violet-200",
              tagColor: "text-violet-700 bg-violet-100",
            },
            {
              id: "activitats",
              icon: <ScrollText size={28} className="text-[var(--jesuites-blue)]" />,
              tag: "A L'AULA",
              title: "Activitats on la IA té un rol",
              subtitle: "Tasques dissenyades perquè l'alumne pensi, creï i discerneixi amb la IA com a eina",
              accent: "bg-blue-50 border-blue-200",
              tagColor: "text-blue-700 bg-blue-100",
            },
            {
              id: "docents",
              icon: <Users size={28} className="text-[var(--jesuites-blue)]" />,
              tag: "DOCENTS",
              title: "Disseny · Materials · Formació",
              subtitle: "Per dissenyar bé cal temps, criteris clars i acompanyament",
              accent: "bg-amber-50 border-amber-200",
              tagColor: "text-amber-700 bg-amber-100",
            },
            {
              id: "criteris",
              icon: <Scale size={28} className="text-[var(--jesuites-blue)]" />,
              tag: "PONT",
              title: "Criteris i orientacions",
              subtitle: null,
              accent: "bg-rose-50 border-rose-300",
              tagColor: "text-rose-700 bg-rose-100",
              special: true,
            },
            {
              id: "avui",
              icon: <Map size={28} className="text-white" />,
              tag: "AVUI",
              title: "Criteris pedagògics · Delegació",
              subtitle: "Com decidim fins on deleguem a la IA? Quins nivells d'autonomia per cada etapa?",
              accent: "bg-[var(--jesuites-blue)] border-[var(--jesuites-blue)]",
              tagColor: "text-white/80 bg-white/20",
              isAvui: true,
            },
          ];
          const visibleCount = introStep + 1;
          return (
            <div className="flex-1 min-h-0 flex flex-col">
              <div className="flex-1 min-h-0 flex flex-col justify-center gap-1.5 overflow-hidden px-4">
                {LAYERS.slice(0, visibleCount).map((layer, i) => {
                  const isLast = i === visibleCount - 1;
                  const isAvui = layer.isAvui;
                  return (
                    <div key={layer.id} className={`transition-all duration-500 ${isLast ? "opacity-100" : "opacity-50"}`}>
                      <div className={`rounded-2xl border-2 px-5 py-3 flex items-center gap-4 ${layer.accent}`}>
                        <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${isAvui ? "bg-white/20" : "bg-white"} shadow-sm`}>
                          {layer.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full ${layer.tagColor}`}>{layer.tag}</span>
                          </div>
                          <p className={`text-xl font-black leading-tight ${isAvui ? "text-white" : "text-[var(--jesuites-blue)]"}`}>{layer.title}</p>
                          {layer.special ? (
                            <div className="flex gap-2 mt-1">
                              {[
                                { l: "★ Pedagògics", hi: true },
                                { l: "Tecnològics", hi: false },
                                { l: "Legals / Ètics", hi: false },
                              ].map(c => (
                                <span key={c.l} className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${c.hi ? "bg-rose-100 border-rose-300 text-rose-700" : "bg-white/60 border-rose-200 text-rose-400"}`}>{c.l}</span>
                              ))}
                            </div>
                          ) : layer.subtitle && (
                            <p className={`text-xs mt-0.5 ${isAvui ? "text-white/70" : "text-[var(--jesuites-text)]/50"}`}>{layer.subtitle}</p>
                          )}
                        </div>
                        {isLast && introStep < LAYERS.length - 1 && (
                          <div className="shrink-0 w-2 h-2 rounded-full bg-[var(--jesuites-blue)]/30 animate-pulse" />
                        )}
                      </div>
                      {i < visibleCount - 1 && (
                        <div className="flex justify-center py-0.5">
                          <ArrowDown size={12} className="text-[var(--jesuites-blue)]/20" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Navigation */}
              <div className="flex items-center justify-between shrink-0 border-t border-[var(--jesuites-blue)]/10 pt-3 mt-3">
                <button
                  onClick={() => setIntroStep(s => Math.max(0, s - 1))}
                  disabled={introStep === 0}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--jesuites-blue)]/10 text-[var(--jesuites-blue)] text-sm font-bold uppercase tracking-wider disabled:opacity-20 hover:bg-[var(--jesuites-blue)]/20 transition-all"
                >
                  <ChevronLeft size={16} /> Anterior
                </button>
                <span className="text-[var(--jesuites-blue)]/40 text-xs font-bold uppercase tracking-widest">{introStep + 1} / {LAYERS.length}</span>
                <button
                  onClick={() => { if (introStep >= LAYERS.length - 1) switchPhase("repas"); else setIntroStep(s => s + 1); }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--jesuites-blue)] text-white text-sm font-bold uppercase tracking-wider hover:brightness-110 transition-all"
                >
                  {introStep >= LAYERS.length - 1 ? "Repàs de nivells" : "Següent"} <ChevronRight size={16} />
                </button>
              </div>
            </div>
          );
        })()}

        {/* ═══ REPÀS PHASE — Nivells de delegació ═══ */}
        {phase === "repas" && (
          <div className="flex-1 min-h-0 flex flex-col gap-3">
            <p className="text-[var(--jesuites-blue)]/40 text-xs font-bold uppercase tracking-[0.25em] shrink-0">6 Graus de col·laboració Persona–IA</p>
            <div className="flex-1 min-h-0 grid grid-cols-3 gap-3 overflow-auto">
              {DELEGATION_LEVELS.map(level => {
                const colors = ["bg-gray-400","bg-emerald-500","bg-blue-500","bg-violet-500","bg-amber-500","bg-rose-500"];
                const textColors = ["text-gray-600","text-emerald-700","text-blue-700","text-violet-700","text-amber-700","text-rose-700"];
                const borderColors = ["border-gray-200","border-emerald-200","border-blue-200","border-violet-200","border-amber-200","border-rose-200"];
                const bgColors = ["bg-gray-50","bg-emerald-50","bg-blue-50","bg-violet-50","bg-amber-50","bg-rose-50"];
                return (
                  <div key={level.lv} className={`rounded-2xl border-2 p-4 flex flex-col gap-2 ${borderColors[level.lv]} ${bgColors[level.lv]}`}>
                    {/* Header */}
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-10 rounded-xl ${colors[level.lv]} flex items-center justify-center shrink-0 shadow-sm`}>
                        <span className="text-sm font-black text-white">N{level.lv}</span>
                      </div>
                      <div>
                        <p className={`text-sm font-black ${textColors[level.lv]}`}>{level.name}</p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{level.sub}</p>
                      </div>
                    </div>
                    {/* Persona/IA bar */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[8px] font-bold text-gray-400 w-10 shrink-0">Persona</span>
                      <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                        <div className={`h-full ${colors[level.lv]} opacity-70 transition-all`} style={{ width: `${level.human}%` }} />
                      </div>
                      <span className={`text-[10px] font-bold ${textColors[level.lv]} w-8 text-right`}>{level.human}%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[8px] font-bold text-gray-400 w-10 shrink-0">IA</span>
                      <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                        <div className="h-full bg-gray-400 opacity-50 transition-all" style={{ width: `${level.ia}%` }} />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 w-8 text-right">{level.ia}%</span>
                    </div>
                    {/* Description */}
                    <p className="text-[11px] text-gray-600 leading-relaxed">{level.desc}</p>
                    {/* One example */}
                    {level.examples?.[0] && (
                      <div className="mt-auto pt-2 border-t border-black/[0.06]">
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">{level.examples[0].subject}</p>
                        <p className="text-[10px] text-gray-500 italic leading-snug">{level.examples[0].activity}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Navigation */}
            <div className="flex items-center justify-between shrink-0 border-t border-[var(--jesuites-blue)]/10 pt-3 mt-3">
              <button
                onClick={() => switchPhase("intro")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--jesuites-blue)]/10 text-[var(--jesuites-blue)] text-sm font-bold uppercase tracking-wider hover:bg-[var(--jesuites-blue)]/20 transition-all"
              >
                <ChevronLeft size={16} /> Ruta
              </button>
              <button
                onClick={() => switchPhase("calibra")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--jesuites-blue)] text-white text-sm font-bold uppercase tracking-wider hover:brightness-110 transition-all"
              >
                Calibra <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ═══ TANCAMENT PHASE ═══ */}
        {phase === "tancament" && (
          <div className="flex-1 min-h-0 flex flex-col gap-4">
            {/* Sub-slide selector */}
            <div className="flex gap-2 shrink-0">
              {[
                { n: 0, label: "Decàleg final" },
                { n: 1, label: "Reflexió col·lectiva" },
              ].map(s => (
                <button key={s.n} onClick={() => setTancamentSlide(s.n as 0 | 1)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    tancamentSlide === s.n
                      ? "bg-[var(--jesuites-blue)] text-white shadow"
                      : "bg-[var(--jesuites-blue)]/10 text-[var(--jesuites-blue)]/50 hover:bg-[var(--jesuites-blue)]/20"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Slide 0: Decaleg final */}
            {tancamentSlide === 0 && (
              <div className="flex-1 min-h-0 overflow-auto">
                {!decalegGenerated && (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">El decàleg no s&apos;ha generat encara</p>
                  </div>
                )}
                {decalegGenerated && (
                  <div>
                    {decalegGenerated.summary && (
                      <div className="mb-4 bg-[var(--jesuites-blue)]/5 border border-[var(--jesuites-blue)]/10 rounded-2xl px-4 py-3">
                        <p className="text-xs font-bold text-[var(--jesuites-blue)] uppercase tracking-wider mb-1">Consens dels docents</p>
                        <p className="text-sm text-[var(--jesuites-text)]/70 italic">{decalegGenerated.summary}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      {decalegGenerated.orientations.map(item => (
                        <div key={item.n} className="bg-white rounded-2xl border border-black/[0.06] p-4 shadow-sm">
                          <div className="flex items-start gap-3">
                            <span className="shrink-0 w-7 h-7 rounded-lg bg-[var(--jesuites-blue)] text-white text-xs font-black flex items-center justify-center">{item.n}</span>
                            <div>
                              <p className="text-sm font-bold text-[var(--jesuites-blue)] mb-1">{item.title}</p>
                              <p className="text-xs text-gray-600 leading-relaxed">{item.text}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Slide 1: Reflexió */}
            {tancamentSlide === 1 && (
              <div className="flex-1 min-h-0 flex flex-col gap-6">
                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
                  <p className="text-xs font-bold text-[var(--jesuites-blue)]/40 uppercase tracking-[0.3em]">Reflexió final</p>
                  <h2 className="text-3xl font-black text-[var(--jesuites-blue)] leading-tight max-w-2xl">
                    Com hauríem de procedir<br />amb els homòlegs i el professorat?
                  </h2>
                  <p className="text-sm text-[var(--jesuites-text)]/50 max-w-lg">
                    Pren un moment per reflexionar. Com et sents davant el que hem treballat avui?
                  </p>
                </div>
                {/* Vote results */}
                <div className="shrink-0">
                  <p className="text-xs font-bold text-[var(--jesuites-blue)]/40 uppercase tracking-widest text-center mb-3">
                    {Object.values(tancamentVotes).reduce((a,b) => a+b, 0)} respostes
                  </p>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { id: "worry", label: "M'inquieta", icon: <AlertCircle size={20} />, color: "border-orange-300 bg-orange-50", textColor: "text-orange-700", barColor: "bg-orange-400" },
                      { id: "doubt", label: "Em genera dubtes", icon: <HelpCircle size={20} />, color: "border-blue-300 bg-blue-50", textColor: "text-blue-700", barColor: "bg-blue-400" },
                      { id: "agree", label: "Em dóna confort", icon: <Heart size={20} />, color: "border-emerald-300 bg-emerald-50", textColor: "text-emerald-700", barColor: "bg-emerald-400" },
                      { id: "inspired", label: "M'inspira", icon: <Lightbulb size={20} />, color: "border-violet-300 bg-violet-50", textColor: "text-violet-700", barColor: "bg-violet-400" },
                    ].map(opt => {
                      const count = tancamentVotes[opt.id as keyof typeof tancamentVotes];
                      const total = Object.values(tancamentVotes).reduce((a,b) => a+b, 0);
                      const pct = total > 0 ? Math.round(count / total * 100) : 0;
                      return (
                        <div key={opt.id} className={`rounded-2xl border-2 p-4 text-center ${opt.color}`}>
                          <div className={`${opt.textColor} flex justify-center mb-2`}>{opt.icon}</div>
                          <p className={`text-2xl font-black ${opt.textColor}`}>{count}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{opt.label}</p>
                          <div className="w-full h-1.5 rounded-full bg-black/[0.05] overflow-hidden">
                            <div className={`h-full ${opt.barColor} transition-all duration-700`} style={{ width: `${pct}%` }} />
                          </div>
                          <p className={`text-[10px] font-bold ${opt.textColor} mt-1`}>{pct}%</p>
                        </div>
                      );
                    })}
                  </div>
                  {/* Open/close voting */}
                  <div className="flex justify-center mt-3">
                    <button
                      onClick={async () => {
                        await supabase.from("mapa_facilitador_state")
                          .update({ phase: "tancament", is_active: true })
                          .eq("id", 1);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-[var(--jesuites-blue)]/10 text-[var(--jesuites-blue)]/60 hover:bg-[var(--jesuites-blue)]/20 transition-all"
                    >
                      Obrir votació als participants
                    </button>
                  </div>
                </div>
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
