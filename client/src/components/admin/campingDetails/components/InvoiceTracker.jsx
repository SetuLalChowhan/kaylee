import React, { useState } from 'react';
import { Receipt } from 'lucide-react';
import { useUpdateUgcCampaign } from '@/api/apiHooks/useUgcCampaign';

const InvoiceTracker = ({ campaign }) => {
  const updateMutation = useUpdateUgcCampaign();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(campaign.amount || '0.00');

  const handleSaveAmount = () => {
    const numeric = parseFloat(editValue);
    if (isNaN(numeric)) return;
    updateMutation.mutate({
      id: campaign.id,
      campaignData: { amount: numeric.toFixed(2) }
    }, {
      onSuccess: () => {
        setIsEditing(false);
      }
    });
  };

  const handleStatusChange = (status) => {
    updateMutation.mutate({
      id: campaign.id,
      campaignData: { paymentStatus: status }
    });
  };

  const formattedAmount = `$${parseFloat(campaign.amount || 0).toFixed(2)}`;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-Primary/5 rounded-xl flex items-center justify-center">
          <Receipt className="w-5 h-5 text-Primary" />
        </div>
        <h3 className="text-sm font-bold text-[#1A1A1A]">Invoice Tracker</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Amount */}
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-2">Invoice Amount</p>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-[#1A1A1A]">$</span>
              <input
                type="number"
                step="0.01"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveAmount()}
                className="text-2xl font-bold text-[#1A1A1A] bg-transparent border-b-2 border-Primary focus:outline-none w-32"
                autoFocus
              />
              <button onClick={handleSaveAmount} className="text-xs text-Primary font-bold hover:underline ml-2 cursor-pointer">Save</button>
              <button onClick={() => setIsEditing(false)} className="text-xs text-gray-400 font-medium hover:text-[#1A1A1A] cursor-pointer">Cancel</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-[#1A1A1A]">{formattedAmount}</span>
              <button onClick={() => { setIsEditing(true); setEditValue(campaign.amount || '0.00'); }} className="text-xs text-Primary font-bold hover:underline cursor-pointer">Edit</button>
            </div>
          )}
        </div>

        {/* Status */}
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-2">Payment Status</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleStatusChange('Pending')}
              className={`text-xs font-bold px-4 py-1.5 rounded-full border transition-all cursor-pointer ${
                campaign.paymentStatus === 'Pending' ? 'bg-orange-50 text-orange-500 border-orange-200' : 'bg-white text-gray-400 border-gray-100 hover:border-orange-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => handleStatusChange('Paid')}
              className={`text-xs font-bold px-4 py-1.5 rounded-full border transition-all cursor-pointer ${
                campaign.paymentStatus === 'Paid' ? 'bg-green-50 text-green-500 border-green-200' : 'bg-white text-gray-400 border-gray-100 hover:border-green-200'
              }`}
            >
              Paid
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTracker;
