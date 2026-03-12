-- ═══════════════════════════════════════════════════════════════════════
-- MIGRACIÓ: DECÀLEG REFINEMENTS — Aportacions lliures post-debat
-- Executa al SQL Editor de Supabase
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.mapa_decaleg_refinements (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guided_session_id TEXT    NOT NULL,
  participant_id    TEXT    NOT NULL,
  text              TEXT    NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.mapa_decaleg_refinements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on mapa_decaleg_refinements"
  ON public.mapa_decaleg_refinements FOR ALL USING (true) WITH CHECK (true);
