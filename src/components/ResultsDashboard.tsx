"use client";

import { useState, useEffect, useMemo } from "react";
import { Check, Globe } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { DASHBOARD_SECTIONS, VOTE_LABELS, VOTE_COLORS } from "@/lib/data";

export default function ResultsDashboard() {
    const [activeSection, setActiveSection] = useState("global");
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

    const allItems = useMemo(() => DASHBOARD_SECTIONS.flatMap(s => s.items), []);
    const currentItems = activeSection === "global"
        ? allItems
        : DASHBOARD_SECTIONS.find(s => s.id === activeSection)?.items || [];

    // Map item → section name for global view labels
    const itemSectionMap = useMemo(() => {
        const map: Record<string, string> = {};
        DASHBOARD_SECTIONS.forEach(s => s.items.forEach(item => { map[item] = s.name; }));
        return map;
    }, []);

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
                <button
                    onClick={() => setActiveSection("global")}
                    className={`px-6 py-3 md:px-8 md:py-4 rounded-3xl text-xs md:text-sm font-bold uppercase tracking-widest transition-all duration-500 flex items-center gap-2 ${activeSection === "global" ? 'bg-white text-[var(--jesuites-blue)] shadow-xl scale-105 ring-2 ring-amber-200' : 'bg-white/10 text-white/60 hover:bg-white/15 border border-white/10'}`}
                >
                    <Globe size={16} /> Global
                </button>
                {DASHBOARD_SECTIONS.map(s => (
                    <button
                        key={s.id}
                        onClick={() => setActiveSection(s.id)}
                        className={`px-6 py-3 md:px-8 md:py-4 rounded-3xl text-xs md:text-sm font-bold uppercase tracking-widest transition-all duration-500 ${activeSection === s.id ? 'bg-amber-200 text-[var(--jesuites-blue)] shadow-xl scale-105' : 'bg-white/5 text-white/40 hover:bg-white/10 border border-white/5'}`}
                    >
                        {s.name}
                    </button>
                ))}
            </div>

            {/* Selector d'Ordenació */}
            <div className="flex flex-wrap gap-3 mb-16 justify-center border-t border-white/5 pt-10">
                <span className="w-full text-center text-xs uppercase tracking-widest text-white/40 mb-4 font-bold italic">Ordena per percepció dominant:</span>
                {Object.entries(VOTE_LABELS).map(([id, label]) => (
                    <button
                        key={id}
                        onClick={() => setSortBy(sortBy === id ? null : id)}
                        className={`px-5 py-2.5 md:px-6 md:py-3 rounded-2xl text-xs md:text-sm font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${sortBy === id ? 'bg-white text-[var(--jesuites-blue)] shadow-lg scale-105' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                    >
                        {sortBy === id && <Check size={14} strokeWidth={4} />}
                        {label}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-6">
                    <div className="w-12 h-12 border-4 border-amber-200 border-t-transparent rounded-full animate-spin" />
                    <div className="animate-pulse text-amber-200 uppercase tracking-widest text-sm font-bold">Processant dades de la comunitat...</div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                    {sortedItems.map(itemId => {
                        const stats = getStats(itemId);
                        const dominant = [...stats].sort((a, b) => b.percent - a.percent)[0];

                        return (
                            <div key={itemId} className="group bg-white/[0.04] backdrop-blur-md rounded-2xl p-5 md:p-6 border border-white/5 hover:border-amber-200/30 transition-all duration-300 hover:bg-white/[0.07]">
                                <div className="flex justify-between items-start mb-5 gap-3">
                                    <div className="min-w-0">
                                        {activeSection === "global" && (
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-200/50 block mb-1">{itemSectionMap[itemId]}</span>
                                        )}
                                        <h4 className="text-base md:text-lg font-bold uppercase tracking-tight text-white font-serif leading-tight">
                                            {itemId.replace("nivell", "Nivell ").replace("D", "Dimensió D")}
                                        </h4>
                                    </div>
                                    {dominant && dominant.percent > 50 && (
                                        <div className={`px-2.5 py-1 rounded-full ${VOTE_COLORS[dominant.type]} text-white text-[10px] font-black uppercase tracking-wider shadow-md shrink-0`}>
                                            {VOTE_LABELS[dominant.type]}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    {stats.map(s => (
                                        <div key={s.type} className="space-y-1.5">
                                            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full shrink-0 ${VOTE_COLORS[s.type]}`} />
                                                    <span className={s.percent > 0 ? 'text-white/80' : 'text-white/25'}>{VOTE_LABELS[s.type]}</span>
                                                </div>
                                                <span className={`font-serif italic ${s.percent > 0 ? 'text-amber-200' : 'text-white/20'}`}>{s.percent}%</span>
                                            </div>
                                            <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${VOTE_COLORS[s.type]} transition-all duration-[1.5s] ease-out rounded-full`}
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
