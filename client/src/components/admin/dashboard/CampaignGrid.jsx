import React from 'react';
import { useNavigate } from 'react-router-dom';
import CampaignCard from '../camping/components/CampaignCard';

const CampaignGrid = () => {
  const navigate = useNavigate();

  const campaigns = [
    { id: 1, title: "Summer Skincare Promo", brand: "GlowCare", amount: "$500.00", dueDate: "May 06, 2025", status: "Draft", progress: 50 },
    { id: 2, title: "Summer Skincare Promo", brand: "GlowCare", amount: "$500.00", dueDate: "May 06, 2025", status: "Under Review", progress: 85 },
    { id: 3, title: "Summer Skincare Promo", brand: "GlowCare", amount: "$500.00", dueDate: "May 06, 2025", status: "Under Review", progress: 60 },
    { id: 4, title: "Summer Skincare Promo", brand: "GlowCare", amount: "$500.00", dueDate: "May 06, 2025", status: "Approved", progress: 100 },
  ];

  const handleEdit = (id) => {
    console.log('Edit Campaign from Dashboard:', id);
  };

  const handleDelete = (id) => {
    console.log('Delete Campaign from Dashboard:', id);
  };

  return (
    <div className="flex-1 bg-white rounded-xl p-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-[#1A1A1A]">Active Campaigns</h2>
        <button 
          onClick={() => navigate('/dashboard/campaigns')}
          className="text-Primary text-sm font-bold flex items-center gap-1 hover:underline"
        >
          See all <span className="text-lg">→</span>
        </button>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {campaigns.map((campaign) => (
          <CampaignCard 
            key={campaign.id} 
            {...campaign} 
            onEdit={() => handleEdit(campaign.id)}
            onDelete={() => handleDelete(campaign.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default CampaignGrid;
