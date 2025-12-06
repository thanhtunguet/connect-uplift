-- ============================================
-- FUNCTION TO REGISTER COMPONENT SUPPORT
-- ============================================
-- This function handles component support registration:
-- 1. Creates a donor application for the supporter
-- 2. Updates component status from 'needs_support' to 'supported'
-- 3. Creates a notification for admins
CREATE OR REPLACE FUNCTION public.register_component_support(
  p_component_id UUID,
  p_full_name TEXT,
  p_phone TEXT,
  p_facebook_link TEXT DEFAULT NULL,
  p_recaptcha_token TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_component RECORD;
  v_donor_application_id UUID;
  v_notification_title TEXT;
  v_notification_message TEXT;
  v_component_code_text TEXT;
BEGIN
  -- Get component information
  SELECT * INTO v_component
  FROM public.components
  WHERE id = p_component_id
    AND status = 'needs_support';
  
  -- Check if component exists and is in needs_support status
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Component not found or already supported';
  END IF;

  -- Format component code for notification
  IF v_component.component_code IS NOT NULL THEN
    v_component_code_text := 'mã ' || v_component.component_code::TEXT;
  ELSE
    v_component_code_text := v_component.component_type;
  END IF;

  -- Create donor application for the supporter
  -- Note: address is required but not provided in quick registration, using placeholder
  INSERT INTO public.donor_applications (
    full_name,
    phone,
    address,
    facebook_link,
    support_types,
    components_quantity,
    status,
    recaptcha_token,
    created_at,
    updated_at
  ) VALUES (
    p_full_name,
    p_phone,
    'Chưa cập nhật - Đăng ký hỗ trợ nhanh', -- Placeholder address since it's required
    p_facebook_link,
    ARRAY['components']::support_type[], -- Cast to support_type enum array
    1,
    'pending',
    p_recaptcha_token,
    now(),
    now()
  )
  RETURNING id INTO v_donor_application_id;

  -- Update component status to 'pending_support' (chờ hỗ trợ)
  UPDATE public.components
  SET 
    status = 'pending_support',
    updated_at = now()
  WHERE id = p_component_id;

  -- Create notification
  v_notification_title := 'Đăng ký hỗ trợ linh kiện';
  v_notification_message := p_full_name || ' vừa đăng ký hỗ trợ linh kiện ' || v_component_code_text || ' (' || v_component.component_type || ')';

  INSERT INTO public.notifications (
    title,
    message,
    type,
    related_type,
    related_id,
    read,
    created_at
  ) VALUES (
    v_notification_title,
    v_notification_message,
    'info',
    'component_support',
    p_component_id,
    false,
    now()
  );

  -- Return success
  RETURN json_build_object(
    'success', true,
    'component_id', p_component_id,
    'donor_application_id', v_donor_application_id
  );
END;
$$;

-- Grant execute permission to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION public.register_component_support TO authenticated;
GRANT EXECUTE ON FUNCTION public.register_component_support TO anon;
