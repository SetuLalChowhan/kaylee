import React, { useState, useEffect, useRef } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  parseISO,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const PlannerCalendarPopover = ({
  currentDate = new Date(),
  onSelectDate,
  tasks = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(currentDate || new Date());
  const popoverRef = useRef(null);

  // Sync viewDate when currentDate changes externally
  useEffect(() => {
    if (currentDate) {
      setViewDate(currentDate);
    }
  }, [currentDate]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const hasTaskOnDay = (day) => {
    return tasks.some((t) => {
      if (!t.date) return false;
      try {
        const d = parseISO(t.date);
        return isSameDay(d, day);
      } catch {
        return false;
      }
    });
  };

  const handleDateClick = (day) => {
    onSelectDate?.(day);
    setIsOpen(false);
  };

  const handleGoToday = () => {
    const today = new Date();
    setViewDate(today);
    onSelectDate?.(today);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
          isOpen
            ? 'border-Primary bg-blue-50 text-Primary shadow-2xs ring-2 ring-Primary/10'
            : 'border-gray-200/90 bg-white hover:bg-gray-50 text-[#1A1A1A] shadow-2xs'
        }`}
        title="Open calendar"
      >
        <CalendarIcon className="w-3.5 h-3.5 text-Primary" />
        <span className="hidden sm:inline">Calendar</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-Primary' : 'text-gray-400'
          }`}
        />
      </button>

      {/* Floating Small Box Popover (shadcn-style) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 6 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full left-0 mt-2 z-50 w-[280px] bg-white rounded-2xl border border-gray-200/80 shadow-[0_12px_36px_rgba(0,0,0,0.12)] p-3 select-none"
          >
            {/* Popover Header: Month & Navigation */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
              <span className="text-xs font-bold text-[#1A1A1A] tracking-tight pl-1">
                {format(viewDate, 'MMMM yyyy')}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setViewDate(subMonths(viewDate, 1))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                  title="Previous month"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewDate(addMonths(viewDate, 1))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                  title="Next month"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Weekdays Row */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {WEEKDAYS.map((wd) => (
                <div
                  key={wd}
                  className="text-center text-[10px] font-semibold text-gray-400 py-0.5"
                >
                  {wd}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day) => {
                const inCurrentMonth = isSameMonth(day, viewDate);
                const isSelected = isSameDay(day, currentDate);
                const isTodayDate = isToday(day);
                const hasTask = hasTaskOnDay(day);

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => handleDateClick(day)}
                    className={`h-8 w-8 text-xs rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer relative mx-auto ${
                      isSelected
                        ? 'bg-Primary text-white font-bold shadow-xs scale-105'
                        : isTodayDate
                        ? 'bg-blue-50 text-Primary font-bold border border-blue-200 hover:bg-blue-100'
                        : inCurrentMonth
                        ? 'text-[#1A1A1A] hover:bg-gray-100 font-medium'
                        : 'text-gray-300 opacity-40 hover:bg-gray-50 font-normal'
                    }`}
                  >
                    <span className="leading-none">{format(day, 'd')}</span>
                    {hasTask && (
                      <span
                        className={`w-1 h-1 rounded-full mt-0.5 ${
                          isSelected ? 'bg-white' : 'bg-Primary'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Popover Footer: Today shortcut */}
            <div className="pt-2 mt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
              <span className="text-gray-400 font-medium">Jump to date</span>
              <button
                type="button"
                onClick={handleGoToday}
                className="font-bold text-Primary hover:text-Primary/80 hover:underline cursor-pointer"
              >
                Today
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlannerCalendarPopover;
