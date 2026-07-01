import { apiClient } from "./apiClient";
import { PlanItem } from "@/types/plan.types";

export const planService = {
  /** Fetch all subscription plans (Bronze, Silver, Gold) with pricing details */
  getPlans: async (): Promise<PlanItem[]> => {
    const res = await apiClient.get<PlanItem[]>("/api/admin-plan");

    // Normalise shape: return array directly, or extract from data
    const payload = res.data;
    if (Array.isArray(payload)) return payload;
    if (payload && (payload as any).data && Array.isArray((payload as any).data)) {
      return (payload as any).data;
    }
    return [];
  },

  /** Update an existing plan by ID */
  updatePlan: async (id: string, data: any): Promise<PlanItem> => {
    const res = await apiClient.patch<any>(`/api/admin-plan/${id}`, data);
    const body = res.data;
    return body?.data ?? body;
  },
};
