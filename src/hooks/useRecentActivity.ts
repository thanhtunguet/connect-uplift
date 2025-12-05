import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

export interface RecentActivityItem {
  id: string;
  type: "laptop" | "donor" | "student" | "motorbike" | "component";
  title: string;
  description: string;
  time: string;
  timestamp: string;
}

export function useRecentActivity(limit: number = 5) {
  return useQuery({
    queryKey: ["recent-activity", limit],
    queryFn: async (): Promise<RecentActivityItem[]> => {
      const activities: RecentActivityItem[] = [];

      try {
        // Fetch recent laptops (recently assigned or delivered)
        const { data: recentLaptops, error: laptopsError } = await supabase
        .from("laptops")
        .select("id, brand, model, status, assigned_date, delivered_date, updated_at, students:student_id(full_name)")
        .or("status.eq.assigned,status.eq.delivered")
        .order("updated_at", { ascending: false })
        .limit(limit);

        if (laptopsError) {
          console.error("Error fetching recent laptops:", laptopsError);
        }

        if (recentLaptops) {
        recentLaptops.forEach((laptop: any) => {
          const laptopName = laptop.brand && laptop.model 
            ? `${laptop.brand} ${laptop.model}`
            : laptop.brand || laptop.model || "Laptop";
          
          const studentName = laptop.students?.full_name || (Array.isArray(laptop.students) && laptop.students[0]?.full_name);
          
          if (laptop.status === "delivered" && studentName) {
            activities.push({
              id: `laptop-${laptop.id}`,
              type: "laptop",
              title: laptopName,
              description: `Đã tặng cho ${studentName}`,
              time: formatDistanceToNow(new Date(laptop.updated_at), { addSuffix: true, locale: vi }),
              timestamp: laptop.updated_at,
            });
          } else if (laptop.status === "assigned") {
            activities.push({
              id: `laptop-${laptop.id}`,
              type: "laptop",
              title: laptopName,
              description: "Đã được phân bổ",
              time: formatDistanceToNow(new Date(laptop.updated_at), { addSuffix: true, locale: vi }),
              timestamp: laptop.updated_at,
            });
          }
        });
      }

        // Fetch recent donors (newly created)
        const { data: recentDonors, error: donorsError } = await supabase
          .from("donors")
          .select("id, full_name, created_at")
          .order("created_at", { ascending: false })
          .limit(limit);

        if (donorsError) {
          console.error("Error fetching recent donors:", donorsError);
        }

        if (recentDonors) {
        recentDonors.forEach((donor: any) => {
          activities.push({
            id: `donor-${donor.id}`,
            type: "donor",
            title: donor.full_name,
            description: "Đăng ký mới làm nhà hảo tâm",
            time: formatDistanceToNow(new Date(donor.created_at), { addSuffix: true, locale: vi }),
            timestamp: donor.created_at,
          });
        });
      }

        // Fetch recent students (newly created or received items)
        const { data: recentStudents, error: studentsError } = await supabase
          .from("students")
          .select("id, full_name, laptop_received_date, motorbike_received_date, created_at, updated_at")
          .or("laptop_received.eq.true,motorbike_received.eq.true")
          .order("updated_at", { ascending: false })
          .limit(limit);

        if (studentsError) {
          console.error("Error fetching recent students:", studentsError);
        }

        if (recentStudents) {
        recentStudents.forEach((student: any) => {
          if (student.laptop_received_date) {
            activities.push({
              id: `student-laptop-${student.id}`,
              type: "student",
              title: student.full_name,
              description: "Đã nhận laptop",
              time: formatDistanceToNow(new Date(student.laptop_received_date), { addSuffix: true, locale: vi }),
              timestamp: student.laptop_received_date,
            });
          }
          if (student.motorbike_received_date) {
            activities.push({
              id: `student-motorbike-${student.id}`,
              type: "student",
              title: student.full_name,
              description: "Đã nhận xe máy",
              time: formatDistanceToNow(new Date(student.motorbike_received_date), { addSuffix: true, locale: vi }),
              timestamp: student.motorbike_received_date,
            });
          }
        });
      }

        // Fetch recent motorbikes (recently assigned or delivered)
        const { data: recentMotorbikes, error: motorbikesError } = await supabase
          .from("motorbikes")
          .select("id, brand, model, status, assigned_date, delivered_date, updated_at, students:student_id(full_name)")
          .or("status.eq.assigned,status.eq.delivered")
          .order("updated_at", { ascending: false })
          .limit(limit);

        if (motorbikesError) {
          console.error("Error fetching recent motorbikes:", motorbikesError);
        }

        if (recentMotorbikes) {
        recentMotorbikes.forEach((motorbike: any) => {
          const motorbikeName = motorbike.brand && motorbike.model 
            ? `${motorbike.brand} ${motorbike.model}`
            : motorbike.brand || motorbike.model || "Xe máy";
          
          const studentName = motorbike.students?.full_name || (Array.isArray(motorbike.students) && motorbike.students[0]?.full_name);
          
          if (motorbike.status === "delivered" && studentName) {
            activities.push({
              id: `motorbike-${motorbike.id}`,
              type: "motorbike",
              title: motorbikeName,
              description: `Đã tặng cho ${studentName}`,
              time: formatDistanceToNow(new Date(motorbike.updated_at), { addSuffix: true, locale: vi }),
              timestamp: motorbike.updated_at,
            });
          }
        });
      }

        // Fetch recent components (recently assigned)
        const { data: recentComponents, error: componentsError } = await supabase
          .from("components")
          .select("id, component_type, brand, status, assigned_date, updated_at, students:student_id(full_name)")
          .eq("status", "assigned")
          .order("updated_at", { ascending: false })
          .limit(limit);

        if (componentsError) {
          console.error("Error fetching recent components:", componentsError);
        }

        if (recentComponents) {
        recentComponents.forEach((component: any) => {
          const componentName = component.component_type || "Linh kiện";
          const studentName = component.students?.full_name || (Array.isArray(component.students) && component.students[0]?.full_name);
          activities.push({
            id: `component-${component.id}`,
            type: "component",
            title: componentName,
            description: studentName ? `Đã nhận từ ${studentName}` : "Đã được phân bổ",
            time: formatDistanceToNow(new Date(component.updated_at), { addSuffix: true, locale: vi }),
            timestamp: component.updated_at,
          });
        });
      }

        // Sort by timestamp and limit
        return activities
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, limit);
      } catch (error) {
        console.error("Error fetching recent activity:", error);
        return [];
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
