import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useCreateTuitionSupport } from "@/hooks/useInventory";
import { useCreateDonor } from "@/hooks/useDonors";
import { DonorSelector } from "./DonorSelector";
import { SupportFrequency } from "@/enums";

const formSchema = z
  .object({
    // Donor information
    donor_id: z.string().nullable(),
    donor_full_name: z.string().optional(),
    donor_phone: z.string().optional(),
    donor_address: z.string().optional(),
    donor_facebook_link: z.string().optional(),
    donor_tuition_frequency: z.nativeEnum(SupportFrequency).optional(),

    // Tuition information
    amount: z.coerce.number().min(100000, "Số tiền phải ít nhất 100,000 VNĐ"),
    frequency: z.nativeEnum(SupportFrequency),
    academic_year: z.string().optional(),
    semester: z.coerce.number().nullable().optional(),
    notes: z.string().optional(),
    status: z.enum(["pledged", "paid", "cancelled"]),
    pledged_date: z.string().min(1, "Vui lòng chọn ngày cam kết"),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // If donor_id is null, require donor information
    if (!data.donor_id) {
      if (!data.donor_full_name || data.donor_full_name.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Vui lòng nhập họ và tên nhà hảo tâm",
          path: ["donor_full_name"],
        });
      }
      if (!data.donor_phone || data.donor_phone.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Vui lòng nhập số điện thoại nhà hảo tâm",
          path: ["donor_phone"],
        });
      }
      if (!data.donor_address || data.donor_address.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Vui lòng nhập địa chỉ nhà hảo tâm",
          path: ["donor_address"],
        });
      }
    }
  });

type FormValues = z.infer<typeof formSchema>;

interface CreateTuitionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTuitionForm({
  open,
  onOpenChange,
}: CreateTuitionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createTuition = useCreateTuitionSupport();
  const createDonor = useCreateDonor();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      donor_id: null,
      donor_full_name: "",
      donor_phone: "",
      donor_address: "",
      donor_facebook_link: "",
      donor_tuition_frequency: SupportFrequency.ONE_TIME,
      amount: 1000000,
      frequency: SupportFrequency.ONE_TIME,
      academic_year: "",
      semester: null,
      notes: "",
      status: "pledged",
      pledged_date: new Date().toISOString().split("T")[0],
      start_date: "",
      end_date: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      let donorId = values.donor_id;

      // Create new donor if needed
      if (!donorId) {
        const newDonor = await createDonor.mutateAsync({
          donor: {
            application_id: null,
            full_name: values.donor_full_name!,
            phone: values.donor_phone!,
            address: values.donor_address!,
            facebook_link: values.donor_facebook_link || null,
            support_types: ["tuition"],
            support_frequency: values.donor_tuition_frequency || SupportFrequency.ONE_TIME,
            support_details: null,
            laptop_quantity: null,
            motorbike_quantity: null,
            components_quantity: null,
            tuition_amount: values.amount,
            tuition_frequency: values.frequency,
            support_end_date: values.end_date || null,
            is_active: true,
            notes: null,
          },
        });
        donorId = newDonor.id;
      }

      // Create tuition support
      await createTuition.mutateAsync({
        donor_id: donorId,
        student_id: null,
        amount: values.amount,
        frequency: values.frequency,
        academic_year: values.academic_year || null,
        semester: values.semester || null,
        notes: values.notes || null,
        status: values.status,
        pledged_date: values.pledged_date,
        paid_date: null,
        start_date: values.start_date || null,
        end_date: values.end_date || null,
      });

      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating tuition support:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm Hỗ trợ học phí</DialogTitle>
          <DialogDescription>
            Thêm hỗ trợ học phí mới. Bạn có thể chọn nhà hảo tâm có sẵn hoặc tạo mới.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Donor Selection */}
            <DonorSelector supportType="tuition" />

            {/* Tuition Information */}
            <div className="space-y-4">
              <h4 className="font-medium">Thông tin hỗ trợ học phí</h4>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số tiền (VNĐ) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="100000"
                          step="50000"
                          placeholder="1000000"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Tối thiểu 100,000 VNĐ
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tần suất *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={SupportFrequency.ONE_TIME}>
                            Một lần
                          </SelectItem>
                          <SelectItem value={SupportFrequency.RECURRING}>
                            Định kỳ
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="academic_year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Năm học</FormLabel>
                      <FormControl>
                        <Input placeholder="2024-2025" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="semester"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Học kỳ</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn học kỳ..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Học kỳ 1</SelectItem>
                          <SelectItem value="2">Học kỳ 2</SelectItem>
                          <SelectItem value="3">Học kỳ 3</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trạng thái *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pledged">Đã cam kết</SelectItem>
                          <SelectItem value="paid">Đã thanh toán</SelectItem>
                          <SelectItem value="cancelled">Đã hủy</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pledged_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày cam kết *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày bắt đầu</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>
                        Cho hỗ trợ định kỳ
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày kết thúc</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>
                        Cho hỗ trợ định kỳ
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ghi chú</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ghi chú thêm..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Thêm hỗ trợ học phí
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
