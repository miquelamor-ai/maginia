"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Sparkles, HelpCircle, Heart, Lightbulb, AlertCircle } from "lucide-react";

export default function TancamentPage() {
  const [guidedSessionId, setGuidedSessionId] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [voted, setVoted] = useState<string | null>(null);

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
        .select("phase, is_active")
        .eq("id", 1)
        .single();
      
      if (!data || !data.is_active) return;
      if (data.phase !== "tancament") {
        window.location.href = "/mapa/sessio" + (guidedSessionId ? "?g=" + guidedSessionId : "");
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
    }).select(); // If this fails it might be because participant_id isn't required. We just insert.
  };

  return (
    <main className="min-h-screen bg-[var(--jesuites-cream)] font-sans flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-[var(--jesuites-blue)] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Sparkles size={32} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--jesuites-blue)] uppercase tracking-tight mb-2">Reflexió Final</h1>
        <p className="text-gray-500 mb-8 px-4 text-sm">Com et sents davant de com hauríem de procedir amb els homòlegs i el professorat?</p>

        {voted ? (
          <div className="bg-white rounded-3xl p-8 border border-black/5 shadow-sm">
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
    </main>
  );
}
