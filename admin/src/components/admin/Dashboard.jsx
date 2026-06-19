import React from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import useClient from "@/hooks/useClient";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import {
  Clock,
  CheckCircle,
  DollarSign,
  Folder,
  CheckCircle2,
  Circle,
  FolderOpen,
  Calendar,
  Users
} from "lucide-react";
import { motion } from "motion/react";

const StatsCard = ({ title, value, label, icon: Icon, isPrimary, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    className={`p-6 rounded-[32px] flex flex-col justify-between h-48 border transition-all duration-300 ${
      isPrimary
        ? "bg-[#1F3C37] border-[#1F3C37] text-white shadow-xl shadow-[#1F3C37]/30"
        : "bg-white border-slate-100 text-[#1A1A1A] hover:border-[#1F3C37]/30"
    }`}
  >
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
      isPrimary ? "bg-white/20" : "bg-[#F8FAFC]"
    }`}>
      <Icon className={`w-6 h-6 ${isPrimary ? "text-white" : "text-[#1F3C37]"}`} />
    </div>
    <div>
      <h2 className="text-4xl font-bold mb-1">{value}</h2>
      <p className={`text-sm font-medium ${isPrimary ? "text-white/80" : "text-slate-500"}`}>
        {label}
      </p>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const axiosSecure = useAxiosSecure();
  const user = useSelector((state) => state.ui.user);

  const { data, isLoading } = useClient({
    queryKey: ["adminDashboardStats"],
    url: "/user/dashboard-stats",
    isPrivate: true,
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, completed }) => {
      const res = await axiosSecure.patch(`/planner/${taskId}`, { completed });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminDashboardStats"] });
    },
  });

  const handleToggleTask = (taskId, currentCompleted) => {
    updateTaskMutation.mutate({ taskId, completed: !currentCompleted });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1F3C37]"></div>
      </div>
    );
  }

  const stats = data?.data?.stats || data?.stats || {};
  const recentCampaigns = data?.data?.recentCampaigns || data?.recentCampaigns || [];
  const deadlines = data?.data?.deadlines || data?.deadlines || [];
  const tasks = data?.data?.tasks || data?.tasks || [];

  const activeCampaignsVal = String(stats.activeCampaigns ?? 0).padStart(2, "0");
  const awaitingReviewVal = String(stats.awaitingReview ?? 0).padStart(2, "0");
  const completedVal = String(stats.completedCampaigns ?? 0).padStart(2, "0");
  const totalEarnedVal = "$" + parseFloat(stats.totalEarned ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const statsList = [
    { title: "Active Campaigns", value: activeCampaignsVal, label: "System Campaigns", icon: FolderOpen, isPrimary: true },
    { title: "Awaiting Review", value: awaitingReviewVal, label: "Awaiting Approval", icon: Clock, isPrimary: false },
    { title: "Completed Campaigns", value: completedVal, label: "Completed Projects", icon: CheckCircle, isPrimary: false },
    { title: "Total Value", value: totalEarnedVal, label: "Cumulative Budget", icon: DollarSign, isPrimary: false },
  ];

  const getProgress = (status) => {
    switch (status) {
      case "Completed": return 100;
      case "Approved": return 100;
      case "Under Review": return 75;
      case "Active": return 50;
      case "Draft": return 25;
      default: return 10;
    }
  };

  const welcomeName = user?.firstName || user?.displayName || "Admin";

  return (
    <div className="py-2 font-outfit text-slate-800">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1A1A1A] mb-2">System Dashboard</h1>
          <p className="text-slate-500 text-sm">Hello, {welcomeName}. Here is the platform's global status overview.</p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        {statsList.map((stat, idx) => (
          <StatsCard key={stat.title} {...stat} index={idx} />
        ))}
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-10 items-start">
        {/* Left Column: Campaigns */}
        <div className="flex-1 bg-white rounded-[32px] p-8 w-full border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-[#1A1A1A]">Recent Campaigns</h2>
            <Link
              to="/dashboard/campaigns"
              className="text-[#1F3C37] text-sm font-bold flex items-center gap-1 hover:underline"
            >
              See all <span className="text-lg">→</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {recentCampaigns.length > 0 ? (
              recentCampaigns.map((campaign) => {
                const prog = getProgress(campaign.status);
                return (
                  <Link
                    key={campaign.id}
                    to={`/dashboard/campaigns`}
                    className="block bg-slate-50/50 border border-slate-100/80 rounded-2xl p-5 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 bg-[#1F3C37]/5 rounded-xl flex items-center justify-center">
                        <Folder className="w-5 h-5 text-[#1F3C37]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#1A1A1A] line-clamp-1">{campaign.name}</h3>
                        <p className="text-[11px] text-slate-400 font-medium">{campaign.brandName}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="h-1 flex-1 bg-slate-200 rounded-full overflow-hidden mr-3">
                          <div
                            className="h-full bg-[#1F3C37] rounded-full transition-all duration-500"
                            style={{ width: `${prog}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">
                          {prog}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Amount</p>
                        <p className="text-xs font-bold text-[#1A1A1A]">{campaign.amount}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          campaign.status === "Pending" ? "bg-yellow-50 text-yellow-600" :
                          campaign.status === "Draft" ? "bg-slate-100 text-slate-500" :
                          campaign.status === "Under Review" ? "bg-orange-50 text-orange-500" :
                          campaign.status === "Approved" ? "bg-green-50 text-green-500" :
                          campaign.status === "Completed" ? "bg-blue-50 text-[#1F3C37]" :
                          "bg-slate-100 text-slate-500"
                        }`}>
                          {campaign.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="col-span-1 xl:col-span-2 text-center py-12 border border-dashed border-slate-200 rounded-2xl">
                <p className="text-slate-400 font-medium text-sm">No campaigns found in the system.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Deadlines & Tasks */}
        <div className="w-full lg:w-[350px] space-y-10">
          {/* Upcoming Deadlines */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#1A1A1A]">System Deadlines</h2>
              <Link
                to="/dashboard/campaigns"
                className="text-[#1F3C37] text-xs font-bold hover:underline"
              >
                All Campaigns
              </Link>
            </div>
            <div className="space-y-4">
              {deadlines.length > 0 ? (
                deadlines.map((item, index) => (
                  <div key={item.id || index} className="flex items-center gap-3 group">
                    <div className="flex flex-col items-center justify-center min-w-[32px] border-r border-slate-100 pr-3">
                      <span className="text-xs font-bold text-red-500 leading-none mb-0.5">{item.day}</span>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase leading-none">{item.month}</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1A1A1A] leading-tight line-clamp-1">{item.title}</h4>
                      <p className="text-[10px] text-slate-400 font-medium line-clamp-1">{item.sub}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-xs text-center py-4">No upcoming deadlines.</p>
              )}
            </div>
          </div>

          {/* Pending Tasks */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#1A1A1A]">Pending Tasks</h2>
              <Link
                to="/dashboard/tasks"
                className="text-[#1F3C37] text-xs font-bold hover:underline"
              >
                Planner
              </Link>
            </div>
            <div className="space-y-4">
              {tasks.length > 0 ? (
                tasks.map((task, index) => (
                  <div
                    key={task.id || index}
                    onClick={() => handleToggleTask(task.id, task.completed)}
                    className="flex items-center gap-3 group cursor-pointer"
                  >
                    <div className="mt-0.5">
                      {task.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-200 group-hover:text-[#1F3C37] transition-colors" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className={`text-xs font-bold ${task.completed ? "text-slate-400 line-through" : "text-[#1A1A1A]"} leading-tight`}>
                        {task.title}
                      </h4>
                      <p className="text-[10px] text-[#1F3C37] font-semibold">{task.sub}</p>
                    </div>
                    <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap">{task.date}</span>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-xs text-center py-4">No pending tasks.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;