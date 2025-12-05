-- Update policies to allow public registration (unauthenticated users can insert applications)

-- Drop existing policies for applications
DROP POLICY IF EXISTS "Authenticated users can insert donor applications" ON public.donor_applications;
DROP POLICY IF EXISTS "Authenticated users can insert student applications" ON public.student_applications;

-- Allow anyone to insert donor applications (public registration)
CREATE POLICY "Anyone can insert donor applications"
ON public.donor_applications FOR INSERT
WITH CHECK (true);

-- Allow anyone to insert student applications (public registration)
CREATE POLICY "Anyone can insert student applications"
ON public.student_applications FOR INSERT
WITH CHECK (true);

-- Keep SELECT and UPDATE restricted to authenticated users (admin only)
-- These policies remain unchanged from previous migration
