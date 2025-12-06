# Ăn mày laptop - Hệ thống quản lý thiện nguyện

> Kết nối yêu thương, lan tỏa hy vọng

Hệ thống quản lý dự án thiện nguyện "Ăn mày laptop" - một hoạt động từ thiện nhằm thu gom laptop cũ, sửa chữa và tặng cho sinh viên có hoàn cảnh khó khăn, đồng thời kết nối nhà hảo tâm với sinh viên cần hỗ trợ laptop, xe máy, linh kiện và học phí.

## 📋 Mục lục

- [Giới thiệu](#giới-thiệu)
- [Tính năng chính](#tính-năng-chính)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Cài đặt và chạy dự án](#cài-đặt-và-chạy-dự-án)
- [Cấu hình môi trường](#cấu-hình-môi-trường)
- [Hướng dẫn sử dụng](#hướng-dẫn-sử-dụng)
- [Triển khai](#triển-khai)
- [Đóng góp](#đóng-góp)
- [Giấy phép](#giấy-phép)

## 🎯 Giới thiệu

### Bối cảnh dự án

Dự án "Ăn mày laptop" là một hoạt động thiện nguyện được sáng lập bởi **Trần Trọng An**, nhằm:

- **Thu gom laptop cũ, hỏng** để sửa chữa và tặng cho sinh viên có hoàn cảnh khó khăn
- **Mở rộng hỗ trợ** xe máy cho sinh viên cần sử dụng làm công cụ mưu sinh
- **Kết nối nhà hảo tâm** với sinh viên cần hỗ trợ (laptop, xe máy, linh kiện, học phí)
- **Đảm bảo tính minh bạch** thông qua báo cáo công khai trên Facebook

### Nguyên tắc hoạt động

- ❌ **Không nhận tiền trực tiếp**, chỉ kết nối nhà hảo tâm với sinh viên
- 🔧 **Linh kiện được hỗ trợ** thông qua đặt hàng trực tiếp theo mẫu mã cụ thể
- 📢 **Tất cả hoạt động** được công khai và báo cáo trên Facebook
- 🚫 **Không mua bán laptop** và không nhận sửa máy tính cho mục đích kinh doanh

## ✨ Tính năng chính

### 🌐 Trang công khai (Public Pages)

#### 1. Trang chủ (Landing Page)
- Giới thiệu dự án và nguyên tắc hoạt động
- Đăng ký nhà hảo tâm và sinh viên
- Liên kết đến các trang công khai khác
- Thông tin về người sáng lập
- Thư ngỏ từ người sáng lập

#### 2. Đăng ký nhà hảo tâm
- Form đăng ký với thông tin liên hệ
- Chọn loại hỗ trợ: Laptop, xe máy, linh kiện, học phí
- Mức độ hỗ trợ: Một lần / Định kỳ
- Upload hình ảnh laptop (nếu hỗ trợ laptop)
- Bảo vệ bằng reCAPTCHA

#### 3. Đăng ký sinh viên
- Form đăng ký với thông tin cá nhân
- Thông tin năm học và hoàn cảnh khó khăn
- Nhu cầu hỗ trợ: Laptop, xe máy, học phí, linh kiện
- Bảo vệ bằng reCAPTCHA

#### 4. Ngân hàng laptop
- Danh sách laptop công khai sẵn sàng tặng
- Thông tin chi tiết: hãng, model, thông số kỹ thuật
- Hình ảnh laptop
- Tìm kiếm và phân trang

#### 5. Ngân hàng linh kiện
- Danh sách linh kiện cần hỗ trợ
- Mã linh kiện để tham chiếu
- Link đặt hàng và thông tin nhận hàng
- Trạng thái: Đang cần / Đã có người hỗ trợ / Đã nhận

#### 6. Danh sách sinh viên
- Danh sách sinh viên đã được phê duyệt
- Thông tin cơ bản: năm sinh, năm học, khu vực, hoàn cảnh
- Nhu cầu hỗ trợ hiện tại
- Đăng ký hỗ trợ trực tiếp với reCAPTCHA
- Tìm kiếm và lọc theo: năm học, khu vực, nhu cầu

### 🔐 Trang quản trị (Admin Pages)

#### 1. Dashboard
- Tổng quan thống kê dự án
- Số lượng nhà hảo tâm, sinh viên, laptop, xe máy
- Hoạt động gần đây
- Thông báo

#### 2. Quản lý đơn đăng ký
- Xem danh sách đơn đăng ký nhà hảo tâm và sinh viên
- Xử lý đơn: Duyệt / Từ chối
- Xem chi tiết đơn đăng ký
- Chuyển đổi đơn thành thông tin chính thức

#### 3. Quản lý nhà hảo tâm
- Xem danh sách nhà hảo tâm
- Thêm/sửa/xóa thông tin
- Tìm kiếm và lọc theo loại hỗ trợ
- Xem lịch sử hỗ trợ

#### 4. Quản lý sinh viên
- Xem danh sách sinh viên
- Thêm/sửa/xóa thông tin
- Tìm kiếm và lọc theo năm học, nhu cầu, trạng thái
- Cập nhật trạng thái nhận hỗ trợ
- Xem lịch sử nhận hỗ trợ

#### 5. Quản lý laptop
- Thêm laptop mới vào danh mục
- Cập nhật thông tin và trạng thái
- Quản lý hình ảnh laptop
- Tìm kiếm và lọc theo trạng thái, mẫu mã
- Xem lịch sử sửa chữa và tặng

#### 6. Quản lý xe máy
- Thêm xe máy mới vào danh mục
- Cập nhật thông tin và trạng thái
- Tìm kiếm và lọc theo trạng thái, loại xe
- Xem lịch sử sửa chữa và tặng

#### 7. Quản lý linh kiện
- Thêm linh kiện cần hỗ trợ
- Cập nhật thông tin đặt hàng
- Liên kết linh kiện với laptop
- Cập nhật trạng thái: Đang cần / Đã có người hỗ trợ / Đã nhận / Đã lắp đặt

#### 8. Quản lý học phí
- Kết nối nhà hảo tâm với sinh viên
- Ghi nhận lịch sử hỗ trợ học phí
- Cập nhật trạng thái hỗ trợ

#### 9. Báo cáo và thống kê
- Báo cáo tổng quan
- Báo cáo nhu cầu và khả năng
- Báo cáo hoạt động theo thời gian (tuần/tháng)
- Xuất báo cáo để đăng lên Facebook

#### 10. Cài đặt
- Quản lý khu vực (Areas)
- Cấu hình hệ thống
- Quản lý thông báo

## 🛠️ Công nghệ sử dụng

### Frontend
- **React 18** - Thư viện UI
- **TypeScript** - Ngôn ngữ lập trình
- **Vite** - Build tool và dev server
- **React Router DOM** - Điều hướng
- **TanStack Query (React Query)** - Quản lý state và data fetching
- **React Hook Form** - Quản lý form
- **Zod** - Validation schema
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Lucide React** - Icon library
- **date-fns** - Xử lý ngày tháng
- **Sonner** - Toast notifications
- **react-helmet-async** - SEO management

### Backend & Database
- **Supabase** - Backend as a Service (BaaS)
  - PostgreSQL database
  - Authentication
  - Storage (cho hình ảnh laptop)
  - Row Level Security (RLS) policies

### Bảo mật
- **reCAPTCHA v3** - Bảo vệ form đăng ký khỏi spam
- **Supabase Auth** - Xác thực người dùng
- **Row Level Security** - Bảo vệ dữ liệu ở tầng database

### Deployment
- **GitHub Pages** - Hosting static files
- **GitHub Actions** - CI/CD pipeline

## 📁 Cấu trúc dự án

```
connect-uplift/
├── public/                 # Static files
├── src/
│   ├── components/        # React components
│   │   ├── applications/  # Components quản lý đơn đăng ký
│   │   ├── auth/          # Components xác thực
│   │   ├── captcha/       # reCAPTCHA components
│   │   ├── dashboard/     # Dashboard components
│   │   ├── donors/         # Components nhà hảo tâm
│   │   ├── forms/          # Form components
│   │   ├── layout/         # Layout components
│   │   ├── students/       # Components sinh viên
│   │   └── ui/             # shadcn/ui components
│   ├── contexts/           # React contexts
│   ├── enums/              # TypeScript enums
│   ├── hooks/              # Custom React hooks
│   ├── integrations/       # External integrations
│   │   └── supabase/       # Supabase client & types
│   ├── lib/                # Utility functions
│   ├── pages/              # Page components
│   │   ├── Public*.tsx     # Public pages
│   │   └── *.tsx           # Admin pages
│   └── types/               # TypeScript types
├── supabase/
│   └── migrations/         # Database migrations
├── .github/
│   └── workflows/          # GitHub Actions workflows
└── package.json
```

## 🚀 Cài đặt và chạy dự án

### Yêu cầu hệ thống

- **Node.js** >= 18.x
- **npm** hoặc **bun** hoặc **yarn**
- Tài khoản **Supabase** (cho backend)

### Các bước cài đặt

1. **Clone repository**
```bash
git clone <repository-url>
cd connect-uplift
```

2. **Cài đặt dependencies**
```bash
npm install
# hoặc
bun install
```

3. **Cấu hình biến môi trường**

Tạo file `.env.local` (xem phần [Cấu hình môi trường](#cấu-hình-môi-trường))

4. **Chạy development server**
```bash
npm run dev
# hoặc
bun dev
```

5. **Mở trình duyệt**

Truy cập `http://localhost:5173` (hoặc port được Vite chỉ định)

### Scripts có sẵn

```bash
# Development
npm run dev              # Chạy dev server

# Build
npm run build            # Build production
npm run build:dev        # Build development mode

# Lint
npm run lint             # Chạy ESLint

# Preview
npm run preview          # Preview production build
```

## ⚙️ Cấu hình môi trường

Tạo file `.env.local` trong thư mục gốc với các biến sau:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# reCAPTCHA
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

### Hướng dẫn lấy thông tin Supabase

1. Đăng nhập vào [Supabase Dashboard](https://app.supabase.com)
2. Chọn project của bạn
3. Vào **Settings** > **API**
4. Copy **Project URL** và **anon/public key**

### Hướng dẫn cấu hình reCAPTCHA

Xem file `RECAPTCHA-SETUP.md` để biết chi tiết.

## 📖 Hướng dẫn sử dụng

### Cho người dùng công khai

#### Đăng ký nhà hảo tâm

1. Truy cập trang chủ
2. Click vào "Đăng ký nhà hảo tâm"
3. Điền đầy đủ thông tin:
   - Thông tin liên hệ (họ tên, năm sinh, SĐT, địa chỉ, Facebook)
   - Loại hỗ trợ muốn cung cấp
   - Mức độ hỗ trợ (một lần / định kỳ)
   - Upload hình ảnh laptop (nếu có)
4. Hoàn tất reCAPTCHA
5. Submit form

#### Đăng ký sinh viên

1. Truy cập trang chủ
2. Click vào "Đăng ký sinh viên"
3. Điền đầy đủ thông tin:
   - Thông tin cá nhân
   - Năm học
   - Hoàn cảnh khó khăn (mô tả chi tiết)
   - Nhu cầu hỗ trợ
4. Hoàn tất reCAPTCHA
5. Submit form

#### Xem danh sách sinh viên và đăng ký hỗ trợ

1. Truy cập "Danh sách sinh viên"
2. Tìm kiếm hoặc lọc sinh viên theo nhu cầu
3. Click "Đăng ký hỗ trợ" trên card sinh viên
4. Điền thông tin liên hệ
5. Hoàn tất reCAPTCHA và submit

### Cho quản trị viên

#### Đăng nhập

1. Truy cập `/auth`
2. Đăng nhập bằng tài khoản Supabase

#### Xử lý đơn đăng ký

1. Vào **Đơn đăng ký**
2. Xem danh sách đơn chờ xử lý
3. Click vào đơn để xem chi tiết
4. Chọn **Duyệt** hoặc **Từ chối**
5. Nếu duyệt, chọn chuyển đổi thành nhà hảo tâm/sinh viên chính thức

#### Quản lý dữ liệu

- **Nhà hảo tâm**: Thêm, sửa, xóa, tìm kiếm
- **Sinh viên**: Thêm, sửa, xóa, cập nhật trạng thái nhận hỗ trợ
- **Laptop**: Thêm laptop mới, cập nhật trạng thái, upload hình ảnh
- **Xe máy**: Thêm xe máy mới, cập nhật trạng thái
- **Linh kiện**: Thêm linh kiện cần hỗ trợ, cập nhật trạng thái

#### Xem báo cáo

1. Vào **Báo cáo**
2. Chọn loại báo cáo:
   - Tổng quan
   - Nhu cầu và khả năng
   - Hoạt động theo thời gian
3. Xuất báo cáo để đăng lên Facebook

## 🚢 Triển khai

### Triển khai lên GitHub Pages

Dự án đã được cấu hình sẵn để deploy lên GitHub Pages thông qua GitHub Actions.

1. **Cấu hình GitHub Secrets**

Vào **Settings** > **Secrets and variables** > **Actions**, thêm:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_RECAPTCHA_SITE_KEY`

2. **Push code lên GitHub**

```bash
git push origin main
```

3. **GitHub Actions tự động deploy**

Workflow sẽ tự động chạy khi push code lên branch `main`.

### Triển khai thủ công

```bash
# Build production
npm run build

# Upload thư mục dist/ lên hosting của bạn
```

## 🤝 Đóng góp

Chúng tôi hoan nghênh mọi đóng góp! Vui lòng:

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

### Quy tắc đóng góp

- Tuân thủ code style hiện tại
- Viết commit message rõ ràng
- Test kỹ trước khi submit PR
- Cập nhật documentation nếu cần

## 📝 Tài liệu tham khảo

- [REQUIREMENTS.md](./REQUIREMENTS.md) - Yêu cầu hệ thống chi tiết
- [SETUP.md](./SETUP.md) - Hướng dẫn setup
- [RECAPTCHA-SETUP.md](./RECAPTCHA-SETUP.md) - Cấu hình reCAPTCHA
- [SEO-SETUP.md](./SEO-SETUP.md) - Cấu hình SEO
- [OPEN_LETTER.md](./OPEN_LETTER.md) - Thư ngỏ từ người sáng lập

## 👤 Người sáng lập

**Trần Trọng An**

- Facebook: [Trần Trọng An](https://www.facebook.com/trongan.gdm)
- Dự án: [Ăn mày laptop](https://www.facebook.com/share/p/1DqXRNSHGW/)

## 📄 Giấy phép

Dự án này được phát hành dưới giấy phép MIT. Xem file `LICENSE` để biết thêm chi tiết.

## 🙏 Lời cảm ơn

Cảm ơn tất cả các nhà hảo tâm và tình nguyện viên đã đóng góp cho dự án "Ăn mày laptop". Sự hỗ trợ của các bạn đã giúp nhiều sinh viên có hoàn cảnh khó khăn có thể tiếp tục con đường học vấn.

---

**Lưu ý quan trọng**: Dự án này **KHÔNG** nhận tiền tài trợ và **KHÔNG** làm trung gian nhận tiền. Mọi liên lạc nhân danh dự án mà không có tin nhắn báo trước từ Facebook chính chủ đều không liên quan đến dự án.
