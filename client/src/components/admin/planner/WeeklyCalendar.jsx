import React, { useState } from 'react';
import { format, isSameDay, startOfWeek, addDays } from 'date-fns';
import { CheckCircle2, Circle, Plus, Trash2, Calendar as CalendarIcon, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

const EventChip = ({ task, onEdit, onToggle }) => (
  <motion.div
    initial={{ opacity: 0, y: 4 }}
    animate={{ opacity: 1, y: 0 }}
    className={`group p-2.5 rounded-xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
      task.completed
        ? 'bg-gray-50/80 border-gray-100 opacity-60'
        : 'bg-[#F8FAFC] border-gray-100 hover:border-Primary/30 hover:bg-white hover:shadow-sm'
    }`}
    onClick={() => onEdit(task)}
  >
    <div className="flex items-start gap-2">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle(task.id);
        }}
        className="mt-0.5 shrink-0 hover:scale-110 transition-transform cursor-pointer"
      >
        {task.completed ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
        ) : (
          <Circle className="w-3.5 h-3.5 text-gray-300 group-hover:text-Primary transition-colors" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <h4 className={`text-xs font-bold leading-snug truncate ${task.completed ? 'text-gray-400 line-through' : 'text-[#1A1A1A]'}`}>
          {task.name}
        </h4>
        {task.campaign && (
          <p className="text-[10px] text-Primary font-semibold truncate mt-0.5">
            {task.campaign}
          </p>
        )}
      </div>
    </div>
  </motion.div>
);

const WeeklyCalendar = ({ currentWeekStart, tasks, weekStart, weekEnd, onAddTask, onEditTask, onToggleTask, onDeleteTask }) => {
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(currentWeekStart, { weekStartsOn: 1 }), i));
  const [selectedMobileDay, setSelectedMobileDay] = useState(() => {
    const todayInWeek = weekDays.find(d => isSameDay(d, new Date()));
    return todayInWeek || weekDays[0];
  });

  const weekTasks = tasks
    .filter(t => {
      const date = new Date(t.date);
      return date >= weekStart && date <= weekEnd;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const selectedDayTasks = tasks.filter(t => isSameDay(new Date(t.date), selectedMobileDay));

  return (
    <>
      {/* Calendar Grid Container */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        
        {/* Mobile View: Google Calendar Style Day Selector + Agenda List */}
        <div className="md:hidden">
          {/* Day Selector Strip */}
          <div className="p-3 bg-[#F8FAFC] border-b border-gray-100 flex items-center justify-between gap-1 overflow-x-auto scrollbar-hide">
            {weekDays.map((day, idx) => {
              const isToday = isSameDay(day, new Date());
              const isSelected = isSameDay(day, selectedMobileDay);
              const dayTaskCount = tasks.filter(t => isSameDay(new Date(t.date), day)).length;

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedMobileDay(day)}
                  className={`flex-1 min-w-[44px] py-2 px-1 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-Primary text-white shadow-md shadow-Primary/20'
                      : isToday
                      ? 'bg-Primary/10 text-Primary font-bold'
                      : 'text-gray-600 hover:bg-white'
                  }`}
                >
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                    {format(day, 'EEE')}
                  </span>
                  <span className="text-sm font-bold mt-0.5">
                    {format(day, 'd')}
                  </span>
                  {dayTaskCount > 0 && !isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-Primary mt-1" />
                  )}
                  {dayTaskCount > 0 && isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white mt-1" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Mobile Selected Day Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
            <div>
              <h3 className="text-base font-bold text-[#1A1A1A]">
                {format(selectedMobileDay, 'EEEE, MMMM d')}
              </h3>
              <p className="text-xs text-gray-400 font-medium">
                {selectedDayTasks.length} {selectedDayTasks.length === 1 ? 'task' : 'tasks'} scheduled
              </p>
            </div>
            <button
              onClick={() => onAddTask(selectedMobileDay)}
              className="bg-Primary text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-Primary/20 hover:bg-Primary/90 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          </div>

          {/* Mobile Selected Day Tasks List */}
          <div className="p-4 space-y-2.5 min-h-[160px] bg-[#FAFAFA]">
            {selectedDayTasks.length > 0 ? (
              selectedDayTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => onEditTask(task)}
                  className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs hover:border-Primary/20 transition-all cursor-pointer"
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
              ))
            ) : (
              <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">
                <CalendarIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-400 font-medium">No tasks scheduled for this day.</p>
                <button
                  onClick={() => onAddTask(selectedMobileDay)}
                  className="text-xs font-bold text-Primary hover:underline mt-2 inline-block"
                >
                  + Add a task
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Desktop View: Uniform 7-Column Grid */}
        <div className="hidden md:grid md:grid-cols-7 divide-x divide-gray-100">
          {weekDays.map((day, index) => {
            const isToday = isSameDay(day, new Date());
            const dayTasks = tasks.filter(t => isSameDay(new Date(t.date), day));

            return (
              <div key={index} className={`flex flex-col min-h-[320px] justify-between ${isToday ? 'bg-Primary/[0.02]' : ''}`}>
                {/* Column Day Header */}
                <div className="p-4 text-center border-b border-gray-100 bg-white">
                  <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    {format(day, 'EEE')}
                  </span>
                  <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold mx-auto ${
                    isToday ? 'bg-Primary text-white shadow-md shadow-Primary/30' : 'text-[#1A1A1A]'
                  }`}>
                    {format(day, 'd')}
                  </div>
                </div>

                {/* Column Task Scroll Area */}
                <div className="flex-1 p-2.5 space-y-2 max-h-[320px] overflow-y-auto custom-scrollbar">
                  {dayTasks.map((task) => (
                    <EventChip
                      key={task.id}
                      task={task}
                      onEdit={onEditTask}
                      onToggle={onToggleTask}
                    />
                  ))}
                </div>

                {/* Add Task Quick Trigger Button */}
                <div className="p-2 border-t border-gray-50 bg-white/50">
                  <button
                    onClick={() => onAddTask(day)}
                    className="w-full py-1.5 rounded-xl border border-dashed border-gray-200 text-gray-400 hover:text-Primary hover:border-Primary hover:bg-Primary/5 text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* All Tasks Section — Weekly Overview */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#1A1A1A] tracking-tight">This Week's Tasks</h2>
            <p className="text-xs md:text-sm text-gray-500 font-medium mt-1">Overview of all tasks due this week.</p>
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
          {weekTasks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {weekTasks.map((task) => (
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
                    <span>{format(new Date(task.date), 'EEE, MMM d')}</span>
                    {task.completed && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">Completed</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400 font-medium">
              No tasks scheduled for this week.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default WeeklyCalendar;
