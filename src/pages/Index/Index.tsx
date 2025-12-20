import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useDashboardStats } from "./hooks/useDashboardStats";
import { DashboardStats } from "./components/DashboardStats";
import { DashboardCharts } from "./components/DashboardCharts";

/**
 * Main Dashboard page component
 * Displays statistics, charts, and recent payments
 */
const Dashboard = () => {
  const { stats } = useDashboardStats();

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
