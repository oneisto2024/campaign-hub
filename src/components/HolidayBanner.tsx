import { useMemo } from 'react';
import { CalendarIcon } from 'lucide-react';
import { useHolidaysForMonth } from '@/hooks/useHolidays';

const HolidayBanner = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const { data: holidays = [], isLoading } = useHolidaysForMonth(year, month);

  const upcomingHolidays = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const todayHolidays = holidays.filter((h) => h.date === todayStr);
    if (todayHolidays.length > 0) return todayHolidays.slice(0, 2);

    const upcoming = holidays
      .filter((h) => h.date > todayStr)
      .sort((a, b) => a.date.localeCompare(b.date));

    if (upcoming.length === 0) return [];
    const nextDate = upcoming[0].date;
    return upcoming.filter((h) => h.date === nextDate).slice(0, 2);
  }, [holidays]);

  if (isLoading) {
    return (
      <div className="px-4 py-2.5 flex items-center bg-rose-100 gap-[16px] rounded border-destructive border-2 animate-pulse">
        <CalendarIcon className="h-4 w-4 text-destructive/70 shrink-0" />
        <span className="text-xs text-muted-foreground">Loading holidays…</span>
      </div>
    );
  }

  if (upcomingHolidays.length === 0) return null;

  const isToday = upcomingHolidays[0].date === new Date().toISOString().split('T')[0];

  return (
    <div className="px-4 py-2.5 flex items-center bg-rose-100 gap-[16px] rounded border-destructive border-2">
      <CalendarIcon className="h-4 w-4 text-destructive/70 shrink-0" />
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {isToday && <span className="font-medium text-destructive/80">Today</span>}
        {!isToday && (
          <span className="font-medium text-destructive/80">
            Upcoming ·{' '}
            {new Date(upcomingHolidays[0].date + 'T00:00:00').toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        )}
        {upcomingHolidays.map((h, i) => (
          <span key={i}>
            <span className="font-medium">{h.country}:</span> {h.name}{' '}
            <span className="text-muted-foreground/60">({h.type})</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default HolidayBanner;
