import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: 'primary' | 'success' | 'warning' | 'destructive' | 'muted';
  trend?: {
    value: string;
    positive?: boolean;
  };
}

const iconColorClasses = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-chart-1/20 text-chart-1',
  warning: 'bg-chart-4/20 text-chart-4',
  destructive: 'bg-destructive/10 text-destructive',
  muted: 'bg-muted text-muted-foreground',
};

const StatsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'primary',
  trend,
}: StatsCardProps) => {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-lg',
            iconColorClasses[iconColor]
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div className="mt-4">
        <p className="text-sm font-light text-muted-foreground">{title}</p>
        <div className="mt-1 flex items-baseline gap-2">
          <p className="text-2xl font-semibold text-foreground">{value}</p>
          {trend && (
            <span
              className={cn(
                'text-sm font-light',
                trend.positive ? 'text-chart-1' : 'text-destructive'
              )}
            >
              ({trend.value})
            </span>
          )}
        </div>
        {subtitle && (
          <p className="mt-1 text-xs font-light text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
