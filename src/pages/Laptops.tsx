import { useState } from "react";
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
import { Search, Filter, MoreHorizontal, Eye, Edit, Trash2, Plus, Laptop, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLaptops } from "@/hooks/useInventory";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const statusLabels: Record<string, string> = {
  available: "Sẵn sàng",
  assigned: "Đã phân",
  delivered: "Đã giao", 
  needs_repair: "Cần sửa",
};

const statusColors: Record<string, "approved" | "pending" | "rejected"> = {
  available: "approved",
  assigned: "pending",
  delivered: "approved", 
  needs_repair: "rejected",
};

export default function Laptops() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const {
    data: laptops = [],
    isLoading,
    error,
  } = useLaptops({
    search: searchTerm,
    status: statusFilter,
  });

  const stats = [
    { label: "Tổng laptop", value: laptops.length, color: "text-foreground" },
    { label: "Cần sửa", value: laptops.filter(l => l.status === "needs_repair").length, color: "text-warning" },
    { label: "Sẵn sàng", value: laptops.filter(l => l.status === "available").length, color: "text-success" },
    { label: "Đã giao", value: laptops.filter(l => l.status === "delivered").length, color: "text-secondary" },
  ];

  return (
    <MainLayout title="Quản lý Laptop" description="Theo dõi và quản lý laptop đã nhận">
      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={stat.label} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <Laptop className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm laptop..."
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
              <SelectItem value="available">Sẵn sàng</SelectItem>
              <SelectItem value="assigned">Đã phân</SelectItem>
              <SelectItem value="delivered">Đã giao</SelectItem>
              <SelectItem value="needs_repair">Cần sửa</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Thêm laptop
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Không thể tải dữ liệu laptop. Vui lòng thử lại sau.
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
      ) : laptops.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Không có laptop nào</p>
          <p className="text-muted-foreground">Chưa có laptop nào trong kho hoặc phù hợp với bộ lọc hiện tại</p>
        </div>
      ) : (
        <div className="table-container animate-fade-in">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model</TableHead>
                <TableHead>Hãng</TableHead>
                <TableHead>Người tặng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ghi chú</TableHead>
                <TableHead>Người nhận</TableHead>
                <TableHead>Ngày nhận</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {laptops.map((laptop) => (
                <TableRow key={laptop.id}>
                  <TableCell className="font-medium">{laptop.model || "Chưa cập nhật"}</TableCell>
                  <TableCell>{laptop.brand || "Chưa cập nhật"}</TableCell>
                  <TableCell>{laptop.donor_name || "Không xác định"}</TableCell>
                  <TableCell>
                    <StatusBadge status={statusColors[laptop.status] || "pending"}>
                      {statusLabels[laptop.status] || laptop.status}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {laptop.notes || laptop.condition || "-"}
                  </TableCell>
                  <TableCell>{laptop.student_name || "-"}</TableCell>
                  <TableCell>
                    {format(new Date(laptop.received_date), "dd/MM/yyyy", { locale: vi })}
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
                        <DropdownMenuItem className="text-destructive">
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
    </MainLayout>
  );
}
