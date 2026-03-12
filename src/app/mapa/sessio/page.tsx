"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Sparkles, ChevronRight, Users, Wifi, WifiOff, CheckCircle2, Circle, AlertTriangle, BarChart3 } from "lucide-react";

// ─── Session ─────────────────────────────────────────────────────

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("maginia_mapa_session");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("maginia_mapa_session", id);
  }
  return id;
}

function getGuidedSessionId(): string {
  if (typeof window === "undefined") return "";
  // Check URL param first
  const params = new URLSearchParams(window.location.search);
  const gParam = params.get("g");
  if (gParam) {
    localStorage.setItem("maginia_guided_session_id", gParam);
    return gParam;
  }
  // Fallback to stored value
  return localStorage.getItem("maginia_guided_session_id") || "";
}

// ─── Types ───────────────────────────────────────────────────────

interface FacilitatorState {
  phase: string;
  current_idx: number;
  is_active: boolean;
  guided_session_id: string | null;
}

interface Progress {
  calibra: { done: number; total: 5; correct: number };
  mapa: { courses: number; total: 11 };
  valida: { done: number; total: 13; inconsistencies: number };
}

// ─── Component ───────────────────────────────────────────────────

export default function SessioPage() {
  const [sessionId, setSessionId] = useState("");
  const [guidedSessionId, setGuidedSessionId] = useState("");
  const [facilitator, setFacilitator] = useState<FacilitatorState | null>(null);
  const [progress, setProgress] = useState<Progress>({
    calibra: { done: 0, total: 5, correct: 0 },
    mapa: { courses: 0, total: 11 },
    valida: { done: 0, total: 13, inconsistencies: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sid = getSessionId();
    const gsid = getGuidedSessionId();
    setSessionId(sid);
    setGuidedSessionId(gsid);
    loadAll(sid);
  }, []);

  // Register presence & heartbeat
  const sendHeartbeat = useCallback(async () => {
    if (!sessionId || !guidedSessionId) return;
    await supabase.from("mapa_sessions").upsert({
      session_id: sessionId,
      guided_session_id: guidedSessionId,
      last_heartbeat: new Date().toISOString(),
    }, { onConflict: "session_id,guided_session_id" });
  }, [sessionId, guidedSessionId]);

  useEffect(() => {
    if (!sessionId || !guidedSessionId) return;
    sendHeartbeat(); // initial
    const interval = setInterval(sendHeartbeat, 10000); // every 10s
    return () => clearInterval(interval);
  }, [sessionId, guidedSessionId, sendHeartbeat]);

  // Poll facilitator state
  useEffect(() => {
    const poll = async () => {
      const { data } = await supabase
        .from("mapa_facilitador_state")
        .select("*")
        .eq("id", 1)
        .single();
      if (data) {
        setFacilitator(data as FacilitatorState);
      }
    };
    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [guidedSessionId]);

  // Auto-redirect when facilitator starts — only if guided_session_id matches
  useEffect(() => {
    if (!facilitator?.is_active) return;
    if (!guidedSessionId) return;
    if (facilitator.guided_session_id !== guidedSessionId) return; // stale session, ignore
    const p = facilitator.phase;
    const target = p === "decaleg" ? "/mapa/decaleg"
      : p === "calibra" ? "/mapa/calibra"
      : p === "mapa" ? "/mapa"
      : p === "valida" ? "/mapa/valida"
      : null; // intro, repas, debate, tancament → stay on sessio (waiting screen)
    if (target) window.location.href = target;
  }, [facilitator, guidedSessionId]);

  const loadAll = async (sid: string) => {
    const [calibraRes, mapaRes, validaRes] = await Promise.all([
      supabase.from("mapa_calibra").select("scenario_id, is_correct").eq("session_id", sid),
      supabase.from("mapa_declarations").select("course_id").eq("session_id", sid),
      supabase.from("mapa_valida").select("scenario_id, approved, implied_level, tag").eq("session_id", sid),
    ]);

    const calibraData = calibraRes.data || [];
    const mapaData = mapaRes.data || [];
    const validaData = validaRes.data || [];

    setProgress({
      calibra: {
        done: calibraData.length,
        total: 5,
        correct: calibraData.filter((r: { is_correct: boolean }) => r.is_correct).length,
      },
      mapa: {
        courses: mapaData.length,
        total: 11,
      },
      valida: {
        done: validaData.length,
        total: 13,
        inconsistencies: 0, // calculated client-side in valida page
      },
    });
    setLoading(false);
  };

  const isGuided = facilitator?.is_active === true;

  // ─── Render ────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-[var(--jesuites-cream)] font-sans select-none">
      <div className="max-w-lg mx-auto px-4 py-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[var(--jesuites-blue)] rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
            <Sparkles size={32} />
          </div>
          <h1 className="text-2xl font-bold text-[var(--jesuites-blue)] uppercase tracking-tighter">MAGINIA</h1>
          <p className="text-sm text-gray-400 font-bold mt-1">Mapa de Delegació de la IA</p>
        </div>

        {/* Mode indicator */}
        <div className={`rounded-2xl p-4 mb-6 flex items-center gap-3 ${
          isGuided
            ? "bg-emerald-50 border border-emerald-200"
            : "bg-white border border-black/[0.06]"
        }`}>
          {isGuided ? (
            <>
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shrink-0">
                <Wifi size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-700">Sessió guiada activa</p>
                <p className="text-xs text-emerald-600">El facilitador guia la sessió. Segueix les instruccions de la pantalla.</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                <WifiOff size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-700">Mode individual</p>
                <p className="text-xs text-gray-500">Avança al teu ritme per les 3 fases.</p>
              </div>
            </>
          )}
        </div>

        {/* Guided mode: waiting */}
        {isGuided && (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-full border-4 border-emerald-200 border-t-emerald-500 animate-spin mx-auto mb-4" />
            <p className="text-sm font-bold text-gray-600">Connectant amb la sessió...</p>
            <p className="text-xs text-gray-400 mt-1">Seràs redirigit automàticament</p>
          </div>
        )}

        {/* Individual mode: 3 phases + dashboard */}
        {!isGuided && !loading && (
          <>
            {/* Phase cards */}
            <div className="space-y-3 mb-8">

              {/* Phase 1: Calibra */}
              <PhaseCard
                number={1}
                title="Calibra"
                subtitle="Alinea criteris de delegació"
                href="/mapa/calibra"
                status={progress.calibra.done === 0 ? "pending" : progress.calibra.done >= 5 ? "done" : "in-progress"}
                detail={
                  progress.calibra.done === 0
                    ? "5 escenaris per classificar"
                    : `${progress.calibra.correct}/${progress.calibra.total} correctes`
                }
                color="bg-[var(--jesuites-blue)]"
              />

              {/* Phase 2: Mapa */}
              <PhaseCard
                number={2}
                title="Mapa"
                subtitle="Declara l'ús de la IA per curs"
                href="/mapa"
                status={progress.mapa.courses === 0 ? "pending" : progress.mapa.courses >= 6 ? "done" : "in-progress"}
                detail={
                  progress.mapa.courses === 0
                    ? "11 cursos per configurar"
                    : `${progress.mapa.courses} cursos declarats`
                }
                color="bg-violet-500"
              />

              {/* Phase 3: Valida */}
              <PhaseCard
                number={3}
                title="Valida"
                subtitle="Stress test del teu mapa"
                href="/mapa/valida"
                status={progress.valida.done === 0 ? "pending" : progress.valida.done >= 13 ? "done" : "in-progress"}
                detail={
                  progress.valida.done === 0
                    ? "13 escenaris de validació"
                    : `${progress.valida.done}/${progress.valida.total} respostos`
                }
                color="bg-amber-500"
              />
            </div>

            {/* Results summary (only if some progress) */}
            {(progress.calibra.done > 0 || progress.mapa.courses > 0 || progress.valida.done > 0) && (
              <div className="bg-white rounded-3xl p-6 border border-black/[0.04] shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 size={16} className="text-gray-400" />
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">El teu progrés</h3>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {/* Calibra result */}
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${progress.calibra.done >= 5 ? "text-emerald-600" : "text-gray-300"}`}>
                      {progress.calibra.done >= 5 ? `${progress.calibra.correct}/5` : "—"}
                    </div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-1">Calibra</p>
                    {progress.calibra.done >= 5 && (
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {progress.calibra.correct >= 4 ? "Excel·lent" : progress.calibra.correct >= 3 ? "Bo" : "A millorar"}
                      </p>
                    )}
                  </div>

                  {/* Mapa result */}
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${progress.mapa.courses >= 6 ? "text-violet-600" : "text-gray-300"}`}>
                      {progress.mapa.courses > 0 ? progress.mapa.courses : "—"}
                    </div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-1">Cursos</p>
                    {progress.mapa.courses > 0 && (
                      <p className="text-[10px] text-gray-500 mt-0.5">declarats</p>
                    )}
                  </div>

                  {/* Valida result */}
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${progress.valida.done >= 13 ? "text-amber-600" : "text-gray-300"}`}>
                      {progress.valida.done >= 13 ? `${progress.valida.done}/13` : progress.valida.done > 0 ? `${progress.valida.done}/13` : "—"}
                    </div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-1">Valida</p>
                    {progress.valida.done > 0 && (
                      <p className="text-[10px] text-gray-500 mt-0.5">respostos</p>
                    )}
                  </div>
                </div>

                {/* All done message */}
                {progress.calibra.done >= 5 && progress.mapa.courses >= 6 && progress.valida.done >= 13 && (
                  <div className="mt-4 bg-emerald-50 rounded-xl p-3 border border-emerald-200 text-center">
                    <CheckCircle2 size={20} className="text-emerald-500 mx-auto mb-1" />
                    <p className="text-xs font-bold text-emerald-700">Procés completat!</p>
                    <p className="text-[10px] text-emerald-600 mt-0.5">Pots tornar a qualsevol fase per refinar les teves respostes.</p>
                  </div>
                )}
              </div>
            )}

            {/* Aggregate results link */}
            <button
              onClick={() => window.location.href = "/mapa"}
              className="w-full mt-4 py-3 rounded-2xl bg-black/5 text-gray-400 text-[10px] font-bold uppercase tracking-widest hover:bg-black/10 transition-all flex items-center justify-center gap-2"
            >
              <Users size={12} /> Veure consens del grup
            </button>
          </>
        )}

        {/* Loading */}
        {!isGuided && loading && (
          <div className="text-center py-12">
            <div className="w-8 h-8 rounded-full border-3 border-gray-200 border-t-gray-500 animate-spin mx-auto mb-3" />
            <p className="text-xs text-gray-400">Carregant...</p>
          </div>
        )}
      </div>
    </main>
  );
}

// ─── Phase Card Component ──────────────────────────────────────

function PhaseCard({
  number, title, subtitle, href, status, detail, color,
}: {
  number: number;
  title: string;
  subtitle: string;
  href: string;
  status: "pending" | "in-progress" | "done";
  detail: string;
  color: string;
}) {
  return (
    <button
      onClick={() => window.location.href = href}
      className="w-full bg-white rounded-2xl p-4 border border-black/[0.04] shadow-sm hover:shadow-md transition-all flex items-center gap-4 text-left group"
    >
      {/* Number badge */}
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-lg shadow-md ${color}`}>
        {status === "done" ? <CheckCircle2 size={22} /> : number}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-[var(--jesuites-blue)] uppercase tracking-tight">{title}</h3>
          {status === "in-progress" && (
            <span className="text-[8px] font-bold bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full uppercase">En curs</span>
          )}
          {status === "done" && (
            <span className="text-[8px] font-bold bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full uppercase">Completat</span>
          )}
        </div>
        <p className="text-[10px] text-gray-400 font-medium">{subtitle}</p>
        <p className="text-[10px] text-gray-500 font-bold mt-0.5">{detail}</p>
      </div>

      {/* Arrow */}
      <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
    </button>
  );
}
