-- ============================================
-- ADD IMAGE_URL COLUMN TO LAPTOPS TABLE
-- ============================================
-- Add image_url column to store the URL of laptop images
-- Images will be stored in Supabase Storage bucket 'laptop-images'

ALTER TABLE public.laptops
ADD COLUMN image_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.laptops.image_url IS 'URL to the laptop image stored in Supabase Storage bucket laptop-images';
