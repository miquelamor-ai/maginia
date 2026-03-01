"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import {
    CheckCircle2, AlertCircle, HelpCircle, Lightbulb,
    Send, Sparkles, ChevronRight
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
            { id: "justicia", name: "Justícia i Equitat" }
        ]
    },
    {
        id: "delegacio",
        name: "Graus de Delegació",
        items: [
            { id: "nivell0", name: "Preservació (L0)" },
            { id: "nivell1", name: "Exploració (L1)" },
            { id: "nivell2", name: "Suport (L2)" },
            { id: "nivell3", name: "Cocreació (L3)" },
            { id: "nivell4", name: "Delegació (L4)" },
            { id: "nivell5", name: "Agència (L5)" }
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
    const [activeTab, setActiveTab] = useState<"sections" | "voting">("sections");
    const [selectedSection, setSelectedSection] = useState<Section | null>(null);
    const [selectedItem, setSelectedItem] = useState<SubItem | null>(null);

    const [isSending, setIsSending] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [contribution, setContribution] = useState("");

    const handleSelectItem = (section: Section, item: SubItem) => {
        setSelectedSection(section);
        setSelectedItem(item);
        setActiveTab("voting");
    };

    const sendVote = async (type: string) => {
        if (!selectedItem) return;
        setIsSending(true);
        const { error } = await supabase.from("votes").insert([
            {
                section_id: selectedSection?.id,
                item_id: selectedItem.id,
                vote_type: type
            }
        ]);

        if (!error) {
            setFeedback("Vot enviat!");
            setTimeout(() => setFeedback(null), 2000);
        }
        setIsSending(false);
    };

    const sendContribution = async () => {
        if (!contribution.trim() || !selectedItem) return;
        setIsSending(true);
        const { error } = await supabase.from("contributions").insert([
            {
                section_id: selectedSection?.id,
                content: `[${selectedItem.name}] ${contribution.trim()}`
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
                    <div className="w-16 h-16 bg-[var(--jesuites-blue)] rounded-3xl flex items-center justify-center mx-auto mb-6 text-white shadow-xl">
                        <Sparkles size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-[var(--jesuites-blue)] uppercase tracking-tight">Participar</h1>
                    {selectedItem && activeTab === "voting" && (
                        <p className="text-xs text-[var(--jesuites-blue)] font-bold mt-2 uppercase tracking-widest bg-white/50 py-1 px-4 rounded-full inline-block border border-black/5">
                            {selectedItem.name}
                        </p>
                    )}
                </header>

                {activeTab === "sections" ? (
                    <div className="space-y-12">
                        {CONTENT.map((section) => (
                            <div key={section.id}>
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-6 px-2">{section.name}</h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {section.items.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => handleSelectItem(section, item)}
                                            className="bg-white p-6 rounded-3xl flex justify-between items-center group active:scale-95 transition-all border border-black/[0.03] shadow-sm"
                                        >
                                            <span className="text-sm font-bold text-[var(--jesuites-blue)] uppercase tracking-tight">{item.name}</span>
                                            <ChevronRight size={18} className="text-gray-300 group-hover:text-[var(--jesuites-blue)]" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-12 animate-fade-in">
                        <button
                            onClick={() => setActiveTab("sections")}
                            className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2"
                        >
                            ← Tornar a la llista
                        </button>

                        <section>
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-6 px-2">Com ho veus?</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {VOTE_TYPES.map((v) => (
                                    <button
                                        key={v.id}
                                        disabled={isSending}
                                        onClick={() => sendVote(v.id)}
                                        className="bg-white p-6 rounded-[2.5rem] border border-black/[0.03] shadow-sm active:scale-95 transition-all flex flex-col items-center justify-center gap-4 group"
                                    >
                                        <div className={`p-4 rounded-2xl ${v.color} text-white transition-transform group-active:scale-110 shadow-lg`}>
                                            <v.icon size={28} />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">{v.label}</span>
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-6 px-2">La teva mirada</h3>
                            <div className="relative">
                                <textarea
                                    value={contribution}
                                    onChange={(e) => setContribution(e.target.value)}
                                    placeholder={`Escriu aquí sobre ${selectedItem?.name}...`}
                                    className="w-full h-40 bg-white rounded-[2.5rem] p-8 text-sm border border-black/[0.03] shadow-sm focus:ring-2 focus:ring-[var(--jesuites-blue)] outline-none transition-all placeholder:text-gray-300 leading-relaxed"
                                />
                                <button
                                    disabled={isSending || !contribution.trim()}
                                    onClick={sendContribution}
                                    className="absolute bottom-6 right-6 bg-[var(--jesuites-blue)] text-white p-4 rounded-2xl shadow-xl active:scale-90 disabled:opacity-30 transition-all"
                                >
                                    <Send size={22} />
                                </button>
                            </div>
                        </section>
                    </div>
                )}

                {/* Feedback Message */}
                {feedback && (
                    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-[var(--jesuites-blue)] text-white px-8 py-4 rounded-full text-xs font-bold shadow-2xl animate-fade-in-up uppercase tracking-widest">
                        {feedback}
                    </div>
                )}
            </div>
        </main>
    );
}
