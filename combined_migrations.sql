-- Create custom types
CREATE TYPE campaign_status AS ENUM ('draft', 'active', 'completed', 'canceled');
CREATE TYPE user_role AS ENUM ('admin', 'brand');

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  brand_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_roles linking table for strict authorization (Admin vs Brand)
CREATE TABLE public.user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL DEFAULT 'brand',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create campaigns table
CREATE TABLE public.campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  budget NUMERIC(10, 2) DEFAULT 0.00,
  status campaign_status DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- Trigger to automatically create profile and user_roles upon signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  
  -- Insert into user_roles as 'brand' natively
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'brand');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read and update their own profile
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- User_Roles: STRICT security. 
-- Users can only read their own role. 
-- ONLY Service Role (backend operations) can INSERT/UPDATE/DELETE.
CREATE POLICY "Users can view own role" 
  ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- PostgreSQL function to globally check admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Campaigns RLS
-- Brand users can view/manage their own campaigns.
-- Admins can view/manage ALL campaigns.
CREATE POLICY "Brands access own campaigns or Admins access all" 
  ON public.campaigns FOR ALL 
  USING (brand_id = auth.uid() OR public.is_admin());
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
-- Migration: Campaign Lifecycle Expansion
-- Upgrading the campaigns table to natively support the deep hierarchical wizard variables.

ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS target_platforms JSONB DEFAULT '[]';
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS target_countries JSONB DEFAULT '[]';
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS target_age_brackets JSONB DEFAULT '[]';

-- Step 2 Arrays
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS briefs JSONB DEFAULT '[]';

-- Step 3 Arrays
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS selected_creators JSONB DEFAULT '[]';
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS deliverables JSONB DEFAULT '[]';

-- Wizard Tracking State
-- Re-using existing campaign_status enum column for status
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS last_step INTEGER DEFAULT 1;

-- Add checking constraint to ensure logical status bounds
-- Removed conflicting status CHECK constraint against enum
-- Migration: Phase 6 Global Admin Payloads
-- Extending campaigns table securely to map payment matrices for global operator dashboard.

ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'PENDING';

-- Apply constraint to lock status bounds
ALTER TABLE public.campaigns DROP CONSTRAINT IF EXISTS campaigns_payment_status_check;
ALTER TABLE public.campaigns ADD CONSTRAINT campaigns_payment_status_check CHECK (payment_status IN ('PENDING', 'PROCESSING', 'COMPLETED'));

-- Inject receipt attachment blob URLs implicitly attached to successful payment events
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS receipt_url TEXT;
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
