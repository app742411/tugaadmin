import { apiClient } from "./apiClient";
import { JobQueryParams, JobResponse, JobDetailResponse, SuggestedTrader, SuggestedTraderQueryParams } from "@/types/job.types";

export const jobService = {
  /** Fetch paginated, filtered, and searched list of jobs */
  getJobs: async (params?: JobQueryParams): Promise<JobResponse> => {
    const cleanParams: Record<string, any> = {};
    if (params) {
      if (params.page !== undefined) cleanParams.page = params.page;
      if (params.limit !== undefined) cleanParams.limit = params.limit;
      if (params.status && params.status !== "--") cleanParams.status = params.status;
      if (params.search) cleanParams.search = params.search;
    }

    const res = await apiClient.get<JobResponse>("/api/admin/jobs", {
      params: cleanParams,
    });
    return res.data;
  },

  /** Fetch paginated, filtered, and searched list of jobs for manual review */
  getManualReviewJobs: async (params?: JobQueryParams): Promise<JobResponse> => {
    const cleanParams: Record<string, any> = {};
    if (params) {
      if (params.page !== undefined) cleanParams.page = params.page;
      if (params.limit !== undefined) cleanParams.limit = params.limit;
      if (params.status && params.status !== "--") cleanParams.status = params.status;
      if (params.search) cleanParams.search = params.search;
    }

    const res = await apiClient.get<JobResponse>("/api/admin/job/manual-review", {
      params: cleanParams,
    });
    return res.data;
  },

  /** Fetch details of a single job */
  getJobDetail: async (jobId: string): Promise<JobDetailResponse> => {
    const res = await apiClient.get<JobDetailResponse>(`/api/admin/jobs/${jobId}`);
    return res.data;
  },

  /** Fetch list of suggested traders matching a specific job */
  getSuggestedTraders: async (jobId: string, params?: SuggestedTraderQueryParams): Promise<SuggestedTrader[]> => {
    const cleanParams: Record<string, any> = {};
    if (params) {
      if (params.limit !== undefined) cleanParams.limit = params.limit;
      if (params.radius !== undefined) cleanParams.radius = params.radius;
    }

    const res = await apiClient.get<SuggestedTrader[]>(`/api/admin/jobs/${jobId}/suggested-traders`, {
      params: cleanParams,
    });
    return res.data;
  },

  /** Submit manual review assignment for a job with list of trader IDs */
  assignManualReviewTraders: async (jobId: string, traderIds: string[]): Promise<any> => {
    const res = await apiClient.post(`/api/admin/${jobId}/distribute`, {
      traderIds,
    });
    return res.data;
  },

  /** Pause active job matching */
  pauseJob: async (jobId: string): Promise<any> => {
    const res = await apiClient.post(`/api/jobs/admin/${jobId}/pause`);
    return res.data;
  },

  /** Resume paused job matching */
  resumeJob: async (jobId: string): Promise<any> => {
    const res = await apiClient.post(`/api/jobs/admin/${jobId}/resume`);
    return res.data;
  },

  /** Restart automatic job matching */
  restartAutoJob: async (jobId: string): Promise<any> => {
    const res = await apiClient.post(`/api/jobs/admin/${jobId}/restart-auto`);
    return res.data;
  },

  /** Increase search radius for matching traders */
  increaseRadius: async (jobId: string, radiusKm: number): Promise<any> => {
    const res = await apiClient.post(`/api/jobs/admin/${jobId}/increase-radius`, {
      radiusKm,
    });
    return res.data;
  },

  /** Close the job posting */
  closeJob: async (jobId: string): Promise<any> => {
    const res = await apiClient.post(`/api/jobs/admin/${jobId}/close`);
    return res.data;
  },
};
