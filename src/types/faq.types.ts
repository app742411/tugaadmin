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
  message?: string;
  data: FAQItem[];
}

export interface CreateFAQInput {
  question: string;
  answer: string;
  audience: "CUSTOMER" | "TRADER" | "BOTH" | string;
  isActive: boolean;
  sortOrder: number;
}
