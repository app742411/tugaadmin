"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { planService } from "@/services/planService";
import { PlanItem, PlanPrice, ExposureLevel, UpdatePlanDto } from "@/types/plan.types";
import { useToast } from "@/hooks/useToast";
import { ToastItem } from "@/types/category.types";

// ─── Toast Container Styles ──────────────────────────────────────────────────
const toastStyles: Record<ToastItem["type"], string> = {
  success: "bg-white dark:bg-gray-900 border-l-4 border-green-500 text-gray-800 dark:text-white",
  error: "bg-white dark:bg-gray-900 border-l-4 border-red-500 text-gray-800 dark:text-white",
  info: "bg-white dark:bg-gray-900 border-l-4 border-blue-500 text-gray-800 dark:text-white",
  warning: "bg-white dark:bg-gray-900 border-l-4 border-yellow-500 text-gray-800 dark:text-white",
};

const toastIcons: Record<ToastItem["type"], React.JSX.Element> = {
  success: (
    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  error: (
    <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  ),
  info: (
    <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
  ),
  warning: (
    <svg className="w-4 h-4 text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ),
};

// Helper to determine tier-specific theme styles
const getTierStyles = (name: string) => {
  const normalized = (name || "").toUpperCase();
  if (normalized.includes("BRONZE")) {
    return {
      border: "border-t-4 border-t-amber-700 dark:border-t-amber-600 border-gray-200 dark:border-gray-800",
      bg: "bg-white dark:bg-gray-900",
      accent: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
      badgeBg: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-300 dark:border-amber-700",
      priceText: "text-amber-900 dark:text-amber-100",
      glow: "",
    };
  }
  if (normalized.includes("GOLD")) {
    return {
      border: "border-t-4 border-t-yellow-500 dark:border-t-yellow-400 border-yellow-200 dark:border-yellow-900/60 shadow-yellow-500/5 shadow-xl",
      bg: "bg-white dark:bg-gray-900",
      accent: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
      badgeBg: "bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-950 font-bold border-yellow-400",
      priceText: "text-yellow-900 dark:text-yellow-100",
      glow: "ring-2 ring-yellow-400/20 dark:ring-yellow-400/10",
    };
  }
  // SILVER or generic
  return {
    border: "border-t-4 border-t-slate-400 dark:border-t-slate-500 border-gray-200 dark:border-gray-800",
    bg: "bg-white dark:bg-gray-900",
    accent: "bg-slate-500/10 text-slate-700 dark:text-slate-400",
    badgeBg: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700",
    priceText: "text-slate-900 dark:text-slate-100",
    glow: "",
  };
};

const getExposureBadge = (level: ExposureLevel) => {
  const normalized = (level || "STANDARD").toUpperCase();
  if (normalized === "MAXIMUM") {
    return {
      label: "Maximum Exposure",
      badgeClass: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/20",
    };
  }
  if (normalized === "INCREASED") {
    return {
      label: "Increased Exposure",
      badgeClass: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20",
    };
  }
  return {
    label: "Standard Exposure",
    badgeClass: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
  };
};

export default function PlansPage() {
  const queryClient = useQueryClient();
  const { data: plans = [], isLoading, error: queryError } = useQuery<PlanItem[]>({
    queryKey: ["plans"],
    queryFn: () => planService.getPlans(),
  });
  const error = queryError ? (queryError as any).message || "Failed to load subscription plans." : null;

  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">("MONTHLY");

  // Edit Modal State
  const [editingPlan, setEditingPlan] = useState<PlanItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formDesc, setFormDesc] = useState("");
  const [bannerLabel, setBannerLabel] = useState("");
  const [maxTrades, setMaxTrades] = useState<number>(1);
  const [unlimitedTrades, setUnlimitedTrades] = useState<boolean>(false);
  const [maxPortfolioUploads, setMaxPortfolioUploads] = useState<number>(5);
  const [allowPortfolioVideos, setAllowPortfolioVideos] = useState<boolean>(false);
  const [maxQuotesPerDay, setMaxQuotesPerDay] = useState<number>(3);
  const [featuredAtTop, setFeaturedAtTop] = useState<boolean>(false);
  const [exposureLevel, setExposureLevel] = useState<ExposureLevel>("STANDARD");
  const [newJobAlerts, setNewJobAlerts] = useState<boolean>(true);
  const [customerSupportDays, setCustomerSupportDays] = useState<number>(7);
  const [trialEnabled, setTrialEnabled] = useState<boolean>(true);
  const [trialDays, setTrialDays] = useState<number>(90);
  const [monthlyPrice, setMonthlyPrice] = useState<number>(14.99);
  const [yearlyPrice, setYearlyPrice] = useState<number>(99.99);
  const [isActive, setIsActive] = useState<boolean>(true);

  // Toast Hook
  const { toasts, showToast, removeToast } = useToast();

  const getPriceForCycle = (prices: PlanPrice[] = [], cycle: "MONTHLY" | "YEARLY"): PlanPrice | null => {
    return prices.find((p) => p.billingCycle === cycle && p.isActive) || prices.find((p) => p.billingCycle === cycle) || null;
  };

  const openEditModal = (plan: PlanItem) => {
    setEditingPlan(plan);
    setFormDesc(plan.description || "");
    setBannerLabel(plan.bannerLabel || plan.name || "");
    const tradesCount = plan.maxTrades ?? plan.maxCategories ?? 1;
    setMaxTrades(tradesCount);
    setUnlimitedTrades(plan.unlimitedTrades ?? tradesCount >= 9999);
    setMaxPortfolioUploads(plan.maxPortfolioUploads ?? 5);
    setAllowPortfolioVideos(Boolean(plan.allowPortfolioVideos));
    setMaxQuotesPerDay(plan.maxQuotesPerDay ?? 3);
    setFeaturedAtTop(Boolean(plan.featuredAtTop));
    setExposureLevel(plan.exposureLevel || "STANDARD");
    setNewJobAlerts(plan.newJobAlerts ?? true);
    setCustomerSupportDays(plan.customerSupportDays ?? 7);
    setTrialEnabled(Boolean(plan.trialEnabled));
    setTrialDays(plan.trialDays ?? 90);
    setIsActive(Boolean(plan.isActive));

    // Extract monthly and yearly price amounts
    const monthlyAmt = plan.prices?.find((p) => p.billingCycle === "MONTHLY")?.amount || "0";
    const yearlyAmt = plan.prices?.find((p) => p.billingCycle === "YEARLY")?.amount || "0";
    setMonthlyPrice(Number(monthlyAmt));
    setYearlyPrice(Number(yearlyAmt));
  };

  const closeEditModal = () => {
    if (!isSaving) {
      setEditingPlan(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    try {
      setIsSaving(true);

      const finalTrades = unlimitedTrades ? 9999 : Number(maxTrades);

      const payload: UpdatePlanDto = {
        description: formDesc.trim(),
        maxTrades: finalTrades,
        unlimitedTrades,
        maxPortfolioUploads: Number(maxPortfolioUploads),
        allowPortfolioVideos,
        maxQuotesPerDay: Number(maxQuotesPerDay),
        bannerLabel: bannerLabel.trim() || editingPlan.name,
        featuredAtTop,
        exposureLevel,
        newJobAlerts,
        customerSupportDays: Number(customerSupportDays),
        trialEnabled,
        trialDays: trialEnabled ? Number(trialDays) : 0,
        monthlyPrice: Number(monthlyPrice),
        yearlyPrice: Number(yearlyPrice),
        isActive,
      };

      await planService.updatePlan(editingPlan.id, payload);

      // Invalidate queries to trigger an automatic reload
      await queryClient.invalidateQueries({ queryKey: ["plans"] });

      showToast("success", `Plan "${editingPlan.name}" updated successfully.`);
      closeEditModal();
    } catch (err: any) {
      showToast("error", err?.message || "Failed to update plan configurations.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <PageBreadcrumb pageTitle="Subscription Plans" />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-0.5">
            Configure subscription tiers, monthly/yearly pricing, trade categories, and provider features.
          </p>
        </div>

        {/* Toggle switch for cycle selection */}
        <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800/80 p-1.5 rounded-xl self-start sm:self-center border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
          <button
            onClick={() => setBillingCycle("MONTHLY")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-150 ${
              billingCycle === "MONTHLY"
                ? "bg-[#1a2e05] text-white shadow-sm dark:bg-brand-500"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle("YEARLY")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-150 ${
              billingCycle === "YEARLY"
                ? "bg-[#1a2e05] text-white shadow-sm dark:bg-brand-500"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Yearly Billing
          </button>
        </div>
      </div>

      {/* Skeletons Loader */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 animate-pulse space-y-4"
            >
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
              <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
              <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="h-3.5 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                <div className="h-3.5 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
                <div className="h-3.5 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                <div className="h-3.5 bg-gray-200 dark:bg-gray-800 rounded w-4/5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/10 p-6 max-w-xl mx-auto text-center mt-12">
          <svg
            className="w-10 h-10 text-red-500 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h4 className="text-sm font-bold text-red-800 dark:text-red-400">Failed to Retrieve Subscription Plans</h4>
          <p className="text-xs text-red-600 dark:text-red-500/80 mt-1">{error}</p>
        </div>
      )}

      {/* Grid List - 1440 Optimized */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 xl:gap-8">
          {plans.map((plan) => {
            const styles = getTierStyles(plan.name);
            const cyclePrice = getPriceForCycle(plan.prices, billingCycle);
            const exposure = getExposureBadge(plan.exposureLevel);
            const trades = plan.maxTrades ?? plan.maxCategories ?? 1;
            const isUnlimited = plan.unlimitedTrades || trades >= 9999;

            return (
              <div
                key={plan.id}
                className={`
                  rounded-2xl border bg-white dark:bg-gray-900/70 p-6 shadow-sm
                  transition-all duration-200 hover:-translate-y-1 hover:shadow-lg
                  flex flex-col relative overflow-hidden
                  ${styles.border} ${styles.glow}
                `}
              >
                {/* Header Badges */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Banner Label / Tier Badge */}
                    <span className={`inline-flex items-center text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${styles.badgeBg}`}>
                      {plan.bannerLabel || plan.name}
                    </span>

                    {/* Featured At Top Badge */}
                    {plan.featuredAtTop && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                        <svg className="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Top Featured
                      </span>
                    )}
                  </div>

                  {/* Active Status Badge */}
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${
                      plan.isActive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                        : "bg-gray-100 text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${plan.isActive ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`} />
                    {plan.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Plan Title & Description */}
                <div className="mb-4">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-wider">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed line-clamp-2 min-h-[32px]">
                    {plan.description}
                  </p>
                </div>

                {/* Free Trial Banner */}
                {plan.trialEnabled && plan.trialDays > 0 && (
                  <div className="mb-4 px-3 py-1.5 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Free Trial Offer
                    </span>
                    <span className="font-bold text-brand-700 dark:text-brand-300">
                      {plan.trialDays} Days Included
                    </span>
                  </div>
                )}

                {/* Price tag */}
                <div className="mb-5 pt-3 pb-3 border-y border-gray-100 dark:border-gray-800">
                  {cyclePrice ? (
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-baseline">
                        <span className="text-3xl font-extrabold text-gray-950 dark:text-white tracking-tight">
                          {cyclePrice.currency === "EUR" ? "€" : "$"}
                          {cyclePrice.amount}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium ml-1.5">
                          / {billingCycle === "MONTHLY" ? "month" : "year"}
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-gray-400">
                        {cyclePrice.currency}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm font-semibold text-gray-400 dark:text-gray-500">
                      Pricing Unavailable
                    </span>
                  )}
                </div>

                {/* Quotas / Features list */}
                <div className="flex-1 space-y-3 mb-6">
                  {/* Category / Trades Cap */}
                  <div className="flex items-start gap-3">
                    <span className={`p-1.5 rounded-lg flex-shrink-0 ${styles.accent}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-gray-800 dark:text-white">
                          Trade Categories
                        </h4>
                        <span className="text-xs font-semibold text-gray-900 dark:text-gray-200">
                          {isUnlimited ? "Unlimited" : `${trades} Max`}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                        {isUnlimited ? "List in all available trade categories" : `Limited to ${trades} primary category`}
                      </p>
                    </div>
                  </div>

                  {/* Portfolio Uploads Limit & Video Support */}
                  <div className="flex items-start gap-3">
                    <span className={`p-1.5 rounded-lg flex-shrink-0 ${styles.accent}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-gray-800 dark:text-white">
                          Portfolio Media
                        </h4>
                        <span className="text-xs font-semibold text-gray-900 dark:text-gray-200">
                          {plan.maxPortfolioUploads >= 9999 ? "Unlimited" : `${plan.maxPortfolioUploads} Uploads`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                          {plan.allowPortfolioVideos ? "Photos & Videos allowed" : "Photos only (No videos)"}
                        </p>
                        {plan.allowPortfolioVideos && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                            Video ✓
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Daily Quotes Limit */}
                  <div className="flex items-start gap-3">
                    <span className={`p-1.5 rounded-lg flex-shrink-0 ${styles.accent}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                      </svg>
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-gray-800 dark:text-white">
                          Daily Quotes
                        </h4>
                        <span className="text-xs font-semibold text-gray-900 dark:text-gray-200">
                          {plan.maxQuotesPerDay >= 9999 ? "Unlimited" : `${plan.maxQuotesPerDay}/day`}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                        {plan.maxQuotesPerDay >= 9999 ? "Submit quotes to unlimited clients" : `Submit up to ${plan.maxQuotesPerDay} customer quotes per day`}
                      </p>
                    </div>
                  </div>

                  {/* Exposure Level */}
                  <div className="flex items-start gap-3">
                    <span className={`p-1.5 rounded-lg flex-shrink-0 ${styles.accent}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-gray-800 dark:text-white">
                          Search Visibility
                        </h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${exposure.badgeClass}`}>
                          {exposure.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                        Directory ranking and client discovery level
                      </p>
                    </div>
                  </div>

                  {/* Job Alerts & Customer Support */}
                  <div className="flex items-start gap-3">
                    <span className={`p-1.5 rounded-lg flex-shrink-0 ${styles.accent}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-gray-800 dark:text-white">
                          Alerts & Support
                        </h4>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {plan.customerSupportDays} Days Support
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                        {plan.newJobAlerts ? "✓ Instant alerts for new matching leads" : "Standard job notifications"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card action button - Edit Plan triggers */}
                <button
                  onClick={() => openEditModal(plan)}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-center bg-[#1a2e05] hover:bg-[#243d07] dark:bg-brand-500 dark:hover:bg-brand-600 text-white shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Plan & Quotas
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Edit Modal Overlay - 1440 Screen Optimized (z-[999999] above headers) ──────────────── */}
      {editingPlan && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={closeEditModal}
          />

          {/* Panel */}
          <div className="relative w-full max-w-3xl xl:max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header (Sticky / Fixed) */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/70 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 border border-brand-200/60 dark:border-brand-500/20">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                      Edit Plan: {editingPlan.name}
                    </h2>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 border border-brand-200 dark:border-brand-500/20">
                      Settings & Quotas
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Configure pricing, category quotas, exposure level, and feature limits.
                  </p>
                </div>
              </div>
              <button
                onClick={closeEditModal}
                disabled={isSaving}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form - 2 Column Layout for 1440 screens */}
            <form id="edit-plan-form" onSubmit={handleSave} className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Left Column: Plan Information & Pricing */}
                <div className="space-y-4">
                  {/* General Info Card */}
                  <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 space-y-3">
                    <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Plan Information
                    </h4>

                    <div>
                      <label className="block text-[11px] font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Banner / Badge Label
                      </label>
                      <input
                        type="text"
                        required
                        value={bannerLabel}
                        onChange={(e) => setBannerLabel(e.target.value)}
                        disabled={isSaving}
                        placeholder="e.g. Bronze, Silver, Gold"
                        className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Exposure / Visibility Level
                      </label>
                      <select
                        value={exposureLevel}
                        onChange={(e) => setExposureLevel(e.target.value as ExposureLevel)}
                        disabled={isSaving}
                        className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                      >
                        <option value="STANDARD">STANDARD (Normal Directory Ranking)</option>
                        <option value="INCREASED">INCREASED (Boosted Directory Ranking)</option>
                        <option value="MAXIMUM">MAXIMUM (Top Priority Ranking)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Plan Description
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={formDesc}
                        onChange={(e) => setFormDesc(e.target.value)}
                        disabled={isSaving}
                        className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/25 disabled:opacity-60 resize-none"
                      />
                    </div>
                  </div>

                  {/* Pricing Card */}
                  <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 space-y-3">
                    <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Pricing (EUR €)
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Monthly (€)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          value={monthlyPrice}
                          onChange={(e) => setMonthlyPrice(Number(e.target.value))}
                          disabled={isSaving}
                          className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Yearly (€)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          value={yearlyPrice}
                          onChange={(e) => setYearlyPrice(Number(e.target.value))}
                          disabled={isSaving}
                          className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Quotas, Trials & Feature Flags */}
                <div className="space-y-4">
                  {/* Category Limits & Quotas */}
                  <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 space-y-3">
                    <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      Category Limits & Quotas
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400">
                            Max Trades
                          </label>
                          <label className="flex items-center gap-1 text-[10px] text-gray-500 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={unlimitedTrades}
                              onChange={(e) => setUnlimitedTrades(e.target.checked)}
                              className="rounded text-brand-600 focus:ring-brand-500"
                            />
                            <span>All</span>
                          </label>
                        </div>
                        <input
                          type="number"
                          min={1}
                          disabled={isSaving || unlimitedTrades}
                          required={!unlimitedTrades}
                          value={unlimitedTrades ? 9999 : maxTrades}
                          onChange={(e) => setMaxTrades(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-lg text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/25 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:opacity-75"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Portfolios
                        </label>
                        <input
                          type="number"
                          min={0}
                          required
                          value={maxPortfolioUploads}
                          onChange={(e) => setMaxPortfolioUploads(Number(e.target.value))}
                          disabled={isSaving}
                          className="w-full px-2.5 py-1.5 rounded-lg text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Quotes/Day
                        </label>
                        <input
                          type="number"
                          min={0}
                          required
                          value={maxQuotesPerDay}
                          onChange={(e) => setMaxQuotesPerDay(Number(e.target.value))}
                          disabled={isSaving}
                          className="w-full px-2.5 py-1.5 rounded-lg text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Free Trial & Support */}
                  <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 space-y-3">
                    <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Trial & Support Settings
                    </h4>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400">
                            Trial Days
                          </label>
                          <label className="flex items-center gap-1 text-[10px] text-gray-500 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={trialEnabled}
                              onChange={(e) => setTrialEnabled(e.target.checked)}
                              className="rounded text-brand-600 focus:ring-brand-500"
                            />
                            <span>Enable</span>
                          </label>
                        </div>
                        <input
                          type="number"
                          min={0}
                          disabled={isSaving || !trialEnabled}
                          value={trialDays}
                          onChange={(e) => setTrialDays(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-lg text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/25 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:opacity-75"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Support (Days/Wk)
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={7}
                          required
                          value={customerSupportDays}
                          onChange={(e) => setCustomerSupportDays(Number(e.target.value))}
                          disabled={isSaving}
                          className="w-full px-2.5 py-1.5 rounded-lg text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4 Feature Toggles Grid */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Allow Video Uploads */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/60 shadow-xs">
                      <div>
                        <h5 className="text-[11px] font-semibold text-gray-800 dark:text-white">Video Uploads</h5>
                        <p className="text-[9px] text-gray-400">Showcase videos</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAllowPortfolioVideos(!allowPortfolioVideos)}
                        disabled={isSaving}
                        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                          allowPortfolioVideos ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-700"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                            allowPortfolioVideos ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Featured At Top */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/60 shadow-xs">
                      <div>
                        <h5 className="text-[11px] font-semibold text-gray-800 dark:text-white">Top Featured</h5>
                        <p className="text-[9px] text-gray-400">Search ranking</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFeaturedAtTop(!featuredAtTop)}
                        disabled={isSaving}
                        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                          featuredAtTop ? "bg-amber-500" : "bg-gray-300 dark:bg-gray-700"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                            featuredAtTop ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {/* New Job Alerts */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/60 shadow-xs">
                      <div>
                        <h5 className="text-[11px] font-semibold text-gray-800 dark:text-white">Instant Alerts</h5>
                        <p className="text-[9px] text-gray-400">Lead notifications</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNewJobAlerts(!newJobAlerts)}
                        disabled={isSaving}
                        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                          newJobAlerts ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-700"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                            newJobAlerts ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Plan Active Status */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/60 shadow-xs">
                      <div>
                        <h5 className="text-[11px] font-semibold text-gray-800 dark:text-white">Plan Active</h5>
                        <p className="text-[9px] text-gray-400">Buyer availability</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsActive(!isActive)}
                        disabled={isSaving}
                        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                          isActive ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-700"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                            isActive ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </form>

            {/* Sticky / Fixed Footer Action Buttons */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/80 shrink-0">
              <button
                type="button"
                onClick={closeEditModal}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="edit-plan-form"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#1a2e05] dark:bg-brand-500 hover:bg-[#243d07] dark:hover:bg-brand-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving Changes...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Toast Container Alerts ─────────────────────────────────────────── */}
      <div className="fixed top-6 right-6 z-[999999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800
              max-w-sm w-full pointer-events-auto
              ${toastStyles[toast.type]}
            `}
          >
            {toastIcons[toast.type]}
            <span className="text-sm font-medium flex-1">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
