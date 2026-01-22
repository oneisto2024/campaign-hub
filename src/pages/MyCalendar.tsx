import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Holiday {
  date: string;
  name: string;
  country: string;
}

// Sample holidays data - in a real app, this would come from an API
const sampleHolidays: Holiday[] = [
  { date: '2026-01-01', name: "New Year's Day", country: 'Global' },
  { date: '2026-01-26', name: 'Republic Day', country: 'India' },
  { date: '2026-01-20', name: 'Martin Luther King Jr. Day', country: 'USA' },
  { date: '2026-02-14', name: "Valentine's Day", country: 'Global' },
  { date: '2026-03-17', name: "St. Patrick's Day", country: 'Ireland' },
  { date: '2026-04-03', name: 'Good Friday', country: 'Global' },
  { date: '2026-05-25', name: 'Memorial Day', country: 'USA' },
  { date: '2026-07-04', name: 'Independence Day', country: 'USA' },
  { date: '2026-08-15', name: 'Independence Day', country: 'India' },
  { date: '2026-10-02', name: 'Gandhi Jayanti', country: 'India' },
  { date: '2026-11-11', name: "Diwali", country: 'India' },
  { date: '2026-12-25', name: 'Christmas Day', country: 'Global' },
];

const MyCalendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getHolidaysForMonth = (month: Date): Holiday[] => {
    return sampleHolidays.filter((holiday) => {
      const holidayDate = new Date(holiday.date);
      return (
        holidayDate.getMonth() === month.getMonth() &&
        holidayDate.getFullYear() === month.getFullYear()
      );
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
                holiday: sampleHolidays.map((h) => new Date(h.date)),
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
              Holidays in {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {monthHolidays.length > 0 ? (
              <div className="space-y-4">
                {monthHolidays.map((holiday, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between rounded-lg border border-border p-3"
                  >
                    <div>
                      <p className="font-medium text-foreground">{holiday.name}</p>
                      <p className="text-sm font-light text-muted-foreground">
                        {new Date(holiday.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <Badge variant="secondary" className="font-light">
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
