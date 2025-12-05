import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { NeedsOverview } from "@/components/dashboard/NeedsOverview";
import { Heart, GraduationCap, Laptop, Bike, FileText, Wrench } from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";

export default function Index() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <MainLayout title="Tổng quan" description="Chào mừng đến với hệ thống quản lý Ăn mày laptop">
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </MainLayout>
    );
  }

  const mainStats = [
    {
      title: "Nhà hảo tâm",
      value: stats?.totalDonors || 0,
      subtitle: `${stats?.activeDonors || 0} đang hoạt động`,
      icon: Heart,
      variant: "primary" as const,
    },
    {
      title: "Sinh viên",
      value: stats?.totalStudents || 0,
      subtitle: `${stats?.studentsReceivedSupport || 0} đã nhận hỗ trợ`,
      icon: GraduationCap,
      variant: "secondary" as const,
    },
    {
      title: "Laptop",
      value: stats?.totalLaptops || 0,
      subtitle: `${stats?.availableLaptops || 0} sẵn sàng tặng`,
      icon: Laptop,
      variant: "success" as const,
    },
    {
      title: "Xe máy",
      value: stats?.totalMotorbikes || 0,
      subtitle: `${stats?.availableMotorbikes || 0} sẵn sàng tặng`,
      icon: Bike,
      variant: "warning" as const,
    },
  ];

  const quickStats = [
    { title: "Đơn đăng ký mới", value: stats?.newApplications || 0, icon: FileText },
    { title: "Linh kiện cần hỗ trợ", value: stats?.componentsNeedingSupport || 0, icon: Wrench },
  ];

  return (
    <MainLayout title="Tổng quan" description="Chào mừng đến với hệ thống quản lý Ăn mày laptop">
      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {mainStats.map((stat, index) => (
          <div key={stat.title} style={{ animationDelay: `${index * 100}ms` }}>
            <StatCard {...stat} />
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat, index) => (
          <div
            key={stat.title}
            className="flex items-center gap-4 rounded-xl border bg-card p-4 animate-slide-up"
            style={{ animationDelay: `${(index + 4) * 100}ms` }}
          >
            <div className="rounded-lg bg-accent p-2">
              <stat.icon className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivity />
        <NeedsOverview />
      </div>
    </MainLayout>
  );
}
