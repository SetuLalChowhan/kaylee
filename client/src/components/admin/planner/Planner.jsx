import React, { useState } from 'react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, addMonths, subMonths, isSameDay, parseISO } from 'date-fns';
import PlannerHeader from './PlannerHeader';
import WeeklyCalendar from './WeeklyCalendar';
import MonthlyView from './MonthlyView';
import TaskList from './TaskList';
import TaskModal from './modals/TaskModal';
import DeleteTaskModal from './modals/DeleteTaskModal';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '@/api/apiHooks/usePlanner';

const Planner = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // React Query Hooks
  const { data: tasks = [], isLoading } = useTasks();
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  // View mode: 'week' | 'month'
  const [viewMode, setViewMode] = useState('week');

  // Modal States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [selectedTask, setSelectedTask] = useState(null);
  const [preselectedDate, setPreselectedDate] = useState(null);
  const [preselectedTime, setPreselectedTime] = useState('');

  // Week Logic
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekRangeLabel = `Week of ${format(weekStart, 'MMM d')} — ${format(weekEnd, 'MMM d, yyyy')}`;
  const isCurrentWeek = isSameDay(weekStart, startOfWeek(new Date(), { weekStartsOn: 1 }));
  const navLabel = isCurrentWeek ? 'This Week' : format(weekStart, 'MMM d, yyyy');

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addWeeks(currentDate, 1));
    }
  };

  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(subWeeks(currentDate, 1));
    }
  };

  const handleToday = () => setCurrentDate(new Date());

  // Task Handlers
  const handleAddTask = (day, timeSlot) => {
    setModalType('add');
    setSelectedTask(null);
    let preTime = '';
    if (timeSlot) {
      const match = timeSlot.match(/(\d+)\s*(AM|PM)/i);
      if (match) {
        let hour = parseInt(match[1], 10);
        const ampm = match[2].toUpperCase();
        if (ampm === 'PM' && hour < 12) hour += 12;
        if (ampm === 'AM' && hour === 12) hour = 0;
        preTime = `${String(hour).padStart(2, '0')}:00`;
      }
    }
    if (day) {
      setPreselectedDate(format(day, 'yyyy-MM-dd'));
      setPreselectedTime(preTime);
    } else {
      setPreselectedDate(null);
      setPreselectedTime('');
    }
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task) => {
    setModalType('edit');
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleTaskSubmit = (data) => {
    if (modalType === 'add') {
      createTaskMutation.mutate(data, {
        onSuccess: () => {
          setIsTaskModalOpen(false);
        },
      });
    } else if (selectedTask) {
      updateTaskMutation.mutate(
        { id: selectedTask.id, taskData: data },
        {
          onSuccess: () => {
            setIsTaskModalOpen(false);
          },
        }
      );
    }
  };

  const handleToggleTask = (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      updateTaskMutation.mutate({
        id: taskId,
        taskData: { completed: !task.completed },
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedTask) {
      deleteTaskMutation.mutate(selectedTask.id, {
        onSuccess: () => {
          setIsDeleteModalOpen(false);
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
          <p className="text-xs font-semibold text-gray-400">Loading planner...</p>
        </div>
      </div>
    );
  }

  const handleSelectSpecificDate = (date) => {
    setCurrentDate(date);
    setViewMode('week'); // Smoothly jump to the weekly view for this specific date
  };

  return (
    <div className="py-0">
      <PlannerHeader 
        currentDate={currentDate}
        currentWeekRange={weekRangeLabel}
        onNextWeek={handleNext}
        onPrevWeek={handlePrev}
        onToday={handleToday}
        onAddTask={() => handleAddTask()}
        viewMode={viewMode}
        onToggleView={(mode) => setViewMode(mode)}
        navLabel={navLabel}
        onSelectDate={handleSelectSpecificDate}
        tasks={tasks}
      />

      {viewMode === 'week' ? (
        <WeeklyCalendar 
          currentWeekStart={currentDate}
          tasks={tasks}
          weekStart={weekStart}
          weekEnd={weekEnd}
          onToggleTask={handleToggleTask}
          onAddTask={handleAddTask}
          onEditTask={handleEditTask}
          onDeleteTask={(task) => {
            setSelectedTask(task);
            setIsDeleteModalOpen(true);
          }}
        />
      ) : (
        <MonthlyView
          currentDate={currentDate}
          tasks={tasks}
          onToggleTask={handleToggleTask}
          onAddTask={handleAddTask}
          onEditTask={handleEditTask}
          onDeleteTask={(task) => {
            setSelectedTask(task);
            setIsDeleteModalOpen(true);
          }}
        />
      )}

      <TaskList 
        tasks={tasks.filter(t => {
          try { return isSameDay(parseISO(t.date), currentDate); } catch { return false; }
        })}
        date={currentDate}
        onEdit={handleEditTask}
        onDelete={(task) => {
          setSelectedTask(task);
          setIsDeleteModalOpen(true);
        }}
        onToggle={handleToggleTask}
      />

      <TaskModal 
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleTaskSubmit}
        type={modalType}
        task={selectedTask || (preselectedDate ? { date: preselectedDate, time: preselectedTime } : null)}
        isPending={createTaskMutation.isPending || updateTaskMutation.isPending}
      />

      <DeleteTaskModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteTaskMutation.isPending}
        taskName={selectedTask?.name}
      />
    </div>
  );
};

export default Planner;