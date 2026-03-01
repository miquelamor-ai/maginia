"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ChevronDown, Users, Eye, Search, Heart, ShieldCheck,
  ArrowRightLeft, Scale, Zap, MessageSquare, Gavel, FileText,
  User, Cpu, Sparkles, Settings
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const PRINCIPLES = [
  { id: 1, title: "Antropocentrisme i Humanisme", icon: Users, desc: "Prioritzem la relació humana, el benestar i la dignitat.", details: ["Human-in-the-loop", "Relació humana", "Sense dependència"] },
  { id: 2, title: "Transparència i Integritat", icon: Eye, desc: "Ús visible i honorable de la tecnologia.", details: ["Identificació", "Explicabilitat", "Citació/Autoria"] },
  { id: 3, title: "Verificació i Crítica", icon: Search, desc: "Cultura de discerniment actiu davant l'IA.", details: ["Pensament crític", "Contrast fonts", "Mitigació biaixos"] },
  { id: 4, title: "Equitat i Inclusió", icon: Heart, desc: "Instrument per reduir bretxes, no ampliar-les.", details: ["Accés universal", "Disseny accessible", "Personalització"] },
  { id: 5, title: "Benestar i Sostenibilitat", icon: ShieldCheck, desc: "Relació equilibrada i ètica socioambiental.", details: ["Protecció dades", "Salut digital", "Petjada hídrica/energètica"] }
];

const TENSIONS = [
  { left: "Humanisme", right: "Posthumanisme", title: "Integritat Humana", desc: "Entre l'eina externa i l'hibridació ja existent." },
  { left: "Offloading", right: "Outsourcing", title: "Autonomia i Agència", desc: "Descàrrega mecànica vs. externalització del judici." },
  { left: "Fricció productiva", right: "Eficiència", title: "Profunditat Cognitiva", desc: "Defensa de la dificultat desitjable davant la immediatesa." },
  { left: "Economia Atenció", right: "Acompanyament", title: "Vincles i Presència", desc: "De la fragmentació a l'economia de la intenció." },
  { left: "Biaixos", right: "Justícia Algorítmica", title: "Justícia i Equitat", desc: "Auditoria social per evitar perpetuar desigualtats." }
];

const MODEL_4D = [
  { id: "D1", name: "Delegació", label: "Delegation", icon: ArrowRightLeft, desc: "Decidir qui fa què. Treball humà vs. IA." },
  { id: "D2", name: "Descripció", label: "Description", icon: FileText, desc: "Traduir intenció en instruccions (Prompting)." },
  { id: "D3", name: "Discerniment", label: "Discernment", icon: Gavel, desc: "Avaluar críticament l'output de l'IA." },
  { id: "D4", name: "Diligència", label: "Diligence", icon: ShieldCheck, desc: "Governança ètica i responsabilitat final." }
];

const DELEGATION_LEVELS = [
  { lv: 0, name: "Preservació", sub: "No delegació", human: 100, ia: 0, desc: "No hi ha intervenció de la IA. Es prioritza l'activitat humana directa.", icon: User },
  { lv: 1, name: "Exploració", sub: "Font d'idees", human: 90, ia: 10, desc: "L'IA actua com a font d'informació o mirall d'idees. No es genera artefacte final.", icon: Search },
  { lv: 2, name: "Suport", sub: "Refinament", human: 70, ia: 30, desc: "La persona crea el contingut base i l'IA proposa millores o correccions.", icon: MessageSquare },
  { lv: 3, name: "Cocreació", sub: "Estratègica", human: 50, ia: 50, desc: "Treball iteratiu i bidireccional on persona i IA elaboren conjuntament.", icon: Sparkles },
  { lv: 4, name: "Delegació", sub: "Supervisada", human: 20, ia: 80, desc: "L'IA genera el producte final complet a partir de directrius precises de la persona.", icon: Settings },
  { lv: 5, name: "Agència", sub: "Autònoma", human: 5, ia: 95, desc: "L'IA opera independentment dins d'un marc supervisat periòdicament.", icon: Cpu }
];

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // INTRO
      gsap.timeline({ defaults: { ease: "expo.out" } })
        .from(".hero-content", { scale: 0.9, opacity: 0, duration: 2 })
        .from(".hero-text", { y: 100, opacity: 0, stagger: 0.2, duration: 1.5 }, "-=1.5");

      // PARALLAX
      gsap.to(videoRef.current, {
        scrollTrigger: { trigger: containerRef.current, start: "top top", end: "bottom top", scrub: true },
        y: 200, scale: 1.1
      });

      // SECTIONS REVEAL
      gsap.utils.toArray(".reveal-section").forEach((section: any) => {
        gsap.from(section, {
          scrollTrigger: { trigger: section, start: "top 85%", toggleActions: "play none none reverse" },
          y: 60, opacity: 0, duration: 1.2, ease: "power3.out"
        });
      });

      // TENSIONS ANIMATION
      gsap.from(".tension-line", {
        scrollTrigger: { trigger: ".tensions-grid", start: "top 70%" },
        scaleX: 0, duration: 1.5, stagger: 0.2, ease: "expo.inOut"
      });

    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <main ref={containerRef} className="relative min-h-screen bg-[var(--jesuites-cream)] selection:bg-[var(--jesuites-blue)] selection:text-white pb-32">

      {/* 1. HERO */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-black">
          <video ref={videoRef} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-50">
            <source src="/imatges/video-1.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[var(--jesuites-cream)]" />
        </div>
        <div className="hero-content relative z-10 text-center px-6">
          <Image src="/imatges/FJE blanc.png" alt="Logo" width={280} height={90} className="mx-auto mb-16 brightness-0 invert opacity-90 h-auto w-48 md:w-64" priority />
          <h1 className="hero-text text-6xl md:text-9xl font-bold text-white uppercase tracking-tighter leading-[0.85] mb-4">Mirades<br />Obertes</h1>
          <p className="hero-text text-xl md:text-2xl font-light text-white/70 uppercase tracking-widest">El nostre camí amb la IA</p>
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-30 animate-bounce"><ChevronDown size={40} className="text-white" /></div>
        </div>
      </section>

      {/* 2. VALORS */}
      <section className="reveal-section py-32 md:py-56 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <span className="text-[var(--jesuites-blue)]/50 font-bold tracking-widest uppercase text-xs mb-4 block">Els Fonaments</span>
          <h2 className="text-4xl md:text-6xl font-bold text-[var(--jesuites-blue)] tracking-tight">Valors i Principis Rectors</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {PRINCIPLES.map((p) => (
            <div key={p.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-700 border border-black/[0.03] group hover:-translate-y-3">
              <div className="w-14 h-14 bg-[var(--jesuites-cream)] rounded-2xl flex items-center justify-center mb-10 group-hover:bg-[var(--jesuites-blue)] group-hover:text-white transition-colors duration-500">
                <p.icon size={26} strokeWidth={1.5} />
              </div>
              <h4 className="text-lg font-bold text-[var(--jesuites-blue)] mb-4">{p.title}</h4>
              <p className="text-sm text-gray-500 font-light leading-relaxed mb-8">{p.desc}</p>
              <div className="pt-6 border-t border-black/5 opacity-30 text-[9px] uppercase font-bold tracking-wider space-y-2">
                {p.details.map((d, i) => <div key={i}>{d}</div>)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. TENSIONS */}
      <section className="reveal-section py-32 md:py-56 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-32">
            <h2 className="text-4xl md:text-6xl font-bold text-[var(--jesuites-blue)] mb-8 tracking-tighter italic">Habitar les Tensions</h2>
            <p className="max-w-2xl text-xl text-gray-500 font-light leading-relaxed italic">
              "No volem eliminar-les de manera simplista, sinó gestionar-les i acollir-les."
            </p>
          </div>
          <div className="tensions-grid space-y-20">
            {TENSIONS.map((t, i) => (
              <div key={i} className="relative group">
                <div className="flex justify-between items-end mb-6">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400 group-hover:text-[var(--jesuites-blue)] transition-colors">{t.left}</span>
                  <div className="text-center absolute left-1/2 -translate-x-1/2 bottom-8">
                    <h5 className="text-lg font-bold text-[var(--jesuites-blue)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 uppercase tracking-tighter">{t.title}</h5>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400 group-hover:text-[var(--jesuites-blue)] transition-colors">{t.right}</span>
                </div>
                <div className="h-[1px] w-full bg-gray-100 relative tension-line origin-left">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full border border-[var(--jesuites-blue)] bg-white group-hover:scale-150 transition-transform duration-500" />
                </div>
                <p className="mt-4 text-center text-sm text-gray-400 font-light max-w-md mx-auto">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. MODEL 4D */}
      <section className="reveal-section py-32 md:py-56 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-20 items-center">
            <div className="flex-1">
              <span className="text-[var(--jesuites-blue)]/50 font-bold tracking-widest uppercase text-xs mb-4 block">Model Operatiu</span>
              <h2 className="text-5xl md:text-7xl font-bold text-[var(--jesuites-blue)] tracking-tighter leading-none mb-10">Fluidesa en IA <br /><span className="italic font-light opacity-60">Model 4D</span></h2>
              <p className="text-xl text-gray-600 font-light leading-relaxed mb-12">
                Un marc sòcio-tècnic basat en el judici crític i la responsabilitat ètica, estructurat en quatre dimensions recursives.
              </p>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4">
              {MODEL_4D.map((d) => (
                <div key={d.id} className="aspect-square bg-white rounded-[3rem] p-10 flex flex-col justify-between hover:bg-[var(--jesuites-blue)] hover:text-white transition-all duration-500 group border border-black/[0.03] shadow-sm hover:shadow-2xl">
                  <div className="flex justify-between items-start">
                    <span className="text-3xl font-bold opacity-20 group-hover:opacity-100">{d.id}</span>
                    <d.icon className="opacity-40 group-hover:opacity-100" size={32} strokeWidth={1} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2 uppercase tracking-tight">{d.name}</h4>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 group-hover:opacity-80 transition-opacity">{d.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. GRAUS DE DELEGACIÓ */}
      <section className="reveal-section py-32 md:py-56 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-bold text-[var(--jesuites-blue)] mb-8 tracking-tighter italic">Graus de Delegació</h2>
            <p className="text-lg text-gray-500 font-light max-w-2xl mx-auto leading-relaxed">Sis nivells que defineixen la relació persona-IA de manera transversal a la institució.</p>
          </div>

          <div className="space-y-4">
            {DELEGATION_LEVELS.map((l) => (
              <div key={l.lv} className="bg-[var(--jesuites-cream)] rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-12 group hover:bg-[var(--jesuites-blue)] hover:text-white transition-all duration-500">
                <div className="flex-1 flex items-center gap-8">
                  <span className="text-5xl md:text-7xl font-bold opacity-20 group-hover:opacity-100">{l.lv}</span>
                  <div>
                    <h4 className="text-2xl md:text-3xl font-bold tracking-tight uppercase leading-none">{l.name}</h4>
                    <span className="text-sm font-bold opacity-40 group-hover:opacity-100 uppercase tracking-widest">{l.sub}</span>
                  </div>
                </div>

                <div className="flex-[2] text-lg font-light leading-relaxed">
                  {l.desc}
                </div>

                <div className="flex-1 w-full md:w-auto">
                  <div className="h-2 w-full bg-black/5 group-hover:bg-white/10 rounded-full overflow-hidden flex">
                    <div className="h-full bg-[var(--jesuites-blue)] group-hover:bg-white transition-all" style={{ width: `${l.human}%` }} />
                  </div>
                  <div className="flex justify-between mt-3 text-[10px] font-bold uppercase tracking-widest">
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
      <footer className="py-20 text-center border-t border-black/5">
        <img src="/imatges/Escud blau.jpg" alt="Escut" className="h-10 mx-auto mb-8 mix-blend-multiply opacity-40" />
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Jesuïtes Educació • Marc General IA</p>
      </footer>
    </main>
  );
}
