# Hướng dẫn cấu hình reCAPTCHA Backend Verification

## ⚠️ Thay đổi quan trọng từ Google (2024-2025)

Google đang migrate tất cả reCAPTCHA sang **Google Cloud Platform (GCP)** và sẽ hoàn tất vào cuối 2025. Có 2 cách để verify token:

1. **Legacy Method** (Đơn giản, vẫn hoạt động): Sử dụng endpoint `https://www.google.com/recaptcha/api/siteverify` với legacy secret key
2. **Enterprise API** (Khuyến nghị, tính năng mới): Sử dụng Google Cloud reCAPTCHA Enterprise API với project ID và API key

**Lưu ý**: 
- Legacy endpoint vẫn hoạt động sau migration, nhưng bạn cần migrate keys sang Google Cloud project
- Để tạo keys mới, bạn phải tạo trong Google Cloud Console
- Legacy secret key chỉ nên dùng cho third-party services hoặc plugins

## Tổng quan

Hệ thống đã được tích hợp reCAPTCHA v3 để bảo vệ form đăng ký khỏi spam và bot. Verification được thực hiện tự động ở phía backend (database level) để đảm bảo bảo mật.

## Kiến trúc

1. **Frontend**: Sử dụng reCAPTCHA v3 (invisible) để tạo token khi submit form
2. **Backend**: 
   - Database trigger tự động validate token format trước khi lưu vào database
   - Full verification với Google API nên được thực hiện qua Supabase Edge Function (khuyến nghị) hoặc application-level
3. **Storage**: Secret key/API key được lưu trong `app_settings` table (không expose ra frontend)

**Lưu ý**: Migration hiện tại chỉ validate format của token (không gọi HTTP API) để tránh lỗi với database extensions. Để thực hiện full verification, bạn nên sử dụng Supabase Edge Function (xem phần "Full Verification với Edge Function" bên dưới).

## Các bước cấu hình

### Bước 1: Lấy reCAPTCHA Keys từ Google Cloud Console

**⚠️ Lưu ý**: Google đã chuyển sang Google Cloud Platform. Bạn cần tạo keys trong Google Cloud Console.

1. Truy cập [Google Cloud Console - reCAPTCHA Enterprise](https://console.cloud.google.com/security/recaptcha)
2. Tạo Google Cloud Project (nếu chưa có)
3. Enable reCAPTCHA Enterprise API
4. Click "Create Key" để tạo site key mới
5. Chọn **reCAPTCHA v3**
6. Thêm domains:
   - Development: `localhost`, `127.0.0.1`
   - Production: domain thật của bạn (ví dụ: `example.com`)
7. Lưu lại **Site Key**

**Để lấy Legacy Secret Key** (cho third-party services):
1. Vào Key Details page
2. Click tab "Integration"
3. Click "Use Legacy Key"
4. Copy **Legacy Secret Key**

**Hoặc sử dụng Enterprise API** (khuyến nghị):
- Sử dụng **Project ID** và **API Key** từ Google Cloud Console
- Xem phần "Enterprise API Method" bên dưới

### Bước 2: Cấu hình Frontend (Site Key)

Thêm Site Key vào file `.env.local`:

```env
VITE_RECAPTCHA_SITE_KEY=6Lcxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Hoặc trong GitHub Actions (cho production), thêm vào Secrets:
- `VITE_RECAPTCHA_SITE_KEY`

### Bước 3: Chạy Migration

Migration đã được tạo sẵn trong `supabase/migrations/20251213000002_verify_recaptcha_backend.sql`. 

**Cho local development:**
```bash
supabase db reset
```

**Cho production:**
1. Vào Supabase Dashboard > SQL Editor
2. Copy nội dung file migration
3. Paste và chạy

### Bước 4: Cấu hình Backend Secret Key

Secret key phải được lưu trong database để bảo mật. Có 2 cách:

#### Cách 1: Qua SQL Editor (Khuyến nghị)

1. Vào Supabase Dashboard > SQL Editor
2. Chạy lệnh sau (thay `YOUR_SECRET_KEY_HERE` bằng secret key thật):

```sql
UPDATE app_settings 
SET value = '"YOUR_SECRET_KEY_HERE"'::jsonb 
WHERE key = 'recaptcha_secret_key';
```

#### Cách 2: Qua Admin Panel

1. Đăng nhập vào admin panel
2. Vào trang Settings (`/cai-dat`)
3. Tìm setting `recaptcha_secret_key`
4. Cập nhật giá trị với secret key của bạn

### Bước 5: Kiểm tra hoạt động

1. Mở form đăng ký nhà hảo tâm
2. Điền form và submit
3. Kiểm tra:
   - Nếu secret key chưa được cấu hình: Form vẫn submit được (với warning trong logs)
   - Nếu secret key đã được cấu hình: Form sẽ được verify tự động
   - Nếu verification thất bại: Sẽ có thông báo lỗi

## Cách hoạt động

### Flow xử lý

1. User điền form và click submit
2. Frontend gọi `executeRecaptcha()` để lấy token từ Google
3. Token được gửi kèm với dữ liệu form đến Supabase
4. Database trigger `validate_donor_application_recaptcha_trigger` được kích hoạt
5. Function `validate_donor_application_recaptcha()` được gọi
6. Function `verify_recaptcha_token()` gọi Google API để verify token
7. Nếu verification thành công và score >= 0.5: Cho phép insert
8. Nếu verification thất bại: Từ chối với exception

### Database Functions

#### `validate_recaptcha_token_format(token TEXT)`

Function này:
- Kiểm tra token có tồn tại và không rỗng
- Validate format cơ bản (độ dài, ký tự hợp lệ)
- Trả về `true` nếu format hợp lệ

**Lưu ý**: Function này chỉ validate format, không gọi Google API. Để thực hiện full verification, sử dụng Supabase Edge Function.

#### `validate_donor_application_recaptcha()`

Trigger function này:
- Kiểm tra xem secret key đã được cấu hình chưa
- Nếu chưa: Bỏ qua verification (cho phép development)
- Nếu có: Gọi `validate_recaptcha_token_format()` để validate format
- Nếu format không hợp lệ: Raise exception để từ chối insert

## Troubleshooting

### Lỗi: "reCAPTCHA secret key not configured"

**Nguyên nhân**: Secret key chưa được cấu hình trong `app_settings`

**Giải pháp**: 
```sql
UPDATE app_settings 
SET value = '"YOUR_SECRET_KEY"'::jsonb 
WHERE key = 'recaptcha_secret_key';
```

### Lỗi: "reCAPTCHA verification failed: HTTP XXX"

**Nguyên nhân**: 
- Secret key không đúng
- Network issue khi gọi Google API
- HTTP extension chưa được enable

**Giải pháp**:
1. Kiểm tra secret key có đúng không
2. Kiểm tra network connection
3. Kiểm tra xem `http` extension đã được enable chưa:
```sql
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;
```

### Lỗi: "reCAPTCHA score too low"

**Nguyên nhân**: Score từ Google < 0.5 (có thể là bot)

**Giải pháp**: 
- Đây là hành vi bình thường, hệ thống đang bảo vệ bạn khỏi bot
- Nếu muốn thay đổi threshold, sửa trong function `verify_recaptcha_token()`:
```sql
IF score < 0.5 THEN  -- Thay đổi 0.5 thành giá trị khác
```

### Form vẫn submit được dù không có token

**Nguyên nhân**: Secret key chưa được cấu hình, nên verification bị bỏ qua

**Giải pháp**: Cấu hình secret key như hướng dẫn ở Bước 4

## Security Best Practices

1. **Không bao giờ** commit secret key vào git
2. **Luôn** lưu secret key trong database hoặc environment variables
3. **Kiểm tra** score threshold phù hợp với use case của bạn
4. **Monitor** logs để phát hiện các attempt spam
5. **Cập nhật** secret key định kỳ nếu cần

## Tùy chỉnh

### Thay đổi Score Threshold

Mặc định, score threshold là 0.5. Để thay đổi:

```sql
CREATE OR REPLACE FUNCTION public.verify_recaptcha_token(token TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
-- ... existing code ...
  IF score < 0.7 THEN  -- Thay đổi từ 0.5 thành 0.7
    RAISE EXCEPTION 'reCAPTCHA score too low: %. Minimum required: 0.7', score;
  END IF;
-- ... existing code ...
$$;
```

### Cho phép submit không có token (Development mode)

Nếu muốn cho phép submit không có token trong development:

```sql
CREATE OR REPLACE FUNCTION public.validate_donor_application_recaptcha()
RETURNS TRIGGER
-- ... existing code ...
  ELSE
    -- Cho phép submit không có token trong development
    -- RETURN NEW;  -- Uncomment dòng này
    RAISE EXCEPTION 'reCAPTCHA token is required';
  END IF;
-- ... existing code ...
$$;
```

## Hai phương pháp Verification

### Method 1: Legacy API (Đơn giản, cho third-party services)

**Khi nào dùng**: 
- Tích hợp với third-party services hoặc plugins
- Muốn sử dụng endpoint cũ `siteverify`
- Đã có legacy secret key

**Cấu hình**:
1. Lấy Legacy Secret Key từ Google Cloud Console (xem Bước 1)
2. Lưu vào database:
```sql
UPDATE app_settings 
SET value = '"YOUR_LEGACY_SECRET_KEY"'::jsonb 
WHERE key = 'recaptcha_secret_key';
```
3. Set environment variable cho Edge Function:
```bash
RECAPTCHA_VERIFICATION_METHOD=legacy
```

### Method 2: Enterprise API (Khuyến nghị, tính năng mới)

**Khi nào dùng**:
- Muốn sử dụng tính năng mới nhất của Google
- Cần advanced security features
- Muốn có better monitoring và reporting

**Cấu hình**:
1. Lấy Project ID, API Key, và Site Key từ Google Cloud Console
2. Lưu vào database:
```sql
-- Project ID
UPDATE app_settings 
SET value = '"YOUR_PROJECT_ID"'::jsonb 
WHERE key = 'recaptcha_project_id';

-- API Key (từ Google Cloud Console > APIs & Services > Credentials)
UPDATE app_settings 
SET value = '"YOUR_API_KEY"'::jsonb 
WHERE key = 'recaptcha_api_key';

-- Site Key (same as frontend)
UPDATE app_settings 
SET value = '"YOUR_SITE_KEY"'::jsonb 
WHERE key = 'recaptcha_site_key';
```
3. Set environment variable cho Edge Function:
```bash
RECAPTCHA_VERIFICATION_METHOD=enterprise
```

## Full Verification với Supabase Edge Function (Khuyến nghị)

Để thực hiện full verification với Google API, bạn nên tạo một Supabase Edge Function. Đây là cách tiếp cận được khuyến nghị vì:

1. Không cần enable HTTP extension trong database
2. Dễ dàng debug và maintain
3. Có thể xử lý errors tốt hơn
4. Không block database transaction

### Tạo Edge Function

1. **Tạo function directory:**
```bash
mkdir -p supabase/functions/verify-recaptcha
```

2. **Tạo file `supabase/functions/verify-recaptcha/index.ts`:**
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Choose verification method: 'legacy' or 'enterprise'
const VERIFICATION_METHOD = Deno.env.get('RECAPTCHA_VERIFICATION_METHOD') || 'legacy'

// Legacy API endpoint (still works, but requires legacy secret key)
const RECAPTCHA_LEGACY_API_URL = 'https://www.google.com/recaptcha/api/siteverify'

// Enterprise API endpoint (recommended)
const RECAPTCHA_ENTERPRISE_API_URL = 'https://recaptchaenterprise.googleapis.com/v1'

serve(async (req) => {
  try {
    const { token, action = 'donor_registration' } = await req.json()

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get configuration from Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    if (VERIFICATION_METHOD === 'enterprise') {
      // Enterprise API Method (Recommended)
      const { data: projectSetting } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'recaptcha_project_id')
        .single()

      const { data: apiKeySetting } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'recaptcha_api_key')
        .single()

      const { data: siteKeySetting } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'recaptcha_site_key')
        .single()

      if (!projectSetting || !apiKeySetting || !siteKeySetting) {
        return new Response(
          JSON.stringify({ error: 'reCAPTCHA Enterprise configuration not found' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
      }

      const projectId = typeof projectSetting.value === 'string' 
        ? projectSetting.value.replace(/^"|"$/g, '') 
        : projectSetting.value
      const apiKey = typeof apiKeySetting.value === 'string'
        ? apiKeySetting.value.replace(/^"|"$/g, '')
        : apiKeySetting.value
      const siteKey = typeof siteKeySetting.value === 'string'
        ? siteKeySetting.value.replace(/^"|"$/g, '')
        : siteKeySetting.value

      // Verify with Enterprise API
      const enterpriseUrl = `${RECAPTCHA_ENTERPRISE_API_URL}/projects/${projectId}/assessments?key=${apiKey}`
      
      const response = await fetch(enterpriseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: {
            token: token,
            siteKey: siteKey,
            expectedAction: action
          }
        })
      })

      const data = await response.json()

      if (!data.tokenProperties || !data.tokenProperties.valid) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'reCAPTCHA verification failed',
            reasons: data.tokenProperties?.invalidReason
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }

      // Check risk score
      const score = data.riskAnalysis?.score || 0
      if (score < 0.5) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `reCAPTCHA score too low: ${score}. Minimum required: 0.5`,
            score: score,
            reasons: data.riskAnalysis?.reasons
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true, score: score }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    } else {
      // Legacy Method (for third-party services)
      const { data: setting, error: settingError } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'recaptcha_secret_key')
        .single()

      if (settingError || !setting) {
        return new Response(
          JSON.stringify({ error: 'reCAPTCHA secret key not configured' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
      }

      const secretKey = typeof setting.value === 'string' 
        ? setting.value.replace(/^"|"$/g, '') 
        : setting.value

      // Verify with Legacy API
      const formData = new URLSearchParams()
      formData.append('secret', secretKey)
      formData.append('response', token)

      const response = await fetch(RECAPTCHA_LEGACY_API_URL, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!data.success) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'reCAPTCHA verification failed',
            'error-codes': data['error-codes']
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }

      // Check score for reCAPTCHA v3
      if (data.score !== undefined && data.score < 0.5) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `reCAPTCHA score too low: ${data.score}. Minimum required: 0.5`
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true, score: data.score }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

3. **Deploy function:**
```bash
supabase functions deploy verify-recaptcha
```

4. **Sử dụng trong frontend:**

Cập nhật `DonorRegistrationForm.tsx` để gọi Edge Function trước khi insert:

```typescript
// Trong onSubmit function
const onSubmit = async (values: FormValues) => {
  setIsSubmitting(true);
  try {
    // Execute reCAPTCHA
    let recaptchaToken = null;
    try {
      recaptchaToken = await executeRecaptcha("donor_registration");
    } catch (error) {
      console.warn("reCAPTCHA error:", error);
    }

    // Verify token với Edge Function
    if (recaptchaToken) {
      const { data, error: verifyError } = await supabase.functions.invoke('verify-recaptcha', {
        body: { token: recaptchaToken }
      });

      if (verifyError || !data?.success) {
        toast.error("reCAPTCHA verification failed", {
          description: "Vui lòng thử lại sau.",
        });
        return;
      }
    }

    // Insert vào database sau khi verify thành công
    const { error } = await supabase.from("donor_applications").insert({
      // ... rest of the data
      recaptcha_token: recaptchaToken || null,
    });

    // ... rest of the code
  } catch (error) {
    // ... error handling
  } finally {
    setIsSubmitting(false);
  }
};
```

### Lợi ích của Edge Function approach

- ✅ Không cần HTTP extension trong database
- ✅ Dễ dàng test và debug
- ✅ Có thể log chi tiết
- ✅ Không block database transaction
- ✅ Có thể cache results nếu cần
- ✅ Dễ dàng update logic mà không cần migration

## Tài liệu tham khảo

- [Google reCAPTCHA Documentation](https://developers.google.com/recaptcha/docs/v3)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
