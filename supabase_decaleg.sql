-- ═══════════════════════════════════════════════════════════════════════
-- MIGRACIÓ: DECÀLEG + TANCAMENT
-- Executa al SQL Editor de Supabase
-- ═══════════════════════════════════════════════════════════════════════

-- ─── Taula: Aportacions dels participants al decàleg ─────────────────
CREATE TABLE IF NOT EXISTS public.mapa_decaleg_submissions (
  id                UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id        TEXT    NOT NULL UNIQUE,
  guided_session_id TEXT,
  principle_1       TEXT    NOT NULL,
  principle_2       TEXT    NOT NULL,
  principle_3       TEXT    NOT NULL,
  submitted_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.mapa_decaleg_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on mapa_decaleg_submissions"
  ON public.mapa_decaleg_submissions FOR ALL USING (true) WITH CHECK (true);

-- ─── Extensió: mapa_facilitador_state ────────────────────────────────
ALTER TABLE public.mapa_facilitador_state
  ADD COLUMN IF NOT EXISTS decaleg_json TEXT;

-- ─── Taula: Vots del tancament ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.mapa_tancament_votes (
  id                UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id        TEXT    NOT NULL,
  guided_session_id TEXT,
  vote_type         TEXT    NOT NULL,
  submitted_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, guided_session_id)
);

ALTER TABLE public.mapa_tancament_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on mapa_tancament_votes"
  ON public.mapa_tancament_votes FOR ALL USING (true) WITH CHECK (true);
