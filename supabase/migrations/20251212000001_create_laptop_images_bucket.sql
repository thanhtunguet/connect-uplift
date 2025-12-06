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
-- 5. Click "Create bucket"
--
-- Option 2: Via Supabase CLI (if using local development)
-- Run: supabase storage create laptop-images --public
--
-- After creating the bucket, run this migration to set up policies.

-- Policy: Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload laptop images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'laptop-images' AND
  (storage.foldername(name))[1] = 'laptops'
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
