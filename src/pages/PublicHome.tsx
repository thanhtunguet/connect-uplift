import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Laptop, GraduationCap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function PublicHome() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Laptop className="h-6 w-6" />
            <h1 className="text-xl font-bold">Ăn mày laptop</h1>
          </div>
          <Link to="/auth">
            <Button variant="ghost">Đăng nhập (Admin)</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-12 md:py-24">
        <div className="mx-auto max-w-3xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Heart className="h-4 w-4" />
            Dự án từ thiện
          </div>

          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Kết nối yêu thương,
            <br />
            <span className="text-primary">Lan tỏa hy vọng</span>
          </h2>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Dự án "Ăn mày laptop" kết nối các nhà hảo tâm với sinh viên có hoàn cảnh khó khăn,
            hỗ trợ laptop, xe máy, linh kiện và học phí để các em có thể tiếp tục con đường học vấn.
          </p>
        </div>
      </section>

      {/* Registration Cards */}
      <section className="container pb-12 md:pb-24">
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Donor Registration Card */}
          <Card className="border-2 hover:border-primary transition-colors">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Nhà hảo tâm</CardTitle>
              </div>
              <CardDescription className="text-base">
                Bạn muốn giúp đỡ các sinh viên có hoàn cảnh khó khăn?
                Hãy đăng ký để chúng tôi có thể kết nối bạn với các em cần hỗ trợ.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Hỗ trợ laptop, xe máy, linh kiện hoặc học phí</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Linh hoạt: một lần hoặc định kỳ</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Minh bạch, công khai trên Facebook</span>
                </p>
              </div>
              <Link to="/dang-ky-nha-hao-tam" className="block">
                <Button className="w-full" size="lg">
                  Đăng ký nhà hảo tâm
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Student Registration Card */}
          <Card className="border-2 hover:border-primary transition-colors">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Sinh viên</CardTitle>
              </div>
              <CardDescription className="text-base">
                Bạn đang là sinh viên gặp khó khăn trong học tập?
                Hãy đăng ký để chúng tôi có thể tìm kiếm sự hỗ trợ phù hợp cho bạn.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Nhận laptop, xe máy để học tập và làm thêm</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Hỗ trợ linh kiện sửa chữa laptop</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Kết nối nhà hảo tâm hỗ trợ học phí</span>
                </p>
              </div>
              <Link to="/dang-ky-sinh-vien" className="block">
                <Button className="w-full" size="lg" variant="outline">
                  Đăng ký sinh viên
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How it works */}
      <section className="container pb-12 md:pb-24">
        <div className="mx-auto max-w-3xl">
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Cách hoạt động
          </h3>
          <div className="grid gap-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold mb-1">Đăng ký</h4>
                <p className="text-muted-foreground">
                  Nhà hảo tâm và sinh viên đăng ký thông tin qua form trực tuyến
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold mb-1">Xác minh</h4>
                <p className="text-muted-foreground">
                  Chúng tôi xác minh thông tin và hoàn cảnh của sinh viên
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold mb-1">Kết nối</h4>
                <p className="text-muted-foreground">
                  Kết nối nhà hảo tâm với sinh viên phù hợp về nhu cầu và khả năng
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h4 className="font-semibold mb-1">Công khai</h4>
                <p className="text-muted-foreground">
                  Tất cả hoạt động được báo cáo công khai và minh bạch trên Facebook
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-muted/50">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2024 Dự án "Ăn mày laptop" - Kết nối yêu thương, lan tỏa hy vọng</p>
        </div>
      </footer>
    </div>
  );
}
