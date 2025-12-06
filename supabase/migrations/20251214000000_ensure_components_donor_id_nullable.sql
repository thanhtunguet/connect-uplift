-- Ensure components.donor_id can be NULL
-- This migration explicitly ensures that donor_id is nullable
-- to support components that need support (needs_support status)
-- without requiring a donor at creation time

-- Remove NOT NULL constraint if it exists (it shouldn't, but we'll be safe)
DO $$
BEGIN
  -- Check if donor_id has NOT NULL constraint
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'components'
      AND column_name = 'donor_id'
      AND is_nullable = 'NO'
  ) THEN
    -- Remove NOT NULL constraint if it exists
    ALTER TABLE public.components
    ALTER COLUMN donor_id DROP NOT NULL;
    
    RAISE NOTICE 'Removed NOT NULL constraint from components.donor_id';
  ELSE
    RAISE NOTICE 'components.donor_id is already nullable';
  END IF;
END $$;

-- Add comment to document the nullable nature
COMMENT ON COLUMN public.components.donor_id IS 
  'ID of the donor who provided this component. NULL for components that need support (needs_support status). Can be set later when component status changes to supported.';
