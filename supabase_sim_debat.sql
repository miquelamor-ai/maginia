-- ═══════════════════════════════════════════════════════════════════════
-- SIMULACIÓ DEBAT — Dades de prova pel mode "Debat" del Mapa
-- guided_session_id: test-debat-sim
--
-- Com usar-ho:
--   1. Executa aquest script al SQL Editor de Supabase
--   2. Obre el facilitador a: /mapa/facilitador?sim=test-debat-sim
--   3. Veuràs el Mapa a la fase "Mapa" amb 6 participants simulats
--   4. Clica "Debat" per veure els punts de conflicte
--
-- Com esborrar-ho quan acabis:
--   DELETE FROM mapa_declarations WHERE guided_session_id = 'test-debat-sim';
-- ═══════════════════════════════════════════════════════════════════════

-- Esborra dades de simulació prèvies (si n'hi ha)
DELETE FROM mapa_declarations WHERE guided_session_id = 'test-debat-sim';

-- ─── 6 participants amb perfils pedagògics diversos ──────────────────
-- sim-p1: Molt conservador/a — restricció màxima, delegació baixa
-- sim-p2: Conservador/a — primària molt limitada, secundària N1-N2
-- sim-p3: Moderat/a — progressió adequada a l'edat
-- sim-p4: Moderat/a-progressiu/va — N3-N4 per a secundària
-- sim-p5: Progressiu/va — accés ample, N4-N5 per a ESO+
-- sim-p6: Molt progressiu/va — N5 a partir d'ESO-3, accés total
--
-- Camps:
--   teacher_outside = docent usa IA fora de l'aula (preparació/correcció)
--   teacher_inside  = docent usa IA dins l'aula (projecció, exemples)
--   student_access  = alumnat té accés directe a eines d'IA
--   delegation_n0   = N0 Preservació és adequat per al curs
--   delegation_n1   = N1 Exploració és adequat per al curs
--   delegation_n2   = N2 Suport és adequat per al curs
--   delegation_n3   = N3 Cocreació és adequat per al curs  ← CONFLICTE primària
--   delegation_n4   = N4 Delegació és adequat per al curs  ← CONFLICTE general
--   delegation_n5   = N5 Agència és adequat per al curs    ← CONFLICTE ESO+
-- ─────────────────────────────────────────────────────────────────────

INSERT INTO mapa_declarations
  (session_id, course_id, guided_session_id,
   teacher_outside, teacher_inside, student_access, student_modality,
   delegation_n0, delegation_n1, delegation_n2, delegation_n3, delegation_n4, delegation_n5)
VALUES

-- ═══ INFANTIL (I3-I5) ════════════════════════════════════════════════
-- Debat: teacher_outside (2/6), student_access (4/6), delegation_n3 (3/6 → màxima divergència)
('sim-p1','I3-I5','test-debat-sim', false,true,false,null,  true,true,false,false,false,false),
('sim-p2','I3-I5','test-debat-sim', false,true,false,null,  true,true,true, false,false,false),
('sim-p3','I3-I5','test-debat-sim', false,true,true, 'presencial', true,true,true, false,false,false),
('sim-p4','I3-I5','test-debat-sim', false,true,true, 'presencial', true,true,true, true, false,false),
('sim-p5','I3-I5','test-debat-sim', true, true,true, 'presencial', true,true,true, true, false,false),
('sim-p6','I3-I5','test-debat-sim', true, true,true, 'presencial', true,true,true, true, false,false),

-- ═══ CICLE INICIAL (PRI-CI) ═══════════════════════════════════════════
-- Debat: teacher_outside (4/6), student_access (4/6), delegation_n3 (4/6), delegation_n0 (2/6)
('sim-p1','PRI-CI','test-debat-sim', false,true,false,null,  true,true,false,false,false,false),
('sim-p2','PRI-CI','test-debat-sim', false,true,false,null,  true,true,true, false,false,false),
('sim-p3','PRI-CI','test-debat-sim', true, true,true, 'presencial', false,true,true, true, false,false),
('sim-p4','PRI-CI','test-debat-sim', true, true,true, 'presencial', false,true,true, true, false,false),
('sim-p5','PRI-CI','test-debat-sim', true, true,true, 'presencial', false,true,true, true, true, false),
('sim-p6','PRI-CI','test-debat-sim', true, true,true, 'presencial', false,true,true, true, true, false),

-- ═══ CICLE MITJÀ (PRI-CM) ═════════════════════════════════════════════
-- Debat: delegation_n4 (3/6 → màxima divergència), student_access (4/6)
('sim-p1','PRI-CM','test-debat-sim', false,true,false,null,  true,true,true, false,false,false),
('sim-p2','PRI-CM','test-debat-sim', false,true,true, 'presencial', false,true,true, false,false,false),
('sim-p3','PRI-CM','test-debat-sim', true, true,true, 'presencial', false,true,true, true, false,false),
('sim-p4','PRI-CM','test-debat-sim', true, true,true, 'presencial', false,true,true, true, true, false),
('sim-p5','PRI-CM','test-debat-sim', true, true,true, 'presencial', false,true,true, true, true, false),
('sim-p6','PRI-CM','test-debat-sim', true, true,true, 'presencial', false,true,true, true, true, true),

-- ═══ CICLE SUPERIOR (PRI-CS) ══════════════════════════════════════════
-- Debat: delegation_n4 (3/6 → màxima divergència), delegation_n5 (2/6)
('sim-p1','PRI-CS','test-debat-sim', true, true,false,null,  false,true,true, false,false,false),
('sim-p2','PRI-CS','test-debat-sim', true, true,true, 'presencial', false,true,true, true, false,false),
('sim-p3','PRI-CS','test-debat-sim', true, true,true, 'presencial', false,true,true, true, false,false),
('sim-p4','PRI-CS','test-debat-sim', true, true,true, 'presencial', false,true,true, true, true, false),
('sim-p5','PRI-CS','test-debat-sim', true, true,true, 'presencial', false,true,true, true, true, true),
('sim-p6','PRI-CS','test-debat-sim', true, true,true, 'presencial', false,true,true, true, true, true),

-- ═══ 1r ESO ═══════════════════════════════════════════════════════════
-- Debat: delegation_n4 (4/6), delegation_n5 (2/6)
('sim-p1','ESO-1','test-debat-sim', true,true,true, 'presencial', false,true,true, true, false,false),
('sim-p2','ESO-1','test-debat-sim', true,true,true, 'presencial', false,true,true, true, false,false),
('sim-p3','ESO-1','test-debat-sim', true,true,true, 'presencial', false,true,true, true, true, false),
('sim-p4','ESO-1','test-debat-sim', true,true,true, 'presencial', false,true,true, true, true, false),
('sim-p5','ESO-1','test-debat-sim', true,true,true, 'presencial', false,true,true, true, true, true),
('sim-p6','ESO-1','test-debat-sim', true,true,true, 'presencial', false,true,true, true, true, true),

-- ═══ 2n ESO ═══════════════════════════════════════════════════════════
-- Debat: delegation_n4 (4/6), delegation_n5 (3/6 → màxima divergència)
('sim-p1','ESO-2','test-debat-sim', true,true,true, 'presencial', false,true,true, true, false,false),
('sim-p2','ESO-2','test-debat-sim', true,true,true, 'presencial', false,true,true, true, false,false),
('sim-p3','ESO-2','test-debat-sim', true,true,true, 'presencial', false,true,true, true, true, false),
('sim-p4','ESO-2','test-debat-sim', true,true,true, 'presencial', false,true,true, true, true, true),
('sim-p5','ESO-2','test-debat-sim', true,true,true, 'presencial', false,true,true, true, true, true),
('sim-p6','ESO-2','test-debat-sim', true,true,true, 'presencial', false,true,true, true, true, true),

-- ═══ 3r ESO ═══════════════════════════════════════════════════════════
-- Debat: delegation_n5 (4/6), delegation_n4 (5/6)
('sim-p1','ESO-3','test-debat-sim', true,true,true, 'presencial', false,true,true, true, false,false),
('sim-p2','ESO-3','test-debat-sim', true,true,true, 'presencial', false,true,true, true, true, false),
('sim-p3','ESO-3','test-debat-sim', true,true,true, 'presencial', false,true,true, true, true, true),
('sim-p4','ESO-3','test-debat-sim', true,true,true, 'presencial', false,true,true, true, true, true),
('sim-p5','ESO-3','test-debat-sim', true,true,true, 'hybrid',     false,true,true, true, true, true),
('sim-p6','ESO-3','test-debat-sim', true,true,true, 'hybrid',     false,true,true, true, true, true),

-- ═══ 4t ESO ═══════════════════════════════════════════════════════════
-- Debat: delegation_n5 (4/6 → divergència), student_modality variat
('sim-p1','ESO-4','test-debat-sim', true,true,true, 'presencial', false,true,true, true, true, false),
('sim-p2','ESO-4','test-debat-sim', true,true,true, 'presencial', false,true,true, true, true, false),
('sim-p3','ESO-4','test-debat-sim', true,true,true, 'presencial', false,true,true, true, true, true),
('sim-p4','ESO-4','test-debat-sim', true,true,true, 'hybrid',     false,true,true, true, true, true),
('sim-p5','ESO-4','test-debat-sim', true,true,true, 'hybrid',     false,true,true, true, true, true),
('sim-p6','ESO-4','test-debat-sim', true,true,true, 'hybrid',     false,true,true, true, true, true),

-- ═══ BATXILLERAT ══════════════════════════════════════════════════════
-- Debat: delegation_n5 (4/6), student_modality (presencial vs hybrid)
('sim-p1','BATX','test-debat-sim', true,true,true, 'presencial', false,true,true, true, true, false),
('sim-p2','BATX','test-debat-sim', true,true,true, 'presencial', false,true,true, true, true, false),
('sim-p3','BATX','test-debat-sim', true,true,true, 'presencial', false,true,true, true, true, true),
('sim-p4','BATX','test-debat-sim', true,true,true, 'hybrid',     false,true,true, true, true, true),
('sim-p5','BATX','test-debat-sim', true,true,true, 'hybrid',     false,true,true, true, true, true),
('sim-p6','BATX','test-debat-sim', true,true,true, 'online',     false,true,true, true, true, true),

-- ═══ FP GRAU MITJÀ ════════════════════════════════════════════════════
-- Consens alt — serveix de contrast amb cursos anteriors
('sim-p1','FP-CGM','test-debat-sim', true,true,true, 'presencial', false,true,true, true, true, true),
('sim-p2','FP-CGM','test-debat-sim', true,true,true, 'hybrid',     false,true,true, true, true, true),
('sim-p3','FP-CGM','test-debat-sim', true,true,true, 'hybrid',     false,true,true, true, true, true),
('sim-p4','FP-CGM','test-debat-sim', true,true,true, 'hybrid',     false,true,true, true, true, true),
('sim-p5','FP-CGM','test-debat-sim', true,true,true, 'hybrid',     false,true,true, true, true, true),
('sim-p6','FP-CGM','test-debat-sim', true,true,true, 'online',     false,true,true, true, true, true),

-- ═══ FP GRAU SUPERIOR ═════════════════════════════════════════════════
-- Consens alt — N5 Agència acceptada per tothom
('sim-p1','FP-CGS','test-debat-sim', true,true,true, 'presencial', false,true,true, true, true, true),
('sim-p2','FP-CGS','test-debat-sim', true,true,true, 'hybrid',     false,true,true, true, true, true),
('sim-p3','FP-CGS','test-debat-sim', true,true,true, 'hybrid',     false,true,true, true, true, true),
('sim-p4','FP-CGS','test-debat-sim', true,true,true, 'hybrid',     false,true,true, true, true, true),
('sim-p5','FP-CGS','test-debat-sim', true,true,true, 'online',     false,true,true, true, true, true),
('sim-p6','FP-CGS','test-debat-sim', true,true,true, 'online',     false,true,true, true, true, true);

-- ─── Verificació: hauria de retornar 66 files ────────────────────────
SELECT COUNT(*) AS files_inserides, COUNT(DISTINCT session_id) AS participants
FROM mapa_declarations
WHERE guided_session_id = 'test-debat-sim';

-- ═══════════════════════════════════════════════════════════════════════
-- Punts de debat esperats (divergència ≥ 0.35):
--
--  Infantil      · N3 Cocreació     → 50%  (div 1.00) ★ MÀXIM DEBAT
--  C. Inicial    · N3 Cocreació     → 67%  (div 0.66)
--  C. Inicial    · N4 Delegació     → 33%  (div 0.66)
--  C. Inicial    · N0 Preservació   → 33%  (div 0.66)
--  C. Mijà       · N4 Delegació     → 50%  (div 1.00) ★ MÀXIM DEBAT
--  C. Superior   · N4 Delegació     → 50%  (div 1.00) ★ MÀXIM DEBAT
--  2n ESO        · N5 Agència       → 50%  (div 1.00) ★ MÀXIM DEBAT
--  Infantil      · Accés alumnat    → 67%  (div 0.66)
--  C. Inicial    · Docent fora      → 67%  (div 0.66)
--  Infantil      · Docent fora      → 33%  (div 0.66)
--  i més...
-- ═══════════════════════════════════════════════════════════════════════
