import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
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
    <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-4 w-full min-w-0 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#1A1A1A]">Active Campaigns</h2>
        <button
          onClick={() => navigate("/dashboard/campaigns")}
          className="text-Primary text-sm font-bold flex items-center gap-1 hover:underline cursor-pointer"
        >
          See all <span className="text-lg">→</span>
        </button>
      </div>

      {campaigns.length > 0 ? (
        <>
          {/* Desktop Grid: xlg and above */}
          <div className="hidden xlg:grid xlg:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {campaigns.map((campaign) => (
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
            ))}
          </div>

          {/* Swiper Slider: below xlg (under 1200px) */}
          <div className="xlg:hidden w-full pb-2">
            <Swiper
              spaceBetween={16}
              slidesPerView={1.15}
              centeredSlides={false}
              className="campaign-dashboard-swiper w-full"
            >
              {campaigns.map((campaign) => (
                <SwiperSlide key={campaign.id} className="!h-auto flex">
                  <div className="w-full h-full">
                    <CampaignCard
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
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-[32px] bg-white">
          <p className="text-gray-400 font-medium">
            No active campaigns found.
          </p>
        </div>
      )}

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
