"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Sparkles, HelpCircle, Heart, Lightbulb, AlertCircle, Send } from "lucide-react";

export default function TancamentPage() {
  const [guidedSessionId, setGuidedSessionId] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [voted, setVoted] = useState<string | null>(null);
  const [slide, setSlide] = useState<number>(0);
  const [refinementText, setRefinementText] = useState("");
  const [refinementSent, setRefinementSent] = useState(false);
  const [decaleg, setDecaleg] = useState<any>(null);

  useEffect(() => {
    // Read from local storage
    if (typeof window !== "undefined") {
      const gsId = localStorage.getItem("maginia_guided_session_id");
      if (gsId) setGuidedSessionId(gsId);
      const sid = localStorage.getItem("maginia_session_id");
      if (sid) setSessionId(sid);
    }
  }, []);

  useEffect(() => {
    if (!guidedSessionId) return;
    const poll = async () => {
      const { data } = await supabase
        .from("mapa_facilitador_state")
        .select("phase, is_active, current_idx, decaleg_json")
        .eq("id", 1)
        .single();
      
      if (!data || !data.is_active) return;
      if (data.phase !== "tancament") {
        window.location.href = "/mapa/sessio" + (guidedSessionId ? "?g=" + guidedSessionId : "");
        return;
      }
      setSlide(data.current_idx || 0);
      if (data.decaleg_json) {
        try { setDecaleg(JSON.parse(data.decaleg_json)); } catch {}
      }
    };
    poll();
    const interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, [guidedSessionId]);

  const castVote = async (type: "worry" | "doubt" | "agree" | "inspired") => {
    if (voted || !sessionId) return;
    setVoted(type);
    await supabase.from("mapa_tancament_votes").insert({
      session_id: guidedSessionId || "default",
      participant_id: sessionId,
      vote_type: type
    });
  };

  const sendRefinement = async () => {
    if (!refinementText.trim() || !sessionId || !guidedSessionId) return;
    setRefinementSent(true);
    await supabase.from("mapa_decaleg_refinements").insert({
      guided_session_id: guidedSessionId,
      participant_id: sessionId,
      text: refinementText.trim()
    });
    setRefinementText("");
  };

  return (
    <main className="min-h-screen bg-[var(--jesuites-cream)] font-sans flex flex-col p-4 overflow-auto">
      <div className="max-w-md w-full mx-auto flex flex-col gap-6">
        <div className="text-center pt-4">
          <div className="w-12 h-12 bg-[var(--jesuites-blue)] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Sparkles size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-[var(--jesuites-blue)] uppercase tracking-tight">
            {slide === 0 ? "Afinament del Decàleg" : "Reflexió Final"}
          </h1>
        </div>

        {slide === 0 ? (
          <div className="flex flex-col gap-4">
            {decaleg && (
              <div className="bg-white rounded-3xl p-5 border border-black/5 shadow-sm max-h-[40vh] overflow-auto">
                <p className="text-[10px] font-bold text-[var(--jesuites-blue)]/40 uppercase tracking-widest mb-3">Decàleg actual</p>
                <div className="space-y-3">
                  {decaleg.orientations?.map((o: any) => (
                    <div key={o.n} className="flex gap-3">
                      <span className="shrink-0 w-5 h-5 rounded bg-[var(--jesuites-blue)]/10 text-[var(--jesuites-blue)] text-[10px] font-bold flex items-center justify-center">{o.n}</span>
                      <p className="text-xs text-gray-700 leading-snug">
                        <span className="font-bold">{o.title}: </span>{o.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="bg-white rounded-3xl p-6 border border-black/5 shadow-md">
              <p className="text-sm font-bold text-[var(--jesuites-blue)] mb-2">Com podríem afinar aquest decàleg?</p>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">Deixa un comentari per matisar, ampliar o qüestionar algun punt. El facilitador ho rebrà en temps real.</p>
              
              {refinementSent ? (
                <div className="py-4 text-center">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-emerald-600 font-bold">✓</span>
                  </div>
                  <p className="text-xs font-bold text-emerald-700">Aportació enviada!</p>
                  <button onClick={() => setRefinementSent(false)} className="mt-4 text-[10px] font-bold text-[var(--jesuites-blue)] uppercase tracking-widest">Enviar-ne una altra</button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <textarea
                    value={refinementText}
                    onChange={(e) => setRefinementText(e.target.value)}
                    placeholder="Escriu la teva aportació..."
                    className="w-full h-24 p-4 rounded-2xl bg-gray-50 border-none text-sm resize-none focus:ring-2 focus:ring-[var(--jesuites-blue)]/20"
                  />
                  <button
                    onClick={sendRefinement}
                    disabled={!refinementText.trim()}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[var(--jesuites-blue)] text-white text-xs font-bold uppercase tracking-widest disabled:opacity-30"
                  >
                    <Send size={14} /> Enviar aportació
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <p className="text-center text-gray-500 px-4 text-sm">Com et sents davant de com hauríem de procedir amb els homòlegs i el professorat?</p>
            {voted ? (
              <div className="bg-white rounded-3xl p-8 border border-black/5 shadow-sm text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-emerald-600 font-bold text-xl">✓</span>
                </div>
                <p className="text-[var(--jesuites-blue)] font-bold mb-1">El teu vot s'ha registrat</p>
                <p className="text-sm text-gray-500">Mira els resultats a la pantalla principal.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => castVote("worry")}
                  className="bg-white hover:bg-orange-50 active:scale-95 transition-all p-6 rounded-3xl border border-black/[0.04] shadow-sm flex flex-col items-center gap-3"
                >
                  <AlertCircle size={32} className="text-orange-500" />
                  <span className="text-xs font-bold text-[var(--jesuites-blue)] uppercase tracking-wider">M'inquieta</span>
                </button>
                <button
                  onClick={() => castVote("doubt")}
                  className="bg-white hover:bg-blue-50 active:scale-95 transition-all p-6 rounded-3xl border border-black/[0.04] shadow-sm flex flex-col items-center gap-3"
                >
                  <HelpCircle size={32} className="text-blue-500" />
                  <span className="text-xs font-bold text-[var(--jesuites-blue)] uppercase tracking-wider">Dubtes</span>
                </button>
                <button
                  onClick={() => castVote("agree")}
                  className="bg-white hover:bg-emerald-50 active:scale-95 transition-all p-6 rounded-3xl border border-black/[0.04] shadow-sm flex flex-col items-center gap-3"
                >
                  <Heart size={32} className="text-emerald-500" />
                  <span className="text-xs font-bold text-[var(--jesuites-blue)] uppercase tracking-wider">Confort</span>
                </button>
                <button
                  onClick={() => castVote("inspired")}
                  className="bg-white hover:bg-violet-50 active:scale-95 transition-all p-6 rounded-3xl border border-black/[0.04] shadow-sm flex flex-col items-center gap-3"
                >
                  <Lightbulb size={32} className="text-violet-500" />
                  <span className="text-xs font-bold text-[var(--jesuites-blue)] uppercase tracking-wider">M'inspira</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
