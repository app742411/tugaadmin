import { apiClient } from "./apiClient";
import { FAQItem, CreateFAQInput, FAQListResponse } from "@/types/faq.types";

export const faqService = {
  /** Fetch all FAQs */
  getFaqs: async (params?: { page?: number; limit?: number; audience?: string }): Promise<FAQListResponse> => {
    const res = await apiClient.get<FAQListResponse>("/api/faq", {
      params: {
        limit: 50,
        ...params,
      }
    });
    return res.data;
  },

  /** Create a new FAQ entry */
  createFaq: async (data: CreateFAQInput): Promise<any> => {
    const res = await apiClient.post("/api/faq", data);
    return res.data;
  },

  /** Update an existing FAQ entry */
  updateFaq: async (id: string, data: CreateFAQInput): Promise<any> => {
    const res = await apiClient.put(`/api/faq/${id}`, data);
    return res.data;
  },

  /** Delete an FAQ entry */
  deleteFaq: async (id: string): Promise<any> => {
    const res = await apiClient.delete(`/api/faq/${id}`);
    return res.data;
  },
};
