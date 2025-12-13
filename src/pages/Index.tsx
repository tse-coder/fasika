import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { PaymentChart } from "@/components/dashboard/PaymentChart";
import { RecentPayments } from "@/components/dashboard/RecentPayments";
import { useChildren } from "@/stores/children.store";
import { usePayments } from "@/stores/payment.store";
import { Users, UserCheck, Wallet, TrendingUp } from "lucide-react";
import { useEffect } from "react";

const Dashboard = () => {
  const { children, fetchChildren } = useChildren();
  const { payments, fetchPayments } = usePayments();

  // fetch children and payments from backend
  useEffect(() => {
    fetchChildren();
    fetchPayments({ limit: 1000 });
  }, [fetchChildren, fetchPayments]);

  // Calculate stats
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const thisMonthPayments = payments.filter((p) => {
    const paymentDate = new Date(p.payment_date);
    return (
      paymentDate.getMonth() === thisMonth &&
      paymentDate.getFullYear() === thisYear
    );
  });

  const totalCollected = thisMonthPayments.reduce(
    (sum, p) => sum + parseFloat(p.total_amount),
    0
  );

  const expectedTotal = children
    .filter((c) => c.is_active)
    .reduce((sum, c) => sum + (c.monthlyFee || 0), 0);

  const collectionRate =
    expectedTotal > 0 ? (totalCollected / expectedTotal) * 100 : 0;

  const stats = {
    totalChildren: children.length,
    activeChildren: children.filter((c) => c.is_active).length,
    totalCollected: totalCollected,
    expectedTotal: expectedTotal,
    collectionRate: collectionRate,
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Stats Grid */}
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

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PaymentChart />
          </div>
          <div>
            <RecentPayments />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
