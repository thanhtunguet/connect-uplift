import { Control, FieldErrors } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AreaSelect } from "./AreaSelect";

interface ContactInfoFieldsProps {
  control: Control<any>;
  errors?: FieldErrors<any>;
  showBirthYear?: boolean;
  facebookDescription?: string;
  areaDescription?: string;
  phonePlaceholder?: string;
}

export function ContactInfoFields({
  control,
  showBirthYear = false,
  facebookDescription = "Tùy chọn, nhưng nên cung cấp để dễ liên lạc và cập nhật thông tin trên Facebook",
  areaDescription = "Chọn khu vực của bạn để dễ dàng kết nối với sinh viên cùng địa bàn",
  phonePlaceholder = "Cần thiết để liên lạc",
}: ContactInfoFieldsProps) {

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Thông tin liên hệ</h3>

      <FormField
        control={control}
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

      {showBirthYear && (
        <FormField
          control={control}
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
                  onChange={(e) =>
                    field.onChange(e.target.value ? Number(e.target.value) : undefined)
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Số điện thoại *</FormLabel>
            <FormControl>
              <Input placeholder={phonePlaceholder} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
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
        control={control}
        name="facebook_link"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Link Facebook</FormLabel>
            <FormControl>
              <Input placeholder="https://facebook.com/username" {...field} />
            </FormControl>
            <FormDescription>{facebookDescription}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="area_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Khu vực *</FormLabel>
            <FormControl>
              <AreaSelect
                value={field.value || undefined}
                onValueChange={field.onChange}
                placeholder="Chọn khu vực..."
              />
            </FormControl>
            <FormDescription>{areaDescription}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
