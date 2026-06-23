import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { User, Shield, Globe, Camera, Save, Loader2, Plus, Trash2, Quote, RefreshCw, Facebook, Twitter, Instagram, Youtube, Linkedin, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import useAxiosPublic from "@/hooks/useAxiosPublic";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { setUser } from "@/redux/slices/uiSlice";

const Settings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabFromUrl || "profile");
  const axiosSecure = useAxiosSecure();
  const axiosPublic = useAxiosPublic();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.ui.user);

  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setSearchParams({ tab: tabName });
  };

  const tabs = [
    { id: "profile", name: "Admin Profile", icon: User },
    { id: "security", name: "Security Settings", icon: Shield },
    { id: "system", name: "Website Settings", icon: Globe },
  ];

  return (
    <div className="font-outfit p-1 text-slate-800">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#1A1A1A]">System & Profile Settings</h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage your administrator profile, change credentials, or customize website settings.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 mb-8 border-b border-slate-100 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-1 py-3 border-b-2 transition-all whitespace-nowrap font-bold text-sm ${
                isActive ? "border-Primary text-Primary" : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-Primary" : "text-slate-400"}`} />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="max-w-6xl">
        {activeTab === "profile" && <AdminProfileTab user={user} axiosSecure={axiosSecure} dispatch={dispatch} />}
        {activeTab === "security" && <SecurityTab axiosSecure={axiosSecure} />}
        {activeTab === "system" && <WebsiteSettingsTab axiosSecure={axiosSecure} axiosPublic={axiosPublic} queryClient={queryClient} />}
      </div>
    </div>
  );
};

/* ── TAB 1: ADMIN PROFILE SETTINGS ─────────────────────────────────────────── */
const AdminProfileTab = ({ user, axiosSecure, dispatch }) => {
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [shortBio, setShortBio] = useState(user?.shortBio || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setDisplayName(user.displayName || "");
      setShortBio(user.shortBio || "");
      if (user.avatar) {
        setAvatarPreview(user.avatar.startsWith("http") ? user.avatar : `${import.meta.env.VITE_IMG_URL || "http://localhost:3000/"}${user.avatar}`);
      }
    }
  }, [user]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("displayName", displayName);
      formData.append("shortBio", shortBio);
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const res = await axiosSecure.patch("/user/update", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.status === "success") {
        toast.success("Profile updated successfully");
        dispatch(setUser({ user: res.data.data }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
      <h2 className="text-lg font-bold text-[#1A1A1A] mb-6 pb-2 border-b border-slate-100">Personal Information</h2>
      <form onSubmit={handleSave} className="space-y-6">
        {/* Avatar Upload */}
        <div className="flex items-center gap-6 mb-8">
          <div className="relative w-28 h-28 rounded-3xl overflow-hidden group border border-slate-100 bg-slate-50 flex items-center justify-center">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Admin Profile" className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <User className="w-12 h-12 text-slate-300" />
            )}
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="w-5 h-5 text-white mb-1" />
              <span className="text-[9px] text-white font-bold">Change Image</span>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800">Avatar Image</h3>
            <p className="text-xs text-slate-400 mt-1">JPEG, PNG, or WEBP. Max 2MB.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">First Name</label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-Primary/20 focus:border-Primary text-sm transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Last Name</label>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-Primary/20 focus:border-Primary text-sm transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email (Read Only)</label>
            <input
              type="email"
              disabled
              value={user?.email || ""}
              className="w-full bg-slate-100 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none text-slate-400 text-sm cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-Primary/20 focus:border-Primary text-sm transition-all"
              placeholder="e.g. Master Admin"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Short Bio</label>
          <textarea
            value={shortBio}
            onChange={(e) => setShortBio(e.target.value)}
            rows={3}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-Primary/20 focus:border-Primary text-sm transition-all resize-none"
            placeholder="Tell us about yourself..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
          className="w-full sm:w-auto bg-Primary hover:bg-Primary/90 text-white font-bold py-3 px-8 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-Primary/20 text-sm disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Profile Settings
          </button>
        </div>
      </form>
    </div>
  );
};

/* ── TAB 2: SECURITY / CHANGE PASSWORD ─────────────────────────────────────── */
const SecurityTab = ({ axiosSecure }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error("New password and confirm password do not match");
    }
    setLoading(true);
    try {
      const res = await axiosSecure.patch("/user/change-password", {
        oldPassword,
        newPassword,
      });
      if (res.data?.status === "success") {
        toast.success("Password changed successfully!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm max-w-xl">
      <h2 className="text-lg font-bold text-[#1A1A1A] mb-6 pb-2 border-b border-slate-100">Update Password</h2>
      <form onSubmit={handlePasswordChange} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Old Password</label>
          <input
            type="password"
            required
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-Primary/20 focus:border-Primary text-sm transition-all"
            placeholder="••••••••"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Password</label>
          <input
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-Primary/20 focus:border-Primary text-sm transition-all"
            placeholder="••••••••"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Confirm New Password</label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-Primary/20 focus:border-Primary text-sm transition-all"
            placeholder="••••••••"
          />
        </div>
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
          className="w-full sm:w-auto bg-Primary hover:bg-Primary/90 text-white font-bold py-3 px-8 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-Primary/20 text-sm disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Change Password
          </button>
        </div>
      </form>
    </div>
  );
};

/* ── TAB 3: SYSTEM & WEBSITE SETTINGS ────────────────────────────────────── */
const WebsiteSettingsTab = ({ axiosSecure, axiosPublic, queryClient }) => {
  const [footerCopyright, setFooterCopyright] = useState("");
  const [systemLogoText, setSystemLogoText] = useState("");
  const [systemContactEmail, setSystemContactEmail] = useState("");
  const [systemLogoImage, setSystemLogoImage] = useState("");
  const [logoUploading, setLogoUploading] = useState(false);
  const [socialFacebook, setSocialFacebook] = useState("");
  const [socialTwitter, setSocialTwitter] = useState("");
  const [socialInstagram, setSocialInstagram] = useState("");
  const [socialYoutube, setSocialYoutube] = useState("");
  const [socialLinkedin, setSocialLinkedin] = useState("");
  const [socialWebsite, setSocialWebsite] = useState("");

  // Local file upload states (to defer upload until Save Settings is clicked)
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");

  // Fetch CMS
  const { data: cmsData, isLoading, refetch } = useQuery({
    queryKey: ["cmsContent"],
    queryFn: async () => {
      const res = await axiosPublic.get("/cms");
      return res.data?.data || {};
    },
  });

  // Sync state
  useEffect(() => {
    if (cmsData) {
      setFooterCopyright(cmsData.footer_copyright || "");
      setSystemLogoText(cmsData.system_logo_text || "");
      setSystemContactEmail(cmsData.system_contact_email || "");
      setSystemLogoImage(cmsData.system_logo_image || "");
      setLogoPreview(cmsData.system_logo_image || "");
      setLogoFile(null);
      setSocialFacebook(cmsData.social_facebook || "");
      setSocialTwitter(cmsData.social_twitter || "");
      setSocialInstagram(cmsData.social_instagram || "");
      setSocialYoutube(cmsData.social_youtube || "");
      setSocialLinkedin(cmsData.social_linkedin || "");
      setSocialWebsite(cmsData.social_website || "");
    }
  }, [cmsData]);

  // Image path resolver
  const getImgUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("data:") || path.startsWith("blob:") || path.startsWith("http://") || path.startsWith("https://")) return path;
    const base = import.meta.env.VITE_IMG_URL || "http://localhost:3000/";
    const normalizedBase = base.endsWith("/") ? base : base + "/";
    const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
    return normalizedBase + normalizedPath;
  };

  const logoPreviewUrl = getImgUrl(logoPreview);

  // Local logo selection change handler
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview("");
    setSystemLogoImage("");
  };

  // Save Mutation
  const saveCmsMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await axiosSecure.put("/cms", payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Website settings updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["cmsContent"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update settings");
    },
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setLogoUploading(true);
    let uploadedLogoUrl = systemLogoImage;

    try {
      if (logoFile) {
        const formData = new FormData();
        formData.append("file", logoFile);

        const uploadRes = await axiosSecure.post("/cms/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (uploadRes.data?.status === "success") {
          uploadedLogoUrl = uploadRes.data.url;
        } else {
          throw new Error("Logo upload failed");
        }
      }

      await saveCmsMutation.mutateAsync({
        footer_copyright: footerCopyright,
        system_logo_text: systemLogoText,
        system_contact_email: systemContactEmail,
        system_logo_image: uploadedLogoUrl,
        social_facebook: socialFacebook,
        social_twitter: socialTwitter,
        social_instagram: socialInstagram,
        social_youtube: socialYoutube,
        social_linkedin: socialLinkedin,
        social_website: socialWebsite,
      });

      setLogoFile(null);
    } catch (err) {
      toast.error(err.message || "Failed to update settings");
    } finally {
      setLogoUploading(false);
    }
  };

  return (
    <div className="space-y-8 font-outfit">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Website Branding Settings</h2>
          <p className="text-xs text-slate-400 mt-0.5">Control logo branding text, logo image, contact/support email, footer copyright, and social link integrations.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            className="p-2.5 bg-slate-50 border border-slate-100 text-slate-500 rounded-xl hover:bg-slate-100"
            disabled={isLoading}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading || saveCmsMutation.isPending || logoUploading}
            className="w-full sm:w-auto bg-Primary hover:bg-Primary/90 text-white font-bold py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-Primary/20 text-xs disabled:opacity-50 cursor-pointer"
          >
            {saveCmsMutation.isPending || logoUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Settings
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 bg-white rounded-3xl border border-slate-100">
          <Loader2 className="w-8 h-8 text-Primary animate-spin" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
          {/* Logo Branding Image */}
          <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-36 h-16 rounded-xl overflow-hidden border border-slate-200 bg-white flex items-center justify-center p-2 shadow-sm shrink-0">
              {logoPreviewUrl ? (
                <img src={logoPreviewUrl} alt="Website Logo" className="max-w-full max-h-full object-contain" loading="lazy" />
              ) : (
                <span className="text-slate-400 text-xs font-bold uppercase italic">No Logo</span>
              )}
              {logoUploading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-Primary animate-spin" />
                </div>
              )}
            </div>
            
            <div className="flex-1 flex flex-col gap-2 text-center sm:text-left">
              <h3 className="font-bold text-sm text-slate-800">Website Logo Image</h3>
              <p className="text-xs text-slate-400 max-w-lg">This logo will be displayed on the header/footer of the main website and admin panel sidebar. JPEG/PNG/WEBP formats accepted.</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-1">
                <label className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 font-bold py-2 px-4 rounded-xl text-xs transition-all cursor-pointer shadow-sm flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" />
                  Choose Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </label>
                {(systemLogoImage || logoPreview) && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2 px-4 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove Logo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Form inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Logo Branding Text</label>
              <input
                type="text"
                required
                value={systemLogoText}
                onChange={(e) => setSystemLogoText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-Primary/20 focus:border-Primary text-sm transition-all"
                placeholder="STAKD"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Support / Contact Email</label>
              <input
                type="email"
                required
                value={systemContactEmail}
                onChange={(e) => setSystemContactEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-Primary/20 focus:border-Primary text-sm transition-all"
                placeholder="contact@stakd.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Copyright Copy Text</label>
              <input
                type="text"
                required
                value={footerCopyright}
                onChange={(e) => setFooterCopyright(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-Primary/20 focus:border-Primary text-sm transition-all"
                placeholder="© 2025 STAKD. All rights reserved."
              />
            </div>
          </div>

          {/* Social Media Links */}
          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-Primary" />
              Social Media Links
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative flex items-center">
                <div className="absolute left-4 text-slate-400 shrink-0">
                  <Instagram className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  value={socialInstagram}
                  onChange={(e) => setSocialInstagram(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-Primary/20 focus:border-Primary text-sm transition-all font-semibold"
                  placeholder="Instagram profile URL"
                />
              </div>

              <div className="relative flex items-center">
                <div className="absolute left-4 text-slate-400 shrink-0">
                  <Youtube className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  value={socialYoutube}
                  onChange={(e) => setSocialYoutube(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-Primary/20 focus:border-Primary text-sm transition-all font-semibold"
                  placeholder="YouTube channel URL"
                />
              </div>

              <div className="relative flex items-center">
                <div className="absolute left-4 text-slate-400 shrink-0">
                  <Facebook className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  value={socialFacebook}
                  onChange={(e) => setSocialFacebook(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-Primary/20 focus:border-Primary text-sm transition-all font-semibold"
                  placeholder="Facebook page URL"
                />
              </div>

              <div className="relative flex items-center">
                <div className="absolute left-4 text-slate-400 shrink-0">
                  <Twitter className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  value={socialTwitter}
                  onChange={(e) => setSocialTwitter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-Primary/20 focus:border-Primary text-sm transition-all font-semibold"
                  placeholder="Twitter / X profile URL"
                />
              </div>

              <div className="relative flex items-center">
                <div className="absolute left-4 text-slate-400 shrink-0">
                  <Linkedin className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  value={socialLinkedin}
                  onChange={(e) => setSocialLinkedin(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-Primary/20 focus:border-Primary text-sm transition-all font-semibold"
                  placeholder="LinkedIn profile URL"
                />
              </div>

              <div className="relative flex items-center">
                <div className="absolute left-4 text-slate-400 shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  value={socialWebsite}
                  onChange={(e) => setSocialWebsite(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-Primary/20 focus:border-Primary text-sm transition-all font-semibold"
                  placeholder="Website URL (e.g. https://keylee.com)"
                />
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default Settings;
