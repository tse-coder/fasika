import { useEffect } from "react";
import { usePayments } from "@/stores/payment.store";
import { useChildren } from "@/stores/children.store";
import { Link } from "react-router-dom";
import { LoaderIcon } from "@/components/ui/skeleton-card";
import { CreditCard } from "lucide-react";

export const RecentPayments = () => {
  const { payments, fetchPayments, isLoading } = usePayments();
  const { children } = useChildren();

  useEffect(() => {
    fetchPayments({ limit: 5, order: "desc" });
  }, [fetchPayments]);

  const getChildName = (childId: number) => {
    const child = children.find((c) => c.id === childId);
    return child ? `${child.fname} ${child.lname}` : "Unknown";
  };

  const recentPayments = payments.slice(0, 5);

  if (isLoading && payments.length === 0) {
    return (
      <div className="stat-card">
        <h3 className="dashboard-title mb-6">Recent Payments</h3>
        <div className="text-center py-8">
          <LoaderIcon className="w-6 h-6 mx-auto mb-2" />
          <p className="text-muted-foreground">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stat-card">
      <h3 className="dashboard-title mb-6">Recent Payments</h3>
      {recentPayments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No payments recorded yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recentPayments.map((payment) => (
            <Link
              key={payment.id}
              to={`/payments?child=${payment.child_id}`}
              className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {getChildName(payment.child_id)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(payment.payment_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                <p className="font-semibold text-foreground">
                  ETB {parseFloat(payment.total_amount).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {payment.method}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
      <div className="mt-4 text-center">
        <Link to="/payments">
          <button className="text-sm text-primary hover:underline">
            View all payments →
          </button>
        </Link>
      </div>
    </div>
  );
};
