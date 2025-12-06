-- ============================================
-- ADD COMPONENT CODE (Số mã linh kiện)
-- ============================================
-- Thêm cột component_code để có mã số nguyên dễ đọc thay vì UUID
-- Mã số này sẽ tự động tăng và hiển thị công khai

-- Thêm cột component_code
ALTER TABLE public.components
ADD COLUMN IF NOT EXISTS component_code INTEGER;

-- Tạo sequence để tự động tăng mã số
CREATE SEQUENCE IF NOT EXISTS public.component_code_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Set default value cho component_code từ sequence
-- Sử dụng trigger để tự động gán mã số khi insert
CREATE OR REPLACE FUNCTION public.assign_component_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.component_code IS NULL THEN
        NEW.component_code := nextval('public.component_code_seq');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER assign_component_code_trigger
    BEFORE INSERT ON public.components
    FOR EACH ROW
    EXECUTE FUNCTION public.assign_component_code();

-- Cập nhật các component hiện có với mã số dựa trên thứ tự created_at
-- Nếu component_code là NULL, gán mã số theo thứ tự
DO $$
DECLARE
    comp RECORD;
    code_num INTEGER := 1;
BEGIN
    FOR comp IN 
        SELECT id 
        FROM public.components 
        WHERE component_code IS NULL 
        ORDER BY created_at ASC
    LOOP
        UPDATE public.components
        SET component_code = code_num
        WHERE id = comp.id;
        
        code_num := code_num + 1;
    END LOOP;
    
    -- Cập nhật sequence để tiếp tục từ số cao nhất
    IF code_num > 1 THEN
        PERFORM setval('public.component_code_seq', code_num - 1, true);
    END IF;
END $$;

-- Tạo unique constraint để đảm bảo mã số không trùng
CREATE UNIQUE INDEX IF NOT EXISTS idx_components_component_code 
ON public.components(component_code) 
WHERE component_code IS NOT NULL;

-- Thêm comment
COMMENT ON COLUMN public.components.component_code IS 
  'Mã số linh kiện (số nguyên) để dễ đọc và tham chiếu. Tự động tăng.';
