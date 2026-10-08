import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  CheckCircle,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  Loader2,
  Upload,
  ExternalLink,
  ChevronDown,
  X,
  Copy,
  Check,
  Star,
  User,
  Clock,
  Download,
  Link2,
  Lock,
  Unlock,
  RefreshCw,
  Eye,
  CloudUpload,
  Paperclip,
  ListChecks,
  ClipboardList,
  StickyNote,
} from "lucide-react";
import { toast } from "react-toastify";

const STAGES = [
  "📝 Scripted",
  "🎥 Filmed",
  "✂️ Edited",
  "🎙️ Voiceover Complete",
  "✅ Completed",
  "📦 Delivered",
  "👍 Approved",
];

const STAGE_CONFIGS = {
  "📝 Scripted": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  "🎥 Filmed": { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
  "✂️ Edited": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  "🎙️ Voiceover Complete": { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
  "✅ Completed": { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  "📦 Delivered": { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" },
  "👍 Approved": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
};

const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const axiosSecure = useAxiosSecure();

  const [activeTab, setActiveTab] = useState("Overview"); // "Overview" | "Brand View History"
  const [mediaTab, setMediaTab] = useState("all"); // "all" | "pending" | "approved" | "changes_requested"
  const [copiedLink, setCopiedLink] = useState(false);

  // Form & Interaction States
  const [showDeliverableInput, setShowDeliverableInput] = useState(false);
  const [newDeliverableText, setNewDeliverableText] = useState("");

  const [showTaskInput, setShowTaskInput] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskDate, setNewTaskDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const [newComment, setNewComment] = useState("");

  // Feedback Chat
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackFile, setFeedbackFile] = useState(null);
  const [feedbackSending, setFeedbackSending] = useState(false);
  const feedbackFileInputRef = useRef(null);

  // Document Upload
  const [documentFile, setDocumentFile] = useState(null);
  const [documentLoading, setDocumentLoading] = useState(false);
  const documentFileRef = useRef(null);

  // Upload Modal for Media
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [pendingUploadFiles, setPendingUploadFiles] = useState([]);
  const [uploadData, setUploadData] = useState({ title: "", description: "", assetType: "Video" });
  const [mediaUploading, setMediaUploading] = useState(false);
  const mediaFileRef = useRef(null);

  // Replace Modal
  const [replaceModalOpen, setReplaceModalOpen] = useState(false);
  const [replaceTargetId, setReplaceTargetId] = useState(null);
  const [replaceFile, setReplaceFile] = useState(null);
  const [replaceData, setReplaceData] = useState({ title: "", description: "", assetType: "Video" });
  const [replaceLoading, setReplaceLoading] = useState(false);
  const replaceFileRef = useRef(null);

  // Preview Modal
  const [previewMedia, setPreviewMedia] = useState(null);

  // Request Changes Modal
  const [changeRequestMediaId, setChangeRequestMediaId] = useState(null);
  const [changeRequestText, setChangeRequestText] = useState("");
  const [changeRequestLoading, setChangeRequestLoading] = useState(false);

  // Active Dropdown
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [loadingApproveId, setLoadingApproveId] = useState(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".progress-dropdown-container")) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch campaign
  const { data: campaign, isLoading, refetch } = useQuery({
    queryKey: ["adminCampaignDetails", id],
    queryFn: async () => {
      const res = await axiosSecure.get(`/ugc-campaigns/${id}`);
      return res.data?.data || null;
    },
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: async (campaignData) => {
      const res = await axiosSecure.patch(`/ugc-campaigns/${id}`, campaignData);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Campaign updated successfully");
      queryClient.invalidateQueries({ queryKey: ["adminCampaignDetails", id] });
      queryClient.invalidateQueries({ queryKey: ["adminInvoices"] });
      queryClient.invalidateQueries({ queryKey: ["adminCampaigns"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboardStats"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update campaign");
    },
  });

  const handleStatusChange = (status) => {
    updateMutation.mutate({ status });
  };

  const handlePaymentStatusChange = (paymentStatus) => {
    updateMutation.mutate({ paymentStatus });
  };

  const handleToggleLock = () => {
    updateMutation.mutate({ shareEnabled: !campaign.shareEnabled });
  };

  const handleRegenerateLink = () => {
    if (window.confirm("Are you sure you want to regenerate the shareable link? The old link will expire immediately.")) {
      updateMutation.mutate({ regenerateShareToken: true });
    }
  };

  const handleReleaseFiles = () => {
    updateMutation.mutate({ releaseFiles: true, status: "Completed" });
  };

  const handleUnreleaseFiles = () => {
    updateMutation.mutate({ releaseFiles: false, status: "Approved" });
  };

  // Deliverables operations
  const addDeliverable = async (e) => {
    e.preventDefault();
    if (!newDeliverableText.trim()) return;
    try {
      await axiosSecure.post(`/ugc-campaigns/${id}/deliverables`, { text: newDeliverableText.trim() });
      toast.success("Deliverable added");
      setNewDeliverableText("");
      setShowDeliverableInput(false);
      refetch();
    } catch (err) {
      toast.error("Failed to add deliverable");
    }
  };

  const deleteDeliverable = async (delId) => {
    if (!window.confirm("Are you sure you want to delete this deliverable?")) return;
    try {
      await axiosSecure.delete(`/ugc-campaigns/${id}/deliverables/${delId}`);
      toast.success("Deliverable deleted");
      refetch();
    } catch (err) {
      toast.error("Failed to delete deliverable");
    }
  };

  const handleToggleStage = async (itemId, stage, currentProgress) => {
    let newProgress;
    if (currentProgress.includes(stage)) {
      newProgress = currentProgress.filter((s) => s !== stage);
    } else {
      newProgress = [...currentProgress, stage];
    }
    try {
      await axiosSecure.patch(`/ugc-campaigns/${id}/deliverables/${itemId}`, { progress: newProgress });
      refetch();
    } catch (err) {
      toast.error("Failed to update deliverable progress");
    }
  };

  // Tasks operations
  const addTask = async (e) => {
    e.preventDefault();
    if (!newTaskName.trim() || !newTaskDate) return;
    try {
      await axiosSecure.post(`/ugc-campaigns/${id}/tasks`, { name: newTaskName.trim(), date: newTaskDate });
      toast.success("Task added");
      setNewTaskName("");
      setShowTaskInput(false);
      refetch();
    } catch (err) {
      toast.error("Failed to add task");
    }
  };

  const toggleTask = async (taskId, currentCompleted) => {
    try {
      await axiosSecure.patch(`/ugc-campaigns/${id}/tasks/${taskId}`, { completed: !currentCompleted });
      refetch();
    } catch (err) {
      toast.error("Failed to toggle task");
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await axiosSecure.delete(`/ugc-campaigns/${id}/tasks/${taskId}`);
      toast.success("Task deleted");
      refetch();
    } catch (err) {
      toast.error("Failed to delete task");
    }
  };

  // Media operations
  const handleFileDropSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setPendingUploadFiles(files);
    setUploadData({
      title: files[0]?.name || "",
      description: "Uploaded deliverable file",
      assetType: files[0]?.type?.startsWith("video") ? "Video" : "Photo",
    });
    setUploadModalOpen(true);
    if (mediaFileRef.current) mediaFileRef.current.value = "";
  };

  const handleMediaUploadSubmit = async (e) => {
    e.preventDefault();
    if (pendingUploadFiles.length === 0) return;
    setMediaUploading(true);
    try {
      for (const file of pendingUploadFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", uploadData.title || file.name);
        formData.append("description", uploadData.description || "Uploaded by Administrator");
        formData.append("assetType", uploadData.assetType || "Video");

        await axiosSecure.post(`/ugc-campaigns/${id}/media`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      toast.success("Media uploaded successfully");
      setUploadModalOpen(false);
      setPendingUploadFiles([]);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload media");
    } finally {
      setMediaUploading(false);
    }
  };

  const openReplaceModal = (item) => {
    setReplaceTargetId(item.id);
    setReplaceFile(null);
    setReplaceData({
      title: item.name || "",
      description: item.description || "",
      assetType: item.assetType || "Video",
    });
    setReplaceModalOpen(true);
  };

  const handleReplaceSubmit = async (e) => {
    e.preventDefault();
    if (!replaceTargetId) return;
    setReplaceLoading(true);
    try {
      const formData = new FormData();
      if (replaceFile) {
        formData.append("file", replaceFile);
      }
      formData.append("title", replaceData.title);
      formData.append("description", replaceData.description);
      formData.append("assetType", replaceData.assetType);

      await axiosSecure.patch(`/ugc-campaigns/${id}/media/${replaceTargetId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Media updated successfully");
      setReplaceModalOpen(false);
      setReplaceFile(null);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to replace media");
    } finally {
      setReplaceLoading(false);
    }
  };

  const approveMedia = async (mediaId) => {
    try {
      setLoadingApproveId(mediaId);
      await axiosSecure.patch(`/ugc-campaigns/public/${campaign.slug}/media/${mediaId}/status`);
      toast.success("File marked as Approved!");
      refetch();
    } catch (err) {
      toast.error("Failed to approve media");
    } finally {
      setLoadingApproveId(null);
    }
  };

  const submitChangeRequest = async (e) => {
    e.preventDefault();
    if (!changeRequestMediaId || !changeRequestText.trim()) return;
    setChangeRequestLoading(true);
    try {
      await axiosSecure.post(`/ugc-campaigns/public/${campaign.slug}/media/${changeRequestMediaId}/request-changes`, {
        text: changeRequestText.trim(),
      });
      toast.success("Change request submitted");
      setChangeRequestMediaId(null);
      setChangeRequestText("");
      refetch();
    } catch (err) {
      toast.error("Failed to submit change request");
    } finally {
      setChangeRequestLoading(false);
    }
  };

  const deleteMedia = async (mediaId) => {
    if (!window.confirm("Are you sure you want to delete this media content?")) return;
    try {
      await axiosSecure.delete(`/ugc-campaigns/${id}/media/${mediaId}`);
      toast.success("Media item deleted");
      refetch();
    } catch (err) {
      toast.error("Failed to delete media");
    }
  };

  // Feedback messaging
  const handleSendFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackMessage.trim() && !feedbackFile) return;
    setFeedbackSending(true);
    try {
      const formData = new FormData();
      formData.append("text", feedbackMessage.trim());
      if (feedbackFile) {
        formData.append("file", feedbackFile);
      }
      await axiosSecure.post(`/ugc-campaigns/${id}/feedback`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Message sent");
      setFeedbackMessage("");
      setFeedbackFile(null);
      if (feedbackFileInputRef.current) feedbackFileInputRef.current.value = "";
      refetch();
    } catch (err) {
      toast.error("Failed to post message");
    } finally {
      setFeedbackSending(false);
    }
  };

  // Document upload
  const handleDocumentUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocumentLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await axiosSecure.post(`/ugc-campaigns/${id}/documents`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Document uploaded successfully");
      if (documentFileRef.current) documentFileRef.current.value = "";
      refetch();
    } catch (err) {
      toast.error("Failed to upload document");
    } finally {
      setDocumentLoading(false);
    }
  };

  const deleteDocument = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      await axiosSecure.delete(`/ugc-campaigns/${id}/documents/${docId}`);
      toast.success("Document deleted");
      refetch();
    } catch (err) {
      toast.error("Failed to delete document");
    }
  };

  // Notes operations
  const addNote = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await axiosSecure.post(`/ugc-campaigns/${id}/notes`, { text: newComment.trim() });
      toast.success("Note added");
      setNewComment("");
      refetch();
    } catch (err) {
      toast.error("Failed to add note");
    }
  };

  const deleteNote = async (noteId) => {
    if (!window.confirm("Delete this internal note?")) return;
    try {
      await axiosSecure.delete(`/ugc-campaigns/${id}/notes/${noteId}`);
      toast.success("Note deleted");
      refetch();
    } catch (err) {
      toast.error("Failed to delete note");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-Primary animate-spin" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-20 bg-white border border-gray-100 rounded-3xl">
        <p className="text-gray-400 font-medium">Campaign not found</p>
      </div>
    );
  }

  const allMediaApproved =
    campaign.media &&
    campaign.media.length > 0 &&
    campaign.media.every((m) => m.status === "approved");

  const clientUrl = (import.meta.env.VITE_CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");
  const shareLink = `${clientUrl}/brand-view/${campaign.shareToken || campaign.slug}`;

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopiedLink(true);
    toast.success("Brand link copied to clipboard");
    if (campaign.status === "Draft") {
      updateMutation.mutate({ status: "Under Review" });
    }
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const getMediaUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${import.meta.env.VITE_IMG_URL || "http://localhost:3000/"}${url}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "No date set";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const mediaList = campaign.media || [];
  const filteredMedia = mediaList.filter((item) => {
    if (mediaTab === "all") return true;
    if (mediaTab === "pending") return item.status === "pending" || item.status === "in_review";
    return item.status === mediaTab;
  });

  return (
    <div className="font-outfit text-slate-800 pb-16 w-full py-2">
      {/* Top Back Navigation & Creator Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <button
          onClick={() => navigate("/dashboard/campaigns")}
          className="flex items-center gap-2 text-gray-500 hover:text-[#1A1A1A] transition-colors group cursor-pointer text-sm font-semibold w-fit"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Campaigns</span>
        </button>

        {campaign.user && (
          <div className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-2xl text-xs font-semibold text-slate-700 shadow-2xs">
            <div className="w-6 h-6 rounded-full bg-Primary/10 text-Primary flex items-center justify-center font-bold">
              <User className="w-3.5 h-3.5" />
            </div>
            <span>
              Creator: <strong>{campaign.user.firstName} {campaign.user.lastName}</strong> ({campaign.user.email})
            </span>
          </div>
        )}
      </div>

      {/* Verification & Release Banner */}
      {allMediaApproved && (
        <div className="mb-6 p-5 bg-green-50 border border-green-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <h4 className="text-sm font-bold text-green-800 flex items-center gap-2">
              🎉 All Content Verified & Approved!
            </h4>
            <p className="text-xs text-green-700/90 mt-1">
              The brand client has verified all content uploads. You can now safely release the files for high-res download.
            </p>
          </div>
          {!campaign.releaseFiles ? (
            <button
              onClick={handleReleaseFiles}
              disabled={updateMutation.isPending}
              className="bg-green-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-green-700 transition-all shadow-md shadow-green-200 cursor-pointer shrink-0 disabled:opacity-60 flex items-center gap-1.5"
            >
              {updateMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{updateMutation.isPending ? "Releasing..." : "Release Files Now"}</span>
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-green-700 bg-white border border-green-200 px-4 py-2 rounded-xl">
                Files Released ✓
              </span>
              <button
                onClick={handleUnreleaseFiles}
                className="text-xs text-rose-500 hover:underline font-bold cursor-pointer"
              >
                Revoke Release
              </button>
            </div>
          )}
        </div>
      )}

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1A1A1A]">{campaign.name}</h1>
          <select
            value={campaign.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className={`text-xs font-bold px-3 py-1 rounded-full border outline-none cursor-pointer transition-all ${
              campaign.status === "Pending"
                ? "bg-yellow-50 text-yellow-600 border-yellow-200"
                : campaign.status === "Draft"
                ? "bg-gray-100 text-gray-500 border-gray-200"
                : campaign.status === "Under Review"
                ? "bg-orange-50 text-orange-500 border-orange-200"
                : campaign.status === "Approved" || campaign.status === "Completed"
                ? "bg-green-50 text-green-600 border-green-200"
                : "bg-blue-50 text-Primary border-blue-200"
            }`}
          >
            <option value="Draft">Draft</option>
            <option value="Pending">Pending</option>
            <option value="Active">Active</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Completed">Completed</option>
          </select>

          {campaign.rating && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-50 border border-yellow-100">
              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
              <span className="text-xs font-bold text-yellow-700">{campaign.rating}.0 Client Rating</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs md:text-sm text-gray-500 font-medium mb-8 flex-wrap">
        <span>Brand: <strong className="text-slate-800">{campaign.brandName || "General"}</strong></span>
        <span>•</span>
        <span>Due {formatDate(campaign.deadline)}</span>
        <span>•</span>
        <span>Budget: <strong className="text-slate-800">${parseFloat(campaign.amount || 0).toLocaleString()}</strong></span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 mb-8 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setActiveTab("Overview")}
          className={`px-6 py-2.5 rounded-[100px] text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "Overview"
              ? "bg-[#0084FF] text-white shadow-md"
              : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("Brand View History")}
          className={`px-6 py-2.5 rounded-[100px] text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "Brand View History"
              ? "bg-[#0084FF] text-white shadow-md"
              : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
          }`}
        >
          Brand View History
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "Overview" && (
        <div className="space-y-6">
          {/* 1. Campaign Link Card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-Primary/5 rounded-xl flex items-center justify-center">
                <Link2 className="w-5 h-5 text-Primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1A1A1A]">Campaign Link</h3>
                <p className="text-xs text-gray-400">The brand can view updates in real time with this link</p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
              <span className="text-sm text-gray-500 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100 truncate flex-1 min-w-0">
                {campaign.shareEnabled ? shareLink : "Link is locked and disabled."}
              </span>

              <button
                onClick={handleToggleLock}
                disabled={updateMutation.isPending}
                title={campaign.shareEnabled ? "Lock Link" : "Unlock Link"}
                className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                  campaign.shareEnabled
                    ? "bg-gray-100 hover:bg-gray-200 text-gray-600"
                    : "bg-red-100 text-red-600 hover:bg-red-200"
                }`}
              >
                {campaign.shareEnabled ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
              </button>

              <button
                onClick={handleRegenerateLink}
                disabled={updateMutation.isPending}
                title="Regenerate Link"
                className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-5 h-5 ${updateMutation.isPending ? "animate-spin" : ""}`} />
              </button>

              <a
                href={shareLink}
                target="_blank"
                rel="noreferrer"
                title="Open Brand Review Page"
                className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all cursor-pointer"
              >
                <ExternalLink className="w-5 h-5" />
              </a>

              <button
                onClick={handleCopyShareLink}
                disabled={!campaign.shareEnabled}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                  copiedLink ? "bg-green-500 text-white" : "bg-Primary text-white hover:bg-Primary/90"
                }`}
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
              </button>
            </div>
          </div>

          {/* 2. Brand Feedback Thread */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5 border-b border-gray-50 pb-4">
              <div className="w-10 h-10 bg-Primary/5 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-Primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1A1A1A]">Brand Feedback</h3>
                <p className="text-xs text-gray-400">Collaborate and resolve revision requests</p>
              </div>
            </div>

            {/* Quick Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col justify-between">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2 block">
                  Campaign Status
                </label>
                <select
                  value={campaign.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 focus:outline-none focus:border-Primary text-xs font-bold text-[#1A1A1A] cursor-pointer"
                >
                  <option value="Pending">Pending</option>
                  <option value="Draft">Draft</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col justify-between">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2 block">
                  Download Lock Status
                </label>
                <button
                  onClick={campaign.releaseFiles ? handleUnreleaseFiles : handleReleaseFiles}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    campaign.releaseFiles
                      ? "bg-green-50 text-green-600 border-green-200 hover:bg-green-100/60"
                      : "bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100/60"
                  }`}
                >
                  {campaign.releaseFiles ? "Files Released (Downloads Unlocked)" : "Files Locked (Review Mode)"}
                </button>
              </div>
            </div>

            {/* Messages Thread */}
            <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2 mb-4 custom-scrollbar">
              {campaign.feedback?.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-4 rounded-2xl max-w-[85%] ${
                    msg.from === "brand"
                      ? "bg-gray-50 border border-gray-100 mr-auto text-slate-800"
                      : "bg-Primary/10 border border-Primary/20 ml-auto text-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-Primary">
                      {msg.from === "brand" ? "Brand Client" : "Creator / Admin"}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-xs font-medium leading-relaxed break-words">{msg.text}</p>
                  {msg.fileUrl && (
                    <a
                      href={getMediaUrl(msg.fileUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-Primary mt-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Attached File</span>
                    </a>
                  )}
                </div>
              ))}

              {(!campaign.feedback || campaign.feedback.length === 0) && (
                <div className="text-center py-8 text-gray-400 text-xs font-medium">
                  No feedback messages in this thread.
                </div>
              )}
            </div>

            {/* Send Feedback Message Input */}
            <form onSubmit={handleSendFeedback} className="flex flex-col gap-2 pt-3 border-t border-gray-100">
              {feedbackFile && (
                <div className="flex items-center justify-between bg-Primary/5 px-3 py-1.5 rounded-xl text-xs text-Primary font-semibold">
                  <span className="truncate max-w-[300px]">Attached: {feedbackFile.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFeedbackFile(null);
                      if (feedbackFileInputRef.current) feedbackFileInputRef.current.value = "";
                    }}
                    className="text-rose-500 hover:text-rose-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={feedbackFileInputRef}
                  onChange={(e) => setFeedbackFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => feedbackFileInputRef.current?.click()}
                  className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-xl border border-gray-200 transition-colors cursor-pointer"
                  title="Attach file"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  placeholder="Type a message or response..."
                  className="flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded-xl py-2 px-4 text-xs focus:outline-none focus:border-Primary"
                />
                <button
                  type="submit"
                  disabled={feedbackSending || (!feedbackMessage.trim() && !feedbackFile)}
                  className="bg-Primary hover:bg-Primary/90 text-white rounded-xl px-5 py-2 text-xs font-bold disabled:opacity-50 cursor-pointer transition-all shrink-0"
                >
                  {feedbackSending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send"}
                </button>
              </div>
            </form>
          </div>

          {/* 3. Deliverables Checklist */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-3 mb-5">
              <div className="w-10 h-10 bg-Primary/5 rounded-xl flex items-center justify-center shrink-0">
                <ListChecks className="w-5 h-5 text-Primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1A1A1A]">Deliverables</h3>
                <p className="text-xs text-gray-400 font-medium mt-0.5">Campaign deliverable requirements</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {campaign.deliverables?.length > 0 ? (
                campaign.deliverables.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 group relative min-h-[52px] gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center flex-wrap gap-2">
                        <span className="text-sm text-[#1A1A1A] font-semibold break-words">{item.text}</span>
                        {item.progress && item.progress.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.progress.map((stage) => {
                              const config = STAGE_CONFIGS[stage] || {
                                bg: "bg-gray-100",
                                text: "text-gray-600",
                                border: "border-gray-200",
                              };
                              return (
                                <span
                                  key={stage}
                                  className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${config.bg} ${config.text} ${config.border}`}
                                >
                                  {stage}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 relative progress-dropdown-container">
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === item.id ? null : item.id)}
                        className="flex items-center gap-1 text-[11px] font-bold text-gray-600 hover:text-Primary bg-white border border-gray-200 hover:border-Primary px-2.5 py-1.5 rounded-lg shadow-2xs transition-all cursor-pointer"
                      >
                        <span>Update Stage</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>

                      {activeDropdown === item.id && (
                        <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-1.5 animate-in fade-in">
                          {STAGES.map((stage) => {
                            const isSelected = (item.progress || []).includes(stage);
                            return (
                              <button
                                key={stage}
                                onClick={() => handleToggleStage(item.id, stage, item.progress || [])}
                                className="w-full flex items-center justify-between text-left px-2.5 py-1.5 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-gray-700"
                              >
                                <span>{stage}</span>
                                {isSelected ? (
                                  <Check className="w-3.5 h-3.5 text-Primary" />
                                ) : (
                                  <div className="w-3.5 h-3.5 border border-gray-300 rounded" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      <button
                        onClick={() => deleteDeliverable(item.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all cursor-pointer p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 font-medium py-2">No deliverables specified</p>
              )}
            </div>

            {showDeliverableInput ? (
              <form onSubmit={addDeliverable} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={newDeliverableText}
                  onChange={(e) => setNewDeliverableText(e.target.value)}
                  placeholder="e.g. 1x TikTok Video"
                  className="flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-Primary"
                />
                <button
                  type="submit"
                  className="bg-Primary hover:bg-Primary/90 text-white rounded-xl px-4 font-bold text-xs shrink-0 cursor-pointer shadow-2xs"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeliverableInput(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl px-3 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <button
                onClick={() => setShowDeliverableInput(true)}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-Primary font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add deliverable requirement</span>
              </button>
            )}
          </div>

          {/* 4. Campaign Tasks */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-3 mb-5">
              <div className="w-10 h-10 bg-Primary/5 rounded-xl flex items-center justify-center shrink-0">
                <ClipboardList className="w-5 h-5 text-Primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1A1A1A]">Campaign Tasks</h3>
                <p className="text-xs text-gray-400 font-medium mt-0.5">Remain organised create a task list</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {campaign.tasks?.length > 0 ? (
                campaign.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3.5 group"
                  >
                    <div className="flex items-center gap-3 text-left min-w-0">
                      <button
                        onClick={() => toggleTask(task.id, task.completed)}
                        className="transition-all cursor-pointer shrink-0"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-Primary" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-300 hover:text-Primary transition-colors" />
                        )}
                      </button>
                      <span
                        className={`text-sm font-semibold truncate ${
                          task.completed ? "text-gray-400 line-through" : "text-[#1A1A1A]"
                        }`}
                      >
                        {task.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-gray-400 font-medium">{formatDate(task.date)}</span>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 font-medium py-2">No tasks added yet.</p>
              )}
            </div>

            {showTaskInput ? (
              <form onSubmit={addTask} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  required
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  placeholder="Task title..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-Primary"
                />
                <input
                  type="date"
                  required
                  value={newTaskDate}
                  onChange={(e) => setNewTaskDate(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-Primary cursor-pointer"
                />
                <button
                  type="submit"
                  className="bg-Primary hover:bg-Primary/90 text-white rounded-xl px-4 py-2 font-bold text-xs shrink-0 cursor-pointer shadow-2xs"
                >
                  Create Task
                </button>
                <button
                  type="button"
                  onClick={() => setShowTaskInput(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl px-3 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <button
                onClick={() => setShowTaskInput(true)}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-Primary font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add task</span>
              </button>
            )}
          </div>

          {/* 5. Content Gallery (UGC Deliverable Files) */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3 mb-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-Primary/5 rounded-xl flex items-center justify-center shrink-0">
                  <ImageIcon className="w-5 h-5 text-Primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1A1A1A]">Content Gallery</h3>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">
                    Upload deliverables here for brand to see via their unique link
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-gray-400">Files: {mediaList.length}</span>
            </div>

            {/* Hidden Input for uploads */}
            <input
              ref={mediaFileRef}
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileDropSelect}
            />

            {/* Upload Drag & Drop Area */}
            <div
              onClick={() => mediaFileRef.current?.click()}
              className="border-2 border-dashed border-Primary/20 rounded-2xl p-8 flex flex-col items-center justify-center bg-Primary/[0.02] cursor-pointer hover:bg-Primary/[0.04] transition-all group mb-6"
            >
              <CloudUpload className="w-8 h-8 text-Primary/40 mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-sm text-gray-400">Drag & drop files here</p>
              <p className="text-xs text-gray-300 italic my-1">or</p>
              <span className="text-Primary text-sm font-bold underline underline-offset-4">Choose files</span>
            </div>

            {/* Segmented Filter Tabs */}
            {mediaList.length > 0 && (
              <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
                {[
                  { key: "all", label: "All Content", count: mediaList.length },
                  {
                    key: "pending",
                    label: "Pending Review",
                    count: mediaList.filter((m) => m.status === "pending" || m.status === "in_review").length,
                  },
                  {
                    key: "approved",
                    label: "Approved",
                    count: mediaList.filter((m) => m.status === "approved").length,
                  },
                  {
                    key: "changes_requested",
                    label: "Needs Changes",
                    count: mediaList.filter((m) => m.status === "changes_requested").length,
                  },
                ].map((tab) => {
                  const isActive = mediaTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setMediaTab(tab.key)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isActive
                          ? "bg-Primary text-white shadow-xs"
                          : "bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                          isActive ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Uploaded Media Cards Grid */}
            {filteredMedia.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
                {filteredMedia.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-100 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between bg-white hover:shadow-md transition-shadow group"
                  >
                    {/* Media Thumbnail Container */}
                    <div className="aspect-video bg-slate-900 flex items-center justify-center relative overflow-hidden">
                      {item.type === "video" ? (
                        <video src={getMediaUrl(item.url)} className="w-full h-full object-cover" />
                      ) : (
                        <img
                          src={getMediaUrl(item.url)}
                          alt={item.name}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      )}

                      {/* Status Tag */}
                      <span
                        className={`absolute top-2.5 left-2.5 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full text-white shadow ${
                          item.status === "approved"
                            ? "bg-emerald-600"
                            : item.status === "changes_requested"
                            ? "bg-rose-500"
                            : "bg-amber-500"
                        }`}
                      >
                        {item.status.toUpperCase()}
                      </span>

                      {/* Hover Overlay Button to Preview */}
                      <div
                        onClick={() => setPreviewMedia(item)}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                      >
                        <span className="bg-white/90 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl shadow flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-Primary" />
                          <span>Preview</span>
                        </span>
                      </div>
                    </div>

                    {/* Metadata & Actions */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h4 className="font-bold text-xs text-slate-800 line-clamp-1">{item.name}</h4>
                          {item.assetType && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-Primary/10 text-Primary border border-Primary/10">
                              {item.assetType}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1 leading-relaxed line-clamp-2">
                          {item.description || "No description provided."}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1">
                          <a
                            href={getMediaUrl(item.url)}
                            download
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-gray-400 hover:text-Primary hover:bg-gray-50 rounded-lg transition-colors"
                            title="Download Deliverable"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => openReplaceModal(item)}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Replace / Edit File"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteMedia(item.id)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Deliverable"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {item.status !== "approved" && (
                            <button
                              onClick={() => approveMedia(item.id)}
                              disabled={loadingApproveId === item.id}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1 shadow-2xs disabled:opacity-50 cursor-pointer"
                            >
                              {loadingApproveId === item.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <CheckCircle className="w-3 h-3" />
                              )}
                              <span>Approve</span>
                            </button>
                          )}

                          {item.status !== "changes_requested" && (
                            <button
                              onClick={() => {
                                setChangeRequestMediaId(item.id);
                                setChangeRequestText(`Please make adjustments to ${item.name}...`);
                              }}
                              className="border border-rose-200 text-rose-600 hover:bg-rose-50 text-[10px] font-bold px-2.5 py-1.5 rounded-xl cursor-pointer"
                            >
                              Request Changes
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed border-gray-200 rounded-2xl mb-6">
                <p className="text-gray-400 text-xs font-semibold">No media deliverables uploaded yet.</p>
              </div>
            )}

            {/* Download Lock Notice Card */}
            <div
              className={`rounded-xl p-4 border transition-all ${
                campaign.releaseFiles ? "bg-green-50 border-green-100" : "bg-orange-50 border-orange-100"
              }`}
            >
              <h4 className="text-sm font-bold text-[#1A1A1A] mb-1">
                {campaign.releaseFiles ? "Downloads are unlocked for brand" : "Downloads are locked for brand"}
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                {campaign.releaseFiles
                  ? "Files have been released. The brand can download all content and documents directly."
                  : 'After brand approval, select "Release Files" to allow downloads. The brand can view but not download content until released.'}
              </p>
            </div>
          </div>

          {/* 6. Reference Documents */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-3 mb-5">
              <div className="w-10 h-10 bg-Primary/5 rounded-xl flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-Primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1A1A1A]">Reference Documents</h3>
                <p className="text-xs text-gray-400 font-medium mt-0.5">Brand briefs, contracts and reference files</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {campaign.documents?.length > 0 ? (
                campaign.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 group"
                  >
                    <div className="flex items-center gap-3 truncate min-w-0">
                      <FileText className="w-4 h-4 text-Primary shrink-0" />
                      <a
                        href={getMediaUrl(doc.url)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-slate-800 truncate hover:text-Primary hover:underline"
                      >
                        {doc.name}
                      </a>
                    </div>
                    <button
                      onClick={() => deleteDocument(doc.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all cursor-pointer p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 font-medium py-2">No reference documents uploaded.</p>
              )}
            </div>

            <input
              ref={documentFileRef}
              type="file"
              className="hidden"
              onChange={handleDocumentUpload}
            />
            <button
              onClick={() => documentFileRef.current?.click()}
              disabled={documentLoading}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-Primary font-semibold transition-colors cursor-pointer"
            >
              {documentLoading ? <Loader2 className="w-4 h-4 animate-spin text-Primary" /> : <Plus className="w-4 h-4" />}
              <span>{documentLoading ? "Uploading document..." : "Add Document"}</span>
            </button>
          </div>

          {/* 7. Internal Admin Notes */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-3 mb-5">
              <div className="w-10 h-10 bg-Primary/5 rounded-xl flex items-center justify-center shrink-0">
                <StickyNote className="w-5 h-5 text-Primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1A1A1A]">Internal Notes</h3>
                <p className="text-xs text-gray-400 font-medium mt-0.5">Private administrative notes</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {campaign.notes?.length > 0 ? (
                campaign.notes.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-start justify-between bg-gray-50 rounded-xl px-4 py-3 group gap-4"
                  >
                    <div>
                      <p className="text-xs text-slate-800 font-medium leading-relaxed">{n.text}</p>
                      <span className="text-[10px] text-gray-400 font-medium block mt-1">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteNote(n.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all cursor-pointer p-1 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 font-medium py-2">No internal notes added.</p>
              )}
            </div>

            <form onSubmit={addNote} className="flex gap-2">
              <input
                type="text"
                required
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a private note..."
                className="flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-Primary"
              />
              <button
                type="submit"
                className="bg-Primary hover:bg-Primary/90 text-white rounded-xl px-4 font-bold text-xs shrink-0 cursor-pointer shadow-2xs"
              >
                Post
              </button>
            </form>
          </div>

          {/* 8. Invoice Tracker */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5 border-b border-gray-50 pb-4">
              <div className="w-10 h-10 bg-Primary/5 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-Primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1A1A1A]">Invoice Tracker</h3>
                <p className="text-xs text-gray-400">Campaign budget and payment status</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
                    Campaign Budget
                  </span>
                  <span className="text-2xl font-black text-slate-900">
                    ${parseFloat(campaign.amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <button
                  onClick={() => {
                    const newAmt = prompt("Enter new campaign amount ($):", campaign.amount);
                    if (newAmt !== null && !isNaN(parseFloat(newAmt))) {
                      updateMutation.mutate({ amount: parseFloat(newAmt).toFixed(2) });
                    }
                  }}
                  className="text-xs font-bold text-Primary hover:underline cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-gray-200"
                >
                  Edit Budget
                </button>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col justify-between">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-2">
                  Payment Status
                </span>
                <div className="flex items-center gap-2">
                  {["Pending", "Paid", "Overdue"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handlePaymentStatusChange(st)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        campaign.paymentStatus === st
                          ? st === "Paid"
                            ? "bg-green-50 text-green-600 border-green-200"
                            : st === "Overdue"
                            ? "bg-red-50 text-red-600 border-red-200"
                            : "bg-yellow-50 text-yellow-600 border-yellow-200"
                          : "bg-white text-gray-400 border-gray-200 hover:text-gray-700"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Brand View History */}
      {activeTab === "Brand View History" && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
            <div className="w-10 h-10 bg-Primary/5 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-Primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1A1A1A]">Brand View Activity & History</h3>
              <p className="text-xs text-gray-400">Timeline of client reviews, approvals, and ratings</p>
            </div>
          </div>

          {campaign.rating && (
            <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-amber-900">Client Experience Rating</h4>
                <p className="text-xs text-amber-700/90 mt-0.5">The client submitted a rating after reviewing deliverables.</p>
              </div>
              <div className="flex items-center gap-1.5 px-4 py-2 bg-white rounded-xl border border-amber-200 shadow-2xs">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-sm font-black text-amber-800">{campaign.rating}.0 / 5.0</span>
              </div>
            </div>
          )}

          <div className="border border-gray-100 rounded-2xl p-6 bg-gray-50 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Media Review Breakdown</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-xl border border-gray-200">
                <p className="text-xs text-gray-400 font-semibold">Total Assets</p>
                <p className="text-xl font-black text-slate-800 mt-1">{mediaList.length}</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-emerald-200">
                <p className="text-xs text-emerald-600 font-semibold">Approved Files</p>
                <p className="text-xl font-black text-emerald-700 mt-1">
                  {mediaList.filter((m) => m.status === "approved").length}
                </p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-rose-200">
                <p className="text-xs text-rose-600 font-semibold">Revision Requests</p>
                <p className="text-xl font-black text-rose-700 mt-1">
                  {mediaList.filter((m) => m.status === "changes_requested").length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODALS ── */}

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="text-base font-bold text-[#1A1A1A]">Upload Media Content</h3>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMediaUploadSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={uploadData.title}
                  onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-Primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Asset Category</label>
                <select
                  value={uploadData.assetType}
                  onChange={(e) => setUploadData({ ...uploadData, assetType: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-Primary cursor-pointer"
                >
                  <option value="Video">Video</option>
                  <option value="Raw Footage">Raw Footage</option>
                  <option value="B-Roll">B-Roll</option>
                  <option value="Photo">Photo</option>
                  <option value="Graphic">Graphic</option>
                  <option value="Audio">Audio</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={uploadData.description}
                  onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-Primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={mediaUploading}
                  className="px-5 py-2 bg-Primary hover:bg-Primary/90 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {mediaUploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{mediaUploading ? "Uploading..." : "Upload Deliverable"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Replace Modal */}
      {replaceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="text-base font-bold text-[#1A1A1A]">Edit / Replace Deliverable</h3>
              <button
                onClick={() => setReplaceModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReplaceSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Replace Media File (Optional)</label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => setReplaceFile(e.target.files?.[0] || null)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-Primary cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={replaceData.title}
                  onChange={(e) => setReplaceData({ ...replaceData, title: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-Primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Asset Category</label>
                <select
                  value={replaceData.assetType}
                  onChange={(e) => setReplaceData({ ...replaceData, assetType: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-Primary cursor-pointer"
                >
                  <option value="Video">Video</option>
                  <option value="Raw Footage">Raw Footage</option>
                  <option value="B-Roll">B-Roll</option>
                  <option value="Photo">Photo</option>
                  <option value="Graphic">Graphic</option>
                  <option value="Audio">Audio</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={replaceData.description}
                  onChange={(e) => setReplaceData({ ...replaceData, description: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-Primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReplaceModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={replaceLoading}
                  className="px-5 py-2 bg-Primary hover:bg-Primary/90 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {replaceLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{replaceLoading ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Request Modal */}
      {changeRequestMediaId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="text-base font-bold text-rose-600">Request Revisions / Changes</h3>
              <button
                onClick={() => setChangeRequestMediaId(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitChangeRequest} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Specify feedback for creator/brand:
                </label>
                <textarea
                  rows={3}
                  required
                  value={changeRequestText}
                  onChange={(e) => setChangeRequestText(e.target.value)}
                  placeholder="Detail the revisions needed on this deliverable..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-rose-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setChangeRequestMediaId(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changeRequestLoading}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {changeRequestLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{changeRequestLoading ? "Submitting..." : "Submit Change Request"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Preview Modal */}
      {previewMedia && (
        <div
          onClick={() => setPreviewMedia(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl overflow-hidden max-w-4xl w-full shadow-2xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-slate-800">{previewMedia.name}</h4>
                {previewMedia.assetType && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-Primary/10 text-Primary">
                    {previewMedia.assetType}
                  </span>
                )}
              </div>
              <button
                onClick={() => setPreviewMedia(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video bg-black flex items-center justify-center max-h-[70vh]">
              {previewMedia.type === "video" ? (
                <video src={getMediaUrl(previewMedia.url)} controls autoPlay className="w-full h-full object-contain" />
              ) : (
                <img
                  src={getMediaUrl(previewMedia.url)}
                  alt={previewMedia.name}
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {previewMedia.description && (
              <div className="p-4 bg-gray-50 border-t border-gray-100 text-xs text-gray-600">
                {previewMedia.description}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignDetails;
