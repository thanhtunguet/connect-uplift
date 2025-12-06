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
import { useUpdateLaptop, useLaptop, LaptopData } from "@/hooks/useInventory";
import { ImageUpload } from "@/components/ui/image-upload";

const formSchema = z.object({
  brand: z.string().min(1, "Vui lòng nhập hãng laptop"),
  model: z.string().min(1, "Vui lòng nhập model laptop"),
  specifications: z.string().optional(),
  condition: z.string().optional(),
  notes: z.string().optional(),
  image_url: z.string().nullable().optional(),
  status: z.enum(["available", "assigned", "delivered", "needs_repair"]),
  received_date: z.string().min(1, "Vui lòng chọn ngày nhận"),
});

type FormValues = z.infer<typeof formSchema>;

interface EditLaptopFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  laptopId: string | null;
}

export function EditLaptopForm({ open, onOpenChange, laptopId }: EditLaptopFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateLaptop = useUpdateLaptop();
  const { data: laptop, isLoading } = useLaptop(laptopId);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brand: "",
      model: "",
      specifications: "",
      condition: "",
      notes: "",
      image_url: null,
      status: "available",
      received_date: new Date().toISOString().split("T")[0],
    },
  });

  // Load laptop data when it's available
  useEffect(() => {
    if (laptop && open) {
      form.reset({
        brand: laptop.brand || "",
        model: laptop.model || "",
        specifications: laptop.specifications || "",
        condition: laptop.condition || "",
        notes: laptop.notes || "",
        image_url: (laptop as any).image_url || null,
        status: laptop.status as "available" | "assigned" | "delivered" | "needs_repair",
        received_date: laptop.received_date.split("T")[0],
      });
    }
  }, [laptop, open, form]);

  const onSubmit = async (values: FormValues) => {
    if (!laptopId) return;

    setIsSubmitting(true);
    try {
      await updateLaptop.mutateAsync({
        id: laptopId,
        updates: {
          brand: values.brand,
          model: values.model,
          specifications: values.specifications || null,
          condition: values.condition || null,
          notes: values.notes || null,
          image_url: values.image_url || null,
          status: values.status,
          received_date: values.received_date,
        },
      });

      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating laptop:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa Laptop</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin laptop và upload ảnh mới nếu cần.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

                <FormField
                  control={form.control}
                  name="image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ảnh laptop</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value || null}
                          onChange={field.onChange}
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
