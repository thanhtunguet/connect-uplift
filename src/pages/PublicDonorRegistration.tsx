import { DonorRegistrationForm } from "@/components/forms/DonorRegistrationForm";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { RegistrationSuccessScreen } from "@/components/RegistrationSuccessScreen";
import { PublicRegistrationLayout } from "@/components/PublicRegistrationLayout";
import { ReCaptchaProvider } from "@/components/captcha/ReCaptchaProvider";

export default function PublicDonorRegistration() {
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSuccess = () => {
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <RegistrationSuccessScreen
        type="donor"
        onRegisterAgain={() => setIsSuccess(false)}
      />
    );
  }

  // Get reCAPTCHA site key from environment (optional, falls back gracefully if not set)
  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "";

  return (
    <ReCaptchaProvider siteKey={recaptchaSiteKey}>
      <PublicRegistrationLayout
        title="Đăng ký nhà hảo tâm"
        description="Cảm ơn bạn đã muốn đồng hành cùng dự án. Vui lòng điền đầy đủ thông tin bên dưới."
        seoTitle="Đăng ký nhà hảo tâm - Ăn mày laptop"
        seoDescription="Đăng ký trở thành nhà hảo tâm của dự án Ăn mày laptop. Hỗ trợ sinh viên khó khăn với laptop, xe máy, linh kiện và học phí."
        seoKeywords="đăng ký nhà hảo tâm, từ thiện, hỗ trợ sinh viên, ăn mày laptop"
      >
        <DonorRegistrationForm
          onSuccess={handleSuccess}
          onCancel={() => navigate("/")}
        />
      </PublicRegistrationLayout>
    </ReCaptchaProvider>
  );
}
