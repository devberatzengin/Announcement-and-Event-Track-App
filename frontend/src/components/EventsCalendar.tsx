import { useState, useMemo } from 'react';
import type { EventResponse, CategoryResponse } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './ui';

interface EventsCalendarProps {
  events: EventResponse[];
  categories: CategoryResponse[];
  onEventClick?: (event: EventResponse) => void;
  rsvp?: Record<string, any>;
}

const colorPalette = [
  { bg: 'bg-blue-100 dark:bg-blue-500/30', text: 'text-blue-700 dark:text-blue-200', hover: 'hover:bg-blue-200 dark:hover:bg-blue-500/50' },
  { bg: 'bg-purple-100 dark:bg-purple-500/30', text: 'text-purple-700 dark:text-purple-200', hover: 'hover:bg-purple-200 dark:hover:bg-purple-500/50' },
  { bg: 'bg-pink-100 dark:bg-pink-500/30', text: 'text-pink-700 dark:text-pink-200', hover: 'hover:bg-pink-200 dark:hover:bg-pink-500/50' },
  { bg: 'bg-red-100 dark:bg-red-500/30', text: 'text-red-700 dark:text-red-200', hover: 'hover:bg-red-200 dark:hover:bg-red-500/50' },
  { bg: 'bg-amber-100 dark:bg-amber-500/30', text: 'text-amber-700 dark:text-amber-200', hover: 'hover:bg-amber-200 dark:hover:bg-amber-500/50' },
  { bg: 'bg-green-100 dark:bg-green-500/30', text: 'text-green-700 dark:text-green-200', hover: 'hover:bg-green-200 dark:hover:bg-green-500/50' },
  { bg: 'bg-teal-100 dark:bg-teal-500/30', text: 'text-teal-700 dark:text-teal-200', hover: 'hover:bg-teal-200 dark:hover:bg-teal-500/50' },
  { bg: 'bg-cyan-100 dark:bg-cyan-500/30', text: 'text-cyan-700 dark:text-cyan-200', hover: 'hover:bg-cyan-200 dark:hover:bg-cyan-500/50' },
  { bg: 'bg-indigo-100 dark:bg-indigo-500/30', text: 'text-indigo-700 dark:text-indigo-200', hover: 'hover:bg-indigo-200 dark:hover:bg-indigo-500/50' },
  { bg: 'bg-violet-100 dark:bg-violet-500/30', text: 'text-violet-700 dark:text-violet-200', hover: 'hover:bg-violet-200 dark:hover:bg-violet-500/50' },
];

function getDaysInMonth(date: Date): Date[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days: Date[] = [];

  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i));
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push(new Date(year, month + 1, i));
  }

  return days;
}

function isSameDay(d1: Date, d2: Date): boolean {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

function isDateBetween(date: Date, startStr: string, endStr: string): boolean {
  const start = new Date(startStr);
  const end = new Date(endStr);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  date.setHours(0, 0, 0, 0);
  return date >= start && date <= end;
}

export default function EventsCalendar({ events, categories, onEventClick }: EventsCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysToShow = getDaysInMonth(currentDate);

  // Her category'e unique renk ata
  const colorMap = useMemo(() => {
    const map: Record<string, typeof colorPalette[0]> = {};
    categories.forEach((cat, idx) => {
      map[cat.id] = colorPalette[idx % colorPalette.length];
    });
    return map;
  }, [categories]);

  const getEventColor = (event: EventResponse) => {
    return colorMap[event.categoryId] || colorPalette[0];
  };

  const eventsByDay = useMemo(() => {
    const map: Record<string, EventResponse[]> = {};

    events.forEach((event) => {
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);

      // Her gün için event'i ekle (multi-day events için)
      const current = new Date(startDate);
      current.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      while (current <= endDate) {
        const dateKey = current.toISOString().split('T')[0];
        if (!map[dateKey]) {
          map[dateKey] = [];
        }
        map[dateKey].push(event);
        current.setDate(current.getDate() + 1);
      }
    });

    return map;
  }, [events]);

  const getDayEvents = (date: Date): EventResponse[] => {
    const dateKey = date.toISOString().split('T')[0];
    return eventsByDay[dateKey] || [];
  };

  const goToPreviousPeriod = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const goToNextPeriod = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthName = currentDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{monthName}</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={goToPreviousPeriod}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              Bugün
            </button>
            <button
              onClick={goToNextPeriod}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="w-full overflow-x-auto">
        <div className="inline-block w-full min-w-full">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-800">
            {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day) => (
              <div
                key={day}
                className="bg-gray-50 dark:bg-gray-800/50 border-r border-gray-200 dark:border-gray-800 p-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          {Array.from({ length: 6 }).map((_, weekIdx) => (
            <div key={weekIdx} className="grid grid-cols-7">
              {daysToShow.slice(weekIdx * 7, (weekIdx + 1) * 7).map((date, dayIdx) => {
                const dayEvents = getDayEvents(date);
                const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                const isToday = isSameDay(date, new Date());

                return (
                  <div
                    key={dayIdx}
                    className={`border-r border-b border-gray-200 dark:border-gray-800 p-2 min-h-[120px] last:border-r-0 ${
                      isCurrentMonth ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/30'
                    } ${isToday ? 'bg-emerald-50 dark:bg-emerald-500/5' : ''}`}
                  >
                    <div
                      className={`text-xs font-bold mb-1 w-5 h-5 flex items-center justify-center rounded ${
                        isToday
                          ? 'bg-emerald-600 text-white'
                          : isCurrentMonth
                            ? 'text-gray-900 dark:text-white'
                            : 'text-gray-400 dark:text-gray-600'
                      }`}
                    >
                      {date.getDate()}
                    </div>

                    <div className="space-y-0.5 text-xs">
                      {dayEvents.map((event, idx) => {
                        const color = getEventColor(event);
                        return (
                          <button
                            key={`${event.id}-${idx}`}
                            onClick={() => onEventClick?.(event)}
                            className={`w-full text-left px-1.5 py-0.5 rounded truncate transition-colors text-xs font-medium ${color.bg} ${color.text} ${color.hover}`}
                            title={event.name}
                          >
                            {event.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
