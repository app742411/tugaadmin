"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryService } from "@/services/categoryService";
import { CategoryRequestQueryParams, CategoryRequestResponse } from "@/types/category-request.types";

export const useGetCategoryRequests = (params: CategoryRequestQueryParams) => {
  const { data, isLoading, error, refetch, isPlaceholderData } = useQuery<CategoryRequestResponse>({
    queryKey: ["categoryRequests", params],
    queryFn: () => categoryService.getCategoryRequests(params),
    placeholderData: (previousData) => previousData,
  });

  return {
    data,
    isLoading,
    error: error ? (error as any).message || "Failed to load category requests" : null,
    refetch,
    isPlaceholderData,
  };
};

export const useReviewCategoryRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { action: "APPROVE" | "REJECT"; rejectReason: string | null } }) =>
      categoryService.reviewCategoryRequest(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categoryRequests"] });
    },
  });
};
