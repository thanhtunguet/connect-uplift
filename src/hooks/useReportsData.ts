import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  addDays,
  addMonths,
  format,
  startOfDay,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns";
import { vi } from "date-fns/locale";

type SupportType = "laptop" | "motorbike" | "components" | "tuition";
type WeeklyMetricKey = "laptops" | "motorbikes" | "students" | "donors";

const DAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"] as const;
const SUPPORT_COLORS: Record<SupportType, string> = {
  laptop: "hsl(25, 95%, 53%)",
  motorbike: "hsl(174, 60%, 40%)",
  components: "hsl(45, 93%, 47%)",
  tuition: "hsl(142, 76%, 36%)",
};

const formatDayLabel = (date: Date) => DAY_LABELS[date.getDay()];
const getDateKey = (date: Date) => format(startOfDay(date), "yyyy-MM-dd");
const resolveDate = (...values: Array<string | null>): Date | null => {
  for (const value of values) {
    if (value) {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }
  }
  return null;
};

export interface WeeklyDataPoint {
  name: string;
  date: string;
  laptops: number;
  motorbikes: number;
  students: number;
  donors: number;
}

export interface MonthlyTrendPoint {
  name: string;
  value: number;
}

export interface SupportBreakdownRow {
  key: SupportType;
  label: string;
  completed: number;
  inProgress: number;
  pending: number;
}

export interface ReportsSummary {
  totalSupports: number;
  newStudents: number;
  newDonors: number;
  laptopsDelivered: number;
  motorbikesDelivered: number;
  componentsDelivered: number;
  tuitionEvents: number;
  tuitionAmount: number;
}

export interface MonthlyStats {
  supportsCompleted: number;
  studentsSupported: number;
  newDonors: number;
  tuitionAmount: number;
  newStudents: number;
}

export interface ReportsData {
  summary: ReportsSummary;
  weeklyData: WeeklyDataPoint[];
  monthlyTrend: MonthlyTrendPoint[];
  distribution: { name: string; value: number; color: string }[];
  weeklyBreakdown: SupportBreakdownRow[];
  monthlyStats: MonthlyStats;
}

export function useReportsData() {
  return useQuery({
    queryKey: ["reports-data"],
    queryFn: async (): Promise<ReportsData> => {
      const now = new Date();
      const weekStart = startOfDay(subDays(now, 6));
      const sixMonthsAgo = startOfMonth(subMonths(now, 5));
      const currentMonthStart = startOfMonth(now);

      const weeklyBuckets = new Map<string, WeeklyDataPoint>();
      for (let i = 0; i < 7; i++) {
        const date = addDays(weekStart, i);
        const key = getDateKey(date);
        weeklyBuckets.set(key, {
          name: formatDayLabel(date),
          date: key,
          laptops: 0,
          motorbikes: 0,
          students: 0,
          donors: 0,
        });
      }

      const monthlyBuckets = Array.from({ length: 6 }).map((_, index) => {
        const monthDate = startOfMonth(subMonths(now, 5 - index));
        return {
          start: monthDate,
          end: startOfMonth(addMonths(monthDate, 1)),
          name: format(monthDate, "LLL", { locale: vi }).toUpperCase(),
          value: 0,
        };
      });

      const [
        studentsResponse,
        donorsResponse,
        laptopsResponse,
        motorbikesResponse,
        componentsResponse,
        tuitionResponse,
        pendingLaptopResponse,
        pendingMotorbikeResponse,
        pendingTuitionResponse,
        pendingComponentsResponse,
        laptopsInProgressResponse,
        motorbikesInProgressResponse,
        componentsInProgressResponse,
        tuitionInProgressResponse,
      ] = await Promise.all([
        supabase
          .from("students")
          .select("id, created_at")
          .gte("created_at", sixMonthsAgo.toISOString()),
        supabase
          .from("donors")
          .select("id, created_at")
          .gte("created_at", sixMonthsAgo.toISOString()),
        supabase
          .from("laptops")
          .select("id, student_id, status, assigned_date, delivered_date, updated_at")
          .or(`assigned_date.gte.${sixMonthsAgo.toISOString()},delivered_date.gte.${sixMonthsAgo.toISOString()},updated_at.gte.${sixMonthsAgo.toISOString()}`)
          .order("updated_at", { ascending: false })
          .limit(1000),
        supabase
          .from("motorbikes")
          .select("id, student_id, status, assigned_date, delivered_date, updated_at")
          .or(`assigned_date.gte.${sixMonthsAgo.toISOString()},delivered_date.gte.${sixMonthsAgo.toISOString()},updated_at.gte.${sixMonthsAgo.toISOString()}`)
          .order("updated_at", { ascending: false })
          .limit(1000),
        supabase
          .from("components")
          .select("id, student_id, status, assigned_date, delivered_date, updated_at")
          .or(`assigned_date.gte.${sixMonthsAgo.toISOString()},delivered_date.gte.${sixMonthsAgo.toISOString()},updated_at.gte.${sixMonthsAgo.toISOString()}`)
          .order("updated_at", { ascending: false })
          .limit(1000),
        supabase
          .from("tuition_support")
          .select("id, student_id, amount, status, pledged_date, paid_date, start_date, updated_at")
          .or(`pledged_date.gte.${sixMonthsAgo.toISOString()},paid_date.gte.${sixMonthsAgo.toISOString()},start_date.gte.${sixMonthsAgo.toISOString()},updated_at.gte.${sixMonthsAgo.toISOString()}`)
          .order("updated_at", { ascending: false })
          .limit(1000),
        supabase
          .from("students")
          .select("*", { count: "exact", head: true })
          .eq("need_laptop", true)
          .eq("laptop_received", false),
        supabase
          .from("students")
          .select("*", { count: "exact", head: true })
          .eq("need_motorbike", true)
          .eq("motorbike_received", false),
        supabase
          .from("students")
          .select("*", { count: "exact", head: true })
          .eq("need_tuition", true)
          .eq("tuition_supported", false),
        supabase
          .from("students")
          .select("*", { count: "exact", head: true })
          .eq("need_components", true)
          .eq("components_received", false),
        supabase
          .from("laptops")
          .select("*", { count: "exact", head: true })
          .eq("status", "assigned"),
        supabase
          .from("motorbikes")
          .select("*", { count: "exact", head: true })
          .eq("status", "assigned"),
        supabase
          .from("components")
          .select("*", { count: "exact", head: true })
          .eq("status", "assigned"),
        supabase
          .from("tuition_support")
          .select("*", { count: "exact", head: true })
          .eq("status", "pledged"),
      ]);

      if (studentsResponse.error) throw studentsResponse.error;
      if (donorsResponse.error) throw donorsResponse.error;
      if (laptopsResponse.error) throw laptopsResponse.error;
      if (motorbikesResponse.error) throw motorbikesResponse.error;
      if (componentsResponse.error) throw componentsResponse.error;
      if (tuitionResponse.error) throw tuitionResponse.error;
      if (pendingLaptopResponse.error) throw pendingLaptopResponse.error;
      if (pendingMotorbikeResponse.error) throw pendingMotorbikeResponse.error;
      if (pendingTuitionResponse.error) throw pendingTuitionResponse.error;
      if (pendingComponentsResponse.error) throw pendingComponentsResponse.error;
      if (laptopsInProgressResponse.error) throw laptopsInProgressResponse.error;
      if (motorbikesInProgressResponse.error) throw motorbikesInProgressResponse.error;
      if (componentsInProgressResponse.error) throw componentsInProgressResponse.error;
      if (tuitionInProgressResponse.error) throw tuitionInProgressResponse.error;

      const students = studentsResponse.data ?? [];
      const donors = donorsResponse.data ?? [];
      const laptops = laptopsResponse.data ?? [];
      const motorbikes = motorbikesResponse.data ?? [];
      const components = componentsResponse.data ?? [];
      const tuition = tuitionResponse.data ?? [];

      const incrementWeeklyBucket = (date: Date | null, field: WeeklyMetricKey) => {
        if (!date || date < weekStart) return;
        const bucket = weeklyBuckets.get(getDateKey(date));
        if (bucket) {
          bucket[field] += 1;
        }
      };

      let newStudentsWeek = 0;
      let newDonorsWeek = 0;
      let newStudentsMonth = 0;
      let newDonorsMonth = 0;

      students.forEach((student: { created_at: string }) => {
        const createdDate = new Date(student.created_at);
        if (createdDate >= weekStart) {
          newStudentsWeek += 1;
          incrementWeeklyBucket(createdDate, "students");
        }
        if (createdDate >= currentMonthStart) {
          newStudentsMonth += 1;
        }
      });

      donors.forEach((donor: { created_at: string }) => {
        const createdDate = new Date(donor.created_at);
        if (createdDate >= weekStart) {
          newDonorsWeek += 1;
          incrementWeeklyBucket(createdDate, "donors");
        }
        if (createdDate >= currentMonthStart) {
          newDonorsMonth += 1;
        }
      });

      const weeklySupportTotals: Record<SupportType, number> = {
        laptop: 0,
        motorbike: 0,
        components: 0,
        tuition: 0,
      };

      const distributionTotals: Record<SupportType, number> = {
        laptop: 0,
        motorbike: 0,
        components: 0,
        tuition: 0,
      };

      let weeklyTuitionAmount = 0;
      let monthlySupportsCompleted = 0;
      let monthlyTuitionAmount = 0;
      const studentsSupportedThisMonth = new Set<string>();

      const registerSupportEvent = ({
        date,
        type,
        studentId,
        amount = 0,
      }: {
        date: Date | null;
        type: SupportType;
        studentId?: string | null;
        amount?: number;
      }) => {
        if (!date || isNaN(date.getTime()) || date < sixMonthsAgo) return;

        if (date >= weekStart) {
          weeklySupportTotals[type] += 1;
          if (type === "tuition") {
            weeklyTuitionAmount += amount;
          }
        }

        distributionTotals[type] += 1;

        for (const bucket of monthlyBuckets) {
          if (date >= bucket.start && date < bucket.end) {
            bucket.value += 1;
            break;
          }
        }

        if (date >= currentMonthStart) {
          monthlySupportsCompleted += 1;
          if (studentId) {
            studentsSupportedThisMonth.add(studentId);
          }
          if (type === "tuition") {
            monthlyTuitionAmount += amount;
          }
        }
      };

      laptops.forEach(
        (laptop: {
          status: string;
          delivered_date: string | null;
          assigned_date: string | null;
          updated_at: string | null;
          student_id?: string | null;
        }) => {
          if (!["assigned", "delivered"].includes(laptop.status)) return;
          const eventDate = resolveDate(laptop.delivered_date, laptop.assigned_date, laptop.updated_at);
          registerSupportEvent({ date: eventDate, type: "laptop", studentId: laptop.student_id ?? null });
          incrementWeeklyBucket(eventDate, "laptops");
        }
      );

      motorbikes.forEach(
        (motorbike: {
          status: string;
          delivered_date: string | null;
          assigned_date: string | null;
          updated_at: string | null;
          student_id?: string | null;
        }) => {
          if (!["assigned", "delivered"].includes(motorbike.status)) return;
          const eventDate = resolveDate(motorbike.delivered_date, motorbike.assigned_date, motorbike.updated_at);
          registerSupportEvent({ date: eventDate, type: "motorbike", studentId: motorbike.student_id ?? null });
          incrementWeeklyBucket(eventDate, "motorbikes");
        }
      );

      components.forEach(
        (component: {
          status: string;
          delivered_date: string | null;
          assigned_date: string | null;
          updated_at: string | null;
          student_id?: string | null;
        }) => {
          if (!["assigned", "delivered", "installed"].includes(component.status)) return;
          const eventDate = resolveDate(component.delivered_date, component.assigned_date, component.updated_at);
          registerSupportEvent({ date: eventDate, type: "components", studentId: component.student_id ?? null });
        }
      );

      tuition.forEach(
        (tuitionRecord: {
          status: string;
          paid_date: string | null;
          pledged_date: string | null;
          start_date: string | null;
          updated_at: string | null;
          student_id?: string | null;
          amount: number | string | null;
        }) => {
          if (!["pledged", "paid", "completed"].includes(tuitionRecord.status)) return;
          const eventDate = resolveDate(tuitionRecord.paid_date, tuitionRecord.pledged_date, tuitionRecord.start_date, tuitionRecord.updated_at);
          const amount = Number(tuitionRecord.amount) || 0;
          registerSupportEvent({
            date: eventDate,
            type: "tuition",
            studentId: tuitionRecord.student_id ?? null,
            amount,
          });
        }
      );

      const summary: ReportsSummary = {
        totalSupports:
          weeklySupportTotals.laptop +
          weeklySupportTotals.motorbike +
          weeklySupportTotals.components +
          weeklySupportTotals.tuition,
        newStudents: newStudentsWeek,
        newDonors: newDonorsWeek,
        laptopsDelivered: weeklySupportTotals.laptop,
        motorbikesDelivered: weeklySupportTotals.motorbike,
        componentsDelivered: weeklySupportTotals.components,
        tuitionEvents: weeklySupportTotals.tuition,
        tuitionAmount: weeklyTuitionAmount,
      };

      const weeklyBreakdown: SupportBreakdownRow[] = [
        {
          key: "laptop",
          label: "Laptop",
          completed: weeklySupportTotals.laptop,
          inProgress: laptopsInProgressResponse.count ?? 0,
          pending: pendingLaptopResponse.count ?? 0,
        },
        {
          key: "motorbike",
          label: "Xe máy",
          completed: weeklySupportTotals.motorbike,
          inProgress: motorbikesInProgressResponse.count ?? 0,
          pending: pendingMotorbikeResponse.count ?? 0,
        },
        {
          key: "components",
          label: "Linh kiện",
          completed: weeklySupportTotals.components,
          inProgress: componentsInProgressResponse.count ?? 0,
          pending: pendingComponentsResponse.count ?? 0,
        },
        {
          key: "tuition",
          label: "Học phí",
          completed: weeklySupportTotals.tuition,
          inProgress: tuitionInProgressResponse.count ?? 0,
          pending: pendingTuitionResponse.count ?? 0,
        },
      ];

      const monthlyStats: MonthlyStats = {
        supportsCompleted: monthlySupportsCompleted,
        studentsSupported: studentsSupportedThisMonth.size,
        newDonors: newDonorsMonth,
        tuitionAmount: monthlyTuitionAmount,
        newStudents: newStudentsMonth,
      };

      return {
        summary,
        weeklyData: Array.from(weeklyBuckets.values()),
        monthlyTrend: monthlyBuckets.map((bucket) => ({
          name: bucket.name,
          value: bucket.value,
        })),
        distribution: [
          { name: "Laptop", value: distributionTotals.laptop, color: SUPPORT_COLORS.laptop },
          { name: "Xe máy", value: distributionTotals.motorbike, color: SUPPORT_COLORS.motorbike },
          { name: "Học phí", value: distributionTotals.tuition, color: SUPPORT_COLORS.tuition },
          { name: "Linh kiện", value: distributionTotals.components, color: SUPPORT_COLORS.components },
        ],
        weeklyBreakdown,
        monthlyStats,
      };
    },
    refetchInterval: 60000,
  });
}
