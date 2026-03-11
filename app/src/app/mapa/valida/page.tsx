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
  // ── CLAR: Outsourcing evident ──
  {
    id: "val-01",
    text: "Un alumne de 3r ESO demana a la IA que li resolgui un problema de matemàtiques pas a pas. Copia la solució al quadern sense intentar-ho ell primer.",
    context: "3r ESO · Matemàtiques",
    impliedLevel: 4,
    tag: "outsourcing",
    friction: "nul·la",
    frictionNote: "L'alumne no experimenta cap dificultat desitjable. No hi ha esforç cognitiu previ ni posterior.",
    discussion: "Nivell N4 sense supervisió real. L'alumne externalitza la tasca cognitiva completament.",
  },
  // ── CONTROVERTIT: On és el límit entre suport i delegació? ──
  {
    id: "val-02",
    text: "Una alumna de 4t ESO escriu un assaig. Després demana a la IA: «Reescriu-lo perquè soni més acadèmic.» Li agrada el resultat i el lliura amb petits retocs.",
    context: "4t ESO · Llengua Catalana",
    impliedLevel: 3,
    tag: "outsourcing",
    friction: "baixa",
    frictionNote: "L'alumna va fer el treball inicial, però el producte final és majoritàriament de la IA. La reescriptura ha substituït la seva veu. Hi ha debat legítim: va començar ella, però el resultat ja no és seu.",
    discussion: "Frontera N2/N4. L'alumna va crear, però va delegar la versió final. Uns diran que és suport (va escriure primer), altres que és outsourcing (el text lliurat és de la IA). On poses el límit?",
  },
  // ── CLAR: Ús docent legítim ──
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
  // ── CONTROVERTIT: Cocreació o delegació amb supervisió cosmètica? ──
  {
    id: "val-04",
    text: "Un alumne de Batxillerat programa un projecte de tecnologia amb Copilot: ell escriu l'estructura i els comentaris, la IA genera el codi, l'alumne el revisa línia per línia i corregeix errors. Entén el 70% del codi final.",
    context: "Batxillerat · Tecnologia",
    impliedLevel: 3,
    tag: "offloading",
    friction: "alta",
    frictionNote: "Hi ha esforç cognitiu real: l'alumne dissenya, revisa, corregeix i comprèn. Però el codi funcional el genera la IA. El 30% que no entén és un risc o una oportunitat?",
    discussion: "Frontera N3/N4. Si l'alumne entén i supervisa, és cocreació legítima? O si el gruix del codi el fa la IA, és delegació maquillada? Depèn de si valorem el procés o el producte.",
  },
  // ── CLAR: Offloading exemplar ──
  {
    id: "val-05",
    text: "Una alumna de 6è demana a Gemini: «Explica'm què és la fotosíntesi amb paraules senzilles.» Després ho explica amb les seves pròpies paraules al company de taula.",
    context: "Cicle Superior · Ciències",
    impliedLevel: 1,
    tag: "offloading",
    friction: "alta",
    frictionNote: "L'alumna utilitza la IA per entendre, no per substituir. Reformular i explicar a un altre és una prova de comprensió genuïna.",
    discussion: "Nivell N1 — Exploració. La IA informa, l'alumna transforma el coneixement. Atenció: té 10-11 anys (< 14), cal autorització LOPDGDD.",
  },
  // ── CONTROVERTIT: El context canvia el judici? ──
  {
    id: "val-06",
    text: "Un alumne de 1r ESO utilitza la IA per traduir un article científic de l'anglès al català que necessita per a un treball de ciències naturals. L'objectiu del treball és investigar, no traduir.",
    context: "1r ESO · Ciències Naturals",
    impliedLevel: 2,
    tag: "offloading",
    friction: "baixa",
    frictionNote: "La traducció no és l'objectiu d'aprenentatge — la investigació científica sí. Però delegar la traducció impedeix l'exposició a la llengua. Hi ha arguments legítims per ambdós bàndols.",
    discussion: "Frontera N2/N4. Si fos classe d'anglès, seria outsourcing clar. Però aquí la llengua no és la competència objectiu. És com usar una calculadora a ciències? O estem normalitzant la no-lectura en anglès?",
  },
  // ── CONTROVERTIT: El resum com a drecera o com a eina? ──
  {
    id: "val-07",
    text: "Una alumna de 2n ESO demana a la IA un resum d'un capítol de 30 pàgines del llibre de text. Llegeix el resum, pren notes i escriu la seva pròpia anàlisi sense consultar el capítol original.",
    context: "2n ESO · Ciències Socials",
    impliedLevel: 2,
    tag: "offloading",
    friction: "baixa",
    frictionNote: "L'alumna fa un esforç cognitiu real (analitzar, escriure), però ha substituït la lectura per un resum de la IA. La comprensió profunda requereix la lectura original? O el resum és una eina legítima d'estudi?",
    discussion: "Frontera N1/N4. L'alumna treballa genuïnament, però s'ha saltat la lectura — que és on molts docents situen l'aprenentatge. Depèn de si la competència és «llegir» o «comprendre i analitzar».",
  },
  // ── CLAR: Offloading amb criteri ──
  {
    id: "val-08",
    text: "Un alumne de 4t ESO fa servir la IA per generar 5 idees per a un projecte d'emprenedoria. Després en tria una, la desenvolupa ell sol i justifica la seva tria davant la classe.",
    context: "4t ESO · Emprenedoria",
    impliedLevel: 1,
    tag: "offloading",
    friction: "alta",
    frictionNote: "Generar idees inicials és una fase divergent. L'alumne fa la feina convergent (triar, justificar, desenvolupar), que és la més valuosa.",
    discussion: "Nivell N1 — La IA inspira, l'alumne crea. El producte final és 100% de l'alumne.",
  },
  // ── CLAR: Outsourcing sistèmic ──
  {
    id: "val-09",
    text: "Una eina d'IA corregeix automàticament tots els exercicis de gramàtica d'un alumne de 1r ESO i li dona la nota sense que ell revisi els errors.",
    context: "1r ESO · Llengua",
    impliedLevel: 5,
    tag: "outsourcing",
    friction: "nul·la",
    frictionNote: "L'alumne no revisa els seus errors. La IA ha substituït el feedback pedagògic. Sense revisió, no hi ha aprenentatge del procés.",
    discussion: "Nivell N5 — Agència sense valor pedagògic. Diferent d'una plataforma adaptativa on l'alumne treballa.",
  },
  // ── CLAR: Cocreació equilibrada ──
  {
    id: "val-10",
    text: "Una alumna de Batxillerat crea un podcast: ella investiga el tema, escriu el guió, la IA genera la música de fons, i ella fa l'edició i la locució final.",
    context: "Batxillerat · Projecte Interdisciplinari",
    impliedLevel: 3,
    tag: "offloading",
    friction: "alta",
    frictionNote: "L'alumna lidera tot el procés intel·lectual. La IA contribueix en un aspecte no-central (música). L'esforç cognitiu és complet.",
    discussion: "Nivell N3 — Cocreació. L'alumna fa la investigació, escriptura i producció; la IA aporta un element complementari.",
  },
  // ── CONTROVERTIT: Seqüència llarga — l'efecte acumulatiu ──
  {
    id: "val-11",
    text: "Un alumne de 3r ESO escriu un text argumentatiu seguint un procés guiat: (1) demana a la IA 5 arguments a favor i 5 en contra, (2) en tria 3 i escriu un primer esborrany, (3) la IA li suggereix millores d'estructura, (4) l'alumne reescriu, (5) la IA revisa ortografia i coherència. L'alumne ha interactuat 4 vegades amb la IA però ha pres totes les decisions.",
    context: "3r ESO · Llengua",
    impliedLevel: 2,
    tag: "offloading",
    friction: "alta",
    frictionNote: "Cada interacció aïllada sembla legítima (N1 o N2). Però l'acumulació de 4 suports genera un text que difícilment hauria existit sense la IA. L'alumne ha decidit, però... ha pensat?",
    discussion: "Frontera N2/N3. Individulament cada pas és suport. Però és el procés en conjunt el que cal jutjar? Si treiem qualsevol dels 4 passos, el text seria molt diferent. On és el llindar d'autoria? Alguns docents ho veuran com un procés d'escriptura exemplar; altres, com una dependència excessiva.",
  },
  // ── CONTROVERTIT: Projecte multifase — delegació selectiva ──
  {
    id: "val-12",
    text: "Una alumna de 4t ESO fa un projecte de recerca social: (1) usa la IA per trobar fonts i fer-ne resums, (2) formula la seva pròpia hipòtesi, (3) dissenya l'enquesta ella sola, (4) usa la IA per analitzar les dades estadístiques, (5) escriu les conclusions ella sola contrastant amb les fonts. Ha delegat la cerca i l'anàlisi, però la hipòtesi i les conclusions són seves.",
    context: "4t ESO · Projecte de Recerca",
    impliedLevel: 3,
    tag: "offloading",
    friction: "alta",
    frictionNote: "L'alumna ha delegat les parts mecàniques (cerca, estadística) i ha fet les parts intel·lectuals (hipòtesi, conclusions). Però cercar fonts i analitzar dades també són competències d'aprenentatge. Ha après a investigar o a gestionar una IA que investiga per ella?",
    discussion: "Frontera N2/N3/N4. La delegació és selectiva i intel·ligent — l'alumna ha triat què delegar. Però si l'objectiu és aprendre a investigar, ha saltat passos clau. Depèn de l'objectiu d'aprenentatge: si és el contingut, és brillant; si és el mètode, és problemàtic.",
  },
  // ── CONTROVERTIT: IA com a tutor personal — autonomia o dependència? ──
  {
    id: "val-13",
    text: "Un alumne de 2n ESO utilitza la IA com a tutor de matemàtiques durant 40 minuts: (1) demana que li expliqui equacions de primer grau, (2) fa exercicis sol, (3) els comprova amb la IA, (4) quan falla, demana pistes (no solucions), (5) corregeix i torna a intentar. Al final resol 15 exercicis correctament sense ajuda.",
    context: "2n ESO · Matemàtiques",
    impliedLevel: 2,
    tag: "offloading",
    friction: "alta",
    frictionNote: "L'alumne fa l'esforç cognitiu real: resol, comprova, corregeix. La IA actua com un professor particular que dóna pistes. El resultat (15 exercicis resolts) és genuí. Però la IA ha substituït el docent? I si tots els alumnes fan això, quin és el rol del professor?",
    discussion: "Frontera N1/N2/N5. L'ús és exemplar des del punt de vista de l'aprenentatge. Però obre preguntes sistèmiques: si la IA tutoritza millor que la classe, canvia el model? Alguns ho veuran com el futur de l'educació personalitzada; altres com una erosió del rol docent.",
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
      if (data && data.is_active) {
        if (data.phase === "valida") {
          setFacilitatorSync(true);
          setCurrentIdx(data.current_idx);
        } else if (data.phase === "calibra") {
          window.location.href = "/mapa/calibra";
        } else if (data.phase === "mapa") {
          window.location.href = "/mapa";
        }
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
    "val-11": "ESO-3",
    "val-12": "ESO-4",
    "val-13": "ESO-2",
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

  const handleAnswer = async (approved: boolean) => {
    setAnswers(prev => ({ ...prev, [scenario.id]: approved }));

    // If already revealed, re-save the changed vote to Supabase
    if (isRevealed) {
      await supabase.from("mapa_valida").upsert({
        session_id: sessionId,
        scenario_id: scenario.id,
        approved,
        implied_level: scenario.impliedLevel,
        tag: scenario.tag,
      }, { onConflict: "session_id,scenario_id" });
      // Reset fix state since the vote changed
      setFixApplied(prev => ({ ...prev, [scenario.id]: false }));
    }
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

        {facilitatorSync ? (
          <div className="fixed bottom-0 left-0 right-0 p-3 bg-[var(--jesuites-blue)] text-center z-[90]">
            <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest animate-pulse">Sessió guiada pel facilitador</p>
          </div>
        ) : (
          <BottomNav current="valida" />
        )}
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
                className={`py-4 rounded-2xl text-center transition-all flex flex-col items-center gap-2 ${
                  myAnswer === true
                    ? "bg-emerald-500 text-white shadow-lg scale-105"
                    : "bg-black/[0.04] text-gray-500 hover:bg-emerald-50"
                }`}
              >
                <ThumbsUp size={22} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Sí, ho aprovo</span>
              </button>
              <button
                onClick={() => handleAnswer(false)}
                className={`py-4 rounded-2xl text-center transition-all flex flex-col items-center gap-2 ${
                  myAnswer === false
                    ? "bg-rose-400 text-white shadow-lg scale-105"
                    : "bg-black/[0.04] text-gray-500 hover:bg-rose-50"
                }`}
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

              {/* Inline Delegation Levels */}
              {(() => {
                const courseId = courseMapping[scenario.id];
                const courseData = myMap[courseId];
                if (!courseData || scenario.impliedLevel === -1) return null;
                return (
                  <div className="bg-white rounded-3xl p-5 border border-black/[0.04]">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                      El teu mapa per a {courseId}
                    </p>
                    <div className="flex gap-1.5">
                      {DELEG_LABELS.map(({ n, label, name }) => {
                        const key = `delegation_n${n}` as keyof RowData;
                        const isActive = courseData[key] as boolean;
                        const isImplied = n === scenario.impliedLevel;
                        return (
                          <button
                            key={n}
                            onClick={async () => {
                              // Cumulative: clicking N sets 0..N true, N+1..5 false
                              const currentMax = DELEG_LABELS.reduce((max, d) => {
                                const k = `delegation_n${d.n}` as keyof RowData;
                                return (courseData[k] as boolean) ? d.n : max;
                              }, -1);
                              const newMax = n === currentMax ? n - 1 : n;
                              const update: Record<string, boolean> = {};
                              const localUpdate: Record<string, boolean> = {};
                              for (let i = 0; i <= 5; i++) {
                                const field = `delegation_n${i}`;
                                const val = i <= newMax;
                                update[field] = val;
                                localUpdate[field] = val;
                              }
                              setMyMap(prev => ({
                                ...prev,
                                [courseId]: { ...prev[courseId], ...localUpdate } as RowData,
                              }));
                              await supabase.from("mapa_declarations").update(update)
                                .eq("session_id", sessionId)
                                .eq("course_id", courseId);
                              // Reset fix state since map changed
                              setFixApplied(prev => ({ ...prev, [scenario.id]: false }));
                            }}
                            className={`flex-1 py-2 rounded-xl text-center transition-all border ${
                              isActive
                                ? isImplied
                                  ? "bg-amber-500 text-white border-amber-600 ring-2 ring-amber-300 shadow-md"
                                  : "bg-[var(--jesuites-blue)] text-white border-[var(--jesuites-blue)] shadow-sm"
                                : isImplied
                                  ? "bg-amber-50 text-amber-600 border-amber-200"
                                  : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
                            }`}
                          >
                            <span className="text-[10px] font-bold block">{label}</span>
                            <span className="text-[7px] font-medium block leading-tight">{name}</span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[9px] text-gray-400 mt-2 text-center">
                      Toca per canviar els nivells de delegació · El nivell de l&apos;escenari es marca en taronja
                    </p>
                  </div>
                );
              })()}

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
