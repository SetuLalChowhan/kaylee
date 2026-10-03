import React, { useState, useRef, useEffect } from 'react';
import { format, isSameDay, startOfWeek, addDays, parseISO } from 'date-fns';
import { Plus, CheckCircle2, Circle, Clock, X, Pencil, Trash2, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => ({
  hour: i,
  label: i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`,
}));

const TASK_COLORS = [
  { bg: 'bg-blue-100',    border: 'border-l-blue-500',    text: 'text-blue-900',    sub: 'text-blue-700',    dot: 'bg-blue-500',    light: 'bg-blue-50' },
  { bg: 'bg-violet-100',  border: 'border-l-violet-500',  text: 'text-violet-900',  sub: 'text-violet-700',  dot: 'bg-violet-500',  light: 'bg-violet-50' },
  { bg: 'bg-rose-100',    border: 'border-l-rose-500',    text: 'text-rose-900',    sub: 'text-rose-700',    dot: 'bg-rose-500',    light: 'bg-rose-50' },
  { bg: 'bg-emerald-100', border: 'border-l-emerald-500', text: 'text-emerald-900', sub: 'text-emerald-700', dot: 'bg-emerald-500', light: 'bg-emerald-50' },
  { bg: 'bg-amber-100',   border: 'border-l-amber-500',   text: 'text-amber-900',   sub: 'text-amber-700',   dot: 'bg-amber-500',   light: 'bg-amber-50' },
  { bg: 'bg-cyan-100',    border: 'border-l-cyan-600',    text: 'text-cyan-900',    sub: 'text-cyan-700',    dot: 'bg-cyan-600',    light: 'bg-cyan-50' },
];

const getColorForTask = (_, index) => TASK_COLORS[index % TASK_COLORS.length];

const getTaskHour = (task) => {
  if (task.date && (task.date.includes('T') || task.date.includes(' '))) {
    try {
      const d = new Date(task.date);
      if (!isNaN(d.getTime())) return d.getHours();
    } catch {}
  }
  return 9;
};

const getTaskMinute = (task) => {
  if (task.date && (task.date.includes('T') || task.date.includes(' '))) {
    try {
      const d = new Date(task.date);
      if (!isNaN(d.getTime())) return d.getMinutes();
    } catch {}
  }
  return 0;
};

const formatTaskTime = (task) => {
  if (task.date && (task.date.includes('T') || task.date.includes(' '))) {
    try {
      const d = new Date(task.date);
      if (!isNaN(d.getTime())) return format(d, 'h:mm a');
    } catch {}
  }
  return '';
};

const formatFullDate = (task) => {
  if (task.date) {
    try {
      const d = new Date(task.date);
      if (!isNaN(d.getTime())) return format(d, 'EEE, MMM d, yyyy');
    } catch {}
  }
  return '';
};

// ── Task Detail Popover ──────────────────────────────────────────────────────
const TaskDetailPopover = ({ task, color, position, onClose, onEdit, onDelete, onToggle }) => {
  const popoverRef = useRef(null);

  useEffect(() => {
    const handle = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) onClose();
    };
    const t = setTimeout(() => document.addEventListener('mousedown', handle), 50);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', handle); };
  }, [onClose]);

  const style = {
    position: 'fixed',
    top: Math.min(position.y, window.innerHeight - 290),
    left: Math.min(position.x + 8, window.innerWidth - 292),
    width: 280,
    zIndex: 9999,
  };

  return (
    <AnimatePresence>
      <motion.div
        ref={popoverRef}
        key="task-detail-popover"
        initial={{ opacity: 0, scale: 0.92, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: -4 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        style={style}
        className="bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden"
      >
        <div className={`h-1.5 w-full ${color.dot}`} />
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${color.dot}`} />
              <h3 className="text-sm font-bold text-[#1A1A1A] truncate">{task.name}</h3>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {task.campaign && (
            <div className={`flex items-center gap-2 text-xs font-semibold ${color.text} ${color.light} rounded-xl px-3 py-1.5 mb-3`}>
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{task.campaign}</span>
            </div>
          )}

          <div className="space-y-1.5 mb-4">
            {formatFullDate(task) && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <span className="font-medium">{formatFullDate(task)}</span>
              </div>
            )}
            {formatTaskTime(task) && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <span className="font-medium">{formatTaskTime(task)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => onToggle(task.id)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                task.completed ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {task.completed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
              {task.completed ? 'Completed' : 'Mark Done'}
            </button>
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
            <button
              onClick={() => { onClose(); onEdit(task); }}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2 px-3 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />Edit
            </button>
            <button
              onClick={() => { onClose(); onDelete(task); }}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2 px-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />Delete
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────
const WeeklyCalendar = ({
  currentWeekStart,
  tasks = [],
  onAddTask,
  onEditTask,
  onToggleTask,
  onDeleteTask,
}) => {
  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(startOfWeek(currentWeekStart, { weekStartsOn: 1 }), i)
  );

  const today = new Date();

  // Single container handles BOTH x (horizontal) and y (vertical) scroll
  // This allows sticky left AND sticky top to work simultaneously
  const containerRef = useRef(null);

  // Refs for each day column header — used to scroll the selected day into view
  const dayHeaderRefs = useRef([]);

  const [selectedPopover, setSelectedPopover] = useState(null);

  // Scroll to 7 AM on mount
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 7 * 52;
    }
  }, []);

  // Auto-scroll to the selected day column whenever the week/day changes
  useEffect(() => {
    if (!containerRef.current || !currentWeekStart) return;
    const selectedIdx = weekDays.findIndex((d) => isSameDay(d, currentWeekStart));
    const targetIdx = selectedIdx >= 0 ? selectedIdx : 0;
    const el = dayHeaderRefs.current[targetIdx];
    if (el) {
      // Smooth horizontal scroll so the selected column is centered
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [currentWeekStart]);

  const isDayTask = (taskDateStr, targetDay) => {
    try { return isSameDay(parseISO(taskDateStr), targetDay); } catch { return false; }
  };

  const handleEventClick = (e, task, color) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setSelectedPopover({ task, color, position: { x: rect.right, y: rect.top } });
  };

  return (
    <div className="bg-white rounded-[24px] border border-gray-100 shadow-[0_2px_16px_rgba(0,0,0,0.04)] overflow-hidden">
      {/*
        ─────────────────────────────────────────────────────────────────────
        SINGLE scroll container (overflow: auto in both axes).
        This is the only way to get sticky-left AND sticky-top working
        together (like Google Calendar). Two nested scroll containers break
        one of the two sticky axes.
        ─────────────────────────────────────────────────────────────────────
      */}
      <div
        ref={containerRef}
        className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-240px)] min-h-[380px] custom-scrollbar"
      >
        {/* Inner min-width wrapper — ensures 7 columns never collapse below 700px */}
        <div className="min-w-[700px]">

          {/* ── STICKY DAY HEADER ROW (top-0) ─────────────────────────────── */}
          <div className="sticky top-0 z-20 flex bg-white border-b border-gray-100">
            {/* Corner cell — sticky in BOTH dimensions so it never disappears */}
            <div className="sticky left-0 z-30 w-14 flex-shrink-0 bg-white border-r border-gray-100" />

            {/* Day columns */}
            {weekDays.map((day, idx) => {
              const isToday = isSameDay(day, today);
              const isSelected = isSameDay(day, currentWeekStart);
              return (
                <div
                  key={idx}
                  ref={(el) => (dayHeaderRefs.current[idx] = el)}
                  className={`flex-1 text-center py-2.5 border-r border-gray-100 last:border-r-0 ${
                    isToday ? 'bg-blue-50/50' : isSelected ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <span className={`block text-[10px] font-bold uppercase tracking-wide ${isToday || isSelected ? 'text-blue-600' : 'text-gray-400'}`}>
                    {format(day, 'EEE')}
                  </span>
                  <span
                    className={`inline-flex items-center justify-center w-7 h-7 mt-0.5 rounded-full text-sm font-black ${
                      isToday
                        ? 'bg-blue-600 text-white'
                        : isSelected
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-[#1A1A1A]'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                </div>
              );
            })}
          </div>

          {/* ── TIME GRID ROWS ──────────────────────────────────────────────── */}
          {TIME_SLOTS.map((slot) => (
            <div key={slot.hour} className="flex border-b border-gray-50 last:border-b-0" style={{ minHeight: 52 }}>

              {/* Sticky time label — left-0 sticks while scrolling horizontally */}
              <div className="sticky left-0 z-10 w-14 flex-shrink-0 bg-white border-r border-gray-100 flex items-start justify-end pr-2 pt-1">
                {slot.hour !== 0 && (
                  <span className="text-[10px] font-semibold text-gray-400 select-none leading-none">
                    {slot.label}
                  </span>
                )}
              </div>

              {/* Day cells */}
              {weekDays.map((day, dayIdx) => {
                const isToday = isSameDay(day, today);
                const isSelected = isSameDay(day, currentWeekStart);
                const dayTasks = tasks.filter((t) => isDayTask(t.date, day));
                const slotTasks = dayTasks.filter((t) => getTaskHour(t) === slot.hour);

                return (
                  <div
                    key={dayIdx}
                    onClick={() => onAddTask(day, slot.label)}
                    className={`flex-1 border-r border-gray-100 last:border-r-0 p-0.5 relative group cursor-pointer transition-colors ${
                      isToday
                        ? 'bg-blue-50/20'
                        : isSelected
                        ? 'bg-blue-50/10'
                        : 'hover:bg-gray-50/60'
                    }`}
                    style={{ minHeight: 52 }}
                  >
                    {slotTasks.map((task, taskIdx) => {
                      const color = getColorForTask(task, taskIdx);
                      const topOffset = (getTaskMinute(task) / 60) * 52;

                      return (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          onClick={(e) => handleEventClick(e, task, color)}
                          className={`absolute left-0.5 right-0.5 rounded-lg px-1.5 py-1 cursor-pointer ${color.bg} border-l-[3px] ${color.border} transition-all hover:brightness-95`}
                          style={{ top: topOffset + 2, minHeight: 36, zIndex: 5 }}
                        >
                          <p className={`text-[11px] font-bold leading-tight truncate ${color.text} ${task.completed ? 'line-through opacity-50' : ''}`}>
                            {task.name}
                          </p>
                          {task.campaign && (
                            <p className={`text-[10px] font-semibold truncate leading-tight mt-0.5 ${color.sub}`}>
                              {task.campaign}
                            </p>
                          )}
                          {formatTaskTime(task) && (
                            <p className={`text-[10px] font-medium leading-tight mt-0.5 ${color.sub}`}>
                              {formatTaskTime(task)}
                            </p>
                          )}
                        </motion.div>
                      );
                    })}

                    {/* Hover add indicator */}
                    {slotTasks.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <Plus className="w-3 h-3 text-gray-300" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

        </div>
      </div>

      {/* Task Detail Popover */}
      {selectedPopover && (
        <TaskDetailPopover
          task={selectedPopover.task}
          color={selectedPopover.color}
          position={selectedPopover.position}
          onClose={() => setSelectedPopover(null)}
          onEdit={onEditTask}
          onDelete={onDeleteTask}
          onToggle={(id) => { onToggleTask(id); setSelectedPopover(null); }}
        />
      )}
    </div>
  );
};

export default WeeklyCalendar;
