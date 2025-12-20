import { Users, UserCheck, Wallet, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import type { DashboardStats as DashboardStatsType } from "../hooks/useDashboardStats";

interface DashboardStatsProps {
  stats: DashboardStatsType;
}

/**
 * Component to display dashboard statistics in a grid layout
 */
export const DashboardStats = ({ stats }: DashboardStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Children"
        value={stats.totalChildren}
        subtitle="Enrolled students"
        icon={<Users className="w-6 h-6" />}
      />
      <StatCard
        title="Active Students"
        value={stats.activeChildren}
        subtitle="Currently active"
        icon={<UserCheck className="w-6 h-6" />}
        variant="secondary"
      />
      <StatCard
        title="Collected This Month"
        value={`ETB ${stats.totalCollected.toLocaleString()}`}
        subtitle={`of ETB ${stats.expectedTotal.toLocaleString()} expected`}
        icon={<Wallet className="w-6 h-6" />}
      />
      <StatCard
        title="Collection Rate"
        value={`${stats.collectionRate.toFixed(1)}%`}
        subtitle="This month"
        icon={<TrendingUp className="w-6 h-6" />}
        variant="secondary"
      />
    </div>
  );
};
