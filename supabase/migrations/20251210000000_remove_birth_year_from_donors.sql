-- Remove birth_year column from donors table
ALTER TABLE public.donors DROP COLUMN IF EXISTS birth_year;

-- Remove birth_year column from donor_applications table
ALTER TABLE public.donor_applications DROP COLUMN IF EXISTS birth_year;

-- Remove support_frequency column from donor_applications table
ALTER TABLE public.donor_applications DROP COLUMN IF EXISTS support_frequency;
