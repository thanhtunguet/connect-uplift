import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X, Calendar, FileText } from "lucide-react";
import { StudentData } from "@/hooks/useStudents";
import { SupportType, supportTypeLabels } from "@/enums";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface MarkSupportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: StudentData | null;
  onMarkReceived: (
    id: string,
    type: "laptop" | "motorbike" | "tuition" | "components",
    received: boolean,
    note?: string
  ) => void;
  isLoading: boolean;
}

interface SupportItem {
  type: "laptop" | "motorbike" | "tuition" | "components";
  label: string;
  needed: boolean;
  received: boolean;
  receivedDate: string | null;
}

export function MarkSupportDialog({
  open,
  onOpenChange,
  student,
  onMarkReceived,
  isLoading,
}: MarkSupportDialogProps) {
  const [selectedSupports, setSelectedSupports] = useState<{
    [key in "laptop" | "motorbike" | "tuition" | "components"]: boolean;
  }>({
    laptop: false,
    motorbike: false,
    tuition: false,
    components: false,
  });
  const [note, setNote] = useState("");

  if (!student) return null;

  const supportItems: SupportItem[] = [
    {
      type: "laptop",
      label: supportTypeLabels[SupportType.LAPTOP],
      needed: student.need_laptop,
      received: student.laptop_received,
      receivedDate: student.laptop_received_date,
    },
    {
      type: "motorbike",
      label: supportTypeLabels[SupportType.MOTORBIKE],
      needed: student.need_motorbike,
      received: student.motorbike_received,
      receivedDate: student.motorbike_received_date,
    },
    {
      type: "tuition",
      label: supportTypeLabels[SupportType.TUITION],
      needed: student.need_tuition,
      received: student.tuition_supported,
      receivedDate: student.tuition_support_start_date,
    },
    {
      type: "components",
      label: supportTypeLabels[SupportType.COMPONENTS],
      needed: student.need_components,
      received: student.components_received,
      receivedDate: null,
    },
  ];

  const neededSupports = supportItems.filter(item => item.needed);
  const unreceivedSupports = neededSupports.filter(item => !item.received);

  const handleSupportToggle = (type: "laptop" | "motorbike" | "tuition" | "components", checked: boolean) => {
    setSelectedSupports(prev => ({
      ...prev,
      [type]: checked,
    }));
  };

  const handleSubmit = () => {
    if (Object.values(selectedSupports).every(v => !v)) {
      return; // No changes selected
    }

    // Apply changes for each selected support type
    Object.entries(selectedSupports).forEach(([type, isSelected]) => {
      if (isSelected) {
        onMarkReceived(
          student.id,
          type as "laptop" | "motorbike" | "tuition" | "components",
          true,
          note.trim() || undefined
        );
      }
    });

    // Reset form
    setSelectedSupports({
      laptop: false,
      motorbike: false,
      tuition: false,
      components: false,
    });
    setNote("");
    onOpenChange(false);
  };

  const hasSelectedSupports = Object.values(selectedSupports).some(v => v);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Check className="h-5 w-5" />
            Đánh dấu hỗ trợ đã nhận - {student.full_name}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Support Status Overview */}
            <div>
              <h3 className="font-medium mb-3">Tình trạng hỗ trợ hiện tại</h3>
              <div className="grid grid-cols-1 gap-3">
                {neededSupports.map((item) => (
                  <div
                    key={item.type}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{item.label}</span>
                      {item.received ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <Check className="h-3 w-3 mr-1" />
                          Đã nhận
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-600 border-amber-300">
                          <X className="h-3 w-3 mr-1" />
                          Chưa nhận
                        </Badge>
                      )}
                    </div>
                    {item.received && item.receivedDate && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(item.receivedDate), "dd/MM/yyyy", { locale: vi })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {unreceivedSupports.length > 0 && (
              <>
                <Separator />

                {/* Mark as Received Section */}
                <div>
                  <h3 className="font-medium mb-3">Đánh dấu các hỗ trợ đã nhận</h3>
                  <div className="space-y-3">
                    {unreceivedSupports.map((item) => (
                      <div key={item.type} className="flex items-center space-x-3">
                        <Checkbox
                          id={`support-${item.type}`}
                          checked={selectedSupports[item.type]}
                          onCheckedChange={(checked) =>
                            handleSupportToggle(item.type, checked as boolean)
                          }
                        />
                        <Label
                          htmlFor={`support-${item.type}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {item.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Notes Section */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-4 w-4" />
                    <Label htmlFor="support-note" className="font-medium">
                      Ghi chú (không bắt buộc)
                    </Label>
                  </div>
                  <Textarea
                    id="support-note"
                    placeholder="Thêm ghi chú về việc trao hỗ trợ..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
              </>
            )}

            {unreceivedSupports.length === 0 && (
              <div className="text-center py-8">
                <Check className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-lg font-medium">Đã nhận đầy đủ hỗ trợ</p>
                <p className="text-muted-foreground">
                  Sinh viên đã nhận tất cả các loại hỗ trợ cần thiết
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          {unreceivedSupports.length > 0 && (
            <Button
              onClick={handleSubmit}
              disabled={!hasSelectedSupports || isLoading}
            >
              {isLoading ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}