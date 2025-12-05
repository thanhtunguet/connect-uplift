import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ApplicationStatus } from "@/types/applications";

export interface DonorApplicationData {
  id: string;
  full_name: string;
  birth_year: number;
  phone: string;
  address: string;
  facebook_link: string | null;
  support_types: string[];
  support_frequency: string;
  support_details: string | null;
  laptop_quantity: number | null;
  motorbike_quantity: number | null;
  components_quantity: number | null;
  tuition_amount: number | null;
  tuition_frequency: string | null;
  status: ApplicationStatus;
  rejection_reason: string | null;
  notes: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentApplicationData {
  id: string;
  full_name: string;
  birth_year: number;
  phone: string;
  address: string;
  facebook_link: string | null;
  academic_year: string;
  difficult_situation: string;
  need_laptop: boolean;
  need_motorbike: boolean;
  need_tuition: boolean;
  need_components: boolean;
  components_details: string | null;
  status: ApplicationStatus;
  rejection_reason: string | null;
  verification_notes: string | null;
  notes: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
}

interface ApplicationFilters {
  search?: string;
  status?: ApplicationStatus | "all";
  page?: number;
  pageSize?: number;
}

interface DonorApplicationsResult {
  data: DonorApplicationData[];
  totalCount: number;
  totalPages: number;
}

interface StudentApplicationsResult {
  data: StudentApplicationData[];
  totalCount: number;
  totalPages: number;
}

export function useDonorApplications(filters: ApplicationFilters = {}) {
  return useQuery({
    queryKey: ["donor-applications", filters],
    queryFn: async (): Promise<DonorApplicationsResult> => {
      const { page = 1, pageSize = 10 } = filters;
      
      // First, get count for total items
      let countQuery = supabase
        .from("donor_applications")
        .select("*", { count: "exact", head: true });

      // Apply filters to count query
      if (filters.status && filters.status !== "all") {
        countQuery = countQuery.eq("status", filters.status);
      }

      if (filters.search && filters.search.trim()) {
        const searchTerm = `%${filters.search.trim()}%`;
        countQuery = countQuery.or(
          `full_name.ilike.${searchTerm},phone.ilike.${searchTerm},facebook_link.ilike.${searchTerm}`
        );
      }

      const { count, error: countError } = await countQuery;

      if (countError) {
        console.error("Error fetching donor applications count:", countError);
        throw countError;
      }

      // Now get the actual data with pagination
      let query = supabase
        .from("donor_applications")
        .select("*")
        .order("created_at", { ascending: false });

      // Apply status filter
      if (filters.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      // Apply search filter
      if (filters.search && filters.search.trim()) {
        const searchTerm = `%${filters.search.trim()}%`;
        query = query.or(
          `full_name.ilike.${searchTerm},phone.ilike.${searchTerm},facebook_link.ilike.${searchTerm}`
        );
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching donor applications:", error);
        throw error;
      }

      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / pageSize);

      return {
        data: data as DonorApplicationData[],
        totalCount,
        totalPages,
      };
    },
  });
}

export function useStudentApplications(filters: ApplicationFilters = {}) {
  return useQuery({
    queryKey: ["student-applications", filters],
    queryFn: async (): Promise<StudentApplicationsResult> => {
      const { page = 1, pageSize = 10 } = filters;
      
      // First, get count for total items
      let countQuery = supabase
        .from("student_applications")
        .select("*", { count: "exact", head: true });

      // Apply filters to count query
      if (filters.status && filters.status !== "all") {
        countQuery = countQuery.eq("status", filters.status);
      }

      if (filters.search && filters.search.trim()) {
        const searchTerm = `%${filters.search.trim()}%`;
        countQuery = countQuery.or(
          `full_name.ilike.${searchTerm},phone.ilike.${searchTerm},facebook_link.ilike.${searchTerm}`
        );
      }

      const { count, error: countError } = await countQuery;

      if (countError) {
        console.error("Error fetching student applications count:", countError);
        throw countError;
      }

      // Now get the actual data with pagination
      let query = supabase
        .from("student_applications")
        .select("*")
        .order("created_at", { ascending: false });

      // Apply status filter
      if (filters.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      // Apply search filter
      if (filters.search && filters.search.trim()) {
        const searchTerm = `%${filters.search.trim()}%`;
        query = query.or(
          `full_name.ilike.${searchTerm},phone.ilike.${searchTerm},facebook_link.ilike.${searchTerm}`
        );
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching student applications:", error);
        throw error;
      }

      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / pageSize);

      return {
        data: data as StudentApplicationData[],
        totalCount,
        totalPages,
      };
    },
  });
}

interface UpdateApplicationStatusParams {
  id: string;
  status: ApplicationStatus;
  rejectionReason?: string;
  notes?: string;
  type: "donor" | "student";
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, rejectionReason, notes, type }: UpdateApplicationStatusParams) => {
      const table = type === "donor" ? "donor_applications" : "student_applications";
      
      const updateData: any = {
        status,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (status === "rejected" && rejectionReason) {
        updateData.rejection_reason = rejectionReason;
      }

      if (notes) {
        updateData.notes = notes;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        updateData.reviewed_by = user.id;
      }

      // Update application status
      const { data: applicationData, error: updateError } = await supabase
        .from(table)
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (updateError) {
        console.error(`Error updating ${type} application:`, updateError);
        throw updateError;
      }

      // If approved, create corresponding donor/student record
      if (status === "approved") {
        const targetTable = type === "donor" ? "donors" : "students";
        
        if (type === "donor") {
          // Check if donor already exists by phone number
          const { data: existingDonor } = await supabase
            .from("donors")
            .select("id, support_types, support_frequency, laptop_quantity, motorbike_quantity, components_quantity, tuition_amount, tuition_frequency")
            .eq("phone", applicationData.phone)
            .single();

          const donorData = {
            application_id: applicationData.id,
            full_name: applicationData.full_name,
            birth_year: applicationData.birth_year,
            phone: applicationData.phone,
            address: applicationData.address,
            facebook_link: applicationData.facebook_link,
            support_types: applicationData.support_types,
            support_details: applicationData.support_details,
            laptop_quantity: applicationData.laptop_quantity,
            motorbike_quantity: applicationData.motorbike_quantity,
            components_quantity: applicationData.components_quantity,
            tuition_amount: applicationData.tuition_amount,
            tuition_frequency: applicationData.tuition_frequency,
            support_end_date: null,
            is_active: true,
            notes: applicationData.notes,
          };

          let donorRecord;

          if (existingDonor) {
            // Merge support types (combine unique types)
            const mergedSupportTypes = [...new Set([...existingDonor.support_types, ...applicationData.support_types])];
            
            // Merge quantities (sum them up)
            const mergedData = {
              ...donorData,
              support_types: mergedSupportTypes,
              laptop_quantity: (existingDonor.laptop_quantity || 0) + (applicationData.laptop_quantity || 0) || null,
              motorbike_quantity: (existingDonor.motorbike_quantity || 0) + (applicationData.motorbike_quantity || 0) || null,
              components_quantity: (existingDonor.components_quantity || 0) + (applicationData.components_quantity || 0) || null,
              tuition_amount: applicationData.tuition_amount || existingDonor.tuition_amount,
              tuition_frequency: applicationData.tuition_frequency || existingDonor.tuition_frequency,
              updated_at: new Date().toISOString(),
            };

            // Update existing donor record
            const { data: updatedDonor, error: updateError } = await supabase
              .from("donors")
              .update(mergedData)
              .eq("id", existingDonor.id)
              .select()
              .single();

            if (updateError) {
              console.error("Error updating existing donor record:", updateError);
              throw updateError;
            }

            donorRecord = updatedDonor;
          } else {
            // Create new donor record
            const { data: newDonor, error: donorError } = await supabase
              .from("donors")
              .insert(donorData)
              .select()
              .single();

            if (donorError) {
              console.error("Error creating donor record:", donorError);
              throw donorError;
            }

            donorRecord = newDonor;
          }

          if (donorError) {
            console.error("Error creating donor record:", donorError);
            throw donorError;
          }

          // Create inventory records based on support types and quantities
          const donorId = donorRecord.id;

          // Create laptop records
          if (applicationData.support_types.includes('laptop') && applicationData.laptop_quantity) {
            for (let i = 0; i < applicationData.laptop_quantity; i++) {
              await supabase.from("laptops").insert({
                donor_id: donorId,
                status: 'available',
                notes: `Từ nhà hảo tâm: ${applicationData.full_name}`,
              });
            }
          }

          // Create motorbike records
          if (applicationData.support_types.includes('motorbike') && applicationData.motorbike_quantity) {
            for (let i = 0; i < applicationData.motorbike_quantity; i++) {
              await supabase.from("motorbikes").insert({
                donor_id: donorId,
                status: 'available', 
                notes: `Từ nhà hảo tâm: ${applicationData.full_name}`,
              });
            }
          }

          // Create component records
          if (applicationData.support_types.includes('components') && applicationData.components_quantity) {
            for (let i = 0; i < applicationData.components_quantity; i++) {
              await supabase.from("components").insert({
                donor_id: donorId,
                component_type: 'General', // Will be updated when received
                status: 'available',
                notes: `Từ nhà hảo tâm: ${applicationData.full_name}`,
              });
            }
          }

          // Create tuition support record
          if (applicationData.support_types.includes('tuition') && applicationData.tuition_amount) {
            await supabase.from("tuition_support").insert({
              donor_id: donorId,
              amount: applicationData.tuition_amount,
              frequency: applicationData.tuition_frequency || 'one_time',
              status: 'pledged',
              notes: `Từ nhà hảo tâm: ${applicationData.full_name}`,
            });
          }
        } else {
          // Check if student already exists by phone number
          const { data: existingStudent } = await supabase
            .from("students")
            .select("id, need_laptop, need_motorbike, need_tuition, need_components, laptop_received, motorbike_received, tuition_supported, components_received")
            .eq("phone", applicationData.phone)
            .single();

          const studentData = {
            application_id: applicationData.id,
            full_name: applicationData.full_name,
            birth_year: applicationData.birth_year,
            phone: applicationData.phone,
            address: applicationData.address,
            facebook_link: applicationData.facebook_link,
            academic_year: applicationData.academic_year,
            difficult_situation: applicationData.difficult_situation,
            need_laptop: applicationData.need_laptop,
            laptop_received: false,
            laptop_received_date: null,
            need_motorbike: applicationData.need_motorbike,
            motorbike_received: false,
            motorbike_received_date: null,
            need_tuition: applicationData.need_tuition,
            tuition_supported: false,
            tuition_support_start_date: null,
            need_components: applicationData.need_components,
            components_details: applicationData.components_details,
            components_received: false,
            notes: applicationData.notes,
          };

          if (existingStudent) {
            // Merge needs (OR operation - if they need it in any application, they need it)
            const mergedData = {
              ...studentData,
              need_laptop: existingStudent.need_laptop || applicationData.need_laptop,
              need_motorbike: existingStudent.need_motorbike || applicationData.need_motorbike,
              need_tuition: existingStudent.need_tuition || applicationData.need_tuition,
              need_components: existingStudent.need_components || applicationData.need_components,
              // Keep existing received status
              laptop_received: existingStudent.laptop_received,
              motorbike_received: existingStudent.motorbike_received,
              tuition_supported: existingStudent.tuition_supported,
              components_received: existingStudent.components_received,
              updated_at: new Date().toISOString(),
            };

            // Update existing student record
            const { error: updateError } = await supabase
              .from("students")
              .update(mergedData)
              .eq("id", existingStudent.id);

            if (updateError) {
              console.error("Error updating existing student record:", updateError);
              throw updateError;
            }
          } else {
            // Create new student record
            const { error: studentError } = await supabase
              .from("students")
              .insert(studentData);

            if (studentError) {
              console.error("Error creating student record:", studentError);
              throw studentError;
            }
          }
        }
      }

      return applicationData;
    },
    onSuccess: (_, variables) => {
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["donor-applications"] });
      queryClient.invalidateQueries({ queryKey: ["student-applications"] });
      
      // Also invalidate donors/students queries if approved
      if (variables.status === "approved") {
        if (variables.type === "donor") {
          queryClient.invalidateQueries({ queryKey: ["donors"] });
        } else {
          queryClient.invalidateQueries({ queryKey: ["students"] });
        }
      }
      
      const statusText = variables.status === "approved" ? "đã được duyệt" : "đã bị từ chối";
      const typeText = variables.type === "donor" ? "nhà hảo tâm" : "sinh viên";
      
      if (variables.status === "approved") {
        toast.success(`Đơn đăng ký ${statusText} thành công. ${typeText.charAt(0).toUpperCase() + typeText.slice(1)} đã được thêm vào danh sách.`);
      } else {
        toast.success(`Đơn đăng ký ${statusText} thành công`);
      }
    },
    onError: (error) => {
      console.error("Error updating application status:", error);
      toast.error("Có lỗi xảy ra khi cập nhật đơn đăng ký");
    },
  });
}

export function useDonorApplication(id: string | null) {
  return useQuery({
    queryKey: ["donor-application", id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from("donor_applications")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching donor application:", error);
        throw error;
      }

      return data as DonorApplicationData;
    },
    enabled: !!id,
  });
}

export function useStudentApplication(id: string | null) {
  return useQuery({
    queryKey: ["student-application", id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from("student_applications")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching student application:", error);
        throw error;
      }

      return data as StudentApplicationData;
    },
    enabled: !!id,
  });
}
