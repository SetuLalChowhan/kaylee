import React, { useState } from "react";
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
  Users,
  FileText
} from "lucide-react";
import { motion } from "motion/react";
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  BarChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

const StatsCard = ({ title, value, label, icon: Icon, isPrimary, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    className={`p-6 rounded-[32px] flex flex-col justify-between h-48 border transition-all duration-300 ${
      isPrimary
        ? "bg-Primary border-Primary text-white shadow-xl shadow-Primary/30"
        : "bg-white border-slate-100 text-[#1A1A1A] hover:border-Primary/30"
    }`}
  >
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
      isPrimary ? "bg-white/20" : "bg-Primary/5"
    }`}>
      <Icon className={`w-6 h-6 ${isPrimary ? "text-white" : "text-Primary"}`} />
    </div>
    <div>
      <h2 className="text-4xl font-bold mb-1">{value}</h2>
      <p className={`text-sm font-medium ${isPrimary ? "text-white/80" : "text-slate-500"}`}>
        {label}
      </p>
    </div>
  </motion.div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md border border-slate-100 p-4 rounded-2xl shadow-xl font-outfit">
        <p className="text-xs font-bold text-slate-800 mb-2">{label}</p>
        <div className="space-y-1.5">
          {payload.map((entry, index) => {
            const isEarnings = entry.dataKey === "earnings" || entry.name.toLowerCase().includes("earnings");
            const formattedVal = isEarnings
              ? `$${parseFloat(entry.value).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
              : entry.value;
            return (
              <div key={index} className="flex items-center gap-2.5 text-xs font-semibold">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
                <span className="text-slate-500">{entry.name}:</span>
                <span className="text-slate-800 font-bold">{formattedVal}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

const DashboardChart = ({ trends }) => {
  const [activeTab, setActiveTab] = useState("overall"); // "overall" | "earnings" | "campaigns"

  if (!trends || trends.length === 0) return null;

  return (
    <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm mb-10 font-outfit">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-xl font-bold text-[#1A1A1A]">System Performance Analytics</h2>
          <p className="text-xs text-slate-400 mt-1">Review operational metrics and system earnings trends.</p>
        </div>
        
        {/* Modern Tab Pill Selector */}
        <div className="flex items-center bg-slate-50 border border-slate-100 p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab("overall")}
            className={`text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === "overall" ? "bg-Primary text-white shadow-md shadow-Primary/10" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Overall Performance
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("earnings")}
            className={`text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === "earnings" ? "bg-Primary text-white shadow-md shadow-Primary/10" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Earnings Graph
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("campaigns")}
            className={`text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === "campaigns" ? "bg-Primary text-white shadow-md shadow-Primary/10" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Campaign Volume
          </button>
        </div>
      </div>

      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === "overall" ? (
            <ComposedChart data={trends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEarningsOverall" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#005BD6" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#005BD6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 500 }}
              />
              <YAxis
                yAxisId="left"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#94A3B8", fontSize: 11 }}
                tickFormatter={(val) => `$${val}`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#94A3B8", fontSize: 11 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="earnings"
                name="Earnings"
                stroke="#005BD6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorEarningsOverall)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="campaigns"
                name="Campaigns"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: "#ffffff" }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          ) : activeTab === "earnings" ? (
            <AreaChart data={trends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEarningsTab" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#005BD6" stopOpacity="0.3"/>
                  <stop offset="95%" stopColor="#005BD6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 500 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#94A3B8", fontSize: 11 }}
                tickFormatter={(val) => `$${val}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="earnings"
                name="Earnings"
                stroke="#005BD6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorEarningsTab)"
              />
            </AreaChart>
          ) : (
            <BarChart data={trends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 500 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#94A3B8", fontSize: 11 }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="campaigns"
                name="Campaigns"
                fill="#10B981"
                radius={[8, 8, 0, 0]}
                maxBarSize={50}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-Primary"></div>
      </div>
    );
  }

  const stats = data?.data?.stats || data?.stats || {};
  const recentCampaigns = data?.data?.recentCampaigns || data?.recentCampaigns || [];
  const deadlines = data?.data?.deadlines || data?.deadlines || [];
  const tasks = data?.data?.tasks || data?.tasks || [];
  const monthlyTrends = data?.data?.monthlyTrends || data?.monthlyTrends || [];

  const activeCampaignsVal = String(stats.activeCampaigns ?? 0).padStart(2, "0");
  const awaitingReviewVal = String(stats.awaitingReview ?? 0).padStart(2, "0");
  const totalInvoicesVal = String(stats.totalInvoices ?? 0).padStart(2, "0");
  const stripeIncomeVal = "$" + parseFloat(stats.stripeIncome ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const statsList = [
    { title: "Active Campaigns", value: activeCampaignsVal, label: "System Campaigns", icon: FolderOpen, isPrimary: true },
    { title: "Awaiting Review", value: awaitingReviewVal, label: "Awaiting Approval", icon: Clock, isPrimary: false },
    { title: "Total Invoices", value: totalInvoicesVal, label: "Total Platform Invoices", icon: FileText, isPrimary: false },
    { title: "Stripe Revenue", value: stripeIncomeVal, label: "Platform Earnings", icon: DollarSign, isPrimary: false },
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

      {/* Historical Growth Chart */}
      <DashboardChart trends={monthlyTrends} />

      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-10 items-start">
        {/* Left Column: Campaigns */}
        <div className="flex-1 bg-white rounded-[32px] p-8 w-full border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-[#1A1A1A]">Recent Campaigns</h2>
            <Link
              to="/dashboard/campaigns"
              className="text-Primary text-sm font-bold flex items-center gap-1 hover:underline"
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
                    to={`/dashboard/campaigns/${campaign.id}`}
                    className="block bg-slate-50/50 border border-slate-100/80 rounded-2xl p-5 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 bg-Primary/5 rounded-xl flex items-center justify-center">
                        <Folder className="w-5 h-5 text-Primary" />
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
                            className="h-full bg-Primary rounded-full transition-all duration-500"
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
                          campaign.status === "Completed" ? "bg-blue-50 text-Primary" :
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
                className="text-Primary text-xs font-bold hover:underline"
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
                className="text-Primary text-xs font-bold hover:underline"
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
                        <Circle className="w-4 h-4 text-slate-200 group-hover:text-Primary transition-colors" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className={`text-xs font-bold ${task.completed ? "text-slate-400 line-through" : "text-[#1A1A1A]"} leading-tight`}>
                        {task.title}
                      </h4>
                      <p className="text-[10px] text-Primary font-semibold">{task.sub}</p>
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

