import { apiClient } from "./apiClient";
import { QuoteQueryParams, QuoteResponse } from "@/types/quote.types";

export const quoteService = {
  /** Fetch paginated, filtered, and searched list of quotes */
  getQuotes: async (params?: QuoteQueryParams): Promise<QuoteResponse> => {
    const cleanParams: Record<string, any> = {};
    if (params) {
      if (params.page !== undefined) cleanParams.page = params.page;
      if (params.limit !== undefined) cleanParams.limit = params.limit;
      if (params.status && params.status !== "--") cleanParams.status = params.status;
      if (params.search) cleanParams.search = params.search;
    }

    const res = await apiClient.get<QuoteResponse>("/api/admin/quotes", {
      params: cleanParams,
    });
    return res.data;
  },
};
