"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Sparkles, Send, CheckCircle2 } from "lucide-react";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("maginia_mapa_session");
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("maginia_mapa_session", id); }
  return id;
}
function getGuidedSessionId(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("maginia_guided_session_id") || "";
}

export default function DecalegPage() {
  const router = useRouter();
  const [sessionId] = useState(getSessionId);
  const [guidedSessionId] = useState(getGuidedSessionId);
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [p3, setP3] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  // Check if already submitted
  useEffect(() => {
    if (!sessionId) return;
    supabase.from("mapa_decaleg_submissions")
      .select("id").eq("session_id", sessionId).maybeSingle()
      .then(({ data }) => { if (data) setSubmitted(true); });
  }, [sessionId]);

  // Listen for facilitator phase change and redirect
  useEffect(() => {
    const channel = supabase
      .channel("decaleg-phase-watch")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "mapa_facilitador_state" }, (payload) => {
        const newPhase = payload.new?.phase;
        const isActive = payload.new?.is_active;
        const newGsId = payload.new?.guided_session_id;
        // Only redirect if the session is still active, it's our session, and phase changed away from decaleg
        if (isActive && newGsId === guidedSessionId && newPhase && newPhase !== "decaleg") {
          router.push("/mapa/sessio" + (guidedSessionId ? `?g=${guidedSessionId}` : ""));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [guidedSessionId, router]);

  const handleSubmit = async () => {
    if (!p1.trim() || !p2.trim() || !p3.trim()) return;
    setSaving(true);
    await supabase.from("mapa_decaleg_submissions").upsert({
      session_id: sessionId,
      guided_session_id: guidedSessionId || null,
      principle_1: p1.trim(),
      principle_2: p2.trim(),
      principle_3: p3.trim(),
    }, { onConflict: "session_id" });
    setSubmitted(true);
    setSaving(false);
  };

  return (
    <main className="min-h-screen bg-[var(--jesuites-cream)] font-sans">
      <div className="max-w-lg mx-auto px-4 py-10">

        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[var(--jesuites-blue)] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Sparkles size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--jesuites-blue)] uppercase tracking-tight">MAGINIA</h1>
          <p className="text-sm text-gray-400 font-bold mt-1">Decàleg col·lectiu</p>
        </div>

        {submitted ? (
          <div className="bg-white rounded-3xl border border-black/[0.06] p-8 text-center shadow-sm">
            <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[var(--jesuites-blue)] mb-2">Aportació enviada</h2>
            <p className="text-gray-500 text-sm">Gràcies! El facilitador recollirà totes les aportacions i generarà el decàleg col·lectiu.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-black/[0.06] p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[var(--jesuites-blue)] mb-1">Els teus 3 principis</h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Quin consell o orientació donaríes a docents i alumnat sobre l&apos;ús de la IA? Escriu-ne tres, amb les teves pròpies paraules.
            </p>
            {[
              { label: "Primer principi", val: p1, set: setP1, ph: "Ex: La IA ha d'ajudar a aprendre, no a evitar l'esforç" },
              { label: "Segon principi", val: p2, set: setP2, ph: "Ex: Sempre hem de verificar el que genera la IA" },
              { label: "Tercer principi", val: p3, set: setP3, ph: "Ex: Cal declarar quan hem usat la IA en un treball" },
            ].map((f, i) => (
              <div key={i} className="mb-4">
                <label className="block text-xs font-bold text-[var(--jesuites-blue)] uppercase tracking-wider mb-1.5">{f.label}</label>
                <textarea
                  value={f.val}
                  onChange={e => f.set(e.target.value)}
                  placeholder={f.ph}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-black/[0.1] bg-[var(--jesuites-cream)] text-[var(--jesuites-text)] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--jesuites-blue)]/30 placeholder:text-gray-400"
                />
              </div>
            ))}
            <button
              onClick={handleSubmit}
              disabled={!p1.trim() || !p2.trim() || !p3.trim() || saving}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[var(--jesuites-blue)] text-white text-sm font-bold uppercase tracking-wider disabled:opacity-40 transition-all hover:brightness-110"
            >
              <Send size={16} /> {saving ? "Enviant..." : "Enviar els meus principis"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
