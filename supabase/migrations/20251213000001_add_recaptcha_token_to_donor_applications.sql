-- ============================================
-- ADD RECAPTCHA TOKEN COLUMN TO DONOR APPLICATIONS
-- ============================================
-- Add column to store reCAPTCHA token for spam protection
-- Token can be verified server-side using Google reCAPTCHA API

ALTER TABLE public.donor_applications
ADD COLUMN recaptcha_token TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.donor_applications.recaptcha_token IS 'Google reCAPTCHA v3 token for spam protection. Can be verified server-side using Google reCAPTCHA API.';
