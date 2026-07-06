import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import {
  ArrowLeft,
  Folder,
  Calendar,
  DollarSign,
  CheckCircle,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  FileText,
  Video,
  Image as ImageIcon,
  MessageSquare,
  Loader2,
  Upload,
  ExternalLink,
  ChevronDown,
  X,
  Lock,
  Unlock
} from "lucide-react";
import { toast } from "react-toastify";

const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const axiosSecure = useAxiosSecure();

  // Dialog state
  const [newDeliverableText, setNewDeliverableText] = useState("");
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskDate, setNewTaskDate] = useState("");
  const [newComment, setNewComment] = useState("");

  const [documentFile, setDocumentFile] = useState(null);
  const [documentLoading, setDocumentLoading] = useState(false);

  const [mediaFile, setMediaFile] = useState(null);
  const [mediaLoading, setMediaLoading] = useState(false);

  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackMediaId, setFeedbackMediaId] = useState("");
  const [loadingApproveId, setLoadingApproveId] = useState(null);

  // Fetch campaign
  const { data: campaign, isLoading, refetch } = useQuery({
    queryKey: ["adminCampaignDetails", id],
    queryFn: async () => {
      const res = await axiosSecure.get(`/ugc-campaigns/${id}`);
      return res.data?.data || null;
    },
    enabled: !!id
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
    }
  });

  const handleReleaseFiles = () => {
    updateMutation.mutate({ releaseFiles: true, status: "Completed" });
  };

  const handleUnreleaseFiles = () => {
    updateMutation.mutate({ releaseFiles: false, status: "Approved" });
  };

  const handleStatusChange = (status) => {
    updateMutation.mutate({ status });
  };

  const handlePaymentStatusChange = (paymentStatus) => {
    updateMutation.mutate({ paymentStatus });
  };

  // Deliverables operations
  const addDeliverable = async (e) => {
    e.preventDefault();
    if (!newDeliverableText.trim()) return;
    try {
      await axiosSecure.post(`/ugc-campaigns/${id}/deliverables`, { text: newDeliverableText });
      toast.success("Deliverable added");
      setNewDeliverableText("");
      refetch();
    } catch (err) {
      toast.error("Failed to add deliverable");
    }
  };

  const deleteDeliverable = async (delId) => {
    if (!window.confirm("Delete this deliverable?")) return;
    try {
      await axiosSecure.delete(`/ugc-campaigns/${id}/deliverables/${delId}`);
      toast.success("Deliverable deleted");
      refetch();
    } catch (err) {
      toast.error("Failed to delete deliverable");
    }
  };

  // Tasks operations
  const addTask = async (e) => {
    e.preventDefault();
    if (!newTaskName.trim() || !newTaskDate) return;
    try {
      await axiosSecure.post(`/ugc-campaigns/${id}/tasks`, { name: newTaskName, date: newTaskDate });
      toast.success("Task added");
      setNewTaskName("");
      setNewTaskDate("");
      refetch();
    } catch (err) {
      toast.error("Failed to add task");
    }
  };

  const toggleTask = async (taskId, currentCompleted) => {
    try {
      await axiosSecure.patch(`/ugc-campaigns/${id}/tasks/${taskId}`, { completed: !currentCompleted });
      toast.success("Task updated");
      refetch();
    } catch (err) {
      toast.error("Failed to toggle task");
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await axiosSecure.delete(`/ugc-campaigns/${id}/tasks/${taskId}`);
      toast.success("Task deleted");
      refetch();
    } catch (err) {
      toast.error("Failed to delete task");
    }
  };

  // Media approvals operations
  const approveMedia = async (mediaId) => {
    try {
      setLoadingApproveId(mediaId);
      await axiosSecure.patch(`/ugc-campaigns/public/${campaign.slug}/media/${mediaId}/status`);
      toast.success("File status set to approved!");
      refetch();
    } catch (err) {
      toast.error("Failed to approve media");
    } finally {
      setLoadingApproveId(null);
    }
  };

  const requestChangesMedia = async (e) => {
    e.preventDefault();
    if (!feedbackText.trim() || !feedbackMediaId) return;
    try {
      await axiosSecure.post(`/ugc-campaigns/public/${campaign.slug}/media/${feedbackMediaId}/request-changes`, {
        text: feedbackText
      });
      toast.success("Changes requested successfully");
      setFeedbackText("");
      setFeedbackMediaId("");
      refetch();
    } catch (err) {
      toast.error("Failed to request changes");
    }
  };

  const deleteMedia = async (mediaId) => {
    if (!window.confirm("Are you sure you want to delete this media item?")) return;
    try {
      await axiosSecure.delete(`/ugc-campaigns/${id}/media/${mediaId}`);
      toast.success("Media item deleted");
      refetch();
    } catch (err) {
      toast.error("Failed to delete media");
    }
  };

  const handleMediaUpload = async (e) => {
    e.preventDefault();
    if (!mediaFile) return;
    setMediaLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", mediaFile);
      formData.append("description", "Uploaded by Administrator");
      await axiosSecure.post(`/ugc-campaigns/${id}/media`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Media file uploaded successfully");
      setMediaFile(null);
      refetch();
    } catch (err) {
      toast.error("Failed to upload media");
    } finally {
      setMediaLoading(false);
    }
  };

  // Document upload
  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    if (!documentFile) return;
    setDocumentLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", documentFile);
      await axiosSecure.post(`/ugc-campaigns/${id}/documents`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Document uploaded successfully");
      setDocumentFile(null);
      refetch();
    } catch (err) {
      toast.error("Failed to upload document");
    } finally {
      setDocumentLoading(false);
    }
  };

  const deleteDocument = async (docId) => {
    if (!window.confirm("Delete this document?")) return;
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
      await axiosSecure.post(`/ugc-campaigns/${id}/notes`, { text: newComment });
      toast.success("Note added");
      setNewComment("");
      refetch();
    } catch (err) {
      toast.error("Failed to add note");
    }
  };

  const deleteNote = async (noteId) => {
    if (!window.confirm("Delete this note?")) return;
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
        <Loader2 className="w-12 h-12 text-Primary animate-spin" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-20 bg-white border border-slate-100 rounded-[32px]">
        <p className="text-slate-400 font-medium">Campaign not found</p>
      </div>
    );
  }

  const allMediaApproved =
    campaign.media && campaign.media.length > 0 && campaign.media.every((m) => m.status === "approved");

  const clientUrl = (import.meta.env.VITE_CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");
  const shareLink = `${clientUrl}/brand-view/${campaign.slug}`;

  const getMediaUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${import.meta.env.VITE_IMG_URL || "http://localhost:3000/"}${url}`;
  };

  const getProgress = (campaign) => {
    const totalTasks = campaign.tasks?.length || 0;
    if (totalTasks === 0) {
      switch (campaign.status) {
        case "Completed": return 100;
        case "Approved": return 90;
        case "Under Review": return 75;
        case "Active": return 50;
        case "Draft": return 25;
        default: return 10;
      }
    }
    const completedTasks = campaign.tasks.filter(t => t.completed).length;
    return Math.round((completedTasks / totalTasks) * 100);
  };

  const getProgressLabel = (campaign) => {
    const totalTasks = campaign.tasks?.length || 0;
    if (totalTasks === 0) {
      return `${getProgress(campaign)}%`;
    }
    const completedTasks = campaign.tasks?.filter(t => t.completed).length || 0;
    return `${completedTasks}/${totalTasks}`;
  };

  return (
    <div className="font-outfit text-slate-800 pb-16">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-[#1A1A1A] transition-colors mb-6 group text-sm font-bold"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Campaigns
      </button>

      {/* Verification Banner */}
      {allMediaApproved && (
        <div className="mb-6 p-5 bg-green-50 border border-green-150 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <h4 className="text-sm font-bold text-green-800 flex items-center gap-2">
              🎉 Client Verified & Approved All Files!
            </h4>
            <p className="text-xs text-green-600/80 mt-1">
              You can now release the final high-quality files for brand download.
            </p>
          </div>
          {!campaign.releaseFiles ? (
            <button
              onClick={handleReleaseFiles}
              className="bg-green-600 text-white text-xs font-bold px-5 py-2.5 rounded-2xl hover:bg-green-700 transition-all shadow-md shadow-green-200 cursor-pointer shrink-0"
            >
              Release Files Now
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-green-600 bg-white border border-green-200 px-4 py-2 rounded-2xl">
                Files Released ✓
              </span>
              <button
                onClick={handleUnreleaseFiles}
                className="text-xs text-red-500 hover:underline font-bold px-2"
              >
                Revoke Release
              </button>
            </div>
          )}
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-extrabold text-[#1A1A1A]">{campaign.name}</h1>
            <select
              value={campaign.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="text-xs font-extrabold px-3 py-1.5 rounded-full bg-slate-100 border-none outline-none focus:ring-2 focus:ring-Primary/20 cursor-pointer text-slate-700"
            >
              <option value="Draft">Draft</option>
              <option value="Pending">Pending</option>
              <option value="Active">Active</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <p className="text-sm text-slate-400 mt-1 mb-3">
            UGC Campaign by Brand: <strong className="text-slate-600">{campaign.brandName}</strong> | Due date: {campaign.deadline}
          </p>
          {/* Progress Bar */}
          <div className="w-full md:w-64 flex items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden flex-1">
              <div className="h-full bg-Primary rounded-full transition-all duration-500" style={{ width: `${getProgress(campaign)}%` }} />
            </div>
            <span className="text-[10px] font-extrabold text-slate-400 shrink-0">{getProgressLabel(campaign)}</span>
          </div>
        </div>

        {/* Public Sharing link */}
        <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm max-w-md flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Brand Shareable link</span>
            <p className="text-xs text-slate-600 truncate max-w-[200px] mt-0.5">{shareLink}</p>
          </div>
          <a
            href={shareLink}
            target="_blank"
            rel="noreferrer"
            className="p-2.5 bg-Primary/5 text-Primary hover:bg-Primary/10 rounded-xl transition-all"
            title="Open Brand View"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Main Campaign Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols) - Media, Feedback, Invoices */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Media Content Gallery */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-50">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-Primary" />
                <h2 className="text-base font-bold text-slate-800">UGC Deliverable Files</h2>
              </div>
              <span className="text-xs font-semibold text-slate-400">Files: {campaign.media?.length || 0}</span>
            </div>

            {/* Media Upload form for admin */}
            <form onSubmit={handleMediaUpload} className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => setMediaFile(e.target.files[0])}
                className="text-xs text-slate-600 flex-1 min-w-0"
              />
              <button
                type="submit"
                disabled={mediaLoading || !mediaFile}
                className="bg-Primary text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 hover:bg-Primary/90 transition-all disabled:opacity-50 shrink-0"
              >
                {mediaLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                Upload Media
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {campaign.media?.map((item) => (
                <div key={item.id} className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between bg-slate-50/20">
                  <div className="aspect-video bg-black flex items-center justify-center relative overflow-hidden">
                    {item.type === "video" ? (
                      <video src={getMediaUrl(item.url)} className="w-full h-full object-cover" controls />
                    ) : (
                      <img src={getMediaUrl(item.url)} alt={item.name} className="w-full h-full object-contain" loading="lazy" />
                    )}
                    <span className={`absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded-full text-white shadow ${
                      item.status === "approved" ? "bg-green-600" :
                      item.status === "changes_requested" ? "bg-red-500" : "bg-yellow-500"
                    }`}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 line-clamp-1">{item.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                        {item.description || "No description provided."}
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-4 mt-auto border-t border-slate-100/50">
                      <button
                        onClick={() => deleteMedia(item.id)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Media File"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      
                      {item.status !== "approved" && (
                        <button
                          onClick={() => approveMedia(item.id)}
                          disabled={loadingApproveId === item.id}
                          className="bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loadingApproveId === item.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <CheckCircle className="w-3 h-3" />
                          )}
                          {loadingApproveId === item.id ? "Approving..." : "Approve"}
                        </button>
                      )}

                      {item.status !== "changes_requested" && (
                        <button
                          onClick={() => {
                            setFeedbackMediaId(item.id);
                            setFeedbackText(`Please make adjustments to ${item.name}...`);
                          }}
                          className="border border-red-200 text-red-500 hover:bg-red-50 text-[10px] font-bold px-3 py-1.5 rounded-xl"
                        >
                          Request Changes
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {(!campaign.media || campaign.media.length === 0) && (
                <div className="col-span-2 text-center py-10 border border-dashed border-slate-200 rounded-2xl">
                  <p className="text-slate-400 text-xs font-semibold">No media deliverables uploaded yet.</p>
                </div>
              )}
            </div>

            {/* Request changes form popup */}
            {feedbackMediaId && (
              <form onSubmit={requestChangesMedia} className="mt-6 p-4 bg-red-50/50 border border-red-100 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-red-600 uppercase">Specify Change Request Feedback</span>
                  <button type="button" onClick={() => setFeedbackMediaId("")} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  required
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  rows={2}
                  className="w-full bg-white border border-red-200 rounded-xl py-2 px-3 focus:outline-none focus:border-red-400 text-xs font-medium"
                />
                <div className="flex justify-end">
                  <button type="submit" className="bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold px-4 py-2 rounded-xl">
                    Submit Request
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Client Feedback Thread */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-50">
              <MessageSquare className="w-5 h-5 text-Primary" />
              <h2 className="text-base font-bold text-slate-800">Client Feedback thread</h2>
            </div>
            
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {campaign.feedback?.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-4 rounded-2xl max-w-[85%] ${
                    msg.from === "brand"
                      ? "bg-slate-100 mr-auto text-slate-800"
                      : "bg-Primary/10 ml-auto text-slate-800"
                  }`}
                >
                  <span className="text-[9px] font-extrabold uppercase tracking-wide opacity-60">
                    {msg.from === "brand" ? "Brand Client Feedback" : "Creator Response"}
                  </span>
                  <p className="text-xs font-medium mt-1 leading-relaxed">{msg.text}</p>
                  {msg.fileUrl && (
                    <a
                      href={getMediaUrl(msg.fileUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-Primary mt-2 hover:underline"
                    >
                      View attachment <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <span className="block text-[8px] opacity-40 text-right mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}

              {(!campaign.feedback || campaign.feedback.length === 0) && (
                <div className="text-center py-6 text-slate-400 text-xs">No feedback messages in this thread.</div>
              )}
            </div>
          </div>

          {/* Campaign Invoice Tracker */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-2 border-b border-slate-50">
              <DollarSign className="w-5 h-5 text-Primary" />
              <h2 className="text-base font-bold text-slate-800">Invoice Tracker</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-2">Campaign Budget Amount</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-slate-800">
                    ${parseFloat(campaign.amount || 0).toFixed(2)}
                  </span>
                  <button
                    onClick={() => {
                      const newAmt = prompt("Enter new campaign amount:", campaign.amount);
                      if (newAmt !== null && !isNaN(parseFloat(newAmt))) {
                        updateMutation.mutate({ amount: parseFloat(newAmt).toFixed(2) });
                      }
                    }}
                    className="text-xs font-bold text-Primary hover:underline"
                  >
                    Edit
                  </button>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-2">Payment Status</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePaymentStatusChange("Pending")}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                      campaign.paymentStatus === "Pending"
                        ? "bg-orange-50 text-orange-500 border-orange-200"
                        : "bg-white text-slate-400 border-slate-200"
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => handlePaymentStatusChange("Paid")}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                      campaign.paymentStatus === "Paid"
                        ? "bg-green-50 text-green-500 border-green-200"
                        : "bg-white text-slate-400 border-slate-200"
                    }`}
                  >
                    Paid
                  </button>
                  <button
                    onClick={() => handlePaymentStatusChange("Overdue")}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                      campaign.paymentStatus === "Overdue"
                        ? "bg-red-50 text-red-500 border-red-200"
                        : "bg-white text-slate-400 border-slate-200"
                    }`}
                  >
                    Overdue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col) - Deliverables, Tasks, Documents */}
        <div className="space-y-8">
          
          {/* Deliverables Checklist */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-[#1A1A1A] mb-4 pb-2 border-b border-slate-50">Deliverables</h3>
            <form onSubmit={addDeliverable} className="flex gap-2 mb-4 w-full">
              <input
                type="text"
                required
                value={newDeliverableText}
                onChange={(e) => setNewDeliverableText(e.target.value)}
                placeholder="e.g. 1x TikTok Video"
                className="flex-1 min-w-0 bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-Primary"
              />
              <button type="submit" className="bg-Primary hover:bg-Primary/90 text-white rounded-xl px-3 font-bold text-xs shrink-0">
                Add
              </button>
            </form>
            <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
              {campaign.deliverables?.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2.5 bg-slate-50/50 rounded-xl border border-slate-100">
                  <span className="text-xs font-semibold text-slate-700">{item.text}</span>
                  <button onClick={() => deleteDeliverable(item.id)} className="text-red-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {(!campaign.deliverables || campaign.deliverables.length === 0) && (
                <p className="text-[11px] text-slate-400 text-center py-4">No deliverables specified.</p>
              )}
            </div>
          </div>

          {/* Tasks & Milestones */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-[#1A1A1A] mb-4 pb-2 border-b border-slate-50">Campaign Tasks</h3>
            <form onSubmit={addTask} className="space-y-2 mb-4 w-full">
              <input
                type="text"
                required
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                placeholder="Task description"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-Primary"
              />
              <div className="flex gap-2 w-full">
                <input
                  type="date"
                  required
                  value={newTaskDate}
                  onChange={(e) => setNewTaskDate(e.target.value)}
                  className="flex-1 min-w-0 bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-Primary"
                />
                <button type="submit" className="bg-Primary hover:bg-Primary/90 text-white rounded-xl px-4 font-bold text-xs shrink-0">
                  Create Task
                </button>
              </div>
            </form>
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
              {campaign.tasks?.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-2.5 bg-slate-50/50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleTask(task.id, task.completed)} className="text-slate-400 hover:text-Primary">
                      {task.completed ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Circle className="w-4 h-4 text-slate-300" />}
                    </button>
                    <div>
                      <p className={`text-xs font-bold ${task.completed ? "line-through text-slate-400" : "text-slate-700"}`}>
                        {task.name}
                      </p>
                      <span className="text-[9px] text-slate-400 font-semibold">{task.date}</span>
                    </div>
                  </div>
                  <button onClick={() => deleteTask(task.id)} className="text-red-400 hover:text-red-650 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {(!campaign.tasks || campaign.tasks.length === 0) && (
                <p className="text-[11px] text-slate-400 text-center py-4">No planner tasks configured.</p>
              )}
            </div>
          </div>

          {/* Reference Documents */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-[#1A1A1A] mb-4 pb-2 border-b border-slate-50">Reference Documents</h3>
            <form onSubmit={handleDocumentUpload} className="mb-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
              <input
                type="file"
                required
                onChange={(e) => setDocumentFile(e.target.files[0])}
                className="text-xs text-slate-500 flex-1 min-w-0"
              />
              <button
                type="submit"
                disabled={documentLoading || !documentFile}
                className="bg-Primary text-white text-xs font-bold py-1.5 px-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-1 shrink-0"
              >
                {documentLoading ? <Loader2 className="w-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                Add
              </button>
            </form>
            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
              {campaign.documents?.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-2.5 bg-slate-50/50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <a
                      href={getMediaUrl(doc.url)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-slate-700 truncate hover:text-Primary"
                    >
                      {doc.name}
                    </a>
                  </div>
                  <button onClick={() => deleteDocument(doc.id)} className="text-red-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {(!campaign.documents || campaign.documents.length === 0) && (
                <p className="text-[11px] text-slate-400 text-center py-4">No reference sheets uploaded.</p>
              )}
            </div>
          </div>

          {/* Internal Notes / Comments */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-[#1A1A1A] mb-4 pb-2 border-b border-slate-50">Internal Admin Notes</h3>
            <form onSubmit={addNote} className="flex gap-2 mb-4 w-full">
              <input
                type="text"
                required
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a private note..."
                className="flex-1 min-w-0 bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-Primary"
              />
              <button type="submit" className="bg-Primary hover:bg-Primary/90 text-white rounded-xl px-3 font-bold text-xs shrink-0">
                Save
              </button>
            </form>
            <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
              {campaign.notes && (
                <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 space-y-1 relative group">
                  <button
                    onClick={() => {
                      if (window.confirm("Delete the initial campaign note?")) {
                        updateMutation.mutate({ notes: null });
                      }
                    }}
                    className="absolute right-2 top-2 text-red-400 hover:text-red-650 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Delete Initial Note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[8px] bg-Primary/10 text-Primary font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                      Initial Note
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-600 leading-relaxed pr-6">{campaign.notes}</p>
                  <span className="block text-[8px] text-slate-400 font-semibold">
                    {new Date(campaign.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )}
              {campaign.notesComments?.map((note) => (
                <div key={note.id} className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 space-y-1 relative group">
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="absolute right-2 top-2 text-red-400 hover:text-red-650 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <p className="text-xs font-medium text-slate-600 leading-relaxed pr-6">{note.text}</p>
                  <span className="block text-[8px] text-slate-400 font-semibold">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
              {!campaign.notes && (!campaign.notesComments || campaign.notesComments.length === 0) && (
                <p className="text-[11px] text-slate-400 text-center py-4">No admin notes stored.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CampaignDetails;
