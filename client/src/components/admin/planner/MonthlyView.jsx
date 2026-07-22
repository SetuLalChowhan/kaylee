import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Plus, Trash2, X, Calendar as CalendarIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const MonthlyView = ({ currentDate, tasks, onAddTask, onEditTask, onToggleTask, onDeleteTask }) => {
  const [viewDate, setViewDate] = useState(currentDate);
  const [selectedDayPopover, setSelectedDayPopover] = useState(null);

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = [];
  let day = calStart;
  while (day <= calEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const handlePrevMonth = () => setViewDate(subMonths(viewDate, 1));
  const handleNextMonth = () => setViewDate(addMonths(viewDate, 1));

  const getTasksForDay = (day) => {
    return tasks.filter(t => {
      try {
        return isSameDay(parseISO(t.date), day);
      } catch {
        return false;
      }
    });
  };

  const monthTasks = tasks
    .filter(t => {
      try {
        const taskDate = parseISO(t.date);
        return taskDate >= monthStart && taskDate <= monthEnd;
      } catch {
        return false;
      }
    })
    .sort((a, b) => parseISO(a.date) - parseISO(b.date));

  const popoverDayTasks = selectedDayPopover ? getTasksForDay(selectedDayPopover) : [];

  const DayCell = ({ day, isToday, isCurrentMonth, dayTasks }) => (
    <div
      className={`min-h-[105px] md:min-h-[130px] border-b border-r border-gray-100 p-2 flex flex-col justify-between transition-colors relative group ${
        isToday ? 'bg-Primary/[0.03]' : !isCurrentMonth ? 'bg-gray-50/40 opacity-50' : 'bg-white hover:bg-[#FAFAFA]'
      }`}
    >
      {/* Top Bar: Date Number + Quick Add */}
      <div className="flex items-center justify-between mb-1.5">
        <div className={`w-7 h-7 flex items-center justify-center text-xs font-bold rounded-full transition-all ${
          isToday 
            ? 'bg-Primary text-white shadow-md shadow-Primary/20' 
            : isCurrentMonth 
            ? 'text-[#1A1A1A]' 
            : 'text-gray-400'
        }`}>
          {format(day, 'd')}
        </div>
        
        {isCurrentMonth && (
          <button
            onClick={() => onAddTask(day)}
            className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-Primary hover:border-Primary hover:bg-Primary/5 transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-xs"
            title="Add task for this day"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Task Chips List (max 2 visible) */}
      <div className="space-y-1 flex-1 flex flex-col justify-start">
        {dayTasks.slice(0, 2).map((task) => (
          <div
            key={task.id}
            onClick={() => onEditTask(task)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-left transition-all cursor-pointer group/chip ${
              task.completed 
                ? 'bg-gray-50 border-gray-100 opacity-60' 
                : 'bg-[#F8FAFC] border-gray-100 hover:border-Primary/30 hover:bg-white hover:shadow-xs'
            }`}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleTask(task.id);
              }}
              className="shrink-0 hover:scale-110 transition-transform cursor-pointer"
            >
              {task.completed ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              ) : (
                <Circle className="w-3 h-3 text-gray-300 group-hover/chip:text-Primary transition-colors" />
              )}
            </button>
            <span className={`text-[11px] font-semibold truncate flex-1 ${task.completed ? 'text-gray-400 line-through' : 'text-[#1A1A1A]'}`}>
              {task.name}
            </span>
          </div>
        ))}

        {/* Overflow Pill Button */}
        {dayTasks.length > 2 && (
          <button
            type="button"
            onClick={() => setSelectedDayPopover(day)}
            className="text-[10px] font-bold text-Primary bg-Primary/5 border border-Primary/10 hover:bg-Primary/10 px-2 py-0.5 rounded-md transition-all text-left cursor-pointer w-fit"
          >
            +{dayTasks.length - 2} more
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Calendar Grid Box */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        {/* Month Header & Controls */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100">
          <h2 className="text-xl md:text-2xl font-bold text-[#1A1A1A] tracking-tight">{format(viewDate, 'MMMM yyyy')}</h2>
          <div className="flex items-center bg-[#F8FAFC] p-1 rounded-2xl border border-gray-100">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-white hover:shadow-xs rounded-xl transition-all text-gray-500 cursor-pointer"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-white hover:shadow-xs rounded-xl transition-all text-gray-500 cursor-pointer"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days Header Strip */}
        <div className="grid grid-cols-7 border-b border-gray-100 bg-[#F8FAFC]">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName) => (
            <div
              key={dayName}
              className="py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider"
            >
              {dayName}
            </div>
          ))}
        </div>

        {/* Days 7-Column Grid */}
        <div className="grid grid-cols-7 border-l border-gray-100">
          {days.map((day, index) => {
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, viewDate);
            const dayTasks = getTasksForDay(day);
            return (
              <DayCell
                key={index}
                day={day}
                isToday={isToday}
                isCurrentMonth={isCurrentMonth}
                dayTasks={dayTasks}
              />
            );
          })}
        </div>
      </div>

      {/* Day Agenda Popover Modal (when clicking "+X more") */}
      <AnimatePresence>
        {selectedDayPopover && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDayPopover(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-h-[80vh] overflow-y-auto custom-scrollbar z-10 border border-gray-100"
            >
              <button
                type="button"
                onClick={() => setSelectedDayPopover(null)}
                className="absolute top-6 right-6 w-9 h-9 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer shadow-xs"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="pr-10 mb-6">
                <h3 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">
                  {format(selectedDayPopover, 'EEEE, MMMM d, yyyy')}
                </h3>
                <p className="text-sm text-gray-500 font-medium mt-1">
                  {popoverDayTasks.length} {popoverDayTasks.length === 1 ? 'task' : 'tasks'} scheduled for this day
                </p>
                <div className="w-full border-b border-gray-100 mt-4" />
              </div>

              <div className="space-y-3">
                {popoverDayTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => {
                      setSelectedDayPopover(null);
                      onEditTask(task);
                    }}
                    className="bg-[#F8FAFC] border border-gray-100 rounded-2xl p-4 flex items-center justify-between gap-3 hover:bg-white hover:shadow-xs hover:border-Primary/20 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleTask(task.id);
                        }}
                        className="shrink-0 transition-transform hover:scale-110 cursor-pointer"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-300 hover:text-Primary" />
                        )}
                      </button>
                      <div className="min-w-0">
                        <h4 className={`text-sm font-bold truncate ${task.completed ? 'text-gray-400 line-through' : 'text-[#1A1A1A]'}`}>
                          {task.name}
                        </h4>
                        {task.campaign && (
                          <p className="text-xs text-Primary font-semibold truncate mt-0.5">{task.campaign}</p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTask(task);
                      }}
                      className="p-1.5 text-gray-300 hover:text-red-500 rounded-full transition-colors shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    const day = selectedDayPopover;
                    setSelectedDayPopover(null);
                    onAddTask(day);
                  }}
                  className="bg-Primary text-white px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm hover:bg-Primary/90 transition-all shadow-md shadow-Primary/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Task
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDayPopover(null)}
                  className="px-4 py-2 text-xs md:text-sm font-bold text-gray-500 hover:text-gray-800 rounded-xl transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* All Tasks Section — Monthly Overview */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#1A1A1A] tracking-tight">This Month's Tasks</h2>
            <p className="text-xs md:text-sm text-gray-500 font-medium mt-1">Overview of all tasks scheduled for this month.</p>
          </div>
          <button
            onClick={() => onAddTask(null)}
            className="flex items-center gap-2 bg-Primary text-white px-5 py-3 rounded-xl font-bold text-xs md:text-sm hover:bg-Primary/90 transition-all shadow-lg shadow-Primary/20 cursor-pointer"
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
            Add Task
          </button>
        </div>

        <div className="p-4 md:p-6">
          {monthTasks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {monthTasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#F8FAFC] border border-gray-100 rounded-2xl p-5 hover:bg-white hover:shadow-md hover:border-Primary/20 transition-all group flex flex-col justify-between cursor-pointer"
                  onClick={() => onEditTask(task)}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleTask(task.id);
                        }}
                        className="transition-transform hover:scale-110 shrink-0 mt-0.5 cursor-pointer"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-300 group-hover:text-Primary transition-colors" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTask(task);
                        }}
                        className="p-1.5 rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <h4 className={`text-sm font-bold mb-1 leading-snug ${task.completed ? 'text-gray-400 line-through' : 'text-[#1A1A1A]'}`}>
                      {task.name}
                    </h4>
                    {task.campaign && (
                      <p className="text-xs text-Primary font-semibold">{task.campaign}</p>
                    )}
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-200/60 flex items-center justify-between text-xs text-gray-400 font-medium">
                    <span>{format(parseISO(task.date), 'EEE, MMM d')}</span>
                    {task.completed && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">Completed</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400 font-medium">
              No tasks scheduled for this month.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MonthlyView;
