"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { supabase } from "@/lib/supabase";
import {
  ChevronDown, Users, Eye, Search, Heart, ShieldCheck,
  ArrowRightLeft, FileText, Gavel, User, Cpu, Sparkles, Settings,
  MessageSquare
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const PRINCIPLES = [
  {
    id: "antropocentrisme",
    title: "Antropocentrisme i Humanisme",
    icon: Users,
    desc: "Prioritzem la relació humana, el benestar i la dignitat de la persona.",
    full: "Entenem que la tecnologia ha d'estar al servei de l'ésser humà. Això implica garantir que la IA no substitueixi el procés creatiu i emocional de l'alumne, sinó que l'amplifiqui.",
    details: ["Human-in-the-loop", "Relació humana", "Autonomia intel·lectual"]
  },
  {
    id: "transparencia",
    title: "Transparència i Integritat",
    icon: Eye,
    desc: "Ús visible i honorable de la tecnologia en tots els processos.",
    full: "Fomentem l'honestedat en l'ús de la IA, l'obligació de declarar-ne l'ús i la capacitat d'explicar com s'ha arribat a un resultat determinat.",
    details: ["Identificació", "Explicabilitat", "Citació/Autoria"]
  },
  {
    id: "verificacio",
    title: "Verificació i Crítica",
    icon: Search,
    desc: "Cultura de discerniment actiu davant la versemblança estadística.",
    full: "Davant models que generen resultats plausibles però no sempre certs, eduquem en el contrast de fonts i el pensament crític permanent.",
    details: ["Pensament crític", "Contrast fonts", "Mitigació biaixos"]
  },
  {
    id: "equitat",
    title: "Equitat i Inclusió",
    icon: Heart,
    desc: "Instrument per reduir bretxes i personalitzar l'aprenentatge.",
    full: "La IA ha de ser una eina que permeti arribar a tothom, adaptant-se a les necessitats de cada alumne sense crear noves exclusions.",
    details: ["Accés universal", "Disseny accessible", "Personalització"]
  },
  {
    id: "benestar",
    title: "Benestar i Sostenibilitat",
    icon: ShieldCheck,
    desc: "Relació equilibrada amb l'entorn digital i compromís ambiental.",
    full: "Som conscients de l'impacte energètic de la IA i del risc d'addicció digital. Busquem un ús ètic i responsable pel bé comú.",
    details: ["Protecció dades", "Salut digital", "Petjada energètica"]
  }
];

const TENSIONS = [
  { id: "humanisme", left: "Humanisme", right: "Posthumanisme", title: "Integritat Humana", desc: "Entre l'eina externa i l'hibridació ja existent." },
  { id: "agencia", left: "Offloading", right: "Outsourcing", title: "Autonomia i Agència", desc: "Descàrrega mecànica vs. externalització del judici." },
  { id: "cognicio", left: "Fricció productiva", right: "Eficiència", title: "Profunditat Cognitiva", desc: "Defensa de la dificultat desitjable davant la immediatesa." },
  { id: "presencia", left: "Atenció", right: "Acompanyament", title: "Vincles i Presència", desc: "De la fragmentació a l'economia de la intenció." },
  { id: "justicia", left: "Biaixos", right: "Justícia Algorítmica", title: "Justícia i Equitat", desc: "Auditoria social per evitar perpetuar desigualtats." }
];

const DELEGATION_LEVELS = [
  { lv: 0, name: "Preservació", sub: "No delegació", human: 100, ia: 0, desc: "No hi ha intervenció de la IA. Es prioritza l'activitat humana directa.", icon: User, example: "Desenvolupament de la grafoescritura o el judici ètic en situacions de crisi." },
  { lv: 1, name: "Exploració", sub: "Font d'idees", human: 90, ia: 10, desc: "L'IA actua com a font d'informació o mirall d'idees. No es genera artefacte final.", icon: Search, example: "L'alumne de 14 anys interroga l'IA per entendre un concepte abstracte o buscar analogies." },
  { lv: 2, name: "Suport", sub: "Refinament", human: 70, ia: 30, desc: "La persona crea el contingut base i l'IA proposa millores o correccions.", icon: MessageSquare, example: "Revisió d'un assaig d'història on l'IA suggereix millores en l'estil o l'estructura." },
  { lv: 3, name: "Cocreació", sub: "Estratègica", human: 50, ia: 50, desc: "Treball iteratiu i bidireccional on persona i IA elaboren conjuntament.", icon: Sparkles, example: "Creació de guions de poadcast on el docent i l'IA alternen el disseny dels personatges." },
  { lv: 4, name: "Delegació", sub: "Supervisada", human: 20, ia: 80, desc: "L'IA genera el producte final complet a partir de directrius precises de la persona.", icon: Settings, example: "Generació de resums de lectura tancats per estandarditzar material d'estudi." },
  { lv: 5, name: "Agència", sub: "Autònoma", human: 5, ia: 95, desc: "L'IA opera independentment dins d'un marc supervisat periòdicament.", icon: Cpu, example: "Plataformes d'aprenentatge adaptatiu que proposen itineraris personals automàticament." }
];

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [votes, setVotes] = useState<any[]>([]);
  const [contributions, setContributions] = useState<any[]>([]);

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
      gsap.timeline({ defaults: { ease: "expo.out" } })
        .from(".hero-content", { scale: 0.9, opacity: 0, duration: 2.5 })
        .from(".hero-text", { y: 150, opacity: 0, stagger: 0.2, duration: 2 }, "-=2");

      gsap.utils.toArray(".reveal-section").forEach((section: any) => {
        gsap.from(section, {
          scrollTrigger: { trigger: section, start: "top 85%", toggleActions: "play none none reverse" },
          y: 80, opacity: 0, duration: 1.5, ease: "power4.out"
        });
      });
    }, containerRef);

    return () => { ctx.revert(); supabase.removeChannel(channel); };
  }, []);

  const getVotes = (itemId: string, type: string) => votes.filter(v => v.item_id === itemId && v.vote_type === type).length;

  return (
    <main ref={containerRef} className="relative min-h-screen bg-[var(--jesuites-cream)] selection:bg-[var(--jesuites-blue)] pb-64 font-sans leading-relaxed">

      {/* 1. HERO */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-black">
          <Image src="/imatges/mirades-obertes-1.jpg" alt="Background" fill className="object-cover opacity-60" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[var(--jesuites-cream)]" />
        </div>
        <div className="hero-content relative z-10 text-center px-6">
          <Image src="/fonts/FJE blanc.png" alt="Logo" width={220} height={70} className="mx-auto mb-16 brightness-0 invert opacity-90 h-auto" />
          <h1 className="hero-text text-8xl md:text-[14rem] font-bold text-white leading-[0.75] tracking-tighter uppercase mb-6 drop-shadow-2xl font-serif">MIRADES<br />OBERES</h1>
          <p className="hero-text text-2xl md:text-3xl font-light text-white/60 uppercase tracking-[0.3em]">Integració de la IA a l'escola</p>

          <div className="mt-20 flex justify-center gap-12">
            <div className="flex flex-col items-center">
              <span className="text-4xl font-bold text-white font-serif">{votes.length}</span>
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Interaccions</span>
            </div>
            <div className="flex flex-col items-center border-x border-white/10 px-12">
              <span className="text-4xl font-bold text-white font-serif">{contributions.length}</span>
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Mirades Noves</span>
            </div>
          </div>

          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-30 animate-bounce cursor-pointer" onClick={() => {
            const el = document.getElementById('details-intro');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}>
            <ChevronDown size={40} className="text-white" />
          </div>
        </div>
      </section>

      {/* Intro Context Section */}
      <section id="details-intro" className="reveal-section py-32 md:py-48 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl md:text-5xl font-bold text-[var(--jesuites-blue)] mb-12 tracking-tight font-serif leading-tight">
            Un marc educatiu per navegar l'era de la <span className="italic">intel·ligència artificial.</span>
          </h3>
          <p className="text-xl md:text-2xl text-gray-500 font-light leading-relaxed mb-16">
            Aquest document recull la visió institucional de Jesuïtes Educació sobre com habitem aquest canvi d'època. <br /><br />
            Prioritzem el <span className="font-bold text-[var(--jesuites-blue)]">discerniment</span>, la <span className="font-bold text-[var(--jesuites-blue)]">persona</span> i la <span className="font-bold text-[var(--jesuites-blue)]">integritat</span> intel·lectual de l'estudiant per sobre de la immediatesa tecnològica.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative aspect-[4/3] rounded-[3rem] overflow-hidden group">
              <Image src="/imatges/mirades-obertes-2.jpg" alt="Interior" fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
            </div>
            <div className="relative aspect-[4/3] rounded-[3rem] overflow-hidden group">
              <Image src="/imatges/mirades-obertes-3.jpg" alt="Interaction" fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. VALORS */}
      <section className="reveal-section py-48 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-32">
          <span className="text-[var(--jesuites-blue)]/40 font-bold tracking-[0.4em] uppercase text-xs mb-6 block">Els Fonaments</span>
          <h2 className="text-6xl md:text-8xl font-bold text-[var(--jesuites-blue)] tracking-tighter font-serif">Valors i Principis</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {PRINCIPLES.map((p) => (
            <div key={p.id} className="bg-white p-10 rounded-[3rem] shadow-sm hover:shadow-2xl transition-all duration-700 border border-black/[0.04] group relative">
              <div className="w-16 h-16 bg-[var(--jesuites-cream)] rounded-3xl flex items-center justify-center mb-10 group-hover:bg-[var(--jesuites-blue)] group-hover:text-white transition-all duration-500">
                <p.icon size={30} strokeWidth={1.5} />
              </div>
              <h4 className="text-xl font-bold text-[var(--jesuites-blue)] mb-6 leading-tight font-serif">{p.title}</h4>
              <p className="text-sm text-gray-500 font-light mb-8 leading-relaxed mb-12">{p.desc}</p>

              {/* Interaction Overlay */}
              <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-10">
                <span className="text-[10px] font-bold uppercase tracking-widest text-green-600 bg-green-50 px-2 py-1 rounded-full">✅ {getVotes(p.id, 'agree')}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-orange-600 bg-orange-50 px-2 py-1 rounded-full">⚠️ {getVotes(p.id, 'worry')}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. TENSIONS */}
      <section className="reveal-section py-48 bg-white border-y border-black/[0.03]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-40 text-center md:text-left">
            <h2 className="text-6xl md:text-8xl font-bold text-[var(--jesuites-blue)] mb-10 tracking-tighter italic font-serif">Habitar les Tensions</h2>
            <p className="max-w-2xl text-2xl text-gray-400 font-light leading-relaxed italic">"No volem eliminar-les de manera simplista, sinó gestionar-les des del discerniment."</p>
          </div>

          <div className="space-y-32">
            {TENSIONS.map((t) => (
              <div key={t.id} className="relative group">
                <div className="flex justify-between items-end mb-10">
                  <span className="text-xs font-bold uppercase tracking-[0.3em] text-gray-300 group-hover:text-[var(--jesuites-blue)] transition-all">{t.left}</span>
                  <div className="text-center absolute left-1/2 -translate-x-1/2 -bottom-4">
                    <h5 className="text-2xl font-bold text-[var(--jesuites-blue)] opacity-0 group-hover:opacity-100 transition-all duration-700 tracking-tight font-serif uppercase">{t.title}</h5>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-[0.3em] text-gray-300 group-hover:text-[var(--jesuites-blue)] transition-all">{t.right}</span>
                </div>
                <div className="h-[2px] w-full bg-gray-100 relative tension-line">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-4 border-[var(--jesuites-blue)] bg-white group-hover:scale-125 transition-transform duration-700 shadow-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. GRAUS DE DELEGACIÓ + EXEMPLES */}
      <section className="reveal-section py-48 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-40">
            <h2 className="text-6xl md:text-8xl font-bold text-[var(--jesuites-blue)] mb-10 tracking-tighter italic font-serif">Graus de Delegació</h2>
            <p className="text-2xl text-gray-500 font-light max-w-3xl mx-auto leading-relaxed italic">Estratègia d'aula: quan apareix l'IA als 14 anys?</p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {DELEGATION_LEVELS.map((l) => (
              <div key={l.lv} className="bg-white rounded-[4rem] p-12 md:p-20 flex flex-col md:flex-row items-center gap-20 group hover:bg-[var(--jesuites-blue)] hover:text-white transition-all duration-700 border border-black/[0.03] shadow-lg">
                <div className="flex-1 flex items-center gap-12">
                  <span className="text-8xl md:text-[10rem] font-bold opacity-10 group-hover:opacity-30 leading-none font-serif">{l.lv}</span>
                  <div>
                    <h4 className="text-4xl font-bold tracking-tighter uppercase leading-none mb-4 font-serif">{l.name}</h4>
                    <span className="text-xs font-bold opacity-40 group-hover:opacity-100 border border-current px-4 py-1 rounded-full uppercase tracking-widest">{l.sub}</span>
                  </div>
                </div>

                <div className="flex-[2] space-y-8">
                  <p className="text-2xl font-light leading-tight">{l.desc}</p>
                  <div className="bg-[var(--jesuites-cream)]/30 group-hover:bg-white/5 p-8 rounded-3xl border border-current/10">
                    <span className="text-[10px] font-bold uppercase tracking-widest block mb-4 opacity-50">Exemple d'Aula (+14 ANYS)</span>
                    <p className="text-sm font-light italic">{l.example}</p>
                  </div>
                </div>

                <div className="flex-1 w-full md:w-auto">
                  <div className="h-4 w-full bg-black/[0.03] group-hover:bg-white/10 rounded-full overflow-hidden flex">
                    <div className="h-full bg-[var(--jesuites-blue)] group-hover:bg-white transition-all duration-1000" style={{ width: `${l.human}%` }} />
                  </div>
                  <div className="flex justify-between mt-6 text-xs font-bold uppercase tracking-[0.2em]">
                    <span>HUMÀ {l.human}%</span>
                    <span>IA {l.ia}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-20 text-center">
        <Image src="/fonts/Escud blau.jpg" alt="Escut" width={50} height={50} className="mx-auto mb-12 mix-blend-multiply opacity-60" />
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400">Jesuïtes Educació • Marc General IA 2026</p>
      </footer>
    </main>
  );
}
