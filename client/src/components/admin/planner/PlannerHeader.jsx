import React from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const PlannerHeader = ({ currentWeekRange, onPrevWeek, onNextWeek, onToday, onAddTask }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
      <div>
        <h1 className="text-3xl font-bold text-[#1A1A1A] mb-1">Planner</h1>
        <p className="text-gray-400 text-sm font-medium">{currentWeekRange}</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Week Navigation */}
        <div className="flex items-center bg-[#F8FAFC] p-1.5 rounded-2xl border border-gray-50">
          <button
            onClick={onPrevWeek}
            className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-gray-500"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={onToday}
            className="px-4 py-2 text-sm font-bold text-[#1A1A1A] hover:text-Primary transition-colors"
          >
            Today
          </button>
          <button
            onClick={onNextWeek}
            className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-gray-500"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Add Task Button */}
        <button
          onClick={onAddTask}
          className="flex items-center gap-2 bg-Primary text-white px-6 py-3.5 rounded-2xl font-bold hover:bg-Primary/90 transition-all shadow-lg shadow-Primary/20"
        >
          <div className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">
            <Plus className="w-3 h-3" />
          </div>
          Add Task
        </button>
      </div>
    </div>
  );
};

export default PlannerHeader;
