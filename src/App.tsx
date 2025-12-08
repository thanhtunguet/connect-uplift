import type { ReactNode } from "react";
import type { RouteRecord } from "vite-react-ssg";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Outlet, useRoutes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Applications from "./pages/Applications";
import Donors from "./pages/Donors";
import Students from "./pages/Students";
import Laptops from "./pages/Laptops";
import Motorbikes from "./pages/Motorbikes";
import Components from "./pages/Components";
import Tuition from "./pages/Tuition";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Areas from "./pages/Areas";
import NotFound from "./pages/NotFound";
import PublicComponentBank from "./pages/PublicComponentBank";
import PublicDonorRegistration from "./pages/PublicDonorRegistration";
import PublicHome from "./pages/PublicHome";
import PublicLaptopBank from "./pages/PublicLaptopBank";
import PublicStudentRegistration from "./pages/PublicStudentRegistration";
import PublicStudents from "./pages/PublicStudents";

const queryClient = new QueryClient();

const AppProviders = ({ children }: { children: ReactNode }) => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>{children}</AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

const RootLayout = () => (
  <AppProviders>
    <Outlet />
  </AppProviders>
);

const publicBaseRoutes: RouteRecord[] = [
  { path: "/", element: <PublicHome /> },
  { path: "/dang-ky-nha-hao-tam", element: <PublicDonorRegistration /> },
  { path: "/dang-ky-sinh-vien", element: <PublicStudentRegistration /> },
  { path: "/ngan-hang-laptop", element: <PublicLaptopBank /> },
  { path: "/ngan-hang-linh-kien", element: <PublicComponentBank /> },
  { path: "/danh-sach-sinh-vien", element: <PublicStudents /> },
  { path: "/auth", element: <Auth /> },
];

const withHtmlAlias = (route: RouteRecord): RouteRecord[] => {
  if (route.path === "/") {
    return [route, { ...route, path: "/index.html" }];
  }
  return [route, { ...route, path: `${route.path}.html` }];
};

export const publicRoutes: RouteRecord[] =
  publicBaseRoutes.flatMap(withHtmlAlias);

const protectedRoutes: RouteRecord[] = [
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <Index />
      </ProtectedRoute>
    ),
  },
  {
    path: "/don-dang-ky",
    element: (
      <ProtectedRoute>
        <Applications />
      </ProtectedRoute>
    ),
  },
  {
    path: "/nha-hao-tam",
    element: (
      <ProtectedRoute>
        <Donors />
      </ProtectedRoute>
    ),
  },
  {
    path: "/sinh-vien",
    element: (
      <ProtectedRoute>
        <Students />
      </ProtectedRoute>
    ),
  },
  {
    path: "/laptop",
    element: (
      <ProtectedRoute>
        <Laptops />
      </ProtectedRoute>
    ),
  },
  {
    path: "/xe-may",
    element: (
      <ProtectedRoute>
        <Motorbikes />
      </ProtectedRoute>
    ),
  },
  {
    path: "/linh-kien",
    element: (
      <ProtectedRoute>
        <Components />
      </ProtectedRoute>
    ),
  },
  {
    path: "/hoc-phi",
    element: (
      <ProtectedRoute>
        <Tuition />
      </ProtectedRoute>
    ),
  },
  {
    path: "/bao-cao",
    element: (
      <ProtectedRoute>
        <Reports />
      </ProtectedRoute>
    ),
  },
  {
    path: "/khu-vuc",
    element: (
      <ProtectedRoute>
        <Areas />
      </ProtectedRoute>
    ),
  },
  {
    path: "/cai-dat",
    element: (
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    ),
  },
];

export const ssgRoutes: RouteRecord[] = [
  {
    path: "/",
    element: <RootLayout />,
    children: [...publicRoutes, { path: "*", element: <NotFound /> }],
  },
];

export const routes: RouteRecord[] = [
  {
    path: "/",
    element: <RootLayout />,
    children: [
      ...publicRoutes,
      ...protectedRoutes,
      { path: "*", element: <NotFound /> },
    ],
  },
];

const AppRoutes = () => useRoutes(routes);

const App = () => (
  <BrowserRouter>
    <AppRoutes />
  </BrowserRouter>
);

export default App;
