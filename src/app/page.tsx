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
  Info
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
    full: "La IA ha de ser una eina per arribar a tothom. L'utilitzem per atendre múltiples necessitats educatives (NESE) sota supervisió docent, evitant que les versions de pagament generin avantatges injustos.",
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
  { id: "humanisme", left: "Humanisme", right: "Posthumanisme", title: "Integritat Humana", desc: "Entre l'eina externa i l'hibridació. La tecnologia amplifica la humanitat, no l'anul·la." },
  { id: "agencia", left: "Offloading", right: "Outsourcing", title: "Autonomia i Agència", desc: "Descarregar tasques mecàniques vs. externalitzar el judici crític." },
  { id: "cognicio", left: "Fricció productiva", right: "Eficiència", title: "Profunditat Cognitiva", desc: "Defensa de la dificultat desitjable i el pensament lent davant la immediatesa." },
  { id: "presencia", left: "Atenció", right: "Acompanyament", title: "Vincles i Presència", desc: "De la fragmentació digital a la intencionalitat en la trobada humana." },
  { id: "justicia", left: "Biaixos", right: "Justícia Algorítmica", title: "Justícia i Equitat", desc: "Auditoria social activa per evitar que la IA perpetuï desigualtats." },
  { id: "veritat", left: "Plausibilitat", right: "Realisme", title: "Integritat Intel·lectual", desc: "Diferenciar la bona aparença (versemblança) del de la veritat factual." }
];

const MODEL_4D = [
  { id: "D1", name: "Delegació", label: "Delegation", icon: ArrowRightLeft, desc: "Decidir qui fa què. Treball humà vs. IA." },
  { id: "D2", name: "Descripció", label: "Description", icon: FileText, desc: "Traduir intenció en instruccions (Prompting)." },
  { id: "D3", name: "Discerniment", label: "Discernment", icon: Gavel, desc: "Avaluar críticament l'output de l'IA." },
  { id: "D4", name: "Diligència", label: "Diligence", icon: ShieldCheck, desc: "Governança ètica i responsabilitat final." }
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
      { subject: "Educació Física", activity: "Desenvolupament de la consciència corporal i motricitat." }
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
      { subject: "Visual i Plàstica", activity: "Recerca de referents artístics i moviments estètics." }
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
      { subject: "Matemàtiques", activity: "L'IA actua com a tutor socràtic que ajuda a detectar l'error en un procediment." }
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
      { subject: "Projectes", activity: "Disseny de guions per a podcast i edició d'àudio híbrida." }
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
      { subject: "Disseny", activity: "Producció de visuals complexos a partir de prompts tècnics d'estil." }
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
      { subject: "Operacions", activity: "Sistemes de gestió administrativa recurrent (facturació, assistència)." }
    ]
  }
];

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [votes, setVotes] = useState<any[]>([]);
  const [contributions, setContributions] = useState<any[]>([]);
  const [expandedValue, setExpandedValue] = useState<string | null>(null);

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
      // Intro animations
      gsap.from(".hero-text", { y: 150, opacity: 0, stagger: 0.2, duration: 2, ease: "expo.out" });

      // Reveal sections
      gsap.utils.toArray(".reveal-section").forEach((section: any) => {
        gsap.from(section, {
          scrollTrigger: { trigger: section, start: "top 80%", toggleActions: "play none none reverse" },
          y: 100, opacity: 0, duration: 1.5, ease: "power4.out"
        });
      });

      // Tensions lines
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
          <Image src="/imatges/mirades-obertes-1.jpg" alt="Background" fill className="object-cover opacity-60 scale-105" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-[var(--jesuites-cream)]" />
        </div>
        <div className="hero-content relative z-10 text-center px-6">
          <Image src="/imatges/FJE blanc.png" alt="Logo" width={240} height={80} className="mx-auto mb-16 brightness-0 invert opacity-90 h-auto w-48 md:w-64" priority />
          <h1 className="hero-text text-8xl md:text-[14rem] font-bold text-white leading-[0.75] tracking-tighter uppercase mb-6 drop-shadow-2xl font-serif">MIRADES<br />OBERES</h1>
          <p className="hero-text text-2xl md:text-3xl font-light text-white/60 uppercase tracking-[0.3em] font-serif">Integració de la IA a l'escola</p>

          <div className="mt-20 flex justify-center gap-12">
            <div className="flex flex-col items-center">
              <span className="text-4xl font-bold text-white font-serif">{votes.length}</span>
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Respostes</span>
            </div>
            <div className="flex flex-col items-center border-x border-white/10 px-12">
              <span className="text-4xl font-bold text-white font-serif">{contributions.length}</span>
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Mirades Noves</span>
            </div>
          </div>

          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-30 animate-bounce cursor-pointer" onClick={() => document.getElementById('details-intro')?.scrollIntoView({ behavior: 'smooth' })}>
            <ChevronDown size={40} className="text-white" />
          </div>
        </div>
      </section>

      {/* 2. INTRODUCCIÓ (MOTIUS) */}
      <section id="details-intro" className="reveal-section py-48 px-6 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="relative group">
              <div className="absolute -inset-4 bg-[var(--jesuites-blue)]/5 rounded-[4rem] -rotate-2 group-hover:rotate-0 transition-transform duration-700" />
              <div className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl">
                <Image src="/imatges/mirades-obertes-2.jpg" alt="Visió" fill className="object-cover" />
              </div>
            </div>
            <div>
              <span className="text-[var(--jesuites-blue)]/40 font-bold tracking-[0.4em] uppercase text-xs mb-6 block font-serif">El Propòsit</span>
              <h2 className="text-5xl md:text-7xl font-bold text-[var(--jesuites-blue)] mb-12 tracking-tighter leading-none font-serif">Per què <span className="italic opacity-60">ara?</span></h2>
              <div className="space-y-8 text-xl text-gray-500 font-light">
                <p className="flex gap-6">
                  <span className="text-[var(--jesuites-blue)] font-bold">01</span>
                  <span><strong className="text-[var(--jesuites-blue)] font-bold">Lideratge de servei:</strong> Volem orientar la IA per transformar la gestió institucional, la pràctica docent i l’aprenentatge.</span>
                </p>
                <p className="flex gap-6 border-y border-black/5 py-8">
                  <span className="text-[var(--jesuites-blue)] font-bold">02</span>
                  <span><strong className="text-[var(--jesuites-blue)] font-bold">Millora de la qualitat:</strong> Alliberar el docent de tasques mecàniques per guanyar temps per a l'acompanyament personal.</span>
                </p>
                <p className="flex gap-6">
                  <span className="text-[var(--jesuites-blue)] font-bold">03</span>
                  <span><strong className="text-[var(--jesuites-blue)] font-bold">Ciutadania ètica:</strong> Formar alumnes amb pensament crític i responsabilitat davant els reptes algorítmics.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. VALORS (CARD EXPANSION) */}
      <section className="reveal-section py-48 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-32">
          <span className="text-[var(--jesuites-blue)]/40 font-bold tracking-[0.4em] uppercase text-xs mb-6 block font-serif">Compromís Innegociable</span>
          <h2 className="text-6xl md:text-8xl font-bold text-[var(--jesuites-blue)] tracking-tighter font-serif uppercase">Valors i Principis</h2>
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

      {/* 4. TENSIONS (NEW VISUAL DESIGN) */}
      <section className="reveal-section py-48 bg-[var(--jesuites-blue)] text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <Image src="/imatges/mirades-obertes-3.jpg" alt="Bg" fill className="object-cover grayscale" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="mb-40 text-center">
            <span className="text-white/40 font-bold tracking-[0.4em] uppercase text-xs mb-6 block font-serif">Marc de Reflexió Crítica</span>
            <h2 className="text-6xl md:text-9xl font-bold mb-10 tracking-tighter italic font-serif leading-none">Habitar les <br />Tensions</h2>
          </div>

          <div className="grid grid-cols-1 gap-40 tensions-container">
            {TENSIONS.map((t, i) => (
              <div key={t.id} className="relative group">
                <div className="flex flex-col md:flex-row justify-between items-center gap-12 px-12">
                  <div className="flex-1 text-center md:text-left">
                    <span className="text-xs font-bold uppercase tracking-[0.4em] text-white/30 mb-4 block">Punt A</span>
                    <h4 className="text-3xl font-bold font-serif uppercase tracking-tight group-hover:text-amber-200 transition-colors uppercase">{t.left}</h4>
                  </div>

                  <div className="relative w-full max-w-sm h-[2px] bg-white/20">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                    <div className="tension-marker absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-[0_0_30px_rgba(255,255,255,0.5)] flex items-center justify-center">
                      <ArrowRightLeft size={14} className="text-[var(--jesuites-blue)]" />
                    </div>
                  </div>

                  <div className="flex-1 text-center md:text-right">
                    <span className="text-xs font-bold uppercase tracking-[0.4em] text-white/30 mb-4 block">Punt B</span>
                    <h4 className="text-3xl font-bold font-serif uppercase tracking-tight group-hover:text-amber-200 transition-colors uppercase">{t.right}</h4>
                  </div>
                </div>
                <div className="mt-16 text-center max-w-2xl mx-auto border-t border-white/10 pt-10">
                  <h5 className="text-xl font-bold uppercase tracking-widest text-amber-200 mb-4 font-serif">{t.title}</h5>
                  <p className="text-lg font-light text-white/60 italic leading-relaxed">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. GRAUS DE DELEGACIÓ + EXAMPLES CAROUSEL */}
      <section className="reveal-section py-48 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-40">
            <span className="text-[var(--jesuites-blue)]/40 font-bold tracking-[0.4em] uppercase text-xs mb-6 block font-serif">Model d'Agència</span>
            <h2 className="text-6xl md:text-8xl font-bold text-[var(--jesuites-blue)] mb-10 tracking-tighter italic font-serif uppercase">Graus de Delegació</h2>
          </div>

          <div className="space-y-12">
            {DELEGATION_LEVELS.map((l) => (
              <div key={l.lv} className="bg-white rounded-[4rem] p-12 md:p-20 border border-black/[0.03] shadow-lg group">
                <div className="flex flex-col lg:flex-row gap-20 items-center">
                  <div className="flex-1 flex items-center gap-12">
                    <span className="text-8xl md:text-[12rem] font-bold text-[var(--jesuites-blue)] opacity-5 leading-none font-serif">{l.lv}</span>
                    <div>
                      <h4 className="text-4xl md:text-5xl font-bold text-[var(--jesuites-blue)] tracking-tighter uppercase mb-4 font-serif">{l.name}</h4>
                      <span className="text-xs font-bold text-gray-400 border border-black/10 px-6 py-2 rounded-full uppercase tracking-widest">{l.sub}</span>
                    </div>
                  </div>

                  <div className="flex-[1.5] space-y-12">
                    <p className="text-3xl font-light text-gray-500 leading-tight italic">{l.desc}</p>

                    {/* Examples Carousel Mock/Container */}
                    <div className="bg-[var(--jesuites-cream)] rounded-[3rem] p-12 relative overflow-hidden group/item">
                      <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400 block mb-10 border-b border-black/5 pb-4">Activitats d'aula (+14 ANYS)</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        {l.examples.map((ex, idx) => (
                          <div key={idx} className="bg-white/80 p-8 rounded-[2rem] shadow-sm hover:scale-105 transition-transform duration-500">
                            <span className="text-[9px] font-bold text-[var(--jesuites-blue)] uppercase mb-2 block">{ex.subject}</span>
                            <p className="text-sm text-gray-600 font-light">{ex.activity}</p>
                          </div>
                        ))}
                      </div>
                      <Sparkles className="absolute -top-10 -right-10 text-[var(--jesuites-blue)] opacity-5 w-40 h-40" />
                    </div>
                  </div>

                  <div className="flex-1 w-full lg:w-48">
                    <div className="flex flex-col gap-6">
                      <div className="h-40 w-full bg-[var(--jesuites-cream)] rounded-3xl relative overflow-hidden">
                        <div className="absolute bottom-0 left-0 right-0 bg-[var(--jesuites-blue)] transition-all duration-1000" style={{ height: `${l.human}%` }} />
                        <div className="absolute inset-0 flex flex-col justify-between p-6 mix-blend-difference text-white">
                          <span className="text-4xl font-bold font-serif">{l.human}%</span>
                          <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Human Balance</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center px-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Persona</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">IA</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. LOGOS FOOTER (FIXED) */}
      <footer className="py-32 text-center bg-white border-t border-black/5">
        <div className="max-w-4xl mx-auto px-6">
          <Image src="/imatges/FJE blanc.png" alt="Logo FJE" width={180} height={60} className="mx-auto mb-16 grayscale brightness-0 opacity-20" />
          <div className="flex justify-center gap-20 mb-20 opacity-10 grayscale brightness-0">
            <Image src="/imatges/Escud blau.jpg" alt="Escut" width={60} height={60} />
            <Image src="/imatges/FJE blanc CSC.png" alt="CSC" width={80} height={60} />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-gray-300">Jesuïtes Educació • Marc General IA 2026 • © Tots els drets reservats</p>
        </div>
      </footer>
    </main>
  );
}
