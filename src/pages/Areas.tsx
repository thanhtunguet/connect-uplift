import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Search, MoreHorizontal, Edit, Trash2, MapPin, AlertCircle, Power, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataPagination } from "@/components/ui/data-pagination";
import { useAreas, useCreateArea, useUpdateArea, useToggleAreaActive, useDeleteArea, AreaData } from "@/hooks/useAreas";
import { usePagination } from "@/hooks/usePagination";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

const areaFormSchema = z.object({
  name: z.string().min(2, "Tên khu vực phải có ít nhất 2 ký tự"),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
});

type AreaFormValues = z.infer<typeof areaFormSchema>;

export default function Areas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<boolean | "all">("all");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<AreaData | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [areaToDelete, setAreaToDelete] = useState<{ id: string; name: string } | null>(null);

  const pagination = usePagination({ initialPageSize: 10 });

  const {
    data: areasResult,
    isLoading,
    error,
  } = useAreas({
    search: searchTerm,
    isActive: activeFilter,
    page: pagination.page,
    pageSize: pagination.pageSize,
  });

  const areas = areasResult?.data || [];
  const totalCount = areasResult?.totalCount || 0;
  const totalPages = areasResult?.totalPages || 0;

  const createMutation = useCreateArea();
  const updateMutation = useUpdateArea();
  const toggleActiveMutation = useToggleAreaActive();
  const deleteMutation = useDeleteArea();

  const form = useForm<AreaFormValues>({
    resolver: zodResolver(areaFormSchema),
    defaultValues: {
      name: "",
      description: "",
      is_active: true,
    },
  });

  const stats = useMemo(() => {
    const activeAreas = areas.filter((a) => a.is_active);
    return [
      { label: "Tổng khu vực", value: totalCount, icon: MapPin },
      { label: "Đang hoạt động", value: activeAreas.length, icon: Power },
    ];
  }, [areas, totalCount]);

  const handleAdd = () => {
    setEditingArea(null);
    form.reset({
      name: "",
      description: "",
      is_active: true,
    });
    setEditDialogOpen(true);
  };

  const handleEdit = (area: AreaData) => {
    setEditingArea(area);
    form.reset({
      name: area.name,
      description: area.description || "",
      is_active: area.is_active,
    });
    setEditDialogOpen(true);
  };

  const handleSubmit = (values: AreaFormValues) => {
    if (editingArea) {
      updateMutation.mutate(
        {
          id: editingArea.id,
          updates: values,
        },
        {
          onSuccess: () => {
            setEditDialogOpen(false);
            setEditingArea(null);
            form.reset();
          },
        }
      );
    } else {
      createMutation.mutate(
        {
          area: values,
        },
        {
          onSuccess: () => {
            setEditDialogOpen(false);
            form.reset();
          },
        }
      );
    }
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    toggleActiveMutation.mutate({ id, isActive });
  };

  const handleDelete = (id: string, name: string) => {
    setAreaToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (areaToDelete) {
      deleteMutation.mutate(
        { id: areaToDelete.id },
        {
          onSuccess: () => {
            setDeleteDialogOpen(false);
            setAreaToDelete(null);
          },
        }
      );
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <MainLayout title="Khu vực" description="Quản lý khu vực để kết nối sinh viên và nhà hảo tâm cùng địa bàn">
      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-primary" />
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
              placeholder="Tìm theo tên khu vực..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-9"
            />
          </div>
          <Select
            value={activeFilter === "all" ? "all" : activeFilter ? "active" : "inactive"}
            onValueChange={(value) => setActiveFilter(value === "all" ? "all" : value === "active")}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="active">Hoạt động</SelectItem>
              <SelectItem value="inactive">Không hoạt động</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" /> Thêm khu vực
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Không thể tải dữ liệu khu vực. Vui lòng thử lại sau.
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
      ) : areas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Không có khu vực nào</p>
          <p className="text-muted-foreground">Chưa có khu vực nào phù hợp với bộ lọc hiện tại</p>
        </div>
      ) : (
        <div className="table-container animate-fade-in">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên khu vực</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {areas.map((area) => (
                <TableRow key={area.id}>
                  <TableCell className="font-medium">{area.name}</TableCell>
                  <TableCell>{area.description || "-"}</TableCell>
                  <TableCell>
                    {area.is_active ? (
                      <StatusBadge status="approved">Hoạt động</StatusBadge>
                    ) : (
                      <StatusBadge status="rejected">Không hoạt động</StatusBadge>
                    )}
                  </TableCell>
                  <TableCell>
                    {format(new Date(area.created_at), "dd/MM/yyyy", { locale: vi })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(area)}>
                          <Edit className="mr-2 h-4 w-4" /> Sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleActive(area.id, !area.is_active)}
                          disabled={toggleActiveMutation.isPending}
                        >
                          <Power className="mr-2 h-4 w-4" />
                          {area.is_active ? "Vô hiệu hóa" : "Kích hoạt"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(area.id, area.name)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && areas.length > 0 && (
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

      {/* Add/Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingArea ? "Sửa khu vực" : "Thêm khu vực mới"}</DialogTitle>
            <DialogDescription>
              {editingArea 
                ? "Cập nhật thông tin khu vực" 
                : "Thêm khu vực mới để kết nối sinh viên và nhà hảo tâm cùng địa bàn"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên khu vực *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ví dụ: Hà Nội, TP. Hồ Chí Minh" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Mô tả chi tiết về khu vực..." 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Tùy chọn, mô tả về phạm vi khu vực
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingArea ? "Cập nhật" : "Thêm"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa khu vực <strong>{areaToDelete?.name}</strong>?
              Hành động này không thể hoàn tác và có thể ảnh hưởng đến dữ liệu sinh viên và nhà hảo tâm.
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
