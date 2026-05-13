import React, { useState } from 'react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, isSameDay } from 'date-fns';
import PlannerHeader from './PlannerHeader';
import WeeklyCalendar from './WeeklyCalendar';
import TaskList from './TaskList';
import TaskModal from './modals/TaskModal';
import DeleteTaskModal from './modals/DeleteTaskModal';

const Planner = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([
    { id: 1, name: 'Create 2 reels', campaign: 'Content Creation', date: '2026-04-22', completed: false },
    { id: 2, name: 'Review campaign brief', campaign: 'Nike UGC Shoot', date: '2026-04-24', completed: false },
    { id: 3, name: 'Plan content concept', campaign: 'Summer Skincare Promo', date: '2026-04-24', completed: false },
    { id: 4, name: 'Create 2 reels', campaign: 'Coffee Brand Reel Campaign', date: '2026-04-25', completed: true },
    { id: 5, name: 'Shoot video content', campaign: 'Nike UGC Shoot', date: '2026-04-26', completed: false },
    { id: 6, name: 'Capture product photos', campaign: 'Summer Skincare Promo', date: '2026-04-26', completed: false },
  ]);

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
      const newTask = {
        id: Date.now(),
        ...data,
        completed: false,
      };
      setTasks([...tasks, newTask]);
    } else {
      setTasks(tasks.map(t => t.id === selectedTask.id ? { ...t, ...data } : t));
    }
    setIsTaskModalOpen(false);
  };

  const handleToggleTask = (taskId) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteConfirm = () => {
    setTasks(tasks.filter(t => t.id !== selectedTask.id));
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="py-2">
      <PlannerHeader 
        currentWeekRange={weekRangeLabel}
        onNextWeek={handleNextWeek}
        onPrevWeek={handlePrevWeek}
        onToday={handleToday}
        onAddTask={() => handleAddTask()}
      />

      <WeeklyCalendar 
        currentWeekStart={currentDate}
        tasks={tasks}
        onAddTask={handleAddTask}
        onEditTask={handleEditTask}
      />

      <TaskList 
        tasks={tasks.filter(t => {
          const date = new Date(t.date);
          return date >= weekStart && date <= weekEnd;
        })}
        onToggle={handleToggleTask}
        onEdit={handleEditTask}
        onDelete={(task) => {
          setSelectedTask(task);
          setIsDeleteModalOpen(true);
        }}
      />

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