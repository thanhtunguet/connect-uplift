import { Link } from "react-router-dom";
import {
  Laptop,
  Wrench,
  GraduationCap,
  Home,
  Heart,
  UserPlus,
} from "lucide-react";

export function PublicFooter() {
  const navigationLinks = [
    {
      href: "/index.html",
      label: "Trang chủ",
      icon: Home,
    },
    {
      href: "/ngan-hang-laptop.html",
      label: "Ngân hàng laptop",
      icon: Laptop,
    },
    {
      href: "/ngan-hang-linh-kien.html",
      label: "Linh kiện cần hỗ trợ",
      icon: Wrench,
    },
    {
      href: "/danh-sach-sinh-vien.html",
      label: "Danh sách sinh viên",
      icon: GraduationCap,
    },
  ];

  const registrationLinks = [
    {
      href: "/dang-ky-nha-hao-tam.html",
      label: "Đăng ký nhà hảo tâm",
      icon: Heart,
    },
    {
      href: "/dang-ky-sinh-vien.html",
      label: "Đăng ký sinh viên",
      icon: UserPlus,
    },
  ];

  return (
    <footer className="border-t py-8 md:py-12 bg-muted/50 mt-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {/* Navigation Links */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Điều hướng</h3>
            <nav className="flex flex-col gap-3">
              {navigationLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Registration Links */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Đăng ký</h3>
            <nav className="flex flex-col gap-3">
              {registrationLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* About Section */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Về dự án</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Dự án "Ăn mày laptop" kết nối các nhà hảo tâm với sinh viên có
              hoàn cảnh khó khăn, hỗ trợ laptop, xe máy, linh kiện và học phí để
              các em có thể tiếp tục con đường học vấn.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Dự án "Ăn mày laptop" - Kết nối yêu thương, lan tỏa hy vọng
          </p>
        </div>
      </div>
    </footer>
  );
}
