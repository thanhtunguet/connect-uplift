-- ============================================
-- ADD RECAPTCHA SETTINGS TO APP SETTINGS
-- ============================================
-- Insert reCAPTCHA settings (can be updated via admin panel)
-- 
-- For Legacy Method (third-party services):
-- UPDATE app_settings SET value = '"YOUR_LEGACY_SECRET_KEY"'::jsonb WHERE key = 'recaptcha_secret_key';
--
-- For Enterprise API Method (recommended):
-- UPDATE app_settings SET value = '"YOUR_PROJECT_ID"'::jsonb WHERE key = 'recaptcha_project_id';
-- UPDATE app_settings SET value = '"YOUR_API_KEY"'::jsonb WHERE key = 'recaptcha_api_key';
-- UPDATE app_settings SET value = '"YOUR_SITE_KEY"'::jsonb WHERE key = 'recaptcha_site_key';

-- Legacy Secret Key (for third-party services)
INSERT INTO public.app_settings (key, value, description)
VALUES (
  'recaptcha_secret_key',
  to_jsonb(''::text),
  'Google reCAPTCHA Legacy Secret Key (for third-party services). Get from Google Cloud Console > reCAPTCHA > Key Details > Integration > Use Legacy Key'
)
ON CONFLICT (key) DO NOTHING;

-- Enterprise API Settings (recommended)
INSERT INTO public.app_settings (key, value, description)
VALUES 
  (
    'recaptcha_project_id',
    to_jsonb(''::text),
    'Google Cloud Project ID for reCAPTCHA Enterprise API. Get from Google Cloud Console'
  ),
  (
    'recaptcha_api_key',
    to_jsonb(''::text),
    'Google Cloud API Key for reCAPTCHA Enterprise API. Get from Google Cloud Console > APIs & Services > Credentials'
  ),
  (
    'recaptcha_site_key',
    to_jsonb(''::text),
    'reCAPTCHA Site Key (same as frontend VITE_RECAPTCHA_SITE_KEY). Get from Google Cloud Console > reCAPTCHA'
  )
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- FUNCTION TO VALIDATE RECAPTCHA TOKEN FORMAT
-- ============================================
-- Function to validate reCAPTCHA token format (basic validation)
-- Note: Actual verification with Google API should be done via Supabase Edge Function
-- or scheduled job. This function only validates that token exists and has valid format.
CREATE OR REPLACE FUNCTION public.validate_recaptcha_token_format(token TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if token is null or empty
  IF token IS NULL OR token = '' THEN
    RETURN false;
  END IF;

  -- Basic format validation: reCAPTCHA tokens are typically long alphanumeric strings
  -- Minimum length check (reCAPTCHA v3 tokens are usually 1000+ characters)
  IF length(token) < 100 THEN
    RETURN false;
  END IF;

  -- Token should contain alphanumeric characters, hyphens, underscores, and dots
  -- This is a basic format check
  IF token !~ '^[A-Za-z0-9._-]+$'::text THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$;

-- ============================================
-- FUNCTION TO VALIDATE RECAPTCHA ON INSERT
-- ============================================
-- Function to validate reCAPTCHA token before inserting donor application
-- This performs basic format validation. For full verification, use Supabase Edge Function.
CREATE OR REPLACE FUNCTION public.validate_donor_application_recaptcha()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  secret_key_exists BOOLEAN;
  verification_enabled BOOLEAN;
BEGIN
  -- Check if secret key exists and is not empty
  -- We check if the value exists and is not an empty string in JSONB
  SELECT EXISTS (
    SELECT 1 
    FROM public.app_settings 
    WHERE key = 'recaptcha_secret_key'
      AND value IS NOT NULL
      AND value != '""'::jsonb
      AND value != to_jsonb(''::text)
  ) INTO secret_key_exists;

  verification_enabled := secret_key_exists;

  -- If verification is enabled, require token
  IF verification_enabled THEN
    -- If recaptcha_token is not provided, reject
    IF NEW.recaptcha_token IS NULL OR NEW.recaptcha_token = '' THEN
      RAISE EXCEPTION 'reCAPTCHA token is required';
    END IF;

    -- Validate token format
    IF NOT public.validate_recaptcha_token_format(NEW.recaptcha_token) THEN
      RAISE EXCEPTION 'Invalid reCAPTCHA token format';
    END IF;

    -- Note: Full verification with Google API should be done via:
    -- 1. Supabase Edge Function (recommended)
    -- 2. Scheduled job that verifies tokens periodically
    -- 3. Application-level verification before inserting
  END IF;

  -- If verification is not enabled, allow submission (for development)
  RETURN NEW;
END;
$$;

-- ============================================
-- CREATE TRIGGER FOR RECAPTCHA VALIDATION
-- ============================================
-- Trigger to validate reCAPTCHA token before inserting donor application
CREATE TRIGGER validate_donor_application_recaptcha_trigger
  BEFORE INSERT ON public.donor_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_donor_application_recaptcha();

-- ============================================
-- ADD COMMENTS FOR DOCUMENTATION
-- ============================================
COMMENT ON FUNCTION public.validate_recaptcha_token_format IS 'Validates reCAPTCHA token format. For full verification with Google API, use Supabase Edge Function.';
COMMENT ON FUNCTION public.validate_donor_application_recaptcha IS 'Trigger function to validate reCAPTCHA token format before inserting donor application. Full verification should be done via Edge Function.';
COMMENT ON COLUMN public.app_settings.value IS 'For recaptcha_secret_key, store the secret key as a JSON string, e.g., "YOUR_SECRET_KEY"';

-- ============================================
-- NOTE: FULL RECAPTCHA VERIFICATION
-- ============================================
-- This migration only performs basic format validation.
-- For full verification with Google reCAPTCHA API, you should:
--
-- Option 1: Use Supabase Edge Function (Recommended)
-- Create an Edge Function that:
-- 1. Receives the token from frontend
-- 2. Calls Google reCAPTCHA API with secret key
-- 3. Verifies the response
-- 4. Only then allows the database insert
--
-- Option 2: Application-level verification
-- Verify token in your application code before calling Supabase insert
--
-- Option 3: Scheduled job
-- Create a scheduled job that verifies unverified tokens periodically
