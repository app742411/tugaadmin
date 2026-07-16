export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  audience: "CUSTOMER" | "TRADER" | "BOTH" | string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface FAQListResponse {
  success?: boolean;
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
  data: FAQItem[];
}

export interface CreateFAQInput {
  question: string;
  answer: string;
  audience: "CUSTOMER" | "TRADER" | "BOTH" | string;
  isActive: boolean;
  sortOrder: number;
}
