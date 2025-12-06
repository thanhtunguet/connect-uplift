import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { LogOut, User, Mail, Calendar, Settings as SettingsIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAppSetting, useUpdateAppSetting } from "@/hooks/useAppSettings";
import { Loader2 } from "lucide-react";

export default function Settings() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: allowSignupsSetting, isLoading: isLoadingSetting } = useAppSetting("allow_signups");
  const updateSetting = useUpdateAppSetting();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Đã đăng xuất",
      description: "Hẹn gặp lại bạn!",
    });
    navigate("/auth");
  };

  const getInitials = (name: string | undefined | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email;

  // Parse allow_signups value
  const allowSignups = allowSignupsSetting?.value === true || 
                       (typeof allowSignupsSetting?.value === "string" && allowSignupsSetting.value.toLowerCase() === "true") ||
                       Boolean(allowSignupsSetting?.value);

  const handleToggleSignups = async (checked: boolean) => {
    await updateSetting.mutateAsync({
      key: "allow_signups",
      value: checked,
    });
  };

  return (
    <MainLayout title="Cài đặt" description="Quản lý tài khoản và cài đặt hệ thống">
      <div className="max-w-2xl space-y-6">
        {/* Profile Card */}
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle>Thông tin tài khoản</CardTitle>
            <CardDescription>Thông tin cá nhân của bạn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {getInitials(fullName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{fullName || "Người dùng"}</h3>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Họ và tên</p>
                  <p className="font-medium">{fullName || "Chưa cập nhật"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ngày tạo tài khoản</p>
                  <p className="font-medium">
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString("vi-VN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Không xác định"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Settings Card */}
        <Card className="animate-slide-up" style={{ animationDelay: "100ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Cài đặt hệ thống
            </CardTitle>
            <CardDescription>Quản lý các cài đặt chung của ứng dụng</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allow-signups" className="text-base">
                  Cho phép đăng ký tài khoản mới
                </Label>
                <p className="text-sm text-muted-foreground">
                  Khi bật, người dùng có thể đăng ký tài khoản mới. Khi tắt, chỉ có thể đăng nhập với tài khoản đã tồn tại.
                </p>
              </div>
              {isLoadingSetting ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : (
                <Switch
                  id="allow-signups"
                  checked={allowSignups}
                  onCheckedChange={handleToggleSignups}
                  disabled={updateSetting.isPending}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Logout Card */}
        <Card className="animate-slide-up border-destructive/20" style={{ animationDelay: "200ms" }}>
          <CardHeader>
            <CardTitle className="text-destructive">Đăng xuất</CardTitle>
            <CardDescription>
              Bạn sẽ cần đăng nhập lại để sử dụng hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
