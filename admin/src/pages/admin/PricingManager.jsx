import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Shield, DollarSign, ListCheck, X, Loader2 } from "lucide-react";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { toast } from "react-toastify";

const PricingManager = () => {
  const axiosSecure = useAxiosSecure();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [priceSuffix, setPriceSuffix] = useState("");
  const [features, setFeatures] = useState("");
  const [buttonText, setButtonText] = useState("Select Plan");
  const [isRecommended, setIsRecommended] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [stripePriceId, setStripePriceId] = useState("");
  const [campaignLimit, setCampaignLimit] = useState(2);
  const [saving, setSaving] = useState(false);

  const fetchPlans = async () => {
    try {
      const res = await axiosSecure.get("/plans");
      if (res.data?.status === "success") {
        setPlans(res.data.data);
      }
    } catch (err) {
      toast.error("Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openCreateModal = () => {
    setEditingPlan(null);
    setTitle("");
    setDescription("");
    setPrice(0);
    setPriceSuffix("");
    setFeatures("");
    setButtonText("Select Plan");
    setIsRecommended(false);
    setIsDark(false);
    setStripePriceId("");
    setCampaignLimit(2);
    setIsModalOpen(true);
  };

  const openEditModal = (plan) => {
    setEditingPlan(plan);
    setTitle(plan.title);
    setDescription(plan.description);
    setPrice(plan.price);
    setPriceSuffix(plan.priceSuffix);
    setFeatures(
      Array.isArray(plan.features)
        ? plan.features.join("\n")
        : typeof plan.features === "string"
        ? JSON.parse(plan.features).join("\n")
        : ""
    );
    setButtonText(plan.buttonText || "Select Plan");
    setIsRecommended(plan.isRecommended);
    setIsDark(plan.isDark);
    setStripePriceId(plan.stripePriceId || "");
    setCampaignLimit(plan.campaignLimit);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const featureList = features
      .split("\n")
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const payload = {
      title,
      description,
      price: Number(price),
      priceSuffix,
      features: featureList,
      buttonText,
      isRecommended,
      isDark,
      stripePriceId: stripePriceId || null,
      campaignLimit: Number(campaignLimit),
    };

    try {
      if (editingPlan) {
        await axiosSecure.patch(`/plans/${editingPlan.id}`, payload);
        toast.success("Plan updated successfully");
      } else {
        await axiosSecure.post("/plans", payload);
        toast.success("Plan created successfully");
      }
      setIsModalOpen(false);
      fetchPlans();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save plan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this pricing plan?")) return;

    try {
      await axiosSecure.delete(`/plans/${id}`);
      toast.success("Plan deleted successfully");
      fetchPlans();
    } catch (err) {
      toast.error("Failed to delete plan");
    }
  };

  return (
    <div className="font-outfit p-1 text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1A1A1A]">Pricing Plans</h1>
          <p className="text-slate-500 text-sm mt-1">Manage subscription plans, limits, and Stripe keys.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-Primary hover:bg-Primary/90 text-white font-bold py-3 px-6 rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-Primary/20 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Create Plan
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-12 h-12 text-Primary animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-400">Plan Title</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-400">Price</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-400">Limit</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-400">Stripe Price ID</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-400 text-center">Status</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-400 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {plans.map((p) => {
                  const planFeatures = Array.isArray(p.features)
                    ? p.features
                    : typeof p.features === "string"
                    ? JSON.parse(p.features)
                    : [];

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-bold text-slate-800">{p.title}</p>
                          <p className="text-slate-400 text-xs mt-0.5 line-clamp-1">{p.description}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-700">
                        ${p.price} <span className="text-[10px] text-slate-400 font-medium">{p.priceSuffix}</span>
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-650">
                        {p.campaignLimit === 999999 ? "Unlimited" : `${p.campaignLimit} campaigns`}
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-slate-500">
                        {p.stripePriceId || <span className="text-slate-350 italic">None (Free Upgrade)</span>}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {p.isRecommended && (
                            <span className="bg-Primary/10 text-Primary text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                              Recommended
                            </span>
                          )}
                          {p.isDark && (
                            <span className="bg-slate-900 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                              Dark Card
                            </span>
                          )}
                          {!p.isRecommended && !p.isDark && (
                            <span className="text-slate-300 text-xs font-bold">-</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-2 hover:bg-slate-100 text-slate-500 hover:text-Primary rounded-xl transition-all cursor-pointer"
                            title="Edit plan"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all cursor-pointer"
                            title="Delete plan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-xl bg-white rounded-[32px] shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-xl font-bold text-slate-800 mb-6">
              {editingPlan ? "Edit Pricing Plan" : "Create Pricing Plan"}
            </h3>

            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. PRO"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:border-Primary focus:outline-none transition-all text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Price ($)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 24"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:border-Primary focus:outline-none transition-all text-sm font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Price Suffix</label>
                  <input
                    type="text"
                    value={priceSuffix}
                    onChange={(e) => setPriceSuffix(e.target.value)}
                    placeholder="e.g. / monthly"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:border-Primary focus:outline-none transition-all text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Campaign Limit</label>
                  <input
                    type="number"
                    value={campaignLimit}
                    onChange={(e) => setCampaignLimit(e.target.value)}
                    placeholder="e.g. 20 (999999 = unlimited)"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:border-Primary focus:outline-none transition-all text-sm font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Stripe Price ID</label>
                <input
                  type="text"
                  value={stripePriceId}
                  onChange={(e) => setStripePriceId(e.target.value)}
                  placeholder="e.g. price_1TkKS..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:border-Primary focus:outline-none transition-all text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description..."
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:border-Primary focus:outline-none transition-all text-sm font-semibold resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Features (One per line)
                </label>
                <textarea
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  placeholder="Up to 20 campaigns&#10;Unlimited reviews&#10;No branding"
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:border-Primary focus:outline-none transition-all text-sm font-semibold resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Button CTA</label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    placeholder="e.g. Get Started with Pro"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:border-Primary focus:outline-none transition-all text-sm font-semibold"
                  />
                </div>
                <div className="flex flex-col justify-center gap-3.5 pl-2 mt-4">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isRecommended}
                      onChange={(e) => setIsRecommended(e.target.checked)}
                      className="rounded border-slate-300 text-Primary focus:ring-Primary w-4 h-4 cursor-pointer"
                    />
                    Is Recommended
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isDark}
                      onChange={(e) => setIsDark(e.target.checked)}
                      className="rounded border-slate-300 text-Primary focus:ring-Primary w-4 h-4 cursor-pointer"
                    />
                    Use Dark Card UI
                  </label>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold py-3.5 rounded-2xl transition-all cursor-pointer text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-Primary hover:bg-Primary/90 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-Primary/10 cursor-pointer flex items-center justify-center gap-2 text-sm"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingPlan ? "Update Plan" : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingManager;
