-- Taula per guardar les votacions i el sentiment del grup
CREATE TABLE IF NOT EXISTS public.votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    section_id TEXT NOT NULL, -- Identificador de la secció (ex: 'valors', 'tensions')
    item_id TEXT NOT NULL,    -- Identificador de l'element (ex: 'antropocentrisme')
    vote_type TEXT NOT NULL,  -- 'agree', 'worry', 'doubt', 'inspired'
    session_id TEXT           -- Per si vols separar sessions de taller
);

-- Taula per guardar les "Mirades Noves" (aportacions de text)
CREATE TABLE IF NOT EXISTS public.contributions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    section_id TEXT NOT NULL,
    content TEXT NOT NULL,
    author_name TEXT,
    is_revision BOOLEAN DEFAULT false -- Si és una esmena a un text existent
);

-- Habilitar Realtime per a les taules
ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contributions;
