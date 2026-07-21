import React from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const PlannerHeader = ({ currentWeekRange, onPrevWeek, onNextWeek, onToday, onAddTask, viewMode = 'week', onToggleView, navLabel }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-10">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-1.5 md:mb-2">Planner</h1>
        <p className="text-gray-500 text-xs md:text-sm">{currentWeekRange}</p>
      </div>

      <div className="flex items-center flex-wrap gap-3">
        {/* View Toggle - Text Tabs */}
        <div className="flex items-center bg-[#F8FAFC] p-1 rounded-2xl border border-gray-100">
          <button
            onClick={() => onToggleView('week')}
            className={`lg:px-5 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${viewMode === 'week'
              ? 'bg-white text-Primary shadow-sm'
              : 'text-gray-500 hover:text-gray-900'
              }`}
          >
            Weekly
          </button>
          <button
            onClick={() => onToggleView('month')}
            className={`lg:px-5 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${viewMode === 'month'
              ? 'bg-white text-Primary shadow-sm'
              : 'text-gray-500 hover:text-gray-900'
              }`}
          >
            Monthly
          </button>
        </div>

        {/* Week Navigation - Only in week view */}
        {viewMode === 'week' && (
          <div className="flex items-center bg-[#F8FAFC] p-1.5 rounded-2xl border border-gray-50">
            <button
              onClick={onPrevWeek}
              className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-gray-500"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-4 py-2 text-sm font-bold text-[#1A1A1A] min-w-[110px] text-center">
              {navLabel || 'This Week'}
            </span>
            <button
              onClick={onNextWeek}
              className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-gray-500"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Add Task Button */}
        <button
          onClick={onAddTask}
          className="bg-Primary text-white px-5 py-3 md:px-6 md:py-3.5 rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-Primary/20 hover:bg-Primary/90 transition-all text-xs md:text-sm w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
          Add Task
        </button>
      </div>
    </div>
  );
};

export default PlannerHeader;
