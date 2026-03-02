"use client";

import { useState, useEffect, useMemo } from "react";
import { CheckCircle2, AlertCircle, HelpCircle, Lightbulb, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { DASHBOARD_SECTIONS, VOTE_LABELS, VOTE_COLORS } from "@/lib/data";

export default function ResultsDashboard() {
    const [activeSection, setActiveSection] = useState("objectius");
    const [sortBy, setSortBy] = useState<string | null>(null);
    const [data, setData] = useState<{ item_id: string; vote_type: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const { data: votes, error } = await supabase.from("votes").select("item_id, vote_type");
            if (!error && votes) setData(votes);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    const getStats = useMemo(() => {
        return (itemId: string) => {
            const itemVotes = data.filter(v => v.item_id === itemId);
            const total = itemVotes.length || 1;
            return Object.keys(VOTE_LABELS).map(type => ({
                type,
                count: itemVotes.filter(v => v.vote_type === type).length,
                percent: Math.round((itemVotes.filter(v => v.vote_type === type).length / total) * 100)
            }));
        };
    }, [data]);

    const currentItems = DASHBOARD_SECTIONS.find(s => s.id === activeSection)?.items || [];

    const sortedItems = useMemo(() => {
        return [...currentItems].sort((a, b) => {
            if (!sortBy) return 0;
            const statsA = getStats(a).find(s => s.type === sortBy)?.percent || 0;
            const statsB = getStats(b).find(s => s.type === sortBy)?.percent || 0;
            return statsB - statsA;
        });
    }, [currentItems, sortBy, getStats]);

    return (
        <div className="bg-white/5 backdrop-blur-3xl rounded-[4rem] p-6 md:p-16 border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.3)]">
            {/* Selector de Secció */}
            <div className="flex flex-wrap gap-3 mb-12 justify-center">
                {DASHBOARD_SECTIONS.map(s => (
                    <button
                        key={s.id}
                        onClick={() => setActiveSection(s.id)}
                        className={`px-8 py-4 rounded-3xl text-[10px] font-bold uppercase tracking-widest transition-all duration-500 ${activeSection === s.id ? 'bg-amber-200 text-[var(--jesuites-blue)] shadow-xl scale-105' : 'bg-white/5 text-white/40 hover:bg-white/10 border border-white/5'}`}
                    >
                        {s.name}
                    </button>
                ))}
            </div>

            {/* Selector d'Ordenació */}
            <div className="flex flex-wrap gap-2 mb-16 justify-center border-t border-white/5 pt-10">
                <span className="w-full text-center text-[9px] uppercase tracking-[0.3em] text-white/30 mb-4 font-bold italic">Ordena per percepció dominant:</span>
                {Object.entries(VOTE_LABELS).map(([id, label]) => (
                    <button
                        key={id}
                        onClick={() => setSortBy(sortBy === id ? null : id)}
                        className={`px-6 py-3 rounded-2xl text-[9px] font-bold uppercase tracking-widest flex items-center gap-3 transition-all ${sortBy === id ? 'bg-white text-[var(--jesuites-blue)] shadow-lg scale-105' : 'bg-white/5 text-white/30 hover:bg-white/10'}`}
                    >
                        {sortBy === id && <Check size={12} strokeWidth={4} />}
                        {label}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-6">
                    <div className="w-12 h-12 border-4 border-amber-200 border-t-transparent rounded-full animate-spin" />
                    <div className="animate-pulse text-amber-200 uppercase tracking-widest text-xs font-bold">Processant dades de la comunitat...</div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                    {sortedItems.map(itemId => {
                        const stats = getStats(itemId);
                        const dominant = [...stats].sort((a, b) => b.percent - a.percent)[0];

                        return (
                            <div key={itemId} className="group bg-white/[0.03] backdrop-blur-md rounded-[3.5rem] p-8 md:p-12 border border-white/5 hover:border-amber-200/30 transition-all duration-500 hover:bg-white/[0.06] hover:-translate-y-2">
                                <div className="flex justify-between items-start mb-10">
                                    <h4 className="text-lg md:text-xl font-bold uppercase tracking-tight text-white font-serif leading-tight">
                                        {itemId.replace("nivell", "Nivell ").replace("D", "Dimensió D")}
                                    </h4>
                                    {dominant && dominant.percent > 50 && (
                                        <div className={`px-4 py-1.5 rounded-full ${VOTE_COLORS[dominant.type]} text-white text-[9px] font-black uppercase tracking-widest shadow-lg animate-pulse`}>
                                            Consens: {VOTE_LABELS[dominant.type]}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-8">
                                    {stats.map(s => (
                                        <div key={s.type} className="space-y-3">
                                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest px-2 transition-all">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full ${VOTE_COLORS[s.type]} shadow-[0_0_10px_rgba(255,255,255,0.2)]`} />
                                                    <span className={s.percent > 0 ? 'text-white' : 'text-white/30'}>{VOTE_LABELS[s.type]}</span>
                                                </div>
                                                <span className={`text-[12px] font-serif italic ${s.percent > 0 ? 'text-amber-200' : 'text-white/20'}`}>{s.percent}%</span>
                                            </div>
                                            <div className="h-4 bg-black/20 rounded-full overflow-hidden p-1 shadow-inner">
                                                <div
                                                    className={`h-full ${VOTE_COLORS[s.type]} transition-all duration-[1.5s] ease-out rounded-full shadow-[0_0_15px_rgba(255,255,255,0.1)]`}
                                                    style={{ width: `${s.percent}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
