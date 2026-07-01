export interface ReviewCustomer {
  id: string;
  fullName: string;
  email: string;
  profileImage?: string | null;
}

export interface ReviewTrader {
  id: string;
  fullName: string;
  email: string;
  profileImage?: string | null;
}

export interface ReviewProof {
  id: string;
  fileUrl: string;
  originalName?: string;
  mimeType?: string;
  createdAt?: string;
}

export interface ReviewItem {
  id: string;
  customerId: string;
  traderId: string;
  jobId: string;
  reviewType: string;
  moderationType: string;
  interactionSource: string;
  rating: number;
  title: string;
  review: string;
  wasWorkCompleted: boolean;
  workCompletedDate: string | null;
  wouldRecommendTrader: boolean;
  noWorkReason: string | null;
  noWorkReasonText: string | null;
  isVerified: boolean;
  proofRequired: boolean;
  status: "PENDING" | "APPROVED" | "REJECTED";
  traderReply: string | null;
  traderReplyAt: string | null;
  editableUntil: string;
  reviewRequestExpiresAt: string;
  approvedAt: string | null;
  approvedBy: string | null;
  rejectedAt: string | null;
  rejectedBy: string | null;
  rejectionReason: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  customer: ReviewCustomer;
  trader: ReviewTrader;
  proofs: ReviewProof[];
}

export interface ReviewPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ReviewQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  reviewType?: string;
  moderationType?: string;
}

export interface ReviewResponse {
  message: string;
  data: ReviewItem[];
  pagination: ReviewPagination;
}
