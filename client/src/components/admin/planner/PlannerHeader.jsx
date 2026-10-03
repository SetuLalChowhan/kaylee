import React from 'react';
import { ChevronLeft, ChevronRight, Plus, LayoutGrid, Columns3 } from 'lucide-react';
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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
      {/* Left Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Today */}
        <button
          type="button"
          onClick={onToday}
          className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-[#1A1A1A] shadow-sm transition-all cursor-pointer"
        >
          Today
        </button>

        {/* Prev / Next */}
        <div className="flex items-center border border-gray-200 bg-white rounded-xl overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={onPrevWeek}
            className="p-1.5 hover:bg-gray-50 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer border-r border-gray-100"
            title="Previous"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.2]" />
          </button>
          <button
            type="button"
            onClick={onNextWeek}
            className="p-1.5 hover:bg-gray-50 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
            title="Next"
          >
            <ChevronRight className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        {/* Calendar Popover */}
        <PlannerCalendarPopover
          currentDate={currentDate}
          onSelectDate={onSelectDate}
          tasks={tasks}
        />

        <h2 className="text-lg sm:text-xl font-black text-[#1A1A1A] tracking-tight select-none ml-1">
          {monthYearLabel}
        </h2>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 self-end sm:self-auto">
        {/* View Toggle */}
        <div className="flex items-center bg-gray-100/80 p-0.5 rounded-xl border border-gray-200/60 shadow-sm">
          <button
            type="button"
            onClick={() => onToggleView('week')}
            title="Week view"
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'week'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            <Columns3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onToggleView('month')}
            title="Month view"
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'month'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>

        {/* Add Task */}
        <button
          type="button"
          onClick={onAddTask}
          className="bg-blue-600 text-white px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Task</span>
        </button>
      </div>
    </div>
  );
};

export default PlannerHeader;
