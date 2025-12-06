-- ============================================
-- ADD LAPTOP IMAGES COLUMN TO DONOR APPLICATIONS
-- ============================================
-- Add column to store array of laptop image URLs uploaded during registration
-- Images are stored in Supabase Storage and URLs are saved here

ALTER TABLE public.donor_applications
ADD COLUMN laptop_images JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.donor_applications.laptop_images IS 'Array of laptop image URLs (JSONB) uploaded during registration. Images are stored in Supabase Storage bucket laptop-images.';

-- Add index for better query performance if needed
CREATE INDEX IF NOT EXISTS idx_donor_applications_laptop_images 
ON public.donor_applications USING GIN (laptop_images);
