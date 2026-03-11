"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import type { DelegationExample } from "@/lib/types";

export default function ExamplesCarousel({ examples }: { examples: DelegationExample[] }) {
    const [currentEx, setCurrentEx] = useState(0);
    const nextEx = (e: React.MouseEvent) => { e.stopPropagation(); setCurrentEx((prev) => (prev + 1) % examples.length); };
    const prevEx = (e: React.MouseEvent) => { e.stopPropagation(); setCurrentEx((prev) => (prev - 1 + examples.length) % examples.length); };

    return (
        <div className="bg-[var(--jesuites-cream)] rounded-[2.5rem] p-6 md:p-8 relative overflow-hidden border border-black/[0.02] w-full mt-4">
            <div className="flex justify-between items-center mb-6 border-b border-black/5 pb-4">
                <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-gray-400 block">Exemples d&apos;aula (+14 ANYS)</span>
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
