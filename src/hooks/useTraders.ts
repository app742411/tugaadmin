"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { traderService } from "@/services/traderService";
import { TraderQueryParams, TraderResponse, TraderDetail } from "@/types/trader.types";

export const useGetTraders = (params: TraderQueryParams) => {
  const { data, isLoading, error, refetch, isPlaceholderData } = useQuery<TraderResponse>({
    queryKey: ["traders", params],
    queryFn: () => traderService.getTraders(params),
    placeholderData: (previousData) => previousData,
  });

  return {
    data,
    isLoading,
    error: error ? (error as any).message || "Failed to load traders" : null,
    refetch,
    isPlaceholderData,
  };
};

export const useGetTraderDetail = (id: string) => {
  const { data, isLoading, error, refetch } = useQuery<TraderDetail>({
    queryKey: ["traderDetail", id],
    queryFn: () => traderService.getTraderDetail(id),
    enabled: !!id,
  });

  return {
    data,
    isLoading,
    error: error ? (error as any).message || "Failed to load trader details" : null,
    refetch,
  };
};

export const useVerifyTrader = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { verificationStatus: "APPROVED" | "REJECTED" | "MANUAL_CHECK"; rejectReason: string | null };
    }) => traderService.verifyTrader(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["traders"] });
      queryClient.invalidateQueries({ queryKey: ["traderDetail", variables.id] });
    },
  });
};
