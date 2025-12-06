import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    positive: boolean;
  };
  variant?: 'default' | 'primary' | 'secondary';
}

export const StatCard = ({ title, value, subtitle, icon, trend, variant = 'default' }: StatCardProps) => {
  return (
    <div className={cn(
      "stat-card animate-fade-in",
      variant === 'primary' && "bg-primary text-primary-foreground",
      variant === 'secondary' && "bg-secondary text-secondary-foreground"
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className={cn(
            "section-label mb-1",
            variant === 'primary' && "text-primary-foreground/70",
            variant === 'secondary' && "text-secondary-foreground/70"
          )}>
            {title}
          </p>
          <p className="text-3xl font-bold">{value}</p>
          {subtitle && (
            <p className={cn(
              "text-sm mt-1",
              variant === 'default' && "text-muted-foreground",
              variant === 'primary' && "text-primary-foreground/70",
              variant === 'secondary' && "text-secondary-foreground/70"
            )}>
              {subtitle}
            </p>
          )}
          {trend && (
            <p className={cn(
              "text-sm mt-2 font-medium",
              trend.positive ? "text-success" : "text-destructive"
            )}>
              {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}% from last month
            </p>
          )}
        </div>
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          variant === 'default' && "bg-primary/10 text-primary",
          variant === 'primary' && "bg-primary-foreground/20 text-primary-foreground",
          variant === 'secondary' && "bg-secondary-foreground/20 text-secondary-foreground"
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
};
