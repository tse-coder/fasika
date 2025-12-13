import { CreditCard, TrendingUp, DollarSign } from "lucide-react";
import { usePayments } from "@/stores/payment.store";
import { useMemo } from "react";

export function HeaderExtra() {
  const { payments } = usePayments();

  const stats = useMemo(() => {
    const totalAmount = payments.reduce(
      (sum, p) => sum + parseFloat(p.total_amount),
      0
    );
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const thisMonthPayments = payments.filter((p) => {
      const paymentDate = new Date(p.payment_date);
      return (
        paymentDate.getMonth() === thisMonth &&
        paymentDate.getFullYear() === thisYear
      );
    });
    const thisMonthAmount = thisMonthPayments.reduce(
      (sum, p) => sum + parseFloat(p.total_amount),
      0
    );

    return {
      total: totalAmount,
      thisMonth: thisMonthAmount,
      count: payments.length,
    };
  }, [payments]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="stat-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Payments</p>
            <p className="text-2xl font-bold">
              ETB {stats.total.toLocaleString()}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-primary" />
          </div>
        </div>
      </div>

      <div className="stat-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">This Month</p>
            <p className="text-2xl font-bold">
              ETB {stats.thisMonth.toLocaleString()}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
        </div>
      </div>

      <div className="stat-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Records</p>
            <p className="text-2xl font-bold">{stats.count}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}
