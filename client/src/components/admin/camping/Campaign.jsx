import React, { useState, useMemo } from "react";
import { Plus, Clock, CheckCircle, FileText, Calendar } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import CampaignCard from "./components/CampaignCard";
import CreateCampaignModal from "./components/CreateCampaignModal";
import DeleteCampaignModal from "./components/DeleteCampaignModal";
import {
  useUgcCampaigns,
  useDeleteUgcCampaign,
} from "@/api/apiHooks/useUgcCampaign";
import { CampaignIcon } from "@/components/icons/CustomIcon";

const StatsCard = ({
  value,
  label,
  badge,
  icon: IconComponent,
  iconBg,
  iconColor,
}) => (
  <div className="p-4 sm:p-5 rounded-3xl flex flex-col justify-between min-h-[136px] border border-gray-100 bg-white text-[#1A1A1A] hover:border-Primary/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300">
    <div className="flex items-center justify-between">
      <div
        className={`w-10 h-10 rounded-2xl flex items-center justify-center ${iconBg || "bg-blue-50"} ${iconColor || "text-Primary"}`}
      >
        {IconComponent && <IconComponent className="w-5 h-5" />}
      </div>
      {badge && (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-600">
          {badge}
        </span>
      )}
    </div>
    <div className="mt-2">
      <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tight mb-0.5">
        {value}
      </h2>
      <p className="text-xs font-semibold text-gray-400">{label}</p>
    </div>
  </div>
);

const Campaign = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");

  const { data: campaigns = [], isLoading } = useUgcCampaigns("all");
  const deleteMutation = useDeleteUgcCampaign();

  // Counts by status
  const draftCount = campaigns.filter((c) => c.status === "Draft").length;
  const underReviewCount = campaigns.filter(
    (c) => c.status === "Under Review",
  ).length;
  const approvedCount = campaigns.filter((c) => c.status === "Approved").length;
  const completedCount = campaigns.filter(
    (c) => c.status === "Completed",
  ).length;
  const totalCampaigns = campaigns.length;

  // Dynamic Due This Week calculation
  const dueThisWeekCount = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const endOfWeek = new Date(startOfToday);
    endOfWeek.setDate(startOfToday.getDate() + 7);
    endOfWeek.setHours(23, 59, 59, 999);

    return campaigns.filter((c) => {
      if (!c.deadline || c.status === "Completed") return false;
      const d = new Date(c.deadline);
      return !isNaN(d.getTime()) && d >= startOfToday && d <= endOfWeek;
    }).length;
  }, [campaigns]);

  const stats = [
    {
      title: "Total Campaigns",
      value: totalCampaigns,
      label: "Total Campaigns",
      icon: CampaignIcon,
      iconBg: "bg-blue-50/80",
      iconColor: "text-Primary",
    },
    {
      title: "Due This Week",
      value: dueThisWeekCount,
      label: "Due This Week",
      badge: dueThisWeekCount > 0 ? "Urgent" : null,
      icon: Calendar,
      iconBg: "bg-orange-50/80",
      iconColor: "text-orange-600",
    },
    {
      title: "Under Review",
      value: underReviewCount,
      label: "Under Review",
      icon: Clock,
      iconBg: "bg-amber-50/80",
      iconColor: "text-amber-600",
    },
    {
      title: "Completed",
      value: completedCount,
      label: "Completed Campaigns",
      icon: CheckCircle,
      iconBg: "bg-emerald-50/80",
      iconColor: "text-emerald-600",
    },
    {
      title: "Drafts",
      value: draftCount,
      label: "Draft Campaigns",
      icon: FileText,
      iconBg: "bg-purple-50/80",
      iconColor: "text-purple-600",
    },
  ];

  // Filter logic
  const filteredCampaigns = campaigns.filter((c) => {
    if (activeFilter === "draft") return c.status === "Draft";
    if (activeFilter === "under-review") return c.status === "Under Review";
    if (activeFilter === "approved") return c.status === "Approved";
    if (activeFilter === "completed") return c.status === "Completed";
    return true; // 'all'
  });

  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    campaignId: null,
    campaignTitle: "",
  });

  const handleEdit = (campaign) => {
    setSelectedCampaign(campaign);
    setIsModalOpen(true);
  };

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
      },
    });
  };

  const tabs = [
    {
      key: "all",
      label: "All Campaigns",
      count: campaigns.length,
      color: "text-Primary",
    },
    {
      key: "under-review",
      label: "Under Review",
      count: underReviewCount,
      color: "text-amber-600",
    },
    {
      key: "approved",
      label: "Approved",
      count: approvedCount,
      color: "text-blue-600",
    },
    {
      key: "completed",
      label: "Completed",
      count: completedCount,
      color: "text-emerald-600",
    },
    { key: "draft", label: "Draft", count: draftCount, color: "text-gray-700" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-Primary"></div>
      </div>
    );
  }

  return (
    <div className="py-2">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-1.5 md:mb-2">
            Campaigns
          </h1>
          <p className="text-gray-500 text-xs md:text-sm font-medium">
            Track progress, deliverables, and brand feedback.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedCampaign(null);
            setIsModalOpen(true);
          }}
          className="bg-Primary text-white px-5 py-3 md:px-6 md:py-3.5 rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-Primary/20 hover:bg-Primary/90 transition-all text-xs md:text-sm w-full md:w-auto"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
          Create Campaign
        </button>
      </div>

      {/* Stats Summary Section (5 dynamic cards including Due This Week) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-[#F8FAFC] border border-gray-100 rounded-2xl w-full overflow-x-auto mb-6 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`whitespace-nowrap lg:px-5 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeFilter === tab.key
                ? `bg-white ${tab.color} shadow-sm`
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Campaigns Grid - Desktop Grid / Mobile Swiper */}
      {filteredCampaigns.length > 0 ? (
        <>
          {/* Desktop Grid */}
          <div className="hidden md:grid md:grid-cols-2 xlg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
            {filteredCampaigns.map((campaign) => (
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
                onEdit={() => handleEdit(campaign)}
                onDelete={() => handleDelete(campaign)}
              />
            ))}
          </div>
          {/* Mobile Swiper */}
          <div className="md:hidden pb-10">
            <Swiper
              spaceBetween={16}
              slidesPerView={1.15}
              centeredSlides={false}
              className="campaign-swiper"
            >
              {filteredCampaigns.map((campaign) => (
                <SwiperSlide key={campaign.id}>
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
                    onEdit={() => handleEdit(campaign)}
                    onDelete={() => handleDelete(campaign)}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </>
      ) : (
        <div className="text-center py-16 border-2 border-dashed border-gray-100 rounded-[32px] bg-white mb-10">
          <p className="text-gray-400 font-medium">
            No{" "}
            {activeFilter === "all"
              ? "campaigns"
              : activeFilter.replace("-", " ") + " campaigns"}{" "}
            found.
          </p>
        </div>
      )}

      <CreateCampaignModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        campaign={selectedCampaign}
      />

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

export default Campaign;
