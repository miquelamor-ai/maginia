"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
    CheckCircle2, AlertCircle, HelpCircle, Lightbulb,
    Send, Sparkles, ChevronDown, MessageSquare, Check
} from "lucide-react";

interface SubItem {
    id: string;
    name: string;
}

interface Section {
    id: string;
    name: string;
    items: SubItem[];
}

const CONTENT: Section[] = [
    {
        id: "valors",
        name: "Valors i Principis",
        items: [
            { id: "antropocentrisme", name: "Antropocentrisme" },
            { id: "transparencia", name: "Transparència" },
            { id: "verificacio", name: "Verificació i Crítica" },
            { id: "equitat", name: "Equitat i Inclusió" },
            { id: "benestar", name: "Benestar" }
        ]
    },
    {
        id: "tensions",
        name: "Tensions Dialèctiques",
        items: [
            { id: "humanisme", name: "Integritat Humana" },
            { id: "agencia", name: "Autonomia i Agència" },
            { id: "cognicio", name: "Profunditat Cognitiva" },
            { id: "presencia", name: "Vincles i Presència" },
            { id: "justicia", name: "Justícia i Equitat" },
            { id: "plausibilitat", name: "Integritat Intel·lectual" }
        ]
    },
    {
        id: "delegacio",
        name: "Graus de Delegació",
        items: [
            { id: "nivell0", name: "L0: Preservació" },
            { id: "nivell1", name: "L1: Exploració" },
            { id: "nivell2", name: "L2: Suport" },
            { id: "nivell3", name: "L3: Cocreació" },
            { id: "nivell4", name: "L4: Delegació" },
            { id: "nivell5", name: "L5: Agència" }
        ]
    }
];

const VOTE_TYPES = [
    { id: "agree", label: "D'acord", color: "bg-green-500", icon: CheckCircle2 },
    { id: "worry", label: "M'inquieta", color: "bg-orange-500", icon: AlertCircle },
    { id: "doubt", label: "Tinc dubtes", color: "bg-blue-500", icon: HelpCircle },
    { id: "inspired", label: "M'inspira", color: "bg-purple-500", icon: Lightbulb }
];

export default function Participar() {
    const [votes, setVotes] = useState<Record<string, string>>({});
    const [comments, setComments] = useState<Record<string, string>>({});
    const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
    const [isSendingId, setIsSendingId] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<string | null>(null);

    const handleVote = async (itemId: string, sectionId: string, type: string) => {
        // Toggle logic: if clicking same type, remove vote. Else update.
        const newType = votes[itemId] === type ? "" : type;

        setVotes(prev => ({ ...prev, [itemId]: newType }));

        if (newType) {
            setIsSendingId(itemId + "_vote");
            const { error } = await supabase.from("votes").insert([
                { section_id: sectionId, item_id: itemId, vote_type: type }
            ]);
            if (!error) {
                setFeedback("Vot registrat");
                setTimeout(() => setFeedback(null), 1500);
            }
            setIsSendingId(null);
        }
    };

    const handleComment = async (itemId: string, sectionId: string) => {
        const text = comments[itemId]?.trim();
        if (!text) return;

        setIsSendingId(itemId + "_comment");
        const { error } = await supabase.from("contributions").insert([
            { section_id: sectionId, content: `[${itemId}] ${text}` }
        ]);

        if (!error) {
            setFeedback("Gràcies per la idea!");
            setOpenComments(prev => ({ ...prev, [itemId]: false }));
            setComments(prev => ({ ...prev, [itemId]: "" }));
            setTimeout(() => setFeedback(null), 2000);
        }
        setIsSendingId(null);
    };

    return (
        <main className="min-h-screen bg-[var(--jesuites-cream)] pb-32 font-sans select-none overflow-x-hidden">
            <div className="max-w-xl mx-auto px-4 md:px-0">

                {/* Header Compacte */}
                <header className="py-12 text-center sticky top-0 bg-[var(--jesuites-cream)]/90 backdrop-blur-md z-30 mb-8 border-b border-black/5">
                    <div className="w-14 h-14 bg-[var(--jesuites-blue)] rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
                        <Sparkles size={28} />
                    </div>
                    <h1 className="text-xl font-bold text-[var(--jesuites-blue)] uppercase tracking-tighter">PARTICIPACIÓ ÀGIL</h1>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Comparteix la teva mirada en un toc</p>
                </header>

                <div className="space-y-16">
                    {CONTENT.map((section) => (
                        <div key={section.id} className="reveal-section">
                            <h3 className="text-[11px] font-bold uppercase tracking-[0.4em] text-[var(--jesuites-blue)]/40 mb-8 px-4 border-l-4 border-[var(--jesuites-blue)]">
                                {section.name}
                            </h3>

                            <div className="space-y-4 px-2">
                                {section.items.map((item) => (
                                    <div key={item.id} className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-black/[0.03] transition-all hover:shadow-md">
                                        <div className="flex justify-between items-center mb-6">
                                            <span className="text-sm font-bold text-[var(--jesuites-blue)] uppercase tracking-tight leading-tight pr-4">
                                                {item.name}
                                            </span>
                                            <button
                                                onClick={() => setOpenComments(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                                                className={`p-3 rounded-full transition-all ${openComments[item.id] ? 'bg-[var(--jesuites-blue)] text-white shadow-lg' : 'bg-[var(--jesuites-cream)] text-gray-400 hover:text-[var(--jesuites-blue)]'}`}
                                            >
                                                <MessageSquare size={18} />
                                            </button>
                                        </div>

                                        {/* Votació Horizontal */}
                                        <div className="grid grid-cols-4 gap-2">
                                            {VOTE_TYPES.map((v) => {
                                                const isActive = votes[item.id] === v.id;
                                                return (
                                                    <button
                                                        key={v.id}
                                                        onClick={() => handleVote(item.id, section.id, v.id)}
                                                        className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-300 ${isActive ? `${v.color} text-white shadow-xl scale-105 ring-4 ring-white/20` : 'bg-[var(--jesuites-cream)]/50 text-gray-400 hover:bg-white border border-black/[0.02]'}`}
                                                    >
                                                        <v.icon size={22} className={isActive ? 'animate-pulse' : ''} />
                                                        <span className={`text-[8px] font-bold uppercase tracking-widest leading-none ${isActive ? 'text-white' : 'text-gray-400'}`}>
                                                            {v.label}
                                                        </span>
                                                        {isActive && <div className="absolute -top-1 -right-1 bg-white text-[var(--jesuites-blue)] rounded-full p-1 shadow-sm"><Check size={8} strokeWidth={4} /></div>}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Comentari Desplegable */}
                                        <div className={`transition-all duration-500 overflow-hidden ${openComments[item.id] ? 'max-h-[300px] opacity-100 mt-6 pt-6 border-t border-black/5' : 'max-h-0 opacity-0'}`}>
                                            <div className="relative">
                                                <textarea
                                                    value={comments[item.id] || ""}
                                                    onChange={(e) => setComments(prev => ({ ...prev, [item.id]: e.target.value }))}
                                                    placeholder="Afegeix matisos o idees..."
                                                    className="w-full h-24 bg-[var(--jesuites-cream)]/30 rounded-2xl p-4 text-xs font-medium outline-none border border-transparent focus:border-[var(--jesuites-blue)]/20 transition-all resize-none"
                                                />
                                                <button
                                                    onClick={() => handleComment(item.id, section.id)}
                                                    disabled={isSendingId === item.id + "_comment" || !comments[item.id]?.trim()}
                                                    className="absolute bottom-3 right-3 bg-[var(--jesuites-blue)] text-white p-2.5 rounded-xl shadow-lg active:scale-90 disabled:opacity-20 transition-all"
                                                >
                                                    <Send size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Barra de progrés flotant opcional? Millor un feedback net */}
                {feedback && (
                    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-[var(--jesuites-blue)] text-white px-8 py-4 rounded-full text-[10px] font-bold shadow-2xl animate-fade-in-up uppercase tracking-[0.3em] z-[100] border border-white/10">
                        {feedback}
                    </div>
                )}
            </div>

            {/* Link per tornar a la web principal */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-black/5 flex justify-center z-[90]">
                <button onClick={() => window.location.href = '/'} className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--jesuites-blue)] hover:underline">
                    ← Tornar a MIRADES OBERTES
                </button>
            </div>
        </main>
    );
}
