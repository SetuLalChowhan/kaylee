import React from 'react';
import { Clock, CheckCircle, DollarSign } from 'lucide-react';
import { CampaignIcon } from '@/components/icons/CustomIcon';
import { motion } from 'motion/react';

const StatsCard = ({ title, value, label, icon: Icon, isPrimary, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    className={`p-4  rounded-2xl  flex flex-col justify-between h-36  border transition-all duration-300 ${isPrimary
      ? 'bg-Primary border-Primary text-white shadow-xl shadow-Primary/30'
      : 'bg-white border-gray-100 text-[#1A1A1A] hover:border-Primary/30'
      }`}
  >
    <div className={`w-10 h-10  rounded-xl  flex items-center justify-center ${isPrimary ? 'bg-white/20' : 'bg-[#F8FAFC]'
      }`}>
      <Icon className={`w-5 h-5  ${isPrimary ? 'text-white' : 'text-Primary'}`} color={isPrimary ? '#ffffff' : undefined} />
    </div>
    <div>
      <h2 className="text-2xl  font-bold mb-0.5 ">{value}</h2>
      <p className={`text-xs  font-medium ${isPrimary ? 'text-white/80' : 'text-gray-500'}`}>
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
    { title: "Active Campaigns", value: activeCampaignsVal, label: "Active Campaigns", icon: CampaignIcon, isPrimary: true },
    { title: "Awaiting Review", value: awaitingReviewVal, label: "Awaiting Review", icon: Clock, isPrimary: false },
    { title: "Completed Campaigns", value: completedVal, label: "Completed Campaigns", icon: CheckCircle, isPrimary: false },
    { title: "Total Earned", value: totalEarnedVal, label: "Total Earned", icon: DollarSign, isPrimary: false },
  ];

  return (
    <div className="grid lg:grid-cols-4  sm:grid-cols-4 grid-cols-2 gap-4 w-full ">
      {statsList.map((stat, index) => (
        <StatsCard key={stat.title} {...stat} index={index} />
      ))}
    </div>
  );
};

export default StatsSection;
