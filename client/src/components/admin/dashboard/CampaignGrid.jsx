import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import CampaignCard from "../camping/components/CampaignCard";
import DeleteCampaignModal from "../camping/components/DeleteCampaignModal";
import { useDeleteUgcCampaign } from "@/api/apiHooks/useUgcCampaign";

const CampaignGrid = ({ campaigns = [], onEdit }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const deleteMutation = useDeleteUgcCampaign();
  const swiperRef = useRef(null);

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
    <div className="flex-1 bg-white border border-gray-100 rounded-2xl md:rounded-3xl p-4 sm:p-5 md:p-6 w-full min-w-0 shadow-sm overflow-hidden font-urbanist">
      {/* Responsive Header: Clean wrap and spacing for mobile and desktop */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 mb-4 md:mb-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-[#1A1A1A]">
              Recent Campaigns
            </h2>
            <p className="text-xs text-gray-400 font-medium hidden sm:block mt-0.5">
              Swipe or use arrows to navigate through recent campaigns
            </p>
          </div>

          {/* Mobile Right: See all button directly in header row */}
          <button
            onClick={() => navigate("/dashboard/campaigns")}
            className="sm:hidden text-Primary text-xs font-bold flex items-center gap-1 hover:underline cursor-pointer bg-Primary/5 px-2.5 py-1 rounded-lg transition-colors"
          >
            See all <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-2 md:gap-3 w-full sm:w-auto">
          <p className="text-[11px] text-gray-400 font-medium sm:hidden">
            Swipe left or right
          </p>

          <div className="flex items-center gap-2">
            {campaigns.length > 1 && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => swiperRef.current?.slidePrev()}
                  className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600 hover:text-Primary transition-all duration-200 shadow-xs cursor-pointer"
                  title="Previous"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => swiperRef.current?.slideNext()}
                  className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600 hover:text-Primary transition-all duration-200 shadow-xs cursor-pointer"
                  title="Next"
                  aria-label="Next"
                >
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                </button>
              </div>
            )}

            <button
              onClick={() => navigate("/dashboard/campaigns")}
              className="hidden sm:flex text-Primary text-xs md:text-sm font-bold items-center gap-1 hover:underline cursor-pointer bg-Primary/5 hover:bg-Primary/10 px-3 py-1.5 rounded-xl transition-colors"
            >
              See all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Universal Swiper Carousel across Desktop, Laptop, Tablet, and Mobile */}
      {campaigns.length > 0 ? (
        <div className="w-full relative overflow-hidden">
          <Swiper
            modules={[Navigation]}
            onBeforeInit={(swiper) => {
              swiperRef.current = swiper;
            }}
            spaceBetween={12}
            slidesPerView={1.05}
            breakpoints={{
              320: { slidesPerView: 1.05, spaceBetween: 12 },
              480: { slidesPerView: 1.15, spaceBetween: 14 },
              640: { slidesPerView: 1.8, spaceBetween: 16 },
              1024: { slidesPerView: 2.3, spaceBetween: 16 },
              1280: { slidesPerView: 2.8, spaceBetween: 18 },
              1536: { slidesPerView: 3.2, spaceBetween: 20 },
            }}
            className="campaign-dashboard-swiper w-full !overflow-visible"
          >
            {campaigns.map((campaign) => (
              <SwiperSlide key={campaign.id} className="!h-auto flex">
                <div className="w-full h-full pb-1">
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
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-2xl bg-white">
          <p className="text-gray-400 font-medium">No active campaigns found.</p>
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
