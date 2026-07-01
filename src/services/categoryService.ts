import { apiClient } from "./apiClient";
import {
  CategoryItem,
  SkillServiceItem,
  SubCategoryItem,
} from "@/types/category.types";

/** Normalise both array and { data: [] } shaped responses */
const extractList = <T>(payload: any): T[] => {
  if (Array.isArray(payload)) return payload;
  if (payload?.data && Array.isArray(payload.data)) return payload.data;
  return [];
};

export const categoryService = {
  // ─── GET ─────────────────────────────────────────────────────────────────────

  /** Fetch all main categories */
  getCategories: async (): Promise<CategoryItem[]> => {
    const res = await apiClient.get<any>("/api/master/categories");
    return extractList<CategoryItem>(res.data);
  },

  /** Fetch skill services under a given category (lazy – only called on selection) */
  getSkillServices: async (categoryId: string): Promise<SkillServiceItem[]> => {
    const res = await apiClient.get<any>(`/api/master/skill-services/${categoryId}`);
    return extractList<SkillServiceItem>(res.data);
  },

  /** Fetch sub categories under a given skill service (lazy – only called on selection) */
  getSubCategories: async (skillServiceId: string): Promise<SubCategoryItem[]> => {
    const res = await apiClient.get<any>(`/api/master/sub-categories/${skillServiceId}`);
    return extractList<SubCategoryItem>(res.data);
  },

  // ─── POST ────────────────────────────────────────────────────────────────────

  /** Create a main category (multipart/form-data) — returns the created item */
  createCategory: async (formData: FormData): Promise<CategoryItem> => {
    const res = await apiClient.post<any>(
      "/api/master/category",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    // Normalise: API may return { data: item } or the item directly
    const body = res.data;
    return body?.data ?? body;
  },

  /** Create a skill service (multipart/form-data) — returns the created item */
  createSkillService: async (formData: FormData): Promise<SkillServiceItem> => {
    const res = await apiClient.post<any>(
      "/api/master/skill-service",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    const body = res.data;
    return body?.data ?? body;
  },

  /** Create a sub category (multipart/form-data) — returns the created item */
  createSubCategory: async (formData: FormData): Promise<SubCategoryItem> => {
    const res = await apiClient.post<any>(
      "/api/master/sub-category",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    const body = res.data;
    return body?.data ?? body;
  },

  // ─── PATCH (update) ──────────────────────────────────────────────────────────

  /** Update an existing category by ID */
  updateCategory: async (id: string, formData: FormData): Promise<CategoryItem> => {
    const res = await apiClient.patch<any>(
      `/api/master/category/${id}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    const body = res.data;
    return body?.data ?? body;
  },

  /** Update an existing skill service by ID */
  updateSkillService: async (id: string, formData: FormData): Promise<SkillServiceItem> => {
    const res = await apiClient.patch<any>(
      `/api/master/skill-service/${id}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    const body = res.data;
    return body?.data ?? body;
  },

  /** Update an existing sub category by ID */
  updateSubCategory: async (id: string, formData: FormData): Promise<SubCategoryItem> => {
    const res = await apiClient.patch<any>(
      `/api/master/sub-category/${id}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    const body = res.data;
    return body?.data ?? body;
  },

  // ─── TOGGLE (soft delete) ─────────────────────────────────────────────────────

  /** Toggle active/inactive for a main category */
  toggleCategory: async (id: string): Promise<void> => {
    await apiClient.patch(`/api/master/category/${id}/toggle`);
  },

  /** Toggle active/inactive for a skill service */
  toggleSkillService: async (id: string): Promise<void> => {
    await apiClient.patch(`/api/master/skill-service/${id}/toggle`);
  },

  /** Toggle active/inactive for a sub category */
  toggleSubCategory: async (id: string): Promise<void> => {
    await apiClient.patch(`/api/master/sub-category/${id}/toggle`);
  },

  /** Fetch category requests */
  getCategoryRequests: async (params?: any): Promise<any> => {
    const cleanParams: Record<string, any> = {};
    if (params) {
      if (params.page !== undefined) cleanParams.page = params.page;
      if (params.limit !== undefined) cleanParams.limit = params.limit;
      if (params.status && params.status !== "--") cleanParams.status = params.status;
      if (params.search) cleanParams.search = params.search;
    }
    const res = await apiClient.get<any>("/api/admin/category-requests", {
      params: cleanParams,
    });
    return res.data;
  },

  /** Review (approve or reject) a category request */
  reviewCategoryRequest: async (
    id: string,
    payload: { action: "APPROVE" | "REJECT"; rejectReason: string | null }
  ): Promise<any> => {
    const res = await apiClient.post(`/api/admin/category-requests/${id}/review`, payload);
    return res.data;
  },
};
