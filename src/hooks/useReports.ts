"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reportService } from "@/services/reportService";
import { ReportQueryParams, ReportListResponse, ReportItem } from "@/types/report.types";

export const useGetReports = (params: ReportQueryParams) => {
  const { data, isLoading, error, refetch, isPlaceholderData } = useQuery<ReportListResponse>({
    queryKey: ["reports", params],
    queryFn: () => reportService.getReports(params),
    placeholderData: (previousData) => previousData,
  });

  return {
    data,
    isLoading,
    error: error ? (error as any).message || "Failed to load reports" : null,
    refetch,
    isPlaceholderData,
  };
};

export const useGetReportDetail = (reportId: string) => {
  const { data, isLoading, error, refetch } = useQuery<ReportItem>({
    queryKey: ["reportDetail", reportId],
    queryFn: () => reportService.getReportDetail(reportId),
    enabled: !!reportId,
  });

  return {
    data,
    isLoading,
    error: error ? (error as any).message || "Failed to load report details" : null,
    refetch,
  };
};

export const useUpdateReportStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId, status }: { reportId: string; status: "REVIEWED" | "RESOLVED" | "REJECTED" | string }) =>
      reportService.updateReportStatus(reportId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["reportDetail", variables.reportId] });
    },
  });
};
