-- ============================================
-- APP SETTINGS TABLE
-- ============================================
-- Table to store application-wide settings
CREATE TABLE public.app_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE POLICIES FOR APP SETTINGS
-- ============================================
-- Anyone can view settings (needed for public pages to check signup status)
CREATE POLICY "Anyone can view app settings"
ON public.app_settings FOR SELECT
USING (true);

-- Only authenticated users can update settings
CREATE POLICY "Authenticated users can update app settings"
ON public.app_settings FOR UPDATE
USING (auth.role() = 'authenticated');

-- Only authenticated users can insert settings
CREATE POLICY "Authenticated users can insert app settings"
ON public.app_settings FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- CREATE TRIGGER FOR TIMESTAMP UPDATES
-- ============================================
CREATE TRIGGER update_app_settings_updated_at
BEFORE UPDATE ON public.app_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- INSERT DEFAULT SETTINGS
-- ============================================
-- Insert default setting: allow_signups = true
INSERT INTO public.app_settings (key, value, description)
VALUES (
  'allow_signups',
  to_jsonb(true),
  'Cho phép người dùng đăng ký tài khoản mới'
)
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- BEFORE USER CREATED HOOK
-- ============================================
-- Function to check if signups are allowed before creating a user
-- This runs at the database level, preventing signups even if someone bypasses the frontend
CREATE OR REPLACE FUNCTION public.before_user_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  allow_signups_setting JSONB;
  signups_allowed BOOLEAN;
BEGIN
  -- Get the allow_signups setting
  SELECT value INTO allow_signups_setting
  FROM public.app_settings
  WHERE key = 'allow_signups'
  LIMIT 1;

  -- If setting doesn't exist, default to false (more secure)
  IF allow_signups_setting IS NULL THEN
    signups_allowed := false;
  ELSE
    -- Parse the JSONB value (could be boolean or string)
    IF jsonb_typeof(allow_signups_setting) = 'boolean' THEN
      signups_allowed := allow_signups_setting::boolean;
    ELSIF jsonb_typeof(allow_signups_setting) = 'string' THEN
      signups_allowed := allow_signups_setting::text = 'true';
    ELSE
      signups_allowed := false;
    END IF;
  END IF;

  -- Reject signup if not allowed
  IF NOT signups_allowed THEN
    RAISE EXCEPTION 'Đăng ký tài khoản mới hiện đang bị tắt. Vui lòng liên hệ quản trị viên.';
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger on auth.users to enforce signup restriction
-- This trigger runs BEFORE a user is inserted into auth.users
CREATE TRIGGER before_user_created_trigger
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.before_user_created();
