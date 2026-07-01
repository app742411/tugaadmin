"use client";

import { useQuery } from "@tanstack/react-query";
import { quoteService } from "@/services/quoteService";
import { QuoteQueryParams, QuoteResponse } from "@/types/quote.types";

export const useGetQuotes = (params: QuoteQueryParams) => {
  const { data, isLoading, error, refetch, isPlaceholderData } = useQuery<QuoteResponse>({
    queryKey: ["quotes", params],
    queryFn: () => quoteService.getQuotes(params),
    placeholderData: (previousData) => previousData,
  });

  return {
    data,
    isLoading,
    error: error ? (error as any).message || "Failed to load quotes" : null,
    refetch,
    isPlaceholderData,
  };
};
