import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import CampaignCard from './components/CampaignCard';
import CreateCampaignModal from './components/CreateCampaignModal';

const Campaign = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [campaigns, setCampaigns] = useState([
    { id: 1, title: "Summer Skincare Promo", brand: "GlowCare", amount: "$500.00", dueDate: "May 06, 2025", status: "Draft", progress: 50 },
    { id: 2, title: "Summer Skincare Promo", brand: "GlowCare", amount: "$500.00", dueDate: "May 06, 2025", status: "Under Review", progress: 85 },
    { id: 3, title: "Summer Skincare Promo", brand: "GlowCare", amount: "$500.00", dueDate: "May 06, 2025", status: "Under Review", progress: 60 },
    { id: 4, title: "Summer Skincare Promo", brand: "GlowCare", amount: "$500.00", dueDate: "May 06, 2025", status: "Approved", progress: 100 },
    { id: 5, title: "Summer Skincare Promo", brand: "GlowCare", amount: "$500.00", dueDate: "May 06, 2025", status: "Completed", progress: 100 },
  ]);

  const handleEdit = (id) => {
    console.log('Edit Campaign:', id);
  };

  const handleDelete = (id) => {
    console.log('Delete Campaign:', id);
    setCampaigns(campaigns.filter(c => c.id !== id));
  };

  return (
    <div className="py-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">Campaigns</h1>
          <p className="text-gray-400 text-sm font-medium tracking-tight">Track progress, deliverables, and brand feedback</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-Primary text-white px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-Primary/20 hover:bg-Primary/90 transition-all"
        >
          <Plus className="w-5 h-5" />
          Create Campaigns
        </button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
        {campaigns.map((campaign) => (
          <CampaignCard
            key={campaign.id}
            {...campaign}
            onEdit={() => handleEdit(campaign.id)}
            onDelete={() => handleDelete(campaign.id)}
          />
        ))}
      </div>

      <CreateCampaignModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Campaign;