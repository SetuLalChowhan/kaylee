import React, { useState } from 'react';
import { Link2, Copy, Check, Lock, Unlock, RefreshCw } from 'lucide-react';
import { useUpdateUgcCampaign } from '@/api/apiHooks/useUgcCampaign';

const CampaignLink = ({ link, campaign }) => {
  const [copied, setCopied] = useState(false);
  const updateMutation = useUpdateUgcCampaign();


  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    if (campaign?.id && campaign?.status === 'Draft') {
      updateMutation.mutate({
        id: campaign.id,
        campaignData: { status: 'Under Review' },
      });
    }
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleLock = () => {
    if (!campaign?.id) return;
    updateMutation.mutate({
      id: campaign.id,
      campaignData: { shareEnabled: !campaign.shareEnabled }
    });
  };

  const handleRegenerate = () => {
    if (!campaign?.id) return;
    if (window.confirm("Are you sure you want to generate a new link? The old link will stop working immediately.")) {
      updateMutation.mutate({
        id: campaign.id,
        campaignData: { regenerateShareToken: true }
      });
    }
  };


  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-Primary/5 rounded-xl flex items-center justify-center">
          <Link2 className="w-5 h-5 text-Primary" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#1A1A1A]">Campaign Link</h3>
          <p className="text-xs text-gray-400">The brand can view updates in real time with this link</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100 truncate flex-1">{campaign?.shareEnabled ? link : 'Link is locked and disabled.'}</span>
        
        <button
          onClick={handleToggleLock}
          disabled={updateMutation.isPending}
          title={campaign?.shareEnabled ? "Lock Link" : "Unlock Link"}
          className={`p-2.5 rounded-xl transition-all ${campaign?.shareEnabled ? 'bg-gray-100 hover:bg-gray-200 text-gray-600' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
        >
          {campaign?.shareEnabled ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
        </button>

        <button
          onClick={handleRegenerate}
          disabled={updateMutation.isPending}
          title="Regenerate Link"
          className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all"
        >
          <RefreshCw className={`w-5 h-5 ${updateMutation.isPending ? 'animate-spin' : ''}`} />
        </button>

        <button
          onClick={handleCopy}
          disabled={!campaign?.shareEnabled}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${copied ? 'bg-green-500 text-white' : 'bg-Primary text-white hover:bg-Primary/90'
            }`}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
      </div>
    </div>
  );
};

export default CampaignLink;
