-- ═══ Guided Sessions Support ═══

-- 1. Sessions presence table (heartbeat + guided session tracking)
CREATE TABLE IF NOT EXISTS public.mapa_sessions (
    session_id TEXT NOT NULL,
    guided_session_id TEXT,
    last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (session_id, guided_session_id)
);

-- 2. Add guided_session_id to facilitador state
ALTER TABLE public.mapa_facilitador_state
    ADD COLUMN IF NOT EXISTS guided_session_id TEXT;

-- 3. Add guided_session_id to calibra votes
ALTER TABLE public.mapa_calibra
    ADD COLUMN IF NOT EXISTS guided_session_id TEXT;

-- 4. Add guided_session_id to valida votes
ALTER TABLE public.mapa_valida
    ADD COLUMN IF NOT EXISTS guided_session_id TEXT;

-- 5. Add guided_session_id to mapa declarations
ALTER TABLE public.mapa_declarations
    ADD COLUMN IF NOT EXISTS guided_session_id TEXT;

-- 6. Enable RLS policies for mapa_sessions (allow all for now)
ALTER TABLE public.mapa_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on mapa_sessions" ON public.mapa_sessions FOR ALL USING (true) WITH CHECK (true);

-- 7. Add decaleg_json to facilitador state (stores AI-generated decàleg for participants)
ALTER TABLE public.mapa_facilitador_state
    ADD COLUMN IF NOT EXISTS decaleg_json TEXT;
