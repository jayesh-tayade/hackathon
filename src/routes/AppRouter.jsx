import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { AuthProvider } from "@/context/AuthContext";
import { ROUTES } from "@/constants/routes";
import AIInsights from "@/pages/AIInsights";
import Dashboard from "@/pages/Dashboard";
import LandingPage from "@/pages/LandingPage";
import SettingsPage from "@/pages/Settings";
import Tasks from "@/pages/Tasks";
import Timeline from "@/pages/Timeline";
import ProtectedRoute from "@/routes/ProtectedRoute";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path={ROUTES.HOME} element={<LandingPage />} />

          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
            <Route path={ROUTES.TASKS} element={<Tasks />} />
            <Route path={ROUTES.AI_INSIGHTS} element={<AIInsights />} />
            <Route path={ROUTES.TIMELINE} element={<Timeline />} />
            <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
