import { apiClient } from "./apiClient";
import { ReviewQueryParams, ReviewResponse } from "@/types/review.types";

export const reviewService = {
  /** Fetch paginated list of pending reviews */
  getPendingReviews: async (params?: ReviewQueryParams): Promise<ReviewResponse> => {
    const cleanParams: Record<string, any> = {};
    if (params) {
      if (params.page !== undefined) cleanParams.page = params.page;
      if (params.limit !== undefined) cleanParams.limit = params.limit;
      if (params.search) cleanParams.search = params.search;
    }

    const res = await apiClient.get<ReviewResponse>("/api/admin/pending/reviews", {
      params: cleanParams,
    });
    return res.data;
  },

  /** Fetch paginated list of all reviews */
  getAllReviews: async (params?: ReviewQueryParams): Promise<ReviewResponse> => {
    const cleanParams: Record<string, any> = {};
    if (params) {
      if (params.page !== undefined) cleanParams.page = params.page;
      if (params.limit !== undefined) cleanParams.limit = params.limit;
      if (params.search) cleanParams.search = params.search;
      if (params.status && params.status !== "--") cleanParams.status = params.status;
      if (params.reviewType && params.reviewType !== "--") cleanParams.reviewType = params.reviewType;
      if (params.moderationType && params.moderationType !== "--") cleanParams.moderationType = params.moderationType;
    }

    const res = await apiClient.get<ReviewResponse>("/api/admin/reviews", {
      params: cleanParams,
    });
    return res.data;
  },

  /** Approve a review */
  approveReview: async (id: string): Promise<any> => {
    const res = await apiClient.post(`/api/admin/${id}/approve`);
    return res.data;
  },

  /** Reject a review */
  rejectReview: async (id: string, rejectionReason: string): Promise<any> => {
    const res = await apiClient.post(`/api/admin/${id}/reject`, { rejectionReason });
    return res.data;
  },
};
