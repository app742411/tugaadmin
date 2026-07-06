import { apiClient } from "./apiClient";
import { NotificationResponse } from "@/types/notification.types";

export const notificationService = {
  getMyNotifications: async (page = 1, limit = 20): Promise<NotificationResponse> => {
    const res = await apiClient.get<NotificationResponse>("/api/notification/my-notifications", {
      params: { page, limit },
    });
    return res.data;
  },

  readAll: async (): Promise<any> => {
    const res = await apiClient.patch("/api/notification/read-all");
    return res.data;
  },
};
