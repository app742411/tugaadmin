export interface CustomerItem {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  profileImage: string | null;
  addressLine: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  latitude: string | null;
  longitude: string | null;
  role: "CUSTOMER";
  status: "ACTIVE" | "INACTIVE" | "BLOCKED" | "PENDING";
  isVerified: boolean;
  acceptedTerms: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CustomerQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface CustomerResponse {
  success: boolean;
  message: string;
  data: CustomerItem[];
  pagination: PaginationInfo;
}

export interface SavedTrader {
  id: string;
  customerId: string;
  traderId: string;
  createdAt: string;
  trader?: {
    id: string;
    fullName: string;
    email: string;
    profileImage: string | null;
    status: string;
  };
}

export interface CustomerDetail {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  profileImage: string | null;
  latitude: number | null;
  longitude: number | null;
  role: string;
  status: "ACTIVE" | "INACTIVE" | "BLOCKED" | "PENDING";
  isVerified: boolean;
  acceptedTerms: boolean;
  createdAt: string;
  updatedAt: string;
  isOnline: boolean;
  lastSeen: string | null;
  traderProfile: any | null;
  traderMetrics: any | null;
  customerReviews: any[];
  traderReviews: any[];
  savedTraders: SavedTrader[];
  savedByCustomers: any[];
}

