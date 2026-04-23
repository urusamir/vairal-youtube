-- Migration: Calendar Slots
CREATE TABLE IF NOT EXISTS public.calendar_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date TEXT NOT NULL,
  influencer_name TEXT NOT NULL,
  platform TEXT,
  content_type TEXT,
  status TEXT DEFAULT 'Pending',
  campaign TEXT,
  campaign_id UUID,
  notes TEXT,
  slot_type TEXT DEFAULT 'Scheduled Date',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.calendar_slots ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own calendar slots
CREATE POLICY "Users manage own calendar slots"
  ON public.calendar_slots FOR ALL USING (user_id = auth.uid());
