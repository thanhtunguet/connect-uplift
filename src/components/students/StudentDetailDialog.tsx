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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Edit, Loader2, CheckCircle2, Circle } from "lucide-react";
import type { StudentData } from "@/hooks/useStudents";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { 
  AcademicYear, 
  SupportType,
  academicYearLabels,
  supportTypeLabels 
} from "@/enums";

interface StudentDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: StudentData | null;
  onEdit?: (student: StudentData) => void;
  onMarkReceived?: (id: string, type: "laptop" | "motorbike" | "tuition" | "components", received: boolean) => void;
  isLoading?: boolean;
}

export function StudentDetailDialog({
  open,
  onOpenChange,
  student,
  onEdit,
  onMarkReceived,
  isLoading,
}: StudentDetailDialogProps) {
  if (!student) return null;

  const needItems = [
    {
      type: "laptop" as const,
      label: supportTypeLabels[SupportType.LAPTOP],
      need: student.need_laptop,
      received: student.laptop_received,
      receivedDate: student.laptop_received_date,
    },
    {
      type: "motorbike" as const,
      label: supportTypeLabels[SupportType.MOTORBIKE],
      need: student.need_motorbike,
      received: student.motorbike_received,
      receivedDate: student.motorbike_received_date,
    },
    {
      type: "tuition" as const,
      label: supportTypeLabels[SupportType.TUITION],
      need: student.need_tuition,
      received: student.tuition_supported,
      receivedDate: student.tuition_support_start_date,
    },
    {
      type: "components" as const,
      label: supportTypeLabels[SupportType.COMPONENTS],
      need: student.need_components,
      received: student.components_received,
      receivedDate: null,
    },
  ].filter(item => item.need);

  const allReceived = needItems.length > 0 && needItems.every(item => item.received);
  const someReceived = needItems.some(item => item.received);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Chi tiết sinh viên</span>
            <div className="flex items-center gap-2">
              {allReceived ? (
                <Badge variant="default">Đã nhận đầy đủ</Badge>
              ) : someReceived ? (
                <Badge variant="secondary">Đã nhận một phần</Badge>
              ) : (
                <Badge variant="outline">Chưa nhận hỗ trợ</Badge>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Thông tin cá nhân</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Họ và tên</p>
                <p className="font-medium">{student.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Năm sinh</p>
                <p className="font-medium">{student.birth_year}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Số điện thoại</p>
                <p className="font-medium">{student.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Năm học</p>
                <p className="font-medium">
                  {academicYearLabels[student.academic_year as AcademicYear] || student.academic_year}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Facebook</p>
                {student.facebook_link ? (
                  <a
                    href={student.facebook_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {student.facebook_link}
                  </a>
                ) : (
                  <p className="text-muted-foreground">Không có</p>
                )}
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground">Địa chỉ</p>
                <p className="font-medium">{student.address}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Difficult Situation */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Hoàn cảnh</h3>
            <p className="text-sm whitespace-pre-wrap">{student.difficult_situation}</p>
          </div>

          <Separator />

          {/* Support Needs and Status */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Nhu cầu và trạng thái hỗ trợ</h3>
            <div className="space-y-3">
              {needItems.map((item) => (
                <div
                  key={item.type}
                  className="flex items-start justify-between p-4 bg-muted rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {item.received ? (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                      <Label className="text-base font-medium">{item.label}</Label>
                    </div>
                    {item.received && item.receivedDate && (
                      <p className="text-sm text-muted-foreground ml-7">
                        Ngày nhận: {format(new Date(item.receivedDate), "dd/MM/yyyy", { locale: vi })}
                      </p>
                    )}
                    {item.type === "components" && student.components_details && (
                      <p className="text-sm text-muted-foreground ml-7">
                        Chi tiết: {student.components_details}
                      </p>
                    )}
                  </div>
                  {onMarkReceived && (
                    <Checkbox
                      checked={item.received}
                      onCheckedChange={(checked) =>
                        onMarkReceived(student.id, item.type, checked === true)
                      }
                      disabled={isLoading}
                    />
                  )}
                </div>
              ))}
              {needItems.length === 0 && (
                <p className="text-sm text-muted-foreground">Không có nhu cầu hỗ trợ nào</p>
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
                    {format(new Date(student.created_at), "dd/MM/yyyy HH:mm", { locale: vi })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cập nhật lần cuối</p>
                  <p className="font-medium">
                    {format(new Date(student.updated_at), "dd/MM/yyyy HH:mm", { locale: vi })}
                  </p>
                </div>
              </div>
              {student.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Ghi chú</p>
                  <p className="font-medium whitespace-pre-wrap">{student.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {onEdit && (
          <DialogFooter>
            <Button onClick={() => onEdit(student)} disabled={isLoading}>
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
