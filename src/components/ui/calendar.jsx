import React, { useState } from 'react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

const Calendar = ({ events = [], onDateClick, className }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Get first day of the month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  
  // Get previous month's last days to fill the calendar
  const prevMonth = new Date(currentYear, currentMonth - 1, 0);
  const daysInPrevMonth = prevMonth.getDate();
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentMonth + direction);
    setCurrentDate(newDate);
  };
  
  const getEventsForDate = (date) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };
  
  const isToday = (date) => {
    return today.getDate() === date && 
           today.getMonth() === currentMonth && 
           today.getFullYear() === currentYear;
  };
  
  const renderCalendarDays = () => {
    const days = [];
    
    // Previous month's days
    for (let i = firstDayWeekday - 1; i >= 0; i--) {
      const date = daysInPrevMonth - i;
      days.push(
        <div key={`prev-${date}`} className="p-2 text-muted-foreground text-sm">
          {date}
        </div>
      );
    }
    
    // Current month's days
    for (let date = 1; date <= daysInMonth; date++) {
      const dayEvents = getEventsForDate(date);
      const isCurrentDay = isToday(date);
      
      days.push(
        <div
          key={date}
          className={cn(
            "p-2 min-h-[80px] border border-border/50 cursor-pointer hover:bg-accent/50 transition-colors",
            isCurrentDay && "bg-primary/10 border-primary"
          )}
          onClick={() => onDateClick && onDateClick(date, currentMonth, currentYear)}
        >
          <div className={cn(
            "text-sm font-medium mb-1",
            isCurrentDay && "text-primary font-bold"
          )}>
            {date}
          </div>
          <div className="space-y-1">
            {dayEvents.slice(0, 2).map((event, index) => (
              <Badge
                key={index}
                variant={event.type === 'exam' ? 'destructive' : 'default'}
                className="text-xs px-1 py-0 block truncate"
              >
                {event.title}
              </Badge>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-muted-foreground">+{dayEvents.length - 2} more</div>
            )}
          </div>
        </div>
      );
    }
    
    // Next month's days to fill the grid
    const totalCells = Math.ceil((firstDayWeekday + daysInMonth) / 7) * 7;
    const remainingCells = totalCells - (firstDayWeekday + daysInMonth);
    
    for (let date = 1; date <= remainingCells; date++) {
      days.push(
        <div key={`next-${date}`} className="p-2 text-muted-foreground text-sm">
          {date}
        </div>
      );
    }
    
    return days;
  };
  
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5" />
            <span>{monthNames[currentMonth]} {currentYear}</span>
          </CardTitle>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth(-1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth(1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-0 border border-border rounded-lg overflow-hidden">
          {/* Day headers */}
          {dayNames.map(day => (
            <div key={day} className="p-3 bg-muted text-center text-sm font-medium border-b border-border">
              {day}
            </div>
          ))}
          {/* Calendar days */}
          {renderCalendarDays()}
        </div>
      </CardContent>
    </Card>
  );
};

export { Calendar };