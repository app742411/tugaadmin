import { apiClient } from "./apiClient";
import { CustomerQueryParams, CustomerResponse, CustomerDetail } from "@/types/customer.types";

export const customerService = {
  /** Fetch paginated, filtered, and searched list of customers */
  getCustomers: async (params?: CustomerQueryParams): Promise<CustomerResponse> => {
    const cleanParams: Record<string, any> = {};
    if (params) {
      if (params.page !== undefined) cleanParams.page = params.page;
      if (params.limit !== undefined) cleanParams.limit = params.limit;
      if (params.status && params.status !== "--") cleanParams.status = params.status;
      if (params.search) cleanParams.search = params.search;
    }

    const res = await apiClient.get<CustomerResponse>("/api/admin/customers", {
      params: cleanParams,
    });
    return res.data;
  },

  /** Fetch individual customer details by ID */
  getCustomerDetail: async (id: string): Promise<CustomerDetail> => {
    const res = await apiClient.get<CustomerDetail>(`/api/admin/users/${id}`);
    return res.data;
  },
};
