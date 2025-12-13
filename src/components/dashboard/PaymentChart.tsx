import { useState, useEffect, useMemo } from "react";
import { usePayments } from "@/stores/payment.store";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"; // <-- new chart system

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { LoaderIcon } from "@/components/ui/skeleton-card";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

type TimeRange = "week" | "month" | "quarter" | "year" | "all";

export const PaymentChart = () => {
  const { payments, fetchPayments, isLoading } = usePayments();
  const [timeRange, setTimeRange] = useState<TimeRange>("month");

  useEffect(() => {
    fetchPayments({ limit: 1000, order: "desc" });
  }, [fetchPayments]);

  const chartData = useMemo(() => {
    if (!payments.length) return [];

    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "quarter": {
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      }
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(0);
    }

    const filteredPayments = payments.filter((p) => {
      const paymentDate = new Date(p.payment_date);
      return paymentDate >= startDate;
    });

    const monthlyData: Record<string, number> = {};

    filteredPayments.forEach((payment) => {
      const date = new Date(payment.payment_date);
      const monthLabel = date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });

      monthlyData[monthLabel] ??= 0;
      monthlyData[monthLabel] += parseFloat(payment.total_amount);
    });

    return Object.entries(monthlyData)
      .map(([month, amount]) => ({
        month,
        amount: Math.round(amount),
      }))
      .sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA.getTime() - dateB.getTime();
      });
  }, [payments, timeRange]);

  const totalAmount = useMemo(
    () => chartData.reduce((sum, item) => sum + item.amount, 0),
    [chartData],
  );

  if (isLoading && payments.length === 0) {
    return (
      <div className="stat-card h-[400px] flex items-center justify-center">
        <div className="text-center">
          <LoaderIcon className="w-6 h-6 mx-auto mb-2" />
          <p className="text-muted-foreground">Loading payment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="dashboard-title">Monthly Collections</h3>

        <Select
          value={timeRange}
          onValueChange={(v) => setTimeRange(v as TimeRange)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {chartData.length === 0 ? (
        <div className="h-[400px] flex items-center justify-center text-muted-foreground">
          <p>No payment data available for the selected time range</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-2xl font-bold">
              ETB {totalAmount.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">
              Total in selected period
            </p>
          </div>

          <ChartContainer
            className="h-[300px]"
            config={{
              amount: {
                label: "Amount (ETB)",
                color: "hsl(var(--chart-1))",
              },
            }}
          >
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />

              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(v) => `ETB ${(v / 1000).toFixed(0)}k`}
              />

              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => [
                      `ETB ${Number(value).toLocaleString()}`,
                      "Amount",
                    ]}
                  />
                }
              />

              <Bar
                dataKey="amount"
                fill="var(--color-amount)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </div>
      )}
    </div>
  );
};
