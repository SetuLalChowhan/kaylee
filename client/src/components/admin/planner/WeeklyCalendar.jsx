import React, { useState, useRef, useEffect } from 'react';
import { format, isSameDay, startOfWeek, addDays, parseISO } from 'date-fns';
import { Plus, CheckCircle2, Circle, Clock } from 'lucide-react';
import { motion } from 'motion/react';

// 1-hour intervals from 1 AM to 11 PM
const TIME_SLOTS_1H = [
  { label: '1 AM', hour: 1 },
  { label: '2 AM', hour: 2 },
  { label: '3 AM', hour: 3 },
  { label: '4 AM', hour: 4 },
  { label: '5 AM', hour: 5 },
  { label: '6 AM', hour: 6 },
  { label: '7 AM', hour: 7 },
  { label: '8 AM', hour: 8 },
  { label: '9 AM', hour: 9 },
  { label: '10 AM', hour: 10 },
  { label: '11 AM', hour: 11 },
  { label: '12 PM', hour: 12 },
  { label: '1 PM', hour: 13 },
  { label: '2 PM', hour: 14 },
  { label: '3 PM', hour: 15 },
  { label: '4 PM', hour: 16 },
  { label: '5 PM', hour: 17 },
  { label: '6 PM', hour: 18 },
  { label: '7 PM', hour: 19 },
  { label: '8 PM', hour: 20 },
  { label: '9 PM', hour: 21 },
  { label: '10 PM', hour: 22 },
  { label: '11 PM', hour: 23 },
];

const getPastelColorTheme = (task, index = 0) => {
  const text = `${task.campaign || ''} ${task.name || ''}`.toLowerCase();
  
  // Blue pastel (e.g. Film, Reel, Activewear)
  if (text.includes('activewear') || text.includes('film') || text.includes('reel') || text.includes('video') || index % 5 === 0) {
    return {
      bg: 'bg-[#DBEAFE]/85 hover:bg-[#DBEAFE]',
      border: 'border-[#BFDBFE]',
      title: 'text-[#1D4ED8]',
      subtitle: 'text-[#1E40AF]',
      time: 'text-[#2563EB]',
      shadow: 'shadow-[0_4px_14px_rgba(37,99,235,0.08)]',
    };
  }
  
  // Lavender / Soft Purple (e.g. Gym, Edit, Content)
  if (text.includes('gym') || text.includes('edit') || text.includes('content') || index % 5 === 1) {
    return {
      bg: 'bg-[#EDE9FE]/85 hover:bg-[#EDE9FE]',
      border: 'border-[#DDD6FE]',
      title: 'text-[#6D28D9]',
      subtitle: 'text-[#5B21B6]',
      time: 'text-[#7C3AED]',
      shadow: 'shadow-[0_4px_14px_rgba(109,40,217,0.08)]',
    };
  }
  
  // Pink / Rose (e.g. Feedback, Love, Review)
  if (text.includes('love') || text.includes('feedback') || text.includes('review') || index % 5 === 2) {
    return {
      bg: 'bg-[#FCE7F3]/85 hover:bg-[#FCE7F3]',
      border: 'border-[#FBCFE8]',
      title: 'text-[#BE185D]',
      subtitle: 'text-[#9D174D]',
      time: 'text-[#DB2777]',
      shadow: 'shadow-[0_4px_14px_rgba(219,39,119,0.08)]',
    };
  }
  
  // Mint / Soft Green (e.g. BHUMI, Deliverables, Brand)
  if (text.includes('bhumi') || text.includes('deliverable') || text.includes('brand') || index % 5 === 3) {
    return {
      bg: 'bg-[#D1FAE5]/85 hover:bg-[#D1FAE5]',
      border: 'border-[#A7F3D0]',
      title: 'text-[#047857]',
      subtitle: 'text-[#065F46]',
      time: 'text-[#059669]',
      shadow: 'shadow-[0_4px_14px_rgba(16,185,129,0.08)]',
    };
  }
  
  // Warm Peach / Amber (e.g. Invoice, Send, Payment)
  return {
    bg: 'bg-[#FEF3C7]/85 hover:bg-[#FEF3C7]',
    border: 'border-[#FDE68A]',
    title: 'text-[#B45309]',
    subtitle: 'text-[#92400E]',
    time: 'text-[#D97706]',
    shadow: 'shadow-[0_4px_14px_rgba(245,158,11,0.08)]',
  };
};

const getTaskHour = (task) => {
  if (task.date && (task.date.includes('T') || task.date.includes(' '))) {
    try {
      const d = new Date(task.date);
      if (!isNaN(d.getTime())) {
        const h = d.getHours();
        if (h >= 1 && h <= 23) return h;
      }
    } catch {}
  }

  const text = (task.name || '').toLowerCase();
  const timeMatch = text.match(/(\d{1,2})(?::\d{2})?\s*(am|pm)/i);
  if (timeMatch) {
    let hr = parseInt(timeMatch[1], 10);
    const ampm = timeMatch[2].toUpperCase();
    if (ampm === 'PM' && hr < 12) hr += 12;
    if (ampm === 'AM' && hr === 12) hr = 0;
    if (hr >= 1 && hr <= 23) return hr;
  }

  // Clean default hour for tasks without specified time (9 AM)
  return 9;
};

const getTaskDisplayTime = (task, slotLabel) => {
  const match = (task.name || '').match(/(\d{1,2}:\d{2}(?:\s*-\s*\d{1,2}:\d{2})?)/);
  if (match) return match[1];

  if (task.date && (task.date.includes('T') || task.date.includes(' '))) {
    try {
      const d = new Date(task.date);
      if (!isNaN(d.getTime())) {
        return format(d, 'h:mm a');
      }
    } catch {}
  }

  return slotLabel;
};

const cleanTaskTitle = (name = '') => {
  return name.replace(/\(\d{1,2}:\d{2}.*?\)/, '').trim();
};

const WeeklyCalendar = ({
  currentWeekStart,
  tasks = [],
  onAddTask,
  onEditTask,
  onToggleTask,
}) => {
  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(startOfWeek(currentWeekStart, { weekStartsOn: 1 }), i)
  );

  const [selectedDay, setSelectedDay] = useState(() => {
    const matched = weekDays.find((d) => isSameDay(d, currentWeekStart || new Date()));
    return matched || weekDays[0];
  });

  useEffect(() => {
    if (currentWeekStart) {
      setSelectedDay(currentWeekStart);
    }
  }, [currentWeekStart]);

  const scrollContainerRef = useRef(null);

  useEffect(() => {
    // Automatically scroll to daytime hours (~8 AM) on initial mount
    if (scrollContainerRef.current) {
      // 7 slots (1am to 7am) * ~72px is ~500px scroll
      scrollContainerRef.current.scrollTop = 480;
    }
  }, []);

  const isDayTask = (taskDateStr, targetDay) => {
    try {
      const d = parseISO(taskDateStr);
      return isSameDay(d, targetDay);
    } catch {
      return false;
    }
  };

  return (
    <div className="bg-white rounded-[28px] border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] overflow-hidden">
      {/* ── RESPONSIVE WEEKLY 1-HOUR TIME-GRID (Overflow-X-Auto & Sticky Axes) ── */}
      <div
        ref={scrollContainerRef}
        className="w-full max-h-[720px] overflow-x-auto overflow-y-auto custom-scrollbar relative"
      >
        <table className="w-full border-collapse table-fixed min-w-[850px]">
          {/* Sticky Table Header */}
          <thead className="sticky top-0 z-20 bg-white shadow-2xs">
            <tr>
              {/* Top-Left Spacer for Time (Sticky Top & Left) */}
              <th className="sticky left-0 top-0 z-30 w-16 lg:w-20 p-3 pb-3 border-b border-gray-100 bg-white text-right pr-4 text-[10px] font-bold text-gray-400 shadow-[1px_0_0_rgba(0,0,0,0.05)]">
                TIME
              </th>

              {/* 7 Day Column Headers */}
              {weekDays.map((day, idx) => {
                const isSelected = isSameDay(day, selectedDay);

                return (
                  <th
                    key={idx}
                    onClick={() => setSelectedDay(day)}
                    className={`p-3 pb-3 border-b border-l border-gray-100 text-center transition-colors cursor-pointer ${
                      isSelected ? 'bg-[#F0F7FF]/50' : 'bg-white hover:bg-gray-50/50'
                    }`}
                  >
                    <span
                      className={`block text-xs font-semibold uppercase tracking-wider ${
                        isSelected ? 'text-blue-500 font-bold' : 'text-gray-400'
                      }`}
                    >
                      {format(day, 'EEE')}
                    </span>
                    <span
                      className={`block text-base font-extrabold mt-1 ${
                        isSelected ? 'text-blue-600 font-black' : 'text-[#1A1A1A]'
                      }`}
                    >
                      {format(day, 'd')}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body: 23 1-Hour Slot Rows (1 AM to 11 PM) */}
          <tbody>
            {TIME_SLOTS_1H.map((slot) => (
              <tr key={slot.hour} className="group/row">
                {/* Left Y-Axis 1-Hour Label (Sticky Left) */}
                <td className="sticky left-0 z-10 w-16 lg:w-20 p-2 pr-4 align-top text-right border-t border-gray-100/90 bg-white text-[11px] font-semibold text-gray-400 select-none shadow-[1px_0_0_rgba(0,0,0,0.05)]">
                  <div className="pt-1.5">{slot.label}</div>
                </td>

                {/* 7 Day Column Cells for this Hour */}
                {weekDays.map((day, dayIdx) => {
                  const isSelected = isSameDay(day, selectedDay);
                  const dayTasks = tasks.filter((t) => isDayTask(t.date, day));

                  // Tasks mapped to this 1-hour slot
                  const slotTasks = dayTasks.filter(
                    (t) => getTaskHour(t) === slot.hour
                  );

                  return (
                    <td
                      key={dayIdx}
                      onClick={() => onAddTask(day, slot.label)}
                      className={`border-t border-l border-gray-100/80 p-2 align-top h-20 lg:h-24 transition-colors relative group/cell cursor-pointer ${
                        isSelected ? 'bg-[#F0F7FF]/35' : 'bg-white hover:bg-gray-50/40'
                      }`}
                    >
                      {/* Render Pastel Event Cards for this Hour */}
                      <div className="space-y-1.5 h-full flex flex-col justify-start">
                        {slotTasks.map((task, taskIdx) => {
                          const theme = getPastelColorTheme(task, taskIdx);
                          const displayTime = getTaskDisplayTime(task, slot.label);
                          const cleanTitle = cleanTaskTitle(task.name);

                          return (
                            <motion.div
                              key={task.id}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              whileHover={{ scale: 1.02 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditTask(task);
                              }}
                              className={`${theme.bg} ${theme.border} ${theme.shadow} border rounded-2xl p-2 sm:p-2.5 text-left transition-all duration-200 cursor-pointer relative group/card`}
                            >
                              {/* Title / Campaign */}
                              {task.campaign ? (
                                <>
                                  <h4
                                    className={`text-[11px] font-bold leading-tight truncate ${theme.title} ${
                                      task.completed ? 'line-through opacity-60' : ''
                                    }`}
                                  >
                                    {task.campaign}
                                  </h4>
                                  <p
                                    className={`text-[10px] font-semibold leading-tight truncate mt-0.5 ${theme.subtitle} ${
                                      task.completed ? 'line-through opacity-60' : ''
                                    }`}
                                  >
                                    {cleanTitle}
                                  </p>
                                </>
                              ) : (
                                <h4
                                  className={`text-[11px] font-bold leading-tight truncate ${theme.title} ${
                                    task.completed ? 'line-through opacity-60' : ''
                                  }`}
                                >
                                  {cleanTitle}
                                </h4>
                              )}

                              {/* Time Display */}
                              <div
                                className={`flex items-center gap-1 text-[10px] font-medium mt-1 ${theme.time}`}
                              >
                                <span>{displayTime}</span>
                              </div>

                              {/* Completed toggle checkbox */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleTask(task.id);
                                }}
                                className="absolute top-2 right-2 opacity-0 group-hover/card:opacity-100 transition-opacity p-0.5 hover:scale-110 cursor-pointer"
                                title={task.completed ? 'Mark incomplete' : 'Mark completed'}
                              >
                                {task.completed ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Circle className="w-3.5 h-3.5 text-gray-400 hover:text-Primary" />
                                )}
                              </button>
                            </motion.div>
                          );
                        })}

                        {/* Hover Quick Add Indicator on empty cells */}
                        {slotTasks.length === 0 && (
                          <div className="w-full h-full flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity">
                            <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shadow-2xs text-xs font-bold">
                              <Plus className="w-3 h-3" />
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WeeklyCalendar;
