import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import StatsSection from './dashboard/StatsSection';
import CampaignGrid from './dashboard/CampaignGrid';
import DeadlinesSidebar from './dashboard/DeadlinesSidebar';
import CommonButton from '@/components/ui/CommonButton';
import CreateCampaignModal from './camping/components/CreateCampaignModal';

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="py-2">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">Welcome back, Jahan</h1>
          <p className="text-gray-500 text-sm">Here's what's happening with your campaigns.</p>
        </div>
        <CommonButton 
          onClick={() => setIsModalOpen(true)}
          className="bg-Primary text-white px-6 py-3.5 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-Primary/20 hover:bg-Primary/90 transition-all"
        >
          <Plus className="w-5 h-5" />
          Create Campaigns
        </CommonButton>
      </div>

      {/* Stats Section */}
      <StatsSection />

      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-10 items-start">
        {/* Left Column: Campaigns */}
        <CampaignGrid />

        {/* Right Column: Deadlines & Tasks */}
        <DeadlinesSidebar />
      </div>

      <CreateCampaignModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default Dashboard;