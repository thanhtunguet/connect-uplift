import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Edit, Loader2 } from "lucide-react";
import type { DonorData } from "@/hooks/useDonors";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { 
  SupportType, 
  SupportFrequency,
  supportTypeLabels,
  supportFrequencyLabels 
} from "@/enums";

interface DonorDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  donor: DonorData | null;
  onEdit?: (donor: DonorData) => void;
  onToggleActive?: (id: string, isActive: boolean) => void;
  isLoading?: boolean;
}

export function DonorDetailDialog({
  open,
  onOpenChange,
  donor,
  onEdit,
  onToggleActive,
  isLoading,
}: DonorDetailDialogProps) {
  if (!donor) return null;

  const handleToggleActive = () => {
    if (onToggleActive) {
      onToggleActive(donor.id, !donor.is_active);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Chi tiết nhà hảo tâm</span>
            <div className="flex items-center gap-2">
              {donor.is_active ? (
                <Badge variant="default">Đang hoạt động</Badge>
              ) : (
                <Badge variant="secondary">Không hoạt động</Badge>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Active Status Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="active-toggle" className="text-base">
                Trạng thái hoạt động
              </Label>
              <p className="text-sm text-muted-foreground">
                {donor.is_active
                  ? "Nhà hảo tâm đang hoạt động"
                  : "Nhà hảo tâm đã ngừng hoạt động"}
              </p>
            </div>
            <Switch
              id="active-toggle"
              checked={donor.is_active}
              onCheckedChange={handleToggleActive}
              disabled={isLoading}
            />
          </div>

          {/* Personal Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Thông tin cá nhân</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Họ và tên</p>
                <p className="font-medium">{donor.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Số điện thoại</p>
                <p className="font-medium">{donor.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Facebook</p>
                {donor.facebook_link ? (
                  <a
                    href={donor.facebook_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {donor.facebook_link}
                  </a>
                ) : (
                  <p className="text-muted-foreground">Không có</p>
                )}
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground">Địa chỉ</p>
                <p className="font-medium">{donor.address}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Support Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Thông tin hỗ trợ</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Loại hỗ trợ</p>
                <div className="flex flex-wrap gap-2">
                  {donor.support_types.map((type) => (
                    <Badge key={type} variant="secondary">
                      {supportTypeLabels[type as SupportType] || type}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tần suất hỗ trợ</p>
                  <p className="font-medium">
                    {supportFrequencyLabels[donor.support_frequency as SupportFrequency] || donor.support_frequency}
                  </p>
                </div>
                {donor.support_end_date && (
                  <div>
                    <p className="text-sm text-muted-foreground">Ngày kết thúc</p>
                    <p className="font-medium">
                      {format(new Date(donor.support_end_date), "dd/MM/yyyy", { locale: vi })}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Support-specific quantities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {donor.support_types.includes('laptop') && donor.laptop_quantity && (
                  <div>
                    <p className="text-sm text-muted-foreground">Số lượng laptop</p>
                    <p className="font-medium">{donor.laptop_quantity}</p>
                  </div>
                )}
                
                {donor.support_types.includes('motorbike') && donor.motorbike_quantity && (
                  <div>
                    <p className="text-sm text-muted-foreground">Số lượng xe máy</p>
                    <p className="font-medium">{donor.motorbike_quantity}</p>
                  </div>
                )}
                
                {donor.support_types.includes('components') && donor.components_quantity && (
                  <div>
                    <p className="text-sm text-muted-foreground">Số lượng linh kiện</p>
                    <p className="font-medium">{donor.components_quantity}</p>
                  </div>
                )}
                
                {donor.support_types.includes('tuition') && donor.tuition_amount && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">Hỗ trợ học phí</p>
                    <p className="font-medium">
                      {new Intl.NumberFormat('vi-VN', { 
                        style: 'currency', 
                        currency: 'VND' 
                      }).format(donor.tuition_amount)}
                      {donor.tuition_frequency && (
                        <span className="text-sm text-muted-foreground ml-2">
                          ({supportFrequencyLabels[donor.tuition_frequency as SupportFrequency] || donor.tuition_frequency})
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>
              
              {donor.support_details && (
                <div>
                  <p className="text-sm text-muted-foreground">Chi tiết hỗ trợ</p>
                  <p className="font-medium whitespace-pre-wrap">{donor.support_details}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Additional Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Thông tin bổ sung</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Ngày tạo</p>
                  <p className="font-medium">
                    {format(new Date(donor.created_at), "dd/MM/yyyy HH:mm", { locale: vi })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cập nhật lần cuối</p>
                  <p className="font-medium">
                    {format(new Date(donor.updated_at), "dd/MM/yyyy HH:mm", { locale: vi })}
                  </p>
                </div>
              </div>
              {donor.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Ghi chú</p>
                  <p className="font-medium whitespace-pre-wrap">{donor.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {onEdit && (
          <DialogFooter>
            <Button onClick={() => onEdit(donor)} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Edit className="mr-2 h-4 w-4" />
              )}
              Chỉnh sửa
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
