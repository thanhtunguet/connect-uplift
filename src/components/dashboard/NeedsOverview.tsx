import { Laptop, Bike, GraduationCap, Wrench } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";

interface NeedItem {
  type: string;
  icon: React.ElementType;
  needed: number;
  fulfilled: number;
  color: string;
}

export function NeedsOverview() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">Tổng quan nhu cầu</h3>
        <div className="space-y-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const needs: NeedItem[] = [
    {
      type: "Laptop",
      icon: Laptop,
      needed: stats?.laptopNeeds.needed || 0,
      fulfilled: stats?.laptopNeeds.fulfilled || 0,
      color: "bg-primary",
    },
    {
      type: "Xe máy",
      icon: Bike,
      needed: stats?.motorbikeNeeds.needed || 0,
      fulfilled: stats?.motorbikeNeeds.fulfilled || 0,
      color: "bg-secondary",
    },
    {
      type: "Học phí",
      icon: GraduationCap,
      needed: stats?.tuitionNeeds.needed || 0,
      fulfilled: stats?.tuitionNeeds.fulfilled || 0,
      color: "bg-success",
    },
    {
      type: "Linh kiện",
      icon: Wrench,
      needed: stats?.componentNeeds.needed || 0,
      fulfilled: stats?.componentNeeds.fulfilled || 0,
      color: "bg-warning",
    },
  ];

  return (
    <div className="rounded-xl border bg-card p-6">
      <h3 className="mb-4 text-lg font-semibold text-foreground">Tổng quan nhu cầu</h3>
      <div className="space-y-5">
        {needs.map((need, index) => {
          const percentage = need.needed > 0 ? Math.round((need.fulfilled / need.needed) * 100) : 0;
          return (
            <div
              key={need.type}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <need.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">{need.type}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {need.fulfilled}/{need.needed} ({percentage}%)
                </span>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
