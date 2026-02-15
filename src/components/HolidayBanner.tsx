import { useMemo } from 'react';
import { CalendarIcon } from 'lucide-react';

interface Holiday {
  date: string;
  name: string;
  country: string;
  type: string;
}

const HOLIDAYS: Holiday[] = [
  { date: '2026-01-01', name: "New Year's Day", country: 'Global', type: 'Public' },
  { date: '2026-01-19', name: 'Martin Luther King Jr. Day', country: 'USA', type: 'Federal' },
  { date: '2026-01-26', name: 'Republic Day', country: 'India', type: 'National' },
  { date: '2026-01-26', name: 'Australia Day', country: 'Australia', type: 'National' },
  { date: '2026-02-06', name: 'Waitangi Day', country: 'New Zealand', type: 'National' },
  { date: '2026-02-11', name: 'National Foundation Day', country: 'Japan', type: 'National' },
  { date: '2026-02-14', name: "Valentine's Day", country: 'Global', type: 'Observance' },
  { date: '2026-02-16', name: "Presidents' Day", country: 'USA', type: 'Federal' },
  { date: '2026-02-16', name: 'Family Day', country: 'Canada', type: 'Provincial' },
  { date: '2026-02-17', name: 'Chinese New Year', country: 'China', type: 'National' },
  { date: '2026-02-23', name: "Emperor's Birthday", country: 'Japan', type: 'National' },
  { date: '2026-03-10', name: 'Holi', country: 'India', type: 'National' },
  { date: '2026-03-17', name: "St. Patrick's Day", country: 'Ireland', type: 'National' },
  { date: '2026-03-21', name: 'Human Rights Day', country: 'South Africa', type: 'Public' },
  { date: '2026-04-03', name: 'Good Friday', country: 'Global', type: 'Religious' },
  { date: '2026-04-05', name: 'Easter Sunday', country: 'Global', type: 'Religious' },
  { date: '2026-04-25', name: 'ANZAC Day', country: 'Australia', type: 'National' },
  { date: '2026-05-01', name: 'Labour Day', country: 'Global', type: 'Public' },
  { date: '2026-05-25', name: 'Memorial Day', country: 'USA', type: 'Federal' },
  { date: '2026-07-04', name: 'Independence Day', country: 'USA', type: 'Federal' },
  { date: '2026-07-14', name: 'Bastille Day', country: 'France', type: 'National' },
  { date: '2026-08-15', name: 'Independence Day', country: 'India', type: 'National' },
  { date: '2026-09-07', name: 'Labor Day', country: 'USA', type: 'Federal' },
  { date: '2026-10-02', name: 'Gandhi Jayanti', country: 'India', type: 'National' },
  { date: '2026-10-03', name: 'German Unity Day', country: 'Germany', type: 'National' },
  { date: '2026-11-11', name: 'Diwali', country: 'India', type: 'National' },
  { date: '2026-11-26', name: 'Thanksgiving', country: 'USA', type: 'Federal' },
  { date: '2026-12-25', name: 'Christmas Day', country: 'Global', type: 'Public' },
  { date: '2026-12-26', name: 'Boxing Day', country: 'Australia', type: 'National' },
];

const HolidayBanner = () => {
  const upcomingHolidays = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    // Show today's holidays first
    const todayHolidays = HOLIDAYS.filter(h => h.date === todayStr);
    if (todayHolidays.length > 0) return todayHolidays.slice(0, 2);

    // Otherwise show next upcoming
    const upcoming = HOLIDAYS
      .filter(h => h.date > todayStr)
      .sort((a, b) => a.date.localeCompare(b.date));
    
    if (upcoming.length === 0) return [];
    const nextDate = upcoming[0].date;
    return upcoming.filter(h => h.date === nextDate).slice(0, 2);
  }, []);

  if (upcomingHolidays.length === 0) return null;

  const isToday = upcomingHolidays[0].date === new Date().toISOString().split('T')[0];

  return (
    <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-2.5 flex items-center gap-3">
      <CalendarIcon className="h-4 w-4 text-destructive/70 shrink-0" />
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {isToday && <span className="font-medium text-destructive/80">Today</span>}
        {!isToday && (
          <span className="font-medium text-destructive/80">
            Upcoming · {new Date(upcomingHolidays[0].date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
        {upcomingHolidays.map((h, i) => (
          <span key={i}>
            <span className="font-medium">{h.country}:</span>{' '}
            {h.name} <span className="text-muted-foreground/60">({h.type})</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default HolidayBanner;
