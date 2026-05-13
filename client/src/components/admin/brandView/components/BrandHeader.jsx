import React from 'react';
import { Download, Check } from 'lucide-react';

const BrandHeader = ({ campaign, onApproveAll }) => {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1.5 flex-wrap">
            <h1 className="text-2xl font-bold text-[#1A1A1A]">{campaign.title}</h1>
            <span className="text-xs font-bold text-orange-500 bg-orange-50 px-3 py-1 rounded-full">{campaign.status}</span>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-400">Due {campaign.dueDate}</p>
            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{campaign.daysLeft} days left</span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button className="flex items-center gap-2 text-gray-400 text-sm font-medium hover:text-[#1A1A1A] transition-colors border border-gray-100 px-4 py-2.5 rounded-xl">
            <Download className="w-4 h-4" />
            Download All Media
          </button>
          <button
            onClick={onApproveAll}
            className="flex items-center gap-2 bg-Primary text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-Primary/90 transition-all shadow-lg shadow-Primary/20"
          >
            <Check className="w-4 h-4" />
            Approve All Media
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrandHeader;
