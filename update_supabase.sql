CREATE TABLE IF NOT EXISTS public.saved_creators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  creator_username TEXT NOT NULL,
  creator_name TEXT,
  platform TEXT,
  followers INTEGER,
  engagement_rate NUMERIC(5, 2),
  categories JSONB DEFAULT '[]'::jsonb,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, creator_username)
);
