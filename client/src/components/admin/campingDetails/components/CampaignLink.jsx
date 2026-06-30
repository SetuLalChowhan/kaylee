import React, { useState } from 'react';
import { Link2, Copy, Check } from 'lucide-react';

const CampaignLink = ({ link }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    console.log('Campaign Link Copied:', link);
    setTimeout(() => setCopied(false), 2000);
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
        <span className="text-sm text-gray-500 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100 truncate flex-1">{link}</span>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${copied ? 'bg-green-500 text-white' : 'bg-Primary text-white hover:bg-Primary/90'
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
