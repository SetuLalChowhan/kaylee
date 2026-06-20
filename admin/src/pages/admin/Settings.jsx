import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { User, Shield, Globe, Camera, Save, Loader2, Plus, Trash2, Quote, RefreshCw } from "lucide-react";
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
              <img src={avatarPreview} alt="Admin Profile" className="w-full h-full object-cover" />
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
            className="bg-Primary hover:bg-Primary/90 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-Primary/20 text-sm disabled:opacity-50"
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
            className="bg-Primary hover:bg-Primary/90 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-Primary/20 text-sm disabled:opacity-50"
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
    }
  }, [cmsData]);

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

  const handleSave = (e) => {
    e.preventDefault();
    saveCmsMutation.mutate({
      footer_copyright: footerCopyright,
      system_logo_text: systemLogoText,
      system_contact_email: systemContactEmail,
    });
  };

  return (
    <div className="space-y-8 font-outfit">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Website Branding Settings</h2>
          <p className="text-xs text-slate-400 mt-0.5">Control logo branding text, contact/support email, and footer copyright text.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            className="p-2.5 bg-slate-50 border border-slate-100 text-slate-500 rounded-xl hover:bg-slate-100"
            disabled={isLoading}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || saveCmsMutation.isPending}
            className="bg-Primary hover:bg-Primary/90 text-white font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-Primary/20 text-xs disabled:opacity-50"
          >
            {saveCmsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Settings
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 bg-white rounded-3xl border border-slate-100">
          <Loader2 className="w-8 h-8 text-Primary animate-spin" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
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
        </form>
      )}
    </div>
  );
};

export default Settings;
