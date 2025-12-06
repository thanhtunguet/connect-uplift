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
  AcademicYear, 
  SupportType,
  academicYearLabels,
  supportTypeLabels,
  supportTypeDescriptions,
  getAllAcademicYears,
  ApplicationStatus
} from "@/enums";
import { useAreas } from "@/hooks/useAreas";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  full_name: z.string().min(2, "Họ và tên phải có ít nhất 2 ký tự"),
  birth_year: z.coerce
    .number()
    .min(1990, "Năm sinh không hợp lệ")
    .max(new Date().getFullYear() - 17, "Sinh viên phải từ 17 tuổi trở lên"),
  phone: z.string().regex(/^[0-9]{10,11}$/, "Số điện thoại phải có 10-11 chữ số"),
  address: z.string().min(5, "Địa chỉ phải có ít nhất 5 ký tự"),
  facebook_link: z.string().url("Link Facebook không hợp lệ").optional().or(z.literal("")),
  area_id: z.string().min(1, "Vui lòng chọn khu vực"),
  academic_year: z.nativeEnum(AcademicYear, {
    required_error: "Vui lòng chọn năm học",
  }),
  difficult_situation: z.string().min(20, "Vui lòng mô tả chi tiết hoàn cảnh khó khăn (ít nhất 20 ký tự)"),
  need_laptop: z.boolean(),
  need_motorbike: z.boolean(),
  need_tuition: z.boolean(),
}).refine(
  (data) => data.need_laptop || data.need_motorbike || data.need_tuition,
  {
    message: "Vui lòng chọn ít nhất một loại nhu cầu hỗ trợ",
    path: ["need_laptop"],
  }
);

type FormValues = z.infer<typeof formSchema>;

interface StudentRegistrationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const academicYearOptions = getAllAcademicYears().map((year) => ({
  value: year,
  label: academicYearLabels[year],
}));

const needOptions = [
  { name: "need_laptop" as const, supportType: SupportType.LAPTOP, label: supportTypeLabels[SupportType.LAPTOP], description: supportTypeDescriptions[SupportType.LAPTOP] },
  { name: "need_motorbike" as const, supportType: SupportType.MOTORBIKE, label: supportTypeLabels[SupportType.MOTORBIKE], description: supportTypeDescriptions[SupportType.MOTORBIKE] },
  { name: "need_tuition" as const, supportType: SupportType.TUITION, label: supportTypeLabels[SupportType.TUITION], description: supportTypeDescriptions[SupportType.TUITION] },
];

export function StudentRegistrationForm({ onSuccess, onCancel }: StudentRegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: areasResult, isLoading: isLoadingAreas } = useAreas({ isActive: true });
  const areas = areasResult?.data ?? [];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      birth_year: undefined,
      phone: "",
      address: "",
      facebook_link: "",
      area_id: "",
      academic_year: AcademicYear.YEAR_1,
      difficult_situation: "",
      need_laptop: false,
      need_motorbike: false,
      need_tuition: false,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("student_applications").insert({
        full_name: values.full_name,
        birth_year: values.birth_year,
        phone: values.phone,
        address: values.address,
        facebook_link: values.facebook_link || null,
        area_id: values.area_id,
        academic_year: values.academic_year,
        difficult_situation: values.difficult_situation,
        need_laptop: values.need_laptop,
        need_motorbike: values.need_motorbike,
        need_tuition: values.need_tuition,
        status: ApplicationStatus.PENDING,
      });

      if (error) throw error;

      toast.success("Đăng ký thành công!", {
        description: "Đơn đăng ký của bạn đã được gửi và đang chờ xét duyệt.",
      });

      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Error submitting student application:", error);
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
        Dự án "Ăn mày laptop" sẽ giúp kết nối bạn với các nhà hảo tâm. Vui lòng điền đầy đủ và trung thực thông tin dưới đây.
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
                    <FormLabel>Năm sinh *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Điền năm sinh của em" 
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
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
                      <Input placeholder="Cần thiết để liên lạc và hỗ trợ" {...field} />
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
                    <FormDescription>Tùy chọn, nhưng nên cung cấp để dễ liên lạc</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="area_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Khu vực *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn khu vực..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingAreas ? (
                          <SelectItem value="loading" disabled>
                            Đang tải...
                          </SelectItem>
                        ) : areas.length === 0 ? (
                          <SelectItem value="empty" disabled>
                            Không có khu vực nào
                          </SelectItem>
                        ) : (
                          areas.map((area) => (
                            <SelectItem key={area.id} value={area.id}>
                              {area.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Chọn khu vực của bạn để dễ dàng kết nối với nhà hảo tâm cùng địa bàn
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Student Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Thông tin sinh viên</h3>

              <FormField
                control={form.control}
                name="academic_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Năm học hiện tại *</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
                      >
                        {academicYearOptions.map((option) => (
                          <div key={option.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={option.value} id={option.value} />
                            <FormLabel htmlFor={option.value} className="font-normal cursor-pointer">
                              {option.label}
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
                name="difficult_situation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hoàn cảnh khó khăn *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Vui lòng mô tả chi tiết hoàn cảnh gia đình và lý do cần được hỗ trợ..."
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Mô tả càng chi tiết càng giúp chúng tôi hiểu và hỗ trợ bạn tốt hơn
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Needs */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Nhu cầu cần hỗ trợ</h3>
              <FormDescription>Chọn các loại hỗ trợ bạn đang cần</FormDescription>

              <div className="space-y-3">
                {needOptions.map((option) => (
                  <FormField
                    key={option.name}
                    control={form.control}
                    name={option.name}
                    render={({ field }) => (
                      <FormItem className="flex items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-normal cursor-pointer">
                            {option.label}
                          </FormLabel>
                          <FormDescription className="text-sm">
                            {option.description}
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              <FormMessage>{form.formState.errors.need_laptop?.message}</FormMessage>
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
