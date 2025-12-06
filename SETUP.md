# Setup Guide - Hệ thống "Ăn mày laptop"

## Cài đặt Database

### 1. Khởi tạo Supabase Local

Nếu bạn muốn chạy local, cài đặt Supabase CLI và khởi chạy:

```bash
# Cài đặt Supabase CLI (nếu chưa có)
npm install -g supabase

# Khởi động Supabase local
cd connect-uplift
supabase start
```

### 2. Chạy Migrations

Migrations đã được tạo sẵn trong thư mục `supabase/migrations/`. Để áp dụng vào database:

**Cho local development:**
```bash
supabase db reset
```

**Cho production (Supabase Cloud):**
1. Đăng nhập vào Supabase Dashboard (https://app.supabase.com)
2. Chọn project của bạn
3. Vào SQL Editor
4. Copy nội dung file `supabase/migrations/20251206000000_create_applications_tables.sql`
5. Paste và chạy SQL

### 3. Cấu hình Environment Variables

Tạo file `.env.local` trong thư mục `connect-uplift`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

Lấy thông tin này từ:
- **Local:** Sau khi chạy `supabase start`, CLI sẽ hiển thị URL và anon key
- **Production:** Vào Supabase Dashboard > Settings > API
- **reCAPTCHA Site Key:** Lấy từ [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)

## Cài đặt Dependencies

```bash
cd connect-uplift
npm install

# Install SEO dependencies
npm install react-helmet-async
```

## Chạy Development Server

```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:5173`

## Kiểm tra các tính năng đã triển khai

### 1. Trang chủ công khai (/)
- Không yêu cầu đăng nhập
- Hiển thị thông tin dự án
- Có link đến form đăng ký cho nhà hảo tâm và sinh viên
- Link đăng nhập cho admin

### 2. Đăng ký Nhà hảo tâm (Công khai - không cần đăng nhập)
1. Vào trang chủ (/) hoặc truy cập trực tiếp (/dang-ky-nha-hao-tam)
2. Click "Đăng ký nhà hảo tâm"
3. Điền form đăng ký với các thông tin:
   - Thông tin liên hệ: Họ tên, năm sinh, SĐT, địa chỉ, Facebook
   - Khả năng hỗ trợ: Chọn loại hỗ trợ (Laptop/Xe máy/Linh kiện/Học phí)
   - Mức độ: Một lần hoặc Định kỳ
4. Submit form
5. Nhận thông báo thành công

### 3. Đăng ký Sinh viên (Công khai - không cần đăng nhập)
1. Vào trang chủ (/) hoặc truy cập trực tiếp (/dang-ky-sinh-vien)
2. Click "Đăng ký sinh viên"
3. Điền form đăng ký với các thông tin:
   - Thông tin liên hệ: Họ tên, năm sinh, SĐT, địa chỉ, Facebook
   - Thông tin sinh viên: Năm học (1-4), hoàn cảnh khó khăn
   - Nhu cầu: Chọn các loại hỗ trợ cần (Laptop/Xe máy/Học phí/Linh kiện)
4. Submit form
5. Nhận thông báo thành công

### 4. Quản lý đơn đăng ký (Admin - yêu cầu đăng nhập)
1. Đăng nhập qua trang /auth
2. Sau khi đăng nhập, tự động chuyển đến /admin (Dashboard)
3. Vào trang "Đơn đăng ký" (/don-dang-ky)
4. Xem danh sách đơn từ nhà hảo tâm và sinh viên
5. Có thể thêm đơn mới thông qua nút "Thêm mới" (trong admin panel)

## Cấu trúc Database đã tạo

### Tables

1. **donor_applications** - Đơn đăng ký nhà hảo tâm
2. **student_applications** - Đơn đăng ký sinh viên
3. **donors** - Nhà hảo tâm đã được duyệt
4. **students** - Sinh viên đã được duyệt

### Enums

- **application_status**: pending, approved, rejected
- **support_type**: laptop, motorbike, components, tuition
- **support_frequency**: one_time, recurring
- **academic_year**: 1, 2, 3, 4

## Cấu trúc ứng dụng

### Public Routes (Không cần đăng nhập)
- `/` - Trang chủ công khai
- `/dang-ky-nha-hao-tam` - Form đăng ký nhà hảo tâm
- `/dang-ky-sinh-vien` - Form đăng ký sinh viên
- `/auth` - Trang đăng nhập (chỉ cho admin)

### Admin Routes (Yêu cầu đăng nhập)
- `/admin` - Dashboard tổng quan
- `/don-dang-ky` - Quản lý đơn đăng ký
- `/nha-hao-tam` - Quản lý nhà hảo tâm
- `/sinh-vien` - Quản lý sinh viên
- `/laptop` - Quản lý laptop
- `/xe-may` - Quản lý xe máy
- `/linh-kien` - Quản lý linh kiện
- `/bao-cao` - Báo cáo và thống kê
- `/cai-dat` - Cài đặt

## Tính năng đã hoàn thành

✅ Database schema cho đơn đăng ký nhà hảo tâm và sinh viên
✅ Database policies cho phép public registration (không cần đăng nhập)
✅ Form đăng ký nhà hảo tâm với validation
✅ Form đăng ký sinh viên với validation
✅ Trang chủ công khai với giới thiệu dự án
✅ Trang đăng ký công khai cho nhà hảo tâm
✅ Trang đăng ký công khai cho sinh viên
✅ Success screens sau khi đăng ký
✅ Tích hợp forms vào admin panel với Dialog
✅ Responsive UI cho cả public và admin
✅ Form validation với Zod
✅ Toast notifications khi submit thành công/thất bại
✅ Phân quyền: Public có thể đăng ký, chỉ Admin mới quản lý

## Tính năng tiếp theo cần phát triển

- [ ] Hiển thị danh sách đơn đăng ký từ database (thay mock data)
- [ ] Chức năng xem chi tiết đơn đăng ký
- [ ] Chức năng duyệt/từ chối đơn đăng ký
- [ ] Chức năng chuyển đổi đơn đăng ký thành donor/student chính thức
- [ ] Trang quản lý Nhà hảo tâm
- [ ] Trang quản lý Sinh viên
- [ ] Trang quản lý Laptop
- [ ] Trang quản lý Xe máy
- [ ] Trang quản lý Linh kiện
- [ ] Trang báo cáo và thống kê

## SEO Configuration

The project has been configured with comprehensive SEO support:

✅ **Dynamic meta tags** using react-helmet-async
✅ **Open Graph tags** for Facebook sharing
✅ **Twitter Card tags** for Twitter sharing
✅ **Canonical URLs** for each page
✅ **robots.txt** with proper indexing rules
✅ **Structured data ready** for rich snippets

### SEO Files
- `src/components/SEO.tsx` - Reusable SEO component
- `public/robots.txt` - Search engine crawling rules
- `prerender.config.ts` - Pre-rendering configuration
- `SEO-SETUP.md` - Complete SEO documentation

### Public Pages with SEO
All public pages have optimized meta tags:
- `/` - Landing page
- `/dang-ky-nha-hao-tam` - Donor registration
- `/dang-ky-sinh-vien` - Student registration

### Testing SEO
```bash
# Run development server
npm run dev

# View page source to verify meta tags
# Test with:
# - Facebook Debugger: https://developers.facebook.com/tools/debug/
# - Twitter Card Validator: https://cards-dev.twitter.com/validator
# - Google Rich Results Test: https://search.google.com/test/rich-results
```

See `SEO-SETUP.md` for detailed SEO configuration and optimization guide.

## Cấu hình reCAPTCHA

Hệ thống đã được tích hợp reCAPTCHA v3 để bảo vệ chống spam. Cần cấu hình cả frontend và backend:

### 1. Lấy reCAPTCHA Keys

1. Truy cập [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Tạo một site mới (chọn reCAPTCHA v3)
3. Thêm domain của bạn (ví dụ: `localhost` cho development, domain thật cho production)
4. Lấy **Site Key** và **Secret Key**

### 2. Cấu hình Frontend

Thêm Site Key vào file `.env.local`:

```env
VITE_RECAPTCHA_SITE_KEY=your_site_key_here
```

### 3. Cấu hình Backend (Secret Key)

Secret key được lưu trong database để bảo mật. Sau khi chạy migrations, cấu hình secret key:

**Cách 1: Qua SQL Editor (Supabase Dashboard)**
```sql
UPDATE app_settings 
SET value = '"YOUR_SECRET_KEY_HERE"'::jsonb 
WHERE key = 'recaptcha_secret_key';
```

**Cách 2: Qua Admin Panel (nếu có)**
- Vào trang Settings (`/cai-dat`)
- Tìm setting `recaptcha_secret_key`
- Cập nhật giá trị với secret key của bạn

### 4. Kiểm tra hoạt động

- Nếu secret key chưa được cấu hình: Hệ thống sẽ bỏ qua verification (cho phép development)
- Nếu secret key đã được cấu hình: Tất cả đơn đăng ký sẽ được verify tự động
- Nếu verification thất bại: Đơn đăng ký sẽ bị từ chối với thông báo lỗi

### 5. Lưu ý

- Secret key chỉ được lưu trong database, không expose ra frontend
- Verification được thực hiện tự động qua database trigger
- Score threshold mặc định là 0.5 (có thể điều chỉnh trong function `verify_recaptcha_token`)
- Trong development, nếu không có secret key, hệ thống vẫn cho phép submit (với warning)

## Lưu ý

- Form validation đã được cài đặt đầy đủ theo requirements
- Tất cả đơn đăng ký mặc định có status là "pending"
- RLS (Row Level Security) đã được bật:
  - Public (không đăng nhập) có thể INSERT vào bảng applications
  - Chỉ authenticated users (admin) mới có thể SELECT và UPDATE applications
- Form đăng ký là public, không cần authentication
- Admin panel yêu cầu authentication để quản lý
- Cần cấu hình admin role riêng trong production để hạn chế quyền truy cập
- **SEO:** Public pages được tối ưu cho search engines với meta tags đầy đủ
- **reCAPTCHA:** Đã tích hợp reCAPTCHA v3 để bảo vệ chống spam (cần cấu hình secret key)
