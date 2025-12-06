import { Laptop, Wrench, GraduationCap, Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function PublicHeader() {
  const location = useLocation();

  const navigationLinks = [
    {
      href: "/ngan-hang-laptop",
      label: "Ngân hàng laptop",
      icon: Laptop,
    },
    {
      href: "/ngan-hang-linh-kien",
      label: "Linh kiện cần hỗ trợ",
      icon: Wrench,
    },
    {
      href: "/danh-sach-sinh-vien",
      label: "Danh sách sinh viên",
      icon: GraduationCap,
    },
  ];

  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Laptop className="h-6 w-6" />
          <h1 className="text-xl font-bold">Ăn mày laptop</h1>
        </Link>

        {/* Navigation Links - Desktop */}
        <nav className="hidden lg:flex items-center gap-2">
          {navigationLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.href;
            return (
              <Button
                key={link.href}
                asChild
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                className="h-9"
              >
                <Link to={link.href}>
                  <Icon className="h-4 w-4 mr-2" />
                  <span>{link.label}</span>
                </Link>
              </Button>
            );
          })}
        </nav>

        {/* Right side: Navigation Menu (Mobile) + Admin Login */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Navigation Links - Mobile/Tablet Dropdown */}
          <div className="lg:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9">
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Menu điều hướng</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Điều hướng</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {navigationLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.href;
                  return (
                    <DropdownMenuItem
                      key={link.href}
                      asChild
                      className={isActive ? "bg-secondary" : ""}
                    >
                      <Link to={link.href} className="flex items-center">
                        <Icon className="mr-2 h-4 w-4" />
                        <span>{link.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Admin Login Button */}
          <Link to="/auth">
            <Button variant="ghost" size="sm" className="h-9 text-xs md:text-sm">
              <span className="hidden sm:inline">Đăng nhập</span>
              <span className="sm:hidden">Đăng nhập</span>
              <span className="hidden md:inline ml-1">(Admin)</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
