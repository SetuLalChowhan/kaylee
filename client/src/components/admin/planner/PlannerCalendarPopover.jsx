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
  const buttonRef = useRef(null);

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
        return isSameDay(parseISO(t.date), day);
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

  const [popoverStyle, setPopoverStyle] = useState({});

  const openPopover = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const popoverWidth = 272;
      const viewportWidth = window.innerWidth;
      const padding = 12;

      let left = rect.left;
      // Prevent overflow on the right
      if (left + popoverWidth > viewportWidth - padding) {
        left = viewportWidth - popoverWidth - padding;
      }
      // Never go off the left
      if (left < padding) left = padding;

      setPopoverStyle({
        position: 'fixed',
        top: rect.bottom + 8,
        left,
        width: popoverWidth,
        zIndex: 9990,
      });
    }
    setIsOpen(true);
  };

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => (isOpen ? setIsOpen(false) : openPopover())}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
          isOpen
            ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-sm ring-2 ring-blue-500/10'
            : 'border-gray-200 bg-white hover:bg-gray-50 text-[#1A1A1A] shadow-sm'
        }`}
        title="Open calendar"
      >
        <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
        <span className="hidden sm:inline">Calendar</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-blue-600' : 'text-gray-400'
          }`}
        />
      </button>

      {/* Floating Popover — rendered via fixed positioning to escape clipping contexts */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="calendar-popover"
            initial={{ opacity: 0, scale: 0.95, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 6 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={popoverStyle}
            className="bg-white rounded-2xl border border-gray-200 shadow-[0_8px_30px_rgba(0,0,0,0.14)] p-3 select-none"
          >
            {/* Month Header */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
              <span className="text-xs font-bold text-[#1A1A1A] tracking-tight pl-1">
                {format(viewDate, 'MMMM yyyy')}
              </span>
              <div className="flex items-center gap-0.5">
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

            {/* Weekday Labels */}
            <div className="grid grid-cols-7 mb-1">
              {WEEKDAYS.map((wd) => (
                <div
                  key={wd}
                  className="text-center text-[10px] font-bold text-gray-400 py-1"
                >
                  {wd}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-y-0.5">
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
                    className={`h-8 w-full text-[11px] rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold shadow-sm'
                        : isTodayDate
                        ? 'bg-blue-50 text-blue-600 font-bold border border-blue-200 hover:bg-blue-100'
                        : inCurrentMonth
                        ? 'text-[#1A1A1A] hover:bg-gray-100 font-medium'
                        : 'text-gray-300 hover:bg-gray-50 font-normal'
                    }`}
                  >
                    <span className="leading-none">{format(day, 'd')}</span>
                    {hasTask && (
                      <span
                        className={`w-1 h-1 rounded-full mt-0.5 ${
                          isSelected ? 'bg-white' : 'bg-blue-500'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="pt-2 mt-2 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] text-gray-400 font-medium">Jump to date</span>
              <button
                type="button"
                onClick={handleGoToday}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
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
