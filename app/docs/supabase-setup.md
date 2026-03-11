# Supabase Security Setup

## Row Level Security (RLS)

Execute the following SQL in your Supabase SQL Editor:

```sql
-- Enable RLS on votes table
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous inserts" ON votes FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public reads" ON votes FOR SELECT TO anon USING (true);
CREATE POLICY "Allow session deletes" ON votes FOR DELETE TO anon USING (true);

-- Enable RLS on contributions table
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous inserts" ON contributions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public reads" ON contributions FOR SELECT TO anon USING (true);

-- Add session_id column if not present
ALTER TABLE votes ADD COLUMN IF NOT EXISTS session_id TEXT;
ALTER TABLE contributions ADD COLUMN IF NOT EXISTS session_id TEXT;

-- Add unique constraint for vote deduplication
ALTER TABLE votes ADD CONSTRAINT votes_session_item_unique UNIQUE (session_id, item_id);
```

## How it works

- Each browser generates a unique `session_id` via `crypto.randomUUID()` stored in `localStorage`
- Votes use `upsert` with conflict on `(session_id, item_id)` to prevent duplicates
- Users can change their vote (last one wins) or remove it by clicking the same option
