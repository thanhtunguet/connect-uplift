import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AppSetting {
  id: string;
  key: string;
  value: any;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// Get a specific setting by key
export function useAppSetting(key: string) {
  return useQuery({
    queryKey: ["app_settings", key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_settings")
        .select("*")
        .eq("key", key)
        .single();

      if (error) throw error;
      return data as AppSetting;
    },
  });
}

// Get all settings
export function useAppSettings() {
  return useQuery({
    queryKey: ["app_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_settings")
        .select("*")
        .order("key");

      if (error) throw error;
      return data as AppSetting[];
    },
  });
}

// Update a setting
export function useUpdateAppSetting() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      // Supabase will automatically convert to JSONB
      const { data, error } = await supabase
        .from("app_settings")
        .update({ value: value })
        .eq("key", key)
        .select()
        .single();

      if (error) throw error;
      return data as AppSetting;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["app_settings"] });
      queryClient.invalidateQueries({ queryKey: ["app_settings", data.key] });
      toast({
        title: "Cập nhật thành công",
        description: "Cài đặt đã được cập nhật",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.message || "Không thể cập nhật cài đặt",
      });
    },
  });
}

// Helper hook to check if signups are allowed
export function useAllowSignups() {
  const { data: setting, isLoading } = useAppSetting("allow_signups");
  
  // Parse the value - it could be boolean, string "true"/"false", or JSONB
  let allowSignups = true; // Default to true
  if (setting?.value !== undefined && !isLoading) {
    if (typeof setting.value === "boolean") {
      allowSignups = setting.value;
    } else if (typeof setting.value === "string") {
      allowSignups = setting.value.toLowerCase() === "true";
    } else {
      // For JSONB, it should be a boolean
      allowSignups = Boolean(setting.value);
    }
  }
  
  return { allowSignups, isLoading };
}
