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

export interface PlanItem {
  id: string;
  name: string;
  description: string;
  maxCategories: number;
  maxPortfolioUploads: number;
  maxQuotesPerDay: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  prices: PlanPrice[];
}
