import { apiClient } from "./apiClient";

export const deactiveAccountService = {
  getDeactivatedAccounts: async (params?: Record<string, any>) => {
    const res = await apiClient.get("/api/admin/deactivated-accounts", { params });
    return res.data;
  },
  getUserDetails: async (userId: string) => {
    const res = await apiClient.get(`/api/admin/users/${userId}`);
    return res.data;
  },
  reactivateAccount: async (userId: string) => {
    const res = await apiClient.patch(`/api/admin/users/${userId}/reactivate`);
    return res.data;
  }
};
