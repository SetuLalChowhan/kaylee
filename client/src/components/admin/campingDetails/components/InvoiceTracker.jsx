import React, { useState } from 'react';
import { Receipt } from 'lucide-react';

const InvoiceTracker = () => {
  const [amount, setAmount] = useState('$500.00');
  const [paymentStatus, setPaymentStatus] = useState('Pending');
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('500.00');

  const handleSaveAmount = () => {
    const formatted = `$${parseFloat(editValue).toFixed(2)}`;
    setAmount(formatted);
    setIsEditing(false);
    console.log('Invoice Amount Updated:', formatted);
  };

  const handleStatusChange = (status) => {
    setPaymentStatus(status);
    console.log('Payment Status Changed:', status);
  };

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
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveAmount()}
                className="text-2xl font-bold text-[#1A1A1A] bg-transparent border-b-2 border-Primary focus:outline-none w-32"
                autoFocus
              />
              <button onClick={handleSaveAmount} className="text-xs text-Primary font-bold hover:underline ml-2">Save</button>
              <button onClick={() => setIsEditing(false)} className="text-xs text-gray-400 font-medium hover:text-[#1A1A1A]">Cancel</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-[#1A1A1A]">{amount}</span>
              <button onClick={() => { setIsEditing(true); setEditValue(amount.replace('$', '')); }} className="text-xs text-Primary font-bold hover:underline">Edit</button>
            </div>
          )}
        </div>

        {/* Status */}
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-2">Payment Status</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleStatusChange('Pending')}
              className={`text-xs font-bold px-4 py-1.5 rounded-full border transition-all ${
                paymentStatus === 'Pending' ? 'bg-orange-50 text-orange-500 border-orange-200' : 'bg-white text-gray-400 border-gray-100 hover:border-orange-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => handleStatusChange('Paid')}
              className={`text-xs font-bold px-4 py-1.5 rounded-full border transition-all ${
                paymentStatus === 'Paid' ? 'bg-green-50 text-green-500 border-green-200' : 'bg-white text-gray-400 border-gray-100 hover:border-green-200'
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
