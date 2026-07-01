"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { faqService } from "@/services/faqService";
import { FAQListResponse, CreateFAQInput } from "@/types/faq.types";

export const useGetFaqs = () => {
  const { data, isLoading, error, refetch } = useQuery<FAQListResponse>({
    queryKey: ["faqs"],
    queryFn: () => faqService.getFaqs(),
  });

  return {
    data: data?.data || [],
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
