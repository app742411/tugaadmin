import { apiClient } from "./apiClient";
import { TraderQueryParams, TraderResponse, TraderDetail } from "@/types/trader.types";

export const traderService = {
  /** Fetch paginated, filtered, and searched list of traders */
  getTraders: async (params?: TraderQueryParams): Promise<TraderResponse> => {
    const cleanParams: Record<string, any> = {};
    if (params) {
      if (params.page !== undefined) cleanParams.page = params.page;
      if (params.limit !== undefined) cleanParams.limit = params.limit;
      if (params.status && params.status !== "--") cleanParams.status = params.status;
      if (params.search) cleanParams.search = params.search;
    }

    const res = await apiClient.get<TraderResponse>("/api/admin/traders", {
      params: cleanParams,
    });
    return res.data;
  },

  /** Verify or Vetting reject a trader */
  verifyTrader: async (
    id: string,
    payload: { verificationStatus: "APPROVED" | "REJECTED" | "MANUAL_CHECK"; rejectReason: string | null }
  ): Promise<any> => {
    const res = await apiClient.patch(`/api/admin/verify-trader/${id}`, payload);
    return res.data;
  },

  /** Fetch individual trader details by ID */
  getTraderDetail: async (id: string): Promise<TraderDetail> => {
    const res = await apiClient.get<TraderDetail>(`/api/admin/users/${id}`);
    return res.data;
  },
};
