import React from "react";
import { useNavigate } from "react-router-dom";
import { XCircle } from "lucide-react";

const SubscriptionCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50/50 p-6 font-outfit">
      <div className="w-full max-w-md bg-white border border-slate-100 p-10 rounded-[32px] shadow-xl shadow-slate-100 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
          <XCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Checkout Canceled</h2>
        <p className="text-sm text-slate-450 font-bold mb-6 uppercase tracking-wider text-[10px]">
          No payment was processed
        </p>
        <p className="text-sm text-slate-500 font-medium max-w-xs leading-relaxed mb-8">
          Your payment transaction was canceled. You can try again or check out another pricing plan.
        </p>
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={() => navigate("/dashboard/settings?tab=Subscription")}
            className="w-full bg-Primary text-white font-bold py-3.5 rounded-2xl hover:bg-Primary/90 transition-all shadow-lg shadow-Primary/10 cursor-pointer text-sm"
          >
            Retry from Settings
          </button>
          <button
            onClick={() => navigate("/pricing")}
            className="w-full bg-slate-50 text-slate-600 font-bold py-3.5 rounded-2xl hover:bg-slate-100 transition-all border border-slate-100 cursor-pointer text-sm"
          >
            View Pricing Plans
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCancel;
