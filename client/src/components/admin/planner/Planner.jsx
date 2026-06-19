import React, { useState } from 'react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, isSameDay } from 'date-fns';
import PlannerHeader from './PlannerHeader';
import WeeklyCalendar from './WeeklyCalendar';
import MonthlyView from './MonthlyView';
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

  // Week Logic
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekRangeLabel = `Week of ${format(weekStart, 'MMM d')} — ${format(weekEnd, 'MMM d, yyyy')}`;
  const isCurrentWeek = isSameDay(weekStart, startOfWeek(new Date(), { weekStartsOn: 1 }));
  const navLabel = isCurrentWeek ? 'This Week' : format(weekStart, 'MMM d, yyyy');

  const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const handlePrevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  // Task Handlers
  const handleAddTask = (day) => {
    setModalType('add');
    setSelectedTask(null);
    if (day) {
      setPreselectedDate(format(day, 'yyyy-MM-dd'));
    } else {
      setPreselectedDate(null);
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-Primary"></div>
      </div>
    );
  }

  return (
    <div className="py-2">
      <PlannerHeader 
        currentWeekRange={weekRangeLabel}
        onNextWeek={handleNextWeek}
        onPrevWeek={handlePrevWeek}
        onToday={handleToday}
        onAddTask={() => handleAddTask()}
        viewMode={viewMode}
        onToggleView={(mode) => setViewMode(mode)}
        navLabel={navLabel}
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

      <TaskModal 
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleTaskSubmit}
        type={modalType}
        task={selectedTask || (preselectedDate ? { date: preselectedDate } : null)}
      />

      <DeleteTaskModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default Planner;