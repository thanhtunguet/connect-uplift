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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Filter, MoreHorizontal, Eye, Edit, Trash2, Heart, AlertCircle, Power } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DonorDetailDialog } from "@/components/donors/DonorDetailDialog";
import { useDonors, useToggleDonorActive, useDeleteDonor } from "@/hooks/useDonors";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { 
  SupportType, 
  SupportFrequency,
  supportTypeLabels,
  supportFrequencyLabels 
} from "@/enums";

export default function Donors() {
  const [searchTerm, setSearchTerm] = useState("");
  const [supportTypeFilter, setSupportTypeFilter] = useState<string>("all");
  const [frequencyFilter, setFrequencyFilter] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<boolean | "all">("all");
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedDonorId, setSelectedDonorId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [donorToDelete, setDonorToDelete] = useState<{ id: string; name: string } | null>(null);

  const {
    data: donors = [],
    isLoading,
    error,
  } = useDonors({
    search: searchTerm,
    supportType: supportTypeFilter,
    frequency: frequencyFilter,
    isActive: activeFilter,
  });

  const toggleActiveMutation = useToggleDonorActive();
  const deleteMutation = useDeleteDonor();

  const selectedDonor = useMemo(() => {
    return donors.find((d) => d.id === selectedDonorId) || null;
  }, [donors, selectedDonorId]);

  const stats = useMemo(() => {
    const activeDonors = donors.filter((d) => d.is_active);
    return [
      { label: "Tổng nhà hảo tâm", value: donors.length, icon: Heart },
      { label: "Đang hoạt động", value: activeDonors.length, icon: Power },
      { label: "Hỗ trợ định kỳ", value: donors.filter((d) => d.support_frequency === SupportFrequency.RECURRING).length, icon: Heart },
    ];
  }, [donors]);

  const handleViewDetails = (id: string) => {
    setSelectedDonorId(id);
    setDetailDialogOpen(true);
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    toggleActiveMutation.mutate({ id, isActive });
  };

  const handleDelete = (id: string, name: string) => {
    setDonorToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (donorToDelete) {
      deleteMutation.mutate(
        { id: donorToDelete.id },
        {
          onSuccess: () => {
            setDeleteDialogOpen(false);
            setDonorToDelete(null);
          },
        }
      );
    }
  };

  return (
    <MainLayout title="Nhà hảo tâm" description="Quản lý thông tin nhà hảo tâm">
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
              placeholder="Tìm theo tên, SĐT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-9"
            />
          </div>
          <Select value={supportTypeFilter} onValueChange={setSupportTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Loại hỗ trợ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại</SelectItem>
              <SelectItem value={SupportType.LAPTOP}>{supportTypeLabels[SupportType.LAPTOP]}</SelectItem>
              <SelectItem value={SupportType.MOTORBIKE}>{supportTypeLabels[SupportType.MOTORBIKE]}</SelectItem>
              <SelectItem value={SupportType.COMPONENTS}>{supportTypeLabels[SupportType.COMPONENTS]}</SelectItem>
              <SelectItem value={SupportType.TUITION}>{supportTypeLabels[SupportType.TUITION]}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={frequencyFilter} onValueChange={setFrequencyFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Tần suất" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value={SupportFrequency.ONE_TIME}>{supportFrequencyLabels[SupportFrequency.ONE_TIME]}</SelectItem>
              <SelectItem value={SupportFrequency.RECURRING}>{supportFrequencyLabels[SupportFrequency.RECURRING]}</SelectItem>
            </SelectContent>
          </Select>
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
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Không thể tải dữ liệu nhà hảo tâm. Vui lòng thử lại sau.
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
      ) : donors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Không có nhà hảo tâm nào</p>
          <p className="text-muted-foreground">Chưa có nhà hảo tâm nào phù hợp với bộ lọc hiện tại</p>
        </div>
      ) : (
        <div className="table-container animate-fade-in">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Họ và tên</TableHead>
                <TableHead>Số điện thoại</TableHead>
                <TableHead>Loại hỗ trợ</TableHead>
                <TableHead>Tần suất</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {donors.map((donor) => (
                <TableRow key={donor.id}>
                  <TableCell className="font-medium">{donor.full_name}</TableCell>
                  <TableCell>{donor.phone}</TableCell>
                  <TableCell>
                    {donor.support_types.map(t => supportTypeLabels[t as SupportType] || t).join(", ")}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={donor.support_frequency === SupportFrequency.RECURRING ? "approved" : "pending"}>
                      {supportFrequencyLabels[donor.support_frequency as SupportFrequency] || donor.support_frequency}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    {donor.is_active ? (
                      <StatusBadge status="approved">Hoạt động</StatusBadge>
                    ) : (
                      <StatusBadge status="rejected">Không hoạt động</StatusBadge>
                    )}
                  </TableCell>
                  <TableCell>
                    {format(new Date(donor.created_at), "dd/MM/yyyy", { locale: vi })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(donor.id)}>
                          <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleActive(donor.id, !donor.is_active)}
                          disabled={toggleActiveMutation.isPending}
                        >
                          <Power className="mr-2 h-4 w-4" />
                          {donor.is_active ? "Vô hiệu hóa" : "Kích hoạt"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(donor.id, donor.full_name)}
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

      {/* Donor Detail Dialog */}
      <DonorDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        donor={selectedDonor}
        onToggleActive={handleToggleActive}
        isLoading={toggleActiveMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa nhà hảo tâm <strong>{donorToDelete?.name}</strong>?
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
