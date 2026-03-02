"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronDown, Sparkles, Settings, Target, Lightbulb, CheckCircle2 } from "lucide-react";

import { PRINCIPLES, TENSIONS, MODEL_4D, DELEGATION_LEVELS, scrollToSection } from "@/lib/data";
import SectionArrow from "@/components/SectionArrow";
import ExamplesCarousel from "@/components/ExamplesCarousel";
import FloatingMenu from "@/components/FloatingMenu";
import ResultsDashboard from "@/components/ResultsDashboard";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [expandedValue, setExpandedValue] = useState<string | null>(null);
  const [expandedD, setExpandedD] = useState<string | null>(null);
  const [expandedLv, setExpandedLv] = useState<number | null>(null);
  const [expandedTension, setExpandedTension] = useState<string | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-text", { y: 150, opacity: 0, stagger: 0.2, duration: 2, ease: "expo.out" });
      gsap.utils.toArray<HTMLElement>(".reveal-section").forEach((s) => {
        gsap.from(s, { scrollTrigger: { trigger: s, start: "top 85%" }, y: 80, opacity: 0, duration: 1.5, ease: "power4.out" });
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <main ref={containerRef} className="relative min-h-screen bg-[var(--jesuites-cream)] pb-64 font-sans leading-relaxed text-[var(--jesuites-text)]">

      {/* 0. FLOATING NAVIGATION MENU */}
      <FloatingMenu />

      {/* 1. HERO */}
      <section id="hero-top" className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-black">
          <Image src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2000" alt="Background" fill className="object-cover opacity-50 scale-10" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-[var(--jesuites-cream)]" />
        </div>
        <div className="hero-content relative z-10 text-center px-6 max-w-7xl mx-auto">
          <Image src="/imatges/FJE-trans.png" alt="Logo" width={280} height={100} className="mx-auto mb-6 md:mb-8 h-auto w-32 md:w-44" priority />
          <div className="hero-text mb-6 md:mb-8">
            <span className="text-[var(--jesuites-cream)]/40 font-bold tracking-[0.4em] uppercase text-sm md:text-lg mb-4 block font-serif">Marc General d&apos;Integració d&apos;IA</span>
            <h1 className="text-7xl md:text-[10rem] lg:text-[12rem] xl:text-[14rem] font-bold text-white leading-[0.75] tracking-tighter uppercase drop-shadow-2xl font-serif">MIRADES<br />OBERTES</h1>
          </div>
          <p className="hero-text text-lg md:text-2xl lg:text-3xl font-light text-white/50 uppercase tracking-[0.4em] font-serif max-w-5xl mx-auto italic">Navegant l&apos;Era de la Intel·ligència Artificial <br className="hidden md:block" />des de l&apos;Humanisme i el Diàleg</p>
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-30 animate-bounce cursor-pointer" onClick={() => scrollToSection('details-intro')}>
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
                  <p className="text-2xl text-gray-500 font-light leading-snug">Integrar l&apos;IA com una oportunitat per renovar la nostra tradició educativa a través del pensament crític.</p>
                </div>
                <div className="bg-black/5 p-12 rounded-[3.5rem] border border-black/5 hover:bg-[var(--jesuites-cream)] transition-all">
                  <h4 className="font-bold text-[var(--jesuites-blue)] mb-3 uppercase text-base tracking-widest font-serif">Acompanyament en l&apos;error</h4>
                  <p className="text-2xl text-gray-500 font-light leading-snug">Educar en la imaginació i l&apos;error com a oportunitat de creixement, elements que cap algoritme pot substituir.</p>
                </div>
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
                  <p className="text-xl md:text-2xl text-gray-600 font-light italic leading-snug md:px-6">&quot;{p.full}&quot;</p>
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

      {/* 4. TENSIONS */}
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
                  <div className="border-t border-white/10 pt-16 flex flex-col md:flex-row justify-between items-start gap-10 md:gap-32 relative">
                    <div className="flex-1 text-center md:text-left space-y-8 w-full relative z-10">
                      <h4 className="text-5xl md:text-7xl font-bold font-serif uppercase tracking-tight text-white leading-none whitespace-pre-line group-hover:-translate-x-2 transition-transform">{t.left.replace(" ", "\n")}</h4>
                      <p className="text-xl md:text-2xl font-light text-white/40 italic leading-snug">{t.leftDesc}</p>
                    </div>

                    {/* Subtle VS Watermark (Responsive flow) */}
                    <div className="md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 flex items-center justify-center py-2 md:py-0 w-full md:w-auto relative z-0">
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-white/20 via-white/5 to-transparent backdrop-blur-md flex items-center justify-center border border-white/10 shadow-xl">
                        <span className="text-white font-black text-sm md:text-base tracking-tighter select-none">VS</span>
                      </div>
                    </div>

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
            onClick={() => scrollToSection('model-4d-section')}
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
            <h2 className="text-6xl md:text-[10rem] font-bold text-[var(--jesuites-blue)] tracking-tighter leading-none font-serif uppercase mb-12 italic">Model<br />4D</h2>
            <p className="text-2xl md:text-3xl font-light text-gray-500 leading-snug italic">Quatre destreses que converteixen qualsevol docent o alumne en un agent capaç i crític amb la IA.</p>
          </div>
          <div className="lg:col-span-7 space-y-6">
            {MODEL_4D.map((d) => (
              <div key={d.id} onClick={() => setExpandedD(expandedD === d.id ? null : d.id)} className={`bg-white rounded-[3.5rem] border border-black/[0.04] overflow-hidden transition-all duration-700 cursor-pointer ${expandedD === d.id ? 'shadow-2xl ring-4 ring-[var(--jesuites-blue)]/5' : 'shadow-sm'}`}>
                <div className="p-8 md:p-10 flex items-center gap-8 group">
                  <div className={`w-16 h-16 md:w-20 md:h-20 rounded-[2rem] flex items-center justify-center shrink-0 transition-all ${expandedD === d.id ? 'bg-[var(--jesuites-blue)] text-white' : 'bg-[var(--jesuites-cream)] text-[var(--jesuites-blue)] group-hover:scale-110'}`}><d.icon size={32} /></div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-3xl md:text-5xl font-bold text-[var(--jesuites-blue)] uppercase tracking-tighter font-serif mb-1 leading-none">{d.name}</h4>
                    <p className="text-sm text-gray-400 font-light italic uppercase tracking-widest">{d.subtitle}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-full border border-black/10 flex items-center justify-center transition-all ${expandedD === d.id ? 'bg-[var(--jesuites-blue)] text-white rotate-180' : 'text-[var(--jesuites-blue)]'}`}><ChevronDown size={20} /></div>
                </div>
                <div className={`transition-all duration-700 overflow-hidden ${expandedD === d.id ? 'max-h-[600px] opacity-100 p-8 md:p-12 pt-0' : 'max-h-0 opacity-0'}`}>
                  <div className="border-t border-black/5 pt-8 space-y-8">
                    <p className="text-xl md:text-2xl text-gray-600 font-light italic leading-snug md:px-6">&quot;{d.desc}&quot;</p>
                    <div className="flex flex-wrap gap-3 md:px-6">
                      {d.details.map((det, i) => (
                        <span key={i} className="bg-[var(--jesuites-cream)] text-[var(--jesuites-blue)] px-6 py-3 rounded-full text-sm font-bold uppercase tracking-tight border border-black/5"><Sparkles size={14} className="inline mr-2" />{det}</span>
                      ))}
                    </div>
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
                      <h4 className="text-3xl md:text-[5.5rem] font-bold text-[var(--jesuites-blue)] uppercase font-serif leading-none mb-3 pr-4">{l.name}</h4>
                      <span className="text-xs md:text-base font-bold text-gray-400 uppercase tracking-[.4em] block truncate">{l.sub}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 md:gap-12 shrink-0">
                    <div className="relative w-20 h-20 md:w-36 md:h-36 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--jesuites-blue)]/5 to-transparent" />
                      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" className="fill-transparent stroke-black/[0.05]" strokeWidth="8" />
                        <circle cx="50" cy="50" r="42" className="fill-transparent stroke-[var(--jesuites-blue)]" strokeWidth="8" strokeDasharray={`${2 * Math.PI * 42}`} strokeDashoffset={`${2 * Math.PI * 42 * (1 - l.human / 100)}`} strokeLinecap="round" />
                      </svg>
                      <div className="flex flex-col items-center relative z-10">
                        <span className="text-xl md:text-4xl font-bold font-serif text-[var(--jesuites-blue)] leading-none">{l.human}%</span>
                        <span className="text-[7px] md:text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-widest">HUMÀ</span>
                      </div>
                    </div>
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full border border-black/10 flex items-center justify-center transition-all ${expandedLv === l.lv ? 'bg-[var(--jesuites-blue)] text-white rotate-180' : 'text-[var(--jesuites-blue)]'}`}><ChevronDown size={20} /></div>
                  </div>
                </div>
                <div className={`transition-all duration-700 overflow-hidden ${expandedLv === l.lv ? 'max-h-[1400px] opacity-100 p-8 md:p-14 md:pt-0' : 'max-h-0 opacity-0'}`}>
                  <div className="border-t border-black/5 pt-8 space-y-8">
                    <p className="text-xl md:text-3xl font-light text-gray-600 italic leading-snug md:px-10">&quot;{l.desc}&quot;</p>
                    <div className="md:px-10"><ExamplesCarousel examples={l.examples} /></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. DASHBOARD DE RESULTATS (VISIÓ COMPARTIDA) */}
      <section id="results-dashboard" className="reveal-section py-40 px-6 bg-[var(--jesuites-blue)] text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-24">
            <span className="text-amber-200/40 font-bold tracking-[0.4em] uppercase text-xs mb-8 block font-serif">Consens Institucional</span>
            <h2 className="text-6xl md:text-[8rem] font-bold mb-8 tracking-tighter font-serif uppercase italic leading-none">Visió <br /><span className="text-amber-200">Compartida</span></h2>
            <p className="text-xl md:text-2xl font-light text-white/50 max-w-2xl mx-auto italic">Explora els resultats agregats de la nostra comunitat en temps real.</p>
          </div>

          <ResultsDashboard />
        </div>
        <SectionArrow targetId="footer-fje" />
      </section>

      {/* 8. FOOTER */}
      <footer id="footer-fje" className="py-40 text-center bg-white border-t border-black/5">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex justify-center mb-16 opacity-30 grayscale brightness-0"><Image src="/imatges/FJE-trans.png" alt="Logo FJE" width={280} height={100} className="h-auto w-48 md:w-64" /></div>
          <p className="text-[11px] font-bold uppercase tracking-[0.5em] text-gray-300 mt-20">Jesuïtes Educació • Marc General IA 2026</p>
          <p className="text-[10px] text-gray-300 mt-4 tracking-widest uppercase">Darrera revisió: Març 2026 · Contacte: innovacio@ffrfrje.edu</p>
        </div>
      </footer>
    </main>
  );
}
