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
import { useCreateLaptop } from "@/hooks/useInventory";
import { useCreateDonor } from "@/hooks/useDonors";
import { DonorSelector } from "./DonorSelector";

const formSchema = z
  .object({
    // Donor information
    donor_id: z.string().nullable(),
    donor_full_name: z.string().optional(),
    donor_phone: z.string().optional(),
    donor_address: z.string().optional(),
    donor_facebook_link: z.string().optional(),

    // Laptop information
    brand: z.string().min(1, "Vui lòng nhập hãng laptop"),
    model: z.string().min(1, "Vui lòng nhập model laptop"),
    specifications: z.string().optional(),
    condition: z.string().optional(),
    notes: z.string().optional(),
    status: z.enum(["available", "assigned", "delivered", "needs_repair"]),
    received_date: z.string().min(1, "Vui lòng chọn ngày nhận"),
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

interface CreateLaptopFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateLaptopForm({ open, onOpenChange }: CreateLaptopFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createLaptop = useCreateLaptop();
  const createDonor = useCreateDonor();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      donor_id: null,
      donor_full_name: "",
      donor_phone: "",
      donor_address: "",
      donor_facebook_link: "",
      brand: "",
      model: "",
      specifications: "",
      condition: "",
      notes: "",
      status: "available",
      received_date: new Date().toISOString().split("T")[0],
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
            support_types: ["laptop"],
            support_frequency: "one_time",
            support_details: null,
            laptop_quantity: 1,
            motorbike_quantity: null,
            components_quantity: null,
            tuition_amount: null,
            tuition_frequency: null,
            support_end_date: null,
            is_active: true,
            notes: null,
          },
        });
        donorId = newDonor.id;
      }

      // Create laptop
      await createLaptop.mutateAsync({
        donor_id: donorId,
        student_id: null,
        brand: values.brand,
        model: values.model,
        specifications: values.specifications || null,
        condition: values.condition || null,
        notes: values.notes || null,
        status: values.status,
        received_date: values.received_date,
        assigned_date: null,
        delivered_date: null,
      });

      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating laptop:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm Laptop</DialogTitle>
          <DialogDescription>
            Thêm laptop mới vào kho. Bạn có thể chọn nhà hảo tâm có sẵn hoặc tạo mới.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Donor Selection */}
            <DonorSelector supportType="laptop" />

            {/* Laptop Information */}
            <div className="space-y-4">
              <h4 className="font-medium">Thông tin laptop</h4>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hãng *</FormLabel>
                      <FormControl>
                        <Input placeholder="Dell, HP, Asus..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model *</FormLabel>
                      <FormControl>
                        <Input placeholder="Inspiron 15, Pavilion..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="specifications"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thông số kỹ thuật</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="CPU: Intel i5, RAM: 8GB, SSD: 256GB..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tình trạng</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Mới, đã qua sử dụng, cần sửa chữa..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                          <SelectItem value="available">Sẵn sàng</SelectItem>
                          <SelectItem value="assigned">Đã phân</SelectItem>
                          <SelectItem value="delivered">Đã giao</SelectItem>
                          <SelectItem value="needs_repair">Cần sửa</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="received_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày nhận *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
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
                Thêm laptop
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
