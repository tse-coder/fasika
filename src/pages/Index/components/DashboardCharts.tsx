import { PaymentChart } from "@/components/dashboard/PaymentChart";
import { RecentPayments } from "@/components/dashboard/RecentPayments";

/**
 * Component to display dashboard charts section
 */
export const DashboardCharts = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <PaymentChart />
      </div>
      <div>
        <RecentPayments />
      </div>
    </div>
  );
};
