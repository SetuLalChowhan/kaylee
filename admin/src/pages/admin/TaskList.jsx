import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { Plus, Search, Edit3, Trash2, X, Loader2, Calendar, CheckSquare, Square } from "lucide-react";
import { toast } from "react-toastify";

const TaskList = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  // Modal state
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Form fields
  const [name, setName] = useState("");
  const [campaign, setCampaign] = useState("");
  const [date, setDate] = useState("");
  const [completed, setCompleted] = useState(false);
  const [targetUserId, setTargetUserId] = useState("");

  // Fetch planner tasks
  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ["adminTasks"],
    queryFn: async () => {
      const res = await axiosSecure.get("/planner");
      return res.data?.data || res.data || [];
    }
  });

  // Fetch users (to assign tasks to creators)
  const { data: usersData } = useQuery({
    queryKey: ["adminUsersForTasks"],
    queryFn: async () => {
      const res = await axiosSecure.get("/user/admin/users");
      return res.data?.data || [];
    }
  });

  // Create Task Mutation
  const createMutation = useMutation({
    mutationFn: async (taskData) => {
      const res = await axiosSecure.post("/planner", taskData);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Task created successfully");
      queryClient.invalidateQueries({ queryKey: ["adminTasks"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboardStats"] });
      closeModal();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create task");
    }
  });

  // Update Task Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, taskData }) => {
      const res = await axiosSecure.patch(`/planner/${id}`, taskData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminTasks"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboardStats"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update task");
    }
  });

  // Delete Task Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosSecure.delete(`/planner/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Task deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["adminTasks"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboardStats"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete task");
    }
  });

  const openCreateModal = () => {
    setSelectedTask(null);
    setName("");
    setCampaign("");
    setDate("");
    setCompleted(false);
    setTargetUserId(usersData?.[0]?.id || "");
    setIsOpen(true);
  };

  const openEditModal = (task) => {
    setSelectedTask(task);
    setName(task.name || "");
    setCampaign(task.campaign || "");
    
    // Parse date to YYYY-MM-DD
    let formattedDate = "";
    if (task.date) {
      const dObj = new Date(task.date);
      if (!isNaN(dObj.getTime())) {
        formattedDate = dObj.toISOString().split("T")[0];
      } else {
        formattedDate = task.date;
      }
    }
    setDate(formattedDate);
    setCompleted(task.completed ?? false);
    setTargetUserId(task.userId || "");
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedTask(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedTask) {
      updateMutation.mutate({
        id: selectedTask.id,
        taskData: { name, campaign, date, completed }
      }, {
        onSuccess: () => {
          toast.success("Task updated successfully");
          closeModal();
        }
      });
    } else {
      createMutation.mutate({
        name,
        campaign,
        date,
        completed,
        targetUserId
      });
    }
  };

  const handleToggleCompleted = (task) => {
    updateMutation.mutate({
      id: task.id,
      taskData: { completed: !task.completed }
    }, {
      onSuccess: () => {
        toast.success(`Task marked as ${!task.completed ? "completed" : "pending"}`);
      }
    });
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete task "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const tasks = Array.isArray(tasksData) ? tasksData : [];
  const users = usersData || [];

  const getUserName = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : "Unknown Creator";
  };

  const filteredTasks = tasks.filter((t) => {
    const term = search.toLowerCase();
    const taskName = (t.name || "").toLowerCase();
    const campName = (t.campaign || "").toLowerCase();
    const creator = getUserName(t.userId).toLowerCase();
    return taskName.includes(term) || campName.includes(term) || creator.includes(term);
  });

  return (
    <div className="font-outfit p-1 text-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1A1A1A]">Planner Tasks</h1>
          <p className="text-slate-500 text-sm mt-1">Manage scheduled operations, creator checklists, and delivery tasks.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-[#1F3C37] hover:bg-[#1F3C37]/90 text-white font-bold py-3 px-6 rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-[#1F3C37]/10"
        >
          <Plus className="w-5 h-5" />
          Add Task
        </button>
      </div>

      {/* Search & Statistics */}
      <div className="bg-white rounded-3xl p-6 mb-6 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="relative w-full md:max-w-md">
          <input
            type="text"
            placeholder="Search tasks, campaigns, or creators..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 pl-11 focus:outline-none focus:ring-2 focus:ring-[#1F3C37]/20 focus:border-[#1F3C37] text-sm transition-all"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>
        <div className="text-slate-400 text-sm font-semibold">
          Total tasks found: {filteredTasks.length}
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {tasksLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#1F3C37] animate-spin" />
          </div>
        ) : filteredTasks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-400 w-12">Status</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-400">Task</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-400">Campaign</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-400">Creator</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-400">Scheduled Date</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-400 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleToggleCompleted(t)}
                        className="text-slate-400 hover:text-[#1F3C37] transition-all"
                        title={t.completed ? "Mark as Pending" : "Mark as Completed"}
                      >
                        {t.completed ? (
                          <CheckSquare className="w-5 h-5 text-green-500" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-300" />
                        )}
                      </button>
                    </td>
                    <td className="py-4 px-6">
                      <p className={`font-bold text-slate-800 ${t.completed ? "line-through text-slate-400" : ""}`}>
                        {t.name}
                      </p>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-600">{t.campaign}</td>
                    <td className="py-4 px-6 font-semibold text-slate-600">{getUserName(t.userId)}</td>
                    <td className="py-4 px-6 text-slate-500 font-medium text-sm">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {new Date(t.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(t)}
                          className="p-2 text-slate-500 hover:text-[#1F3C37] hover:bg-slate-100 rounded-xl transition-all"
                          title="Edit Task"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id, t.name)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          title="Delete Task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-400 font-medium text-sm">No tasks found in planner.</p>
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999] p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md p-8 border border-slate-100 shadow-2xl relative">
            <button
              onClick={closeModal}
              className="absolute right-6 top-6 p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-extrabold text-[#1A1A1A] mb-2">
              {selectedTask ? "Edit Task" : "Create Task"}
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              {selectedTask ? "Modify task specifications and dates." : "Assign a task checklist item to a creator."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!selectedTask && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Target Creator</label>
                  <select
                    required
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#1F3C37]/20 focus:border-[#1F3C37] text-sm transition-all"
                  >
                    <option value="">Select a creator...</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.firstName} {u.lastName} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Task Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Record UGC Video A"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#1F3C37]/20 focus:border-[#1F3C37] text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Campaign Identifier</label>
                <input
                  type="text"
                  required
                  value={campaign}
                  onChange={(e) => setCampaign(e.target.value)}
                  placeholder="Active Campaign Name"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#1F3C37]/20 focus:border-[#1F3C37] text-sm transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Scheduled Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#1F3C37]/20 focus:border-[#1F3C37] text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Status</label>
                  <select
                    value={completed ? "true" : "false"}
                    onChange={(e) => setCompleted(e.target.value === "true")}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#1F3C37]/20 focus:border-[#1F3C37] text-sm transition-all"
                  >
                    <option value="false">Pending</option>
                    <option value="true">Completed</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3.5 rounded-xl text-center transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 bg-[#1F3C37] hover:bg-[#1F3C37]/90 text-white font-bold py-3.5 rounded-xl text-center transition-all text-sm flex items-center justify-center gap-2"
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : selectedTask ? (
                    "Save Changes"
                  ) : (
                    "Create Task"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
