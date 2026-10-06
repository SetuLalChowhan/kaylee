import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import CampaignLink from './components/CampaignLink';
import BrandFeedback from './components/BrandFeedback';
import Deliverables from './components/Deliverables';
import Tasks from './components/Tasks';
import ContentGallery from './components/ContentGallery';
import Documents from './components/Documents';
import NotesComments from './components/NotesComments';
import InvoiceTracker from './components/InvoiceTracker';
import CampaignHistory from './components/CampaignHistory';
import { useUgcCampaign, useUpdateUgcCampaign } from '@/api/apiHooks/useUgcCampaign';

const CampaingDetails = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: campaign, isLoading } = useUgcCampaign(id);
  const updateMutation = useUpdateUgcCampaign();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-Primary"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-20 bg-white border border-gray-100 rounded-[32px]">
        <p className="text-gray-400 font-medium">Campaign not found</p>
      </div>
    );
  }

  const allMediaApproved = campaign.media && campaign.media.length > 0 && campaign.media.every(m => m.status === 'approved');

  const handleReleaseFiles = () => {
    updateMutation.mutate({
      id: campaign.id,
      campaignData: { releaseFiles: true, status: 'Completed' }
    });
  };

  const shareLink = `${window.location.origin}/brand-view/${campaign.shareToken || campaign.slug}`;

  return (
    <div className="py-2">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-[#1A1A1A] transition-colors mb-6 group cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* Verification Banner */}
      {allMediaApproved && (
        <div className="mb-6 p-5 bg-green-50 border border-green-200 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <h4 className="text-sm font-bold text-green-800 flex items-center gap-2">
              🎉 All Content Verified & Approved!
            </h4>
            <p className="text-xs text-green-600/80 mt-1">
              The brand client has verified all content uploads. You can now safely release the files for their download.
            </p>
          </div>
          {!campaign.releaseFiles ? (
            <button
              onClick={handleReleaseFiles}
              disabled={updateMutation.isPending}
              className="bg-green-600 text-white text-xs font-bold px-5 py-2.5 rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-200 cursor-pointer shrink-0 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {updateMutation.isPending && (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
              )}
              {updateMutation.isPending ? 'Releasing...' : 'Release Files Now'}
            </button>
          ) : (
            <span className="text-xs font-bold text-green-600 bg-white border border-green-200 px-4 py-2 rounded-2xl shrink-0">
              Files Released ✓
            </span>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A]">{campaign.name}</h1>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
            campaign.status === 'Pending' ? 'bg-yellow-50 text-yellow-600' :
            campaign.status === 'Draft' ? 'bg-gray-100 text-gray-500' :
            campaign.status === 'Under Review' ? 'bg-orange-50 text-orange-500' :
            campaign.status === 'Approved' ? 'bg-green-50 text-green-500' :
            'bg-blue-50 text-Primary'
          }`}>{campaign.status}</span>
          {campaign.rating && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-50 border border-yellow-100">
              <span className="text-yellow-500 flex"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg></span>
              <span className="text-xs font-bold text-yellow-700">{campaign.rating}.0 Client Rating</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <p className="text-gray-500 text-xs md:text-sm">Due {campaign.deadline}</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 mb-8 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setActiveTab('Overview')}
          className={`px-6 py-2.5 rounded-[100px] text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'Overview' 
              ? 'bg-[#0084FF] text-white shadow-md' 
              : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('Brand View History')}
          className={`px-6 py-2.5 rounded-[100px] text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'Brand View History' 
              ? 'bg-[#0084FF] text-white shadow-md' 
              : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700'
          }`}
        >
          Brand View History
        </button>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {activeTab === 'Overview' && (
          <>
            <CampaignLink link={shareLink} campaign={campaign} />
            <BrandFeedback campaign={campaign} />
            <Deliverables campaign={campaign} />
            <Tasks campaign={campaign} />
            <ContentGallery campaign={campaign} />
            <Documents campaign={campaign} />
            <NotesComments campaign={campaign} />
            <InvoiceTracker campaign={campaign} />
          </>
        )}

        {activeTab === 'Brand View History' && (
          <CampaignHistory campaign={campaign} />
        )}
      </div>
    </div>
  );
};

export default CampaingDetails;