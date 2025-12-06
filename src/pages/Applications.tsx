import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DataPagination } from "@/components/ui/data-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Filter, MoreHorizontal, Eye, Check, X, Plus, AlertCircle } from "lucide-react";
import { DonorRegistrationForm } from "@/components/forms/DonorRegistrationForm";
import { StudentRegistrationForm } from "@/components/forms/StudentRegistrationForm";
import { ReCaptchaProvider } from "@/components/captcha/ReCaptchaProvider";
import { ApplicationDetailDialog } from "@/components/applications/ApplicationDetailDialog";
import { RejectApplicationDialog } from "@/components/applications/RejectApplicationDialog";
import {
  useDonorApplications,
  useStudentApplications,
  useUpdateApplicationStatus,
  useDonorApplication,
  useStudentApplication,
  type DonorApplicationData,
  type StudentApplicationData,
} from "@/hooks/useApplications";
import { usePagination } from "@/hooks/usePagination";
import type { ApplicationStatus } from "@/types/applications";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

interface ApplicationTableProps {
  applications: DonorApplicationData[] | StudentApplicationData[];
  type: "donor" | "student";
  isLoading: boolean;
  onViewDetails: (id: string) => void;
  onApprove: (id: string, name: string) => void;
  onReject: (id: string, name: string) => void;
  totalCount: number;
  totalPages: number;
  pagination: ReturnType<typeof usePagination>;
}

function ApplicationTable({ applications, type, isLoading, onViewDetails, onApprove, onReject, totalCount, totalPages, pagination }: ApplicationTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium">Không có đơn đăng ký nào</p>
        <p className="text-muted-foreground">Chưa có đơn đăng ký nào phù hợp với bộ lọc hiện tại</p>
      </div>
    );
  }

  function isDonorApplication(app: any): app is DonorApplicationData {
    return "support_types" in app;
  }

  return (
    <div className="space-y-4">
      <div className="table-container">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Họ và tên</TableHead>
              <TableHead>Số điện thoại</TableHead>
              <TableHead>{type === "donor" ? "Loại hỗ trợ" : "Nhu cầu"}</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày đăng ký</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((app) => {
              const isDonor = isDonorApplication(app);
              const displayInfo = isDonor
                ? app.support_types.map(t => supportTypeMap[t] || t).join(", ")
                : [
                    app.need_laptop && "Laptop",
                    app.need_motorbike && "Xe máy",
                    app.need_components && "Linh kiện",
                    app.need_tuition && "Học phí",
                  ].filter(Boolean).join(", ");

              return (
                <TableRow key={app.id} className="animate-fade-in">
                  <TableCell className="font-medium">{app.full_name}</TableCell>
                  <TableCell>{app.phone}</TableCell>
                  <TableCell>{displayInfo}</TableCell>
                  <TableCell>
                    <StatusBadge status={app.status}>{statusMap[app.status]}</StatusBadge>
                  </TableCell>
                  <TableCell>{format(new Date(app.created_at), "dd/MM/yyyy", { locale: vi })}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewDetails(app.id)}>
                          <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
                        </DropdownMenuItem>
                        {app.status === "pending" && (
                          <>
                            <DropdownMenuItem
                              className="text-success"
                              onClick={() => onApprove(app.id, app.full_name)}
                            >
                              <Check className="mr-2 h-4 w-4" /> Duyệt đơn
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => onReject(app.id, app.full_name)}
                            >
                              <X className="mr-2 h-4 w-4" /> Từ chối
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!isLoading && applications.length > 0 && (
        <DataPagination
          currentPage={pagination.page}
          totalPages={totalPages}
          pageSize={pagination.pageSize}
          totalItems={totalCount}
          onPageChange={pagination.setPage}
          onPageSizeChange={pagination.setPageSize}
        />
      )}
    </div>
  );
}

export default function Applications() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");
  const [activeTab, setActiveTab] = useState<"donors" | "students">("donors");
  const [isDonorDialogOpen, setIsDonorDialogOpen] = useState(false);
  const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [applicationToReject, setApplicationToReject] = useState<{ id: string; name: string } | null>(null);

  const donorPagination = usePagination({ initialPageSize: 10 });
  const studentPagination = usePagination({ initialPageSize: 10 });

  // Fetch applications with filters
  const {
    data: donorApplicationsResult,
    isLoading: isDonorLoading,
    error: donorError,
  } = useDonorApplications({
    search: searchTerm,
    status: statusFilter,
    page: donorPagination.page,
    pageSize: donorPagination.pageSize,
  });

  const {
    data: studentApplicationsResult,
    isLoading: isStudentLoading,
    error: studentError,
  } = useStudentApplications({
    search: searchTerm,
    status: statusFilter,
    page: studentPagination.page,
    pageSize: studentPagination.pageSize,
  });

  const donorApplications = donorApplicationsResult?.data || [];
  const donorTotalCount = donorApplicationsResult?.totalCount || 0;
  const donorTotalPages = donorApplicationsResult?.totalPages || 0;

  const studentApplications = studentApplicationsResult?.data || [];
  const studentTotalCount = studentApplicationsResult?.totalCount || 0;
  const studentTotalPages = studentApplicationsResult?.totalPages || 0;

  // Fetch selected application details
  const { data: selectedDonorApplication } = useDonorApplication(
    activeTab === "donors" && detailDialogOpen ? selectedApplicationId : null
  );

  const { data: selectedStudentApplication } = useStudentApplication(
    activeTab === "students" && detailDialogOpen ? selectedApplicationId : null
  );

  const updateStatusMutation = useUpdateApplicationStatus();

  const handleAddNew = () => {
    if (activeTab === "donors") {
      setIsDonorDialogOpen(true);
    } else {
      setIsStudentDialogOpen(true);
    }
  };

  const handleFormSuccess = () => {
    setIsDonorDialogOpen(false);
    setIsStudentDialogOpen(false);
  };

  const handleViewDetails = (id: string) => {
    setSelectedApplicationId(id);
    setDetailDialogOpen(true);
  };

  const handleApprove = (id: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn duyệt đơn đăng ký của ${name}?`)) {
      updateStatusMutation.mutate({
        id,
        status: "approved",
        type: activeTab === "donors" ? "donor" : "student",
      });
    }
  };

  const handleReject = (id: string, name: string) => {
    setApplicationToReject({ id, name });
    setRejectDialogOpen(true);
  };

  const handleConfirmReject = (reason: string) => {
    if (applicationToReject) {
      updateStatusMutation.mutate(
        {
          id: applicationToReject.id,
          status: "rejected",
          rejectionReason: reason,
          type: activeTab === "donors" ? "donor" : "student",
        },
        {
          onSuccess: () => {
            setRejectDialogOpen(false);
            setApplicationToReject(null);
          },
        }
      );
    }
  };

  const handleApproveFromDetail = (id: string) => {
    const name =
      activeTab === "donors"
        ? selectedDonorApplication?.full_name
        : selectedStudentApplication?.full_name;

    if (name && confirm(`Bạn có chắc chắn muốn duyệt đơn đăng ký của ${name}?`)) {
      updateStatusMutation.mutate(
        {
          id,
          status: "approved",
          type: activeTab === "donors" ? "donor" : "student",
        },
        {
          onSuccess: () => {
            setDetailDialogOpen(false);
          },
        }
      );
    }
  };

  const handleRejectFromDetail = (id: string) => {
    const name =
      activeTab === "donors"
        ? selectedDonorApplication?.full_name
        : selectedStudentApplication?.full_name;

    if (name) {
      setDetailDialogOpen(false);
      setApplicationToReject({ id, name });
      setRejectDialogOpen(true);
    }
  };

  const selectedApplication = useMemo(() => {
    if (activeTab === "donors") return selectedDonorApplication;
    return selectedStudentApplication;
  }, [activeTab, selectedDonorApplication, selectedStudentApplication]);

  return (
    <MainLayout title="Đơn đăng ký" description="Quản lý đơn đăng ký từ nhà hảo tâm và sinh viên">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "donors" | "students")} className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="donors">
              Nhà hảo tâm ({donorApplications.length})
            </TabsTrigger>
            <TabsTrigger value="students">
              Sinh viên ({studentApplications.length})
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên, SĐT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ApplicationStatus | "all")}>
              <SelectTrigger className="w-[140px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="pending">Chờ duyệt</SelectItem>
                <SelectItem value="approved">Đã duyệt</SelectItem>
                <SelectItem value="rejected">Từ chối</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" /> Thêm mới
            </Button>
          </div>
        </div>

        {donorError && activeTab === "donors" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Không thể tải dữ liệu đơn đăng ký nhà hảo tâm. Vui lòng thử lại sau.
            </AlertDescription>
          </Alert>
        )}

        {studentError && activeTab === "students" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Không thể tải dữ liệu đơn đăng ký sinh viên. Vui lòng thử lại sau.
            </AlertDescription>
          </Alert>
        )}

        <TabsContent value="donors" className="animate-fade-in">
          <ApplicationTable
            applications={donorApplications}
            type="donor"
            isLoading={isDonorLoading}
            onViewDetails={handleViewDetails}
            onApprove={handleApprove}
            onReject={handleReject}
            totalCount={donorTotalCount}
            totalPages={donorTotalPages}
            pagination={donorPagination}
          />
        </TabsContent>

        <TabsContent value="students" className="animate-fade-in">
          <ApplicationTable
            applications={studentApplications}
            type="student"
            isLoading={isStudentLoading}
            onViewDetails={handleViewDetails}
            onApprove={handleApprove}
            onReject={handleReject}
            totalCount={studentTotalCount}
            totalPages={studentTotalPages}
            pagination={studentPagination}
          />
        </TabsContent>
      </Tabs>

      {/* Donor Registration Dialog */}
      <Dialog open={isDonorDialogOpen} onOpenChange={setIsDonorDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Đăng ký nhà hảo tâm</DialogTitle>
          </DialogHeader>
          <ReCaptchaProvider siteKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || ""}>
            <DonorRegistrationForm
              onSuccess={handleFormSuccess}
              onCancel={() => setIsDonorDialogOpen(false)}
            />
          </ReCaptchaProvider>
        </DialogContent>
      </Dialog>

      {/* Student Registration Dialog */}
      <Dialog open={isStudentDialogOpen} onOpenChange={setIsStudentDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Đăng ký sinh viên cần hỗ trợ</DialogTitle>
          </DialogHeader>
          <StudentRegistrationForm
            onSuccess={handleFormSuccess}
            onCancel={() => setIsStudentDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Application Detail Dialog */}
      <ApplicationDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        application={selectedApplication || null}
        type={activeTab === "donors" ? "donor" : "student"}
        onApprove={handleApproveFromDetail}
        onReject={handleRejectFromDetail}
        isLoading={updateStatusMutation.isPending}
      />

      {/* Reject Application Dialog */}
      <RejectApplicationDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        onConfirm={handleConfirmReject}
        isLoading={updateStatusMutation.isPending}
        applicantName={applicationToReject?.name || ""}
      />
    </MainLayout>
  );
}
