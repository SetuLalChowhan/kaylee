import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import StatsSection from './dashboard/StatsSection';
import CampaignGrid from './dashboard/CampaignGrid';
import DeadlinesSidebar from './dashboard/DeadlinesSidebar';
import CommonButton from '@/components/ui/CommonButton';
import CreateCampaignModal from './camping/components/CreateCampaignModal';
import { useUserProfile, useDashboardStats } from '@/api/apiHooks/useUser';
import PlatformDemoModal from '@/components/admin/PlatformDemoModal';

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const { user, isLoading: isUserLoading } = useUserProfile();
  const { data: dashboardData, isLoading: isStatsLoading } = useDashboardStats();
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    if (user) {
      const hasSeen = localStorage.getItem("hasSeenDemoTour");
      if (!hasSeen) {
        setShowTour(true);
      }
    }
  }, [user]);

  if (isUserLoading || isStatsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-Primary"></div>
      </div>
    );
  }

  const welcomeName = user?.firstName || user?.displayName || 'Jahan';

  const handleEdit = (campaign) => {
    setSelectedCampaign(campaign);
    setIsModalOpen(true);
  };

  const handleCreateClick = () => {
    setSelectedCampaign(null);
    setIsModalOpen(true);
  };

  return (
    <div className="py-2">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-1.5 md:mb-2">
            Dashboard
          </h1>
          <p className="text-gray-500 text-xs md:text-sm">Here's what's happening with your campaigns.</p>
        </div>
        <CommonButton
          onClick={handleCreateClick}
          className="bg-Primary text-white px-5 py-3 md:px-6 md:py-3.5 rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-Primary/20 hover:bg-Primary/90 transition-all text-xs md:text-sm w-full md:w-auto"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
          Create Campaigns
        </CommonButton>
      </div>

      {/* Stats Section */}


      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start w-full">
        <div className=' flex flex-col gap-8 flex-1 w-full'>
          {/* Left Column: Campaigns */}
          <StatsSection stats={dashboardData?.stats} />
          <CampaignGrid campaigns={dashboardData?.recentCampaigns} onEdit={handleEdit} />

        </div>
        <div className='lg:w-auto w-full'>

          {/* Right Column: Deadlines & Tasks */}
          <DeadlinesSidebar deadlines={dashboardData?.deadlines} tasks={dashboardData?.tasks} />
        </div>
      </div>

      <CreateCampaignModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        campaign={selectedCampaign}
      />

      {showTour && (
        <PlatformDemoModal
          isOpen={showTour}
          onClose={() => setShowTour(false)}
        />
      )}
    </div>
  );
};


export default Dashboard;