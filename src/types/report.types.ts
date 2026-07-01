export interface ReportUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  profileImage?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  role: string;
  status: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  isOnline: boolean;
  lastSeen?: string | null;
}

export interface ReportItem {
  id: string;
  reporterId: string;
  reportType: "USER" | "REVIEW" | "JOB" | string;
  targetId: string;
  reason: "SPAM" | "ABUSE" | "INAPPROPRIATE" | string;
  customReason: string | null;
  status: "PENDING" | "REVIEWED" | "RESOLVED" | "REJECTED" | string;
  reviewedById: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  reporter: {
    id: string;
    fullName: string;
    email: string;
  };
  reviewedBy?: ReportUser | null;
  targetData?: ReportUser | any | null; // Can be user details or other target type details
}

export interface ReportPaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

export interface ReportListResponse {
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
  data: ReportItem[];
}

export interface ReportDetailResponse {
  message?: string;
  data: ReportItem;
}

export interface ReportQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}
