import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DataPagination } from "@/components/ui/data-pagination";
import { Search, GraduationCap, AlertCircle, HandHeart, MapPin, Calendar, BookOpen, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { usePublicStudents } from "@/hooks/useStudents";
import { usePagination } from "@/hooks/usePagination";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import { StudentSupportForm } from "@/components/forms/StudentSupportForm";
import { ReCaptchaProvider } from "@/components/captcha/ReCaptchaProvider";
import { useAreas } from "@/hooks/useAreas";
import { getStudentCode } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PublicStudents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [academicYearFilter, setAcademicYearFilter] = useState<string>("all");
  const [areaFilter, setAreaFilter] = useState<string>("all");
  const [needTypeFilter, setNeedTypeFilter] = useState<string>("all");
  const [supportFormOpen, setSupportFormOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const pagination = usePagination({ initialPageSize: 12 });

  const { data: areasResult } = useAreas({ isActive: true });
  const areas = areasResult?.data || [];

  const {
    data: studentsResult,
    isLoading,
    error,
  } = usePublicStudents({
    search: searchTerm,
    academicYear: academicYearFilter,
    areaId: areaFilter,
    needType: needTypeFilter,
    page: pagination.page,
    pageSize: pagination.pageSize,
  });

  const students = studentsResult?.data || [];
  const totalCount = studentsResult?.totalCount || 0;
  const totalPages = studentsResult?.totalPages || 0;

  const academicYearLabels: Record<string, string> = {
    "1": "Năm 1",
    "2": "Năm 2",
    "3": "Năm 3",
    "4": "Năm 4",
    "5": "Năm 5+",
  };

  const needTypeLabels: Record<string, string> = {
    laptop: "Laptop",
    motorbike: "Xe máy",
    tuition: "Học phí",
    components: "Linh kiện",
  };

  const getSupportNeeds = (student: any) => {
    const needs: string[] = [];
    if (student.need_laptop && !student.laptop_received) {
      needs.push("Laptop");
    }
    if (student.need_motorbike && !student.motorbike_received) {
      needs.push("Xe máy");
    }
    if (student.need_tuition && !student.tuition_supported) {
      needs.push("Học phí");
    }
    if (student.need_components && !student.components_received) {
      needs.push("Linh kiện");
    }
    return needs;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <SEO
        title="Danh sách sinh viên - Ăn mày laptop"
        description="Danh sách sinh viên đã được phê duyệt cần hỗ trợ. Nhà hảo tâm có thể đăng ký hỗ trợ trực tiếp cho các em."
        keywords="sinh viên, hỗ trợ sinh viên, danh sách sinh viên, ăn mày laptop, laptop, xe máy, học phí, linh kiện"
      />
      
      <PublicHeader />

      {/* Hero Section */}
      <section className="container py-8 md:py-12">
        <div className="mx-auto max-w-4xl text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Danh sách sinh viên
          </h2>
          <p className="text-lg text-muted-foreground">
            Danh sách sinh viên đã được phê duyệt cần hỗ trợ. Nhà hảo tâm có thể đăng ký hỗ trợ trực tiếp cho các em.
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>Lưu ý:</strong> Để bảo vệ thông tin cá nhân, tên và số điện thoại của sinh viên không được hiển thị công khai.
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="container pb-6">
        <div className="mx-auto max-w-4xl space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo hoàn cảnh..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                pagination.setPage(1);
              }}
              className="w-full pl-9"
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select value={academicYearFilter} onValueChange={(value) => {
              setAcademicYearFilter(value);
              pagination.setPage(1);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Năm học" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả năm học</SelectItem>
                <SelectItem value="1">Năm 1</SelectItem>
                <SelectItem value="2">Năm 2</SelectItem>
                <SelectItem value="3">Năm 3</SelectItem>
                <SelectItem value="4">Năm 4</SelectItem>
                <SelectItem value="5">Năm 5+</SelectItem>
              </SelectContent>
            </Select>

            <Select value={areaFilter} onValueChange={(value) => {
              setAreaFilter(value);
              pagination.setPage(1);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Khu vực" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả khu vực</SelectItem>
                {areas.map((area) => (
                  <SelectItem key={area.id} value={area.id}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={needTypeFilter} onValueChange={(value) => {
              setNeedTypeFilter(value);
              pagination.setPage(1);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Nhu cầu hỗ trợ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả nhu cầu</SelectItem>
                <SelectItem value="laptop">Laptop</SelectItem>
                <SelectItem value="motorbike">Xe máy</SelectItem>
                <SelectItem value="tuition">Học phí</SelectItem>
                <SelectItem value="components">Linh kiện</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Students Grid */}
      <section className="container pb-12">
        <div className="mx-auto max-w-7xl">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div>
                  <p className="font-semibold mb-1">Không thể tải dữ liệu sinh viên.</p>
                  <p className="text-sm">
                    {error instanceof Error ? error.message : "Vui lòng thử lại sau hoặc liên hệ quản trị viên."}
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(12)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-4" />
                    <Skeleton className="h-8 w-20" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : students.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <GraduationCap className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {searchTerm || academicYearFilter !== "all" || areaFilter !== "all" || needTypeFilter !== "all"
                  ? "Không tìm thấy sinh viên nào"
                  : "Chưa có sinh viên nào được phê duyệt"}
              </h3>
              <p className="text-muted-foreground max-w-md">
                {searchTerm || academicYearFilter !== "all" || areaFilter !== "all" || needTypeFilter !== "all"
                  ? "Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc để xem tất cả sinh viên."
                  : "Hiện tại chưa có sinh viên nào được phê duyệt. Vui lòng quay lại sau."}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-muted-foreground">
                Tìm thấy {totalCount} sinh viên{totalCount > 1 ? "" : ""} cần hỗ trợ
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {students.map((student) => {
                  const supportNeeds = getSupportNeeds(student);
                  return (
                    <Card
                      key={student.id}
                      className="flex flex-col hover:shadow-lg transition-shadow border-2 hover:border-primary/50 overflow-hidden"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg font-bold">
                              Sinh viên cần hỗ trợ
                            </CardTitle>
                            <CardDescription className="text-sm mt-1 font-mono font-semibold text-primary">
                              Mã: {getStudentCode(student.id, student.birth_year, student.academic_year, student.area_id)}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="flex-1 flex flex-col space-y-3">
                        {/* Basic Info */}
                        <div className="space-y-2">
                          {student.area_name && (
                            <div className="flex items-center gap-2 text-sm bg-primary/5 px-2 py-1.5 rounded-md border border-primary/10">
                              <MapPin className="h-4 w-4 text-primary" />
                              <span className="text-muted-foreground">Khu vực:</span>
                              <span className="font-semibold text-primary">{student.area_name}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Năm sinh:</span>
                            <span className="font-medium">{student.birth_year}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Năm học:</span>
                            <span className="font-medium">
                              {academicYearLabels[student.academic_year] || student.academic_year}
                            </span>
                          </div>
                        </div>

                        {/* Difficult Situation */}
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Hoàn cảnh:
                          </p>
                          <p className="text-sm line-clamp-3">{student.difficult_situation}</p>
                        </div>

                        {/* Support Needs */}
                        {supportNeeds.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              Nhu cầu hỗ trợ:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {supportNeeds.map((need, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary"
                                >
                                  {need}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Components Details */}
                        {student.need_components && student.components_details && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              Chi tiết linh kiện:
                            </p>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {student.components_details}
                            </p>
                          </div>
                        )}

                        <div className="pt-2 border-t space-y-3">
                          <div className="text-xs text-muted-foreground">
                            <p>
                              Ngày đăng:{" "}
                              {format(new Date(student.created_at), "dd/MM/yyyy", { locale: vi })}
                            </p>
                          </div>
                          
                          {/* Support Button */}
                          <Button
                            className="w-full"
                            onClick={() => {
                              setSelectedStudentId(student.id);
                              setSupportFormOpen(true);
                            }}
                          >
                            <HandHeart className="mr-2 h-4 w-4" />
                            Đăng ký hỗ trợ
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8">
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
            </>
          )}
        </div>
      </section>

      {/* Student Support Form */}
      {selectedStudentId && (
        <ReCaptchaProvider siteKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || ""}>
          <StudentSupportForm
            open={supportFormOpen}
            onOpenChange={(open) => {
              setSupportFormOpen(open);
              if (!open) {
                setSelectedStudentId(null);
              }
            }}
            studentId={selectedStudentId}
            onSuccess={() => {
              // Refresh the student list
              window.location.reload();
            }}
          />
        </ReCaptchaProvider>
      )}

      <PublicFooter />
    </div>
  );
}
