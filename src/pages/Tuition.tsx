import { useState } from "react";
import { CreateTuitionForm } from "@/components/forms/CreateTuitionForm";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DataPagination } from "@/components/ui/data-pagination";
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  GraduationCap,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTuitionSupport } from "@/hooks/useInventory";
import { usePagination } from "@/hooks/usePagination";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { 
  SupportFrequency,
  supportFrequencyLabels,
  academicYearLabels,
  AcademicYear 
} from "@/enums";

const statusLabels: Record<string, string> = {
  pledged: "Đã cam kết",
  paid: "Đã thanh toán", 
  completed: "Hoàn thành",
};

const statusColors: Record<string, "approved" | "pending" | "rejected"> = {
  pledged: "pending",
  paid: "approved",
  completed: "approved",
};

const statusIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  pledged: Clock,
  paid: CheckCircle,
  completed: CheckCircle,
};

export default function Tuition() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const pagination = usePagination({ initialPageSize: 10 });

  const {
    data: tuitionSupportsResult,
    isLoading,
    error,
  } = useTuitionSupport({
    search: searchTerm,
    status: statusFilter,
    page: pagination.page,
    pageSize: pagination.pageSize,
  });

  const tuitionSupports = tuitionSupportsResult?.data || [];
  const totalCount = tuitionSupportsResult?.totalCount || 0;
  const totalPages = tuitionSupportsResult?.totalPages || 0;

  const stats = [
    { 
      label: "Tổng cam kết", 
      value: totalCount,
      icon: GraduationCap,
      color: "text-foreground"
    },
    { 
      label: "Đã cam kết", 
      value: tuitionSupports.filter(t => t.status === "pledged").length,
      icon: Clock,
      color: "text-warning"
    },
    { 
      label: "Đã thanh toán", 
      value: tuitionSupports.filter(t => t.status === "paid").length,
      icon: CheckCircle,
      color: "text-success"
    },
    { 
      label: "Tổng số tiền", 
      value: new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND',
        minimumFractionDigits: 0
      }).format(tuitionSupports.reduce((sum, t) => sum + t.amount, 0)),
      icon: DollarSign,
      color: "text-primary"
    },
  ];

  return (
    <MainLayout title="Quản lý Học phí" description="Theo dõi và quản lý hỗ trợ học phí">
      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {typeof stat.value === 'number' && stat.label !== 'Tổng số tiền' ? stat.value : stat.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Actions */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm hỗ trợ học phí..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="pledged">Đã cam kết</SelectItem>
              <SelectItem value="paid">Đã thanh toán</SelectItem>
              <SelectItem value="completed">Hoàn thành</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Thêm hỗ trợ học phí
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Không thể tải dữ liệu hỗ trợ học phí. Vui lòng thử lại sau.
          </AlertDescription>
        </Alert>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : tuitionSupports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Không có hỗ trợ học phí nào</p>
          <p className="text-muted-foreground">Chưa có cam kết hỗ trợ học phí nào hoặc phù hợp với bộ lọc hiện tại</p>
        </div>
      ) : (
        <div className="table-container animate-fade-in">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Người tặng</TableHead>
                <TableHead>Sinh viên</TableHead>
                <TableHead>Số tiền</TableHead>
                <TableHead>Tần suất</TableHead>
                <TableHead>Năm học</TableHead>
                <TableHead>Học kỳ</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày cam kết</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tuitionSupports.map((tuition) => {
                const StatusIcon = statusIcons[tuition.status];
                return (
                  <TableRow key={tuition.id}>
                    <TableCell className="font-medium">{tuition.donor_name || "Không xác định"}</TableCell>
                    <TableCell>{tuition.student_name || "Chưa phân"}</TableCell>
                    <TableCell className="font-mono">
                      {new Intl.NumberFormat('vi-VN', { 
                        style: 'currency', 
                        currency: 'VND',
                        minimumFractionDigits: 0
                      }).format(tuition.amount)}
                    </TableCell>
                    <TableCell>
                      {supportFrequencyLabels[tuition.frequency as SupportFrequency] || tuition.frequency}
                    </TableCell>
                    <TableCell>
                      {tuition.academic_year ? academicYearLabels[tuition.academic_year as AcademicYear] : "-"}
                    </TableCell>
                    <TableCell>{tuition.semester ? `HK${tuition.semester}` : "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <StatusIcon className="h-4 w-4" />
                        <StatusBadge status={statusColors[tuition.status] || "pending"}>
                          {statusLabels[tuition.status] || tuition.status}
                        </StatusBadge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(tuition.pledged_date), "dd/MM/yyyy", { locale: vi })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
                          </DropdownMenuItem>
                          {tuition.status === "pledged" && (
                            <DropdownMenuItem className="text-success">
                              <CheckCircle className="mr-2 h-4 w-4" /> Đánh dấu đã thanh toán
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && tuitionSupports.length > 0 && (
        <div className="mt-6">
          <DataPagination
            currentPage={pagination.page}
            totalPages={totalPages}
            pageSize={pagination.pageSize}
            totalItems={totalCount}
            onPageChange={pagination.setPage}
            onPageSizeChange={pagination.setPageSize}
          />
        </div>
      )}

      <CreateTuitionForm
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </MainLayout>
  );
}