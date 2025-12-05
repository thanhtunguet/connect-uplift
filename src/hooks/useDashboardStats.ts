import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DashboardStats {
  // Donors
  totalDonors: number;
  activeDonors: number;
  
  // Students
  totalStudents: number;
  studentsReceivedSupport: number;
  
  // Laptops
  totalLaptops: number;
  availableLaptops: number;
  
  // Motorbikes
  totalMotorbikes: number;
  availableMotorbikes: number;
  
  // Applications
  newApplications: number; // Pending applications
  
  // Components
  componentsNeedingSupport: number; // Students who need components but haven't received
  
  // Needs overview
  laptopNeeds: {
    needed: number;
    fulfilled: number;
  };
  motorbikeNeeds: {
    needed: number;
    fulfilled: number;
  };
  tuitionNeeds: {
    needed: number;
    fulfilled: number;
  };
  componentNeeds: {
    needed: number;
    fulfilled: number;
  };
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async (): Promise<DashboardStats> => {
      // Fetch all stats in parallel
      const [
        donorsResult,
        activeDonorsResult,
        studentsResult,
        studentsReceivedResult,
        laptopsResult,
        availableLaptopsResult,
        motorbikesResult,
        availableMotorbikesResult,
        donorApplicationsResult,
        studentApplicationsResult,
        studentsNeedingComponentsResult,
        laptopNeededResult,
        laptopFulfilledResult,
        motorbikeNeededResult,
        motorbikeFulfilledResult,
        tuitionNeededResult,
        tuitionFulfilledResult,
        componentNeededResult,
        componentFulfilledResult,
      ] = await Promise.all([
        // Total donors
        supabase.from("donors").select("*", { count: "exact", head: true }),
        // Active donors
        supabase.from("donors").select("*", { count: "exact", head: true }).eq("is_active", true),
        // Total students
        supabase.from("students").select("*", { count: "exact", head: true }),
        // Students who received support
        supabase
          .from("students")
          .select("*", { count: "exact", head: true })
          .or("laptop_received.eq.true,motorbike_received.eq.true,tuition_supported.eq.true,components_received.eq.true"),
        // Total laptops
        supabase.from("laptops").select("*", { count: "exact", head: true }),
        // Available laptops
        supabase.from("laptops").select("*", { count: "exact", head: true }).eq("status", "available"),
        // Total motorbikes
        supabase.from("motorbikes").select("*", { count: "exact", head: true }),
        // Available motorbikes
        supabase.from("motorbikes").select("*", { count: "exact", head: true }).eq("status", "available"),
        // New donor applications (pending)
        supabase
          .from("donor_applications")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending"),
        // New student applications (pending)
        supabase
          .from("student_applications")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending"),
        // Students needing components
        supabase
          .from("students")
          .select("*", { count: "exact", head: true })
          .eq("need_components", true)
          .eq("components_received", false),
        // Laptop needs
        supabase.from("students").select("*", { count: "exact", head: true }).eq("need_laptop", true),
        supabase.from("students").select("*", { count: "exact", head: true }).eq("laptop_received", true),
        // Motorbike needs
        supabase.from("students").select("*", { count: "exact", head: true }).eq("need_motorbike", true),
        supabase.from("students").select("*", { count: "exact", head: true }).eq("motorbike_received", true),
        // Tuition needs
        supabase.from("students").select("*", { count: "exact", head: true }).eq("need_tuition", true),
        supabase.from("students").select("*", { count: "exact", head: true }).eq("tuition_supported", true),
        // Component needs
        supabase.from("students").select("*", { count: "exact", head: true }).eq("need_components", true),
        supabase.from("students").select("*", { count: "exact", head: true }).eq("components_received", true),
      ]);

      return {
        totalDonors: donorsResult.count || 0,
        activeDonors: activeDonorsResult.count || 0,
        totalStudents: studentsResult.count || 0,
        studentsReceivedSupport: studentsReceivedResult.count || 0,
        totalLaptops: laptopsResult.count || 0,
        availableLaptops: availableLaptopsResult.count || 0,
        totalMotorbikes: motorbikesResult.count || 0,
        availableMotorbikes: availableMotorbikesResult.count || 0,
        newApplications: (donorApplicationsResult.count || 0) + (studentApplicationsResult.count || 0),
        componentsNeedingSupport: studentsNeedingComponentsResult.count || 0,
        laptopNeeds: {
          needed: laptopNeededResult.count || 0,
          fulfilled: laptopFulfilledResult.count || 0,
        },
        motorbikeNeeds: {
          needed: motorbikeNeededResult.count || 0,
          fulfilled: motorbikeFulfilledResult.count || 0,
        },
        tuitionNeeds: {
          needed: tuitionNeededResult.count || 0,
          fulfilled: tuitionFulfilledResult.count || 0,
        },
        componentNeeds: {
          needed: componentNeededResult.count || 0,
          fulfilled: componentFulfilledResult.count || 0,
        },
      };
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
