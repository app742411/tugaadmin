"use client";

import React, { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { planService } from "@/services/planService";
import { PlanItem, PlanPrice } from "@/types/plan.types";
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
  const normalized = name.toUpperCase();
  if (normalized.includes("BRONZE")) {
    return {
      border: "border-t-4 border-t-amber-700 dark:border-t-amber-600 border-gray-200 dark:border-gray-800",
      bg: "bg-white dark:bg-gray-900",
      accent: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
      priceText: "text-amber-900 dark:text-amber-100",
      glow: "",
    };
  }
  if (normalized.includes("GOLD")) {
    return {
      border: "border-t-4 border-t-yellow-500 dark:border-t-yellow-400 border-yellow-200 dark:border-yellow-900/60 shadow-yellow-500/5 shadow-xl",
      bg: "bg-white dark:bg-gray-900",
      accent: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
      priceText: "text-yellow-900 dark:text-yellow-100",
      glow: "ring-2 ring-yellow-400/20 dark:ring-yellow-400/10",
    };
  }
  // SILVER or generic
  return {
    border: "border-t-4 border-t-slate-400 dark:border-t-slate-500 border-gray-200 dark:border-gray-800",
    bg: "bg-white dark:bg-gray-900",
    accent: "bg-slate-500/10 text-slate-700 dark:text-slate-400",
    priceText: "text-slate-900 dark:text-slate-100",
    glow: "",
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
  const [maxCategories, setMaxCategories] = useState<number>(1);
  const [maxPortfolioUploads, setMaxPortfolioUploads] = useState<number>(5);
  const [maxQuotesPerDay, setMaxQuotesPerDay] = useState<number>(3);
  const [monthlyPrice, setMonthlyPrice] = useState<number>(9.99);
  const [yearlyPrice, setYearlyPrice] = useState<number>(99.99);
  const [isActive, setIsActive] = useState<boolean>(true);

  // Toast Hook
  const { toasts, showToast, removeToast } = useToast();

  const getPriceForCycle = (prices: PlanPrice[], cycle: "MONTHLY" | "YEARLY"): PlanPrice | null => {
    return prices.find((p) => p.billingCycle === cycle && p.isActive) || null;
  };

  const openEditModal = (plan: PlanItem) => {
    setEditingPlan(plan);
    setFormDesc(plan.description);
    setMaxCategories(plan.maxCategories);
    setMaxPortfolioUploads(plan.maxPortfolioUploads);
    setMaxQuotesPerDay(plan.maxQuotesPerDay);
    setIsActive(plan.isActive);

    // Extract monthly and yearly price amounts
    const monthlyAmt = plan.prices.find((p) => p.billingCycle === "MONTHLY")?.amount || "0";
    const yearlyAmt = plan.prices.find((p) => p.billingCycle === "YEARLY")?.amount || "0";
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

      // Submit exactly matching the update request payload:
      await planService.updatePlan(editingPlan.id, {
        description: formDesc.trim(),
        maxCategories: Number(maxCategories),
        maxPortfolioUploads: Number(maxPortfolioUploads),
        maxQuotesPerDay: Number(maxQuotesPerDay),
        monthlyPrice: Number(monthlyPrice),
        yearlyPrice: Number(yearlyPrice),
        isActive,
      });

      // Invalidate queries to trigger an automatic reload
      queryClient.invalidateQueries({ queryKey: ["plans"] });

      showToast("success", `Plan "${editingPlan.name}" updated successfully.`);
      closeEditModal();
    } catch (err: any) {
      showToast("error", err?.message || "Failed to update plan configurations.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <PageBreadcrumb pageTitle="Subscription Plans" />
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 ml-0.5">
            Configure subscription tiers, monthly/yearly pricing amounts, and quotas for users.
          </p>
        </div>

        {/* Toggle switch for cycle selection */}
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800/80 p-1.5 rounded-xl self-start sm:self-center">
          <button
            onClick={() => setBillingCycle("MONTHLY")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-150 ${billingCycle === "MONTHLY"
                ? "bg-[#1a2e05] text-white shadow-sm dark:bg-brand-500"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle("YEARLY")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-150 ${billingCycle === "YEARLY"
                ? "bg-[#1a2e05] text-white shadow-sm dark:bg-brand-500"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
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
              className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 animate-pulse space-y-4"
            >
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
              <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
              <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/10 p-6 max-w-xl mx-auto text-center mt-12">
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

      {/* Grid List */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan) => {
            const styles = getTierStyles(plan.name);
            const cyclePrice = getPriceForCycle(plan.prices, billingCycle);

            return (
              <div
                key={plan.id}
                className={`
                  rounded-xl border bg-white dark:bg-gray-900/60 p-6 shadow-sm
                  transition-all duration-200 hover:-translate-y-1 hover:shadow-md
                  flex flex-col relative overflow-hidden
                  ${styles.border} ${styles.glow}
                `}
              >
                {/* Badge for Popular/Gold */}
                {plan.name.toUpperCase().includes("GOLD") && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-950 text-[10px] font-bold tracking-wider px-3 py-1 rounded-bl-xl shadow-sm uppercase flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Premium Tier
                  </div>
                )}

                {/* Header */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                      {plan.name}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${plan.isActive
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                          : "bg-gray-50 text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                        }`}
                    >
                      {plan.isActive ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Active
                        </>
                      ) : (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          Inactive
                        </>
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-2">
                    {plan.description}
                  </p>
                </div>

                {/* Price tag */}
                <div className="mb-6 pt-3 border-t border-gray-100 dark:border-gray-800">
                  {cyclePrice ? (
                    <div className="flex items-baseline">
                      <span className="text-3xl font-extrabold text-gray-950 dark:text-white tracking-tight">
                        {cyclePrice.currency === "EUR" ? "€" : "$"}
                        {cyclePrice.amount}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500 font-medium ml-1.5">
                        / {billingCycle === "MONTHLY" ? "month" : "year"}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm font-semibold text-gray-400 dark:text-gray-500">
                      Pricing Unavailable
                    </span>
                  )}
                </div>

                {/* Quotas / Features list */}
                <div className="flex-1 space-y-3.5 mb-6">
                  {/* Category cap */}
                  <div className="flex items-start gap-3">
                    <span className={`p-1.5 rounded-lg flex-shrink-0 ${styles.accent}`}>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                    </span>
                    <div>
                      <h4 className="text-[11px] font-bold text-gray-800 dark:text-white/80 leading-none">
                        Category Limit
                      </h4>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {plan.maxCategories == null || plan.maxCategories >= 9999 ? "Unlimited Categories" : `${plan.maxCategories} Category${plan.maxCategories !== 1 ? 's' : ''}`}
                      </p>
                    </div>
                  </div>

                  {/* Portfolio uploads limit */}
                  <div className="flex items-start gap-3">
                    <span className={`p-1.5 rounded-lg flex-shrink-0 ${styles.accent}`}>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </span>
                    <div>
                      <h4 className="text-[11px] font-bold text-gray-800 dark:text-white/80 leading-none">
                        Portfolio Uploads
                      </h4>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {plan.maxPortfolioUploads == null || plan.maxPortfolioUploads >= 9999 ? "Unlimited high-res showcase media" : `Max ${plan.maxPortfolioUploads} high-res showcase media`}
                      </p>
                    </div>
                  </div>

                  {/* Quotes limit */}
                  <div className="flex items-start gap-3">
                    <span className={`p-1.5 rounded-lg flex-shrink-0 ${styles.accent}`}>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                      </svg>
                    </span>
                    <div>
                      <h4 className="text-[11px] font-bold text-gray-800 dark:text-white/80 leading-none">
                        Daily Quotes Limit
                      </h4>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {plan.maxQuotesPerDay == null || plan.maxQuotesPerDay >= 9999 ? "Unlimited quotes to clients every day" : `Send up to ${plan.maxQuotesPerDay} quotes to clients every day`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card action button - Edit Plan triggers */}
                <button
                  onClick={() => openEditModal(plan)}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-center bg-[#1a2e05] hover:bg-[#243d07] dark:bg-brand-500 dark:hover:bg-brand-600 text-white shadow-sm transition-colors cursor-pointer"
                >
                  Edit Plan Quotas
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Edit Modal Overlay ──────────────────────────────────────────────── */}
      {editingPlan && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
            onClick={closeEditModal}
          />

          {/* Panel */}
          <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-gray-100 dark:border-gray-800">
              <div>
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-500 dark:bg-brand-500/[0.12] dark:text-brand-400">
                  Update Quotas
                </span>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight mt-1">
                  Edit Plan: {editingPlan.name}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Update pricing amounts and feature limits for this tier.
                </p>
              </div>
              <button
                onClick={closeEditModal}
                disabled={isSaving}
                className="flex-shrink-0 p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  required
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  disabled={isSaving}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500 disabled:opacity-60 resize-none"
                />
              </div>

              {/* Pricing section */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                {/* Monthly Price */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Monthly Price (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={monthlyPrice}
                    onChange={(e) => setMonthlyPrice(Number(e.target.value))}
                    disabled={isSaving}
                    className="w-full px-3 py-2.5 rounded-xl text-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                  />
                </div>

                {/* Yearly Price */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Yearly Price (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={yearlyPrice}
                    onChange={(e) => setYearlyPrice(Number(e.target.value))}
                    disabled={isSaving}
                    className="w-full px-3 py-2.5 rounded-xl text-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                  />
                </div>
              </div>

              {/* Numerical Limits Group */}
              <div className="grid grid-cols-3 gap-3">
                {/* Max Categories */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                    Max Categories
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={maxCategories}
                    onChange={(e) => setMaxCategories(Number(e.target.value))}
                    disabled={isSaving}
                    className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                  />
                </div>

                {/* Max Portfolio Uploads */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                    Max Portfolios
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={maxPortfolioUploads}
                    onChange={(e) => setMaxPortfolioUploads(Number(e.target.value))}
                    disabled={isSaving}
                    className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                  />
                </div>

                {/* Max Quotes per Day */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                    Max Quotes/Day
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={maxQuotesPerDay}
                    onChange={(e) => setMaxQuotesPerDay(Number(e.target.value))}
                    disabled={isSaving}
                    className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                  />
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.02] mt-2">
                <div>
                  <h4 className="text-xs font-semibold text-gray-800 dark:text-white">Active Status</h4>
                  <p className="text-[10px] text-gray-400">Available to subscription buyers.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  disabled={isSaving}
                  className={`
                    relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                    ${isActive ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-700"}
                  `}
                >
                  <span
                    className={`
                      pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                      ${isActive ? "translate-x-5" : "translate-x-0"}
                    `}
                  />
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#1a2e05] dark:bg-brand-500 hover:bg-[#243d07] dark:hover:bg-brand-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
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
