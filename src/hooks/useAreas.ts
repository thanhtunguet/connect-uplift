import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AreaData {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AreaFilters {
  search?: string;
  isActive?: boolean | "all";
  page?: number;
  pageSize?: number;
}

interface AreasResult {
  data: AreaData[];
  totalCount: number;
  totalPages: number;
}

export function useAreas(filters: AreaFilters = {}) {
  return useQuery({
    queryKey: ["areas", filters],
    queryFn: async (): Promise<AreasResult> => {
      const { page = 1, pageSize = 10 } = filters;
      
      // First, get count for total items
      let countQuery = supabase
        .from("areas")
        .select("*", { count: "exact", head: true });

      // Apply search filter to count query
      if (filters.search && filters.search.trim()) {
        const searchTerm = `%${filters.search.trim()}%`;
        countQuery = countQuery.or(
          `name.ilike.${searchTerm},description.ilike.${searchTerm}`
        );
      }

      // Apply active status filter to count query
      if (typeof filters.isActive === "boolean") {
        countQuery = countQuery.eq("is_active", filters.isActive);
      }

      const { count, error: countError } = await countQuery;

      if (countError) {
        console.error("Error fetching areas count:", countError);
        throw countError;
      }

      // Now get the actual data with pagination
      let query = supabase
        .from("areas")
        .select("*")
        .order("name", { ascending: true });

      // Apply search filter
      if (filters.search && filters.search.trim()) {
        const searchTerm = `%${filters.search.trim()}%`;
        query = query.or(
          `name.ilike.${searchTerm},description.ilike.${searchTerm}`
        );
      }

      // Apply active status filter
      if (typeof filters.isActive === "boolean") {
        query = query.eq("is_active", filters.isActive);
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching areas:", error);
        throw error;
      }

      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / pageSize);

      return {
        data: data as AreaData[],
        totalCount,
        totalPages,
      };
    },
  });
}

export function useArea(id: string | null) {
  return useQuery({
    queryKey: ["area", id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from("areas")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching area:", error);
        throw error;
      }

      return data as AreaData;
    },
    enabled: !!id,
  });
}

interface CreateAreaParams {
  area: Omit<AreaData, "id" | "created_at" | "updated_at">;
}

export function useCreateArea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ area }: CreateAreaParams) => {
      const { data, error } = await supabase
        .from("areas")
        .insert({
          ...area,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating area:", error);
        throw error;
      }

      return data as AreaData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["areas"] });
      toast.success("Thêm khu vực thành công");
    },
    onError: (error) => {
      console.error("Error creating area:", error);
      toast.error("Có lỗi xảy ra khi thêm khu vực");
    },
  });
}

interface UpdateAreaParams {
  id: string;
  updates: Partial<Omit<AreaData, "id" | "created_at" | "updated_at">>;
}

export function useUpdateArea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: UpdateAreaParams) => {
      const { data, error } = await supabase
        .from("areas")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating area:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["areas"] });
      queryClient.invalidateQueries({ queryKey: ["area"] });
      toast.success("Cập nhật khu vực thành công");
    },
    onError: (error) => {
      console.error("Error updating area:", error);
      toast.error("Có lỗi xảy ra khi cập nhật khu vực");
    },
  });
}

export function useToggleAreaActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { data, error } = await supabase
        .from("areas")
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error toggling area active status:", error);
        throw error;
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["areas"] });
      queryClient.invalidateQueries({ queryKey: ["area"] });
      const statusText = variables.isActive ? "kích hoạt" : "vô hiệu hóa";
      toast.success(`Đã ${statusText} khu vực`);
    },
    onError: (error) => {
      console.error("Error toggling area active status:", error);
      toast.error("Có lỗi xảy ra khi thay đổi trạng thái");
    },
  });
}

interface DeleteAreaParams {
  id: string;
}

export function useDeleteArea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: DeleteAreaParams) => {
      const { error } = await supabase.from("areas").delete().eq("id", id);

      if (error) {
        console.error("Error deleting area:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["areas"] });
      toast.success("Đã xóa khu vực");
    },
    onError: (error) => {
      console.error("Error deleting area:", error);
      toast.error("Có lỗi xảy ra khi xóa khu vực");
    },
  });
}
