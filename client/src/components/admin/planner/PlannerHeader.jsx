import React from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format } from 'date-fns';
import PlannerCalendarPopover from './PlannerCalendarPopover';

const PlannerHeader = ({
  currentDate = new Date(),
  onPrevWeek,
  onNextWeek,
  onToday,
  onAddTask,
  viewMode = 'week',
  onToggleView,
  onSelectDate,
  tasks = [],
}) => {
  const monthYearLabel = format(currentDate, 'MMMM yyyy');

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      {/* Left: Today, < >, Compact Calendar Popover, Month Year */}
      <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
        <button
          type="button"
          onClick={onToday}
          className="px-3.5 sm:px-4 py-2 rounded-xl border border-gray-200/90 bg-white hover:bg-gray-50 text-xs font-bold text-[#1A1A1A] shadow-2xs transition-all cursor-pointer"
        >
          Today
        </button>

        <div className="flex items-center border border-gray-200/90 bg-white rounded-xl p-1 shadow-2xs">
          <button
            type="button"
            onClick={onPrevWeek}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
            title="Previous"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.2]" />
          </button>
          <button
            type="button"
            onClick={onNextWeek}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
            title="Next"
          >
            <ChevronRight className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        {/* Compact Floating Calendar Popover Box */}
        <PlannerCalendarPopover
          currentDate={currentDate}
          onSelectDate={onSelectDate}
          tasks={tasks}
        />

        <h2 className="text-xl sm:text-2xl font-black text-[#1A1A1A] tracking-tight ml-1 select-none">
          {monthYearLabel}
        </h2>
      </div>

      {/* Right: Week / Month Toggle & Add Task */}
      <div className="flex items-center gap-3 self-end sm:self-auto">
        <div className="flex items-center bg-[#F1F5F9]/80 p-1 rounded-2xl border border-gray-100">
          <button
            type="button"
            onClick={() => onToggleView('week')}
            className={`px-4 sm:px-5 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              viewMode === 'week'
                ? 'bg-blue-100 text-blue-600 shadow-2xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Week
          </button>
          <button
            type="button"
            onClick={() => onToggleView('month')}
            className={`px-4 sm:px-5 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              viewMode === 'month'
                ? 'bg-blue-100 text-blue-600 shadow-2xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Month
          </button>
        </div>

        <button
          type="button"
          onClick={onAddTask}
          className="bg-Primary text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md shadow-Primary/20 hover:bg-Primary/90 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>
    </div>
  );
};

export default PlannerHeader;
