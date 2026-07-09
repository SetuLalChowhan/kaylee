import React, { useState, useEffect } from 'react';
import { Crown, Check, AlertCircle, Loader2, Receipt } from 'lucide-react';
import PlanModal from './PlanModal';
import useAxiosSecure from '@/hooks/useAxiosSecure';

const SubscriptionSettings = () => {
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const axiosSecure = useAxiosSecure();

  const fetchPlanDetails = async () => {
    try {
      const res = await axiosSecure.get('/subscriptions/my-plan');
      if (res.data?.status === 'success') {
        const payload = res.data.data;
        if (payload.plan && typeof payload.plan.features === 'string') {
          payload.plan.features = JSON.parse(payload.plan.features);
        }
        setData(payload);
      }
    } catch (err) {
      console.error("Failed to load subscription status:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      setPaymentsLoading(true);
      const res = await axiosSecure.get('/subscriptions/my-payments');
      if (res.data?.status === 'success') {
        setPayments(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load payment history:", err);
    } finally {
      setPaymentsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanDetails();
    fetchPayments();
  }, []);

  const handleCancelSubscription = async () => {
    if (window.confirm("Are you sure you want to cancel your subscription? You will lose access to premium features immediately.")) {
      try {
        setLoading(true);
        const res = await axiosSecure.post('/subscriptions/cancel');
        if (res.data?.status === 'success') {
          alert("Your subscription has been cancelled successfully.");
          await fetchPlanDetails();
          await fetchPayments();
        }
      } catch (err) {
        console.error("Failed to cancel subscription:", err);
        alert(err.response?.data?.message || "Failed to cancel subscription.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDownloadInvoice = async (purchaseId) => {
    try {
      const res = await axiosSecure.get(`/subscriptions/purchase/${purchaseId}/invoice`);
      if (res.data?.url) {
        window.open(res.data.url, '_blank');
      }
    } catch (err) {
      console.error("Failed to download invoice:", err);
      alert(err.response?.data?.message || "Failed to download invoice. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-Primary animate-spin" />
      </div>
    );
  }

  const plan = data?.plan || {
    title: "STATER",
    description: "Try STAKD risk-free for a short sprint.",
    price: 0,
    priceSuffix: "",
    features: [
      "Up to 2 active campaigns",
      "Limited brand review links",
      "Watermarked content previews",
      "Basic campaign planner"
    ],
    campaignLimit: 2
  };

  const campaignCount = data?.campaignCount ?? 0;
  const campaignLimit = data?.campaignLimit ?? 2;
  const usagePercentage = Math.min(100, Math.round((campaignCount / campaignLimit) * 100));

  return (
    <div className="space-y-6 md:space-y-8 font-outfit animate-fade-in">
      {/* Current Plan Summary */}
      <div className="bg-white border border-gray-100 rounded-2xl md:rounded-[32px] p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 shadow-sm">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-Primary/5 rounded-xl md:rounded-2xl flex items-center justify-center text-Primary shrink-0">
            <Crown className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5 md:mb-1">
              <h3 className="text-lg md:text-xl font-bold text-[#1A1A1A]">{plan.title}</h3>
              <span className="text-[9px] md:text-[10px] font-bold text-Primary bg-Primary/5 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full uppercase">Current plan</span>
            </div>
            <p className="text-xs md:text-sm font-bold text-[#1A1A1A] mb-0.5">Campaign Usage</p>
            <p className="text-xs md:text-sm text-gray-400 font-medium tracking-tight">
              {campaignCount} of {campaignLimit === 999999 ? "unlimited" : campaignLimit} campaigns active ({usagePercentage}% used)
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        {campaignLimit !== 999999 && (
          <div className="w-full md:w-64">
            <div className="flex justify-between text-xs font-bold text-[#1A1A1A] mb-1.5 md:mb-2">
              <span>Usage limit</span>
              <span>{usagePercentage}%</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 md:h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${usagePercentage > 85 ? 'bg-red-500' : 'bg-Primary'}`}
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Pricing Card (Summary View) */}
      <div className="max-w-sm">
        <div className="bg-white border border-gray-100 rounded-2xl md:rounded-[32px] p-4 md:p-6 shadow-sm">
          <h4 className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-tight mb-3 md:mb-4">{plan.title}</h4>
          <div className="flex items-baseline gap-1 mb-3 md:mb-4">
            <span className="text-3xl md:text-4xl font-bold text-[#1A1A1A]">${plan.price}</span>
            {plan.priceSuffix && (
              <span className="text-xs md:text-sm text-gray-400 font-medium">{plan.priceSuffix}</span>
            )}
          </div>
          <p className="text-xs text-gray-400 font-medium mb-6 md:mb-8 leading-relaxed">{plan.description}</p>
          
          <div className="space-y-3 mb-6 md:mb-8 pt-6 border-t border-gray-50">
            {plan.features.map((f, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="p-0.5 md:p-1 bg-[#1A1A1A] text-white rounded-full">
                  <Check className="w-2.5 h-2.5 md:w-3 md:h-3" />
                </div>
                <span className="text-[11px] md:text-xs font-bold text-[#1A1A1A]">{f}</span>
              </div>
            ))}
          </div>

          <button 
            onClick={() => setIsPlanModalOpen(true)}
            className="w-full bg-Primary text-white py-3 md:py-4 rounded-xl md:rounded-2xl font-bold hover:bg-Primary/90 transition-all shadow-lg shadow-Primary/10 cursor-pointer text-xs md:text-sm"
          >
            Upgrade Plan
          </button>
        </div>
      </div>

      {/* Cancel Section */}
      {plan.price > 0 && (
        <div className="pt-8 space-y-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="w-5 h-5" />
            <h3 className="text-base font-bold">Manage Subscription</h3>
          </div>
          <p className="text-sm text-gray-400 font-medium leading-relaxed max-w-xl">
            You are currently on a paid subscription. You can upgrade, downgrade, or cancel your subscription here.
          </p>
          <button 
            onClick={handleCancelSubscription}
            className="bg-red-50 text-red-500 px-8 py-3 rounded-2xl text-xs font-bold hover:bg-red-100 transition-all cursor-pointer"
          >
            Cancel Subscription
          </button>
        </div>
      )}

      {/* Payment History Section */}
      <div className="pt-8 border-t border-gray-100 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-600">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1A1A1A]">Payment History</h3>
            <p className="text-xs text-gray-400 font-medium">View your past transactions and billing history</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl md:rounded-[24px] overflow-hidden shadow-sm">
          {paymentsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-Primary animate-spin" />
            </div>
          ) : payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-50 bg-slate-50/50">
                    <th className="py-2.5 px-3 md:py-3.5 md:px-5 text-[10px] md:text-xs font-bold uppercase tracking-wider text-gray-400">Date</th>
                    <th className="py-2.5 px-3 md:py-3.5 md:px-5 text-[10px] md:text-xs font-bold uppercase tracking-wider text-gray-400">Plan</th>
                    <th className="py-2.5 px-3 md:py-3.5 md:px-5 text-[10px] md:text-xs font-bold uppercase tracking-wider text-gray-400">Amount</th>
                    <th className="py-2.5 px-3 md:py-3.5 md:px-5 text-[10px] md:text-xs font-bold uppercase tracking-wider text-gray-400">Transaction ID</th>
                    <th className="py-2.5 px-3 md:py-3.5 md:px-5 text-[10px] md:text-xs font-bold uppercase tracking-wider text-gray-400 text-center">Status</th>
                    <th className="py-2.5 px-3 md:py-3.5 md:px-5 text-[10px] md:text-xs font-bold uppercase tracking-wider text-gray-400 text-center">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="py-2.5 px-3 md:py-3.5 md:px-5 text-[11px] md:text-xs font-semibold text-gray-600">
                        {new Date(payment.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="py-2.5 px-3 md:py-3.5 md:px-5">
                        <div className="font-bold text-gray-800 text-[11px] md:text-xs">
                          {payment.plan?.title || 'Starter'}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 md:py-3.5 md:px-5 font-bold text-gray-800 text-[11px] md:text-xs">
                        ${payment.amount}
                      </td>
                      <td className="py-2.5 px-3 md:py-3.5 md:px-5 text-[10px] md:text-[11px] font-mono text-gray-400">
                        {payment.stripeSessionId ? `${payment.stripeSessionId.slice(0, 15)}...` : 'N/A'}
                      </td>
                      <td className="py-2.5 px-3 md:py-3.5 md:px-5 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wider ${
                          payment.status === 'completed' 
                            ? 'bg-green-50 text-green-600 border border-green-100' 
                            : 'bg-red-50 text-red-600 border border-red-100'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 md:py-3.5 md:px-5 text-center">
                        {payment.status === 'completed' && payment.stripeSessionId ? (
                          <button
                            onClick={() => handleDownloadInvoice(payment.id)}
                            className="inline-flex items-center gap-1.5 text-[10px] md:text-xs font-bold text-Primary hover:underline cursor-pointer"
                          >
                            <Receipt className="w-3.5 h-3.5" /> Download
                          </button>
                        ) : (
                          <span className="text-[10px] md:text-xs text-gray-400 font-medium">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 text-sm font-medium">No payment records found.</p>
            </div>
          )}
        </div>
      </div>

      <PlanModal 
        isOpen={isPlanModalOpen} 
        onClose={() => {
          setIsPlanModalOpen(false);
          fetchPlanDetails();
        }} 
      />
    </div>
  );
};

export default SubscriptionSettings;
