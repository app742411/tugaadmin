export interface QuoteTrader {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  profileImage: string | null;
}

export interface QuoteCustomer {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
}

export interface QuoteCategory {
  id: string;
  name: string;
}

export interface QuoteJob {
  id: string;
  title: string;
  status: string;
  budgetRange: string;
  createdAt: string;
  customer: QuoteCustomer;
  category: QuoteCategory;
  subCategory: QuoteCategory;
  skillService: QuoteCategory;
}

export interface QuoteItem {
  id: string;
  jobId: string;
  traderId: string;
  price: string;
  estimatedDays: number;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  trader: QuoteTrader;
  job: QuoteJob;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QuoteResponse {
  message: string;
  data: QuoteItem[];
  pagination: PaginationInfo;
}

export interface QuoteQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}
