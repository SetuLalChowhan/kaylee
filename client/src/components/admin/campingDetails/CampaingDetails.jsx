import React, { useState } from 'react';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CampaignLink from './components/CampaignLink';
import BrandFeedback from './components/BrandFeedback';
import Deliverables from './components/Deliverables';
import Tasks from './components/Tasks';
import ContentGallery from './components/ContentGallery';
import Documents from './components/Documents';
import NotesComments from './components/NotesComments';
import InvoiceTracker from './components/InvoiceTracker';

const CampaingDetails = () => {
  const navigate = useNavigate();

  const campaign = {
    title: 'Summer Skincare Promo',
    status: 'Under Review',
    dueDate: 'Apr 20, 2026',
    daysLeft: 6,
    progress: 70,
    brand: 'GlowCare',
    link: 'http://localhost:5173/dashboard/campaigns/3/brand-view',
  };

  return (
    <div className="">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-[#1A1A1A] transition-colors mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A]">{campaign.title}</h1>
          <span className="text-xs font-bold text-orange-500 bg-orange-50 px-3 py-1 rounded-full">{campaign.status}</span>
        </div>
        {/* Progress Bar */}
        <div className="w-full md:w-48">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-Primary rounded-full transition-all duration-500" style={{ width: `${campaign.progress}%` }} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <p className="text-sm text-gray-400">Due {campaign.dueDate}</p>
        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{campaign.daysLeft} days left</span>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        <CampaignLink link={campaign.link} />
        <BrandFeedback />
        <Deliverables />
        <Tasks />
        <ContentGallery />
        <Documents />
        <NotesComments />
        <InvoiceTracker />
      </div>
    </div>
  );
};

export default CampaingDetails;