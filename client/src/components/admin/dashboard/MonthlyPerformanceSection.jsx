import React from "react";
import { ArrowUpRight } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-lg font-urbanist text-xs space-y-1 z-50">
        <p className="font-semibold text-[#1A1A1A]">{label}</p>
        <p className="text-Primary font-bold text-sm">
          Revenue: ${Number(data.earnings || 0).toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const MonthlyPerformanceSection = ({ monthlyTrends = [], stats = {} }) => {
  // Use real backend trends or generate real 0-baseline last 6 months
  const chartData = React.useMemo(() => {
    if (Array.isArray(monthlyTrends) && monthlyTrends.length > 0) {
      return monthlyTrends;
    }
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      result.push({
        month: `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`,
        earnings: 0,
        campaigns: 0,
      });
    }
    return result;
  }, [monthlyTrends]);

  const totalEarnedNum = parseFloat(stats?.totalEarned ?? 0) || 0;
  const currentMonthEarnings =
    "$" +
    totalEarnedNum.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="w-full bg-white border border-gray-100 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm space-y-6 font-urbanist">
      {/* Top Header Row with Title and Simple Text Total Revenue */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg md:text-xl font-bold text-[#1A1A1A]">
              Monthly Performance & Growth
            </h2>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              <ArrowUpRight className="w-3 h-3" /> Live Dynamic
            </span>
          </div>
          <p className="text-xs text-gray-400 font-medium mt-0.5">
            Track your month-over-month earnings and performance trends
          </p>
        </div>

        {/* Total Revenue: Simple Clean Text Display with Reduced Bold */}
        <div className="flex items-baseline gap-2 self-start sm:self-auto bg-gray-50/70 border border-gray-100 px-4 py-2 rounded-xl">
          <span className="text-xs text-gray-500 font-medium">Total Revenue:</span>
          <span className="text-base md:text-lg font-semibold text-[#1A1A1A]">
            {currentMonthEarnings}
          </span>
        </div>
      </div>

      {/* Dynamic Graph Chart with Urbanist Font and Primary Gradient */}
      <div className="pt-2">
        <div className="h-64 md:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <defs>
                <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#005BD6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#005BD6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#9CA3AF", fontFamily: "Urbanist, sans-serif" }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#9CA3AF", fontFamily: "Urbanist, sans-serif" }}
                tickFormatter={(val) => `$${val}`}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="earnings"
                stroke="#005BD6"
                strokeWidth={2.5}
                fill="url(#perfGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MonthlyPerformanceSection;
