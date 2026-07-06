export interface SuggestedTrader {
  traderId: string;
  email: string;
  fullName: string;
  profileImage: string | null;
  totalReviews: number;
  averageRating: number;
  featuredAtTop: boolean;
  distanceKm: number;
  finalScore: number;
}

export interface SuggestedTraderQueryParams {
  limit?: number;
  radius?: number;
}

export interface JobCustomer {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  profileImage: string | null;
  createdAt: string;
}

export interface JobCategory {
  id: string;
  name: string;
}

export interface JobSubCategory {
  id: string;
  name: string;
}

export interface JobSkillService {
  id: string;
  name: string;
}

export interface JobTrader {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  profileImage: string | null;
}

export interface JobAttachment {
  id: string;
  jobId: string;
  file: string;
  createdAt: string;
}

export interface TraderMatch {
  id: string;
  jobId: string;
  traderId: string;
  radiusKm: number;
  distanceKm: number;
  score: number;
  status: "SENT" | "VIEWED" | "RESPONDED" | "ACCEPTED" | "REJECTED" | string;
  sentAt: string | null;
  viewedAt: string | null;
  respondedAt: string | null;
  createdAt: string;
  isQuoteSubmitted: boolean;
  isSelected: boolean;
  trader: JobTrader;
}

export interface EscalationLog {
  id: string;
  jobId: string;
  previousRadius: number;
  newRadius: number;
  tradersSent: number;
  createdAt: string;
}

export interface JobItem {
  id: string;
  customerId: string;
  categoryId: string;
  skillServiceId: string;
  subCategoryId: string;
  postcode: string | null;
  latitude: string;
  longitude: string;
  title: string;
  description: string;
  timescale: "FLEXIBLE" | "URGENT" | "READY_TO_START" | string;
  emergency: boolean;
  budgetRange: string;
  status: "POSTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | string;
  distributionStatus: "MANUAL_REVIEW" | "AUTO" | string;
  selectedTraderId: string | null;
  quotesReceived: number;
  currentRadiusKm: number;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  lastEscalatedAt: string | null;
  escalationVersion: number;
  customer: JobCustomer;
  category: JobCategory;
  subCategory: JobSubCategory;
  skillService: JobSkillService;
  selectedTrader: JobTrader | null;
  attachments: JobAttachment[];
  traderMatches?: TraderMatch[];
  escalationLogs?: EscalationLog[];
  _count: {
    quotes: number;
    traderMatches?: number;
    conversations?: number;
    reviews?: number;
    attachments?: number;
  };
  counts?: {
    quotes: number;
    traderMatches: number;
    conversations: number;
    reviews: number;
    attachments: number;
  };
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface JobResponse {
  message: string;
  data: JobItem[];
  pagination: PaginationInfo;
}

export interface JobDetailResponse {
  message: string;
  data: JobItem;
}

export interface JobQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface JobActionLog {
  id: string;
  jobId: string;
  action: string;
  metadata?: Record<string, any>;
  createdAt: string;
  adminId?: string;
  admin?: {
    id: string;
    fullName: string;
    email: string;
  };
  job?: {
    id: string;
    title: string;
    status: string;
  };
}

export interface JobActionLogResponse {
  message: string;
  data: JobActionLog[];
  pagination: PaginationInfo;
}

