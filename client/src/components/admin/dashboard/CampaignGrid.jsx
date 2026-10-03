import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import CampaignCard from "../camping/components/CampaignCard";
import DeleteCampaignModal from "../camping/components/DeleteCampaignModal";
import { useDeleteUgcCampaign } from "@/api/apiHooks/useUgcCampaign";

const CampaignGrid = ({ campaigns = [], onEdit }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const deleteMutation = useDeleteUgcCampaign();

  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    campaignId: null,
    campaignTitle: "",
  });

  const handleDelete = (campaign) => {
    setDeleteModalState({
      isOpen: true,
      campaignId: campaign.id,
      campaignTitle: campaign.name || campaign.title || "Campaign",
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteModalState.campaignId) return;
    deleteMutation.mutate(deleteModalState.campaignId, {
      onSuccess: () => {
        setDeleteModalState({
          isOpen: false,
          campaignId: null,
          campaignTitle: "",
        });
        queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
        queryClient.invalidateQueries({ queryKey: ["invoices"] });
      },
    });
  };

  return (
    <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-4 w-full shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#1A1A1A]">Active Campaigns</h2>
        <button
          onClick={() => navigate("/dashboard/campaigns")}
          className="text-Primary text-sm font-bold flex items-center gap-1 hover:underline cursor-pointer"
        >
          See all <span className="text-lg">→</span>
        </button>
      </div>
      <div className="grid grid-cols-1 xlg:grid-cols-2 xl:grid-cols-3 gap-3.5">
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
              deliverables={campaign.deliverables || []}
              tasks={campaign.tasks || []}
              media={campaign.media || []}
              releaseFiles={campaign.releaseFiles}
              feedback={campaign.feedback || []}
              campaign={campaign}
              onEdit={() => onEdit && onEdit(campaign)}
              onDelete={() => handleDelete(campaign)}
            />
          ))
        ) : (
          <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-12 border-2 border-dashed border-gray-100 rounded-[32px] bg-white">
            <p className="text-gray-400 font-medium">
              No active campaigns found.
            </p>
          </div>
        )}
      </div>

      <DeleteCampaignModal
        isOpen={deleteModalState.isOpen}
        onClose={() =>
          setDeleteModalState({
            isOpen: false,
            campaignId: null,
            campaignTitle: "",
          })
        }
        onConfirm={handleConfirmDelete}
        campaignTitle={deleteModalState.campaignTitle}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
};

export default CampaignGrid;
