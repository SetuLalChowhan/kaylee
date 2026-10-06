import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import { USER } from '@/api/apiEndPoint';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, Target, Star, Loader2, ChevronRight, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

const Analytics = () => {
  const [timeframe, setTimeframe] = useState('6');
  const axiosSecure = useAxiosSecure();
  
  const { data, isLoading } = useQuery({
    queryKey: ['campaignAnalytics', timeframe],
    queryFn: async () => {
      const res = await axiosSecure.get(`${USER.UGC_CAMPAIGN}/analytics?months=${timeframe}`);
      return res.data?.data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-Primary" />
      </div>
    );
  }

  const { 
    totalIncome = 0, 
    completedCampaigns = 0, 
    avgRating = 0, 
    earningsOverview = [], 
    deliverablesCompletedGraph = [], 
    campaignStatusData = [], 
    topCampaigns = [] 
  } = data || {};

  const totalCampaignsVal = campaignStatusData.reduce((sum, item) => sum + item.value, 0);

  const stats = [
    {
      title: 'Total Earnings',
      value: `$${totalIncome.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'Deliverables Completed',
      value: completedCampaigns,
      icon: Target,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Total Campaigns',
      value: totalCampaignsVal,
      icon: Briefcase,
      color: 'bg-orange-100 text-orange-600',
    },
    {
      title: 'Client Rating',
      value: `${avgRating} / 5`,
      icon: Star,
      color: 'bg-yellow-100 text-yellow-600',
    },
  ];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Analytics</h1>
          <p className="text-gray-500 mt-1">Track your growth, performance and impact.</p>
        </div>
        <div>
           <select 
             value={timeframe}
             onChange={(e) => setTimeframe(e.target.value)}
             className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-Primary/20"
           >
             <option value="3">Last 3 months</option>
             <option value="6">Last 6 months</option>
             <option value="9">Last 9 months</option>
             <option value="12">Last 12 months</option>
           </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center">
               <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${stat.color} flex shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-black text-[#1A1A1A]">{stat.value}</h3>
               </div>
               <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
            </div>
          );
        })}
      </div>

      {/* Middle Row Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings Overview */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="p-1.5 bg-blue-50 rounded-md">
                 <DollarSign className="w-4 h-4 text-blue-500" />
              </div>
              <span className="font-bold text-[#1A1A1A]">Earnings Overview</span>
            </div>
          </div>
          <div className="mb-4">
             <h3 className="text-3xl font-black text-[#1A1A1A]">${totalIncome.toLocaleString()}</h3>
             <p className="text-xs text-gray-400 uppercase font-semibold">total earnings</p>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={earningsOverview} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(val) => `$${val}`} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`$${value}`, 'Earnings']}
                />
                <Area type="monotone" dataKey="totalEarnings" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Deliverables Completed */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="p-1.5 bg-purple-50 rounded-md">
                 <Target className="w-4 h-4 text-purple-500" />
              </div>
              <span className="font-bold text-[#1A1A1A]">Deliverables Completed</span>
            </div>
          </div>
          <div className="mb-4">
             <h3 className="text-3xl font-black text-[#1A1A1A]">{completedCampaigns}</h3>
             <p className="text-xs text-gray-400 uppercase font-semibold">total deliverables</p>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deliverablesCompletedGraph} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <RechartsTooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="totalDeliverables" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Performing Campaigns */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-[#1A1A1A]">Top Performing Campaigns</h2>
            <Link to="/dashboard/campaigns" className="text-xs text-Primary font-semibold hover:underline flex items-center">
              View all <ChevronRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
          <div className="flex-1 space-y-4">
            {topCampaigns.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 gap-3 py-6">
                <Target className="w-8 h-8 stroke-1" />
                <p className="text-sm">No campaigns yet.</p>
              </div>
            ) : (
              topCampaigns.map((camp) => (
                <Link
                  key={camp.id}
                  to={`/dashboard/campaigns/${camp.id}`}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-10 h-10 bg-[#1A1A1A] rounded-full flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold uppercase">{camp.brandName.substring(0,2)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-[#1A1A1A] text-xs truncate uppercase">{camp.name}</h4>
                    <p className="text-[10px] text-gray-400 truncate">{camp.brandName}</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg shrink-0">
                    ${parseFloat(camp.amount || 0).toLocaleString()}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Audience Reach (Donut Chart for Status) */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col">
          <h2 className="text-sm font-bold text-[#1A1A1A] mb-2">Campaign Distribution</h2>
          <div className="flex-1 flex items-center justify-center relative">
            <div className="h-[200px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={campaignStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {campaignStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <span className="text-2xl font-black text-[#1A1A1A]">{totalCampaignsVal}</span>
                 <span className="text-[10px] text-gray-500 uppercase font-semibold mt-1">Total</span>
              </div>
            </div>
            
            <div className="absolute right-0 top-1/2 -translate-y-1/2 space-y-2 bg-white/80 p-2">
               {campaignStatusData.map((item, idx) => (
                 <div key={idx} className="flex items-center gap-2 text-[10px] font-semibold text-gray-600">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="capitalize">{item.name}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
