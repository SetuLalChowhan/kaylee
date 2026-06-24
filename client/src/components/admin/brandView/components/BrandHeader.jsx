import React, { useState } from 'react';
import { Download, Check, Lock, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { downloadCampaignZip } from '@/utils/download';

const BrandHeader = ({ campaign, onApproveAll, isApprovePending }) => {
  const [isZipping, setIsZipping] = useState(false);

  const handleDownloadAll = async () => {
    if (!campaign.releaseFiles) {
      toast.error("Downloads are locked. The creator has not released these files yet.");
      return;
    }
    try {
      setIsZipping(true);
      toast.info("Packaging files into ZIP...");
      await downloadCampaignZip(campaign);
      toast.success("Download started successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to download ZIP.");
    } finally {
      setIsZipping(false);
    }
  };

  const getDaysLeft = () => {
    if (!campaign.deadline) return 0;
    const due = new Date(campaign.deadline);
    const now = new Date();
    // Reset hours for exact date diff
    due.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    const diff = due.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const daysLeft = getDaysLeft();

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1.5 flex-wrap">
            <h1 className="text-2xl font-bold text-[#1A1A1A]">{campaign.name}</h1>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
              campaign.status === 'Pending' ? 'bg-yellow-50 text-yellow-600' :
              campaign.status === 'Draft' ? 'bg-gray-100 text-gray-500' :
              campaign.status === 'Under Review' ? 'bg-orange-50 text-orange-500' :
              campaign.status === 'Approved' ? 'bg-green-50 text-green-500' :
              'bg-blue-50 text-Primary'
            }`}>{campaign.status}</span>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-400">Due {campaign.deadline}</p>
            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{daysLeft} days left</span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleDownloadAll}
            disabled={isZipping}
            className={`flex items-center gap-2 text-sm font-medium border px-4 py-2.5 rounded-xl transition-colors cursor-pointer ${
              campaign.releaseFiles
                ? 'text-gray-600 hover:text-[#1A1A1A] hover:bg-gray-50 border-gray-100 bg-white'
                : 'text-gray-300 border-gray-100 bg-gray-50 cursor-not-allowed'
            }`}
          >
            {isZipping ? (
              <Loader2 className="w-4 h-4 animate-spin text-Primary" />
            ) : campaign.releaseFiles ? (
              <Download className="w-4 h-4" />
            ) : (
              <Lock className="w-4 h-4 text-orange-400" />
            )}
            {isZipping ? 'Packaging...' : campaign.releaseFiles ? 'Download All Media' : 'Downloads Locked'}
          </button>
          <button
            onClick={onApproveAll}
            disabled={isApprovePending}
            className="flex items-center gap-2 bg-Primary text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-Primary/90 transition-all shadow-lg shadow-Primary/20 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isApprovePending ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {isApprovePending ? 'Approving...' : 'Approve All Media'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrandHeader;
