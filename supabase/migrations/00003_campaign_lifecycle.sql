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
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'DRAFT';
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS last_step INTEGER DEFAULT 1;

-- Add checking constraint to ensure logical status bounds
ALTER TABLE public.campaigns DROP CONSTRAINT IF EXISTS campaigns_status_check;
ALTER TABLE public.campaigns ADD CONSTRAINT campaigns_status_check CHECK (status IN ('DRAFT', 'PUBLISHED'));
