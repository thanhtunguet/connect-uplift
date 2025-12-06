import { useState, useEffect } from "react";
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
import { useUpdateComponent, useComponent, ComponentData } from "@/hooks/useInventory";
import { useCreateDonor } from "@/hooks/useDonors";
import { DonorSelector } from "./DonorSelector";

const formSchema = z
  .object({
    // Donor information (optional, only shown when status is supported)
    donor_id: z.string().nullable(),
    donor_full_name: z.string().optional(),
    donor_phone: z.string().optional(),
    donor_address: z.string().optional(),
    donor_facebook_link: z.string().optional(),

    // Component information
    component_type: z.string().min(1, "Vui lòng nhập loại linh kiện"),
    brand: z.string().optional(),
    model: z.string().optional(),
    specifications: z.string().optional(),
    condition: z.string().optional(),
    notes: z.string().optional(),
    status: z.enum(["needs_support", "supported", "available", "assigned", "delivered", "installed"]),
    received_date: z.string().min(1, "Vui lòng chọn ngày nhận"),
  })
  .superRefine((data, ctx) => {
    // If status is "supported" and donor_id is null and user is trying to add donor info,
    // validate that all fields are provided if any field is filled
    if (data.status === "supported" && !data.donor_id) {
      const hasAnyDonorInfo = 
        (data.donor_full_name && data.donor_full_name.trim() !== "") ||
        (data.donor_phone && data.donor_phone.trim() !== "") ||
        (data.donor_address && data.donor_address.trim() !== "");
      
      // Only validate if user started filling donor info
      if (hasAnyDonorInfo) {
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
    }
  });

type FormValues = z.infer<typeof formSchema>;

interface EditComponentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  componentId: string | null;
}

export function EditComponentForm({
  open,
  onOpenChange,
  componentId,
}: EditComponentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateComponent = useUpdateComponent();
  const createDonor = useCreateDonor();
  const { data: component, isLoading } = useComponent(componentId);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      donor_id: null,
      donor_full_name: "",
      donor_phone: "",
      donor_address: "",
      donor_facebook_link: "",
      component_type: "",
      brand: "",
      model: "",
      specifications: "",
      condition: "",
      notes: "",
      status: "needs_support",
      received_date: new Date().toISOString().split("T")[0],
    },
  });

  // Watch status to show/hide donor fields
  const status = form.watch("status");

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
    }
    onOpenChange(newOpen);
  };

  // Load component data when it's available
  useEffect(() => {
    if (component && open) {
      form.reset({
        donor_id: component.donor_id || null,
        donor_full_name: "",
        donor_phone: "",
        donor_address: "",
        donor_facebook_link: "",
        component_type: component.component_type || "",
        brand: component.brand || "",
        model: component.model || "",
        specifications: component.specifications || "",
        condition: component.condition || "",
        notes: component.notes || "",
        status: (component.status === "needs_support" ? "needs_support" : 
                 component.status === "supported" ? "supported" :
                 ["available", "assigned", "delivered", "installed"].includes(component.status) 
                   ? component.status as "available" | "assigned" | "delivered" | "installed"
                   : "needs_support") as "needs_support" | "supported" | "available" | "assigned" | "delivered" | "installed",
        received_date: component.received_date.split("T")[0],
      });
    }
  }, [component, open, form]);

  const onSubmit = async (values: FormValues) => {
    if (!componentId) return;

    setIsSubmitting(true);
    try {
      let donorId = values.donor_id;

      // If status is "supported" and no donor_id, but user provided donor info, create new donor
      if (values.status === "supported" && !donorId) {
        const hasDonorInfo = 
          (values.donor_full_name && values.donor_full_name.trim() !== "") ||
          (values.donor_phone && values.donor_phone.trim() !== "") ||
          (values.donor_address && values.donor_address.trim() !== "");
        
        if (hasDonorInfo && values.donor_full_name && values.donor_phone && values.donor_address) {
          const newDonor = await createDonor.mutateAsync({
            donor: {
              application_id: null,
              full_name: values.donor_full_name,
              phone: values.donor_phone,
              address: values.donor_address,
              facebook_link: values.donor_facebook_link || null,
              support_types: ["components"],
              support_frequency: "one_time",
              support_details: null,
              laptop_quantity: null,
              motorbike_quantity: null,
              components_quantity: 1,
              tuition_amount: null,
              tuition_frequency: null,
              support_end_date: null,
              is_active: true,
              notes: null,
            },
          });
          donorId = newDonor.id;
        }
      }

      // If status is not "supported", set donor_id to null
      if (values.status !== "supported") {
        donorId = null;
      }

      // Update component
      await updateComponent.mutateAsync({
        id: componentId,
        updates: {
          donor_id: donorId,
          component_type: values.component_type,
          brand: values.brand || null,
          model: values.model || null,
          specifications: values.specifications || null,
          condition: values.condition || null,
          notes: values.notes || null,
          status: values.status,
          received_date: values.received_date,
        },
      });

      form.reset();
      handleOpenChange(false);
    } catch (error) {
      console.error("Error updating component:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa Linh kiện</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin linh kiện. Khi chuyển trạng thái sang "Đã được hỗ trợ", bạn có thể nhập thông tin nhà hảo tâm (tùy chọn).
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Component Information */}
              <div className="space-y-4">
                <h4 className="font-medium">Thông tin linh kiện</h4>

                <FormField
                  control={form.control}
                  name="component_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loại linh kiện *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="RAM, SSD, HDD, CPU, Màn hình..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Ví dụ: RAM 8GB, SSD 256GB, CPU Intel i5...
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hãng</FormLabel>
                        <FormControl>
                          <Input placeholder="Kingston, Samsung..." {...field} />
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
                        <FormLabel>Model</FormLabel>
                        <FormControl>
                          <Input placeholder="Fury DDR4..." {...field} />
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
                          placeholder="Dung lượng, tốc độ, các thông số kỹ thuật khác..."
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
                          placeholder="Mới, đã qua sử dụng..."
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
                            <SelectItem value="needs_support">Cần hỗ trợ</SelectItem>
                            <SelectItem value="supported">Đã được hỗ trợ</SelectItem>
                            <SelectItem value="available">Sẵn sàng</SelectItem>
                            <SelectItem value="assigned">Đã phân</SelectItem>
                            <SelectItem value="delivered">Đã giao</SelectItem>
                            <SelectItem value="installed">Đã lắp</SelectItem>
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

              {/* Donor Information - Only show when status is "supported" */}
              {status === "supported" && (
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium">Thông tin nhà hảo tâm (Tùy chọn)</h4>
                  <p className="text-sm text-muted-foreground">
                    Nhập thông tin người đã hỗ trợ linh kiện này. Bạn có thể chọn nhà hảo tâm có sẵn hoặc tạo mới.
                  </p>
                  <DonorSelector supportType="components" />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Cập nhật
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
