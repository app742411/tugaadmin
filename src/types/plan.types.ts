export interface PlanPrice {
  id: string;
  planId: string;
  billingCycle: "MONTHLY" | "YEARLY";
  amount: string;
  currency: string;
  stripePriceId: string | null;
  mbwayPlanId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ExposureLevel = "STANDARD" | "INCREASED" | "MAXIMUM" | string;

export interface PlanItem {
  id: string;
  name: string;
  description: string;
  maxTrades: number;
  unlimitedTrades: boolean;
  maxPortfolioUploads: number;
  allowPortfolioVideos: boolean;
  maxQuotesPerDay: number;
  bannerLabel?: string | null;
  featuredAtTop: boolean;
  exposureLevel: ExposureLevel;
  newJobAlerts: boolean;
  customerSupportDays: number;
  trialEnabled: boolean;
  trialDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  prices: PlanPrice[];
  maxCategories?: number;
}

export interface UpdatePlanDto {
  description: string;
  maxTrades: number;
  unlimitedTrades: boolean;
  maxPortfolioUploads: number;
  allowPortfolioVideos: boolean;
  maxQuotesPerDay: number;
  bannerLabel: string;
  featuredAtTop: boolean;
  exposureLevel: ExposureLevel;
  newJobAlerts: boolean;
  customerSupportDays: number;
  trialEnabled: boolean;
  trialDays: number;
  monthlyPrice: number;
  yearlyPrice: number;
  isActive: boolean;
}
