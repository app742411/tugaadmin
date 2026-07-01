"use client";

import { useQuery } from "@tanstack/react-query";
import { reviewService } from "@/services/reviewService";
import { ReviewQueryParams, ReviewResponse } from "@/types/review.types";

export const useGetPendingReviews = (params: ReviewQueryParams) => {
  const { data, isLoading, error, refetch, isPlaceholderData } = useQuery<ReviewResponse>({
    queryKey: ["pendingReviews", params],
    queryFn: () => reviewService.getPendingReviews(params),
    placeholderData: (previousData) => previousData,
  });

  return {
    data,
    isLoading,
    error: error ? (error as any).message || "Failed to load pending reviews" : null,
    refetch,
    isPlaceholderData,
  };
};

export const useGetAllReviews = (params: ReviewQueryParams) => {
  const { data, isLoading, error, refetch, isPlaceholderData } = useQuery<ReviewResponse>({
    queryKey: ["allReviews", params],
    queryFn: () => reviewService.getAllReviews(params),
    placeholderData: (previousData) => previousData,
  });

  return {
    data,
    isLoading,
    error: error ? (error as any).message || "Failed to load reviews" : null,
    refetch,
    isPlaceholderData,
  };
};
