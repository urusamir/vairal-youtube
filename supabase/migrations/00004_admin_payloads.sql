-- Migration: Phase 6 Global Admin Payloads
-- Extending campaigns table securely to map payment matrices for global operator dashboard.

ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'PENDING';

-- Apply constraint to lock status bounds
ALTER TABLE public.campaigns DROP CONSTRAINT IF EXISTS campaigns_payment_status_check;
ALTER TABLE public.campaigns ADD CONSTRAINT campaigns_payment_status_check CHECK (payment_status IN ('PENDING', 'PROCESSING', 'COMPLETED'));

-- Inject receipt attachment blob URLs implicitly attached to successful payment events
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS receipt_url TEXT;
