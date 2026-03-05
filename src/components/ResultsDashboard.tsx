"use client";

import { useState, useEffect, useMemo } from "react";
import { Globe, LayoutGrid, BarChart2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { DASHBOARD_SECTIONS, VOTE_LABELS, VOTE_COLORS } from "@/lib/data";

const ITEM_NAMES: Record<string, string> = {
    D1: "Delegació", D2: "Descripció", D3: "Discerniment", D4: "Diligència",
    nivell0: "L0: Preservació", nivell1: "L1: Exploració", nivell2: "L2: Suport",
    nivell3: "L3: Cocreació",   nivell4: "L4: Delegació",  nivell5: "L5: Agència",
};

const SECTION_COLORS: Record<string, { border: string; label: string; activeBg: string; activeText: string; bg: string }> = {
    objectius: { border: "border-t-amber-400",   label: "text-amber-400",   activeBg: "bg-amber-400",   activeText: "text-[var(--jesuites-blue)]", bg: "bg-amber-400/15" },
    valors:    { border: "border-t-emerald-400", label: "text-emerald-400", activeBg: "bg-emerald-400", activeText: "text-[var(--jesuites-blue)]", bg: "bg-emerald-400/15" },
    tensions:  { border: "border-t-rose-400",    label: "text-rose-400",    activeBg: "bg-rose-400",    activeText: "text-white",                  bg: "bg-rose-400/15" },
    model4d:   { border: "border-t-violet-400",  label: "text-violet-400",  activeBg: "bg-violet-400",  activeText: "text-white",                  bg: "bg-violet-400/15" },
    delegacio: { border: "border-t-cyan-400",    label: "text-cyan-400",    activeBg: "bg-cyan-400",    activeText: "text-[var(--jesuites-blue)]", bg: "bg-cyan-400/15" },
};

export default function ResultsDashboard() {
    const [viewMode, setViewMode] = useState<"resum" | "targetes">("resum");
    const [activeSection, setActiveSection] = useState("global");
    const [filterBy, setFilterBy] = useState<string | null>(null);
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

    const itemSectionMap = useMemo(() => {
        const nameMap: Record<string, string> = {};
        const idMap: Record<string, string> = {};
        DASHBOARD_SECTIONS.forEach(s => s.items.forEach(item => {
            nameMap[item] = s.name;
            idMap[item] = s.id;
        }));
        return { nameMap, idMap };
    }, []);

    const visibleItems = useMemo(() => {
        if (!filterBy) return currentItems;
        return currentItems.filter(itemId => {
            const hasVotes = data.some(v => v.item_id === itemId);
            if (!hasVotes) return false;
            const stats = getStats(itemId);
            const dominant = [...stats].sort((a, b) => b.percent - a.percent)[0];
            return dominant?.type === filterBy;
        });
    }, [currentItems, filterBy, getStats, data]);

    const summary = useMemo(() => {
        const totalVotes = data.length;
        const globalByType = Object.keys(VOTE_LABELS).map(type => ({
            type,
            count: data.filter(v => v.vote_type === type).length,
            percent: totalVotes > 0 ? Math.round((data.filter(v => v.vote_type === type).length / totalVotes) * 100) : 0,
        }));
        const bySection = DASHBOARD_SECTIONS.map(s => {
            const sVotes = data.filter(v => s.items.includes(v.item_id));
            const total = sVotes.length || 1;
            const hasVotes = sVotes.length > 0;
            const byType = Object.keys(VOTE_LABELS).map(type => ({
                type,
                percent: hasVotes ? Math.round((sVotes.filter(v => v.vote_type === type).length / total) * 100) : 0,
            }));
            const dominant = hasVotes ? [...byType].sort((a, b) => b.percent - a.percent)[0] : null;
            return { ...s, byType, dominant, totalVotes: sVotes.length };
        });
        return { totalVotes, globalByType, bySection };
    }, [data]);

    return (
        <div className="bg-white/5 backdrop-blur-3xl rounded-[4rem] p-6 md:p-16 border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.3)]">

            {/* Toggle Resum / Targetes */}
            <div className="flex justify-center mb-12">
                <div className="flex bg-white/5 rounded-2xl p-1 gap-1 border border-white/10">
                    <button
                        onClick={() => setViewMode("resum")}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-300 ${viewMode === "resum" ? "bg-white text-[var(--jesuites-blue)] shadow-md" : "text-white/50 hover:text-white/80"}`}
                    >
                        <BarChart2 size={16} /> Resum
                    </button>
                    <button
                        onClick={() => setViewMode("targetes")}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-300 ${viewMode === "targetes" ? "bg-white text-[var(--jesuites-blue)] shadow-md" : "text-white/50 hover:text-white/80"}`}
                    >
                        <LayoutGrid size={16} /> Targetes
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-6">
                    <div className="w-12 h-12 border-4 border-amber-200 border-t-transparent rounded-full animate-spin" />
                    <div className="animate-pulse text-amber-200 uppercase tracking-widest text-sm font-bold">Processant dades de la comunitat...</div>
                </div>
            ) : viewMode === "resum" ? (
                /* ── VISTA RESUM ── */
                <div className="space-y-10">
                    {/* Capçalera global */}
                    <div className="flex flex-col md:flex-row items-center gap-6 bg-white/[0.03] rounded-2xl p-6 md:p-8 border border-white/5">
                        <div className="text-center md:text-left shrink-0">
                            <div className="text-5xl md:text-7xl font-bold font-serif text-white leading-none">{summary.totalVotes}</div>
                            <div className="text-xs uppercase tracking-widest text-white/40 mt-1 font-bold">vots totals</div>
                        </div>
                        <div className="flex-1 w-full space-y-3">
                            {/* Barra global apilada */}
                            <div className="flex h-8 rounded-full overflow-hidden gap-px">
                                {summary.globalByType.map(t => (
                                    <div
                                        key={t.type}
                                        className={`${VOTE_COLORS[t.type]} transition-all duration-[1.5s] ease-out first:rounded-l-full last:rounded-r-full`}
                                        style={{ width: `${t.percent}%` }}
                                        title={`${VOTE_LABELS[t.type]}: ${t.percent}%`}
                                    />
                                ))}
                            </div>
                            {/* Llegenda */}
                            <div className="flex flex-wrap gap-x-5 gap-y-1">
                                {summary.globalByType.map(t => (
                                    <div key={t.type} className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${VOTE_COLORS[t.type]}`} />
                                        <span className="text-xs font-bold text-white/70 uppercase tracking-wider">{VOTE_LABELS[t.type]}</span>
                                        <span className="text-xs font-serif italic text-amber-200">{t.percent}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Files per categoria */}
                    <div className="space-y-3">
                        {summary.bySection.map(s => {
                            const col = SECTION_COLORS[s.id];
                            return (
                                <div key={s.id} className={`rounded-2xl p-5 md:p-6 border border-white/5 ${col.bg}`}>
                                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                                        {/* Nom categoria */}
                                        <div className="md:w-40 shrink-0">
                                            <div className={`text-base font-black uppercase tracking-widest ${col.label}`}>{s.name}</div>
                                            <div className="text-xs text-white/30 mt-0.5">{s.totalVotes} vots · {s.items.length} ítems</div>
                                        </div>
                                        {/* Barra apilada */}
                                        <div className="flex-1 space-y-2">
                                            {s.totalVotes > 0 ? (
                                                <>
                                                    <div className="flex h-5 rounded-full overflow-hidden gap-px">
                                                        {s.byType.map(t => (
                                                            <div
                                                                key={t.type}
                                                                className={`${VOTE_COLORS[t.type]} transition-all duration-[1.5s] ease-out first:rounded-l-full last:rounded-r-full`}
                                                                style={{ width: `${t.percent}%` }}
                                                                title={`${VOTE_LABELS[t.type]}: ${t.percent}%`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <div className="flex flex-wrap gap-x-4 gap-y-0.5">
                                                        {s.byType.filter(t => t.percent > 0).map(t => (
                                                            <span key={t.type} className="text-xs text-white/50 uppercase tracking-wide">
                                                                {VOTE_LABELS[t.type]} <span className="text-amber-200 font-serif italic">{t.percent}%</span>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="h-5 rounded-full bg-white/10 flex items-center px-3">
                                                    <span className="text-xs text-white/25 italic">Sense vots encara</span>
                                                </div>
                                            )}
                                        </div>
                                        {/* Percepció dominant */}
                                        {s.dominant && s.totalVotes > 0 && (
                                            <div className={`shrink-0 px-3 py-1.5 rounded-full ${VOTE_COLORS[s.dominant.type]} text-white text-xs font-black uppercase tracking-wider`}>
                                                {VOTE_LABELS[s.dominant.type]} {s.dominant.percent}%
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                /* ── VISTA TARGETES ── */
                <>
                    {/* Selector de Secció */}
                    <div className="flex flex-wrap gap-3 mb-12 justify-center">
                        <button
                            onClick={() => setActiveSection("global")}
                            className={`px-6 py-3 md:px-8 md:py-4 rounded-3xl text-sm md:text-base font-bold uppercase tracking-widest transition-all duration-500 flex items-center gap-2 ${activeSection === "global" ? 'bg-white text-[var(--jesuites-blue)] shadow-xl scale-105 ring-2 ring-amber-200' : 'bg-white/10 text-white/60 hover:bg-white/15 border border-white/10'}`}
                        >
                            <Globe size={16} /> Global
                        </button>
                        {DASHBOARD_SECTIONS.map(s => {
                            const col = SECTION_COLORS[s.id];
                            return (
                                <button
                                    key={s.id}
                                    onClick={() => setActiveSection(s.id)}
                                    className={`px-6 py-3 md:px-8 md:py-4 rounded-3xl text-sm md:text-base font-bold uppercase tracking-widest transition-all duration-500 ${activeSection === s.id ? `${col.activeBg} ${col.activeText} shadow-xl scale-105` : 'bg-white/5 text-white/50 hover:bg-white/10 border border-white/5'}`}
                                >
                                    {s.name}
                                </button>
                            );
                        })}
                    </div>

                    {/* Filtre per percepció dominant */}
                    <div className="flex flex-wrap gap-3 mb-12 justify-center border-t border-white/5 pt-10">
                        <span className="w-full text-center text-sm uppercase tracking-widest text-white/50 mb-4 font-bold italic">
                            Filtra per percepció dominant:
                        </span>
                        <button
                            onClick={() => setFilterBy(null)}
                            className={`px-7 py-3 md:px-9 md:py-4 rounded-2xl text-sm md:text-base font-bold uppercase tracking-widest transition-all duration-300 ${filterBy === null ? 'bg-white text-[var(--jesuites-blue)] shadow-lg scale-105' : 'bg-white/10 text-white/60 hover:bg-white/15 border border-white/10'}`}
                        >
                            Totes
                        </button>
                        {Object.entries(VOTE_LABELS).map(([id, label]) => (
                            <button
                                key={id}
                                onClick={() => setFilterBy(filterBy === id ? null : id)}
                                className={`px-7 py-3 md:px-9 md:py-4 rounded-2xl text-sm md:text-base font-bold uppercase tracking-widest transition-all duration-300 ${filterBy === id ? `${VOTE_COLORS[id]} text-white shadow-lg scale-105` : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'}`}
                            >
                                {label}
                            </button>
                        ))}
                        {filterBy && (
                            <span className="w-full text-center text-xs text-white/30 mt-2 italic">
                                {visibleItems.length} resultat{visibleItems.length !== 1 ? 's' : ''} on &quot;{VOTE_LABELS[filterBy]}&quot; és la percepció dominant
                            </span>
                        )}
                    </div>

                    {visibleItems.length === 0 ? (
                        <div className="text-center py-24 text-white/30 text-lg font-bold uppercase tracking-widest italic">
                            Cap resultat amb aquesta percepció dominant
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                            {visibleItems.map(itemId => {
                                const stats = getStats(itemId);
                                const dominant = [...stats].sort((a, b) => b.percent - a.percent)[0];
                                const sectionId = itemSectionMap.idMap[itemId];
                                const col = SECTION_COLORS[sectionId] ?? SECTION_COLORS.objectius;

                                return (
                                    <div key={itemId} className={`group bg-white/[0.04] backdrop-blur-md rounded-2xl border-t-2 ${col.border} border border-white/5 p-5 md:p-6 hover:bg-white/[0.08] transition-all duration-300`}>
                                        <div className="flex justify-between items-start mb-4 gap-3">
                                            <div className="min-w-0">
                                                {activeSection === "global" && (
                                                    <span className={`text-sm font-black uppercase tracking-widest ${col.label} block mb-1.5`}>
                                                        {itemSectionMap.nameMap[itemId]}
                                                    </span>
                                                )}
                                                <h4 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-white font-serif leading-tight">
                                                    {ITEM_NAMES[itemId] ?? itemId}
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
                                                    <div className="flex justify-between items-center text-sm font-bold uppercase tracking-wider">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-2 h-2 rounded-full shrink-0 ${VOTE_COLORS[s.type]}`} />
                                                            <span className={s.percent > 0 ? 'text-white' : 'text-white/50'}>{VOTE_LABELS[s.type]}</span>
                                                        </div>
                                                        <span className={`text-base font-serif italic ${s.percent > 0 ? 'text-amber-200' : 'text-white/20'}`}>{s.percent}%</span>
                                                    </div>
                                                    <div className="h-2.5 bg-black/30 rounded-full overflow-hidden">
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
                </>
            )}
        </div>
    );
}
