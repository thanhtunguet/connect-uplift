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

      {/* Core Principles Banner */}
      <section className="container pb-12 md:pb-24">
        <div className="mx-auto max-w-5xl">
          <Card className="overflow-hidden border-2 border-primary/20">
            <div className="relative">
              <img
                src="https://scontent.fhan14-1.fna.fbcdn.net/v/t39.30808-6/561346745_10163260236397768_958191264658348908_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=cc71e4&_nc_eui2=AeEaVM4IpZBcMOirO4faNEcLOSLcOo0O6ng5Itw6jQ7qeE7GiJo-4Ko46i1pCqDNTTFiWWj-aUVKsPzD8cvgEgM9&_nc_ohc=GzLIqXAcOxYQ7kNvwGR9ix5&_nc_oc=AdnPFBDOl-PxMtMqQ6ISJ8iXYAXxjIVfnw3rRdvVRXqZWs7o17ym4Dp0UJb4rpXEXl8L49l7Q5dlVsNdOcZwWSWz&_nc_zt=23&_nc_ht=scontent.fhan14-1.fna&_nc_gid=2zD_33yDjceuhg7VrjK0jA&oh=00_AflU8zlr_Z_L3V01REUKrvexSzfoBsK2VcRrD2CAHKQVTQ&oe=69390232"
                alt="Nguyên tắc hoạt động dự án"
                className="w-full h-48 md:h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
            </div>
            <CardContent className="p-6 md:p-8">
              <h3 className="text-2xl font-bold mb-6 text-center">
                Nguyên tắc hoạt động của dự án
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                    <span className="text-2xl">🚫</span>
                  </div>
                  <h4 className="font-semibold">Không mua bán laptop</h4>
                  <p className="text-sm text-muted-foreground">
                    Dự án không tham gia hoạt động mua bán laptop
                  </p>
                </div>
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                    <span className="text-2xl">🔧</span>
                  </div>
                  <h4 className="font-semibold">Không nhận sửa máy tính</h4>
                  <p className="text-sm text-muted-foreground">
                    Không nhận sửa chữa máy tính cho mục đích kinh doanh
                  </p>
                </div>
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl">💝</span>
                  </div>
                  <h4 className="font-semibold">Chỉ xin laptop cũ, hỏng</h4>
                  <p className="text-sm text-muted-foreground">
                    Thu gom laptop cũ, hỏng để sửa chữa rồi tặng sinh viên
                  </p>
                </div>
              </div>
              <div className="mt-6 p-4 rounded-lg bg-muted">
                <p className="text-sm text-center">
                  <strong>Cam kết:</strong> Tất cả hoạt động của dự án đều minh bạch, không nhận tiền trực tiếp,
                  và được công khai báo cáo trên Facebook
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* About the Founder */}
      <section className="container pb-12 md:pb-24">
        <div className="mx-auto max-w-3xl">
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-8">
            Người sáng lập dự án
          </h3>
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                <div className="flex-shrink-0">
                  <img
                    src="https://scontent.fhan14-2.fna.fbcdn.net/v/t39.30808-6/415498574_10161009318992768_4314971227842060491_n.jpg?_nc_cat=1&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeFldh3qoDvV53kpwQRG_R3yk75oTM2i-N6TvmhMzaL43sNaql1GfVHaVQY4L7ZbmZtcvBQ97ISqXlGpXxuiOStD&_nc_ohc=kaanxJhIvD4Q7kNvwExrXRN&_nc_oc=Adnlq_gBG8ap7w9Ety7vh33rsmdYUB47nwdPbahaf8XEUPu8uMvJZGx0rsMONYEkh0PaJLoNwCANEn3vIAJz7cy5&_nc_zt=23&_nc_ht=scontent.fhan14-2.fna&_nc_gid=p1MyqXbtyn81zCtKp-2vvw&oh=00_AfkX_usPANIZpFRC6yiulxfnJxg8QXhOiMsObGlVzrqFjg&oe=6938F0F2"
                    alt="Trần Trọng An"
                    className="w-24 h-24 rounded-full object-cover border-2 border-primary/20"
                  />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h4 className="text-xl font-bold mb-2">Trần Trọng An</h4>
                  <p className="text-muted-foreground mb-4">
                    Người khởi xướng và điều hành dự án "Ăn mày laptop"
                  </p>
                  <p className="mb-4">
                    Với mong muốn giúp đỡ các sinh viên có hoàn cảnh khó khăn có thể tiếp cận với
                    công nghệ và tiếp tục con đường học vấn, anh Trần Trọng An đã khởi xướng dự án
                    thu gom laptop cũ để sửa chữa và trao tặng cho sinh viên. Dự án hoạt động dựa trên
                    nguyên tắc minh bạch, không nhận tiền trực tiếp, và tất cả hoạt động đều được
                    công khai trên Facebook.
                  </p>
                  <a
                    href="https://www.facebook.com/trongan.gdm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:underline"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Theo dõi trên Facebook
                  </a>
                </div>
              </div>
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
