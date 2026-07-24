import React from 'react';
import { Clock, CheckCircle, DollarSign } from 'lucide-react';
import { CampaignIcon } from '@/components/icons/CustomIcon';
import { motion } from 'motion/react';

const StatsCard = ({ title, value, label, icon: Icon, iconBg, iconColor, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    className="p-4 rounded-2xl flex flex-col justify-between h-36 border border-gray-100 bg-white text-[#1A1A1A] hover:border-Primary/30 shadow-sm transition-all duration-300"
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg || 'bg-blue-50'}`}>
      <Icon className={`w-5 h-5 ${iconColor || 'text-blue-600'}`} />
    </div>
    <div>
      <h2 className="text-2xl font-bold mb-0.5">{value}</h2>
      <p className="text-xs font-medium text-gray-500">
        {label}
      </p>
    </div>
  </motion.div>
);

const StatsSection = ({ stats }) => {
  const activeCampaignsVal = String(stats?.activeCampaigns ?? 0).padStart(2, '0');
  const awaitingReviewVal = String(stats?.awaitingReview ?? 0).padStart(2, '0');
  const completedVal = String(stats?.completedCampaigns ?? 0).padStart(2, '0');

  const totalEarnedVal = '$' + parseFloat(stats?.totalEarned ?? 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const statsList = [
    { title: "Active Campaigns", value: activeCampaignsVal, label: "Active Campaigns", icon: CampaignIcon, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
    { title: "Awaiting Review", value: awaitingReviewVal, label: "Awaiting Review", icon: Clock, iconBg: "bg-amber-50", iconColor: "text-amber-600" },
    { title: "Completed Campaigns", value: completedVal, label: "Completed Campaigns", icon: CheckCircle, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
    { title: "Total Earned", value: totalEarnedVal, label: "Total Earned", icon: DollarSign, iconBg: "bg-purple-50", iconColor: "text-purple-600" },
  ];

  return (
    <div className="grid xlg:grid-cols-4 lg:grid-cols-2 sm:grid-cols-4 grid-cols-2 gap-4 w-full">
      {statsList.map((stat, index) => (
        <StatsCard key={stat.title} {...stat} index={index} />
      ))}
    </div>
  );
};

export default StatsSection;
