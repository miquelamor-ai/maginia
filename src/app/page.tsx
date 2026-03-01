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
    intro: "Cultura de discerniment actiu davant la versemblança.",
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
  { id: "humanisme", left: "Humanisme clàssic (Eina externa)", right: "Posthumanisme crític (Hibridació)", title: "Integritat Humana", desc: "Entre l'eina externa i l'hibridació. La tecnologia amplifica la humanitat, no l'anul·la." },
  { id: "agencia", left: "Offloading (Descàrrega mecànica)", right: "Outsourcing (Externalitzar judici)", title: "Autonomia i Agència", desc: "Diferenciem entre la descàrrega de tasques mecàniques i l'externalització del judici crític." },
  { id: "cognicio", left: "Fricció productiva (Esforç)", right: "Eficiència (Immediatesa)", title: "Profunditat Cognitiva", desc: "Defensa de la dificultat desitjable i el pensament lent davant la temptació de la resposta fàcil." },
  { id: "presencia", left: "Economia de l'Atenció (Fragmentació)", right: "Economia de la Intenció (Presència)", title: "Vincles i Presència", desc: "De la fragmentació digital a la intencionalitat en l'acompanyament docent." },
  { id: "justicia", left: "Biaixos (Dades històriques)", right: "Justícia Algorítmica (Inclusió)", title: "Justícia i Equitat", desc: "Auditoria social activa per passar dels biaixos heretats a la justícia algorítmica." },
  { id: "veritat", left: "Plausibilitat (Versemblança estadística)", right: "Realisme (Veritat factual)", title: "Integritat Intel·lectual", desc: "Capacitat de diferenciar el que 'sembla correcte' del que és realment cert." }
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
      { subject: "Filosofia", activity: "Discerniment ètic en situacions de crisi humana." },
      { subject: "Educació Física", activity: "Desenvolupament de la consciència corporal i motricitat." },
      { subject: "Interioritat", activity: "Pràctica del silenci i la consciència plena sense dispositius." },
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
      { subject: "Ciències", activity: "Interrogar l'IA per entendre un concepte abstracte o buscar analogies." },
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
      { subject: "Història", activity: "Revisió d'un assaig: l'IA suggereix millores en l'estructura o el to." },
      { subject: "Anglès", activity: "Autocorrecció de gramàtica i propostes de vocabulari més variat." },
      { subject: "Matemàtiques", activity: "L'IA actua com a tutor socràtic que ajuda a detectar l'error en un procediment." },
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
      { subject: "Música", activity: "Creació d'una melodia conjuntament: l'IA proposa acords, l'humà refina la lletra." },
      { subject: "Tecnologia", activity: "Programació assistida: co-escriptura de codi amb realimentació en temps real." },
      { subject: "Projectes", activity: "Disseny de guions per a podcast i edició d'àudio híbrida." },
      { subject: "Emprenedoria", activity: "Desenvolupament d'un model de negoci iterant idees amb l'IA." },
      { subject: "Art", activity: "Creació d'una instal·lació interactiva on l'IA processa dades en viu." }
    ]
  },
  {
    lv: 4,
    name: "Delegació",
    sub: "Supervisada",
    human: 20,
    ia: 80,
    desc: "L'IA genera la major part del producte sota instruccions molt precises; l'humà valida críticament.",
    examples: [
      { subject: "Recerca", activity: "Generació de resums de lectura tancats a partir de fonts pròpies." },
      { subject: "Administració", activity: "Creació de plantilles de pressupost a partir de dades en brut." },
      { subject: "Disseny", activity: "Producció de visuals complexos a partir de prompts tècnics d'estil." },
      { subject: "Idiomes", activity: "Traducció de textos tècnics amb supervisió humana del matís." },
      { subject: "Mates", activity: "Optimització de càlculs complexos partint de fórmules definides." }
    ]
  },
  {
    lv: 5,
    name: "Agència",
    sub: "Autònoma",
    human: 5,
    ia: 95,
    desc: "L'IA opera independentment dins d'un marc supervisat. L'humà actua com a auditor estratègic.",
    examples: [
      { subject: "Personalització", activity: "Plataformes d'aprenentatge adaptatiu amb itineraris automàtics." },
      { subject: "Anàlisi", activity: "Monitorització d'indicadors de benestar emocional de grup via sentiment analysis." },
      { subject: "Operacions", activity: "Sistemes de gestió administrativa recurrent (facturació, assistència)." },
      { subject: "Recerca", activity: "Anàlisi de grans volums de dades per identificar patrons." },
      { subject: "Educació", activity: "Generació automàtica de qüestionaris adaptatius basats en el progrés de l'alumne." }
    ]
  }
];

// Helper component for Delegation Carousel
function DelegationLevelCard({ l }: { l: any }) {
  const [currentEx, setCurrentEx] = useState(0);

  const nextEx = () => setCurrentEx((prev) => (prev + 1) % l.examples.length);
  const prevEx = () => setCurrentEx((prev) => (prev - 1 + l.examples.length) % l.examples.length);

  return (
    <div className="bg-white rounded-[4rem] p-12 md:p-20 border border-black/[0.03] shadow-lg group">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

        {/* L0-5 Num & Name */}
        <div className="lg:col-span-3 flex items-center gap-8">
          <span className="text-8xl md:text-9xl font-bold text-[var(--jesuites-blue)] opacity-20 leading-none font-serif">{l.lv}</span>
          <div>
            <h4 className="text-4xl font-bold text-[var(--jesuites-blue)] tracking-tighter uppercase mb-2 font-serif leading-none">{l.name}</h4>
            <span className="text-xs font-bold text-gray-400 border border-black/10 px-6 py-2 rounded-full uppercase tracking-widest">{l.sub}</span>
          </div>
        </div>

        {/* Description & Carousel */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-12">
          <p className="text-2xl font-light text-gray-500 leading-relaxed italic">{l.desc}</p>

          <div className="bg-[var(--jesuites-cream)] rounded-[3rem] p-12 relative overflow-hidden group/item border border-black/[0.02]">
            <div className="flex justify-between items-center mb-10 border-b border-black/5 pb-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400 block">Exemples d'aula (+14 ANYS)</span>
              <div className="flex gap-3">
                <button onClick={prevEx} className="p-3 hover:bg-[var(--jesuites-blue)] hover:text-white rounded-full transition-colors border border-black/5 bg-white shadow-sm">
                  <ChevronLeft size={18} />
                </button>
                <button onClick={nextEx} className="p-3 hover:bg-[var(--jesuites-blue)] hover:text-white rounded-full transition-colors border border-black/5 bg-white shadow-sm">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div className="relative min-h-[8rem] flex items-center">
              {l.examples.map((ex: any, idx: number) => (
                <div
                  key={idx}
                  className={`transition-all duration-700 transform w-full ${idx === currentEx ? 'relative opacity-100 translate-x-0' : 'absolute inset-0 opacity-0 translate-x-12 pointer-events-none'}`}
                >
                  <div className="bg-white/90 p-8 rounded-[3rem] shadow-sm flex items-start gap-8">
                    <div className="bg-[var(--jesuites-blue)]/5 p-4 rounded-2xl shrink-0">
                      <Sparkles size={24} className="text-[var(--jesuites-blue)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-[var(--jesuites-blue)] uppercase mb-3 block tracking-widest">{ex.subject}</span>
                      <p className="text-lg text-gray-700 font-light leading-snug break-words">{ex.activity}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-2 mt-10">
              {l.examples.map((_: any, i: number) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === currentEx ? 'w-10 bg-[var(--jesuites-blue)]' : 'w-2 bg-[var(--jesuites-blue)]/10'}`} />
              ))}
            </div>
          </div>
        </div>

        {/* Progress Circle Visual */}
        <div className="lg:col-span-12 xl:col-span-2 flex justify-center xl:justify-end">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="96" cy="96" r="88" className="stroke-black/[0.05] fill-transparent stroke-[12]" />
              <circle cx="96" cy="96" r="88"
                className="stroke-[var(--jesuites-blue)] fill-transparent stroke-[12] transition-all duration-1000"
                strokeDasharray={`${2 * Math.PI * 88}`}
                strokeDashoffset={`${2 * Math.PI * 88 * (1 - l.human / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--jesuites-blue)]">
              <span className="text-4xl font-bold font-serif leading-none">{l.human}%</span>
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">HUMÀ</span>
            </div>
          </div>
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
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-[var(--jesuites-cream)]" />
        </div>
        <div className="hero-content relative z-10 text-center px-6">
          <Image src="/imatges/FJE-trans.png" alt="Logo" width={280} height={100} className="mx-auto mb-16 h-auto w-48 md:w-64" priority />
          <div className="hero-text mb-6">
            <span className="text-[var(--jesuites-cream)]/40 font-bold tracking-[0.6em] uppercase text-xs mb-8 block font-serif">Marc General d'Integració d'IA</span>
            <h1 className="text-8xl md:text-[14rem] font-bold text-white leading-[0.75] tracking-tighter uppercase drop-shadow-2xl font-serif">MIRADES<br />OBERES</h1>
          </div>
          <p className="hero-text text-xl md:text-2xl font-light text-white/50 uppercase tracking-[0.4em] font-serif max-w-4xl mx-auto">Navegant l'Era de la Intel·ligència Artificial <br className="hidden md:block" /> des de l'Humanisme i el Discerniment</p>

          <div className="mt-20 flex justify-center gap-12">
            <div className="flex flex-col items-center">
              <span className="text-4xl font-bold text-white font-serif">{votes.length}</span>
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Interaccions</span>
            </div>
            <div className="flex flex-col items-center border-x border-white/10 px-12">
              <span className="text-4xl font-bold text-white font-serif">{contributions.length}</span>
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Aportacions</span>
            </div>
          </div>

          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-30 animate-bounce cursor-pointer" onClick={() => document.getElementById('details-intro')?.scrollIntoView({ behavior: 'smooth' })}>
            <ChevronDown size={40} className="text-white" />
          </div>
        </div>
      </section>

      {/* 2. INTRODUCCIÓ: MOTIUS I OBJECTIUS */}
      <section id="details-intro" className="reveal-section py-48 px-6 bg-white overflow-hidden border-b border-black/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center mb-40">
            <div className="relative group">
              <div className="absolute -inset-4 bg-[var(--jesuites-blue)]/5 rounded-[4rem] -rotate-2 group-hover:rotate-0 transition-transform duration-700" />
              <div className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl">
                <Image src="/imatges/mirades-obertes-2.jpg" alt="Visió" fill className="object-cover" />
              </div>
            </div>
            <div>
              <span className="text-[var(--jesuites-blue)]/40 font-bold tracking-[0.4em] uppercase text-xs mb-6 block font-serif">El per què</span>
              <h2 className="text-5xl md:text-7xl font-bold text-[var(--jesuites-blue)] mb-12 tracking-tighter leading-none font-serif uppercase">Raons de <span className="italic opacity-60">fons</span></h2>
              <div className="space-y-8 text-xl text-gray-500 font-light italic">
                <p>"Ens trobem davant d'un canvi cultural que afecta la mateixa essència de la persona. No és una mera qüestió tecnològica."</p>
                <div className="space-y-6 text-base not-italic font-normal">
                  <div className="bg-black/5 p-8 rounded-[2.5rem] border border-black/5">
                    <h4 className="font-bold text-[var(--jesuites-blue)] mb-2 uppercase text-sm tracking-widest">Renovació de la tradició</h4>
                    <p>Integrar la IA com una oportunitat per renovar la nostra tradició educativa a través del discerniment ignasià.</p>
                  </div>
                  <div className="bg-black/5 p-8 rounded-[2.5rem] border border-black/5">
                    <h4 className="font-bold text-[var(--jesuites-blue)] mb-2 uppercase text-sm tracking-widest">Acompanyament en l'error</h4>
                    <p>Educar en la imaginació, l'ironia i l'error com a oportunitat de creixement, elements que cap algoritme pot substituir.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: "Gestió Institucional", icon: Settings, desc: "Millora en l'eficàcia i l'eficiència per alliberar-nos de càrregues no essencials." },
              { title: "Pràctica Docent", icon: Lightbulb, desc: "Eines per a una docència més integral, personalitzadora i basada en l'evidència." },
              { title: "Aprenentatge Alumnat", icon: Target, desc: "Desenvolupar responsabilitat ètica, competència digital i pensament crític." }
            ].map((obj, i) => (
              <div key={i} className="bg-[var(--jesuites-cream)] p-12 rounded-[3.5rem] border border-black/[0.03] group hover:bg-[var(--jesuites-blue)] hover:text-white transition-all duration-700">
                <obj.icon size={40} className="mb-10 text-[var(--jesuites-blue)] group-hover:text-amber-200 transition-colors" />
                <h3 className="text-2xl font-bold font-serif mb-6 uppercase tracking-tight">{obj.title}</h3>
                <p className="text-lg font-light opacity-60 leading-relaxed">{obj.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4D MODEL SECTION (NEW) */}
      <section className="reveal-section py-48 px-6 bg-[var(--jesuites-cream)]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center mb-32">
            <div>
              <span className="text-[var(--jesuites-blue)]/40 font-bold tracking-[0.4em] uppercase text-xs mb-6 block font-serif">Model Operatiu</span>
              <h2 className="text-6xl md:text-8xl font-bold text-[var(--jesuites-blue)] mb-10 tracking-tighter uppercase font-serif leading-none">Fluidesa <br />en IA <span className="italic opacity-40 font-light font-sans text-5xl md:text-7xl">Model 4D</span></h2>
              <p className="text-2xl text-gray-500 font-light max-w-xl leading-relaxed">
                Un marc sòcio-tècnic basat en el judici crític i la responsabilitat ètica, estructurat en quatre dimensions recursives.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8">
              {MODEL_4D.map((d) => (
                <div
                  key={d.id}
                  onClick={() => setExpandedD(expandedD === d.id ? null : d.id)}
                  className={`bg-white p-12 rounded-[4rem] shadow-sm cursor-pointer transition-all duration-700 border border-black/[0.04] group relative hover:shadow-2xl overflow-hidden ${expandedD === d.id ? 'col-span-2 ring-4 ring-[var(--jesuites-blue)]/10 scale-105 z-20' : ''}`}
                >
                  <div className="flex justify-between items-start mb-8">
                    <span className="text-4xl font-bold text-[var(--jesuites-blue)] opacity-10 font-serif">{d.id}</span>
                    <d.icon size={24} className="text-[var(--jesuites-blue)] group-hover:scale-125 transition-transform" />
                  </div>
                  <h4 className="text-2xl font-bold text-[var(--jesuites-blue)] mb-2 uppercase tracking-tight font-serif">{d.name}</h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">{d.subtitle}</p>

                  {expandedD === d.id && (
                    <div className="animate-fade-in space-y-8 border-t border-black/5 pt-10">
                      <p className="text-lg text-gray-600 font-light leading-relaxed italic">"{d.desc}"</p>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {d.details.map((dt, idx) => (
                          <li key={idx} className="flex gap-4 items-center text-xs font-bold text-[var(--jesuites-blue)] uppercase tracking-tighter">
                            <CheckCircle2 size={16} className="text-amber-500" /> {dt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {!expandedD && <Info size={18} className="absolute bottom-12 right-12 text-gray-200" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. VALORS (CARD EXPANSION) */}
      <section className="reveal-section py-48 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-32">
          <span className="text-[var(--jesuites-blue)]/40 font-bold tracking-[0.4em] uppercase text-xs mb-6 block font-serif">Compromís Innegociable</span>
          <h2 className="text-6xl md:text-8xl font-bold text-[var(--jesuites-blue)] tracking-tighter font-serif uppercase">Valors Rectors</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {PRINCIPLES.map((p) => (
            <div
              key={p.id}
              onClick={() => setExpandedValue(expandedValue === p.id ? null : p.id)}
              className={`bg-white p-12 rounded-[4rem] shadow-sm hover:shadow-2xl transition-all duration-700 border border-black/[0.04] group relative cursor-pointer overflow-hidden ${expandedValue === p.id ? 'md:col-span-2 scale-105 z-20 ring-4 ring-[var(--jesuites-blue)]/10' : ''}`}
            >
              <div className={`w-16 h-16 bg-[var(--jesuites-cream)] rounded-3xl flex items-center justify-center mb-10 transition-all duration-500 ${expandedValue === p.id ? 'bg-[var(--jesuites-blue)] text-white' : 'group-hover:bg-[var(--jesuites-blue)] group-hover:text-white'}`}>
                <p.icon size={30} strokeWidth={1.5} />
              </div>
              <h4 className="text-2xl font-bold text-[var(--jesuites-blue)] mb-6 leading-tight font-serif uppercase tracking-tight">{p.title}</h4>
              <p className="text-sm text-gray-400 font-light mb-8 leading-relaxed font-serif uppercase tracking-widest">{p.intro}</p>

              {expandedValue === p.id && (
                <div className="animate-fade-in mt-12 space-y-8 border-t border-black/5 pt-12">
                  <p className="text-lg text-gray-600 font-light italic leading-relaxed">"{p.full}"</p>
                  <div className="space-y-4">
                    {p.points.map((pt, i) => (
                      <div key={i} className="flex gap-4 items-center text-sm font-bold text-[var(--jesuites-blue)] uppercase tracking-tighter">
                        <CheckCircle2 size={16} className="text-green-500" /> {pt}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4 mt-12">
                <span className="text-[10px] font-bold uppercase tracking-widest text-green-600 bg-green-50 px-3 py-1 rounded-full">✅ {getVotes(p.id, 'agree')}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-orange-600 bg-orange-50 px-3 py-1 rounded-full">⚠️ {getVotes(p.id, 'worry')}</span>
              </div>

              {!expandedValue && <Info size={20} className="absolute top-12 right-12 text-gray-200" />}
            </div>
          ))}
        </div>
      </section>

      {/* 4. TENSIONS (IMPROVED INTERACTION) */}
      <section className="reveal-section py-48 bg-[var(--jesuites-blue)] text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <Image src="/imatges/mirades-obertes-3.jpg" alt="Bg" fill className="object-cover grayscale" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="mb-40 text-center">
            <span className="text-white/40 font-bold tracking-[0.4em] uppercase text-xs mb-6 block font-serif">Reflexió Crítica</span>
            <h2 className="text-6xl md:text-9xl font-bold mb-10 tracking-tighter italic font-serif leading-none uppercase">Habitar les <br />Tensions</h2>
            <p className="text-xl text-white/50 font-light max-w-2xl mx-auto italic">
              "No volem eliminar-les de manera simplista, sinó gestionar-les des del discerniment, reconeixent que la intel·ligència artificial no és neutra."
            </p>
          </div>

          <div className="grid grid-cols-1 gap-48 tensions-container">
            {TENSIONS.map((t) => (
              <div key={t.id} className="relative group">
                <div className="flex flex-col md:flex-row justify-between items-start gap-16 px-12">
                  <div className="flex-1 text-center md:text-left space-y-6">
                    <span className="text-xs font-bold uppercase tracking-[0.4em] text-white/30 block">Eix A</span>
                    <h4 className="text-4xl font-bold font-serif uppercase tracking-tight group-hover:text-amber-200 transition-colors leading-none">{t.left.split(' (')[0]}</h4>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest">{t.left.split(' (')[1]?.replace(')', '')}</p>
                  </div>

                  <div className="relative w-full max-w-md h-[2px] bg-white/20 mt-12 md:mt-24">
                    <div className="tension-marker absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-[0_0_40px_rgba(255,255,255,0.8)] flex items-center justify-center cursor-ew-resize group-hover:scale-125 transition-transform duration-500">
                      <ArrowRightLeft size={16} className="text-[var(--jesuites-blue)]" />
                    </div>
                  </div>

                  <div className="flex-1 text-center md:text-right space-y-6">
                    <span className="text-xs font-bold uppercase tracking-[0.4em] text-white/30 block">Eix B</span>
                    <h4 className="text-4xl font-bold font-serif uppercase tracking-tight group-hover:text-amber-200 transition-colors leading-none">{t.right.split(' (')[0]}</h4>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest">{t.right.split(' (')[1]?.replace(')', '')}</p>
                  </div>
                </div>
                <div className="mt-20 text-center max-w-3xl mx-auto border-t border-white/10 pt-12 bg-white/5 p-12 rounded-[4rem] backdrop-blur-sm">
                  <h5 className="text-2xl font-bold uppercase tracking-widest text-amber-200 mb-6 font-serif">{t.title}</h5>
                  <p className="text-xl font-light text-white/80 italic leading-relaxed">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. GRAUS DE DELEGACIÓ */}
      <section className="reveal-section py-48 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-40">
            <span className="text-[var(--jesuites-blue)]/40 font-bold tracking-[0.4em] uppercase text-xs mb-6 block font-serif">Model Operatiu</span>
            <h2 className="text-6xl md:text-8xl font-bold text-[var(--jesuites-blue)] mb-10 tracking-tighter font-serif uppercase leading-none">Graus de <br className="md:hidden" /> Delegació</h2>
          </div>

          <div className="space-y-16">
            {DELEGATION_LEVELS.map((l) => (
              <DelegationLevelCard key={l.lv} l={l} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="py-32 text-center bg-white border-t border-black/5">
        <div className="max-w-4xl mx-auto px-6">
          <Image src="/imatges/FJE-trans.png" alt="Logo FJE" width={220} height={80} className="mx-auto mb-20 grayscale brightness-0 opacity-20 h-auto" />
          <div className="flex justify-center gap-16 mb-20 opacity-20 grayscale brightness-0">
            <Image src="/imatges/Escud blau.jpg" alt="Escut" width={50} height={50} className="h-12 w-auto" />
            <Image src="/imatges/FJE blanc CSC.png" alt="CSC" width={60} height={40} className="h-10 w-auto" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-gray-300">Jesuïtes Educació • Marc General IA 2026 • © Tots els drets reservats</p>
        </div>
      </footer>
    </main>
  );
}
