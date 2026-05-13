import React from 'react';
import { format, isSameDay, startOfWeek, addDays } from 'date-fns';
import { CheckCircle2, Circle, Plus } from 'lucide-react';
import { motion } from 'motion/react';

const CalendarTaskCard = ({ task, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 5 }}
    animate={{ opacity: 1, y: 0 }}
    onClick={() => onClick(task)}
    className="bg-white border border-gray-100 rounded-2xl p-4 mb-3 last:mb-0 cursor-pointer hover:shadow-md hover:border-Primary/20 transition-all group"
  >
    <div className="flex items-start gap-2.5 mb-2">
      <div className="mt-0.5">
        {task.completed ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
        ) : (
          <Circle className="w-3.5 h-3.5 text-gray-200 group-hover:text-Primary transition-colors" />
        )}
      </div>
      <h4 className={`text-[12px] font-bold leading-snug ${task.completed ? 'text-gray-400 line-through' : 'text-[#1A1A1A]'}`}>
        {task.name}
      </h4>
    </div>
    <p className="text-[10px] text-Primary font-semibold ml-6">{task.campaign}</p>
  </motion.div>
);

const WeeklyCalendar = ({ currentWeekStart, tasks, onAddTask, onEditTask }) => {
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(currentWeekStart, { weekStartsOn: 1 }), i));

  return (
    <div className="grid grid-cols-1 md:grid-cols-7 bg-white rounded-[32px] border border-gray-50 shadow-sm overflow-hidden mb-8">
      {weekDays.map((day, index) => {
        const isToday = isSameDay(day, new Date());
        const dayTasks = tasks.filter(t => isSameDay(new Date(t.date), day));

        return (
          <div
            key={index}
            className={`min-h-[400px] flex flex-col border-r border-gray-50 last:border-r-0 transition-colors ${isToday ? 'bg-Primary/5' : ''}`}
          >
            {/* Day Header */}
            <div className="p-6 text-center border-b border-gray-50">
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{format(day, 'EEE')}</span>
              <div className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold ${isToday ? 'bg-Primary text-white shadow-lg shadow-Primary/30' : 'text-[#1A1A1A]'
                }`}>
                {format(day, 'd')}
              </div>
            </div>

            {/* Task Area */}
            <div className="flex-1 p-4 flex flex-col items-center">
              <div className="w-full mb-4">
                {dayTasks.map((task) => (
                  <CalendarTaskCard key={task.id} task={task} onClick={onEditTask} />
                ))}
              </div>

              {/* Add Task Trigger */}
              <button
                onClick={() => onAddTask(day)}
                className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-300 hover:text-Primary hover:border-Primary hover:shadow-sm transition-all mt-auto mb-4"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WeeklyCalendar;
