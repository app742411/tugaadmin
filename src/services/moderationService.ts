import { apiClient } from "./apiClient";
import { ModerationFlag } from "@/types/moderation.types";

export const moderationService = {
  getFlags: async (): Promise<ModerationFlag[]> => {
    const res = await apiClient.get<ModerationFlag[]>("/api/moderation/flags");
    return res.data;
  },

  approveFlag: async (id: string): Promise<any> => {
    const res = await apiClient.patch(`/api/moderation/flags/${id}/approve`);
    return res.data;
  },

  rejectFlag: async (id: string): Promise<any> => {
    const res = await apiClient.patch(`/api/moderation/flags/${id}/reject`);
    return res.data;
  },
};
