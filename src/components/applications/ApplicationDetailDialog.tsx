import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, X, Loader2 } from "lucide-react";
import type { DonorApplicationData, StudentApplicationData } from "@/hooks/useApplications";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface ApplicationDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: DonorApplicationData | StudentApplicationData | null;
  type: "donor" | "student";
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  isLoading?: boolean;
}

const statusMap = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
};

const supportTypeMap: Record<string, string> = {
  laptop: "Laptop",
  motorbike: "Xe máy",
  components: "Linh kiện",
  tuition: "Học phí",
};

const supportFrequencyMap: Record<string, string> = {
  one_time: "Một lần",
  recurring: "Nhiều lần",
};

const academicYearMap: Record<string, string> = {
  "1": "Năm 1",
  "2": "Năm 2",
  "3": "Năm 3",
  "4": "Năm 4",
};

function isDonorApplication(app: any): app is DonorApplicationData {
  return "support_types" in app;
}

export function ApplicationDetailDialog({
  open,
  onOpenChange,
  application,
  type,
  onApprove,
  onReject,
  isLoading,
}: ApplicationDetailDialogProps) {
  if (!application) return null;

  const isDonor = isDonorApplication(application);
  const canTakeAction = application.status === "pending" && (onApprove || onReject);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Chi tiết đơn đăng ký {type === "donor" ? "nhà hảo tâm" : "sinh viên"}</span>
            <StatusBadge status={application.status}>
              {statusMap[application.status]}
            </StatusBadge>
          </DialogTitle>
          <DialogDescription>
            Xem chi tiết thông tin đơn đăng ký {type === "donor" ? "nhà hảo tâm" : "sinh viên"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Thông tin cá nhân</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Họ và tên</p>
                <p className="font-medium">{application.full_name}</p>
              </div>
              {!isDonor && 'birth_year' in application && (
                <div>
                  <p className="text-sm text-muted-foreground">Năm sinh</p>
                  <p className="font-medium">{application.birth_year}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Số điện thoại</p>
                <p className="font-medium">{application.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Facebook</p>
                {application.facebook_link ? (
                  <a
                    href={application.facebook_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {application.facebook_link}
                  </a>
                ) : (
                  <p className="text-muted-foreground">Không có</p>
                )}
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground">Địa chỉ</p>
                <p className="font-medium">{application.address}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Specific Information */}
          {isDonor ? (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Thông tin hỗ trợ</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Loại hỗ trợ</p>
                  <div className="flex flex-wrap gap-2">
                    {application.support_types.map((type) => (
                      <Badge key={type} variant="secondary">
                        {supportTypeMap[type] || type}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tần suất hỗ trợ</p>
                  <p className="font-medium">
                    {supportFrequencyMap[application.support_frequency] || application.support_frequency}
                  </p>
                </div>
                
                {/* Support-specific details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {application.support_types.includes('laptop') && application.laptop_quantity && (
                    <div>
                      <p className="text-sm text-muted-foreground">Số lượng laptop</p>
                      <p className="font-medium">{application.laptop_quantity}</p>
                    </div>
                  )}
                  
                  {application.support_types.includes('motorbike') && application.motorbike_quantity && (
                    <div>
                      <p className="text-sm text-muted-foreground">Số lượng xe máy</p>
                      <p className="font-medium">{application.motorbike_quantity}</p>
                    </div>
                  )}
                  
                  {application.support_types.includes('components') && application.components_quantity && (
                    <div>
                      <p className="text-sm text-muted-foreground">Số lượng linh kiện</p>
                      <p className="font-medium">{application.components_quantity}</p>
                    </div>
                  )}
                  
                  {application.support_types.includes('tuition') && application.tuition_amount && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground">Hỗ trợ học phí</p>
                      <p className="font-medium">
                        {new Intl.NumberFormat('vi-VN', { 
                          style: 'currency', 
                          currency: 'VND' 
                        }).format(application.tuition_amount)}
                        {application.tuition_frequency && (
                          <span className="text-sm text-muted-foreground ml-2">
                            ({supportFrequencyMap[application.tuition_frequency] || application.tuition_frequency})
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </div>
                
                {application.support_details && (
                  <div>
                    <p className="text-sm text-muted-foreground">Chi tiết hỗ trợ</p>
                    <p className="font-medium whitespace-pre-wrap">{application.support_details}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Thông tin sinh viên</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Năm học</p>
                  <p className="font-medium">
                    {academicYearMap[application.academic_year] || application.academic_year}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hoàn cảnh khó khăn</p>
                  <p className="font-medium whitespace-pre-wrap">{application.difficult_situation}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Nhu cầu hỗ trợ</p>
                  <div className="space-y-2">
                    {application.need_laptop && (
                      <Badge variant="secondary">Laptop</Badge>
                    )}
                    {application.need_motorbike && (
                      <Badge variant="secondary">Xe máy</Badge>
                    )}
                    {application.need_tuition && (
                      <Badge variant="secondary">Học phí</Badge>
                    )}
                    {application.need_components && (
                      <Badge variant="secondary">Linh kiện</Badge>
                    )}
                  </div>
                </div>
                {application.need_components && application.components_details && (
                  <div>
                    <p className="text-sm text-muted-foreground">Chi tiết linh kiện cần</p>
                    <p className="font-medium whitespace-pre-wrap">{application.components_details}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Review Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Thông tin xét duyệt</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Ngày đăng ký</p>
                  <p className="font-medium">
                    {format(new Date(application.created_at), "dd/MM/yyyy HH:mm", { locale: vi })}
                  </p>
                </div>
                {application.reviewed_at && (
                  <div>
                    <p className="text-sm text-muted-foreground">Ngày xét duyệt</p>
                    <p className="font-medium">
                      {format(new Date(application.reviewed_at), "dd/MM/yyyy HH:mm", { locale: vi })}
                    </p>
                  </div>
                )}
              </div>
              {application.rejection_reason && (
                <div>
                  <p className="text-sm text-muted-foreground">Lý do từ chối</p>
                  <p className="font-medium whitespace-pre-wrap">{application.rejection_reason}</p>
                </div>
              )}
              {application.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Ghi chú</p>
                  <p className="font-medium whitespace-pre-wrap">{application.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {canTakeAction && (
          <DialogFooter className="flex gap-2">
            {onReject && (
              <Button
                variant="destructive"
                onClick={() => onReject(application.id)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <X className="mr-2 h-4 w-4" />
                )}
                Từ chối
              </Button>
            )}
            {onApprove && (
              <Button
                onClick={() => onApprove(application.id)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                Duyệt đơn
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
