-- ═══════════════════════════════════════════════════════════════════════
-- MIGRACIÓ: 3 MAPES — Snapshot inicial + revisions post-debat
-- Executa al SQL Editor de Supabase
-- ═══════════════════════════════════════════════════════════════════════

-- ─── Taula 1: Snapshot del Mapa 1 (original, pre-valida) ─────────────
-- S'escriu UNA SOLA VEGADA per (session_id, course_id) quan el participant
-- fa un fix al valida. Mai s'actualitza (ON CONFLICT DO NOTHING).

CREATE TABLE IF NOT EXISTS public.mapa_declarations_initial (
  session_id        TEXT    NOT NULL,
  course_id         TEXT    NOT NULL,
  guided_session_id TEXT,
  teacher_outside   BOOLEAN NOT NULL DEFAULT false,
  teacher_inside    BOOLEAN NOT NULL DEFAULT false,
  student_access    BOOLEAN NOT NULL DEFAULT false,
  student_modality  TEXT,
  delegation_n0     BOOLEAN NOT NULL DEFAULT true,
  delegation_n1     BOOLEAN NOT NULL DEFAULT false,
  delegation_n2     BOOLEAN NOT NULL DEFAULT false,
  delegation_n3     BOOLEAN NOT NULL DEFAULT false,
  delegation_n4     BOOLEAN NOT NULL DEFAULT false,
  delegation_n5     BOOLEAN NOT NULL DEFAULT false,
  snapshotted_at    TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (session_id, course_id)
);

ALTER TABLE public.mapa_declarations_initial ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on mapa_declarations_initial"
  ON public.mapa_declarations_initial FOR ALL USING (true) WITH CHECK (true);


-- ─── Taula 2: Revisions post-debat (Mapa 3) ──────────────────────────
-- El participant pot revisar les seves declaracions durant la fase de debat.
-- S'escriu a aquesta taula; mapa_declarations queda inalterat (Mapa 2).

CREATE TABLE IF NOT EXISTS public.mapa_declarations_debate (
  session_id        TEXT    NOT NULL,
  course_id         TEXT    NOT NULL,
  guided_session_id TEXT,
  teacher_outside   BOOLEAN NOT NULL DEFAULT false,
  teacher_inside    BOOLEAN NOT NULL DEFAULT false,
  student_access    BOOLEAN NOT NULL DEFAULT false,
  student_modality  TEXT,
  delegation_n0     BOOLEAN NOT NULL DEFAULT true,
  delegation_n1     BOOLEAN NOT NULL DEFAULT false,
  delegation_n2     BOOLEAN NOT NULL DEFAULT false,
  delegation_n3     BOOLEAN NOT NULL DEFAULT false,
  delegation_n4     BOOLEAN NOT NULL DEFAULT false,
  delegation_n5     BOOLEAN NOT NULL DEFAULT false,
  revised_at        TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (session_id, course_id)
);

ALTER TABLE public.mapa_declarations_debate ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on mapa_declarations_debate"
  ON public.mapa_declarations_debate FOR ALL USING (true) WITH CHECK (true);


-- ─── Extensió: mapa_facilitador_state ────────────────────────────────
-- Afegim la columna que controla si la revisió de debat és oberta.

ALTER TABLE public.mapa_facilitador_state
  ADD COLUMN IF NOT EXISTS debate_revision_open BOOLEAN NOT NULL DEFAULT false;
