"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { faqService } from "@/services/faqService";
import { FAQListResponse, CreateFAQInput } from "@/types/faq.types";

export const useGetFaqs = (params?: { page?: number; limit?: number; audience?: string }) => {
  const { data, isLoading, error, refetch } = useQuery<FAQListResponse>({
    queryKey: ["faqs", params],
    queryFn: () => faqService.getFaqs(params),
  });

  return {
    data: data?.data || [],
    pagination: {
      total: data?.total || 0,
      page: data?.page || 1,
      limit: data?.limit || 50,
      totalPages: data?.limit ? Math.ceil((data.total || 0) / data.limit) : 0,
    },
    isLoading,
    error: error ? (error as any).message || "Failed to load FAQs" : null,
    refetch,
  };
};

export const useCreateFaq = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateFAQInput) => faqService.createFaq(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
    },
  });
};

export const useUpdateFaq = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateFAQInput }) =>
      faqService.updateFaq(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
    },
  });
};

export const useDeleteFaq = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => faqService.deleteFaq(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
    },
  });
};
