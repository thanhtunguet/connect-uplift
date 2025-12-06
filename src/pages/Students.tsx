import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StatusBadge } from "@/components/ui/status-badge";
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, MoreHorizontal, Eye, Edit, Trash2, GraduationCap, AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentDetailDialog } from "@/components/students/StudentDetailDialog";
import { useStudents, useMarkReceived, useDeleteStudent } from "@/hooks/useStudents";
import { usePagination } from "@/hooks/usePagination";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { 
  AcademicYear, 
  SupportType,
  academicYearLabels,
  supportTypeLabels 
} from "@/enums";
import { getStudentCode } from "@/lib/utils";

export default function Students() {
  const [searchTerm, setSearchTerm] = useState("");
  const [academicYearFilter, setAcademicYearFilter] = useState<string>("all");
  const [needTypeFilter, setNeedTypeFilter] = useState<string>("all");
  const [receivedFilter, setReceivedFilter] = useState<"received" | "not_received" | "all">("all");
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<{ id: string; name: string } | null>(null);

  const pagination = usePagination({ initialPageSize: 10 });

  const {
    data: studentsResult,
    isLoading,
    error,
  } = useStudents({
    search: searchTerm,
    academicYear: academicYearFilter,
    needType: needTypeFilter,
    receivedStatus: receivedFilter,
    page: pagination.page,
    pageSize: pagination.pageSize,
  });

  const students = studentsResult?.data || [];
  const totalCount = studentsResult?.totalCount || 0;
  const totalPages = studentsResult?.totalPages || 0;

  const markReceivedMutation = useMarkReceived();
  const deleteMutation = useDeleteStudent();

  const selectedStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId) || null;
  }, [students, selectedStudentId]);

  const stats = useMemo(() => {
    const receivedFull = students.filter((s) => {
      return (
        (!s.need_laptop || s.laptop_received) &&
        (!s.need_motorbike || s.motorbike_received) &&
        (!s.need_tuition || s.tuition_supported) &&
        (!s.need_components || s.components_received)
      );
    });
    const notReceived = students.filter((s) => {
      return (
        !s.laptop_received &&
        !s.motorbike_received &&
        !s.tuition_supported &&
        !s.components_received
      );
    });
    return [
      { label: "Tổng sinh viên", value: totalCount, icon: GraduationCap },
      { label: "Đã nhận đầy đủ", value: receivedFull.length, icon: CheckCircle },
      { label: "Chưa nhận hỗ trợ", value: notReceived.length, icon: AlertCircle },
    ];
  }, [students, totalCount]);

  const handleViewDetails = (id: string) => {
    setSelectedStudentId(id);
    setDetailDialogOpen(true);
  };

  const handleMarkReceived = (
    id: string,
    type: "laptop" | "motorbike" | "tuition" | "components",
    received: boolean
  ) => {
    markReceivedMutation.mutate({ id, type, received });
  };

  const handleDelete = (id: string, name: string) => {
    setStudentToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (studentToDelete) {
      deleteMutation.mutate(
        { id: studentToDelete.id },
        {
          onSuccess: () => {
            setDeleteDialogOpen(false);
            setStudentToDelete(null);
          },
        }
      );
    }
  };

  const getStudentNeeds = (student: typeof students[0]) => {
    const needs = [];
    if (student.need_laptop) needs.push(supportTypeLabels[SupportType.LAPTOP]);
    if (student.need_motorbike) needs.push(supportTypeLabels[SupportType.MOTORBIKE]);
    if (student.need_tuition) needs.push(supportTypeLabels[SupportType.TUITION]);
    if (student.need_components) needs.push(supportTypeLabels[SupportType.COMPONENTS]);
    return needs.join(", ");
  };

  const getStudentReceivedStatus = (student: typeof students[0]) => {
    const hasReceivedAll =
      (!student.need_laptop || student.laptop_received) &&
      (!student.need_motorbike || student.motorbike_received) &&
      (!student.need_tuition || student.tuition_supported) &&
      (!student.need_components || student.components_received);

    const hasReceivedSome =
      student.laptop_received ||
      student.motorbike_received ||
      student.tuition_supported ||
      student.components_received;

    if (hasReceivedAll) {
      return { status: "approved" as const, text: "Đã nhận đầy đủ" };
    } else if (hasReceivedSome) {
      return { status: "pending" as const, text: "Đã nhận một phần" };
    } else {
      return { status: "rejected" as const, text: "Chưa nhận" };
    }
  };

  return (
    <MainLayout title="Sinh viên" description="Quản lý thông tin sinh viên cần hỗ trợ">
      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
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
              placeholder="Tìm theo tên, SĐT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-9"
            />
          </div>
          <Select value={academicYearFilter} onValueChange={setAcademicYearFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Năm học" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả năm</SelectItem>
              <SelectItem value={AcademicYear.YEAR_1}>{academicYearLabels[AcademicYear.YEAR_1]}</SelectItem>
              <SelectItem value={AcademicYear.YEAR_2}>{academicYearLabels[AcademicYear.YEAR_2]}</SelectItem>
              <SelectItem value={AcademicYear.YEAR_3}>{academicYearLabels[AcademicYear.YEAR_3]}</SelectItem>
              <SelectItem value={AcademicYear.YEAR_4}>{academicYearLabels[AcademicYear.YEAR_4]}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={needTypeFilter} onValueChange={setNeedTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Nhu cầu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value={SupportType.LAPTOP}>{supportTypeLabels[SupportType.LAPTOP]}</SelectItem>
              <SelectItem value={SupportType.MOTORBIKE}>{supportTypeLabels[SupportType.MOTORBIKE]}</SelectItem>
              <SelectItem value={SupportType.TUITION}>{supportTypeLabels[SupportType.TUITION]}</SelectItem>
              <SelectItem value={SupportType.COMPONENTS}>{supportTypeLabels[SupportType.COMPONENTS]}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={receivedFilter} onValueChange={(value) => setReceivedFilter(value as "received" | "not_received" | "all")}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="received">Đã nhận đủ</SelectItem>
              <SelectItem value="not_received">Chưa nhận đủ</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Không thể tải dữ liệu sinh viên. Vui lòng thử lại sau.
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
      ) : students.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Không có sinh viên nào</p>
          <p className="text-muted-foreground">Chưa có sinh viên nào phù hợp với bộ lọc hiện tại</p>
        </div>
      ) : (
        <div className="table-container animate-fade-in">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã sinh viên</TableHead>
                <TableHead>Họ và tên</TableHead>
                <TableHead>Số điện thoại</TableHead>
                <TableHead>Năm học</TableHead>
                <TableHead>Nhu cầu</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => {
                const receivedStatus = getStudentReceivedStatus(student);
                return (
                  <TableRow key={student.id}>
                    <TableCell className="font-mono font-semibold text-primary">
                      {getStudentCode(student.id, student.birth_year, student.academic_year, student.area_id)}
                    </TableCell>
                    <TableCell className="font-medium">{student.full_name}</TableCell>
                    <TableCell>{student.phone}</TableCell>
                    <TableCell>
                      {academicYearLabels[student.academic_year as AcademicYear] || student.academic_year}
                    </TableCell>
                    <TableCell>{getStudentNeeds(student)}</TableCell>
                    <TableCell>
                      <StatusBadge status={receivedStatus.status}>
                        {receivedStatus.text}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(student.created_at), "dd/MM/yyyy", { locale: vi })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(student.id)}>
                            <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(student.id, student.full_name)}
                          >
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
      {!isLoading && students.length > 0 && (
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

      {/* Student Detail Dialog */}
      <StudentDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        student={selectedStudent}
        onMarkReceived={handleMarkReceived}
        isLoading={markReceivedMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa sinh viên <strong>{studentToDelete?.name}</strong>?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
