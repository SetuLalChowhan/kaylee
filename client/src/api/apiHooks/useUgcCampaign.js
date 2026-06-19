import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import { USER } from "../apiEndPoint";

/**
 * useUgcCampaigns — Retrieve creator's campaigns list
 */
export const useUgcCampaigns = (status) => {
  const axiosSecure = useAxiosSecure();
  return useQuery({
    queryKey: ["ugcCampaigns", status],
    queryFn: async () => {
      const statusParam = status && status !== "all" ? `?status=${status}` : "";
      const res = await axiosSecure.get(`${USER.UGC_CAMPAIGN}${statusParam}`);
      return res.data?.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * useUgcCampaign — Retrieve specific campaign details
 */
export const useUgcCampaign = (id) => {
  const axiosSecure = useAxiosSecure();
  return useQuery({
    queryKey: ["ugcCampaign", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await axiosSecure.get(`${USER.UGC_CAMPAIGN}/${id}`);
      return res.data?.data || null;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });
};

/**
 * useCreateUgcCampaign — Create a campaign
 */
export const useCreateUgcCampaign = () => {
  const queryClient = useQueryClient();
  const axiosSecure = useAxiosSecure();
  return useMutation({
    mutationFn: async (campaignData) => {
      const res = await axiosSecure.post(USER.UGC_CAMPAIGN, campaignData);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Campaign created successfully!");
      queryClient.invalidateQueries({ queryKey: ["ugcCampaigns"] });
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message || "Failed to create campaign";
      toast.error(msg);
    },
  });
};

/**
 * useUpdateUgcCampaign — Update campaign settings (releaseFiles, paymentStatus, name, etc.)
 */
export const useUpdateUgcCampaign = () => {
  const queryClient = useQueryClient();
  const axiosSecure = useAxiosSecure();
  return useMutation({
    mutationFn: async ({ id, campaignData }) => {
      const res = await axiosSecure.patch(`${USER.UGC_CAMPAIGN}/${id}`, campaignData);
      return res.data;
    },
    onSuccess: (data, variables) => {
      toast.success(data?.message || "Campaign updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["ugcCampaigns"] });
      queryClient.invalidateQueries({ queryKey: ["ugcCampaign", variables.id] });
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message || "Failed to update campaign";
      toast.error(msg);
    },
  });
};

/**
 * useDeleteUgcCampaign — Delete a campaign
 */
export const useDeleteUgcCampaign = () => {
  const queryClient = useQueryClient();
  const axiosSecure = useAxiosSecure();
  return useMutation({
    mutationFn: async (id) => {
      const res = await axiosSecure.delete(`${USER.UGC_CAMPAIGN}/${id}`);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Campaign deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["ugcCampaigns"] });
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message || "Failed to delete campaign";
      toast.error(msg);
    },
  });
};

/**
 * Deliverables Hooks
 */
export const useCreateDeliverable = () => {
  const queryClient = useQueryClient();
  const axiosSecure = useAxiosSecure();
  return useMutation({
    mutationFn: async ({ campaignId, text }) => {
      const res = await axiosSecure.post(`${USER.UGC_CAMPAIGN}/${campaignId}/deliverables`, { text });
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["ugcCampaign", variables.campaignId] });
    },
  });
};

export const useDeleteDeliverable = () => {
  const queryClient = useQueryClient();
  const axiosSecure = useAxiosSecure();
  return useMutation({
    mutationFn: async ({ campaignId, id }) => {
      const res = await axiosSecure.delete(`${USER.UGC_CAMPAIGN}/${campaignId}/deliverables/${id}`);
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["ugcCampaign", variables.campaignId] });
    },
  });
};

/**
 * Campaign Tasks Hooks
 */
export const useCreateCampaignTask = () => {
  const queryClient = useQueryClient();
  const axiosSecure = useAxiosSecure();
  return useMutation({
    mutationFn: async ({ campaignId, taskData }) => {
      const res = await axiosSecure.post(`${USER.UGC_CAMPAIGN}/${campaignId}/tasks`, taskData);
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["ugcCampaign", variables.campaignId] });
    },
  });
};

export const useUpdateCampaignTask = () => {
  const queryClient = useQueryClient();
  const axiosSecure = useAxiosSecure();
  return useMutation({
    mutationFn: async ({ campaignId, id, taskData }) => {
      const res = await axiosSecure.patch(`${USER.UGC_CAMPAIGN}/${campaignId}/tasks/${id}`, taskData);
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["ugcCampaign", variables.campaignId] });
    },
  });
};

export const useDeleteCampaignTask = () => {
  const queryClient = useQueryClient();
  const axiosSecure = useAxiosSecure();
  return useMutation({
    mutationFn: async ({ campaignId, id }) => {
      const res = await axiosSecure.delete(`${USER.UGC_CAMPAIGN}/${campaignId}/tasks/${id}`);
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["ugcCampaign", variables.campaignId] });
    },
  });
};

/**
 * Media Gallery Hooks
 */
export const useUploadCampaignMedia = () => {
  const queryClient = useQueryClient();
  const axiosSecure = useAxiosSecure();
  return useMutation({
    mutationFn: async ({ campaignId, formData }) => {
      const res = await axiosSecure.post(`${USER.UGC_CAMPAIGN}/${campaignId}/media`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: (data, variables) => {
      toast.success("Media file uploaded successfully!");
      queryClient.invalidateQueries({ queryKey: ["ugcCampaign", variables.campaignId] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to upload media");
    },
  });
};

export const useDeleteCampaignMedia = () => {
  const queryClient = useQueryClient();
  const axiosSecure = useAxiosSecure();
  return useMutation({
    mutationFn: async ({ campaignId, id }) => {
      const res = await axiosSecure.delete(`${USER.UGC_CAMPAIGN}/${campaignId}/media/${id}`);
      return res.data;
    },
    onSuccess: (data, variables) => {
      toast.success("Media deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["ugcCampaign", variables.campaignId] });
    },
  });
};

/**
 * useReplaceCampaignMedia — Replace a single media item (preserves ID, resets status to pending)
 */
export const useReplaceCampaignMedia = () => {
  const queryClient = useQueryClient();
  const axiosSecure = useAxiosSecure();
  return useMutation({
    mutationFn: async ({ campaignId, id, formData }) => {
      const res = await axiosSecure.patch(
        `${USER.UGC_CAMPAIGN}/${campaignId}/media/${id}/replace`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return res.data;
    },
    onSuccess: (data, variables) => {
      toast.success("Media added successfully!");
      queryClient.invalidateQueries({ queryKey: ["ugcCampaign", variables.campaignId] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to replace media");
    },
  });
};


/**
 * Documents Hooks
 */
export const useUploadCampaignDocument = () => {
  const queryClient = useQueryClient();
  const axiosSecure = useAxiosSecure();
  return useMutation({
    mutationFn: async ({ campaignId, formData }) => {
      const res = await axiosSecure.post(`${USER.UGC_CAMPAIGN}/${campaignId}/documents`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: (data, variables) => {
      toast.success("Document uploaded successfully!");
      queryClient.invalidateQueries({ queryKey: ["ugcCampaign", variables.campaignId] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to upload document");
    },
  });
};

export const useDeleteCampaignDocument = () => {
  const queryClient = useQueryClient();
  const axiosSecure = useAxiosSecure();
  return useMutation({
    mutationFn: async ({ campaignId, id }) => {
      const res = await axiosSecure.delete(`${USER.UGC_CAMPAIGN}/${campaignId}/documents/${id}`);
      return res.data;
    },
    onSuccess: (data, variables) => {
      toast.success("Document deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["ugcCampaign", variables.campaignId] });
    },
  });
};

/**
 * Notes Hooks
 */
export const useCreateCampaignNote = () => {
  const queryClient = useQueryClient();
  const axiosSecure = useAxiosSecure();
  return useMutation({
    mutationFn: async ({ campaignId, text }) => {
      const res = await axiosSecure.post(`${USER.UGC_CAMPAIGN}/${campaignId}/notes`, { text });
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["ugcCampaign", variables.campaignId] });
    },
  });
};

export const useDeleteCampaignNote = () => {
  const queryClient = useQueryClient();
  const axiosSecure = useAxiosSecure();
  return useMutation({
    mutationFn: async ({ campaignId, id }) => {
      const res = await axiosSecure.delete(`${USER.UGC_CAMPAIGN}/${campaignId}/notes/${id}`);
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["ugcCampaign", variables.campaignId] });
    },
  });
};

/**
 * Creator Feedback Send Hook
 */
export const useCreateFeedback = () => {
  const queryClient = useQueryClient();
  const axiosSecure = useAxiosSecure();
  return useMutation({
    mutationFn: async ({ campaignId, formData }) => {
      const res = await axiosSecure.post(`${USER.UGC_CAMPAIGN}/${campaignId}/feedback`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["ugcCampaign", variables.campaignId] });
    },
  });
};

/**
 * ── GUEST PUBLIC BRAND VIEW HOOKS ────────────────────────────────────────────
 */

/**
 * usePublicCampaign — Fetch campaign by slug (no login required)
 */
export const usePublicCampaign = (slug) => {
  const axiosPublic = useAxiosPublic();
  return useQuery({
    queryKey: ["publicCampaign", slug],
    queryFn: async () => {
      if (!slug) return null;
      const res = await axiosPublic.get(`${USER.UGC_CAMPAIGN}/public/${slug}`);
      return res.data?.data || null;
    },
    staleTime: 30 * 1000, // short stale time for live feedback updates
    enabled: !!slug,
  });
};

/**
 * useUpdatePublicMediaStatus — Brand approves file(s)
 */
export const useUpdatePublicMediaStatus = () => {
  const queryClient = useQueryClient();
  const axiosPublic = useAxiosPublic();
  return useMutation({
    mutationFn: async ({ slug, mediaId }) => {
      const res = await axiosPublic.patch(`${USER.UGC_CAMPAIGN}/public/${slug}/media/${mediaId}/status`);
      return res.data;
    },
    onSuccess: (data, variables) => {
      toast.success("Media status updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["publicCampaign", variables.slug] });
    },
  });
};

/**
 * useRequestChangesPublicMedia — Brand requests changes on a media item
 */
export const useRequestChangesPublicMedia = () => {
  const queryClient = useQueryClient();
  const axiosPublic = useAxiosPublic();
  return useMutation({
    mutationFn: async ({ slug, mediaId, text }) => {
      const res = await axiosPublic.post(`${USER.UGC_CAMPAIGN}/public/${slug}/media/${mediaId}/request-changes`, { text });
      return res.data;
    },
    onSuccess: (data, variables) => {
      toast.success("Change request submitted!");
      queryClient.invalidateQueries({ queryKey: ["publicCampaign", variables.slug] });
    },
  });
};

/**
 * useCreatePublicFeedback — Brand submits comment
 */
export const useCreatePublicFeedback = () => {
  const queryClient = useQueryClient();
  const axiosPublic = useAxiosPublic();
  return useMutation({
    mutationFn: async ({ slug, text, mediaId }) => {
      const res = await axiosPublic.post(`${USER.UGC_CAMPAIGN}/public/${slug}/feedback`, { text, mediaId });
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["publicCampaign", variables.slug] });
    },
  });
};
