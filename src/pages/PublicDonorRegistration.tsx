import { Button } from "@/components/ui/button";
import { DonorRegistrationForm } from "@/components/forms/DonorRegistrationForm";
import { Laptop, ArrowLeft, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PublicDonorRegistration() {
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSuccess = () => {
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <Laptop className="h-6 w-6" />
              <span className="text-xl font-bold">Ăn mày laptop</span>
            </Link>
          </div>
        </header>

        {/* Success Message */}
        <div className="container py-12 md:py-24">
          <div className="mx-auto max-w-2xl">
            <Card className="border-2 border-primary">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl md:text-3xl">Đăng ký thành công!</CardTitle>
                <CardDescription className="text-base">
                  Cảm ơn bạn đã quan tâm và đăng ký tham gia dự án "Ăn mày laptop"
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Đơn đăng ký của bạn đã được gửi thành công và đang chờ xét duyệt từ đội ngũ quản lý dự án.
                  </p>
                  <p>
                    Chúng tôi sẽ xem xét thông tin và liên hệ với bạn qua số điện thoại hoặc Facebook đã đăng ký trong thời gian sớm nhất.
                  </p>
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="font-semibold mb-2">Bước tiếp theo:</p>
                    <ul className="space-y-1 text-sm">
                      <li>• Đội ngũ sẽ xác minh thông tin đăng ký</li>
                      <li>• Bạn sẽ nhận được thông báo qua điện thoại/Facebook</li>
                      <li>• Sau khi được duyệt, chúng tôi sẽ kết nối bạn với sinh viên phù hợp</li>
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={() => navigate("/")} className="flex-1">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Về trang chủ
                  </Button>
                  <Button onClick={() => setIsSuccess(false)} variant="outline" className="flex-1">
                    Đăng ký thêm
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ArrowLeft className="h-5 w-5" />
            <Laptop className="h-6 w-6" />
            <span className="text-xl font-bold">Ăn mày laptop</span>
          </Link>
        </div>
      </header>

      {/* Registration Form */}
      <div className="container py-8 md:py-12">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Đăng ký nhà hảo tâm</h1>
            <p className="text-muted-foreground">
              Cảm ơn bạn đã muốn đồng hành cùng dự án. Vui lòng điền đầy đủ thông tin bên dưới.
            </p>
          </div>

          <div className="bg-background rounded-lg border p-6 md:p-8 shadow-sm">
            <DonorRegistrationForm
              onSuccess={handleSuccess}
              onCancel={() => navigate("/")}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-8 bg-muted/50 mt-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2024 Dự án "Ăn mày laptop" - Kết nối yêu thương, lan tỏa hy vọng</p>
        </div>
      </footer>
    </div>
  );
}
