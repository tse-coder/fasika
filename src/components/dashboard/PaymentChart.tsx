import { useState, useEffect, useMemo } from "react";
import { usePayments } from "@/stores/payment.store";

import { LoaderIcon } from "@/components/ui/skeleton-card";
import {
  GradientRoundedAreaChart,
  TimeRange,
} from "../ui/gradient-rounded-chart";
import { startOfDay } from "date-fns";

export const PaymentChart = () => {
  const { payments, fetchPayments, isLoading } = usePayments();
  const [timeRange, setTimeRange] = useState<TimeRange>("month");

  useEffect(() => {
    fetchPayments({ limit: 1000, order: "desc" });
  }, [fetchPayments]);

  const chartData = useMemo(() => {
    if (!payments.length) return [];

    const now = new Date();
    const data: { month: string; amount: number }[] = [];

    if (timeRange === "month") {
      // 10 evenly spaced buckets in current month
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const daysInMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0
      ).getDate();

      const step = Math.ceil(daysInMonth / 10);

      for (let i = 0; i < 10; i++) {
        const bucketStart = new Date(start);
        bucketStart.setDate(1 + i * step);

        const bucketEnd = new Date(bucketStart);
        bucketEnd.setDate(bucketStart.getDate() + step);

        const sum = payments.reduce((acc, p) => {
          const d = new Date(p.payment_date);
          return d >= bucketStart && d < bucketEnd
            ? acc + Number(p.total_amount)
            : acc;
        }, 0);

        data.push({
          month: bucketStart.toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
          }),
          amount: Math.round(sum),
        });
      }
    }

    if (timeRange === "year") {
      // ✅ 12 months
      for (let m = 0; m < 12; m++) {
        const start = new Date(now.getFullYear(), m, 1);
        const end = new Date(now.getFullYear(), m + 1, 1);

        const sum = payments.reduce((acc, p) => {
          const d = new Date(p.payment_date);
          return d >= start && d < end ? acc + Number(p.total_amount) : acc;
        }, 0);

        data.push({
          month: start.toLocaleDateString("en-US", { month: "short" }),
          amount: Math.round(sum),
        });
      }
    }

    if (timeRange === "all") {
      // ast 12 years (or fewer if data is new)
      const years = Array.from(
        { length: 12 },
        (_, i) => now.getFullYear() - (11 - i)
      );

      years.forEach((year) => {
        const start = new Date(year, 0, 1);
        const end = new Date(year + 1, 0, 1);

        const sum = payments.reduce((acc, p) => {
          const d = new Date(p.payment_date);
          return d >= start && d < end ? acc + Number(p.total_amount) : acc;
        }, 0);

        data.push({
          month: year.toString(),
          amount: Math.round(sum),
        });
      });
    }

    if (timeRange === "week") {
      //7 days
      for (let i = 6; i >= 0; i--) {
        const day = new Date(now);
        day.setDate(now.getDate() - i);

        const start = startOfDay(day);
        const end = new Date(start);
        end.setDate(start.getDate() + 1);

        const sum = payments.reduce((acc, p) => {
          const d = new Date(p.payment_date);
          return d >= start && d < end ? acc + Number(p.total_amount) : acc;
        }, 0);

        data.push({
          month: day.toLocaleDateString("en-US", { weekday: "short" }),
          amount: Math.round(sum),
        });
      }
    }

    if (timeRange === "quarter") {
      //3 months
      const quarterStart = Math.floor(now.getMonth() / 3) * 3;

      for (let i = 0; i < 3; i++) {
        const start = new Date(now.getFullYear(), quarterStart + i, 1);
        const end = new Date(now.getFullYear(), quarterStart + i + 1, 1);

        const sum = payments.reduce((acc, p) => {
          const d = new Date(p.payment_date);
          return d >= start && d < end ? acc + Number(p.total_amount) : acc;
        }, 0);

        data.push({
          month: start.toLocaleDateString("en-US", { month: "short" }),
          amount: Math.round(sum),
        });
      }
    }

    return data;
  }, [payments, timeRange]);

  const totalAmount = useMemo(
    () => chartData.reduce((s, i) => s + i.amount, 0),
    [chartData]
  );

  if (isLoading && payments.length === 0) {
    return (
      <div className="stat-card h-[400px] flex items-center justify-center">
        <LoaderIcon className="w-6 h-6" />
      </div>
    );
  }

  return (
    <div className="stat-card">
      {chartData.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          No payment data available
        </div>
      ) : (
        <GradientRoundedAreaChart
          title="Payment Collections"
          description="Filtered by selected time range"
          data={chartData}
          total={totalAmount}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
        />
      )}
    </div>
  );
};
