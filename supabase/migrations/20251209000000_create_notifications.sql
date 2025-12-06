-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
-- Table to store system notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Notification content
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- info, success, warning, error
  
  -- Related entity (optional)
  related_type TEXT, -- 'donor_application', 'student_application', etc.
  related_id UUID, -- ID of the related entity
  
  -- Status
  read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- CREATE INDEXES
-- ============================================
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_related ON public.notifications(related_type, related_id);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE POLICIES FOR NOTIFICATIONS
-- ============================================
-- Only authenticated users can view notifications
CREATE POLICY "Authenticated users can view notifications"
ON public.notifications FOR SELECT
USING (auth.role() = 'authenticated');

-- Only authenticated users can update notifications (mark as read)
CREATE POLICY "Authenticated users can update notifications"
ON public.notifications FOR UPDATE
USING (auth.role() = 'authenticated');

-- System can insert notifications (via triggers)
CREATE POLICY "System can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

-- ============================================
-- FUNCTION TO CREATE DONOR APPLICATION NOTIFICATION
-- ============================================
CREATE OR REPLACE FUNCTION public.create_donor_application_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  support_types_text TEXT;
  notification_title TEXT;
  notification_message TEXT;
BEGIN
  -- Build support types text
  SELECT string_agg(
    CASE 
      WHEN unnest = 'laptop' THEN 'Laptop'
      WHEN unnest = 'motorbike' THEN 'Xe máy'
      WHEN unnest = 'components' THEN 'Linh kiện'
      WHEN unnest = 'tuition' THEN 'Học phí'
      ELSE unnest::TEXT
    END,
    ', '
  ) INTO support_types_text
  FROM unnest(NEW.support_types);

  -- Create notification
  notification_title := 'Đăng ký nhà hảo tâm mới';
  notification_message := NEW.full_name || ' vừa đăng ký hỗ trợ: ' || COALESCE(support_types_text, 'N/A');

  INSERT INTO public.notifications (
    title,
    message,
    type,
    related_type,
    related_id,
    read,
    created_at
  ) VALUES (
    notification_title,
    notification_message,
    'info',
    'donor_application',
    NEW.id,
    false,
    now()
  );

  RETURN NEW;
END;
$$;

-- ============================================
-- FUNCTION TO CREATE STUDENT APPLICATION NOTIFICATION
-- ============================================
CREATE OR REPLACE FUNCTION public.create_student_application_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  needs_text TEXT;
  needs_array TEXT[] := ARRAY[]::TEXT[];
  notification_title TEXT;
  notification_message TEXT;
BEGIN
  -- Build needs array
  IF NEW.need_laptop THEN
    needs_array := array_append(needs_array, 'Laptop');
  END IF;
  IF NEW.need_motorbike THEN
    needs_array := array_append(needs_array, 'Xe máy');
  END IF;
  IF NEW.need_tuition THEN
    needs_array := array_append(needs_array, 'Học phí');
  END IF;
  IF NEW.need_components THEN
    needs_array := array_append(needs_array, 'Linh kiện');
  END IF;

  -- Convert array to text
  SELECT string_agg(unnest, ', ') INTO needs_text
  FROM unnest(needs_array);

  -- Create notification
  notification_title := 'Đăng ký sinh viên mới';
  notification_message := NEW.full_name || ' vừa đăng ký cần hỗ trợ: ' || COALESCE(needs_text, 'N/A');

  INSERT INTO public.notifications (
    title,
    message,
    type,
    related_type,
    related_id,
    read,
    created_at
  ) VALUES (
    notification_title,
    notification_message,
    'info',
    'student_application',
    NEW.id,
    false,
    now()
  );

  RETURN NEW;
END;
$$;

-- ============================================
-- CREATE TRIGGERS
-- ============================================
-- Trigger for donor applications
CREATE TRIGGER donor_application_notification_trigger
  AFTER INSERT ON public.donor_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.create_donor_application_notification();

-- Trigger for student applications
CREATE TRIGGER student_application_notification_trigger
  AFTER INSERT ON public.student_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.create_student_application_notification();
