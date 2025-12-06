-- ============================================
-- CREATE STORAGE POLICIES FOR LAPTOP IMAGES
-- ============================================
-- IMPORTANT: You must create the storage bucket manually first!
--
-- Option 1: Via Supabase Dashboard
-- 1. Go to Storage in Supabase Dashboard
-- 2. Click "New bucket"
-- 3. Name: "laptop-images"
-- 4. Public bucket: Yes
-- 5. File size limit: 786432 bytes (768KB) - Set in bucket settings
-- 6. Allowed MIME types: image/webp
-- 7. Click "Create bucket"
--
-- Option 2: Via Supabase CLI (if using local development)
-- Run: supabase storage create laptop-images --public --file-size-limit 786432
--
-- After creating the bucket, run this migration to set up policies.
--
-- NOTE: Images are automatically processed on the frontend:
-- - Resized to 720p (1280x720) max
-- - Converted to WebP format
-- - Compressed to max 768KB

-- Drop existing policies if they exist (for re-running migration)
DROP POLICY IF EXISTS "Authenticated users can upload laptop images" ON storage.objects;
DROP POLICY IF EXISTS "Public can upload donor application images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update laptop images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete laptop images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view laptop images" ON storage.objects;

-- Policy: Allow authenticated users to upload images
-- Note: Files are automatically converted to WebP and resized to max 768KB
-- Allow uploads to both 'laptops' folder (admin) and 'donor-applications' folder (public registration)
CREATE POLICY "Authenticated users can upload laptop images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'laptop-images' AND
  ((storage.foldername(name))[1] = 'laptops' OR (storage.foldername(name))[1] = 'donor-applications') AND
  (storage.extension(name) = 'webp')
);

-- Policy: Allow public (unauthenticated) users to upload images for donor applications
-- This is needed for the public registration form
CREATE POLICY "Public can upload donor application images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'laptop-images' AND
  (storage.foldername(name))[1] = 'donor-applications' AND
  (storage.extension(name) = 'webp')
);

-- Policy: Allow authenticated users to update their uploaded images
CREATE POLICY "Authenticated users can update laptop images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'laptop-images')
WITH CHECK (bucket_id = 'laptop-images');

-- Policy: Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete laptop images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'laptop-images');

-- Policy: Allow public read access to images
CREATE POLICY "Public can view laptop images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'laptop-images');
