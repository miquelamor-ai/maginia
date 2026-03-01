"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import {
    Users, Eye, Search, Heart, ShieldCheck,
    CheckCircle2, AlertCircle, HelpCircle, Lightbulb,
    Send
} from "lucide-react";

const SECTIONS = [
    { id: "valors", name: "Valors i Principis" },
    { id: "tensions", name: "Tensions Dialèctiques" },
    { id: "4d", name: "Model 4D" },
    { id: "delegacio", name: "Graus de Delegació" }
];

const VOTE_TYPES = [
    { id: "agree", label: "D'acord", color: "bg-green-500", icon: CheckCircle2 },
    { id: "worry", label: "M'inquieta", color: "bg-orange-500", icon: AlertCircle },
    { id: "doubt", label: "Tinc dubtes", color: "bg-blue-500", icon: HelpCircle },
    { id: "inspired", label: "M'inspira", color: "bg-purple-500", icon: Lightbulb }
];

export default function Participar() {
    const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
    const [isSending, setIsSending] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [contribution, setContribution] = useState("");

    const sendVote = async (type: string) => {
        setIsSending(true);
        const { error } = await supabase.from("votes").insert([
            {
                section_id: activeSection,
                vote_type: type,
                item_id: "general" // Podem polir-ho per item específic més endavant
            }
        ]);

        if (!error) {
            setFeedback("Vot enviat!");
            setTimeout(() => setFeedback(null), 2000);
        }
        setIsSending(false);
    };

    const sendContribution = async () => {
        if (!contribution.trim()) return;
        setIsSending(true);
        const { error } = await supabase.from("contributions").insert([
            {
                section_id: activeSection,
                content: contribution.trim()
            }
        ]);

        if (!error) {
            setContribution("");
            setFeedback("Gràcies per la teva mirada!");
            setTimeout(() => setFeedback(null), 2000);
        }
        setIsSending(false);
    };

    return (
        <main className="min-h-screen bg-[var(--jesuites-cream)] p-6 md:p-12 font-sans select-none">
            <div className="max-w-md mx-auto">
                {/* Header */}
                <header className="mb-12 text-center">
                    <div className="w-16 h-16 bg-[var(--jesuites-blue)] rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg">
                        <SparkleIcon size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-[var(--jesuites-blue)] uppercase tracking-tight">Participar</h1>
                    <p className="text-sm text-gray-500 font-light mt-2 uppercase tracking-widest">Marc General IA</p>
                </header>

                {/* Section Selector */}
                <div className="flex gap-2 mb-12 overflow-x-auto pb-4 no-scrollbar">
                    {SECTIONS.map((s) => (
                        <button
                            key={s.id}
                            onClick={() => setActiveSection(s.id)}
                            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${activeSection === s.id
                                    ? "bg-[var(--jesuites-blue)] text-white border-[var(--jesuites-blue)]"
                                    : "bg-white text-gray-400 border-black/5"
                                }`}
                        >
                            {s.name}
                        </button>
                    ))}
                </div>

                {/* Action Panel */}
                <div className="space-y-8">
                    <section>
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-6 px-2">El teu pols</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {VOTE_TYPES.map((v) => (
                                <button
                                    key={v.id}
                                    disabled={isSending}
                                    onClick={() => sendVote(v.id)}
                                    className="bg-white p-6 rounded-3xl border border-black/[0.03] shadow-sm active:scale-95 transition-all flex flex-col items-center justify-center gap-4 group"
                                >
                                    <div className={`p-3 rounded-xl ${v.color} text-white transition-transform group-active:scale-110`}>
                                        <v.icon size={24} />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-tight text-gray-600">{v.label}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-6 px-2">Mirada Nova</h3>
                        <div className="relative">
                            <textarea
                                value={contribution}
                                onChange={(e) => setContribution(e.target.value)}
                                placeholder="Escriu aquí algun suggeriment o dubte..."
                                className="w-full h-32 bg-white rounded-3xl p-6 text-sm border border-black/[0.03] shadow-sm focus:ring-2 focus:ring-[var(--jesuites-blue)] outline-none transition-all placeholder:text-gray-300"
                            />
                            <button
                                disabled={isSending || !contribution.trim()}
                                onClick={sendContribution}
                                className="absolute bottom-4 right-4 bg-[var(--jesuites-blue)] text-white p-3 rounded-2xl shadow-lg active:scale-90 disabled:opacity-30 transition-all"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </section>
                </div>

                {/* Feedback Message */}
                {feedback && (
                    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-[var(--jesuites-blue)] text-white px-6 py-3 rounded-full text-sm font-bold shadow-2xl animate-fade-in-up">
                        {feedback}
                    </div>
                )}
            </div>
        </main>
    );
}

function SparkleIcon({ size = 24 }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            <path d="M5 3v4" /><path d="M3 5h4" /><path d="M21 17v4" /><path d="M19 19h4" />
        </svg>
    );
}
