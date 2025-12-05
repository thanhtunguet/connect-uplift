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
```

Lấy thông tin này từ:
- **Local:** Sau khi chạy `supabase start`, CLI sẽ hiển thị URL và anon key
- **Production:** Vào Supabase Dashboard > Settings > API

## Cài đặt Dependencies

```bash
cd connect-uplift
npm install
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

## Lưu ý

- Form validation đã được cài đặt đầy đủ theo requirements
- Tất cả đơn đăng ký mặc định có status là "pending"
- RLS (Row Level Security) đã được bật:
  - Public (không đăng nhập) có thể INSERT vào bảng applications
  - Chỉ authenticated users (admin) mới có thể SELECT và UPDATE applications
- Form đăng ký là public, không cần authentication
- Admin panel yêu cầu authentication để quản lý
- Cần cấu hình admin role riêng trong production để hạn chế quyền truy cập
