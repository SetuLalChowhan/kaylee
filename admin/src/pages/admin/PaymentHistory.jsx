import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import {
  Search,
  Loader2,
  DollarSign,
  TrendingUp,
  CreditCard,
  Ban,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText
} from "lucide-react";
import { toast } from "react-toastify";

const PaymentHistory = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  // Fetch Payments & Aggregates
  const { data, isLoading } = useQuery({
    queryKey: ["adminPayments"],
    queryFn: async () => {
      const res = await axiosSecure.get("/subscriptions/admin/payments");
      return res.data?.data || { payments: [], aggregates: [] };
    }
  });

  // Cancel Purchase Mutation
  const cancelMutation = useMutation({
    mutationFn: async (purchaseId) => {
      const res = await axiosSecure.post("/subscriptions/admin/cancel", { purchaseId });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Subscription/Purchase cancelled successfully");
      queryClient.invalidateQueries({ queryKey: ["adminPayments"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to cancel transaction");
    }
  });

  const handleCancel = (purchaseId, email) => {
    if (
      window.confirm(
        `Are you sure you want to cancel the subscription and transaction for ${email}? This will downgrade their account to Starter instantly.`
      )
    ) {
      cancelMutation.mutate(purchaseId);
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
      toast.error(err.response?.data?.message || "Failed to download invoice.");
    }
  };

  const payments = data?.payments || [];
  const aggregates = data?.aggregates || [];

  // Filter payments by user name, email, or plan title
  const filteredPayments = payments.filter((p) => {
    const term = search.toLowerCase();
    const fullName = `${p.user?.firstName || ""} ${p.user?.lastName || ""}`.toLowerCase();
    const emailStr = (p.user?.email || "").toLowerCase();
    const planTitle = (p.plan?.title || "").toLowerCase();
    return fullName.includes(term) || emailStr.includes(term) || planTitle.includes(term);
  });

  return (
    <div className="font-outfit p-1 text-slate-800 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1A1A1A]">Payment History</h1>
          <p className="text-slate-500 text-sm mt-1">
            Monitor all subscription transactions, total income per plan, and manage issues.
          </p>
        </div>
      </div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm h-32 animate-pulse flex flex-col justify-between"
            >
              <div className="h-4 bg-slate-100 rounded w-1/3"></div>
              <div className="h-8 bg-slate-100 rounded w-1/2"></div>
            </div>
          ))
        ) : aggregates.length > 0 ? (
          aggregates.map((agg) => (
            <div
              key={agg.planId}
              className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm relative overflow-hidden flex flex-col justify-between transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {agg.title} Plan Earnings
                  </h3>
                  <p className="text-sm font-semibold text-slate-400 mt-0.5">
                    Price: ${agg.price}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-Primary/5 flex items-center justify-center text-Primary">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-auto">
                <div>
                  <span className="text-2xl font-extrabold text-[#1A1A1A]">
                    ${agg.totalEarnings.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 ml-1.5 uppercase">
                    Total
                  </span>
                </div>
                <span className="text-xs font-bold text-Primary bg-Primary/5 px-2.5 py-1 rounded-full uppercase shrink-0">
                  {agg.totalSales} Sales
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm col-span-3 text-center text-slate-400 py-10">
            No subscription plans found.
          </div>
        )}
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-3xl p-6 mb-6 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="relative w-full md:max-w-md">
          <input
            type="text"
            placeholder="Search by user, email, plan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 pl-11 focus:outline-none focus:ring-2 focus:ring-Primary/20 focus:border-Primary text-sm transition-all"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>
        <div className="text-slate-400 text-sm font-semibold">
          Showing {filteredPayments.length} transactions
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-Primary animate-spin" />
          </div>
        ) : filteredPayments.length > 0 ? (
          <div className="overflow-x-auto w-full custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="py-3 px-4 md:py-4 md:px-6 text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400">
                    User
                  </th>
                  <th className="py-3 px-4 md:py-4 md:px-6 text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400">
                    Email
                  </th>
                  <th className="py-3 px-4 md:py-4 md:px-6 text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400">
                    Plan
                  </th>
                  <th className="py-3 px-4 md:py-4 md:px-6 text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400">
                    Amount Paid
                  </th>
                  <th className="py-3 px-4 md:py-4 md:px-6 text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400">
                    Stripe Session
                  </th>
                  <th className="py-3 px-4 md:py-4 md:px-6 text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400">
                    Date
                  </th>
                  <th className="py-3 px-4 md:py-4 md:px-6 text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400">
                    Status
                  </th>
                  <th className="py-3 px-4 md:py-4 md:px-6 text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400 text-center">
                    Invoice
                  </th>
                  <th className="py-3 px-4 md:py-4 md:px-6 text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400 text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="py-2.5 px-3 md:py-4 md:px-6 text-xs md:text-sm">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs uppercase shrink-0">
                          {(payment.user?.firstName || "?")[0]}
                        </div>
                        <span className="font-bold text-slate-800 text-xs md:text-sm">
                          {payment.user?.firstName} {payment.user?.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 md:py-4 md:px-6 text-xs md:text-sm font-semibold text-slate-650">
                      {payment.user?.email || "N/A"}
                    </td>
                    <td className="py-2.5 px-3 md:py-4 md:px-6 text-xs md:text-sm">
                      <span className="font-bold text-slate-700">
                        {payment.plan?.title || "Starter"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 md:py-4 md:px-6 text-xs md:text-sm font-extrabold text-slate-800">
                      ${payment.amount}
                    </td>
                    <td className="py-2.5 px-3 md:py-4 md:px-6 text-[11px] md:text-xs font-mono text-slate-400" title={payment.stripeSessionId}>
                      {payment.stripeSessionId ? `${payment.stripeSessionId.slice(0, 15)}...` : "N/A"}
                    </td>
                    <td className="py-2.5 px-3 md:py-4 md:px-6 text-xs md:text-sm text-slate-500 font-medium">
                      {new Date(payment.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                      })}
                    </td>
                    <td className="py-2.5 px-3 md:py-4 md:px-6 text-xs md:text-sm">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wider ${
                          payment.status === "completed"
                            ? "bg-green-50 text-green-600 border border-green-100"
                            : "bg-red-50 text-red-600 border border-red-100"
                        }`}
                      >
                        {payment.status === "completed" ? (
                          <CheckCircle2 className="w-2.5 h-2.5" />
                        ) : (
                          <XCircle className="w-2.5 h-2.5" />
                        )}
                        {payment.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 md:py-4 md:px-6 text-xs md:text-sm text-center">
                      {payment.status === "completed" && payment.stripeSessionId ? (
                        <button
                          onClick={() => handleDownloadInvoice(payment.id)}
                          className="inline-flex items-center gap-1 bg-Primary/5 hover:bg-Primary/10 border border-Primary/10 text-Primary px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer hover:underline"
                        >
                          <FileText className="w-3.5 h-3.5 mr-1" /> PDF
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400">N/A</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 md:py-4 md:px-6 text-xs md:text-sm text-center">
                      {payment.status === "completed" ? (
                        <button
                          onClick={() => handleCancel(payment.id, payment.user?.email)}
                          disabled={cancelMutation.isPending}
                          className="px-3 py-1.5 md:px-4 md:py-2 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 rounded-xl text-[11px] md:text-xs font-bold flex items-center gap-1 md:gap-1.5 transition-all shadow-sm shadow-red-100/50 cursor-pointer mx-auto disabled:opacity-50"
                          title="Cancel Subscription"
                        >
                          <Ban className="w-3 h-3 md:w-3.5 md:h-3.5" />
                          Cancel
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400">No Action</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20 bg-white">
            <AlertTriangle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-400 font-medium">No payment records found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;
