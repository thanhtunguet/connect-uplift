import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ComponentSupportParams {
  componentId: string;
  fullName: string;
  phone: string;
  facebookLink: string | null;
  recaptchaToken: string | null;
}

export function useComponentSupport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: ComponentSupportParams) => {
      const { componentId, fullName, phone, facebookLink, recaptchaToken } = params;

      // Call RPC function to handle component support registration
      // This will update component status and create notification
      const { data, error } = await supabase.rpc("register_component_support", {
        p_component_id: componentId,
        p_full_name: fullName,
        p_phone: phone,
        p_facebook_link: facebookLink,
        p_recaptcha_token: recaptchaToken,
      });

      if (error) {
        console.error("Error registering component support:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["public-components"] });
      queryClient.invalidateQueries({ queryKey: ["components"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      
      toast.success("Đăng ký hỗ trợ thành công!", {
        description: "Cảm ơn bạn đã đăng ký hỗ trợ. Chúng tôi sẽ liên hệ với bạn sớm nhất có thể.",
      });
    },
    onError: (error) => {
      console.error("Error registering component support:", error);
      toast.error("Có lỗi xảy ra", {
        description: "Không thể đăng ký hỗ trợ. Vui lòng thử lại sau.",
      });
    },
  });
}
