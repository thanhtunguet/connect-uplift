-- ============================================
-- ALLOW PUBLIC READ ACCESS TO AVAILABLE LAPTOPS
-- ============================================
-- This policy allows anyone (including unauthenticated users) to read
-- laptops that have status = 'available'. This is needed for the public
-- "Ngân hàng laptop" page.
-- 
-- Note: This policy only allows SELECT, and only for laptops with
-- status = 'available'. It does not expose donor_id or student_id,
-- which are sensitive personal information.
--
-- IMPORTANT: This policy must be created AFTER the authenticated policy
-- to ensure proper RLS evaluation. Supabase uses OR logic for multiple
-- policies, so this will work correctly.

-- Drop existing policy if it exists (for re-running migration)
DROP POLICY IF EXISTS "Anyone can view available laptops" ON public.laptops;

CREATE POLICY "Anyone can view available laptops"
ON public.laptops FOR SELECT
USING (status = 'available');
