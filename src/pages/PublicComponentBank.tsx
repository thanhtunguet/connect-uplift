import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DataPagination } from "@/components/ui/data-pagination";
import { Search, Wrench, AlertCircle, ExternalLink, MapPin, Phone, Copy, CheckCircle2, HandHeart } from "lucide-react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { usePublicComponents } from "@/hooks/useInventory";
import { usePagination } from "@/hooks/usePagination";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import { ComponentSupportForm } from "@/components/forms/ComponentSupportForm";
import { ReCaptchaProvider } from "@/components/captcha/ReCaptchaProvider";

export default function PublicComponentBank() {
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [supportFormOpen, setSupportFormOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<{
    id: string;
    code: number | null;
    type: string;
  } | null>(null);
  const pagination = usePagination({ initialPageSize: 12 });

  const {
    data: componentsResult,
    isLoading,
    error,
  } = usePublicComponents({
    search: searchTerm,
    page: pagination.page,
    pageSize: pagination.pageSize,
  });

  const components = componentsResult?.data || [];
  const totalCount = componentsResult?.totalCount || 0;
  const totalPages = componentsResult?.totalPages || 0;

  const handleCopyCode = (code: number | null, id: string) => {
    const codeToCopy = code?.toString() || id;
    navigator.clipboard.writeText(codeToCopy);
    setCopiedId(id);
    toast.success("Đã sao chép mã linh kiện!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <SEO
        title="Ngân hàng linh kiện - Ăn mày laptop"
        description="Danh sách linh kiện cần được hỗ trợ để sửa chữa và nâng cấp laptop cho sinh viên có hoàn cảnh khó khăn."
        keywords="linh kiện, ngân hàng linh kiện, linh kiện laptop, RAM, SSD, CPU, màn hình laptop, ăn mày laptop"
      />
      
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Wrench className="h-6 w-6" />
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
            Ngân hàng linh kiện
          </h2>
          <p className="text-lg text-muted-foreground">
            Danh sách linh kiện cần được hỗ trợ để sửa chữa và nâng cấp laptop cho sinh viên có hoàn cảnh khó khăn
          </p>
        </div>
      </section>

      {/* Search Section */}
      <section className="container pb-6">
        <div className="mx-auto max-w-4xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm linh kiện theo loại, hãng, model, thông số kỹ thuật..."
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

      {/* Components Grid */}
      <section className="container pb-12">
        <div className="mx-auto max-w-7xl">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div>
                  <p className="font-semibold mb-1">Không thể tải dữ liệu linh kiện.</p>
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
          ) : components.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Wrench className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {searchTerm ? "Không tìm thấy linh kiện nào" : "Chưa có linh kiện nào cần hỗ trợ"}
              </h3>
              <p className="text-muted-foreground max-w-md">
                {searchTerm
                  ? "Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc để xem tất cả linh kiện."
                  : "Hiện tại chưa có linh kiện nào cần hỗ trợ. Vui lòng quay lại sau."}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-muted-foreground">
                Tìm thấy {totalCount} linh kiện{totalCount > 1 ? "" : ""} cần hỗ trợ
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {components.map((component) => (
                  <Card
                    key={component.id}
                    className="flex flex-col hover:shadow-lg transition-shadow border-2 hover:border-primary/50 overflow-hidden"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg font-bold truncate">
                            {component.component_type}
                          </CardTitle>
                          <CardDescription className="text-sm mt-1 truncate">
                            {component.brand || "Chưa có hãng"} {component.model ? `- ${component.model}` : ""}
                          </CardDescription>
                        </div>
                      </div>
                      
                      {/* Component Code - In đậm và rõ ràng */}
                      <div className="mt-3 p-2 bg-primary/10 rounded-md border border-primary/20">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              Mã linh kiện:
                            </p>
                            <p className="text-2xl font-bold text-primary">
                              {component.component_code || "Chưa có mã"}
                            </p>
                          </div>
                          {component.component_code && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0"
                              onClick={() => handleCopyCode(component.component_code, component.id)}
                              title="Sao chép mã linh kiện"
                            >
                              {copiedId === component.id ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col space-y-3">
                      {component.specifications && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Thông số kỹ thuật:
                          </p>
                          <p className="text-sm line-clamp-3">{component.specifications}</p>
                        </div>
                      )}

                      {component.condition && (
                        <div>
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                            {component.condition}
                          </span>
                        </div>
                      )}

                      {component.notes && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Ghi chú:
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {component.notes}
                          </p>
                        </div>
                      )}

                      {/* Purchase Link */}
                      {component.purchase_link && (
                        <div>
                          <a
                            href={component.purchase_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span>Link đặt hàng</span>
                          </a>
                        </div>
                      )}

                      {/* Delivery Information */}
                      {(component.delivery_address || component.delivery_phone) && (
                        <div className="pt-2 border-t space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">
                            Thông tin nhận hàng:
                          </p>
                          {component.delivery_address && (
                            <div className="flex items-start gap-2 text-xs">
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                              <span className="text-muted-foreground break-words">
                                {component.delivery_address}
                              </span>
                            </div>
                          )}
                          {component.delivery_phone && (
                            <div className="flex items-center gap-2 text-xs">
                              <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <a
                                href={`tel:${component.delivery_phone}`}
                                className="text-primary hover:underline"
                              >
                                {component.delivery_phone}
                              </a>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="pt-2 border-t space-y-3">
                        <div className="text-xs text-muted-foreground">
                          <p>
                            Ngày đăng:{" "}
                            {format(new Date(component.received_date), "dd/MM/yyyy", { locale: vi })}
                          </p>
                        </div>
                        
                        {/* Support Button */}
                        <Button
                          className="w-full"
                          onClick={() => {
                            setSelectedComponent({
                              id: component.id,
                              code: component.component_code,
                              type: component.component_type,
                            });
                            setSupportFormOpen(true);
                          }}
                        >
                          <HandHeart className="mr-2 h-4 w-4" />
                          Nhận hỗ trợ
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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

      {/* Component Support Form */}
      {selectedComponent && (
        <ReCaptchaProvider siteKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || ""}>
          <ComponentSupportForm
            open={supportFormOpen}
            onOpenChange={(open) => {
              setSupportFormOpen(open);
              if (!open) {
                setSelectedComponent(null);
              }
            }}
            componentId={selectedComponent.id}
            componentCode={selectedComponent.code}
            componentType={selectedComponent.type}
            onSuccess={() => {
              // Refresh the component list
              window.location.reload();
            }}
          />
        </ReCaptchaProvider>
      )}

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
