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

// Comprehensive global holidays data
const sampleHolidays: Holiday[] = [
  // Global
  { date: '2026-01-01', name: "New Year's Day", country: 'Global' },
  { date: '2026-02-14', name: "Valentine's Day", country: 'Global' },
  { date: '2026-04-03', name: 'Good Friday', country: 'Global' },
  { date: '2026-04-05', name: 'Easter Sunday', country: 'Global' },
  { date: '2026-12-25', name: 'Christmas Day', country: 'Global' },
  { date: '2026-12-31', name: "New Year's Eve", country: 'Global' },
  
  // USA
  { date: '2026-01-19', name: 'Martin Luther King Jr. Day', country: 'USA' },
  { date: '2026-02-16', name: "Presidents' Day", country: 'USA' },
  { date: '2026-05-25', name: 'Memorial Day', country: 'USA' },
  { date: '2026-07-04', name: 'Independence Day', country: 'USA' },
  { date: '2026-09-07', name: 'Labor Day', country: 'USA' },
  { date: '2026-10-12', name: 'Columbus Day', country: 'USA' },
  { date: '2026-11-11', name: 'Veterans Day', country: 'USA' },
  { date: '2026-11-26', name: 'Thanksgiving', country: 'USA' },
  
  // India
  { date: '2026-01-26', name: 'Republic Day', country: 'India' },
  { date: '2026-03-10', name: 'Holi', country: 'India' },
  { date: '2026-08-15', name: 'Independence Day', country: 'India' },
  { date: '2026-10-02', name: 'Gandhi Jayanti', country: 'India' },
  { date: '2026-10-20', name: 'Dussehra', country: 'India' },
  { date: '2026-11-11', name: 'Diwali', country: 'India' },
  
  // Australia
  { date: '2026-01-26', name: 'Australia Day', country: 'Australia' },
  { date: '2026-04-06', name: 'Easter Monday', country: 'Australia' },
  { date: '2026-04-25', name: 'ANZAC Day', country: 'Australia' },
  { date: '2026-06-08', name: "Queen's Birthday", country: 'Australia' },
  { date: '2026-12-26', name: 'Boxing Day', country: 'Australia' },
  
  // New Zealand
  { date: '2026-01-26', name: 'Auckland Anniversary', country: 'New Zealand' },
  { date: '2026-02-06', name: 'Waitangi Day', country: 'New Zealand' },
  { date: '2026-04-06', name: 'Easter Monday', country: 'New Zealand' },
  { date: '2026-04-25', name: 'ANZAC Day', country: 'New Zealand' },
  { date: '2026-06-01', name: "Queen's Birthday", country: 'New Zealand' },
  { date: '2026-10-26', name: 'Labour Day', country: 'New Zealand' },
  { date: '2026-12-26', name: 'Boxing Day', country: 'New Zealand' },
  
  // UK
  { date: '2026-04-06', name: 'Easter Monday', country: 'UK' },
  { date: '2026-05-04', name: 'Early May Bank Holiday', country: 'UK' },
  { date: '2026-05-25', name: 'Spring Bank Holiday', country: 'UK' },
  { date: '2026-08-31', name: 'Summer Bank Holiday', country: 'UK' },
  { date: '2026-12-26', name: 'Boxing Day', country: 'UK' },
  
  // Canada
  { date: '2026-02-16', name: 'Family Day', country: 'Canada' },
  { date: '2026-04-06', name: 'Easter Monday', country: 'Canada' },
  { date: '2026-05-18', name: 'Victoria Day', country: 'Canada' },
  { date: '2026-07-01', name: 'Canada Day', country: 'Canada' },
  { date: '2026-09-07', name: 'Labour Day', country: 'Canada' },
  { date: '2026-10-12', name: 'Thanksgiving', country: 'Canada' },
  { date: '2026-11-11', name: 'Remembrance Day', country: 'Canada' },
  { date: '2026-12-26', name: 'Boxing Day', country: 'Canada' },
  
  // Germany
  { date: '2026-04-06', name: 'Easter Monday', country: 'Germany' },
  { date: '2026-05-01', name: 'Labour Day', country: 'Germany' },
  { date: '2026-05-14', name: 'Ascension Day', country: 'Germany' },
  { date: '2026-05-25', name: 'Whit Monday', country: 'Germany' },
  { date: '2026-10-03', name: 'German Unity Day', country: 'Germany' },
  { date: '2026-12-26', name: 'Second Christmas Day', country: 'Germany' },
  
  // France
  { date: '2026-04-06', name: 'Easter Monday', country: 'France' },
  { date: '2026-05-01', name: 'Labour Day', country: 'France' },
  { date: '2026-05-08', name: 'Victory in Europe Day', country: 'France' },
  { date: '2026-05-14', name: 'Ascension Day', country: 'France' },
  { date: '2026-07-14', name: 'Bastille Day', country: 'France' },
  { date: '2026-08-15', name: 'Assumption Day', country: 'France' },
  { date: '2026-11-01', name: "All Saints' Day", country: 'France' },
  { date: '2026-11-11', name: 'Armistice Day', country: 'France' },
  
  // Japan
  { date: '2026-01-12', name: 'Coming of Age Day', country: 'Japan' },
  { date: '2026-02-11', name: 'National Foundation Day', country: 'Japan' },
  { date: '2026-02-23', name: "Emperor's Birthday", country: 'Japan' },
  { date: '2026-03-20', name: 'Vernal Equinox Day', country: 'Japan' },
  { date: '2026-04-29', name: 'Showa Day', country: 'Japan' },
  { date: '2026-05-03', name: 'Constitution Memorial Day', country: 'Japan' },
  { date: '2026-05-04', name: 'Greenery Day', country: 'Japan' },
  { date: '2026-05-05', name: "Children's Day", country: 'Japan' },
  { date: '2026-07-20', name: 'Marine Day', country: 'Japan' },
  { date: '2026-09-21', name: 'Respect for the Aged Day', country: 'Japan' },
  { date: '2026-09-23', name: 'Autumnal Equinox Day', country: 'Japan' },
  { date: '2026-11-03', name: 'Culture Day', country: 'Japan' },
  { date: '2026-11-23', name: 'Labour Thanksgiving Day', country: 'Japan' },
  
  // China
  { date: '2026-02-17', name: 'Chinese New Year', country: 'China' },
  { date: '2026-04-04', name: 'Qingming Festival', country: 'China' },
  { date: '2026-05-01', name: 'Labour Day', country: 'China' },
  { date: '2026-05-31', name: 'Dragon Boat Festival', country: 'China' },
  { date: '2026-10-01', name: 'National Day', country: 'China' },
  { date: '2026-10-06', name: 'Mid-Autumn Festival', country: 'China' },
  
  // Singapore
  { date: '2026-02-17', name: 'Chinese New Year', country: 'Singapore' },
  { date: '2026-04-03', name: 'Good Friday', country: 'Singapore' },
  { date: '2026-05-01', name: 'Labour Day', country: 'Singapore' },
  { date: '2026-05-26', name: 'Vesak Day', country: 'Singapore' },
  { date: '2026-08-09', name: 'National Day', country: 'Singapore' },
  { date: '2026-11-11', name: 'Deepavali', country: 'Singapore' },
  
  // UAE
  { date: '2026-01-01', name: "New Year's Day", country: 'UAE' },
  { date: '2026-03-13', name: 'Eid al-Fitr', country: 'UAE' },
  { date: '2026-05-20', name: 'Eid al-Adha', country: 'UAE' },
  { date: '2026-07-08', name: 'Islamic New Year', country: 'UAE' },
  { date: '2026-12-02', name: 'National Day', country: 'UAE' },
  
  // South Africa
  { date: '2026-03-21', name: 'Human Rights Day', country: 'South Africa' },
  { date: '2026-04-06', name: 'Family Day', country: 'South Africa' },
  { date: '2026-04-27', name: 'Freedom Day', country: 'South Africa' },
  { date: '2026-05-01', name: "Workers' Day", country: 'South Africa' },
  { date: '2026-06-16', name: 'Youth Day', country: 'South Africa' },
  { date: '2026-08-09', name: "Women's Day", country: 'South Africa' },
  { date: '2026-09-24', name: 'Heritage Day', country: 'South Africa' },
  { date: '2026-12-16', name: 'Day of Reconciliation', country: 'South Africa' },
  
  // Brazil
  { date: '2026-02-16', name: 'Carnival', country: 'Brazil' },
  { date: '2026-02-17', name: 'Carnival', country: 'Brazil' },
  { date: '2026-04-21', name: 'Tiradentes Day', country: 'Brazil' },
  { date: '2026-05-01', name: 'Labour Day', country: 'Brazil' },
  { date: '2026-06-04', name: 'Corpus Christi', country: 'Brazil' },
  { date: '2026-09-07', name: 'Independence Day', country: 'Brazil' },
  { date: '2026-10-12', name: 'Our Lady of Aparecida', country: 'Brazil' },
  { date: '2026-11-02', name: "All Souls' Day", country: 'Brazil' },
  { date: '2026-11-15', name: 'Republic Day', country: 'Brazil' },
  
  // Mexico
  { date: '2026-02-02', name: 'Constitution Day', country: 'Mexico' },
  { date: '2026-03-16', name: "Benito Juárez's Birthday", country: 'Mexico' },
  { date: '2026-05-01', name: 'Labour Day', country: 'Mexico' },
  { date: '2026-09-16', name: 'Independence Day', country: 'Mexico' },
  { date: '2026-11-02', name: 'Day of the Dead', country: 'Mexico' },
  { date: '2026-11-16', name: 'Revolution Day', country: 'Mexico' },
  
  // Ireland
  { date: '2026-03-17', name: "St. Patrick's Day", country: 'Ireland' },
  { date: '2026-04-06', name: 'Easter Monday', country: 'Ireland' },
  { date: '2026-05-04', name: 'May Bank Holiday', country: 'Ireland' },
  { date: '2026-06-01', name: 'June Bank Holiday', country: 'Ireland' },
  { date: '2026-08-03', name: 'August Bank Holiday', country: 'Ireland' },
  { date: '2026-10-26', name: 'October Bank Holiday', country: 'Ireland' },
  { date: '2026-12-26', name: "St. Stephen's Day", country: 'Ireland' },
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
