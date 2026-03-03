import { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import HolidayBanner from '@/components/HolidayBanner';
import { useHolidaysForMonth } from '@/hooks/useHolidays';
import type { Holiday } from '@/hooks/useHolidays';

const MyCalendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth() + 1;
  const { data: holidays = [], isLoading, isError } = useHolidaysForMonth(year, month);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  const getHolidaysForMonth = (m: Date): Holiday[] => {
    return holidays.filter((holiday) => {
      const holidayDate = new Date(holiday.date + 'T00:00:00');
      const sameMonth =
        holidayDate.getMonth() === m.getMonth() &&
        holidayDate.getFullYear() === m.getFullYear();
      // Only show holidays strictly after today
      return sameMonth && holiday.date > todayStr;
    });
  };

  const monthHolidays = getHolidaysForMonth(currentMonth);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">My Calendar</h1>
        <p className="text-sm font-light text-muted-foreground">
          View national holidays from around the world
        </p>
      </div>

      <HolidayBanner />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-medium">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              onMonthChange={setCurrentMonth}
              className="rounded-md border"
              modifiers={{
                holiday: holidays.map((h) => new Date(h.date + 'T00:00:00')),
              }}
              modifiersClassNames={{
                holiday: 'bg-primary/20 text-primary font-medium',
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              Holidays in{' '}
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : isError ? (
              <p className="text-center text-sm font-light text-destructive">
                Failed to load holidays. Please try again later.
              </p>
            ) : monthHolidays.length > 0 ? (
              <div className="space-y-4">
                {monthHolidays.map((holiday, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between rounded-lg border border-border p-3"
                  >
                    <div>
                      <p className="font-medium text-foreground">{holiday.name}</p>
                      <p className="text-sm font-light text-muted-foreground">
                        {new Date(holiday.date + 'T00:00:00').toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <Badge variant="secondary" className="font-light shrink-0">
                      {holiday.country}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm font-light text-muted-foreground">
                No holidays this month
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyCalendar;
