export interface CategoryRequestItem {
  id: string;
  traderProfileId: string;
  tradeCategories: string[];
  skillsServices: string[];
  subCategories: string[];
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  reviewedAt: string | null;
  rejectReason: string | null;
  reviewedBy: string | null;
  traderProfile: {
    id: string;
    userId: string;
    companyName: string | null;
    companyType: string | null;
    registrationNumber: string | null;
    tradeCategories: string[];
    skillsServices: string[];
    subCategories: string[];
    workRadius: number;
    location: string | null;
    about: string | null;
    logo: string | null;
    document: string | null;
    verificationStatus: string;
    verifiedAt: string | null;
    verifiedBy: string | null;
    rejectReason: string | null;
    subscriptionTier: string;
    subscriptionStatus: string;
    subscriptionStartDate: string | null;
    subscriptionEndDate: string | null;
    trialEndsAt: string | null;
    stripeCustomerId: string | null;
    isVisible: boolean;
    insured: boolean;
    badges: any[];
    createdAt: string;
    updatedAt: string;
    registrationStep: number;
    isRegistrationCompleted: boolean;
    aboutUs: string | null;
    user: {
      id: string;
      fullName: string;
      email: string;
      phone: string | null;
    };
  } | null;
  admin: any | null;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CategoryRequestResponse {
  data: CategoryRequestItem[];
  pagination: PaginationInfo;
}

export interface CategoryRequestQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}
