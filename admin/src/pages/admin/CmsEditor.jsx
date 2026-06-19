import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import useAxiosPublic from "@/hooks/useAxiosPublic";
import { Save, Loader2, RefreshCw, Plus, Trash2, Quote } from "lucide-react";
import { toast } from "react-toastify";

const CmsEditor = () => {
  const axiosSecure = useAxiosSecure();
  const axiosPublic = useAxiosPublic();
  const queryClient = useQueryClient();

  // Local state for all fields
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerSubtext, setBannerSubtext] = useState("");
  const [bannerCta, setBannerCta] = useState("");
  const [featuresTitle, setFeaturesTitle] = useState("");
  const [featuresSubtext, setFeaturesSubtext] = useState("");
  const [testimonials, setTestimonials] = useState([]);

  // Fetch CMS Content (Public endpoint is fine since we just want to read the current values)
  const { data: cmsData, isLoading, refetch } = useQuery({
    queryKey: ["cmsContent"],
    queryFn: async () => {
      const res = await axiosPublic.get("/cms");
      return res.data?.data || {};
    }
  });

  // Sync state with fetched data
  useEffect(() => {
    if (cmsData) {
      setBannerTitle(cmsData.banner_title || "");
      setBannerSubtext(cmsData.banner_subtext || "");
      setBannerCta(cmsData.banner_cta || "");
      setFeaturesTitle(cmsData.features_title || "");
      setFeaturesSubtext(cmsData.features_subtext || "");
      
      try {
        const parsedTestimonials = cmsData.testimonials ? JSON.parse(cmsData.testimonials) : [];
        setTestimonials(Array.isArray(parsedTestimonials) ? parsedTestimonials : []);
      } catch (err) {
        setTestimonials([]);
      }
    }
  }, [cmsData]);

  // Update CMS Mutation
  const saveMutation = useMutation({
    mutationFn: async (updates) => {
      const res = await axiosSecure.put("/cms", updates);
      return res.data;
    },
    onSuccess: () => {
      toast.success("CMS settings saved successfully");
      queryClient.invalidateQueries({ queryKey: ["cmsContent"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to save CMS settings");
    }
  });

  const handleTestimonialChange = (index, field, val) => {
    const updated = [...testimonials];
    updated[index] = { ...updated[index], [field]: val };
    setTestimonials(updated);
  };

  const addTestimonial = () => {
    setTestimonials([...testimonials, { name: "New Creator", role: "Content Creator", text: "Write testimonial here..." }]);
  };

  const removeTestimonial = (index) => {
    setTestimonials(testimonials.filter((_, idx) => idx !== index));
  };

  const handleSave = (e) => {
    e.preventDefault();
    const payload = {
      banner_title: bannerTitle,
      banner_subtext: bannerSubtext,
      banner_cta: bannerCta,
      features_title: featuresTitle,
      features_subtext: featuresSubtext,
      testimonials: JSON.stringify(testimonials)
    };
    saveMutation.mutate(payload);
  };

  return (
    <div className="font-outfit p-1 text-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1A1A1A]">CMS Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Configure landing page copy, headlines, features and customer testimonials.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition-all"
            title="Reset Settings"
            disabled={isLoading}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || saveMutation.isPending}
            className="bg-[#1F3C37] hover:bg-[#1F3C37]/90 text-white font-bold py-3 px-6 rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-[#1F3C37]/10"
          >
            {saveMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Save Configuration
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Loader2 className="w-8 h-8 text-[#1F3C37] animate-spin" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-8">
          {/* Banner Settings Section */}
          <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-6 pb-2 border-b border-slate-100">1. Hero Banner Configuration</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Banner Title</label>
                <input
                  type="text"
                  required
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#1F3C37]/20 focus:border-[#1F3C37] text-sm transition-all"
                  placeholder="Main catchphrase for visitors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Banner Description Subtext</label>
                  <textarea
                    required
                    value={bannerSubtext}
                    onChange={(e) => setBannerSubtext(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#1F3C37]/20 focus:border-[#1F3C37] text-sm transition-all resize-none"
                    placeholder="Short description of platform offerings"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">CTA Button Text</label>
                  <input
                    type="text"
                    required
                    value={bannerCta}
                    onChange={(e) => setBannerCta(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#1F3C37]/20 focus:border-[#1F3C37] text-sm transition-all"
                    placeholder="Get Started Free"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Features Settings Section */}
          <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-6 pb-2 border-b border-slate-100">2. Features Info Configuration</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Features Section Header</label>
                <input
                  type="text"
                  required
                  value={featuresTitle}
                  onChange={(e) => setFeaturesTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#1F3C37]/20 focus:border-[#1F3C37] text-sm transition-all"
                  placeholder="Built for UGC & Content Creators"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Features Section Description</label>
                <textarea
                  required
                  value={featuresSubtext}
                  onChange={(e) => setFeaturesSubtext(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#1F3C37]/20 focus:border-[#1F3C37] text-sm transition-all resize-none"
                  placeholder="Focus on creating content while STAKD manages your client approvals..."
                />
              </div>
            </div>
          </div>

          {/* Testimonials Settings Section */}
          <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-100">
              <h2 className="text-lg font-bold text-[#1A1A1A]">3. Creator Testimonials</h2>
              <button
                type="button"
                onClick={addTestimonial}
                className="text-[#1F3C37] hover:bg-[#1F3C37]/5 font-bold py-1.5 px-4 rounded-xl border border-[#1F3C37]/20 flex items-center gap-1.5 transition-all text-xs"
              >
                <Plus className="w-4 h-4" />
                Add Testimonial
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {testimonials.map((test, index) => (
                <div key={index} className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 relative group">
                  <button
                    type="button"
                    onClick={() => removeTestimonial(index)}
                    className="absolute right-4 top-4 p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100"
                    title="Remove Testimonial"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2 text-[#1F3C37] mb-4">
                    <Quote className="w-5 h-5 opacity-40 fill-[#1F3C37]/10" />
                    <span className="font-bold text-xs uppercase tracking-wide">Card #{index + 1}</span>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Author Name</label>
                        <input
                          type="text"
                          required
                          value={test.name || ""}
                          onChange={(e) => handleTestimonialChange(index, "name", e.target.value)}
                          className="w-full bg-white border border-slate-100 rounded-lg py-2 px-3 focus:outline-none focus:border-[#1F3C37] text-xs transition-all font-semibold"
                          placeholder="Sarah Jenkins"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Author Role</label>
                        <input
                          type="text"
                          required
                          value={test.role || ""}
                          onChange={(e) => handleTestimonialChange(index, "role", e.target.value)}
                          className="w-full bg-white border border-slate-100 rounded-lg py-2 px-3 focus:outline-none focus:border-[#1F3C37] text-xs transition-all font-semibold"
                          placeholder="UGC Creator"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Quote Text</label>
                      <textarea
                        required
                        value={test.text || ""}
                        onChange={(e) => handleTestimonialChange(index, "text", e.target.value)}
                        rows={3}
                        className="w-full bg-white border border-slate-100 rounded-lg py-2 px-3 focus:outline-none focus:border-[#1F3C37] text-xs transition-all resize-none font-medium text-slate-600 leading-relaxed"
                        placeholder="Sarah K's experience..."
                      />
                    </div>
                  </div>
                </div>
              ))}

              {testimonials.length === 0 && (
                <div className="col-span-2 text-center py-10 border border-dashed border-slate-200 rounded-2xl bg-slate-50/20">
                  <p className="text-slate-400 text-sm font-medium">No testimonials configured. Click 'Add Testimonial' to create one.</p>
                </div>
              )}
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default CmsEditor;
