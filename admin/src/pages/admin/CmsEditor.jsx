import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import useAxiosPublic from "@/hooks/useAxiosPublic";
import { Save, Loader2, RefreshCw, Plus, Trash2, Quote, Upload, X } from "lucide-react";
import { toast } from "react-toastify";

// Custom Image Upload component with preview, upload, and delete
const ImageUploadField = ({ label, value, onChange, axiosSecure }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axiosSecure.post("/cms/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.status === "success") {
        onChange(res.data.url);
        toast.success("Image uploaded successfully");
      }
    } catch (err) {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const getFullImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http") || url.startsWith("data:")) return url;
    return `${import.meta.env.VITE_IMG_URL || "http://localhost:3000/"}${url}`;
  };

  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</label>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-xl">
        {value ? (
          <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 group shrink-0 mx-auto sm:mx-0">
            <img src={getFullImageUrl(value)} alt={label} className="w-full h-full object-cover" loading="lazy" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity"
            >
              Delete
            </button>
          </div>
        ) : (
          <div className="w-16 h-16 rounded-lg bg-slate-200 border border-dashed border-slate-350 flex items-center justify-center text-slate-400 text-[10px] text-center p-1 shrink-0 mx-auto sm:mx-0">
            No Image
          </div>
        )}
        <div className="flex-1 w-full text-center sm:text-left">
          {uploading ? (
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold text-Primary">
              <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
            </div>
          ) : (
            <div className="flex flex-col items-center sm:items-start gap-1.5 w-full">
              <label className="inline-flex items-center justify-center px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold bg-white text-slate-650 hover:bg-slate-50 cursor-pointer shadow-sm w-full sm:w-fit">
                {value ? "Change Image" : "Upload Image"}
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
              {value && <p className="text-[10px] text-slate-400 font-medium truncate w-full max-w-[250px] sm:max-w-xs">{value}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CmsEditor = () => {
  const axiosSecure = useAxiosSecure();
  const axiosPublic = useAxiosPublic();
  const queryClient = useQueryClient();

  // CMS state values
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerSubtext, setBannerSubtext] = useState("");
  const [bannerCta, setBannerCta] = useState("");
  const [bannerImage, setBannerImage] = useState("");

  const [featuresTitle, setFeaturesTitle] = useState("");
  const [featuresSubtext, setFeaturesSubtext] = useState("");

  // Manage & Deliver Features copy (cards 1-4)
  const [f1Title, setF1Title] = useState("");
  const [f1Desc, setF1Desc] = useState("");
  const [f1Image, setF1Image] = useState("");
  const [f2Title, setF2Title] = useState("");
  const [f2Desc, setF2Desc] = useState("");
  const [f2Image, setF2Image] = useState("");
  const [f3Title, setF3Title] = useState("");
  const [f3Desc, setF3Desc] = useState("");
  const [f3Image, setF3Image] = useState("");
  const [f4Title, setF4Title] = useState("");
  const [f4Desc, setF4Desc] = useState("");
  const [f4Image, setF4Image] = useState("");

  // Simple Workflow steps (step 1-3)
  const [wTitle, setWTitle] = useState("");
  const [wSubtext, setWSubtext] = useState("");
  const [s1Title, setS1Title] = useState("");
  const [s1Desc, setS1Desc] = useState("");
  const [s1Image, setS1Image] = useState("");
  const [s2Title, setS2Title] = useState("");
  const [s2Desc, setS2Desc] = useState("");
  const [s2Image, setS2Image] = useState("");
  const [s3Title, setS3Title] = useState("");
  const [s3Desc, setS3Desc] = useState("");
  const [s3Image, setS3Image] = useState("");

  // Ready Section
  const [rTitle, setRTitle] = useState("");
  const [rSubtext, setRSubtext] = useState("");
  const [rCta, setRCta] = useState("");
  const [rImage, setRImage] = useState("");

  // Testimonials Array
  const [testimonials, setTestimonials] = useState([]);

  // Fetch CMS Content
  const { data: cmsData, isLoading, refetch } = useQuery({
    queryKey: ["cmsContent"],
    queryFn: async () => {
      const res = await axiosPublic.get("/cms");
      return res.data?.data || {};
    },
  });

  // Sync CMS Content
  useEffect(() => {
    if (cmsData) {
      setBannerTitle(cmsData.banner_title || "");
      setBannerSubtext(cmsData.banner_subtext || "");
      setBannerCta(cmsData.banner_cta || "");
      setBannerImage(cmsData.banner_image || "");

      setFeaturesTitle(cmsData.features_title || "");
      setFeaturesSubtext(cmsData.features_subtext || "");

      setF1Title(cmsData.feature1_title || "");
      setF1Desc(cmsData.feature1_desc || "");
      setF1Image(cmsData.feature1_image || "");
      setF2Title(cmsData.feature2_title || "");
      setF2Desc(cmsData.feature2_desc || "");
      setF2Image(cmsData.feature2_image || "");
      setF3Title(cmsData.feature3_title || "");
      setF3Desc(cmsData.feature3_desc || "");
      setF3Image(cmsData.feature3_image || "");
      setF4Title(cmsData.feature4_title || "");
      setF4Desc(cmsData.feature4_desc || "");
      setF4Image(cmsData.feature4_image || "");

      setWTitle(cmsData.workflow_title || "");
      setWSubtext(cmsData.workflow_subtext || "");
      setS1Title(cmsData.workflow_step1_title || "");
      setS1Desc(cmsData.workflow_step1_desc || "");
      setS1Image(cmsData.workflow_step1_image || "");
      setS2Title(cmsData.workflow_step2_title || "");
      setS2Desc(cmsData.workflow_step2_desc || "");
      setS2Image(cmsData.workflow_step2_image || "");
      setS3Title(cmsData.workflow_step3_title || "");
      setS3Desc(cmsData.workflow_step3_desc || "");
      setS3Image(cmsData.workflow_step3_image || "");

      setRTitle(cmsData.ready_title || "");
      setRSubtext(cmsData.ready_subtext || "");
      setRCta(cmsData.ready_cta || "");
      setRImage(cmsData.ready_image || "");

      try {
        const parsed = cmsData.testimonials ? JSON.parse(cmsData.testimonials) : [];
        setTestimonials(Array.isArray(parsed) ? parsed : []);
      } catch (err) {
        setTestimonials([]);
      }
    }
  }, [cmsData]);

  // Save Mutation
  const saveCmsMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await axiosSecure.put("/cms", payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("CMS configurations saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["cmsContent"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to save CMS configurations");
    },
  });

  const handleSave = (e) => {
    e.preventDefault();
    const payload = {
      banner_title: bannerTitle,
      banner_subtext: bannerSubtext,
      banner_cta: bannerCta,
      banner_image: bannerImage,
      features_title: featuresTitle,
      features_subtext: featuresSubtext,
      feature1_title: f1Title,
      feature1_desc: f1Desc,
      feature1_image: f1Image,
      feature2_title: f2Title,
      feature2_desc: f2Desc,
      feature2_image: f2Image,
      feature3_title: f3Title,
      feature3_desc: f3Desc,
      feature3_image: f3Image,
      feature4_title: f4Title,
      feature4_desc: f4Desc,
      feature4_image: f4Image,
      workflow_title: wTitle,
      workflow_subtext: wSubtext,
      workflow_step1_title: s1Title,
      workflow_step1_desc: s1Desc,
      workflow_step1_image: s1Image,
      workflow_step2_title: s2Title,
      workflow_step2_desc: s2Desc,
      workflow_step2_image: s2Image,
      workflow_step3_title: s3Title,
      workflow_step3_desc: s3Desc,
      workflow_step3_image: s3Image,
      ready_title: rTitle,
      ready_subtext: rSubtext,
      ready_cta: rCta,
      ready_image: rImage,
      testimonials: JSON.stringify(testimonials),
    };
    saveCmsMutation.mutate(payload);
  };

  const handleAutoSave = async (fieldKey, newValue) => {
    const payload = {
      banner_title: bannerTitle,
      banner_subtext: bannerSubtext,
      banner_cta: bannerCta,
      banner_image: fieldKey === "banner_image" ? newValue : bannerImage,
      features_title: featuresTitle,
      features_subtext: featuresSubtext,
      feature1_title: f1Title,
      feature1_desc: f1Desc,
      feature1_image: fieldKey === "feature1_image" ? newValue : f1Image,
      feature2_title: f2Title,
      feature2_desc: f2Desc,
      feature2_image: fieldKey === "feature2_image" ? newValue : f2Image,
      feature3_title: f3Title,
      feature3_desc: f3Desc,
      feature3_image: fieldKey === "feature3_image" ? newValue : f3Image,
      feature4_title: f4Title,
      feature4_desc: f4Desc,
      feature4_image: fieldKey === "feature4_image" ? newValue : f4Image,
      workflow_title: wTitle,
      workflow_subtext: wSubtext,
      workflow_step1_title: s1Title,
      workflow_step1_desc: s1Desc,
      workflow_step1_image: fieldKey === "workflow_step1_image" ? newValue : s1Image,
      workflow_step2_title: s2Title,
      workflow_step2_desc: s2Desc,
      workflow_step2_image: fieldKey === "workflow_step2_image" ? newValue : s2Image,
      workflow_step3_title: s3Title,
      workflow_step3_desc: s3Desc,
      workflow_step3_image: fieldKey === "workflow_step3_image" ? newValue : s3Image,
      ready_title: rTitle,
      ready_subtext: rSubtext,
      ready_cta: rCta,
      ready_image: fieldKey === "ready_image" ? newValue : rImage,
      testimonials: JSON.stringify(
        fieldKey === "testimonials" ? newValue : testimonials
      ),
    };

    try {
      await axiosSecure.put("/cms", payload);
      queryClient.invalidateQueries({ queryKey: ["cmsContent"] });
    } catch (err) {
      toast.error("Failed to sync CMS configurations on upload");
    }
  };

  const handleImageChange = (fieldKey, setter) => (newValue) => {
    setter(newValue);
    handleAutoSave(fieldKey, newValue);
  };

  const handleTestimonialAvatarChange = (index) => (val) => {
    const updated = [...testimonials];
    updated[index] = { ...updated[index], "avatar": val };
    setTestimonials(updated);
    handleAutoSave("testimonials", updated);
  };

  const handleTestimonialChange = (index, field, val) => {
    const updated = [...testimonials];
    updated[index] = { ...updated[index], [field]: val };
    setTestimonials(updated);
  };

  const addTestimonial = () => {
    setTestimonials([
      ...testimonials,
      { name: "Creator Name", role: "Content Creator", text: "Write review here...", avatar: "" }
    ]);
  };

  const removeTestimonial = (index) => {
    setTestimonials(testimonials.filter((_, idx) => idx !== index));
  };

  return (
    <div className="font-outfit p-1 text-slate-800 space-y-8">
      {/* CMS Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1A1A1A]">CMS Editor</h1>
          <p className="text-slate-500 text-sm mt-1">Configure layout sections, copy text, headlines, and page media.</p>
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
            disabled={isLoading || saveCmsMutation.isPending}
            className="bg-Primary hover:bg-Primary/90 text-white font-bold py-3 px-6 rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-Primary/10 cursor-pointer"
          >
            {saveCmsMutation.isPending ? (
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
          <Loader2 className="w-8 h-8 text-Primary animate-spin" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-8 pb-16">
          {/* SECTION 1: HERO BANNER */}
          <div className="bg-white rounded-2xl md:rounded-[32px] p-5 md:p-8 border border-slate-100 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-[#1A1A1A] pb-2 border-b border-slate-100">1. Hero Banner Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Banner Title</label>
                <input
                  type="text"
                  required
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-Primary/20 focus:border-Primary text-sm transition-all"
                  placeholder="Main Header Copy"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">CTA Action Button Copy</label>
                <input
                  type="text"
                  required
                  value={bannerCta}
                  onChange={(e) => setBannerCta(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-Primary/20 focus:border-Primary text-sm transition-all"
                  placeholder="Get Started Free"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Hero Description Subtext</label>
              <textarea
                required
                value={bannerSubtext}
                onChange={(e) => setBannerSubtext(e.target.value)}
                rows={2}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-Primary/20 focus:border-Primary text-sm transition-all resize-none"
                placeholder="Brief summary sentence..."
              />
            </div>
            <ImageUploadField
              label="Dashboard Preview Image"
              value={bannerImage}
              onChange={handleImageChange("banner_image", setBannerImage)}
              axiosSecure={axiosSecure}
            />
          </div>

          {/* SECTION 2: BENTO FEATURES */}
          <div className="bg-white rounded-2xl md:rounded-[32px] p-5 md:p-8 border border-slate-100 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-[#1A1A1A] pb-2 border-b border-slate-100">2. Bento Grid Features Section</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Features Section Header</label>
                <input
                  type="text"
                  required
                  value={featuresTitle}
                  onChange={(e) => setFeaturesTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-Primary/20 focus:border-Primary text-sm transition-all"
                  placeholder="Built for UGC & Content Creators"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Features Section Description</label>
                <input
                  type="text"
                  required
                  value={featuresSubtext}
                  onChange={(e) => setFeaturesSubtext(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-Primary/20 focus:border-Primary text-sm transition-all"
                  placeholder="Focus on creating content while managing workflow..."
                />
              </div>
            </div>

            {/* Bento Cards (1-4) details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-50">
              {/* Feature 1 */}
              <div className="bg-slate-50/50 p-4 md:p-6 rounded-2xl border border-slate-100 space-y-4">
                <span className="text-[10px] font-extrabold text-Primary bg-Primary/5 px-2 py-0.5 rounded">Bento Card 1</span>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Title</label>
                  <input
                    type="text"
                    value={f1Title}
                    onChange={(e) => setF1Title(e.target.value)}
                    placeholder="Card Title"
                    className="w-full bg-white border border-slate-100 rounded-lg py-2 px-3 focus:outline-none text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Description</label>
                  <textarea
                    value={f1Desc}
                    onChange={(e) => setF1Desc(e.target.value)}
                    placeholder="Card Description"
                    rows={2}
                    className="w-full bg-white border border-slate-100 rounded-lg py-2 px-3 focus:outline-none text-xs resize-none"
                  />
                </div>
                <ImageUploadField
                  label="Card Image"
                  value={f1Image}
                  onChange={handleImageChange("feature1_image", setF1Image)}
                  axiosSecure={axiosSecure}
                />
              </div>

              {/* Feature 2 */}
              <div className="bg-slate-50/50 p-4 md:p-6 rounded-2xl border border-slate-100 space-y-4">
                <span className="text-[10px] font-extrabold text-Primary bg-Primary/5 px-2 py-0.5 rounded">Bento Card 2</span>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Title</label>
                  <input
                    type="text"
                    value={f2Title}
                    onChange={(e) => setF2Title(e.target.value)}
                    placeholder="Card Title"
                    className="w-full bg-white border border-slate-100 rounded-lg py-2 px-3 focus:outline-none text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Description</label>
                  <textarea
                    value={f2Desc}
                    onChange={(e) => setF2Desc(e.target.value)}
                    placeholder="Card Description"
                    rows={2}
                    className="w-full bg-white border border-slate-100 rounded-lg py-2 px-3 focus:outline-none text-xs resize-none"
                  />
                </div>
                <ImageUploadField
                  label="Card Image"
                  value={f2Image}
                  onChange={handleImageChange("feature2_image", setF2Image)}
                  axiosSecure={axiosSecure}
                />
              </div>

              {/* Feature 3 */}
              <div className="bg-slate-50/50 p-4 md:p-6 rounded-2xl border border-slate-100 space-y-4">
                <span className="text-[10px] font-extrabold text-Primary bg-Primary/5 px-2 py-0.5 rounded">Bento Card 3</span>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Title</label>
                  <input
                    type="text"
                    value={f3Title}
                    onChange={(e) => setF3Title(e.target.value)}
                    placeholder="Card Title"
                    className="w-full bg-white border border-slate-100 rounded-lg py-2 px-3 focus:outline-none text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Description</label>
                  <textarea
                    value={f3Desc}
                    onChange={(e) => setF3Desc(e.target.value)}
                    placeholder="Card Description"
                    rows={2}
                    className="w-full bg-white border border-slate-100 rounded-lg py-2 px-3 focus:outline-none text-xs resize-none"
                  />
                </div>
                <ImageUploadField
                  label="Card Image"
                  value={f3Image}
                  onChange={handleImageChange("feature3_image", setF3Image)}
                  axiosSecure={axiosSecure}
                />
              </div>

              {/* Feature 4 */}
              <div className="bg-slate-50/50 p-4 md:p-6 rounded-2xl border border-slate-100 space-y-4">
                <span className="text-[10px] font-extrabold text-Primary bg-Primary/5 px-2 py-0.5 rounded">Bento Card 4</span>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Title</label>
                  <input
                    type="text"
                    value={f4Title}
                    onChange={(e) => setF4Title(e.target.value)}
                    placeholder="Card Title"
                    className="w-full bg-white border border-slate-100 rounded-lg py-2 px-3 focus:outline-none text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Description</label>
                  <textarea
                    value={f4Desc}
                    onChange={(e) => setF4Desc(e.target.value)}
                    placeholder="Card Description"
                    rows={2}
                    className="w-full bg-white border border-slate-100 rounded-lg py-2 px-3 focus:outline-none text-xs resize-none"
                  />
                </div>
                <ImageUploadField
                  label="Card Image"
                  value={f4Image}
                  onChange={handleImageChange("feature4_image", setF4Image)}
                  axiosSecure={axiosSecure}
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: SIMPLE WORKFLOW (HOW IT WORKS) */}
          <div className="bg-white rounded-2xl md:rounded-[32px] p-5 md:p-8 border border-slate-100 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-[#1A1A1A] pb-2 border-b border-slate-100">3. "How it Works" Workflow Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Workflow Title</label>
                <input
                  type="text"
                  required
                  value={wTitle}
                  onChange={(e) => setWTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-Primary/20 focus:border-Primary text-sm transition-all"
                  placeholder="Simple workflow from start to finish"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Workflow Description Subtext</label>
                <input
                  type="text"
                  required
                  value={wSubtext}
                  onChange={(e) => setWSubtext(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-Primary/20 focus:border-Primary text-sm transition-all"
                  placeholder="Manage your campaigns, collaborate with brands..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-50">
              {/* Step 1 */}
              <div className="bg-slate-50/50 p-4 md:p-6 rounded-2xl border border-slate-100 space-y-4">
                <span className="text-[10px] font-extrabold text-Primary bg-Primary/5 px-2 py-0.5 rounded">Workflow Step 1</span>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Title</label>
                  <input
                    type="text"
                    value={s1Title}
                    onChange={(e) => setS1Title(e.target.value)}
                    placeholder="Step Title"
                    className="w-full bg-white border border-slate-100 rounded-lg py-2 px-3 focus:outline-none text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Description</label>
                  <textarea
                    value={s1Desc}
                    onChange={(e) => setS1Desc(e.target.value)}
                    placeholder="Step Description"
                    rows={3}
                    className="w-full bg-white border border-slate-100 rounded-lg py-2 px-3 focus:outline-none text-xs resize-none"
                  />
                </div>
                <ImageUploadField
                  label="Step Image"
                  value={s1Image}
                  onChange={handleImageChange("workflow_step1_image", setS1Image)}
                  axiosSecure={axiosSecure}
                />
              </div>

              {/* Step 2 */}
              <div className="bg-slate-50/50 p-4 md:p-6 rounded-2xl border border-slate-100 space-y-4">
                <span className="text-[10px] font-extrabold text-Primary bg-Primary/5 px-2 py-0.5 rounded">Workflow Step 2</span>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Title</label>
                  <input
                    type="text"
                    value={s2Title}
                    onChange={(e) => setS2Title(e.target.value)}
                    placeholder="Step Title"
                    className="w-full bg-white border border-slate-100 rounded-lg py-2 px-3 focus:outline-none text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Description</label>
                  <textarea
                    value={s2Desc}
                    onChange={(e) => setS2Desc(e.target.value)}
                    placeholder="Step Description"
                    rows={3}
                    className="w-full bg-white border border-slate-100 rounded-lg py-2 px-3 focus:outline-none text-xs resize-none"
                  />
                </div>
                <ImageUploadField
                  label="Step Image"
                  value={s2Image}
                  onChange={handleImageChange("workflow_step2_image", setS2Image)}
                  axiosSecure={axiosSecure}
                />
              </div>

              {/* Step 3 */}
              <div className="bg-slate-50/50 p-4 md:p-6 rounded-2xl border border-slate-100 space-y-4">
                <span className="text-[10px] font-extrabold text-Primary bg-Primary/5 px-2 py-0.5 rounded">Workflow Step 3</span>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Title</label>
                  <input
                    type="text"
                    value={s3Title}
                    onChange={(e) => setS3Title(e.target.value)}
                    placeholder="Step Title"
                    className="w-full bg-white border border-slate-100 rounded-lg py-2 px-3 focus:outline-none text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Description</label>
                  <textarea
                    value={s3Desc}
                    onChange={(e) => setS3Desc(e.target.value)}
                    placeholder="Step Description"
                    rows={3}
                    className="w-full bg-white border border-slate-100 rounded-lg py-2 px-3 focus:outline-none text-xs resize-none"
                  />
                </div>
                <ImageUploadField
                  label="Step Image"
                  value={s3Image}
                  onChange={handleImageChange("workflow_step3_image", setS3Image)}
                  axiosSecure={axiosSecure}
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: READY WORKFLOW BANNER */}
          <div className="bg-white rounded-2xl md:rounded-[32px] p-5 md:p-8 border border-slate-100 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-[#1A1A1A] pb-2 border-b border-slate-100">4. CTA Ready Section (Bottom Banner)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Banner Title</label>
                <input
                  type="text"
                  required
                  value={rTitle}
                  onChange={(e) => setRTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-Primary/20 focus:border-Primary text-sm transition-all"
                  placeholder="Ready to simplify your workflow?"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">CTA Button Text</label>
                <input
                  type="text"
                  required
                  value={rCta}
                  onChange={(e) => setRCta(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-Primary/20 focus:border-Primary text-sm transition-all"
                  placeholder="Start for Free"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Banner Description Paragraph</label>
              <textarea
                required
                value={rSubtext}
                onChange={(e) => setRSubtext(e.target.value)}
                rows={2}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-Primary/20 focus:border-Primary text-sm transition-all resize-none"
                placeholder="Start managing your campaigns, collaborating with brands..."
              />
            </div>
            <ImageUploadField
              label="Ready Section Background Image"
              value={rImage}
              onChange={handleImageChange("ready_image", setRImage)}
              axiosSecure={axiosSecure}
            />
          </div>

          {/* SECTION 5: CREATOR TESTIMONIALS */}
          <div className="bg-white rounded-2xl md:rounded-[32px] p-5 md:p-8 border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-6">
              <h2 className="text-lg font-bold text-[#1A1A1A]">5. Landing Page Testimonials</h2>
              <button
                type="button"
                onClick={addTestimonial}
                className="text-Primary hover:bg-Primary/5 font-bold py-1.5 px-4 rounded-xl border border-Primary/20 flex items-center gap-1.5 transition-all text-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Review Card
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {testimonials.map((test, index) => (
                <div key={index} className="bg-slate-50/50 rounded-2xl p-4 md:p-5 border border-slate-100 relative group space-y-4">
                  <button
                    type="button"
                    onClick={() => removeTestimonial(index)}
                    className="absolute right-4 top-4 p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100"
                    title="Remove Testimonial"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2 text-Primary">
                    <Quote className="w-5 h-5 opacity-40 fill-Primary/10" />
                    <span className="font-bold text-xs uppercase tracking-wide">Review #{index + 1}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Creator Name</label>
                      <input
                        type="text"
                        required
                        value={test.name || ""}
                        onChange={(e) => handleTestimonialChange(index, "name", e.target.value)}
                        className="w-full bg-white border border-slate-100 rounded-lg py-2 px-3 focus:outline-none text-xs transition-all font-semibold"
                        placeholder="Sarah Jenkins"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Creator Designation</label>
                      <input
                        type="text"
                        required
                        value={test.role || ""}
                        onChange={(e) => handleTestimonialChange(index, "role", e.target.value)}
                        className="w-full bg-white border border-slate-100 rounded-lg py-2 px-3 focus:outline-none text-xs transition-all font-semibold"
                        placeholder="UGC Creator"
                      />
                    </div>
                  </div>
                  <ImageUploadField
                    label="Creator Avatar"
                    value={test.avatar || ""}
                    onChange={handleTestimonialAvatarChange(index)}
                    axiosSecure={axiosSecure}
                  />
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Testimonial Quote Text</label>
                    <textarea
                      required
                      value={test.text || ""}
                      onChange={(e) => handleTestimonialChange(index, "text", e.target.value)}
                      rows={3}
                      className="w-full bg-white border border-slate-100 rounded-lg py-2 px-3 focus:outline-none text-xs transition-all resize-none font-medium text-slate-600 leading-relaxed"
                      placeholder="Write the user experience quote..."
                    />
                  </div>
                </div>
              ))}

              {testimonials.length === 0 && (
                <div className="col-span-2 text-center py-10 border border-dashed border-slate-200 rounded-2xl bg-slate-50/20">
                  <p className="text-slate-400 text-sm font-medium">No testimonials configured. Click 'Add Review Card' to create one.</p>
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
