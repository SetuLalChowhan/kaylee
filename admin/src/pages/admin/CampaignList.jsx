import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { Plus, Search, Edit3, Trash2, X, Loader2, Folder, ExternalLink } from "lucide-react";
import { toast } from "react-toastify";

const CampaignList = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  // Modal state
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  // Form fields
  const [campaignName, setCampaignName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("Pending");
  const [paymentStatus, setPaymentStatus] = useState("Unpaid");
  const [notes, setNotes] = useState("");
  const [targetUserId, setTargetUserId] = useState("");

  // Fetch campaigns
  const { data: campaignsData, isLoading: campaignsLoading } = useQuery({
    queryKey: ["adminCampaigns"],
    queryFn: async () => {
      const res = await axiosSecure.get("/ugc-campaigns");
      return res.data?.data || res.data || [];
    }
  });

  // Fetch users (to assign campaigns to creators)
  const { data: usersData } = useQuery({
    queryKey: ["adminUsersForCampaigns"],
    queryFn: async () => {
      const res = await axiosSecure.get("/user/admin/users");
      return res.data?.data || [];
    }
  });

  // Create Campaign Mutation
  const createMutation = useMutation({
    mutationFn: async (campaignData) => {
      const res = await axiosSecure.post("/ugc-campaigns", campaignData);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Campaign created successfully");
      queryClient.invalidateQueries({ queryKey: ["adminCampaigns"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboardStats"] });
      closeModal();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create campaign");
    }
  });

  // Update Campaign Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, campaignData }) => {
      const res = await axiosSecure.patch(`/ugc-campaigns/${id}`, campaignData);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Campaign updated successfully");
      queryClient.invalidateQueries({ queryKey: ["adminCampaigns"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboardStats"] });
      closeModal();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update campaign");
    }
  });

  // Delete Campaign Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosSecure.delete(`/ugc-campaigns/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Campaign deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["adminCampaigns"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboardStats"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete campaign");
    }
  });

  const openCreateModal = () => {
    setSelectedCampaign(null);
    setCampaignName("");
    setBrandName("");
    setDeadline("");
    setAmount("");
    setStatus("Pending");
    setPaymentStatus("Unpaid");
    setNotes("");
    setTargetUserId(usersData?.[0]?.id || "");
    setIsOpen(true);
  };

  const openEditModal = (campaign) => {
    setSelectedCampaign(campaign);
    setCampaignName(campaign.name || "");
    setBrandName(campaign.brandName || "");
    setDeadline(campaign.deadline || "");
    setAmount(campaign.amount || "");
    setStatus(campaign.status || "Pending");
    setPaymentStatus(campaign.paymentStatus || "Unpaid");
    setNotes(campaign.notes || "");
    setTargetUserId(campaign.userId || "");
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedCampaign(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedCampaign) {
      updateMutation.mutate({
        id: selectedCampaign.id,
        campaignData: { campaignName, brandName, deadline, amount, status, notes, paymentStatus }
      });
    } else {
      createMutation.mutate({
        campaignName,
        brandName,
        deadline,
        amount,
        status,
        notes,
        targetUserId
      });
    }
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete campaign "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const campaigns = Array.isArray(campaignsData) ? campaignsData : [];
  const users = usersData || [];

  const getUserName = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : "Unknown Creator";
  };

  const filteredCampaigns = campaigns.filter((c) => {
    const term = search.toLowerCase();
    const name = (c.name || "").toLowerCase();
    const brand = (c.brandName || "").toLowerCase();
    const creator = getUserName(c.userId).toLowerCase();
    return name.includes(term) || brand.includes(term) || creator.includes(term);
  });

  return (
    <div className="font-outfit p-1 text-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1A1A1A]">Campaigns</h1>
          <p className="text-slate-500 text-sm mt-1">Manage UGC requests, deliverables, and budgets.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-[#1F3C37] hover:bg-[#1F3C37]/90 text-white font-bold py-3 px-6 rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-[#1F3C37]/10"
        >
          <Plus className="w-5 h-5" />
          Add Campaign
        </button>
      </div>

      {/* Search & Statistics */}
      <div className="bg-white rounded-3xl p-6 mb-6 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="relative w-full md:max-w-md">
          <input
            type="text"
            placeholder="Search campaigns, brands, or creators..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 pl-11 focus:outline-none focus:ring-2 focus:ring-[#1F3C37]/20 focus:border-[#1F3C37] text-sm transition-all"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>
        <div className="text-slate-400 text-sm font-semibold">
          Total campaigns found: {filteredCampaigns.length}
        </div>
      </div>

      {/* Campaigns list */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {campaignsLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#1F3C37] animate-spin" />
          </div>
        ) : filteredCampaigns.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-400">Campaign</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-400">Brand</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-400">Creator</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-400">Budget</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-400">Deadline</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-400 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCampaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#1F3C37]/5 flex items-center justify-center text-[#1F3C37]">
                          <Folder className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 line-clamp-1">{c.name}</p>
                          <a
                            href={`http://localhost:5173/preview/${c.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-slate-400 font-bold hover:text-[#1F3C37] inline-flex items-center gap-1 mt-0.5"
                          >
                            Live Link <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-600">{c.brandName}</td>
                    <td className="py-4 px-6 font-semibold text-slate-600">{getUserName(c.userId)}</td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-800">{c.amount}</p>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        c.paymentStatus === "Paid" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"
                      }`}>
                        {c.paymentStatus || "Unpaid"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-medium text-sm">
                      {c.deadline}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        c.status === "Pending" ? "bg-yellow-50 text-yellow-600" :
                        c.status === "Draft" ? "bg-slate-100 text-slate-500" :
                        c.status === "Under Review" ? "bg-orange-50 text-orange-500" :
                        c.status === "Approved" ? "bg-green-50 text-green-500" :
                        c.status === "Completed" ? "bg-blue-50 text-blue-600" :
                        "bg-slate-100 text-slate-500"
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-2 text-slate-500 hover:text-[#1F3C37] hover:bg-slate-100 rounded-xl transition-all"
                          title="Edit Campaign"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.name)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          title="Delete Campaign"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-400 font-medium text-sm">No campaigns found matching description.</p>
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999] p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md p-8 border border-slate-100 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={closeModal}
              className="absolute right-6 top-6 p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-extrabold text-[#1A1A1A] mb-2">
              {selectedCampaign ? "Edit Campaign" : "Create Campaign"}
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              {selectedCampaign ? "Update details, budgets, or workflow step." : "Initiate a campaign for a selected creator."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!selectedCampaign && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Target Creator</label>
                  <select
                    required
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#1F3C37]/20 focus:border-[#1F3C37] text-sm transition-all"
                  >
                    <option value="">Select a creator...</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.firstName} {u.lastName} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Campaign Name</label>
                <input
                  type="text"
                  required
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="Winter Product Review"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#1F3C37]/20 focus:border-[#1F3C37] text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Brand Name</label>
                <input
                  type="text"
                  required
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Brand Inc."
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#1F3C37]/20 focus:border-[#1F3C37] text-sm transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Budget / Amount</label>
                  <input
                    type="text"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="$350"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#1F3C37]/20 focus:border-[#1F3C37] text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Deadline</label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#1F3C37]/20 focus:border-[#1F3C37] text-sm transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Campaign Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#1F3C37]/20 focus:border-[#1F3C37] text-sm transition-all"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Pending">Pending</option>
                    <option value="Active">Active</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#1F3C37]/20 focus:border-[#1F3C37] text-sm transition-all"
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional campaign parameters..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#1F3C37]/20 focus:border-[#1F3C37] text-sm transition-all resize-none"
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3.5 rounded-xl text-center transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 bg-[#1F3C37] hover:bg-[#1F3C37]/90 text-white font-bold py-3.5 rounded-xl text-center transition-all text-sm flex items-center justify-center gap-2"
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : selectedCampaign ? (
                    "Save Changes"
                  ) : (
                    "Create Campaign"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignList;
