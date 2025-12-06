import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DataPagination } from "@/components/ui/data-pagination";
import { Search, Laptop, AlertCircle, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { usePublicLaptops } from "@/hooks/useInventory";
import { usePagination } from "@/hooks/usePagination";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export default function PublicLaptopBank() {
  const [searchTerm, setSearchTerm] = useState("");
  const pagination = usePagination({ initialPageSize: 12 });

  const {
    data: laptopsResult,
    isLoading,
    error,
  } = usePublicLaptops({
    search: searchTerm,
    page: pagination.page,
    pageSize: pagination.pageSize,
  });

  const laptops = laptopsResult?.data || [];
  const totalCount = laptopsResult?.totalCount || 0;
  const totalPages = laptopsResult?.totalPages || 0;

  const conditionLabels: Record<string, string> = {
    new: "Mới",
    old: "Đã qua sử dụng",
    needs_repair: "Cần sửa chữa",
  };

  const conditionColors: Record<string, string> = {
    new: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    old: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    needs_repair: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <SEO
        title="Ngân hàng laptop - Ăn mày laptop"
        description="Danh sách laptop đang sẵn sàng để tặng cho sinh viên có hoàn cảnh khó khăn. Xem các laptop đã được sửa chữa và sẵn sàng trao tặng."
        keywords="laptop, ngân hàng laptop, laptop tặng sinh viên, laptop cũ, ăn mày laptop"
      />
      
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Laptop className="h-6 w-6" />
            <h1 className="text-xl font-bold">Ăn mày laptop</h1>
          </Link>
          <Link to="/auth">
            <Button variant="ghost">Đăng nhập(Admin)</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-8 md:py-12">
        <div className="mx-auto max-w-4xl text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Ngân hàng laptop
          </h2>
          <p className="text-lg text-muted-foreground">
            Danh sách laptop đang sẵn sàng để tặng cho sinh viên có hoàn cảnh khó khăn
          </p>
        </div>
      </section>

      {/* Search Section */}
      <section className="container pb-6">
        <div className="mx-auto max-w-4xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm laptop theo hãng, model, thông số kỹ thuật..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                pagination.setPage(1); // Reset to first page on search
              }}
              className="w-full pl-9"
            />
          </div>
        </div>
      </section>

      {/* Laptops Grid */}
      <section className="container pb-12">
        <div className="mx-auto max-w-7xl">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div>
                  <p className="font-semibold mb-1">Không thể tải dữ liệu laptop.</p>
                  <p className="text-sm">
                    {error instanceof Error ? error.message : "Vui lòng thử lại sau hoặc liên hệ quản trị viên."}
                  </p>
                  {process.env.NODE_ENV === 'development' && (
                    <details className="mt-2 text-xs">
                      <summary className="cursor-pointer">Chi tiết lỗi (dev only)</summary>
                      <pre className="mt-2 p-2 bg-destructive/10 rounded overflow-auto">
                        {JSON.stringify(error, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
          ) : laptops.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Laptop className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {searchTerm ? "Không tìm thấy laptop nào" : "Chưa có laptop nào sẵn sàng"}
              </h3>
              <p className="text-muted-foreground max-w-md">
                {searchTerm
                  ? "Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc để xem tất cả laptop."
                  : "Hiện tại chưa có laptop nào trong trạng thái sẵn sàng. Vui lòng quay lại sau."}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-muted-foreground">
                Tìm thấy {totalCount} laptop{totalCount > 1 ? "s" : ""} sẵn sàng
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {laptops.map((laptop) => {
                  const imageUrl = (laptop as any).image_url;
                  return (
                    <Card
                      key={laptop.id}
                      className="flex flex-col hover:shadow-lg transition-shadow border-2 hover:border-primary/50 overflow-hidden"
                    >
                      {/* Image Section */}
                      <div className="relative w-full h-48 bg-muted flex items-center justify-center overflow-hidden">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={`${laptop.brand} ${laptop.model}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to icon if image fails to load
                              e.currentTarget.style.display = "none";
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                parent.innerHTML = `<div class="w-full h-full flex items-center justify-center"><svg class="h-16 w-16 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></div>`;
                              }
                            }}
                          />
                        ) : (
                          <Laptop className="h-16 w-16 text-muted-foreground/50" />
                        )}
                        <div className="absolute top-2 right-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500 bg-white rounded-full" />
                        </div>
                      </div>

                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg font-bold truncate">
                              {laptop.brand || "Chưa cập nhật"}
                            </CardTitle>
                            <CardDescription className="text-sm mt-1 truncate">
                              {laptop.model || "Chưa có model"}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col space-y-3">
                      {laptop.specifications && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Thông số kỹ thuật:
                          </p>
                          <p className="text-sm line-clamp-3">{laptop.specifications}</p>
                        </div>
                      )}

                      {laptop.condition && (
                        <div>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              conditionColors[laptop.condition] || conditionColors.old
                            }`}
                          >
                            {conditionLabels[laptop.condition] || laptop.condition}
                          </span>
                        </div>
                      )}

                      {laptop.notes && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Ghi chú:
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {laptop.notes}
                          </p>
                        </div>
                      )}

                      <div className="pt-2 border-t text-xs text-muted-foreground">
                        <p>
                          Ngày nhận:{" "}
                          {format(new Date(laptop.received_date), "dd/MM/yyyy", { locale: vi })}
                        </p>
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

      {/* Footer */}
      <footer className="border-t py-8 bg-muted/50 mt-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2024 Dự án "Ăn mày laptop" - Kết nối yêu thương, lan tỏa hy vọng</p>
          <div className="mt-4 flex justify-center gap-4">
            <Link to="/" className="hover:text-primary transition-colors">
              Trang chủ
            </Link>
            <Link to="/dang-ky-nha-hao-tam" className="hover:text-primary transition-colors">
              Đăng ký nhà hảo tâm
            </Link>
            <Link to="/dang-ky-sinh-vien" className="hover:text-primary transition-colors">
              Đăng ký sinh viên
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
