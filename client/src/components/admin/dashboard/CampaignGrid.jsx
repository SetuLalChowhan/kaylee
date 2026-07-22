import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import CampaignCard from '../camping/components/CampaignCard';
import { useDeleteUgcCampaign } from '@/api/apiHooks/useUgcCampaign';

const CampaignGrid = ({ campaigns = [], onEdit }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const deleteMutation = useDeleteUgcCampaign();

  const getProgress = (status) => {
    switch (status) {
      case 'Completed': return 100;
      case 'Approved': return 100;
      case 'Under Review': return 75;
      case 'Active': return 50;
      case 'Draft': return 25;
      default: return 10;
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this campaign?")) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
        },
      });
    }
  };

  return (
    <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-4  w-full shadow-sm">
      <div className="flex items-center justify-between mb-6 ">
        <h2 className="text-xl font-bold text-[#1A1A1A]">Active Campaigns</h2>
        <button
          onClick={() => navigate('/dashboard/campaigns')}
          className="text-Primary text-sm font-bold flex items-center gap-1 hover:underline"
        >
          See all <span className="text-lg">→</span>
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {campaigns.length > 0 ? (
          campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              id={campaign.id}
              title={campaign.name}
              brand={campaign.brandName}
              amount={campaign.amount}
              dueDate={campaign.deadline}
              status={campaign.status}
              progress={getProgress(campaign.status)}
              onEdit={() => onEdit && onEdit(campaign)}
              onDelete={() => handleDelete(campaign.id)}
            />
          ))
        ) : (
          <div className="col-span-1 xl:col-span-2 text-center py-12 border-2 border-dashed border-gray-100 rounded-[32px] bg-white">
            <p className="text-gray-400 font-medium">No active campaigns found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignGrid;

