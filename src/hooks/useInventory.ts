import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ============================================
// LAPTOP INVENTORY
// ============================================

export interface LaptopData {
  id: string;
  donor_id: string | null;
  student_id: string | null;
  brand: string | null;
  model: string | null;
  specifications: string | null;
  condition: string | null;
  notes: string | null;
  image_url: string | null;
  status: string;
  received_date: string;
  assigned_date: string | null;
  delivered_date: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  donor_name?: string;
  student_name?: string;
}

// Public laptop data (without sensitive donor/student info)
export interface PublicLaptopData {
  id: string;
  brand: string | null;
  model: string | null;
  specifications: string | null;
  condition: string | null;
  notes: string | null;
  image_url: string | null;
  status: string;
  received_date: string;
  created_at: string;
}

interface InventoryFilters {
  search?: string;
  status?: string | "all";
  donorId?: string;
  studentId?: string;
  page?: number;
  pageSize?: number;
}

interface LaptopsResult {
  data: LaptopData[];
  totalCount: number;
  totalPages: number;
}

export function useLaptops(filters: InventoryFilters = {}) {
  return useQuery({
    queryKey: ["laptops", filters],
    queryFn: async (): Promise<LaptopsResult> => {
      const { page = 1, pageSize = 10 } = filters;
      
      // First, get count for total items
      let countQuery = supabase
        .from("laptops")
        .select("*", { count: "exact", head: true });

      // Apply status filter to count query
      if (filters.status && filters.status !== "all") {
        countQuery = countQuery.eq("status", filters.status);
      }

      // Apply search filter to count query
      if (filters.search && filters.search.trim()) {
        const searchTerm = `%${filters.search.trim()}%`;
        countQuery = countQuery.or(
          `brand.ilike.${searchTerm},model.ilike.${searchTerm},specifications.ilike.${searchTerm},notes.ilike.${searchTerm}`
        );
      }

      // Apply donor filter to count query
      if (filters.donorId) {
        countQuery = countQuery.eq("donor_id", filters.donorId);
      }

      // Apply student filter to count query
      if (filters.studentId) {
        countQuery = countQuery.eq("student_id", filters.studentId);
      }

      const { count, error: countError } = await countQuery;

      if (countError) {
        console.error("Error fetching laptops count:", countError);
        throw countError;
      }

      // Now get the actual data with pagination
      let query = supabase
        .from("laptops")
        .select(`
          *,
          donors:donor_id(full_name),
          students:student_id(full_name)
        `)
        .order("created_at", { ascending: false });

      // Apply status filter
      if (filters.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      // Apply search filter
      if (filters.search && filters.search.trim()) {
        const searchTerm = `%${filters.search.trim()}%`;
        query = query.or(
          `brand.ilike.${searchTerm},model.ilike.${searchTerm},specifications.ilike.${searchTerm},notes.ilike.${searchTerm}`
        );
      }

      // Apply donor filter
      if (filters.donorId) {
        query = query.eq("donor_id", filters.donorId);
      }

      // Apply student filter
      if (filters.studentId) {
        query = query.eq("student_id", filters.studentId);
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching laptops:", error);
        throw error;
      }

      // Transform data to include donor and student names
      const transformedData = data.map((laptop: any) => ({
        ...laptop,
        donor_name: laptop.donors?.full_name || null,
        student_name: laptop.students?.full_name || null,
      })) as LaptopData[];

      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / pageSize);

      return {
        data: transformedData,
        totalCount,
        totalPages,
      };
    },
  });
}

export function useLaptop(id: string | null) {
  return useQuery({
    queryKey: ["laptop", id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from("laptops")
        .select(`
          *,
          donors:donor_id(full_name),
          students:student_id(full_name)
        `)
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching laptop:", error);
        throw error;
      }

      return {
        ...data,
        donor_name: data.donors?.full_name || null,
        student_name: data.students?.full_name || null,
      } as LaptopData;
    },
    enabled: !!id,
  });
}

// Public hook for fetching available laptops (no sensitive info)
interface PublicLaptopsResult {
  data: PublicLaptopData[];
  totalCount: number;
  totalPages: number;
}

export function usePublicLaptops(filters: { search?: string; page?: number; pageSize?: number } = {}) {
  return useQuery({
    queryKey: ["public-laptops", filters],
    queryFn: async (): Promise<PublicLaptopsResult> => {
      const { page = 1, pageSize = 12 } = filters;
      
      // Only fetch available laptops, no donor/student info
      // Use a specific column for count to avoid RLS issues with select("*")
      let countQuery = supabase
        .from("laptops")
        .select("id", { count: "exact", head: true })
        .eq("status", "available");

      // Apply search filter to count query
      if (filters.search && filters.search.trim()) {
        const searchTerm = `%${filters.search.trim()}%`;
        countQuery = countQuery.or(
          `brand.ilike.${searchTerm},model.ilike.${searchTerm},specifications.ilike.${searchTerm},notes.ilike.${searchTerm}`
        );
      }

      const { count, error: countError } = await countQuery;

      if (countError) {
        console.error("Error fetching public laptops count:", countError);
        console.error("Count query details:", { 
          status: "available",
          search: filters.search,
          errorCode: countError.code,
          errorMessage: countError.message,
          errorDetails: countError.details,
          errorHint: countError.hint
        });
        throw countError;
      }

      // Get the actual data with pagination (only public fields)
      let query = supabase
        .from("laptops")
        .select("id, brand, model, specifications, condition, notes, image_url, status, received_date, created_at")
        .eq("status", "available")
        .order("created_at", { ascending: false });

      // Apply search filter
      if (filters.search && filters.search.trim()) {
        const searchTerm = `%${filters.search.trim()}%`;
        query = query.or(
          `brand.ilike.${searchTerm},model.ilike.${searchTerm},specifications.ilike.${searchTerm},notes.ilike.${searchTerm}`
        );
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching public laptops:", error);
        console.error("Data query details:", {
          status: "available",
          search: filters.search,
          page,
          pageSize,
          from,
          to,
          errorCode: error.code,
          errorMessage: error.message,
          errorDetails: error.details,
          errorHint: error.hint
        });
        throw error;
      }

      console.log("Public laptops query result:", {
        count: data?.length || 0,
        totalCount: count,
        page,
        pageSize
      });

      const transformedData = (data || []).map((laptop: any) => ({
        id: laptop.id,
        brand: laptop.brand,
        model: laptop.model,
        specifications: laptop.specifications,
        condition: laptop.condition,
        notes: laptop.notes,
        image_url: laptop.image_url,
        status: laptop.status,
        received_date: laptop.received_date,
        created_at: laptop.created_at,
      })) as PublicLaptopData[];

      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / pageSize);

      return {
        data: transformedData,
        totalCount,
        totalPages,
      };
    },
  });
}

export function useUpdateLaptop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<LaptopData> }) => {
      const { data, error } = await supabase
        .from("laptops")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating laptop:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["laptops"] });
      queryClient.invalidateQueries({ queryKey: ["laptop"] });
      toast.success("Cập nhật laptop thành công");
    },
    onError: (error) => {
      console.error("Error updating laptop:", error);
      toast.error("Có lỗi xảy ra khi cập nhật laptop");
    },
  });
}

export function useCreateLaptop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newLaptop: Omit<LaptopData, "id" | "created_at" | "updated_at" | "donor_name" | "student_name">) => {
      const { data, error } = await supabase
        .from("laptops")
        .insert({
          ...newLaptop,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating laptop:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["laptops"] });
      toast.success("Thêm laptop thành công");
    },
    onError: (error) => {
      console.error("Error creating laptop:", error);
      toast.error("Có lỗi xảy ra khi thêm laptop");
    },
  });
}

// ============================================
// MOTORBIKE INVENTORY
// ============================================

export interface MotorbikeData {
  id: string;
  donor_id: string | null;
  student_id: string | null;
  brand: string | null;
  model: string | null;
  year: number | null;
  license_plate: string | null;
  condition: string | null;
  notes: string | null;
  status: string;
  received_date: string;
  assigned_date: string | null;
  delivered_date: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  donor_name?: string;
  student_name?: string;
}

interface MotorbikesResult {
  data: MotorbikeData[];
  totalCount: number;
  totalPages: number;
}

export function useMotorbikes(filters: InventoryFilters = {}) {
  return useQuery({
    queryKey: ["motorbikes", filters],
    queryFn: async (): Promise<MotorbikesResult> => {
      const { page = 1, pageSize = 10 } = filters;
      
      // First, get count for total items
      let countQuery = supabase
        .from("motorbikes")
        .select("*", { count: "exact", head: true });

      // Apply status filter to count query
      if (filters.status && filters.status !== "all") {
        countQuery = countQuery.eq("status", filters.status);
      }

      // Apply search filter to count query
      if (filters.search && filters.search.trim()) {
        const searchTerm = `%${filters.search.trim()}%`;
        countQuery = countQuery.or(
          `brand.ilike.${searchTerm},model.ilike.${searchTerm},license_plate.ilike.${searchTerm},notes.ilike.${searchTerm}`
        );
      }

      if (filters.donorId) {
        countQuery = countQuery.eq("donor_id", filters.donorId);
      }

      if (filters.studentId) {
        countQuery = countQuery.eq("student_id", filters.studentId);
      }

      const { count, error: countError } = await countQuery;

      if (countError) {
        console.error("Error fetching motorbikes count:", countError);
        throw countError;
      }

      // Now get the actual data with pagination
      let query = supabase
        .from("motorbikes")
        .select(`
          *,
          donors:donor_id(full_name),
          students:student_id(full_name)
        `)
        .order("created_at", { ascending: false });

      // Apply status filter
      if (filters.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      // Apply search filter
      if (filters.search && filters.search.trim()) {
        const searchTerm = `%${filters.search.trim()}%`;
        query = query.or(
          `brand.ilike.${searchTerm},model.ilike.${searchTerm},license_plate.ilike.${searchTerm},notes.ilike.${searchTerm}`
        );
      }

      if (filters.donorId) {
        query = query.eq("donor_id", filters.donorId);
      }

      if (filters.studentId) {
        query = query.eq("student_id", filters.studentId);
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching motorbikes:", error);
        throw error;
      }

      const transformedData = data.map((motorbike: any) => ({
        ...motorbike,
        donor_name: motorbike.donors?.full_name || null,
        student_name: motorbike.students?.full_name || null,
      })) as MotorbikeData[];

      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / pageSize);

      return {
        data: transformedData,
        totalCount,
        totalPages,
      };
    },
  });
}

export function useUpdateMotorbike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<MotorbikeData> }) => {
      const { data, error } = await supabase
        .from("motorbikes")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating motorbike:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["motorbikes"] });
      toast.success("Cập nhật xe máy thành công");
    },
    onError: (error) => {
      console.error("Error updating motorbike:", error);
      toast.error("Có lỗi xảy ra khi cập nhật xe máy");
    },
  });
}

export function useCreateMotorbike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newMotorbike: Omit<MotorbikeData, "id" | "created_at" | "updated_at" | "donor_name" | "student_name">) => {
      const { data, error } = await supabase
        .from("motorbikes")
        .insert({
          ...newMotorbike,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating motorbike:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["motorbikes"] });
      toast.success("Thêm xe máy thành công");
    },
    onError: (error) => {
      console.error("Error creating motorbike:", error);
      toast.error("Có lỗi xảy ra khi thêm xe máy");
    },
  });
}

// ============================================
// COMPONENTS INVENTORY
// ============================================

export interface ComponentData {
  id: string;
  component_code: number | null;
  donor_id: string | null;
  student_id: string | null;
  component_type: string;
  brand: string | null;
  model: string | null;
  specifications: string | null;
  condition: string | null;
  notes: string | null;
  purchase_link: string | null;
  delivery_address: string | null;
  delivery_phone: string | null;
  status: string;
  received_date: string;
  assigned_date: string | null;
  delivered_date: string | null;
  created_at: string;
  updated_at: string;
  support_registration_id?: string | null;
  // Joined data
  donor_name?: string;
  student_name?: string;
  support_registration?: {
    full_name: string;
    phone: string;
  } | null;
  // Computed fields
  supporter_name?: string;
  supporter_phone?: string;
}

interface ComponentsResult {
  data: ComponentData[];
  totalCount: number;
  totalPages: number;
}

export function useComponents(filters: InventoryFilters = {}) {
  return useQuery({
    queryKey: ["components", filters],
    queryFn: async (): Promise<ComponentsResult> => {
      const { page = 1, pageSize = 10 } = filters;
      
      // First, get count for total items
      let countQuery = supabase
        .from("components")
        .select("*", { count: "exact", head: true });

      // Apply status filter to count query
      if (filters.status && filters.status !== "all") {
        countQuery = countQuery.eq("status", filters.status);
      }

      // Apply search filter to count query
      if (filters.search && filters.search.trim()) {
        const searchTerm = `%${filters.search.trim()}%`;
        countQuery = countQuery.or(
          `component_type.ilike.${searchTerm},brand.ilike.${searchTerm},model.ilike.${searchTerm},specifications.ilike.${searchTerm},notes.ilike.${searchTerm}`
        );
      }

      if (filters.donorId) {
        countQuery = countQuery.eq("donor_id", filters.donorId);
      }

      if (filters.studentId) {
        countQuery = countQuery.eq("student_id", filters.studentId);
      }

      const { count, error: countError } = await countQuery;

      if (countError) {
        console.error("Error fetching components count:", countError);
        throw countError;
      }

      // Now get the actual data with pagination
      let query = supabase
        .from("components")
        .select(`
          *,
          donors:donor_id(full_name),
          students:student_id(full_name),
          donor_applications:support_registration_id(full_name, phone)
        `)
        .order("component_code", { ascending: false, nullsLast: true });

      // Apply status filter
      if (filters.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      // Apply search filter
      if (filters.search && filters.search.trim()) {
        const searchTerm = `%${filters.search.trim()}%`;
        query = query.or(
          `component_type.ilike.${searchTerm},brand.ilike.${searchTerm},model.ilike.${searchTerm},specifications.ilike.${searchTerm},notes.ilike.${searchTerm}`
        );
      }

      if (filters.donorId) {
        query = query.eq("donor_id", filters.donorId);
      }

      if (filters.studentId) {
        query = query.eq("student_id", filters.studentId);
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching components:", error);
        throw error;
      }

      // Get all support_registration_ids that are not null
      const supportRegistrationIds = data
        .filter((comp: any) => comp.support_registration_id)
        .map((comp: any) => comp.support_registration_id);

      // Fetch supporter information separately if needed
      let supporterMap: Record<string, { full_name: string; phone: string }> = {};
      
      if (supportRegistrationIds.length > 0) {
        // Try to get from nested query first
        const componentsWithSupport = data.filter((comp: any) => {
          const supportApp = comp.donor_applications;
          return supportApp && (Array.isArray(supportApp) ? supportApp.length > 0 : true);
        });

        // If nested query worked, use it
        componentsWithSupport.forEach((comp: any) => {
          const supportApp = comp.donor_applications;
          const supporterInfo = Array.isArray(supportApp) ? supportApp[0] : supportApp;
          if (supporterInfo && comp.support_registration_id) {
            supporterMap[comp.support_registration_id] = {
              full_name: supporterInfo.full_name,
              phone: supporterInfo.phone,
            };
          }
        });

        // For components without nested data, query separately
        const missingIds = supportRegistrationIds.filter(
          (id: string) => !supporterMap[id]
        );

        if (missingIds.length > 0) {
          const { data: supporterData, error: supporterError } = await supabase
            .from("donor_applications")
            .select("id, full_name, phone")
            .in("id", missingIds);

          if (!supporterError && supporterData) {
            supporterData.forEach((app: any) => {
              supporterMap[app.id] = {
                full_name: app.full_name,
                phone: app.phone,
              };
            });
          }
        }
      }

      const transformedData = data.map((component: any) => {
        const supporterInfo = component.support_registration_id
          ? supporterMap[component.support_registration_id]
          : null;
        
        return {
          ...component,
          donor_name: component.donors?.full_name || null,
          student_name: component.students?.full_name || null,
          supporter_name: supporterInfo?.full_name || null,
          supporter_phone: supporterInfo?.phone || null,
        };
      }) as ComponentData[];

      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / pageSize);

      return {
        data: transformedData,
        totalCount,
        totalPages,
      };
    },
  });
}

export function useComponent(id: string | null) {
  return useQuery({
    queryKey: ["component", id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from("components")
        .select(`
          *,
          donors:donor_id(full_name),
          students:student_id(full_name),
          donor_applications:support_registration_id(full_name, phone)
        `)
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching component:", error);
        throw error;
      }

      // Handle donor_applications - it might be an object or array
      const supportApp = data.donor_applications;
      const supporterInfo = Array.isArray(supportApp) 
        ? supportApp[0] 
        : supportApp;

      return {
        ...data,
        donor_name: data.donors?.full_name || null,
        student_name: data.students?.full_name || null,
        supporter_name: supporterInfo?.full_name || null,
        supporter_phone: supporterInfo?.phone || null,
      } as ComponentData;
    },
    enabled: !!id,
  });
}

export function useUpdateComponent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ComponentData> }) => {
      const { data, error } = await supabase
        .from("components")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating component:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["components"] });
      queryClient.invalidateQueries({ queryKey: ["component"] });
      toast.success("Cập nhật linh kiện thành công");
    },
    onError: (error) => {
      console.error("Error updating component:", error);
      toast.error("Có lỗi xảy ra khi cập nhật linh kiện");
    },
  });
}

export function useCreateComponent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newComponent: Omit<ComponentData, "id" | "created_at" | "updated_at" | "donor_name" | "student_name">) => {
      const { data, error } = await supabase
        .from("components")
        .insert({
          ...newComponent,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating component:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["components"] });
      toast.success("Thêm linh kiện thành công");
    },
    onError: (error) => {
      console.error("Error creating component:", error);
      toast.error("Có lỗi xảy ra khi thêm linh kiện");
    },
  });
}

// Public hook for fetching components that need support (no sensitive info)
interface PublicComponentData {
  id: string;
  component_code: number | null;
  component_type: string;
  brand: string | null;
  model: string | null;
  specifications: string | null;
  condition: string | null;
  notes: string | null;
  purchase_link: string | null;
  delivery_address: string | null;
  delivery_phone: string | null;
  status: string;
  received_date: string;
  created_at: string;
}

interface PublicComponentsResult {
  data: PublicComponentData[];
  totalCount: number;
  totalPages: number;
}

export function usePublicComponents(filters: { search?: string; page?: number; pageSize?: number } = {}) {
  return useQuery({
    queryKey: ["public-components", filters],
    queryFn: async (): Promise<PublicComponentsResult> => {
      const { page = 1, pageSize = 12 } = filters;
      
      // Only fetch components that need support
      let countQuery = supabase
        .from("components")
        .select("id", { count: "exact", head: true })
        .eq("status", "needs_support");

      // Apply search filter to count query
      if (filters.search && filters.search.trim()) {
        const searchTerm = `%${filters.search.trim()}%`;
        countQuery = countQuery.or(
          `component_type.ilike.${searchTerm},brand.ilike.${searchTerm},model.ilike.${searchTerm},specifications.ilike.${searchTerm},notes.ilike.${searchTerm}`
        );
      }

      const { count, error: countError } = await countQuery;

      if (countError) {
        console.error("Error fetching public components count:", countError);
        console.error("Count query details:", { 
          status: "needs_support",
          search: filters.search,
          errorCode: countError.code,
          errorMessage: countError.message,
          errorDetails: countError.details,
          errorHint: countError.hint
        });
        throw countError;
      }

      // Get the actual data with pagination (only public fields)
      let query = supabase
        .from("components")
        .select("id, component_code, component_type, brand, model, specifications, condition, notes, purchase_link, delivery_address, delivery_phone, status, received_date, created_at")
        .eq("status", "needs_support")
        .order("component_code", { ascending: false, nullsLast: true });

      // Apply search filter
      if (filters.search && filters.search.trim()) {
        const searchTerm = `%${filters.search.trim()}%`;
        query = query.or(
          `component_type.ilike.${searchTerm},brand.ilike.${searchTerm},model.ilike.${searchTerm},specifications.ilike.${searchTerm},notes.ilike.${searchTerm}`
        );
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching public components:", error);
        console.error("Data query details:", {
          status: "needs_support",
          search: filters.search,
          page,
          pageSize,
          from,
          to,
          errorCode: error.code,
          errorMessage: error.message,
          errorDetails: error.details,
          errorHint: error.hint
        });
        throw error;
      }

      console.log("Public components query result:", {
        count: data?.length || 0,
        totalCount: count,
        page,
        pageSize
      });

      const transformedData = (data || []).map((component: any) => ({
        id: component.id,
        component_code: component.component_code,
        component_type: component.component_type,
        brand: component.brand,
        model: component.model,
        specifications: component.specifications,
        condition: component.condition,
        notes: component.notes,
        purchase_link: component.purchase_link,
        delivery_address: component.delivery_address,
        delivery_phone: component.delivery_phone,
        status: component.status,
        received_date: component.received_date,
        created_at: component.created_at,
      })) as PublicComponentData[];

      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / pageSize);

      return {
        data: transformedData,
        totalCount,
        totalPages,
      };
    },
  });
}

// ============================================
// TUITION SUPPORT
// ============================================

export interface TuitionSupportData {
  id: string;
  donor_id: string | null;
  student_id: string | null;
  amount: number;
  frequency: string;
  academic_year: string | null;
  semester: number | null;
  notes: string | null;
  status: string;
  pledged_date: string;
  paid_date: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  donor_name?: string;
  student_name?: string;
}

interface TuitionSupportResult {
  data: TuitionSupportData[];
  totalCount: number;
  totalPages: number;
}

export function useTuitionSupport(filters: InventoryFilters = {}) {
  return useQuery({
    queryKey: ["tuition-support", filters],
    queryFn: async (): Promise<TuitionSupportResult> => {
      const { page = 1, pageSize = 10 } = filters;
      
      // First, get count for total items
      let countQuery = supabase
        .from("tuition_support")
        .select("*", { count: "exact", head: true });

      // Apply status filter to count query
      if (filters.status && filters.status !== "all") {
        countQuery = countQuery.eq("status", filters.status);
      }

      // Apply search filter to count query
      if (filters.search && filters.search.trim()) {
        const searchTerm = `%${filters.search.trim()}%`;
        countQuery = countQuery.or(
          `notes.ilike.${searchTerm},academic_year.ilike.${searchTerm}`
        );
      }

      if (filters.donorId) {
        countQuery = countQuery.eq("donor_id", filters.donorId);
      }

      if (filters.studentId) {
        countQuery = countQuery.eq("student_id", filters.studentId);
      }

      const { count, error: countError } = await countQuery;

      if (countError) {
        console.error("Error fetching tuition support count:", countError);
        throw countError;
      }

      // Now get the actual data with pagination
      let query = supabase
        .from("tuition_support")
        .select(`
          *,
          donors:donor_id(full_name),
          students:student_id(full_name)
        `)
        .order("created_at", { ascending: false });

      // Apply status filter
      if (filters.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      // Apply search filter
      if (filters.search && filters.search.trim()) {
        const searchTerm = `%${filters.search.trim()}%`;
        query = query.or(
          `notes.ilike.${searchTerm},academic_year.ilike.${searchTerm}`
        );
      }

      if (filters.donorId) {
        query = query.eq("donor_id", filters.donorId);
      }

      if (filters.studentId) {
        query = query.eq("student_id", filters.studentId);
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching tuition support:", error);
        throw error;
      }

      const transformedData = data.map((tuition: any) => ({
        ...tuition,
        donor_name: tuition.donors?.full_name || null,
        student_name: tuition.students?.full_name || null,
      })) as TuitionSupportData[];

      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / pageSize);

      return {
        data: transformedData,
        totalCount,
        totalPages,
      };
    },
  });
}

export function useUpdateTuitionSupport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<TuitionSupportData> }) => {
      const { data, error } = await supabase
        .from("tuition_support")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating tuition support:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tuition-support"] });
      toast.success("Cập nhật hỗ trợ học phí thành công");
    },
    onError: (error) => {
      console.error("Error updating tuition support:", error);
      toast.error("Có lỗi xảy ra khi cập nhật hỗ trợ học phí");
    },
  });
}

export function useCreateTuitionSupport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newTuition: Omit<TuitionSupportData, "id" | "created_at" | "updated_at" | "donor_name" | "student_name">) => {
      const { data, error } = await supabase
        .from("tuition_support")
        .insert({
          ...newTuition,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating tuition support:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tuition-support"] });
      toast.success("Thêm hỗ trợ học phí thành công");
    },
    onError: (error) => {
      console.error("Error creating tuition support:", error);
      toast.error("Có lỗi xảy ra khi thêm hỗ trợ học phí");
    },
  });
}
