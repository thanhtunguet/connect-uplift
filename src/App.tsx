import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import PublicHome from "./pages/PublicHome";
import PublicDonorRegistration from "./pages/PublicDonorRegistration";
import PublicStudentRegistration from "./pages/PublicStudentRegistration";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Applications from "./pages/Applications";
import Donors from "./pages/Donors";
import Students from "./pages/Students";
import Laptops from "./pages/Laptops";
import Motorbikes from "./pages/Motorbikes";
import Components from "./pages/Components";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes - No authentication required */}
            <Route path="/" element={<PublicHome />} />
            <Route path="/dang-ky-nha-hao-tam" element={<PublicDonorRegistration />} />
            <Route path="/dang-ky-sinh-vien" element={<PublicStudentRegistration />} />
            <Route path="/auth" element={<Auth />} />

            {/* Admin Routes - Authentication required */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route
              path="/don-dang-ky"
              element={
                <ProtectedRoute>
                  <Applications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nha-hao-tam"
              element={
                <ProtectedRoute>
                  <Donors />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sinh-vien"
              element={
                <ProtectedRoute>
                  <Students />
                </ProtectedRoute>
              }
            />
            <Route
              path="/laptop"
              element={
                <ProtectedRoute>
                  <Laptops />
                </ProtectedRoute>
              }
            />
            <Route
              path="/xe-may"
              element={
                <ProtectedRoute>
                  <Motorbikes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/linh-kien"
              element={
                <ProtectedRoute>
                  <Components />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bao-cao"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cai-dat"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
