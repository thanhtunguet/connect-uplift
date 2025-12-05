import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  GraduationCap,
  Laptop,
  Bike,
  Wrench,
  FileText,
  BarChart3,
  Heart,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const navigation = [
  { name: "Tổng quan", href: "/", icon: LayoutDashboard },
  { name: "Đơn đăng ký", href: "/don-dang-ky", icon: FileText },
  { name: "Nhà hảo tâm", href: "/nha-hao-tam", icon: Heart },
  { name: "Sinh viên", href: "/sinh-vien", icon: GraduationCap },
  { name: "Laptop", href: "/laptop", icon: Laptop },
  { name: "Xe máy", href: "/xe-may", icon: Bike },
  { name: "Linh kiện", href: "/linh-kien", icon: Wrench },
  { name: "Báo cáo", href: "/bao-cao", icon: BarChart3 },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar variant= "inset" collapsible = "icon" >
      <SidebarHeader>
      <div className="flex h-12 items-center gap-3 px-2" >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary" >
          <Laptop className="h-4 w-4 text-primary-foreground" />
            </div>
            < div className = "grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden" >
              <span className="truncate font-semibold text-foreground" > Ăn mày laptop </span>
                < span className = "truncate text-xs text-muted-foreground" > Hệ thống quản lý </span>
                  </div>
                  </div>
                  </SidebarHeader>

                  < SidebarContent >
                  <SidebarGroup>
                  <SidebarGroupLabel>Menu </SidebarGroupLabel>
                  < SidebarGroupContent >
                  <SidebarMenu>
                  {
                    navigation.map((item) => (
                      <SidebarMenuItem key= { item.name } >
                      <SidebarMenuButton
                    asChild
                    isActive = { location.pathname === item.href }
                    tooltip = { item.name }
                      >
                      <Link to={ item.href } >
                      <item.icon />
                      < span > { item.name } </span>
                      </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    ))
                  }
                  </SidebarMenu>
                  </SidebarGroupContent>
                  </SidebarGroup>
                  </SidebarContent>

                  < SidebarFooter >
                  <SidebarMenu>
                  <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip = "Cài đặt" >
                    <Link to="/cai-dat" >
                      <Settings />
                      < span > Cài đặt </span>
                        </Link>
                        </SidebarMenuButton>
                        </SidebarMenuItem>
                        </SidebarMenu>
                        </SidebarFooter>
                        </Sidebar>
  );
}
