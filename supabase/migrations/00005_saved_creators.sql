-- Migration: Saved Creators table for the Discover page heart-save feature.
-- This stores creator usernames (from the local static dataset) against authenticated users
-- so saves persist across sessions and hard refreshes.

CREATE TABLE IF NOT EXISTS public.saved_creators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  creator_username TEXT NOT NULL,
  creator_name TEXT,
  platform TEXT,
  followers INTEGER DEFAULT 0,
  engagement_rate NUMERIC(5,2) DEFAULT 0,
  categories JSONB DEFAULT '[]',
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, creator_username)
);

-- Enable RLS
ALTER TABLE public.saved_creators ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own saved creators
CREATE POLICY "Users manage own saved creators"
  ON public.saved_creators FOR ALL USING (user_id = auth.uid());
