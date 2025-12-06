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
import { useCreateComponent } from "@/hooks/useInventory";

const formSchema = z.object({
  // Component information
  component_type: z.string().min(1, "Vui lòng nhập loại linh kiện"),
  brand: z.string().optional(),
  model: z.string().optional(),
  specifications: z.string().optional(),
  condition: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["needs_support", "available", "assigned", "delivered", "installed"]),
  received_date: z.string().min(1, "Vui lòng chọn ngày nhận"),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateComponentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateComponentForm({
  open,
  onOpenChange,
}: CreateComponentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createComponent = useCreateComponent();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
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

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      // Create component without donor_id (for components that need support)
      await createComponent.mutateAsync({
        donor_id: null,
        student_id: null,
        component_type: values.component_type,
        brand: values.brand || null,
        model: values.model || null,
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
      console.error("Error creating component:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm Linh kiện cần hỗ trợ</DialogTitle>
          <DialogDescription>
            Nhập thông tin linh kiện cần được hỗ trợ. Thông tin nhà hảo tâm có thể được thêm sau khi linh kiện đã được hỗ trợ.
          </DialogDescription>
        </DialogHeader>

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
                Thêm linh kiện
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
