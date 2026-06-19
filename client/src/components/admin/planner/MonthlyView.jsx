import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

const MonthlyView = ({ currentDate, tasks, onAddTask, onEditTask, onToggleTask, onDeleteTask }) => {
  const [viewDate, setViewDate] = useState(currentDate);

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
  const handleToday = () => setViewDate(new Date());

  const getTasksForDay = (day) => {
    return tasks.filter(t => {
      try {
        return isSameDay(parseISO(t.date), day);
      } catch {
        return false;
      }
    });
  };

  // Get all tasks for the current month view (sorted by date)
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

  // Shared day cell renderer
  const DayCell = ({ day, isToday, isCurrentMonth, dayTasks }) => (
    <div
      className={`min-h-[75px] md:min-h-[120px] border-b border-r border-gray-50 lg:p-2 p-1.5 transition-colors relative
        ${isToday ? 'bg-Primary/5' : ''}
        ${!isCurrentMonth ? 'bg-gray-50/50' : 'hover:bg-gray-50/50'}
      `}
    >
      {/* Day Number */}
      <div className="flex items-center justify-between lg:mb-1 mb-0.5">
        <div className={`lg:w-7 lg:h-7 w-6 h-6 flex items-center justify-center lg:text-xs text-[10px] font-bold rounded-full
          ${isToday ? 'bg-Primary text-white shadow-sm' : isCurrentMonth ? 'text-[#1A1A1A]' : 'text-gray-300'}
        `}>
          {format(day, 'd')}
        </div>
        <button
          onClick={() => onAddTask(day)}
          className="lg:w-6 lg:h-6 w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-Primary hover:border-Primary hover:bg-Primary/5 transition-all lg:text-sm text-[10px] font-bold"
        >
          +
        </button>
      </div>

      {/* Tasks */}
      <div className="space-y-0.5">
        {dayTasks.slice(0, 2).map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-1 lg:px-1.5 px-1 lg:py-1 py-0.5 rounded-md hover:bg-white transition-colors group/task"
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleTask(task.id);
              }}
              className="shrink-0 hover:scale-110 transition-transform"
            >
              {task.completed ? (
                <CheckCircle2 className="lg:w-3 lg:h-3 w-2.5 h-2.5 text-green-500 shrink-0" />
              ) : (
                <Circle className="lg:w-3 lg:h-3 w-2.5 h-2.5 text-gray-200 group-hover/task:text-Primary transition-colors shrink-0" />
              )}
            </button>
            <span
              onClick={() => onEditTask(task)}
              className={`lg:text-xs text-[9px] leading-tight truncate font-semibold flex-1 cursor-pointer text-left ${task.completed ? 'text-gray-400 line-through' : 'text-[#1A1A1A]'}`}
            >
              {task.name}
            </span>
          </div>
        ))}
        {dayTasks.length > 2 && (
          <p className="lg:text-[10px] text-[8px] text-Primary font-bold lg:px-1.5 px-1">+{dayTasks.length - 2} more</p>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Calendar Grid */}
      <div className="bg-white rounded-[32px] border border-gray-50 shadow-sm overflow-hidden mb-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between lg:p-6 p-4 border-b border-gray-50">
          <h2 className="lg:text-xl text-lg font-bold text-[#1A1A1A]">{format(viewDate, 'MMMM yyyy')}</h2>
          <div className="flex items-center bg-[#F8FAFC] p-1 rounded-xl border border-gray-50">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-500"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-500"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Full month grid with headers - scrollable horizontally on mobile, full on desktop */}
        <div className="overflow-x-auto scrollbar-hide">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 min-w-[700px] md:min-w-0 border-b border-gray-50">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName) => (
              <div
                key={dayName}
                className="p-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest"
              >
                {dayName}
              </div>
            ))}
          </div>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 min-w-[700px] md:min-w-0">
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
      </div>

      {/* All Tasks Section - Horizontal Overflow Scroll */}
      <div className="bg-white rounded-[32px] border border-gray-50 shadow-sm overflow-hidden mb-8">
        <div className="lg:p-8 p-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="lg:text-xl text-lg font-bold text-[#1A1A1A]">All Tasks</h2>
          <button
            onClick={() => onAddTask(null)}
            className="flex items-center gap-2 bg-Primary text-white lg:px-5 px-4 lg:py-3 py-2.5 rounded-xl font-bold text-sm hover:bg-Primary/90 transition-all shadow-lg shadow-Primary/20"
          >
            <Plus className="w-5 h-5" />
            Add Task
          </button>
        </div>
        <div>
          {monthTasks.length > 0 ? (
            <>
              {/* Desktop: Horizontal Overflow Scroll */}
              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <div className="flex gap-4 lg:p-8 p-5 min-w-0">
                    {monthTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex-shrink-0 w-[320px] bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md hover:border-Primary/20 transition-all group flex flex-col"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <button
                            onClick={() => onToggleTask(task.id)}
                            className="transition-transform hover:scale-110 shrink-0 mt-0.5"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-6 h-6 text-green-500" />
                            ) : (
                              <Circle className="w-6 h-6 text-gray-200 group-hover:text-Primary transition-colors" />
                            )}
                          </button>
                          <button
                            onClick={() => onDeleteTask(task)}
                            className="p-2 rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex-1">
                          <h4 className={`text-base font-bold mb-1.5 ${task.completed ? 'text-gray-400 line-through' : 'text-[#1A1A1A]'}`}>
                            {task.name}
                          </h4>
                          <p className="text-sm text-Primary font-semibold">{task.campaign}</p>
                        </div>
                        <p className="text-sm text-gray-400 font-medium mt-4 pt-4 border-t border-gray-50">
                          {format(parseISO(task.date), 'EEE, MMM d')}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Mobile: Vertical List */}
              <div className="md:hidden divide-y divide-gray-50">
                {monthTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-4 p-4 hover:bg-gray-50/50 transition-colors">
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className="shrink-0 transition-transform hover:scale-110"
                    >
                      {task.completed ? (
                        <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                      ) : (
                        <Circle className="w-7 h-7 text-gray-200" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm font-bold truncate ${task.completed ? 'text-gray-400 line-through' : 'text-[#1A1A1A]'}`}>
                        {task.name}
                      </h4>
                      <p className="text-xs text-Primary font-semibold mt-0.5 truncate">{task.campaign}</p>
                      <p className="text-[11px] text-gray-400 font-medium mt-1">
                        {format(parseISO(task.date), 'EEE, MMM d')}
                      </p>
                    </div>
                    <button
                      onClick={() => onDeleteTask(task)}
                      className="p-2 rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-gray-400 font-medium">
              No tasks scheduled for this month
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MonthlyView;
