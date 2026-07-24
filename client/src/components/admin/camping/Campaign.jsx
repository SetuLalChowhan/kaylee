import React, { useState } from 'react';
import { Plus, Folder, Clock, CheckCircle, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import CampaignCard from './components/CampaignCard';
import CreateCampaignModal from './components/CreateCampaignModal';
import { useUgcCampaigns, useDeleteUgcCampaign } from '@/api/apiHooks/useUgcCampaign';

const StatsCard = ({ title, value, label, icon: Icon, iconBg, iconColor, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    className="p-4 rounded-2xl flex flex-col justify-between h-36 border border-gray-100 bg-white text-[#1A1A1A] hover:border-Primary/30 shadow-sm transition-all duration-300"
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg || 'bg-indigo-50'}`}>
      <Icon className={`w-5 h-5 ${iconColor || 'text-indigo-600'}`} />
    </div>
    <div>
      <h2 className="text-2xl font-bold mb-0.5">{value}</h2>
      <p className="text-xs font-medium text-gray-500">
        {label}
      </p>
    </div>
  </motion.div>
);

const Campaign = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  const { data: campaigns = [], isLoading } = useUgcCampaigns('all');
  const deleteMutation = useDeleteUgcCampaign();

  // Counts by status
  const draftCount = campaigns.filter(c => c.status === 'Draft').length;
  const underReviewCount = campaigns.filter(c => c.status === 'Under Review').length;
  const approvedCount = campaigns.filter(c => c.status === 'Approved').length;
  const completedCount = campaigns.filter(c => c.status === 'Completed').length;

  // Stats calculations
  const totalCampaigns = campaigns.length;
  const activeCount = underReviewCount;

  const stats = [
    {
      title: 'Total Campaigns',
      value: totalCampaigns,
      label: `${totalCampaigns} Total ${totalCampaigns === 1 ? 'campaign' : 'campaigns'}`,
      icon: Folder,
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600'
    },
    {
      title: 'Under Review',
      value: activeCount,
      label: `${activeCount} Active ${activeCount === 1 ? 'campaign' : 'campaigns'}`,
      icon: Clock,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600'
    },
    {
      title: 'Completed',
      value: completedCount,
      label: `${completedCount} Completed ${completedCount === 1 ? 'campaign' : 'campaigns'}`,
      icon: CheckCircle,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600'
    },
    {
      title: 'Drafts',
      value: draftCount,
      label: `${draftCount} Draft ${draftCount === 1 ? 'campaign' : 'campaigns'}`,
      icon: FileText,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600'
    }
  ];

  // Filter logic
  const filteredCampaigns = campaigns.filter(c => {
    if (activeFilter === 'draft') return c.status === 'Draft';
    if (activeFilter === 'under-review') return c.status === 'Under Review';
    if (activeFilter === 'approved') return c.status === 'Approved';
    if (activeFilter === 'completed') return c.status === 'Completed';
    return true; // 'all'
  });

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

  const handleEdit = (campaign) => {
    setSelectedCampaign(campaign);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this campaign?")) {
      deleteMutation.mutate(id);
    }
  };

  const tabs = [
    { key: 'all', label: 'All Campaigns', count: campaigns.length, color: 'text-Primary' },
    { key: 'draft', label: 'Draft', count: draftCount, color: 'text-gray-700' },
    { key: 'under-review', label: 'Under Review', count: underReviewCount, color: 'text-amber-600' },
    { key: 'approved', label: 'Approved', count: approvedCount, color: 'text-blue-600' },
    { key: 'completed', label: 'Completed', count: completedCount, color: 'text-emerald-600' },
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
          <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-1.5 md:mb-2">Campaigns</h1>
          <p className="text-gray-500 text-xs md:text-sm font-medium">Track progress, deliverables, and brand feedback.</p>
        </div>
        <button
          onClick={() => { setSelectedCampaign(null); setIsModalOpen(true); }}
          className="bg-Primary text-white px-5 py-3 md:px-6 md:py-3.5 rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-Primary/20 hover:bg-Primary/90 transition-all text-xs md:text-sm w-full md:w-auto"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
          Create Campaigns
        </button>
      </div>

      {/* Stats Summary Section */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <StatsCard key={stat.title} {...stat} index={index} />
        ))}
      </div>

      {/* Filter Tabs - matching standard tabs style */}
      <div className="flex items-center gap-1.5 p-1.5 bg-[#F8FAFC] border border-gray-100 rounded-2xl w-full overflow-x-auto mb-6 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`whitespace-nowrap lg:px-5 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeFilter === tab.key
              ? `bg-white ${tab.color} shadow-sm`
              : 'text-gray-500 hover:text-gray-900'
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
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                id={campaign.id}
                title={campaign.name}
                brand={campaign.brandName}
                amount={campaign.amount}
                dueDate={campaign.deadline}
                status={campaign.status}
                progress={getProgress(campaign.status)}
                onEdit={() => handleEdit(campaign)}
                onDelete={() => handleDelete(campaign.id)}
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
                    progress={getProgress(campaign.status)}
                    onEdit={() => handleEdit(campaign)}
                    onDelete={() => handleDelete(campaign.id)}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </>
      ) : (
        <div className="text-center py-16 border-2 border-dashed border-gray-100 rounded-[32px] bg-white mb-10">
          <p className="text-gray-400 font-medium">
            No {activeFilter === 'all' ? 'campaigns' : activeFilter.replace('-', ' ') + ' campaigns'} found.
          </p>
        </div>
      )}

      <CreateCampaignModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        campaign={selectedCampaign}
      />
    </div>
  );
};

export default Campaign;