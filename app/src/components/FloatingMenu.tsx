"use client";

import { useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { NAV_LINKS, scrollToSection } from "@/lib/data";

export default function FloatingMenu() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="fixed top-8 right-8 z-[100] flex flex-col items-end gap-4">
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[var(--jesuites-blue)] text-white shadow-2xl flex items-center justify-center hover:scale-110 transition-transform ring-4 ring-white/10"
            >
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>

            <div className={`transition-all duration-500 overflow-hidden bg-white/95 backdrop-blur-md rounded-[2.5rem] shadow-2xl border border-black/5 ${isMenuOpen ? 'max-h-[600px] opacity-100 p-8' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                <div className="flex flex-col gap-6 min-w-[200px]">
                    {NAV_LINKS.map((link) => (
                        <button
                            key={link.id}
                            onClick={() => {
                                setIsMenuOpen(false);
                                scrollToSection(link.id);
                            }}
                            className="text-left text-sm font-bold uppercase tracking-[0.3em] text-[var(--jesuites-blue)] hover:translate-x-3 transition-transform font-serif border-b border-black/5 pb-2"
                        >
                            {link.name}
                        </button>
                    ))}
                </div>
            </div>
        </nav>
    );
}
