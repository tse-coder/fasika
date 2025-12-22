import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useDashboardStats } from "./hooks/useDashboardStats";
import { DashboardStats } from "./components/DashboardStats";
import { DashboardCharts } from "./components/DashboardCharts";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/stores/auth.store";

/**
 * Main Dashboard page component
 * Displays statistics, charts, and recent payments
 */
const Dashboard = () => {
  const { stats } = useDashboardStats();
  const { user } = useAuth();

  if (user?.role !== "ADMIN") {
    return <Navigate to="/payments" replace />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <DashboardStats stats={stats} />
        <DashboardCharts />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
