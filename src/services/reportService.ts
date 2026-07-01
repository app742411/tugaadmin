import { apiClient } from "./apiClient";
import { ReportQueryParams, ReportListResponse, ReportItem, ReportDetailResponse } from "@/types/report.types";

export const reportService = {
  /** Fetch paginated list of reports */
  getReports: async (params?: ReportQueryParams): Promise<ReportListResponse> => {
    const cleanParams: Record<string, any> = {};
    if (params) {
      if (params.page !== undefined) cleanParams.page = params.page;
      if (params.limit !== undefined) cleanParams.limit = params.limit;
      if (params.status && params.status !== "--") cleanParams.status = params.status;
      if (params.search) cleanParams.search = params.search;
    }

    const res = await apiClient.get<ReportListResponse>("/api/report/admin", {
      params: cleanParams,
    });
    return res.data;
  },

  /** Fetch details of a single report */
  getReportDetail: async (reportId: string): Promise<ReportItem> => {
    const res = await apiClient.get<ReportDetailResponse>(`/api/report/admin/${reportId}`);
    // If the response wraps it in a data property
    return res.data?.data || (res.data as any);
  },

  /** Update status of a report */
  updateReportStatus: async (reportId: string, status: "REVIEWED" | "RESOLVED" | "REJECTED" | string): Promise<any> => {
    const res = await apiClient.patch(`/api/report/admin/${reportId}/status`, {
      status,
    });
    return res.data;
  },
};
