"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { supabase } from "@/lib/supabase";
import {
  ChevronDown, Users, Eye, Search, Heart, ShieldCheck,
  ArrowRightLeft, FileText, Gavel, User, Cpu, Sparkles, Settings,
  MessageSquare, Layers, Quote, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight,
  Info, Target, Lightbulb
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
      "Prevenció de la dependència cognitiva (IA com a copilot, no pilot)"
    ]
  },
  {
    id: "transparencia",
    title: "Transparència i Integritat",
    icon: Eye,
    intro: "Ús visible i honorable de la tecnologia.",
    full: "Fomentem l'honestedat en l'ús de la IA. Evolucionem del concepte de 'copiar' al de 'generar pensament propi', avaluant la capacitat de l'alumne d'utilitzar l'eina per a una elaboració original.",
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
      "Fiabilitat i contrast sistemàtic amb fonts externes",
      "Mitigació activa de biaixos algorítmics"
    ]
  },
  {
    id: "equitat",
    title: "Equitat i Inclusió",
    icon: Heart,
    intro: "Instrument per reduir bretxes i diversitat.",
    full: "La IA ha de ser una eina per arribar a tothom. L'utilitzem per atendre múltiples necessitats educatives sota supervisió docent, evitant que les versions de pagament generin avantatges injustos.",
    points: [
      "Accés universal a eines institucionals",
      "Accessibilitat per disseny (diversitat funcional)",
      "Personalització inclusiva de l'aprenentatge"
    ]
  },
  {
    id: "benestar",
    title: "Benestar i Sostenibilitat",
    icon: ShieldCheck,
    intro: "Relació equilibrada amb l'entorn i compromís ambiental.",
    full: "Som conscients de l'impacte energètic i hídric de la IA. Promovem la desconnexió com a valor i el manteniment d'una frontera clara entre l'activitat digital i la interacció física.",
    points: [
      "Integritat i seguretat de les dades (RGPD)",
      "Salut digital i dret a la desconnexió",
      "Justícia socioambiental i consum responsable"
    ]
  }
];

const TENSIONS = [
  {
    id: "humanisme",
    left: "Humanisme clàssic",
    leftDesc: "Mantenir la tecnologia com una eina externa i controlable per reforçar la nostra essència humana més profunda.",
    right: "Posthumanisme crític",
    rightDesc: "Assumir que la hibridació digital ja forma part de nosaltres i amplificar les nostres capacitats cognitives.",
    title: "Integritat Humana",
    desc: "Habitar l'ecosistema digital reconeixent la hibridació sense perdre la centralitat i dignitat de la persona."
  },
  {
    id: "agencia",
    left: "Offloading",
    leftDesc: "Alliberar-nos de tasques repetitives i mecàniques per guanyar temps per a les relacions i l'acompanyament.",
    right: "Outsourcing",
    rightDesc: "Risc d'externalitzar el reflexió crítica i el judici ètic en mans de sistemes algorítmics opacs.",
    title: "Autonomia i Agència",
    desc: "Diferenciem entre estalviar temps en la repetició i perdre la responsabilitat i la veu en la presa de decisions."
  },
  {
    id: "cognicio",
    left: "Fricció productiva",
    leftDesc: "Protegir el valor de l'esforç, la dificultat desitjable i el temps necessari per a l'aprenentatge significatiu.",
    right: "Eficiència",
    rightDesc: "Aprofitar la immediatesa i l'optimització de resultats que ens ofereix la intel·ligència artificial generativa.",
    title: "Profunditat Cognitiva",
    desc: "Defensem el pensament lent i la concentració davant la temptació d'anul·lar l'esforç intel·lectual."
  },
  {
    id: "presencia",
    left: "Economia de l'Atenció",
    leftDesc: "Davant la fragmentació digital, la dopamina ràpida i la mercantilització del nostre temps a la xarxa.",
    right: "Economia de la Intenció",
    rightDesc: "Mantenir una presència plena i conscient, amb una intencionalitat clara en cada interacció digital.",
    title: "Vincles i Presència",
    desc: "Recuperem la calidesa i la intencionalitat en la trobada humana davant la sorollosa distracció dels algorismes."
  },
  {
    id: "justicia",
    left: "Biaixos",
    leftDesc: "Consciència de les dades històriques i els prejudicis que els models de llenguatge poden perpetuar i amplificar.",
    right: "Justícia Algorítmica",
    rightDesc: "Treballar activament per un disseny inclusiu i una auditoria social que garanteixi l'equitat tecnológica.",
    title: "Justícia i Equitat",
    desc: "Vigilar proactivament que la intel·ligència artificial no esdevingui una nova eina d'exclusió estructural."
  },
  {
    id: "veritat",
    left: "Plausibilitat",
    leftDesc: "Saber que l'IA genera resultats basats en versemblança estadística que poden semblar veritables però no ho són.",
    right: "Realisme",
    rightDesc: "Compromís amb la veritat factual, el contrast de fonts i la integritat de la producció intel·lectual.",
    title: "Integritat Intel·lectual",
    desc: "Aprendre a distingir un text que 'sembla correcte' d'una veritat argumentada, verificada i amb fonament."
  }
];

const MODEL_4D = [
  {
    id: "D1",
    name: "Delegació",
    label: "Delegation",
    icon: ArrowRightLeft,
    subtitle: "Saber decidir qui fa què.",
    desc: "Prendre decisions reflexives sobre quin treball és per a un mateix i quin per a la IA. No deleguem per evitar l'esforç, sinó per optimitzar el propòsit d'excel·lència.",
    details: ["Consciència del problema", "Consciència de la plataforma", "Triatge estratègic"]
  },
  {
    id: "D2",
    name: "Descripció",
    label: "Description",
    icon: FileText,
    subtitle: "Saber demanar amb precisió.",
    desc: "Traduir la intenció humana en instruccions semàntiques (prompts). La qualitat de l'output depèn directament de la nostra claredat de pensament.",
    details: ["Definició de producte", "Descripció de procés (Chain of Thought)", "Rol i performance"]
  },
  {
    id: "D3",
    name: "Discerniment",
    label: "Discernment",
    icon: Gavel,
    subtitle: "Saber jutjar el resultat.",
    desc: "Avaluar de manera crítica i reflexiva tot allò que produeix l'IA. Actua com el sistema de control de qualitat ètic i epistèmic.",
    details: ["Verificació factual", "Detecció d'al·lucinacions", "Filtre de veracitat i biaixos"]
  },
  {
    id: "D4",
    name: "Diligència",
    label: "Diligence",
    icon: ShieldCheck,
    subtitle: "Saber-se responsable final.",
    desc: "Governança ètica i responsabilitat en l'acció. Transforma l'habilitat tècnica en ciutadania digital compromesa.",
    details: ["Seguretat i privadesa", "Transparència i autoria", "Impacte socioambiental"]
  }
];

const DELEGATION_LEVELS = [
  {
    lv: 0,
    name: "Preservació",
    sub: "No delegació",
    human: 100,
    ia: 0,
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
    lv: 1,
    name: "Exploració",
    sub: "Font d'idees",
    human: 90,
    ia: 10,
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
    lv: 2,
    name: "Suport",
    sub: "Refinament",
    human: 70,
    ia: 30,
    desc: "La persona crea el contingut base i l'IA proposa millores, correccions o refinament d'estil.",
    examples: [
      { subject: "Història", activity: "Revisió d'un assaig: suggeriments en l'estructura o el to." },
      { subject: "Anglès", activity: "Autocorrecció de gramàtica i propostes de vocabulari variat." },
      { subject: "Matemàtiques", activity: "Tutor socràtic que ajuda a detectar l'error en un procediment." },
      { subject: "Física", activity: "Millora de la redacció de les conclusions d'un laboratori." },
      { subject: "Llengua", activity: "Detecció de faltes de coherència o repeticions en un text propi." }
    ]
  },
  {
    lv: 3,
    name: "Cocreació",
    sub: "Estratègica",
    human: 50,
    ia: 50,
    desc: "Treball iteratiu on persona i IA alternen el lideratge en el disseny i l'execució.",
    examples: [
      { subject: "Música", activity: "Creació melòdica conjunta: l'IA proposa acords, l'humà la lletra." },
      { subject: "Tecnologia", activity: "Programació assistida: co-escriptura de codi amb realimentació." },
      { subject: "Projectes", activity: "Disseny de guions per a podcast i edició d'àudio híbrida." },
      { subject: "Emprenedoria", activity: "Desenvolupament d'un model de negoci iterant amb l'IA." },
      { subject: "Art", activity: "Instal·lació interactiva on l'IA processa dades en viu." }
    ]
  },
  {
    lv: 4,
    name: "Delegació",
    sub: "Supervisada",
    human: 20,
    ia: 80,
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
    lv: 5,
    name: "Agència",
    sub: "Autònoma",
    human: 5,
    ia: 95,
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

// Reusable Carousel Component for better space management
function ExamplesCarousel({ examples }: { examples: any[] }) {
  const [currentEx, setCurrentEx] = useState(0);
  const nextEx = () => setCurrentEx((prev) => (prev + 1) % examples.length);
  const prevEx = () => setCurrentEx((prev) => (prev - 1 + examples.length) % examples.length);

  return (
    <div className="bg-[var(--jesuites-cream)] rounded-[2.5rem] p-6 md:p-10 relative overflow-hidden group/item border border-black/[0.02] w-full">
      <div className="flex justify-between items-center mb-6 border-b border-black/5 pb-4">
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400 block">Exemples d'aula</span>
        <div className="flex gap-3">
          <button onClick={prevEx} className="p-2.5 hover:bg-[var(--jesuites-blue)] hover:text-white rounded-full transition-colors border border-black/5 bg-white shadow-sm shrink-0">
            <ChevronLeft size={16} />
          </button>
          <button onClick={nextEx} className="p-2.5 hover:bg-[var(--jesuites-blue)] hover:text-white rounded-full transition-colors border border-black/5 bg-white shadow-sm shrink-0">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div className="relative min-h-[7rem] md:min-h-[6rem] flex items-center">
        {examples.map((ex, idx) => (
          <div
            key={idx}
            className={`transition-all duration-700 transform w-full ${idx === currentEx ? 'relative opacity-100 translate-x-0' : 'absolute inset-0 opacity-0 translate-x-12 pointer-events-none'}`}
          >
            <div className="bg-white/95 p-6 rounded-[2rem] shadow-sm flex items-start gap-6 border border-black/[0.02]">
              <div className="bg-[var(--jesuites-blue)]/5 p-4 rounded-2xl shrink-0 hidden md:block">
                <Sparkles size={22} className="text-[var(--jesuites-blue)]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-[var(--jesuites-blue)] uppercase mb-2 block tracking-widest">{ex.subject}</span>
                <p className="text-lg md:text-xl text-gray-700 font-light leading-tight break-words">{ex.activity}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-2 mt-8">
        {examples.map((_, i) => (
          <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === currentEx ? 'w-10 bg-[var(--jesuites-blue)]' : 'w-2 bg-[var(--jesuites-blue)]/10'}`} />
        ))}
      </div>
    </div>
  );
}

// Delegation Component with liked Accordion Logic
function DelegationLevelAccordion({ l, isExpanded, onToggle }: { l: any, isExpanded: boolean, onToggle: () => void }) {
  return (
    <div className={`bg-white rounded-[4rem] transition-all duration-700 border border-black/[0.04] overflow-hidden ${isExpanded ? 'shadow-2xl ring-4 ring-[var(--jesuites-blue)]/5' : 'shadow-sm opacity-90'}`}>
      <div
        onClick={onToggle}
        className="p-8 md:p-12 cursor-pointer group hover:bg-[var(--jesuites-cream)]/30 transition-colors"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Level Number & Name */}
          <div className="md:col-span-3 flex items-center gap-8">
            <span className="text-7xl md:text-9xl font-bold text-[var(--jesuites-blue)] opacity-20 font-serif leading-none shrink-0">{l.lv}</span>
            <div className="min-w-0">
              <h4 className="text-3xl md:text-5xl font-bold text-[var(--jesuites-blue)] uppercase tracking-tighter leading-none mb-3 font-serif truncate">{l.name}</h4>
              <span className="text-[10px] font-bold text-gray-400 border border-black/10 px-4 py-1.5 rounded-full uppercase tracking-widest block w-fit shrink-0">{l.sub}</span>
            </div>
          </div>

          {/* Short Desc */}
          <div className="md:col-span-6">
            <p className="text-xl md:text-2xl font-light text-gray-500 italic truncate max-w-full">{l.desc}</p>
          </div>

          {/* Progress & Toggle */}
          <div className="md:col-span-3 flex items-center justify-end gap-10">
            <div className="relative w-24 h-24 md:w-28 md:h-28 shrink-0">
              <svg className="w-full h-full transform -rotate-90 scale-90 md:scale-100">
                <circle cx="50%" cy="50%" r="42%" className="stroke-black/[0.05] fill-transparent stroke-[8]" />
                <circle cx="50%" cy="50%" r="42%"
                  className="stroke-[var(--jesuites-blue)] fill-transparent stroke-[8] transition-all duration-1000"
                  strokeDasharray="1000"
                  strokeDashoffset={(1000 - (1000 * (l.human / 100))).toString()}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--jesuites-blue)]">
                <span className="text-2xl md:text-3xl font-bold font-serif leading-none">{l.human}%</span>
              </div>
            </div>
            <div className={`w-12 h-12 rounded-full border border-black/10 flex items-center justify-center transition-all duration-500 ${isExpanded ? 'bg-[var(--jesuites-blue)] text-white rotate-180' : 'text-[var(--jesuites-blue)]'}`}>
              <ChevronDown size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className={`transition-all duration-700 overflow-hidden ${isExpanded ? 'max-h-[1000px] opacity-100 p-8 md:p-14 md:pt-0' : 'max-h-0 opacity-0'}`}>
        <div className="border-t border-black/5 pt-12 mt-4 space-y-12">
          <p className="text-3xl md:text-4xl font-light text-gray-600 leading-tight italic break-words">"{l.desc}"</p>
          <ExamplesCarousel examples={l.examples} />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [votes, setVotes] = useState<any[]>([]);
  const [contributions, setContributions] = useState<any[]>([]);
  const [expandedValue, setExpandedValue] = useState<string | null>(null);
  const [expandedD, setExpandedD] = useState<string | null>(null);
  const [expandedLv, setExpandedLv] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: v } = await supabase.from("votes").select("*");
      if (v) setVotes(v);
      const { data: c } = await supabase.from("contributions").select("*");
      if (c) setContributions(c);
    };
    fetchData();

    // @ts-ignore
    const channel = supabase.channel('realtime-updates')
      // @ts-ignore
      .on('postgres_changes' as any, { event: 'INSERT', table: 'votes' }, (p: any) => setVotes(c => [...c, p.new]))
      // @ts-ignore
      .on('postgres_changes' as any, { event: 'INSERT', table: 'contributions' }, (p: any) => setContributions(c => [...c, p.new]))
      .subscribe();

    const ctx = gsap.context(() => {
      gsap.from(".hero-text", { y: 150, opacity: 0, stagger: 0.2, duration: 2, ease: "expo.out" });

      gsap.utils.toArray(".reveal-section").forEach((section: any) => {
        gsap.from(section, {
          scrollTrigger: { trigger: section, start: "top 85%", toggleActions: "play none none reverse" },
          y: 80, opacity: 0, duration: 1.5, ease: "power4.out"
        });
      });

      gsap.from(".tension-marker", {
        scrollTrigger: { trigger: ".tensions-container", start: "top 60%" },
        scale: 0, opacity: 0, duration: 1, stagger: 0.1, ease: "back.out(2)"
      });
    }, containerRef);

    return () => { ctx.revert(); supabase.removeChannel(channel); };
  }, []);

  const getVotes = (itemId: string, type: string) => votes.filter(v => v.item_id === itemId && v.vote_type === type).length;

  return (
    <main ref={containerRef} className="relative min-h-screen bg-[var(--jesuites-cream)] selection:bg-[var(--jesuites-blue)] pb-64 font-sans leading-relaxed text-[var(--jesuites-text)]">

      {/* 1. HERO */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-black">
          <Image src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2000" alt="Background" fill className="object-cover opacity-50 scale-10" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-[var(--jesuites-cream)] gap-8" />
        </div>
        <div className="hero-content relative z-10 text-center px-6 max-w-7xl mx-auto">
          <Image src="/imatges/FJE-trans.png" alt="Logo" width={280} height={100} className="mx-auto mb-16 h-auto w-48 md:w-64" priority />
          <div className="hero-text mb-12">
            <span className="text-[var(--jesuites-cream)]/70 font-bold tracking-[0.5em] uppercase text-xl md:text-2xl mb-8 block font-serif">Marc General d'Integració d'IA</span>
            <h1 className="text-7xl md:text-[10rem] font-bold text-white leading-[0.8] tracking-tighter uppercase drop-shadow-2xl font-serif">MIRADES<br />OBERES</h1>
          </div>
          <p className="hero-text text-2xl md:text-4xl font-light text-white/70 uppercase tracking-[0.4em] font-serif max-w-6xl mx-auto leading-tight italic">Navegant l'Era de la Intel·ligència Artificial <br className="hidden md:block" /> des de l'Humanisme i el Diàleg</p>

          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-30 animate-bounce cursor-pointer" onClick={() => document.getElementById('details-intro')?.scrollIntoView({ behavior: 'smooth' })}>
            <ChevronDown size={40} className="text-white" />
          </div>
        </div>
      </section>

      {/* 2. INTRODUCCIÓ (MOTIUS I OBJECTIUS) */}
      <section id="details-intro" className="reveal-section py-48 px-6 bg-white overflow-hidden border-b border-black/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start mb-56">
            <div className="relative group">
              <div className="absolute -inset-4 bg-[var(--jesuites-blue)]/5 rounded-[4rem] -rotate-2 group-hover:rotate-0 transition-transform duration-700" />
              <div className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl">
                <Image src="/imatges/mirades-obertes-2.jpg" alt="Visió" fill className="object-cover" />
              </div>
            </div>
            <div className="space-y-16">
              <div>
                <span className="text-[var(--jesuites-blue)]/40 font-bold tracking-[0.4em] uppercase text-xs mb-6 block font-serif">El per què</span>
                <h2 className="text-6xl md:text-9xl font-bold text-[var(--jesuites-blue)] mb-10 tracking-tighter leading-none font-serif uppercase">Raons de <span className="italic opacity-60">fons</span></h2>
              </div>
              <div className="space-y-10">
                <div className="bg-black/5 p-12 rounded-[3.5rem] border border-black/5 hover:translate-x-4 transition-transform duration-500">
                  <h4 className="font-bold text-[var(--jesuites-blue)] mb-4 uppercase text-lg tracking-widest font-serif">Renovació de la tradició</h4>
                  <p className="text-2xl text-gray-500 font-light leading-snug">Integrar la IA com una oportunitat per renovar la nostra tradició educativa a través del pensament crític.</p>
                </div>
                <div className="bg-black/5 p-12 rounded-[3.5rem] border border-black/5 hover:translate-x-4 transition-transform duration-500">
                  <h4 className="font-bold text-[var(--jesuites-blue)] mb-4 uppercase text-lg tracking-widest font-serif">Acompanyament en l'error</h4>
                  <p className="text-2xl text-gray-500 font-light leading-snug">Educar en la imaginació, l'ironia i l'error com a oportunitat de creixement, elements que cap algoritme pot substituir.</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-20">
              <span className="text-[var(--jesuites-blue)]/40 font-bold tracking-[0.4em] uppercase text-xs mb-6 block font-serif">Projecte Educatiu</span>
              <h2 className="text-6xl md:text-8xl font-bold text-[var(--jesuites-blue)] tracking-tighter font-serif uppercase leading-none">Objectius</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { title: "Gestió Institucional", icon: Settings, desc: "Millora en l'eficàcia i l'eficiència institucional per alliberar-nos de càrregues no essencials." },
                { title: "Pràctica Docent", icon: Lightbulb, desc: "Eines per a una docència més integral, personalitzada i basada en l'evidència compartida." },
                { title: "Aprenentatge Alumnat", icon: Target, desc: "Desenvolupar responsabilitat ètica, competència digital creativa i un judici crític adult." }
              ].map((obj, i) => (
                <div key={i} className="bg-[var(--jesuites-cream)] p-14 rounded-[4rem] border border-black/[0.03] group hover:bg-[var(--jesuites-blue)] hover:text-white transition-all duration-700">
                  <obj.icon size={56} className="mb-12 text-[var(--jesuites-blue)] group-hover:text-amber-200 transition-colors" />
                  <h3 className="text-3xl md:text-4xl font-bold font-serif mb-6 uppercase tracking-tight leading-none">{obj.title}</h3>
                  <p className="text-xl font-light opacity-60 leading-snug">{obj.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. VALORS (ACCORDION STYLE FOR STABILITY) */}
      <section className="reveal-section py-48 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-32">
          <span className="text-[var(--jesuites-blue)]/40 font-bold tracking-[0.4em] uppercase text-xs mb-6 block font-serif">Compromís Innegociable</span>
          <h2 className="text-7xl md:text-[10rem] font-bold text-[var(--jesuites-blue)] tracking-tighter font-serif uppercase leading-tight">Valors Rectors</h2>
        </div>

        <div className="space-y-8">
          {PRINCIPLES.map((p) => (
            <div
              key={p.id}
              onClick={() => setExpandedValue(expandedValue === p.id ? null : p.id)}
              className={`bg-white rounded-[4rem] transition-all duration-700 border border-black/[0.04] overflow-hidden ${expandedValue === p.id ? 'shadow-2xl ring-4 ring-[var(--jesuites-blue)]/5' : 'shadow-sm'}`}
            >
              <div className="p-10 md:p-14 flex flex-col md:flex-row items-center gap-10 cursor-pointer group">
                <div className={`w-28 h-28 rounded-3xl flex items-center justify-center shrink-0 transition-all duration-500 ${expandedValue === p.id ? 'bg-[var(--jesuites-blue)] text-white' : 'bg-[var(--jesuites-cream)] text-[var(--jesuites-blue)] group-hover:scale-110'}`}>
                  <p.icon size={48} />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h4 className="text-4xl md:text-6xl font-bold text-[var(--jesuites-blue)] uppercase tracking-tighter font-serif mb-4 leading-none">{p.title}</h4>
                  <p className="text-xl text-gray-400 font-light uppercase tracking-widest">{p.intro}</p>
                </div>
                <div className={`w-14 h-14 rounded-full border border-black/10 flex items-center justify-center transition-all duration-500 ${expandedValue === p.id ? 'bg-[var(--jesuites-blue)] text-white rotate-180' : 'text-[var(--jesuites-blue)]'}`}>
                  <ChevronDown size={24} />
                </div>
              </div>

              <div className={`transition-all duration-700 overflow-hidden ${expandedValue === p.id ? 'max-h-[1000px] opacity-100 p-10 md:p-20 md:pt-0' : 'max-h-0 opacity-0'}`}>
                <div className="border-t border-black/5 pt-16 space-y-12">
                  <p className="text-3xl md:text-4xl text-gray-600 font-light italic leading-snug">"{p.full}"</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {p.points.map((pt, i) => (
                      <div key={i} className="flex gap-6 items-center text-lg font-bold text-[var(--jesuites-blue)] uppercase tracking-tighter italic bg-[var(--jesuites-cream)] p-8 rounded-[2.5rem]">
                        <CheckCircle2 size={28} className="text-green-500 shrink-0" /> {pt}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. TENSIONS (COMPACT VERSION) */}
      <section className="reveal-section py-48 bg-[var(--jesuites-blue)] text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <Image src="/imatges/mirades-obertes-3.jpg" alt="Bg" fill className="object-cover grayscale" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="mb-48 text-center">
            <span className="text-white/40 font-bold tracking-[0.4em] uppercase text-xs mb-8 block font-serif">Acompanyament Actiu</span>
            <h2 className="text-6xl md:text-[12rem] font-bold mb-10 tracking-tighter italic font-serif leading-[0.85] uppercase">Habitar les <br />Tensions</h2>
            <p className="text-3xl text-white/50 font-light max-w-4xl mx-auto italic mt-12 leading-snug">
              "No volem eliminar-les de manera simplista, sinó gestionar-les des de la reflexió compartida, reconeixent que la intel·ligència artificial no és neutra."
            </p>
          </div>

          <div className="grid grid-cols-1 gap-64 tensions-container px-6">
            {TENSIONS.map((t) => (
              <div key={t.id} className="relative group">
                <div className="flex flex-col md:flex-row justify-between items-center gap-20 md:gap-32 w-full">
                  <div className="flex-1 text-center md:text-left space-y-10 w-full">
                    <h4 className="text-5xl md:text-8xl font-bold font-serif uppercase tracking-tight group-hover:text-amber-200 transition-colors leading-none">{t.left}</h4>
                    <p className="text-2xl md:text-3xl font-light text-white/50 italic max-w-lg md:mx-0 mx-auto leading-tight">{t.leftDesc}</p>
                  </div>

                  <div className="relative flex-shrink-0 w-full md:w-80 h-[2px] bg-white/20 flex items-center justify-center">
                    <div className="tension-marker relative z-10 w-16 h-16 rounded-full bg-white shadow-[0_0_60px_rgba(255,255,255,1)] flex items-center justify-center cursor-ew-resize group-hover:scale-125 transition-transform duration-500">
                      <ArrowRightLeft size={28} className="text-[var(--jesuites-blue)]" />
                    </div>
                  </div>

                  <div className="flex-1 text-center md:text-right space-y-10 w-full">
                    <h4 className="text-5xl md:text-8xl font-bold font-serif uppercase tracking-tight group-hover:text-amber-200 transition-colors leading-none">{t.right}</h4>
                    <p className="text-2xl md:text-3xl font-light text-white/50 italic max-w-lg md:ml-auto md:mr-0 mx-auto leading-tight">{t.rightDesc}</p>
                  </div>
                </div>
                <div className="mt-32 text-center max-w-5xl mx-auto border border-white/10 bg-white/5 p-20 rounded-[5rem] backdrop-blur-md">
                  <h5 className="text-4xl font-bold uppercase tracking-widest text-amber-200 mb-8 font-serif leading-none">{t.title}</h5>
                  <p className="text-3xl font-light text-white/80 italic leading-relaxed md:px-12">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. MODEL 4D SECTION (MOVED & IMPROVED) */}
      <section className="reveal-section py-48 px-6 bg-[var(--jesuites-cream)] border-b border-black/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-start">
            <div className="lg:col-span-5 sticky top-48">
              <span className="text-[var(--jesuites-blue)]/40 font-bold tracking-[0.4em] uppercase text-xs mb-8 block font-serif">Model Operatiu</span>
              <h2 className="text-7xl md:text-9xl font-bold text-[var(--jesuites-blue)] mb-12 tracking-tighter uppercase font-serif leading-none">Fluidesa <br />en IA <br /><span className="italic opacity-30 font-light font-sans text-5xl md:text-7xl">Model 4D</span></h2>
              <p className="text-3xl text-gray-500 font-light max-w-xl leading-snug">
                Un marc sòcio-tècnic basat en la responsabilitat ètica, estructurat en quatre dimensions recursives que s'alimenten entre si.
              </p>
            </div>

            <div className="lg:col-span-7 space-y-6">
              {MODEL_4D.map((d) => (
                <div
                  key={d.id}
                  onClick={() => setExpandedD(expandedD === d.id ? null : d.id)}
                  className={`bg-white rounded-[4rem] shadow-sm cursor-pointer transition-all duration-700 border border-black/[0.04] group relative hover:shadow-2xl overflow-hidden ${expandedD === d.id ? 'ring-4 ring-[var(--jesuites-blue)]/10 bg-white z-10' : 'py-4 opacity-90'}`}
                >
                  <div className="p-10 md:p-12">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-10">
                        <span className="text-6xl font-bold text-[var(--jesuites-blue)] opacity-15 font-serif leading-none shrink-0">{d.id}</span>
                        <div>
                          <h4 className="text-3xl md:text-4xl font-bold text-[var(--jesuites-blue)] uppercase tracking-tight font-serif leading-none mb-3 group-hover:translate-x-2 transition-transform">{d.name}</h4>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{d.subtitle}</p>
                        </div>
                      </div>
                      <d.icon size={40} className={`transition-all duration-700 ${expandedD === d.id ? 'text-amber-500 scale-110' : 'text-[var(--jesuites-blue)]/20'}`} />
                    </div>

                    <div className={`transition-all duration-700 overflow-hidden ${expandedD === d.id ? 'max-h-[1000px] opacity-100 mt-12 pt-12 border-t border-black/5' : 'max-h-0 opacity-0'}`}>
                      <p className="text-2xl text-gray-600 font-light leading-snug italic mb-12">"{d.desc}"</p>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {d.details.map((dt, idx) => (
                          <li key={idx} className="flex gap-6 items-center text-sm font-bold text-[var(--jesuites-blue)] uppercase tracking-tighter">
                            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                              <CheckCircle2 size={24} className="text-amber-500" />
                            </div>
                            {dt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. GRAUS DE DELEGACIÓ (ACCORDION STYLE) */}
      <section className="reveal-section py-48 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-48">
            <span className="text-[var(--jesuites-blue)]/40 font-bold tracking-[0.4em] uppercase text-xs mb-8 block font-serif">Agència i Supervisió</span>
            <h2 className="text-6xl md:text-[10rem] font-bold text-[var(--jesuites-blue)] mb-12 tracking-tighter font-serif uppercase leading-none italic">Graus de <br className="hidden md:block" /> Delegació</h2>
          </div>

          <div className="space-y-8">
            {DELEGATION_LEVELS.map((l) => (
              <DelegationLevelAccordion
                key={l.lv}
                l={l}
                isExpanded={expandedLv === l.lv}
                onToggle={() => setExpandedLv(expandedLv === l.lv ? null : l.lv)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="py-40 text-center bg-white border-t border-black/5">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex justify-center mb-20 opacity-30 grayscale brightness-0">
            <Image src="/imatges/FJE-trans.png" alt="Logo FJE" width={280} height={100} className="h-auto w-48 md:w-64" />
          </div>
          <div className="flex justify-center gap-20 mb-24 opacity-20 grayscale brightness-0">
            <Image src="/imatges/Escud blau.jpg" alt="Escut" width={60} height={60} className="h-20 w-auto" />
            <Image src="/imatges/FJE blanc CSC.png" alt="CSC" width={80} height={50} className="h-16 w-auto" />
          </div>
          <p className="text-[12px] font-bold uppercase tracking-[0.6em] text-gray-300">Jesuïtes Educació • Marc General IA 2026 • © Tots els drets reservats</p>
        </div>
      </footer>
    </main>
  );
}
