import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import StatsSection from './dashboard/StatsSection';
import CampaignGrid from './dashboard/CampaignGrid';
import DeadlinesSidebar from './dashboard/DeadlinesSidebar';
import CommonButton from '@/components/ui/CommonButton';
import CreateCampaignModal from './camping/components/CreateCampaignModal';
import { useUserProfile, useDashboardStats } from '@/api/apiHooks/useUser';

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, isLoading: isUserLoading } = useUserProfile();
  const { data: dashboardData, isLoading: isStatsLoading } = useDashboardStats();

  if (isUserLoading || isStatsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-Primary"></div>
      </div>
    );
  }

  const welcomeName = user?.firstName || user?.displayName || 'Jahan';

  return (
    <div className="py-2">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-1.5 md:mb-2">Welcome back, {welcomeName}</h1>
          <p className="text-gray-500 text-xs md:text-sm">Here's what's happening with your campaigns.</p>
        </div>
        <CommonButton 
          onClick={() => setIsModalOpen(true)}
          className="bg-Primary text-white px-5 py-3 md:px-6 md:py-3.5 rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-Primary/20 hover:bg-Primary/90 transition-all text-xs md:text-sm w-full md:w-auto"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
          Create Campaigns
        </CommonButton>
      </div>

      {/* Stats Section */}
      <StatsSection stats={dashboardData?.stats} />

      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start w-full">
        {/* Left Column: Campaigns */}
        <CampaignGrid campaigns={dashboardData?.recentCampaigns} />

        {/* Right Column: Deadlines & Tasks */}
        <DeadlinesSidebar deadlines={dashboardData?.deadlines} tasks={dashboardData?.tasks} />
      </div>

      <CreateCampaignModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};


export default Dashboard;