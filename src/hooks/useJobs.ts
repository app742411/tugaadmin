"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobService } from "@/services/jobService";
import { JobQueryParams, JobResponse, JobDetailResponse, SuggestedTrader, SuggestedTraderQueryParams } from "@/types/job.types";

export const useGetJobs = (params: JobQueryParams) => {
  const { data, isLoading, error, refetch, isPlaceholderData } = useQuery<JobResponse>({
    queryKey: ["jobs", params],
    queryFn: () => jobService.getJobs(params),
    placeholderData: (previousData) => previousData,
  });

  return {
    data,
    isLoading,
    error: error ? (error as any).message || "Failed to load jobs" : null,
    refetch,
    isPlaceholderData,
  };
};

export const useGetManualReviewJobs = (params: JobQueryParams) => {
  const { data, isLoading, error, refetch, isPlaceholderData } = useQuery<JobResponse>({
    queryKey: ["manualReviewJobs", params],
    queryFn: () => jobService.getManualReviewJobs(params),
    placeholderData: (previousData) => previousData,
  });

  return {
    data,
    isLoading,
    error: error ? (error as any).message || "Failed to load manual review jobs" : null,
    refetch,
    isPlaceholderData,
  };
};

export const useGetJobDetail = (jobId: string) => {
  const { data, isLoading, error, refetch } = useQuery<JobDetailResponse>({
    queryKey: ["jobDetail", jobId],
    queryFn: () => jobService.getJobDetail(jobId),
    enabled: !!jobId,
  });

  return {
    data: data?.data,
    isLoading,
    error: error ? (error as any).message || "Failed to load job details" : null,
    refetch,
  };
};

export const useGetSuggestedTraders = (jobId: string, params?: SuggestedTraderQueryParams) => {
  const { data, isLoading, error, refetch } = useQuery<SuggestedTrader[]>({
    queryKey: ["suggestedTraders", jobId, params],
    queryFn: () => jobService.getSuggestedTraders(jobId, params),
    enabled: !!jobId,
  });

  return {
    data,
    isLoading,
    error: error ? (error as any).message || "Failed to load suggested traders" : null,
    refetch,
  };
};

export const useAssignManualReviewTraders = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, traderIds }: { jobId: string; traderIds: string[] }) =>
      jobService.assignManualReviewTraders(jobId, traderIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manualReviewJobs"] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["jobDetail"] });
      queryClient.invalidateQueries({ queryKey: ["suggestedTraders"] });
    },
  });
};

export const usePauseJob = () => {
  const queryClient = queryClientHook();
  return useMutation({
    mutationFn: (jobId: string) => jobService.pauseJob(jobId),
    onSuccess: (_, jobId) => {
      queryClient.invalidateQueries({ queryKey: ["jobDetail", jobId] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["manualReviewJobs"] });
    },
  });
};

export const useResumeJob = () => {
  const queryClient = queryClientHook();
  return useMutation({
    mutationFn: (jobId: string) => jobService.resumeJob(jobId),
    onSuccess: (_, jobId) => {
      queryClient.invalidateQueries({ queryKey: ["jobDetail", jobId] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["manualReviewJobs"] });
    },
  });
};

export const useRestartAutoJob = () => {
  const queryClient = queryClientHook();
  return useMutation({
    mutationFn: (jobId: string) => jobService.restartAutoJob(jobId),
    onSuccess: (_, jobId) => {
      queryClient.invalidateQueries({ queryKey: ["jobDetail", jobId] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["manualReviewJobs"] });
    },
  });
};

export const useIncreaseRadius = () => {
  const queryClient = queryClientHook();
  return useMutation({
    mutationFn: ({ jobId, radiusKm }: { jobId: string; radiusKm: number }) =>
      jobService.increaseRadius(jobId, radiusKm),
    onSuccess: (_, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: ["jobDetail", jobId] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["manualReviewJobs"] });
    },
  });
};

export const useCloseJob = () => {
  const queryClient = queryClientHook();
  return useMutation({
    mutationFn: (jobId: string) => jobService.closeJob(jobId),
    onSuccess: (_, jobId) => {
      queryClient.invalidateQueries({ queryKey: ["jobDetail", jobId] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["manualReviewJobs"] });
    },
  });
};

// Helper function to avoid queryClient access issues
function queryClientHook() {
  return useQueryClient();
}
