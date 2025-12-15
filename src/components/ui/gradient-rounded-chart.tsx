"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { useState } from "react";

type GradientRoundedAreaChartProps = {
  title: string;
  description?: string;
  data: Array<{
    month: string;
    amount: number;
  }>;
  total?: number;
  trend?: {
    value: string;
    direction: "up" | "down";
  };
  timeRange?: TimeRange;
  onTimeRangeChange?: (range: TimeRange) => void;
};

const chartConfig = {
  amount: {
    label: "Amount (ETB)",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;
export type TimeRange = "week" | "month" | "quarter" | "year" | "all";

export function GradientRoundedAreaChart({
  title,
  description,
  data,
  total,
  trend,
  timeRange: externalTimeRange,
  onTimeRangeChange,
}: GradientRoundedAreaChartProps) {
  const [internalTimeRange, setInternalTimeRange] =
    useState<TimeRange>("month");
  const timeRange = externalTimeRange ?? internalTimeRange;

  const handleTimeRangeChange = (v: string) => {
    const newRange = v as TimeRange;
    if (onTimeRangeChange) {
      onTimeRangeChange(newRange);
    } else {
      setInternalTimeRange(newRange);
    }
  };

  return (
    <Card>
      <div className="flex flex-row items-start justify-between">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {title}
            {trend && (
              <Badge
                variant="outline"
                className={
                  trend.direction === "down"
                    ? "text-red-500 bg-red-500/10 border-none"
                    : "text-green-500 bg-green-500/10 border-none"
                }
              >
                {trend.direction === "down" ? (
                  <TrendingDown className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingUp className="h-4 w-4 mr-1" />
                )}
                {trend.value}
              </Badge>
            )}
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <Select value={timeRange} onValueChange={handleTimeRangeChange}>
          <SelectTrigger className="w-[180px] m-5">
            <SelectValue />
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

      <CardContent>
        {total !== undefined && (
          <div className="mb-4 text-center">
            <p className="text-2xl font-bold">ETB {total.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">
              Total in selected period
            </p>
          </div>
        )}

        <ChartContainer
          config={chartConfig}
          className="h-[250px] sm:h-[300px] md:h-[350px] w-full"
        >
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: 10,
              bottom: 40,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />

            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              angle={-45}
              textAnchor="end"
              height={60}
              interval="preserveStartEnd"
              tick={{ fontSize: 12 }}
            />

            <YAxis
              tickFormatter={(v) => `ETB ${(v / 1000).toFixed(0)}k`}
              width={60}
              tick={{ fontSize: 12 }}
            />

            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value) => [
                    `ETB ${Number(value).toLocaleString()}`,
                    "Amount",
                  ]}
                />
              }
            />

            <defs>
              <linearGradient id="gradient-payment" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-amount)"
                  stopOpacity={0.5}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-amount)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>

            <Area
              dataKey="amount"
              type="natural"
              fill="url(#gradient-payment)"
              stroke="var(--color-amount)"
              fillOpacity={0.4}
              strokeWidth={1}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
