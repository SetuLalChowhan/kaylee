import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Shield,
  User,
  X,
  Loader2,
  Eye,
  ExternalLink,
  Globe,
  Instagram,
  Youtube,
  Folder,
  Calendar,
  FileText,
  Video,
  Image as ImageIcon
} from "lucide-react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const UserList = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  // Modal/Drawer states
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewedUser, setViewedUser] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [isVerified, setIsVerified] = useState(true);
  const [planId, setPlanId] = useState("");
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await axiosSecure.get("/plans");
        if (res.data?.status === "success") {
          setPlans(res.data.data || []);
        }
      } catch (err) {
        console.error("Failed to load plans in admin panel:", err);
      }
    };
    fetchPlans();
  }, [axiosSecure]);

  // Portfolio media CRUD states
  const [newPortfolioTitle, setNewPortfolioTitle] = useState("");
  const [newPortfolioFile, setNewPortfolioFile] = useState(null);
  const [isUploadingPortfolio, setIsUploadingPortfolio] = useState(false);

  const handleUploadPortfolioItem = async (e) => {
    e.preventDefault();
    if (!newPortfolioFile || !newPortfolioTitle.trim()) return;
    setIsUploadingPortfolio(true);
    try {
      const formData = new FormData();
      formData.append("title", newPortfolioTitle);
      formData.append("file", newPortfolioFile);
      formData.append("targetUserId", viewedUser.id);
      await axiosSecure.post("/user/portfolio", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Portfolio item uploaded");
      setNewPortfolioTitle("");
      setNewPortfolioFile(null);
      queryClient.invalidateQueries({ queryKey: ["adminUserPortfolioPreview", viewedUser.slug] });
    } catch (err) {
      toast.error("Failed to upload portfolio item");
    } finally {
      setIsUploadingPortfolio(false);
    }
  };

  const handleEditPortfolioTitle = async (itemId, currentTitle) => {
    const newTitle = prompt("Enter new title for portfolio item:", currentTitle);
    if (newTitle !== null && newTitle.trim() !== "") {
      try {
        await axiosSecure.patch(`/user/portfolio/${itemId}`, { title: newTitle });
        toast.success("Portfolio item updated");
        queryClient.invalidateQueries({ queryKey: ["adminUserPortfolioPreview", viewedUser.slug] });
      } catch (err) {
        toast.error("Failed to update portfolio item");
      }
    }
  };

  const handleDeletePortfolioItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this portfolio item?")) return;
    try {
      await axiosSecure.delete(`/user/portfolio/${itemId}`);
      toast.success("Portfolio item deleted");
      queryClient.invalidateQueries({ queryKey: ["adminUserPortfolioPreview", viewedUser.slug] });
    } catch (err) {
      toast.error("Failed to delete portfolio item");
    }
  };

  // Fetch Users
  const { data: usersData, isLoading: isUsersLoading } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: async () => {
      const res = await axiosSecure.get("/user/admin/users");
      return res.data?.data || [];
    }
  });

  // Fetch campaigns, tasks, and invoices to map in detail view
  const { data: campaignsData } = useQuery({
    queryKey: ["adminCampaignsForDetails"],
    queryFn: async () => {
      const res = await axiosSecure.get("/ugc-campaigns");
      return res.data?.data || [];
    }
  });

  const { data: tasksData } = useQuery({
    queryKey: ["adminTasksForDetails"],
    queryFn: async () => {
      const res = await axiosSecure.get("/planner");
      return res.data?.data || [];
    }
  });

  const { data: invoicesData } = useQuery({
    queryKey: ["adminInvoicesForDetails"],
    queryFn: async () => {
      const res = await axiosSecure.get("/invoice");
      return res.data?.data || [];
    }
  });

  // Fetch specific user's portfolio preview
  const { data: portfolioData, isLoading: isPortfolioLoading } = useQuery({
    queryKey: ["adminUserPortfolioPreview", viewedUser?.slug],
    queryFn: async () => {
      if (!viewedUser?.slug) return null;
      const res = await axiosSecure.get(`/user/portfolio-preview/${viewedUser.slug}`);
      return res.data?.data || null;
    },
    enabled: !!viewedUser?.slug
  });

  // Create User Mutation
  const createMutation = useMutation({
    mutationFn: async (userData) => {
      const res = await axiosSecure.post("/user/admin/users", userData);
      return res.data;
    },
    onSuccess: () => {
      toast.success("User created successfully");
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      closeModal();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create user");
    }
  });

  // Update User Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, userData }) => {
      const res = await axiosSecure.patch(`/user/admin/users/${id}`, userData);
      return res.data;
    },
    onSuccess: () => {
      toast.success("User updated successfully");
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      closeModal();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update user");
    }
  });

  // Delete User Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosSecure.delete(`/user/admin/users/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete user");
    }
  });

  const openCreateModal = () => {
    setSelectedUser(null);
    setViewedUser(null);
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setRole("user");
    setIsVerified(true);
    setPlanId("");
    setIsOpen(true);
  };

  const openEditModal = (user) => {
    setViewedUser(null);
    setSelectedUser(user);
    setFirstName(user.firstName || "");
    setLastName(user.lastName || "");
    setEmail(user.email || "");
    setPassword("");
    setRole(user.role || "user");
    setIsVerified(user.isVerified ?? true);
    setPlanId(user.planId || "");
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedUser(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedUser) {
      updateMutation.mutate({
        id: selectedUser.id,
        userData: { firstName, lastName, role, isVerified, planId: planId || null }
      });
    } else {
      createMutation.mutate({
        firstName,
        lastName,
        email,
        password,
        role,
        planId: planId || null
      });
    }
  };

  const handleDelete = (id, email) => {
    if (window.confirm(`Are you sure you want to delete user ${email}?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleViewUser = (user) => {
    setViewedUser(user);
    setActiveTab("profile");
  };

  const users = usersData || [];
  const filteredUsers = users.filter((u) => {
    const term = search.toLowerCase();
    const fullName = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
    const emailStr = (u.email || "").toLowerCase();
    return fullName.includes(term) || emailStr.includes(term);
  });

  const getMediaUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${import.meta.env.VITE_IMG_URL || "http://localhost:3000/"}${url}`;
  };

  // Filter items for viewed user
  const userCampaigns = (campaignsData || []).filter(c => c.userId === viewedUser?.id);
  const userTasks = (tasksData || []).filter(t => t.userId === viewedUser?.id);
  const userInvoices = (invoicesData || []).filter(i => i.userId === viewedUser?.id);

  return (
    <div className="font-outfit p-1 text-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1A1A1A]">User Accounts</h1>
          <p className="text-slate-500 text-sm mt-1">Manage platform users, roles, and status.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="w-full sm:w-auto bg-Primary hover:bg-Primary/90 text-white font-bold py-3 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-Primary/20 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Add User
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-3xl p-6 mb-6 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="relative w-full md:max-w-md">
          <input
            type="text"
            placeholder="Search by name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 pl-11 focus:outline-none focus:ring-2 focus:ring-Primary/20 focus:border-Primary text-sm transition-all"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>
        <div className="text-slate-400 text-sm font-semibold">
          Total Users: {filteredUsers.length}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {isUsersLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-Primary animate-spin" />
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto w-full custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="py-3 px-4 md:py-4 md:px-6 text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400">User</th>
                  <th className="py-3 px-4 md:py-4 md:px-6 text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400">Email</th>
                  <th className="py-3 px-4 md:py-4 md:px-6 text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400">Role</th>
                  <th className="py-3 px-4 md:py-4 md:px-6 text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400">Plan</th>
                  <th className="py-3 px-4 md:py-4 md:px-6 text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400">Verified</th>
                  <th className="py-3 px-4 md:py-4 md:px-6 text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400">Joined</th>
                  <th className="py-3 px-4 md:py-4 md:px-6 text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="py-2.5 px-3 md:py-4 md:px-6 text-xs md:text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-Primary/5 flex items-center justify-center text-Primary font-bold text-xs md:text-sm">
                          {(user.firstName || "?")[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-xs md:text-sm">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-[10px] text-slate-400">{user.displayName || "No display name"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 md:py-4 md:px-6 font-semibold text-slate-600 text-xs md:text-sm">{user.email}</td>
                    <td className="py-2.5 px-3 md:py-4 md:px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold uppercase ${user.role === "admin" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"
                        }`}>
                        {user.role === "admin" ? <Shield className="w-3 h-3 md:w-3.5 md:h-3.5" /> : <User className="w-3 h-3 md:w-3.5 md:h-3.5" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 md:py-4 md:px-6 text-xs md:text-sm font-semibold">
                      <span className={`px-2 py-0.5 rounded-full font-bold ${user.plan?.title?.toUpperCase() === "FOUNDING MEMBER"
                          ? "bg-purple-50 text-purple-600 border border-purple-100"
                          : user.plan?.title?.toUpperCase() === "STANDARD"
                            ? "bg-blue-50 text-blue-600 border border-blue-100"
                            : "bg-slate-100 text-slate-500"
                        }`}>
                        {user.plan?.title || "FREE"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 md:py-4 md:px-6">
                      <span className={`text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full ${user.isVerified ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"
                        }`}>
                        {user.isVerified ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 md:py-4 md:px-6 text-slate-500 font-medium text-xs md:text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-3 md:py-4 md:px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="p-2 text-slate-500 hover:text-Primary hover:bg-slate-100 rounded-xl transition-all"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 text-slate-500 hover:text-Primary hover:bg-slate-100 rounded-xl transition-all"
                          title="Edit User"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {user.role !== "admin" && (
                          <button
                            onClick={() => handleDelete(user.id, user.email)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-400 font-medium">No users match your criteria.</p>
          </div>
        )}
      </div>

      {/* CREATE/EDIT MODAL */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999] p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md p-8 border border-slate-100 shadow-2xl relative">
            <button
              onClick={closeModal}
              className="absolute right-6 top-6 p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-extrabold text-[#1A1A1A] mb-2">
              {selectedUser ? "Update User" : "Create New User"}
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              {selectedUser ? "Modify role, verification, or profile names." : "Register a brand new user manually."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-Primary/20 focus:border-Primary text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-Primary/20 focus:border-Primary text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  disabled={!!selectedUser}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-Primary/20 focus:border-Primary text-sm transition-all disabled:opacity-60"
                />
              </div>

              {!selectedUser && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Defaults to 'user123'"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-Primary/20 focus:border-Primary text-sm transition-all"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">System Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-Primary/20 focus:border-Primary text-sm transition-all"
                  >
                    <option value="user">User / Creator</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                {selectedUser && (
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Verified</label>
                    <select
                      value={isVerified ? "true" : "false"}
                      onChange={(e) => setIsVerified(e.target.value === "true")}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-Primary/20 focus:border-Primary text-sm transition-all"
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Subscription Plan</label>
                <select
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-Primary/20 focus:border-Primary text-sm transition-all"
                >

                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} (${p.price} AUD {p.priceSuffix})
                    </option>
                  ))}
                </select>
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
                  className="flex-1 bg-Primary hover:bg-Primary/90 text-white font-bold py-3.5 rounded-xl text-center transition-all text-sm flex items-center justify-center gap-2"
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : selectedUser ? (
                    "Save Changes"
                  ) : (
                    "Create User"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* USER DETAIL & PORTFOLIO DRAWER */}
      {viewedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] flex justify-end">
          <div className="w-full max-w-4xl bg-[#FAFAFA] h-full shadow-2xl flex flex-col relative animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="bg-white p-4 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-Primary/5 flex items-center justify-center text-Primary text-lg md:text-xl font-bold">
                  {(viewedUser.firstName || "?")[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-slate-800">
                    {viewedUser.firstName} {viewedUser.lastName}
                  </h2>
                  <p className="text-xs text-slate-400">{viewedUser.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                {viewedUser.slug && (
                  <a
                    href={`${(import.meta.env.VITE_CLIENT_URL || "http://localhost:5173").replace(/\/$/, "")}/preview/${viewedUser.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] md:text-xs font-bold text-Primary border border-Primary/20 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 hover:bg-Primary/5"
                  >
                    View Public Page <ExternalLink className="w-3 h-3 md:w-3.5 md:h-3.5" />
                  </a>
                )}
                <button
                  onClick={() => setViewedUser(null)}
                  className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600 ml-auto sm:ml-0"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white border-b border-slate-100 px-4 md:px-6 flex gap-4 md:gap-6 overflow-x-auto custom-scrollbar whitespace-nowrap">
              {[
                { id: "profile", label: "Profile & Portfolio" },
                { id: "campaigns", label: `Campaigns (${userCampaigns.length})` },
                { id: "tasks", label: `Tasks (${userTasks.length})` },
                { id: "invoices", label: `Invoices (${userInvoices.length})` }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 md:py-4 text-xs md:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id
                      ? "border-Primary text-Primary"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
              {activeTab === "profile" && (
                <div className="space-y-6 md:space-y-8">
                  {/* Overview Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-100/80 shadow-sm md:col-span-2">
                      <h3 className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 md:mb-3">Bio / Description</h3>
                      <p className="text-xs md:text-sm font-medium text-slate-600 leading-relaxed">
                        {portfolioData?.profile?.shortBio || "No bio set by user."}
                      </p>
                    </div>
                    <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-100/80 shadow-sm">
                      <h3 className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 md:mb-3">Niche / Services</h3>
                      <p className="text-xs md:text-sm font-bold text-slate-700">
                        {portfolioData?.profile?.servicesOffered || "No niche/services listed."}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-100/80 shadow-sm animate-fade-in">
                    <h3 className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 md:mb-3">Subscription Plan</h3>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${viewedUser.plan?.title?.toUpperCase() === "FOUNDING MEMBER"
                          ? "bg-purple-50 text-purple-600 border border-purple-100"
                          : viewedUser.plan?.title?.toUpperCase() === "STANDARD"
                            ? "bg-blue-50 text-blue-600 border border-blue-100"
                            : "bg-slate-100 text-slate-500"
                        }`}>
                        {viewedUser.plan?.title || "FREE"}
                      </span>
                      {viewedUser.plan && (
                        <span className="text-xs font-medium text-slate-500">
                          Price: ${viewedUser.plan.price} AUD {viewedUser.plan.priceSuffix || "/ monthly"} | Campaign Limit: {viewedUser.plan.campaignLimit === 999999 ? "Unlimited" : viewedUser.plan.campaignLimit}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Social links */}
                  {portfolioData?.profile?.socialLinks && (
                    <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-100/80 shadow-sm">
                      <h3 className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 md:mb-4">Social Accounts</h3>
                      <div className="flex flex-wrap gap-4 md:gap-6">
                        {portfolioData.profile.socialLinks.instagram && (
                          <div className="flex items-center gap-2 text-xs md:text-sm font-semibold text-slate-600">
                            <Instagram className="w-3.5 h-3.5 md:w-4 md:h-4 text-pink-500" />
                            {portfolioData.profile.socialLinks.instagram}
                          </div>
                        )}
                        {portfolioData.profile.socialLinks.youtube && (
                          <div className="flex items-center gap-2 text-xs md:text-sm font-semibold text-slate-600">
                            <Youtube className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-500" />
                            {portfolioData.profile.socialLinks.youtube}
                          </div>
                        )}
                        {portfolioData.profile.socialLinks.website && (
                          <div className="flex items-center gap-2 text-xs md:text-sm font-semibold text-slate-600">
                            <Globe className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-500" />
                            {portfolioData.profile.socialLinks.website}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Portfolio Gallery */}
                  <div>
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 pb-2 border-b border-slate-100">
                      <h3 className="text-sm md:text-base font-bold text-slate-800">Portfolio Media Items</h3>
                      <form onSubmit={handleUploadPortfolioItem} className="flex flex-col sm:flex-row flex-wrap items-center gap-2 bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-xs w-full lg:w-auto">
                        <input
                          type="text"
                          required
                          placeholder="Title"
                          value={newPortfolioTitle}
                          onChange={(e) => setNewPortfolioTitle(e.target.value)}
                          className="bg-white border border-slate-100 rounded py-1.5 px-3 focus:outline-none w-full sm:w-auto flex-1"
                        />
                        <input
                          type="file"
                          required
                          onChange={(e) => setNewPortfolioFile(e.target.files[0])}
                          className="text-[10px] text-slate-500 w-full sm:w-auto py-1"
                        />
                        <button
                          type="submit"
                          disabled={isUploadingPortfolio || !newPortfolioFile || !newPortfolioTitle.trim()}
                          className="bg-Primary hover:bg-Primary/90 text-white font-bold py-1.5 px-3 rounded flex items-center justify-center gap-1 disabled:opacity-50 w-full sm:w-auto"
                        >
                          {isUploadingPortfolio ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                          Add Media
                        </button>
                      </form>
                    </div>

                    {isPortfolioLoading ? (
                      <div className="flex items-center justify-center py-10">
                        <Loader2 className="w-6 h-6 text-Primary animate-spin" />
                      </div>
                    ) : portfolioData?.portfolioItems && portfolioData.portfolioItems.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {portfolioData.portfolioItems.map((item) => (
                          <div key={item.id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="aspect-[4/3] bg-slate-900 flex items-center justify-center relative overflow-hidden">
                              {item.type === "video" ? (
                                <>
                                  <video src={getMediaUrl(item.url)} className="w-full h-full object-cover" />
                                  <div className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-lg text-white">
                                    <Video className="w-3.5 h-3.5" />
                                  </div>
                                </>
                              ) : (
                                <>
                                  <img src={getMediaUrl(item.url)} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                                  <div className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-lg text-white">
                                    <ImageIcon className="w-3.5 h-3.5" />
                                  </div>
                                </>
                              )}
                            </div>
                            <div className="p-4 flex items-center justify-between gap-2">
                              <div>
                                <h4 className="font-bold text-slate-800 text-sm truncate max-w-[130px]">{item.title}</h4>
                                <p className="text-[10px] text-slate-400 mt-0.5">{new Date(item.createdAt).toLocaleDateString()}</p>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleEditPortfolioTitle(item.id, item.title)}
                                  className="p-1 text-slate-400 hover:text-Primary hover:bg-slate-100 rounded"
                                  title="Edit Title"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeletePortfolioItem(item.id)}
                                  className="p-1 text-red-400 hover:text-red-650 hover:bg-red-50 rounded"
                                  title="Delete Media"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 bg-white border border-slate-100 rounded-2xl">
                        <p className="text-slate-400 text-sm font-medium">This creator has not uploaded any portfolio items.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "campaigns" && (
                <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm overflow-hidden">
                  {userCampaigns.length > 0 ? (
                    <div className="overflow-x-auto w-full custom-scrollbar">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50/50">
                            <th className="py-2.5 px-3 text-[10px] md:text-xs font-bold uppercase text-slate-400">Campaign</th>
                            <th className="py-2.5 px-3 text-[10px] md:text-xs font-bold uppercase text-slate-400">Brand</th>
                            <th className="py-2.5 px-3 text-[10px] md:text-xs font-bold uppercase text-slate-400">Amount</th>
                            <th className="py-2.5 px-3 text-[10px] md:text-xs font-bold uppercase text-slate-400">Deadline</th>
                            <th className="py-2.5 px-3 text-[10px] md:text-xs font-bold uppercase text-slate-400">Status</th>
                            <th className="py-2.5 px-3 text-[10px] md:text-xs font-bold uppercase text-slate-400 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {userCampaigns.map((c) => (
                            <tr key={c.id}>
                              <td className="py-2 px-3 font-bold text-slate-800 text-xs">{c.name}</td>
                              <td className="py-2 px-3 font-semibold text-slate-600 text-xs">{c.brandName}</td>
                              <td className="py-2 px-3 font-bold text-slate-800 text-xs">{c.amount}</td>
                              <td className="py-2 px-3 text-slate-500 text-[11px]">{c.deadline}</td>
                              <td className="py-2 px-3">
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600`}>
                                  {c.status}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-center">
                                <Link
                                  to={`/dashboard/campaigns/${c.id}`}
                                  className="inline-flex items-center justify-center p-1 text-slate-400 hover:text-Primary hover:bg-slate-100 rounded transition-all"
                                  title="View Campaign"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Folder className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                      <p className="text-slate-400 text-sm">No campaigns associated with this user.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "tasks" && (
                <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm overflow-hidden">
                  {userTasks.length > 0 ? (
                    <div className="overflow-x-auto w-full custom-scrollbar">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50/50">
                            <th className="py-2.5 px-3 text-[10px] md:text-xs font-bold uppercase text-slate-400">Task Name</th>
                            <th className="py-2.5 px-3 text-[10px] md:text-xs font-bold uppercase text-slate-400">Campaign</th>
                            <th className="py-2.5 px-3 text-[10px] md:text-xs font-bold uppercase text-slate-400">Due Date</th>
                            <th className="py-2.5 px-3 text-[10px] md:text-xs font-bold uppercase text-slate-400">Completed</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {userTasks.map((t) => (
                            <tr key={t.id}>
                              <td className="py-2 px-3 font-bold text-slate-800 text-xs">{t.name}</td>
                              <td className="py-2 px-3 font-semibold text-slate-600 text-xs">{t.campaign}</td>
                              <td className="py-2 px-3 text-slate-500 text-[11px]">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                  {new Date(t.date).toLocaleDateString()}
                                </div>
                              </td>
                              <td className="py-2 px-3">
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${t.completed ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"
                                  }`}>
                                  {t.completed ? "Completed" : "Pending"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Calendar className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                      <p className="text-slate-400 text-sm">No tasks scheduled in planner.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "invoices" && (
                <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm overflow-hidden">
                  {userInvoices.length > 0 ? (
                    <div className="overflow-x-auto w-full custom-scrollbar">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50/50">
                            <th className="py-2.5 px-3 text-[10px] md:text-xs font-bold uppercase text-slate-400">Invoice No</th>
                            <th className="py-2.5 px-3 text-[10px] md:text-xs font-bold uppercase text-slate-400">Campaign</th>
                            <th className="py-2.5 px-3 text-[10px] md:text-xs font-bold uppercase text-slate-400">Amount</th>
                            <th className="py-2.5 px-3 text-[10px] md:text-xs font-bold uppercase text-slate-400">Due Date</th>
                            <th className="py-2.5 px-3 text-[10px] md:text-xs font-bold uppercase text-slate-400">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {userInvoices.map((i) => (
                            <tr key={i.id}>
                              <td className="py-2 px-3 font-bold text-slate-800 text-xs">{i.invoiceNo}</td>
                              <td className="py-2 px-3 font-semibold text-slate-600 text-xs">{i.campaignName}</td>
                              <td className="py-2 px-3 font-bold text-slate-800 text-xs">{i.amount}</td>
                              <td className="py-2 px-3 text-slate-500 text-[11px]">{new Date(i.dueDate).toLocaleDateString()}</td>
                              <td className="py-2 px-3">
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${i.status === "Paid" ? "bg-green-50 text-green-600" :
                                    i.status === "Overdue" ? "bg-red-50 text-red-600" :
                                      "bg-yellow-50 text-yellow-600"
                                  }`}>
                                  {i.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                      <p className="text-slate-400 text-sm">No invoices found for this user.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
