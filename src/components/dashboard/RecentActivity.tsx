import { Laptop, Heart, GraduationCap, Bike, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRecentActivity } from "@/hooks/useRecentActivity";
import { Skeleton } from "@/components/ui/skeleton";

const iconMap = {
  laptop: Laptop,
  donor: Heart,
  student: GraduationCap,
  motorbike: Bike,
  component: Wrench,
};

const colorMap = {
  laptop: "bg-primary/10 text-primary",
  donor: "bg-secondary/10 text-secondary",
  student: "bg-success/10 text-success",
  motorbike: "bg-info/10 text-info",
  component: "bg-warning/10 text-warning",
};

export function RecentActivity() {
  const { data: activities, isLoading } = useRecentActivity(5);

  return (
    <div className="rounded-xl border bg-card p-6">
      <h3 className="mb-4 text-lg font-semibold text-foreground">Hoạt động gần đây</h3>
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-start gap-4">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      ) : activities && activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = iconMap[activity.type];
            return (
              <div
                key={activity.id}
                className="flex items-start gap-4 animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={cn("rounded-lg p-2", colorMap[activity.type])}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {activity.time}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-8">
          Chưa có hoạt động nào gần đây
        </p>
      )}
    </div>
  );
}
