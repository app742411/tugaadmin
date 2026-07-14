export interface TraderProfile {
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
  minimumExperience: boolean;
  authorisedBusiness: boolean;
  understandVettingPolicy: boolean;
  acceptedTermsConditions: boolean;
  acceptedPrivacyPolicy: boolean;
  verificationStatus: "PENDING" | "APPROVED" | "REJECTED" | "MANUAL_CHECK";
  rejectReason: string | null;
  subscriptionTier: "BRONZE" | "SILVER" | "GOLD" | null;
  subscriptionStatus: "ACTIVE" | "TRIAL" | "INACTIVE" | null;
  subscriptionStartDate: string | null;
  subscriptionEndDate: string | null;
  trialEndsAt: string | null;
  stripeCustomerId: string | null;
  isVisible: boolean;
  insured: boolean;
  badges: string[];
  ratingAvg: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  registrationStep: number;
  isRegistrationCompleted: boolean;
}

export interface TraderItem {
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
  role: "TRADER";
  status: "ACTIVE" | "INACTIVE" | "BLOCKED" | "PENDING";
  isVerified: boolean;
  acceptedTerms: boolean;
  createdAt: string;
  updatedAt: string;
  traderProfile: TraderProfile | null;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TraderQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface TraderResponse {
  success: boolean;
  message: string;
  data: TraderItem[];
  pagination: PaginationInfo;
}

export interface TraderDetail {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  profileImage: string | null;
  latitude: string | null;
  longitude: string | null;
  role: "TRADER";
  status: "ACTIVE" | "INACTIVE" | "BLOCKED" | "PENDING";
  isVerified: boolean;
  acceptedTerms: boolean;
  createdAt: string;
  updatedAt: string;
  isOnline: boolean;
  lastSeen: string | null;
  traderProfile: {
    id: string;
    userId: string;
    companyName: string | null;
    companyType: string | null;
    registrationNumber: string | null;
    tradeCategories: Array<{ id: string; name: string; image: string | null }>;
    skillsServices: Array<{ id: string; name: string; image: string | null }>;
    subCategories: Array<{ id: string; name: string; image: string | null }>;
    workRadius: number;
    location: string | null;
    about: string | null;
    logo: string | null;
    document: string | null;
    minimumExperience: boolean;
    authorisedBusiness: boolean;
    understandVettingPolicy: boolean;
    acceptedTermsConditions: boolean;
    acceptedPrivacyPolicy: boolean;
    verificationStatus: "PENDING" | "APPROVED" | "REJECTED" | "MANUAL_CHECK";
    rejectReason: string | null;
    subscriptionTier: "BRONZE" | "SILVER" | "GOLD" | null;
    subscriptionStatus: "ACTIVE" | "TRIAL" | "INACTIVE" | null;
    subscriptionStartDate: string | null;
    subscriptionEndDate: string | null;
    trialEndsAt: string | null;
    stripeCustomerId: string | null;
    isVisible: boolean;
    insured: boolean;
    badges: string[];
    createdAt: string;
    updatedAt: string;
    registrationStep: number;
    isRegistrationCompleted: boolean;
    aboutUs: string | null;
    subscription: {
      id: string;
      traderProfileId: string;
      planId: string;
      priceId: string;
      status: string;
      isTrial: boolean;
      trialStartDate: string | null;
      trialEndDate: string | null;
      startDate: string | null;
      endDate: string | null;
      cancelledAt: string | null;
      nextBillingDate: string | null;
      failedPaymentCount: number;
      profileHiddenAt: string | null;
      stripeSubscriptionId: string | null;
      stripeCustomerId: string | null;
      createdAt: string;
      updatedAt: string;
      plan: {
        id: string;
        name: string;
        description: string;
        maxTrades: number;
        unlimitedTrades: boolean;
        maxPortfolioUploads: number;
        allowPortfolioVideos: boolean;
        maxQuotesPerDay: number;
        bannerLabel: string | null;
        featuredAtTop: boolean;
        exposureLevel: string;
        newJobAlerts: boolean;
        customerSupportDays: number;
        trialEnabled: boolean;
        trialDays: number;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
      };
      price: {
        id: string;
        planId: string;
        billingCycle: string;
        amount: string;
        currency: string;
        stripePriceId: string | null;
        mbwayPlanId: string | null;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
      };
    } | null;
    portfolioItems: any[];
    certificates: any[];
    insuranceDocuments: any[];
    categoryChangeRequests: any[];
  } | null;
  traderMetrics: {
    id: string;
    traderId: string;
    averageRating: number;
    bayesianRating: number;
    totalReviews: number;
    invitesCount: number;
    responsesCount: number;
    responseRate: number;
    recentLeads: number;
    recentLeadsResetAt: string | null;
    completedJobs: number;
    totalMatchedJobs: number;
    createdAt: string;
    updatedAt: string;
  } | null;
  customerReviews: any[];
  traderReviews: any[];
  savedTraders: any[];
  savedByCustomers: Array<{
    id: string;
    customerId: string;
    traderId: string;
    createdAt: string;
    customer?: {
      id: string;
      fullName: string;
      email: string;
      profileImage: string | null;
    };
  }>;
}

