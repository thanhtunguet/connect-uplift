-- Add '5+' value to academic_year enum
-- Note: This will fail if the value already exists, which is expected behavior
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = '5+' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'academic_year')
    ) THEN
        ALTER TYPE academic_year ADD VALUE '5+';
    END IF;
END $$;
