import { useState } from "react";
import { useFormContext } from "react-hook-form";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useDonors } from "@/hooks/useDonors";
import { Label } from "@/components/ui/label";
import { SupportFrequency } from "@/enums";
import { AreaSelect } from "./AreaSelect";

interface DonorSelectorProps {
  supportType: "laptop" | "motorbike" | "components" | "tuition";
}

export function DonorSelector({ supportType }: DonorSelectorProps) {
  const form = useFormContext();
  const [donorMode, setDonorMode] = useState<"existing" | "new">("existing");
  
  const { data: donorsResult, isLoading } = useDonors({ isActive: true });

  // Filter donors based on support type
  const donors = donorsResult?.data ?? [];
  const filteredDonors = donors.filter((donor) =>
    donor.support_types.includes(supportType)
  );

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label>Nguồn tặng</Label>
        <RadioGroup
          value={donorMode}
          onValueChange={(value) => {
            setDonorMode(value as "existing" | "new");
            if (value === "existing") {
              form.setValue("donor_full_name", "");
              form.setValue("donor_phone", "");
              form.setValue("donor_address", "");
              form.setValue("donor_facebook_link", "");
              form.setValue("donor_area_id", "");
            } else {
              form.setValue("donor_id", null);
            }
          }}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="existing" id="existing" />
            <Label htmlFor="existing" className="font-normal cursor-pointer">
              Chọn nhà hảo tâm có sẵn
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="new" id="new" />
            <Label htmlFor="new" className="font-normal cursor-pointer">
              Thêm nhà hảo tâm mới
            </Label>
          </div>
        </RadioGroup>
      </div>

      {donorMode === "existing" ? (
        <FormField
          control={form.control}
          name="donor_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chọn nhà hảo tâm</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value ?? ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn nhà hảo tâm..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoading ? (
                    <SelectItem value="loading" disabled>
                      Đang tải...
                    </SelectItem>
                  ) : filteredDonors.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      Không có nhà hảo tâm nào phù hợp
                    </SelectItem>
                  ) : (
                    filteredDonors.map((donor) => (
                      <SelectItem key={donor.id} value={donor.id}>
                        {donor.full_name} - {donor.phone}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormDescription>
                Chọn từ danh sách nhà hảo tâm đã đăng ký hỗ trợ {supportType === "laptop" ? "laptop" : supportType === "motorbike" ? "xe máy" : supportType === "components" ? "linh kiện" : "học phí"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : (
        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
          <h4 className="font-medium">Thông tin nhà hảo tâm mới</h4>
          
          <FormField
            control={form.control}
            name="donor_full_name"
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
            name="donor_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số điện thoại *</FormLabel>
                <FormControl>
                  <Input placeholder="0123456789" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="donor_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Địa chỉ *</FormLabel>
                <FormControl>
                  <Textarea placeholder="Địa chỉ liên lạc" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="donor_facebook_link"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link Facebook</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://facebook.com/username"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="donor_area_id"
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
                <FormMessage />
              </FormItem>
            )}
          />

          {supportType === "tuition" && (
            <>
              <FormField
                control={form.control}
                name="donor_tuition_frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tần suất hỗ trợ</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn tần suất..." />
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
            </>
          )}
        </div>
      )}
    </div>
  );
}
