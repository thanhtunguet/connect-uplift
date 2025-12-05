import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { 
  SupportType, 
  SupportFrequency,
  ApplicationStatus,
  supportTypeLabels,
  supportFrequencyLabels,
  supportFrequencyDescriptions,
  getAllSupportTypes,
  getAllSupportFrequencies
} from "@/enums";

const formSchema = z.object({
  full_name: z.string().min(2, "Họ và tên phải có ít nhất 2 ký tự"),
  birth_year: z.coerce
    .number()
    .min(1940, "Năm sinh không hợp lệ")
    .max(new Date().getFullYear(), "Năm sinh không hợp lệ"),
  phone: z.string().regex(/^[0-9]{10,11}$/, "Số điện thoại phải có 10-11 chữ số"),
  address: z.string().min(5, "Địa chỉ phải có ít nhất 5 ký tự"),
  facebook_link: z.string().url("Link Facebook không hợp lệ").optional().or(z.literal("")),
  support_types: z.array(z.nativeEnum(SupportType)).min(1, "Vui lòng chọn ít nhất một loại hỗ trợ"),
  support_frequency: z.nativeEnum(SupportFrequency, {
    required_error: "Vui lòng chọn mức độ hỗ trợ",
  }),
  support_details: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface DonorRegistrationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const supportTypeOptions = getAllSupportTypes().map((type) => ({
  value: type,
  label: supportTypeLabels[type],
}));

const supportFrequencyOptions = getAllSupportFrequencies().map((frequency) => ({
  value: frequency,
  label: supportFrequencyLabels[frequency],
  description: supportFrequencyDescriptions[frequency],
}));

export function DonorRegistrationForm({ onSuccess, onCancel }: DonorRegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      birth_year: null,
      phone: "",
      address: "",
      facebook_link: "",
      support_types: [],
      support_frequency: SupportFrequency.ONE_TIME,
      support_details: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("donor_applications").insert({
        full_name: values.full_name,
        birth_year: values.birth_year,
        phone: values.phone,
        address: values.address,
        facebook_link: values.facebook_link || null,
        support_types: values.support_types,
        support_frequency: values.support_frequency,
        support_details: values.support_details || null,
        status: ApplicationStatus.PENDING,
      });

      if (error) throw error;

      toast.success("Đăng ký thành công!", {
        description: "Đơn đăng ký của bạn đã được gửi và đang chờ xét duyệt.",
      });

      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Error submitting donor application:", error);
      toast.error("Có lỗi xảy ra", {
        description: "Không thể gửi đơn đăng ký. Vui lòng thử lại sau.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <p className="text-sm text-muted-foreground mb-6">
        Cảm ơn bạn đã quan tâm đến dự án "Ăn mày laptop". Vui lòng điền đầy đủ thông tin dưới đây.
      </p>
      <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Thông tin liên hệ</h3>

              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Họ và tên *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nguyễn Văn A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="birth_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Năm sinh</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ghi năm sinh cho tiện xưng hô, bỏ qua nếu không cần" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại *</FormLabel>
                    <FormControl>
                      <Input placeholder="Cần thiết để liên lạc" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Địa chỉ liên lạc *</FormLabel>
                    <FormControl>
                      <Textarea placeholder="123 Đường ABC, Quận 1, TP.HCM" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="facebook_link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link Facebook</FormLabel>
                    <FormControl>
                      <Input placeholder="https://facebook.com/username" {...field} />
                    </FormControl>
                    <FormDescription>Tùy chọn, nhưng nên cung cấp để dễ liên lạc và cập nhật thông tin trên Facebook</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Support Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Khả năng hỗ trợ</h3>

              <FormField
                control={form.control}
                name="support_types"
                render={() => (
                  <FormItem>
                    <FormLabel>Loại hỗ trợ *</FormLabel>
                    <FormDescription>Chọn các loại hỗ trợ bạn có thể cung cấp</FormDescription>
                    <div className="space-y-2">
                      {supportTypeOptions.map((option) => (
                        <FormField
                          key={option.value}
                          control={form.control}
                          name="support_types"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(option.value)}
                                  onCheckedChange={(checked) => {
                                    const updatedValue = checked
                                      ? [...(field.value || []), option.value]
                                      : field.value?.filter((value) => value !== option.value) || [];
                                    field.onChange(updatedValue);
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                {option.label}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="support_frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mức độ hỗ trợ *</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="space-y-2"
                      >
                        {supportFrequencyOptions.map((option) => (
                          <div key={option.value} className="flex items-center space-x-3">
                            <RadioGroupItem value={option.value} id={option.value} />
                            <FormLabel htmlFor={option.value} className="font-normal cursor-pointer">
                              <div>
                                <div className="font-medium">{option.label}</div>
                                <div className="text-sm text-muted-foreground">{option.description}</div>
                              </div>
                            </FormLabel>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="support_details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chi tiết khả năng hỗ trợ</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ví dụ: Có thể hỗ trợ 1 laptop, 500k/tháng cho 1 sinh viên, hoặc học phí khoảng 5 triệu/học kỳ..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Tùy chọn, nhưng giúp chúng tôi hiểu rõ hơn về khả năng hỗ trợ của bạn
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end pt-4">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                  Hủy
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Gửi đơn đăng ký
              </Button>
            </div>
          </form>
        </Form>
    </div>
  );
}
