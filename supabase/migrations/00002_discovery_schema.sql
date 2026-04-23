-- Migration: Creator Discovery Schema
CREATE TABLE public.creators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL,
  channel TEXT,
  account_url TEXT,
  country TEXT,
  city TEXT,
  fullname TEXT,
  gender TEXT,
  followers INTEGER,
  er NUMERIC(5, 2),
  age_13_17 NUMERIC(5, 2),
  age_18_24 NUMERIC(5, 2),
  age_25_34 NUMERIC(5, 2),
  age_35_44 NUMERIC(5, 2),
  male_pct NUMERIC(5, 2),
  female_pct NUMERIC(5, 2),
  top_countries JSONB DEFAULT '[]',
  top_cities JSONB DEFAULT '[]',
  top_interests JSONB DEFAULT '[]',
  follower_credibility NUMERIC(5, 2),
  notable_followers NUMERIC(5, 2),
  avg_likes INTEGER,
  avg_comments INTEGER,
  avg_reels_plays INTEGER,
  total_posts INTEGER,
  bio TEXT,
  email TEXT,
  instagram TEXT,
  youtube TEXT,
  tiktok TEXT,
  twitch TEXT,
  twitter TEXT,
  facebook TEXT,
  threads TEXT,
  snapchat TEXT,
  linktree TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(username, channel)
);

-- Lists Schema
CREATE TABLE public.lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- List Members (Many to Many)
CREATE TABLE public.list_members (
  list_id UUID REFERENCES public.lists(id) ON DELETE CASCADE NOT NULL,
  creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE NOT NULL,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY(list_id, creator_id)
);

-- Favorite Creators ("Heart React")
CREATE TABLE public.favorite_creators (
  brand_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE NOT NULL,
  favorited_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY(brand_id, creator_id)
);

-- RLS Configuration
ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_creators ENABLE ROW LEVEL SECURITY;

-- 1. All authenticated users can view creators natively
CREATE POLICY "Anyone authenticated can view creators"
  ON public.creators FOR SELECT USING (auth.role() = 'authenticated');

-- 2. Lists: Brands can only view/create/edit their own lists
CREATE POLICY "Brands manage own lists"
  ON public.lists FOR ALL USING (brand_id = auth.uid());

-- 3. List Members: Brands manage creators inside their own lists
CREATE POLICY "Brands manage own list members"
  ON public.list_members FOR ALL 
  USING (
    list_id IN (SELECT id FROM public.lists WHERE brand_id = auth.uid())
  );

-- 4. Favorites: Brands manage own favorites
CREATE POLICY "Brands manage own favorites"
  ON public.favorite_creators FOR ALL USING (brand_id = auth.uid());
