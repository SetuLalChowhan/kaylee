import React, { useState } from 'react';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, subMonths, isSameMonth, isSameDay, parseISO
} from 'date-fns';
import {
  ChevronLeft, ChevronRight, CheckCircle2, Circle,
  Plus, Trash2, X, Clock, Calendar, Pencil
} from 'lucide-react';


const TASK_COLORS = [
  { bg: 'bg-blue-100',   border: 'border-blue-300',   text: 'text-blue-900',   sub: 'text-blue-700',   dot: 'bg-blue-500',   light: 'bg-blue-50' },
  { bg: 'bg-violet-100', border: 'border-violet-300', text: 'text-violet-900', sub: 'text-violet-700', dot: 'bg-violet-500', light: 'bg-violet-50' },
  { bg: 'bg-rose-100',   border: 'border-rose-300',   text: 'text-rose-900',   sub: 'text-rose-700',   dot: 'bg-rose-500',   light: 'bg-rose-50' },
  { bg: 'bg-emerald-100',border: 'border-emerald-300',text: 'text-emerald-900',sub: 'text-emerald-700',dot: 'bg-emerald-500',light: 'bg-emerald-50' },
  { bg: 'bg-amber-100',  border: 'border-amber-300',  text: 'text-amber-900',  sub: 'text-amber-700',  dot: 'bg-amber-500',  light: 'bg-amber-50' },
];

const getColor = (index) => TASK_COLORS[index % TASK_COLORS.length];

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

// Compact task detail popover (Google Calendar style)
const TaskDetailPopover = ({ task, color, position, onClose, onEdit, onDelete, onToggle }) => {
  return (
    <>
      <div
        key="month-task-popover"
        style={{
          position: 'fixed',
          top: Math.min(position.y, window.innerHeight - 290),
          left: Math.min(position.x + 8, window.innerWidth - 290),
          zIndex: 9999,
          width: 278,
        }}
        className="bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.16)] border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`h-1.5 w-full ${color.dot}`} />
        <div className="p-4">
          <div className="flex items-start justify-between mb-3 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${color.dot}`} />
              <h3 className="text-sm font-bold text-[#1A1A1A] truncate">{task.name}</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 cursor-pointer"
            >
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
                task.completed
                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
            <button
              onClick={() => { onClose(); onDelete(task); }}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2 px-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const MonthlyView = ({ currentDate, tasks, onAddTask, onEditTask, onToggleTask, onDeleteTask }) => {
  const [viewDate, setViewDate] = useState(currentDate);
  const [selectedDayPopover, setSelectedDayPopover] = useState(null); // full task list popover day
  const [taskPopover, setTaskPopover] = useState(null); // { task, color, position }

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

  const getTasksForDay = (d) =>
    tasks.filter((t) => {
      try { return isSameDay(parseISO(t.date), d); } catch { return false; }
    });

  const handleTaskClick = (e, task, colorIndex) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setTaskPopover({
      task,
      color: getColor(colorIndex),
      position: { x: rect.right, y: rect.top },
    });
  };

  const closeTaskPopover = () => setTaskPopover(null);

  const popoverDayTasks = selectedDayPopover ? getTasksForDay(selectedDayPopover) : [];

  return (
    <>
      {/* Click-outside overlay for task popover */}
      {taskPopover && (
        <div
          className="fixed inset-0 z-[9998]"
          onClick={closeTaskPopover}
        />
      )}

      <div className="bg-white rounded-[24px] border border-gray-100 shadow-[0_2px_16px_rgba(0,0,0,0.04)] overflow-hidden">
        {/* Month Nav Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="text-base font-black text-[#1A1A1A] tracking-tight">
            {format(viewDate, 'MMMM yyyy')}
          </h2>
          <div className="flex items-center bg-gray-50 p-0.5 rounded-xl border border-gray-100">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-white rounded-lg transition-all text-gray-500 hover:text-gray-800 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-white rounded-lg transition-all text-gray-500 hover:text-gray-800 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal scroll wrapper for calendar grid */}
        <div className="overflow-x-auto custom-scrollbar">
          <div className="min-w-[560px]">

            {/* Day Name Headers */}
            <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                <div key={d} className="py-2 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
              {days.map((d, index) => {
                const isToday = isSameDay(d, new Date());
                const isCurrentMonth = isSameMonth(d, viewDate);
                const dayTasks = getTasksForDay(d);
                const MAX_VISIBLE = 2;

                return (
                  <div
                    key={index}
                    onClick={() => onAddTask(d)}
                    className={`border-b border-r border-gray-100 last:border-r-0 p-1.5 group relative cursor-pointer transition-colors ${
                      !isCurrentMonth
                        ? 'bg-gray-50/50 opacity-50'
                        : isToday
                        ? 'bg-blue-50/40'
                        : 'hover:bg-gray-50/60'
                    }`}
                    style={{ minHeight: 82 }}
                  >
                    {/* Day number */}
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full ${
                          isToday
                            ? 'bg-blue-600 text-white'
                            : isCurrentMonth
                            ? 'text-[#1A1A1A]'
                            : 'text-gray-400'
                        }`}
                      >
                        {format(d, 'd')}
                      </span>
                      {isCurrentMonth && (
                        <Plus className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>

                    {/* Task chips */}
                    <div className="space-y-0.5">
                      {dayTasks.slice(0, MAX_VISIBLE).map((task, tIdx) => {
                        const color = getColor(tIdx);
                        return (
                          <div
                            key={task.id}
                            onClick={(e) => handleTaskClick(e, task, tIdx)}
                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md border ${color.bg} ${color.border} cursor-pointer hover:brightness-95 transition-all`}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${color.dot}`} />
                            <span className={`text-[11px] font-bold truncate ${color.text} ${task.completed ? 'line-through opacity-50' : ''}`}>
                              {task.name}
                            </span>
                          </div>
                        );
                      })}

                      {/* More overflow */}
                      {dayTasks.length > MAX_VISIBLE && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDayPopover(d);
                          }}
                          className="text-[9px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-1.5 py-0.5 rounded-md transition-all cursor-pointer w-full text-left"
                        >
                          +{dayTasks.length - MAX_VISIBLE} more
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </div>

      {/* Task Detail Popover */}
      {taskPopover && (
        <TaskDetailPopover
          task={taskPopover.task}
          color={taskPopover.color}
          position={taskPopover.position}
          onClose={closeTaskPopover}
          onEdit={onEditTask}
          onDelete={onDeleteTask}
          onToggle={(id) => {
            onToggleTask(id);
            closeTaskPopover();
          }}
        />
      )}

      {/* Day Tasks Expanded Modal ("+X more") */}
      {selectedDayPopover && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div
            onClick={() => setSelectedDayPopover(null)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm cursor-pointer animate-in fade-in duration-150"
          />
          <div
            key="day-tasks-modal"
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10 border border-gray-100 animate-in zoom-in-95 slide-in-from-bottom-2 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-bold text-[#1A1A1A]">
                    {format(selectedDayPopover, 'EEEE, MMMM d')}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {popoverDayTasks.length} {popoverDayTasks.length === 1 ? 'task' : 'tasks'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDayPopover(null)}
                  className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Task List */}
              <div className="p-4 space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                {popoverDayTasks.map((task, tIdx) => {
                  const color = getColor(tIdx);
                  return (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white hover:shadow-sm hover:border-gray-200 transition-all group"
                    >
                      <button
                        onClick={() => onToggleTask(task.id)}
                        className="flex-shrink-0 cursor-pointer hover:scale-110 transition-transform"
                      >
                        {task.completed
                          ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          : <Circle className="w-4 h-4 text-gray-300 hover:text-blue-500" />
                        }
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold truncate ${task.completed ? 'text-gray-400 line-through' : 'text-[#1A1A1A]'}`}>
                          {task.name}
                        </p>
                        {task.campaign && (
                          <p className={`text-[10px] font-semibold truncate mt-0.5 ${color.text}`}>
                            {task.campaign}
                          </p>
                        )}
                        {formatTaskTime(task) && (
                          <p className="text-[10px] text-gray-400 mt-0.5">{formatTaskTime(task)}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setSelectedDayPopover(null); onEditTask(task); }}
                          className="p-1 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { setSelectedDayPopover(null); onDeleteTask(task); }}
                          className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    const d = selectedDayPopover;
                    setSelectedDayPopover(null);
                    onAddTask(d);
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Task
                </button>
                <button
                  onClick={() => setSelectedDayPopover(null)}
                  className="text-xs font-bold text-gray-500 hover:text-gray-700 px-3 py-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MonthlyView;
