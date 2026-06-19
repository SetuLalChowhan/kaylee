import React from 'react';
import { format, isSameDay, startOfWeek, addDays } from 'date-fns';
import { CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

const CalendarTaskCard = ({ task, onEdit, onToggle }) => (
  <motion.div
    initial={{ opacity: 0, y: 5 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white border border-gray-100 rounded-2xl p-4 mb-3 last:mb-0 hover:shadow-md hover:border-Primary/20 transition-all group flex flex-col justify-between"
  >
    <div className="flex items-start gap-2.5 mb-2 text-left">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle(task.id);
        }}
        className="mt-0.5 shrink-0 hover:scale-110 transition-transform"
      >
        {task.completed ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
        ) : (
          <Circle className="w-3.5 h-3.5 text-gray-200 group-hover:text-Primary transition-colors" />
        )}
      </button>
      <h4 
        onClick={() => onEdit(task)}
        className={`text-[12px] font-bold leading-snug flex-1 cursor-pointer ${task.completed ? 'text-gray-400 line-through' : 'text-[#1A1A1A]'}`}
      >
        {task.name}
      </h4>
    </div>
    <p 
      onClick={() => onEdit(task)}
      className="text-[10px] text-Primary font-semibold ml-6 cursor-pointer text-left"
    >
      {task.campaign}
    </p>
  </motion.div>
);

const WeeklyCalendar = ({ currentWeekStart, tasks, weekStart, weekEnd, onAddTask, onEditTask, onToggleTask, onDeleteTask }) => {
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(currentWeekStart, { weekStartsOn: 1 }), i));
  
  const weekTasks = tasks
    .filter(t => {
      const date = new Date(t.date);
      return date >= weekStart && date <= weekEnd;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Group days for mobile swiper: [Mon,Tue,Wed] and [Thu,Fri,Sat,Sun]
  const dayGroups = [weekDays.slice(0, 3), weekDays.slice(3, 7)];

  const DayColumn = ({ day, isToday, dayTasks }) => (
    <div
      className={`flex flex-col border-r border-gray-50 last:border-r-0 transition-colors h-full ${isToday ? 'bg-Primary/5' : ''}`}
    >
      {/* Day Header */}
      <div className="lg:p-6 p-3 text-center border-b border-gray-50">
        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest lg:mb-2 mb-1.5">{format(day, 'EEE')}</span>
        <div className={`inline-flex items-center justify-center lg:w-9 lg:h-9 w-7 h-7 rounded-full lg:text-sm text-xs font-bold ${isToday ? 'bg-Primary text-white shadow-lg shadow-Primary/30' : 'text-[#1A1A1A]'
          }`}>
          {format(day, 'd')}
        </div>
      </div>

      {/* Task Area */}
      <div className="flex-1 lg:p-4 p-2 flex flex-col items-center">
        <div className="w-full lg:mb-4 mb-2">
          {dayTasks.map((task) => (
            <CalendarTaskCard key={task.id} task={task} onEdit={onEditTask} onToggle={onToggleTask} />
          ))}
        </div>

        {/* Add Task Trigger */}
        <button
          onClick={() => onAddTask(day)}
          className="lg:w-8 lg:h-8 w-7 h-7 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-300 hover:text-Primary hover:border-Primary hover:shadow-sm transition-all mt-auto lg:mb-4 mb-2"
        >
          <Plus className="lg:w-5 lg:h-5 w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Calendar Grid - Mobile: Swiper | Desktop: Grid */}
      <div className="bg-white rounded-[32px] border border-gray-50 shadow-sm overflow-hidden mb-6">
        {/* Mobile Swiper */}
        <div className="md:hidden">
          <Swiper
            spaceBetween={0}
            slidesPerView={1}
            className="weekly-calendar-swiper"
          >
            {dayGroups.map((group, groupIndex) => (
              <SwiperSlide key={groupIndex}>
                <div className="p-2 text-center lg:text-xs text-[10px] font-bold text-Primary border-b border-gray-50">
                  {format(group[0], 'EEE, MMM d')} — {format(group[group.length - 1], 'EEE, MMM d')}
                </div>
                <div className={group.length === 4 ? 'grid grid-cols-4' : 'grid grid-cols-3'}>
                  {group.map((day, idx) => {
                    const isToday = isSameDay(day, new Date());
                    const dayTasks = tasks.filter(t => isSameDay(new Date(t.date), day));
                    return (
                      <DayColumn
                        key={idx}
                        day={day}
                        isToday={isToday}
                        dayTasks={dayTasks}
                      />
                    );
                  })}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-7">
          {weekDays.map((day, index) => {
            const isToday = isSameDay(day, new Date());
            const dayTasks = tasks.filter(t => isSameDay(new Date(t.date), day));
            return (
              <DayColumn
                key={index}
                day={day}
                isToday={isToday}
                dayTasks={dayTasks}
              />
            );
          })}
        </div>
      </div>

      {/* All Tasks Section - Swiper Slider */}
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
        <div className="lg:p-6 lg:px-2 p-0">
          {weekTasks.length > 0 ? (
            <>
              {/* Desktop: Swiper Slider */}
              <div className="hidden md:block">
                <Swiper
                  spaceBetween={16}
                  slidesPerView={2.3}
                  breakpoints={{
                    480: { slidesPerView: 2.5, spaceBetween: 16 },
                    640: { slidesPerView: 3.2, spaceBetween: 16 },
                    768: { slidesPerView: 2.2, spaceBetween: 20 },
                    1024: { slidesPerView: 3.2, spaceBetween: 20 },
                    1280: { slidesPerView: 4.2, spaceBetween: 20 }
                  }}
                  className="!px-4"
                >
                  {weekTasks.map((task) => (
                    <SwiperSlide key={task.id}>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md hover:border-Primary/20 transition-all group flex flex-col h-full"
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
                          {format(new Date(task.date), 'EEE, MMM d')}
                        </p>
                      </motion.div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
              {/* Mobile: Vertical List */}
              <div className="md:hidden divide-y divide-gray-50">
                {weekTasks.map((task) => (
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
                        {format(new Date(task.date), 'EEE, MMM d')}
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
              No tasks scheduled for this week
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default WeeklyCalendar;
