import React from 'react';
import { Clock, CheckCircle, DollarSign } from 'lucide-react';
import { CampaignIcon } from '@/components/icons/CustomIcon';
import { motion } from 'motion/react';

const StatsCard = ({ title, value, label, icon: Icon, isPrimary, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    className={`p-6 rounded-[32px] flex flex-col justify-between h-48 border transition-all duration-300 ${
      isPrimary 
        ? 'bg-Primary border-Primary text-white shadow-xl shadow-Primary/30' 
        : 'bg-white border-gray-100 text-[#1A1A1A] hover:border-Primary/30'
    }`}
  >
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
      isPrimary ? 'bg-white/20' : 'bg-[#F8FAFC]'
    }`}>
      <Icon className={`w-6 h-6 ${isPrimary ? 'text-white' : 'text-Primary'}`} color={isPrimary ? '#ffffff' : undefined} />
    </div>
    <div>
      <h2 className="text-4xl font-bold mb-1">{value}</h2>
      <p className={`text-sm font-medium ${isPrimary ? 'text-white/80' : 'text-gray-500'}`}>
        {label}
      </p>
    </div>
  </motion.div>
);

const StatsSection = () => {
  const stats = [
    { title: "Active Campaigns", value: "03", label: "Active Campaigns", icon: CampaignIcon, isPrimary: true },
    { title: "Awaiting Review", value: "02", label: "Awaiting Review", icon: Clock, isPrimary: false },
    { title: "Completed Campaigns", value: "04", label: "Completed Campaigns", icon: CheckCircle, isPrimary: false },
    { title: "Total Earned", value: "$500.00", label: "Total Earned", icon: DollarSign, isPrimary: false },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
      {stats.map((stat, index) => (
        <StatsCard key={stat.title} {...stat} index={index} />
      ))}
    </div>
  );
};

export default StatsSection;
