"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { supabase } from "@/lib/supabase";
import {
  ChevronDown, Users, Eye, Search, Heart, ShieldCheck,
  ArrowRightLeft, FileText, Gavel, Sparkles, Settings,
  Target, Lightbulb, CheckCircle2, ChevronLeft, ChevronRight
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const PRINCIPLES = [
  {
    id: "antropocentrisme",
    title: "Antropocentrisme i Humanisme",
    icon: Users,
    intro: "Prioritzem la relació humana, el benestar i la dignitat.",
    full: "Entenem que la tecnologia ha d'estar al servei de l'ésser humà. Garantim que la decisió final en qüestions que afecten les persones (especialment en avaluació) sigui sempre humana. La IA pot proposar, però la persona és la responsable última.",
    points: [
      "Responsabilitat humana (Human-in-the-loop)",
      "Enfortiment de la relació humana",
      "Prevenció de la dependència cognitiva"
    ]
  },
  {
    id: "transparencia",
    title: "Transparència i Integritat",
    icon: Eye,
    intro: "Ús visible i honorable de la tecnologia.",
    full: "Fomentem l'honestedat en l'ús de l'IA. Evolucionem del concepte de 'copiar' al de 'generar pensament propi', avaluant la capacitat de l'alumne d'utilitzar l'eina per a una elaboració original.",
    points: [
      "Identificació i divulgació (declarar ús d'IA)",
      "Explicabilitat de criteris (no caixes negres)",
      "Citació i protocols clars de reconeixement"
    ]
  },
  {
    id: "verificacio",
    title: "Verificació i Crítica",
    icon: Search,
    intro: "Cultura de vigilància activa davant la versemblança.",
    full: "Davant models probabilístics que generen resultats plausibles però no sempre certs, eduquem en el contrast de fonts i la vigilància activa contra biaixos de gènere o culturals.",
    points: [
      "Desenvolupament del pensament crític permanent",
      "Fiabilitat i contrast sistemàtic amb fonts",
      "Mitigació activa de biaixos algorítmics"
    ]
  },
  {
    id: "equitat",
    title: "Equitat i Inclusió",
    icon: Heart,
    intro: "Instrument per reduir bretxes i diversitat.",
    full: "L'IA ha de ser una eina per arribar a tothom. L'utilitzem per atendre múltiples necessitats educatives sota supervisió docent, evitant que les versions de pagament generin avantatges injustos.",
    points: [
      "Accés universal a eines institucionals",
      "Accessibilitat per disseny",
      "Personalització inclusiva de l'aprenentatge"
    ]
  },
  {
    id: "benestar",
    title: "Benestar i Sostenibilitat",
    icon: ShieldCheck,
    intro: "Relació equilibrada amb l'entorn i compromís ambiental.",
    full: "Som conscients de l'impacte energètic i hídric de l'IA. Promovem la desconnexió com a valor i el manteniment d'una frontera clara entre l'activitat digital i la interacció física.",
    points: [
      "Integritat i seguretat de les dades (RGPD)",
      "Salut digital i dret a la desconnexió",
      "Justícia socioambiental i consum responsable"
    ]
  }
];

const TENSIONS = [
  {
    id: "t1",
    title: "Integritat Humana",
    desc: "Habitar l'ecosistema digital reconeixent la hibridació sense perdre la centralitat i dignitat de la persona.",
    left: "Humanisme clàssic",
    leftDesc: "Mantenir la tecnologia com una eina externa i controlable per reforçar la nostra essència humana més profunda.",
    right: "Posthumanisme crític",
    rightDesc: "Assumir que la hibridació digital ja forma part de nosaltres i amplificar les nostres capacitats cognitives.",
  },
  {
    id: "t2",
    title: "Autonomia i Agència",
    desc: "Diferenciem entre estalviar temps en la repetició i perdre la responsabilitat i la veu en la presa de decisions.",
    left: "Offloading",
    leftDesc: "Alliberar-nos de tasques repetitives i mecàniques per guanyar temps per a les relacions i l'acompanyament.",
    right: "Outsourcing",
    rightDesc: "Risc d'externalitzar la reflexió crítica i el judici ètic en mans de sistemes algorítmics opacs.",
  },
  {
    id: "t3",
    title: "Profunditat Cognitiva",
    desc: "Defensem el pensament lent i la concentració davant la temptació d'anul·lar l'esforç intel·lectual.",
    left: "Fricció productiva",
    leftDesc: "Protegir el valor de l'esforç, la dificultat desitjable i el temps necessari per a l'aprenentatge significatiu.",
    right: "Eficiència",
    rightDesc: "Aprofitar la immediatesa i l'optimització de resultats que ens ofereix la intel·ligència artificial generativa.",
  },
  {
    id: "t4",
    title: "Vincles i Presència",
    desc: "Recuperem la calidesa i la intencionalitat en la trobada humana davant la sorollosa distracció dels algorismes.",
    left: "Atenció",
    leftDesc: "Davant la fragmentació digital, la dopamina ràpida i la mercantilització del nostre temps a la xarxa.",
    right: "Intenció",
    rightDesc: "Mantenir una presència plena i conscient, amb una intencionalitat clara en cada interacció digital.",
  },
  {
    id: "t5",
    title: "Justícia i Equitat",
    desc: "Vigilar proactivament que la intel·ligència artificial no esdevingui una nova eina d'exclusió estructural.",
    left: "Biaixos",
    leftDesc: "Consciència de l'ús de dades històriques i els prejudicis que els models de llenguatge poden perpetuar.",
    right: "Justícia Algorítmica",
    rightDesc: "Treballar activament per un disseny inclusiu i una auditoria social que garanteixi l'equitat tecnológica.",
  },
  {
    id: "t6",
    title: "Integritat Intel·lectual",
    desc: "Aprendre a distingir un text que 'sembla correcte' d'una veritat argumentada, verificada i amb fonament.",
    left: "Plausibilitat",
    leftDesc: "Saber que l'IA genera resultats basats en versemblança estadística que poden semblar veritables.",
    right: "Realisme",
    rightDesc: "Compromís amb la veritat factual, el contrast de fonts i la integritat de la producció intel·lectual.",
  }
];

const MODEL_4D = [
  {
    id: "D1", name: "Delegació", subtitle: "Saber decidir qui fa què.",
    desc: "Prendre decisions reflexives sobre quin treball és per a un mateix i quin per a l'IA. No deleguem per evitar l'esforç.",
    icon: ArrowRightLeft, details: ["Consciència del problema", "Consciència de la plataforma", "Triatge estratègic"]
  },
  {
    id: "D2", name: "Descripció", subtitle: "Saber demanar amb precisió.",
    desc: "Traduir la intenció humana en instruccions semàntiques (prompts). La qualitat de l'output depèn de la claredat.",
    icon: FileText, details: ["Definició de producte", "Descripció de procés (CoT)", "Rol i performance"]
  },
  {
    id: "D3", name: "Discerniment", subtitle: "Saber jutjar el resultat.",
    desc: "Avaluar de manera crítica i reflexiva tot allò que produeix l'IA. Actua com el sistema de control de qualitat.",
    icon: Gavel, details: ["Verificació factual", "Detecció d'al·lucinacions", "Filtre de veracitat"]
  },
  {
    id: "D4", name: "Diligència", subtitle: "Saber-se responsable final.",
    desc: "Governança ètica i responsabilitat en l'acció. Transforma l'habilitat tècnica en ciutadania compromesa.",
    icon: ShieldCheck, details: ["Seguretat i privadesa", "Transparència i autoria", "Impacte socioambiental"]
  }
];

const DELEGATION_LEVELS = [
  {
    lv: 0, name: "Preservació", sub: "No delegació", human: 100, ia: 0,
    desc: "Es prioritza l'activitat humana directa per preservar habilitats fonamentals o judici ètic.",
    examples: [
      { subject: "Dibuix", activity: "Grafoescritura i coordinació oculomanual bàsica." },
      { subject: "Filosofia", activity: "Reflexió ètica en situacions de crisi humana." },
      { subject: "Educació Física", activity: "Desenvolupament de la consciència corporal i motricitat." },
      { subject: "Interioritat", activity: "Pràctica de l'atenció plena sense dispositius." },
      { subject: "Teatre", activity: "Expressió emocional i llenguatge no verbal en viu." }
    ]
  },
  {
    lv: 1, name: "Exploració", sub: "Font d'idees", human: 90, ia: 10,
    desc: "L'IA actua com a mirall d'idees o font d'informació inicial. L'artefacte final és 100% humà.",
    examples: [
      { subject: "Ciències", activity: "Interrogar l'IA per entendre un concepte abstracte o analogies." },
      { subject: "Llengua", activity: "Pluja d'idees assistida per IA per definir el tema d'un relat." },
      { subject: "Visual i Plàstica", activity: "Recerca de referents artístics i moviments estètics." },
      { subject: "Socials", activity: "Cerca de context històric i mapes conceptuals inicials." },
      { subject: "Tecnologia", activity: "Exploració de possibles solucions a un repte de disseny." }
    ]
  },
  {
    lv: 2, name: "Suport", sub: "Refinament", human: 70, ia: 30,
    desc: "La persona crea el contingut base i l'IA proposa millores, correccions o refinament d'estil.",
    examples: [
      { subject: "Història", activity: "Revisió d'un assaig: suggeriments en l'estructura o el to." },
      { subject: "Anglès", activity: "Autocorrecció de gramàtica i propostes de vocabulari variat." },
      { subject: "Matemàtiques", activity: "Tutor socràtic que ajuda a detectar l'error en un procediment." },
      { subject: "Física", activity: "Millora de la redacció de les conclusions d'un laboratori." },
      { subject: "Llengua", activity: "Detecció de faltes de coferència o repeticions en un text propi." }
    ]
  },
  {
    lv: 3, name: "Cocreació", sub: "Estratègica", human: 50, ia: 50,
    desc: "Treball iteratiu on persona i l'IA alternen el lideratge en el disseny i l'execució.",
    examples: [
      { subject: "Música", activity: "Creació melòdica conjunta: l'IA proposa acords, l'humà la lletra." },
      { subject: "Tecnologia", activity: "Programació assistida: co-escriptura de codi amb realimentació." },
      { subject: "Projectes", activity: "Disseny de guions per a podcast i edició d'àudio híbrida." },
      { subject: "Emprenedoria", activity: "Desenvolupament d'un model de negoci iterant amb l'IA." },
      { subject: "Art", activity: "Instal·lació interactiva on l'IA processa dades en viu." }
    ]
  },
  {
    lv: 4, name: "Delegació", sub: "Supervisada", human: 20, ia: 80,
    desc: "L'IA genera la major part del producte sota instruccions molt precises; l'humà valida.",
    examples: [
      { subject: "Recerca", activity: "Generació de resums de lectura tancats des de fonts pròpies." },
      { subject: "Administració", activity: "Creació de plantilles de pressupost des de dades en brut." },
      { subject: "Disseny", activity: "Producció de visuals complexos des de prompts tècnics." },
      { subject: "Idiomes", activity: "Traducció de textos tècnics amb supervisió del matís." },
      { subject: "Mates", activity: "Optimització de càlculs complexos des de fórmules." }
    ]
  },
  {
    lv: 5, name: "Agència", sub: "Autònoma", human: 5, ia: 95,
    desc: "L'IA opera independentment dins d'un marc supervisat. L'humà actua com a auditor.",
    examples: [
      { subject: "Personalització", activity: "Plataformes adaptatives amb itineraris automàtics." },
      { subject: "Anàlisi", activity: "Monitorització del benestar de grup via sentiment analysis." },
      { subject: "Operacions", activity: "Sistemes de gestió administrativa recurrent (assistència)." },
      { subject: "Recerca", activity: "Anàlisi de grans volums de dades per identificar patrons." },
      { subject: "Educació", activity: "Generació de qüestionaris adaptatius segons el progrés." }
    ]
  }
];

function SectionArrow({ targetId }: { targetId: string }) {
  return (
    <div
      className="flex justify-center mt-20 mb-4 opacity-50 animate-bounce cursor-pointer hover:opacity-100 transition-opacity"
      onClick={() => document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' })}
    >
      <ChevronDown size={32} className="text-[var(--jesuites-blue)]" />
    </div>
  );
}

function ExamplesCarousel({ examples }: { examples: any[] }) {
  const [currentEx, setCurrentEx] = useState(0);
  const nextEx = (e: any) => { e.stopPropagation(); setCurrentEx((prev) => (prev + 1) % examples.length); };
  const prevEx = (e: any) => { e.stopPropagation(); setCurrentEx((prev) => (prev - 1 + examples.length) % examples.length); };

  return (
    <div className="bg-[var(--jesuites-cream)] rounded-[2.5rem] p-6 md:p-8 relative overflow-hidden border border-black/[0.02] w-full mt-4">
      <div className="flex justify-between items-center mb-6 border-b border-black/5 pb-4">
        <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-gray-400 block">Exemples d'aula (+14 ANYS)</span>
        <div className="flex gap-3">
          <button onClick={prevEx} className="p-2.5 hover:bg-[var(--jesuites-blue)] hover:text-white rounded-full transition-colors border border-black/5 bg-white shadow-sm ring-1 ring-black/5">
            <ChevronLeft size={16} />
          </button>
          <button onClick={nextEx} className="p-2.5 hover:bg-[var(--jesuites-blue)] hover:text-white rounded-full transition-colors border border-black/5 bg-white shadow-sm ring-1 ring-black/5">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div className="relative min-h-[6rem] flex items-center">
        {examples.map((ex, idx) => (
          <div key={idx} className={`transition-all duration-700 transform w-full ${idx === currentEx ? 'relative opacity-100 translate-x-0' : 'absolute inset-0 opacity-0 translate-x-12 pointer-events-none'}`}>
            <div className="bg-white/95 p-5 md:p-6 rounded-[2rem] shadow-sm flex items-start gap-6">
              <div className="bg-[var(--jesuites-blue)]/5 p-4 rounded-2xl shrink-0 hidden md:block">
                <Sparkles size={20} className="text-[var(--jesuites-blue)]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-bold text-[var(--jesuites-blue)] uppercase mb-2 block tracking-widest">{ex.subject}</span>
                <p className="text-lg md:text-xl text-gray-700 font-light leading-snug break-words">{ex.activity}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-2 mt-8">
        {examples.map((_, i) => (
          <div onClick={(e) => { e.stopPropagation(); setCurrentEx(i); }} key={i} className={`h-1 cursor-pointer transition-all duration-500 ${i === currentEx ? 'w-10 bg-[var(--jesuites-blue)]' : 'w-2 bg-[var(--jesuites-blue)]/10'}`} />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [expandedValue, setExpandedValue] = useState<string | null>(null);
  const [expandedD, setExpandedD] = useState<string | null>(null);
  const [expandedLv, setExpandedLv] = useState<number | null>(null);
  const [expandedTension, setExpandedTension] = useState<string | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-text", { y: 150, opacity: 0, stagger: 0.2, duration: 2, ease: "expo.out" });
      gsap.utils.toArray(".reveal-section").forEach((s: any) => {
        gsap.from(s, { scrollTrigger: { trigger: s, start: "top 85%" }, y: 80, opacity: 0, duration: 1.5, ease: "power4.out" });
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <main ref={containerRef} className="relative min-h-screen bg-[var(--jesuites-cream)] pb-64 font-sans leading-relaxed text-[var(--jesuites-text)]">

      {/* 1. HERO */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-black">
          <Image src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2000" alt="Background" fill className="object-cover opacity-50 scale-10" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-[var(--jesuites-cream)]" />
        </div>
        <div className="hero-content relative z-10 text-center px-6 max-w-7xl mx-auto">
          <Image src="/imatges/FJE-trans.png" alt="Logo" width={280} height={100} className="mx-auto mb-16 h-auto w-40 md:w-52" priority />
          <div className="hero-text mb-10">
            <span className="text-[var(--jesuites-cream)]/40 font-bold tracking-[0.4em] uppercase text-base md:text-xl mb-8 block font-serif">Marc General d'Integració d'IA</span>
            <h1 className="text-8xl md:text-[14rem] font-bold text-white leading-[0.75] tracking-tighter uppercase drop-shadow-2xl font-serif">MIRADES<br />OBERTES</h1>
          </div>
          <p className="hero-text text-xl md:text-3xl font-light text-white/50 uppercase tracking-[0.4em] font-serif max-w-5xl mx-auto italic">Navegant l'Era de la Intel·ligència Artificial <br className="hidden md:block" /> des de l'Humanisme i el Diàleg</p>
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-30 animate-bounce cursor-pointer" onClick={() => document.getElementById('details-intro')?.scrollIntoView({ behavior: 'smooth' })}>
            <ChevronDown size={40} className="text-white" />
          </div>
        </div>
      </section>

      {/* 2. INTRODUCCIÓ (MOTIUS I OBJECTIUS) */}
      <section id="details-intro" className="reveal-section py-40 px-6 bg-white overflow-hidden border-b border-black/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start mb-48">
            <div className="relative group w-full aspect-square md:aspect-auto md:h-[650px]">
              <div className="absolute -inset-4 bg-[var(--jesuites-blue)]/5 rounded-[4rem] -rotate-2" />
              <div className="relative h-full w-full rounded-[3rem] overflow-hidden shadow-2xl">
                <Image src="/imatges/mirades-obertes-2.jpg" alt="Visió" fill className="object-cover" />
              </div>
            </div>
            <div className="flex flex-col justify-between h-full py-4 space-y-16 lg:space-y-0">
              <div>
                <span className="text-[var(--jesuites-blue)]/40 font-bold tracking-[0.4em] uppercase text-xs mb-6 block font-serif">Propòsit Docent</span>
                <h2 className="text-6xl md:text-8xl font-bold text-[var(--jesuites-blue)] mb-0 tracking-tighter leading-none font-serif uppercase">Raons de <span className="italic opacity-60">fons</span></h2>
              </div>
              <div className="space-y-10">
                <div className="bg-black/5 p-12 rounded-[3.5rem] border border-black/5 hover:bg-[var(--jesuites-cream)] transition-all">
                  <h4 className="font-bold text-[var(--jesuites-blue)] mb-3 uppercase text-base tracking-widest font-serif">Renovació de la tradició</h4>
                  <p className="text-2xl text-gray-500 font-light leading-snug">Integrar l'IA com una oportunitat per renovar la nostra tradició educativa a través del pensament crític.</p>
                </div>
                <div className="bg-black/5 p-12 rounded-[3.5rem] border border-black/5 hover:bg-[var(--jesuites-cream)] transition-all">
                  <h4 className="font-bold text-[var(--jesuites-blue)] mb-3 uppercase text-base tracking-widest font-serif">Acompanyament en l'error</h4>
                  <p className="text-2xl text-gray-500 font-light leading-snug">Educar en la imaginació i l'error com a oportunitat de creixement, elements que cap algoritme pot substituir.</p>
                </div>
                {/* Internal arrow requested for "Raons de fons" */}
                <div className="pt-8"><SectionArrow targetId="objectives-heading" /></div>
              </div>
            </div>
          </div>

          <div>
            <div id="objectives-heading" className="mb-20">
              <span className="text-[var(--jesuites-blue)]/40 font-bold tracking-[0.4em] uppercase text-xs mb-6 block font-serif">Fites Estratègiques</span>
              <h2 className="text-6xl md:text-8xl font-bold text-[var(--jesuites-blue)] tracking-tighter font-serif uppercase">Objectius</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { title: "Institucional", icon: Settings, desc: "Maximitzar l'eficàcia i eficiència institucional per alliberar-nos de càrregues no essencials." },
                { title: "Docent", icon: Lightbulb, desc: "Eines per a una docència de qualitat, més integral, personalitzada i basada en l'evidència." },
                { title: "Alumnat", icon: Target, desc: "Desenvolupar responsabilitat ètica i millora contínua en la seva competència digital." }
              ].map((obj, i) => (
                <div key={i} className="bg-[var(--jesuites-cream)] p-12 rounded-[4rem] border border-black/[0.03] group hover:bg-[var(--jesuites-blue)] hover:text-white transition-all duration-700">
                  <obj.icon size={48} className="mb-10 text-[var(--jesuites-blue)] group-hover:text-amber-200 transition-colors" />
                  <h3 className="text-3xl md:text-4xl font-bold font-serif mb-6 uppercase leading-tight">{obj.title}</h3>
                  <p className="text-xl font-light opacity-60 leading-snug">{obj.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <SectionArrow targetId="principles-section" />
        </div>
      </section>

      {/* 3. VALORS RECTORS */}
      <section id="principles-section" className="reveal-section py-40 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-32 px-6">
          <span className="text-[var(--jesuites-blue)]/40 font-bold tracking-[0.4em] uppercase text-xs mb-6 block font-serif">Cultura Institucional</span>
          <h2 className="text-6xl md:text-[10rem] font-bold text-[var(--jesuites-blue)] tracking-tighter font-serif uppercase leading-tight">Valors Rectors</h2>
        </div>
        <div className="space-y-6">
          {PRINCIPLES.map((p) => (
            <div key={p.id} onClick={() => setExpandedValue(expandedValue === p.id ? null : p.id)} className={`bg-white rounded-[3.5rem] transition-all duration-700 border border-black/[0.04] overflow-hidden ${expandedValue === p.id ? 'shadow-2xl ring-4 ring-[var(--jesuites-blue)]/5' : 'shadow-sm'}`}>
              <div className="p-8 md:p-10 flex flex-col md:flex-row items-center gap-10 cursor-pointer group">
                <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shrink-0 transition-all duration-500 ${expandedValue === p.id ? 'bg-[var(--jesuites-blue)] text-white' : 'bg-[var(--jesuites-cream)] text-[var(--jesuites-blue)] group-hover:scale-110'}`}><p.icon size={36} /></div>
                <div className="flex-1 text-center md:text-left">
                  <h4 className="text-3xl md:text-5xl font-bold text-[var(--jesuites-blue)] uppercase tracking-tighter font-serif mb-2 leading-none">{p.title}</h4>
                  <p className="text-lg text-gray-400 font-light uppercase tracking-widest">{p.intro}</p>
                </div>
                <div className={`w-12 h-12 rounded-full border border-black/10 flex items-center justify-center transition-all duration-500 ${expandedValue === p.id ? 'bg-[var(--jesuites-blue)] text-white rotate-180' : 'text-[var(--jesuites-blue)]'}`}><ChevronDown size={20} /></div>
              </div>
              <div className={`transition-all duration-700 overflow-hidden ${expandedValue === p.id ? 'max-h-[1200px] opacity-100 p-8 md:p-12 md:pb-16 pt-0' : 'max-h-0 opacity-0'}`}>
                <div className="border-t border-black/5 pt-6 md:pt-8 space-y-6 md:space-y-8">
                  <p className="text-xl md:text-2xl text-gray-600 font-light italic leading-snug md:px-6">"{p.full}"</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:px-6">
                    {p.points.map((pt, i) => (
                      <div key={i} className="flex gap-4 items-center text-sm font-bold text-[var(--jesuites-blue)] uppercase tracking-tighter italic bg-[var(--jesuites-cream)] p-5 rounded-3xl">
                        <CheckCircle2 size={20} className="text-green-500 shrink-0" /> {pt}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <SectionArrow targetId="tensions-section" />
      </section>

      {/* 4. TENSIONS (NEW ACCORDION STYLE) */}
      <section id="tensions-section" className="reveal-section py-40 bg-[var(--jesuites-blue)] text-white overflow-hidden relative border-b border-white/5">
        <div className="absolute inset-0 opacity-10 pointer-events-none"><Image src="/imatges/mirades-obertes-3.jpg" alt="Bg" fill className="object-cover grayscale" /></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="mb-32 text-center px-6">
            <span className="text-white/40 font-bold tracking-[0.4em] uppercase text-xs mb-8 block font-serif">Reflexió Dialèctica</span>
            <h2 className="text-6xl md:text-[12rem] font-bold mb-10 tracking-tighter italic font-serif leading-none uppercase">Habitar les <br />Tensions</h2>
          </div>

          <div className="space-y-8 max-w-6xl mx-auto tensions-container">
            {TENSIONS.map((t) => (
              <div key={t.id} onClick={() => setExpandedTension(expandedTension === t.id ? null : t.id)} className={`bg-white/5 backdrop-blur-md rounded-[3.5rem] border border-white/10 transition-all duration-700 overflow-hidden group cursor-pointer ${expandedTension === t.id ? 'ring-4 ring-white/10 shadow-2xl scale-[1.02]' : 'hover:bg-white/10'}`}>
                <div className="p-10 md:p-12 flex flex-col md:flex-row justify-between items-center gap-10">
                  <div className="flex-1 text-center md:text-left">
                    <h4 className="text-3xl md:text-5xl font-bold uppercase tracking-widest text-amber-200 font-serif leading-none mb-4">{t.title}</h4>
                    <p className="text-lg md:text-xl font-light text-white/50 italic leading-snug">{t.desc}</p>
                  </div>
                  <div className={`w-14 h-14 rounded-full border border-white/20 flex items-center justify-center transition-all duration-500 ${expandedTension === t.id ? 'bg-amber-200 text-[var(--jesuites-blue)] rotate-180' : 'text-white'}`}>
                    <ChevronDown size={24} />
                  </div>
                </div>

                <div className={`transition-all duration-700 overflow-hidden ${expandedTension === t.id ? 'max-h-[1000px] opacity-100 p-10 md:p-20 pt-0' : 'max-h-0 opacity-0'}`}>
                  <div className="border-t border-white/10 pt-16 flex flex-col md:flex-row justify-between items-start gap-20 md:gap-32 relative">
                    {/* Left Pole */}
                    <div className="flex-1 text-center md:text-left space-y-8 w-full relative z-10">
                      <h4 className="text-5xl md:text-7xl font-bold font-serif uppercase tracking-tight text-white leading-none whitespace-pre-line group-hover:-translate-x-2 transition-transform">{t.left.replace(" ", "\n")}</h4>
                      <p className="text-xl md:text-2xl font-light text-white/40 italic leading-snug">{t.leftDesc}</p>
                    </div>

                    {/* Subtle VS Watermark - Absolute centered, no extra spacing */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none flex items-center justify-center opacity-20">
                      <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white/5 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="text-white font-black text-5xl md:text-7xl tracking-tighter select-none">VS</span>
                      </div>
                    </div>

                    {/* Right Pole */}
                    <div className="flex-1 text-center md:text-right space-y-8 w-full relative z-10">
                      <h4 className="text-5xl md:text-7xl font-bold font-serif uppercase tracking-tight text-white leading-none whitespace-pre-line group-hover:translate-x-2 transition-transform">{t.right.replace(" ", "\n")}</h4>
                      <p className="text-xl md:text-2xl font-light text-white/40 italic leading-snug">{t.rightDesc}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div
            className="flex justify-center mt-20 mb-4 opacity-70 animate-bounce cursor-pointer hover:opacity-100 transition-opacity"
            onClick={() => document.getElementById('model-4d-section')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <ChevronDown size={32} className="text-amber-200" />
          </div>
        </div>
      </section>

      {/* 5. MODEL 4D */}
      <section id="model-4d-section" className="reveal-section py-40 px-6 bg-[var(--jesuites-cream)] overflow-hidden">
        <div className="max-w-7xl mx-auto lg:grid lg:grid-cols-12 gap-24 items-start">
          <div className="lg:col-span-5 mb-16 lg:mb-0">
            <span className="text-[var(--jesuites-blue)]/40 font-bold tracking-[0.4em] uppercase text-xs mb-8 block font-serif">Capacitació Operativa</span>
            <h2 className="text-7xl md:text-9xl font-bold text-[var(--jesuites-blue)] mb-10 tracking-tighter uppercase font-serif leading-none">Fluidesa <br />en IA <br /><span className="italic opacity-30 font-light font-sans text-5xl md:text-7xl">Model 4D</span></h2>
            <p className="text-2xl md:text-3xl text-gray-500 font-light max-w-xl leading-snug">Marc sòcio-tècnic estructurat en quatre dimensions que s'alimenten recursivament.</p>
          </div>
          <div className="lg:col-span-7 flex flex-col gap-4">
            {MODEL_4D.map((d) => (
              <div key={d.id} onClick={() => setExpandedD(expandedD === d.id ? null : d.id)} className={`bg-white rounded-[2rem] shadow-sm cursor-pointer transition-all duration-700 border border-black/[0.04] overflow-hidden ${expandedD === d.id ? 'ring-4 ring-[var(--jesuites-blue)]/10 z-10' : 'opacity-90'}`}>
                <div className="p-8 md:p-10">
                  <div className="flex justify-between items-center gap-6">
                    <div className="flex items-center gap-6 min-w-0">
                      <span className="text-4xl md:text-5xl font-bold text-[var(--jesuites-blue)] opacity-10 font-serif leading-none">{d.id}</span>
                      <div className="min-w-0">
                        <h4 className="text-2xl md:text-3xl font-bold text-[var(--jesuites-blue)] uppercase tracking-tight font-serif leading-none mb-2 truncate">{d.name}</h4>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest truncate">{d.subtitle}</p>
                      </div>
                    </div>
                    <d.icon size={26} className={`transition-all shrink-0 ${expandedD === d.id ? 'text-amber-500 rotate-12' : 'text-[var(--jesuites-blue)]/20'}`} />
                  </div>
                  <div className={`transition-all duration-700 overflow-hidden ${expandedD === d.id ? 'max-h-[1000px] opacity-100 mt-8 pt-8 border-t border-black/5' : 'max-h-0 opacity-0'}`}>
                    <p className="text-xl md:text-2xl text-gray-600 font-light italic mb-8">"{d.desc}"</p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">{d.details.map((dt, idx) => (
                      <li key={idx} className="flex gap-4 items-center text-xs font-bold text-[var(--jesuites-blue)] uppercase italic bg-[var(--jesuites-cream)] p-4 rounded-xl"><CheckCircle2 size={20} className="text-amber-500 shrink-0" /> {dt}</li>
                    ))}</ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <SectionArrow targetId="delegation-section" />
      </section>

      {/* 6. NIVELLS DE DELEGACIÓ */}
      <section id="delegation-section" className="reveal-section py-40 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-48">
            <span className="text-[var(--jesuites-blue)]/40 font-bold tracking-[0.4em] uppercase text-xs mb-8 block font-serif">Interacció Humà - IA</span>
            <h2 className="text-6xl md:text-[10rem] font-bold text-[var(--jesuites-blue)] mb-12 tracking-tighter font-serif uppercase leading-none italic">NIVELLS DE <br />DELEGACIÓ</h2>
          </div>
          <div className="space-y-6">
            {DELEGATION_LEVELS.map((l) => (
              <div key={l.lv} onClick={() => setExpandedLv(expandedLv === l.lv ? null : l.lv)} className={`bg-white rounded-[3.5rem] md:rounded-[4rem] transition-all duration-700 border border-black/[0.04] overflow-hidden ${expandedLv === l.lv ? 'shadow-2xl ring-4 ring-[var(--jesuites-blue)]/5' : 'shadow-sm opacity-90'}`}>
                <div className="p-8 md:p-10 flex flex-col md:flex-row items-center gap-10 cursor-pointer group">
                  <div className="flex-1 flex items-center gap-10 md:gap-14 min-w-0 w-full overflow-hidden">
                    <span className="text-8xl md:text-[11.5rem] font-bold text-[var(--jesuites-blue)] opacity-15 font-serif leading-none md:-mt-4 shrink-0 transition-opacity group-hover:opacity-30">{l.lv}</span>
                    <div className="min-w-0">
                      <h4 className="text-4xl md:text-[5.5rem] font-bold text-[var(--jesuites-blue)] uppercase font-serif leading-none mb-3 truncate pr-4">{l.name}</h4>
                      <span className="text-xs md:text-base font-bold text-gray-400 uppercase tracking-[.4em] block truncate">{l.sub}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-12 shrink-0">
                    <div className="relative w-24 h-24 md:w-36 md:h-36 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-[10px] md:border-[14px] border-black/[0.05]" />
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle cx="50%" cy="50%" r="41.5%" className="stroke-[var(--jesuites-blue)] fill-transparent stroke-[10] md:stroke-[14]" strokeDasharray="1000" strokeDashoffset={(1000 - (1000 * (l.human / 100))).toString()} strokeLinecap="round" />
                      </svg>
                      <div className="flex flex-col items-center">
                        <span className="text-2xl md:text-5xl font-bold font-serif text-[var(--jesuites-blue)] leading-none">{l.human}%</span>
                        <span className="text-[8px] md:text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">HUMÀ</span>
                      </div>
                    </div>
                    <div className={`w-12 h-12 rounded-full border border-black/10 flex items-center justify-center transition-all ${expandedLv === l.lv ? 'bg-[var(--jesuites-blue)] text-white rotate-180' : 'text-[var(--jesuites-blue)]'}`}><ChevronDown size={20} /></div>
                  </div>
                </div>
                <div className={`transition-all duration-700 overflow-hidden ${expandedLv === l.lv ? 'max-h-[1400px] opacity-100 p-8 md:p-14 md:pt-0' : 'max-h-0 opacity-0'}`}>
                  <div className="border-t border-black/5 pt-8 space-y-8">
                    <p className="text-xl md:text-3xl font-light text-gray-600 italic leading-snug md:px-10">"{l.desc}"</p>
                    <div className="md:px-10"><ExamplesCarousel examples={l.examples} /></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="py-40 text-center bg-white border-t border-black/5">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex justify-center mb-16 opacity-30 grayscale brightness-0"><Image src="/imatges/FJE-trans.png" alt="Logo FJE" width={280} height={100} className="h-auto w-48 md:w-64" /></div>
          <p className="text-[11px] font-bold uppercase tracking-[0.5em] text-gray-300 mt-20">Jesuïtes Educació • Marc General IA 2026</p>
        </div>
      </footer>
    </main>
  );
}
