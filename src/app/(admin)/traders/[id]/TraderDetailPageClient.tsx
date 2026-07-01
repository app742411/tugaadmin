"use client";

import React, { useState } from "react";
import Link from "next/link";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Badge from "@/components/ui/badge/Badge";
import { useGetTraderDetail } from "@/hooks/useTraders";

interface TraderDetailPageClientProps {
  id: string;
}

export default function TraderDetailPageClient({ id }: TraderDetailPageClientProps) {
  const { data: trader, isLoading, error } = useGetTraderDetail(id);
  const [activeTab, setActiveTab] = useState<"business" | "subscription" | "compliance" | "reviews-engagement">("business");

  // Utility: Generate initials for avatar fallbacks
  const getInitials = (name: string) => {
    if (!name) return "T";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  // Utility: Generate stable color based on name hash for initials
  const getAvatarBg = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
      "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
      "bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400",
      "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
      "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400",
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400",
    ];
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  // Status mapping to Badge colors
  const getStatusColor = (statusVal: string): "success" | "warning" | "error" | "info" | "light" => {
    switch (statusVal) {
      case "ACTIVE":
      case "APPROVED":
        return "success";
      case "PENDING":
        return "info";
      case "INACTIVE":
      case "TRIAL":
        return "warning";
      case "BLOCKED":
      case "REJECTED":
        return "error";
      default:
        return "light";
    }
  };

  // Format dates
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    try {
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(dateString));
    } catch {
      return "N/A";
    }
  };

  if (isLoading) {
    return (
      <div className="w-full pb-8">
        <div className="flex items-center gap-2 mb-6">
          <Link
            href="/traders"
            className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            &larr; Back to Traders
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">Loading trader details...</p>
        </div>
      </div>
    );
  }

  if (error || !trader) {
    return (
      <div className="w-full pb-8">
        <div className="flex items-center gap-2 mb-6">
          <Link
            href="/traders"
            className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            &larr; Back to Traders
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-8 text-center">
          <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-full mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h4 className="text-base font-bold text-gray-900 dark:text-white mb-2">Failed to load trader</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
            {error || "We could not fetch the details for this trader. Please try again."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs rounded-lg transition-colors"
          >
            Retry Fetching
          </button>
        </div>
      </div>
    );
  }

  const initials = getInitials(trader.fullName);
  const avatarColorClass = getAvatarBg(trader.fullName);
  const profile = trader.traderProfile;
  const metrics = trader.traderMetrics;

  return (
    <div className="w-full pb-8">
      {/* Header and Back Link */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/traders"
              className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              &larr; Back to Traders
            </Link>
          </div>
          <PageBreadcrumb pageTitle={trader.fullName} />
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center justify-center py-2 px-5 font-bold rounded-lg bg-[#6E9625] text-white text-sm hover:bg-[#5a7a1e] transition-colors shadow-sm cursor-pointer">
            Approve
          </button>
          <button className="inline-flex items-center justify-center py-2 px-5 font-bold rounded-lg bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 dark:bg-red-500/10 dark:border-red-500/20 dark:hover:bg-red-500/20 text-sm transition-colors shadow-sm cursor-pointer">
            Reject
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Summary & Performance metrics */}
        <div className="lg:col-span-1 space-y-6">
          {/* Main Identity card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              {trader.profileImage ? (
                <div className="w-24 h-24 overflow-hidden rounded-full border-2 border-gray-100 dark:border-gray-800 mb-4 shadow-sm">
                  <img
                    src={trader.profileImage}
                    alt={trader.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div
                  className={`w-24 h-24 rounded-full flex items-center justify-center font-extrabold text-2xl mb-4 shadow-inner ${avatarColorClass}`}
                >
                  {initials}
                </div>
              )}

              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {trader.fullName}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {trader.email}
              </p>

              {profile?.companyName && (
                <span className="text-xs font-bold text-brand-500 bg-brand-50/50 dark:bg-brand-500/10 px-2.5 py-1 rounded-full mt-2">
                  {profile.companyName}
                </span>
              )}

              {/* Status and Vetting Status Badges */}
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Badge color={getStatusColor(trader.status)} size="md">
                  {trader.status}
                </Badge>
                {profile?.verificationStatus && (
                  <Badge color={getStatusColor(profile.verificationStatus)} size="md">
                    Vetting: {profile.verificationStatus}
                  </Badge>
                )}
              </div>

              {/* Online Connection Status */}
              <div className="mt-6 w-full pt-6 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Network Status:</span>
                <span className="flex items-center gap-1.5 font-semibold">
                  <span className={`h-2.5 w-2.5 rounded-full ${trader.isOnline ? "bg-emerald-500 animate-pulse" : "bg-gray-300 dark:bg-gray-700"}`} />
                  {trader.isOnline ? "Online Now" : "Offline"}
                </span>
              </div>

              <div className="mt-2 w-full flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Insured status:</span>
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {profile?.insured ? "Insured" : "Not Insured"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          {metrics && (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">
                Performance Metrics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50/50 dark:bg-gray-950/20 rounded-xl border border-gray-50 dark:border-gray-800/40 text-center">
                  <span className="block text-[10px] text-gray-400 dark:text-gray-500 uppercase">Avg Rating</span>
                  <span className="text-lg font-extrabold text-gray-900 dark:text-white mt-1 block">
                    {metrics.averageRating > 0 ? `${metrics.averageRating}/5` : "0.0"}
                  </span>
                </div>
                <div className="p-3 bg-gray-50/50 dark:bg-gray-950/20 rounded-xl border border-gray-50 dark:border-gray-800/40 text-center">
                  <span className="block text-[10px] text-gray-400 dark:text-gray-500 uppercase">Completed Jobs</span>
                  <span className="text-lg font-extrabold text-gray-900 dark:text-white mt-1 block">
                    {metrics.completedJobs}
                  </span>
                </div>
                <div className="p-3 bg-gray-50/50 dark:bg-gray-950/20 rounded-xl border border-gray-50 dark:border-gray-800/40 text-center">
                  <span className="block text-[10px] text-gray-400 dark:text-gray-500 uppercase">Leads Count</span>
                  <span className="text-lg font-extrabold text-gray-900 dark:text-white mt-1 block">
                    {metrics.recentLeads}
                  </span>
                </div>
                <div className="p-3 bg-gray-50/50 dark:bg-gray-950/20 rounded-xl border border-gray-50 dark:border-gray-800/40 text-center">
                  <span className="block text-[10px] text-gray-400 dark:text-gray-500 uppercase">Response Rate</span>
                  <span className="text-lg font-extrabold text-gray-900 dark:text-white mt-1 block">
                    {metrics.responseRate}%
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-50 dark:border-gray-850 flex items-center justify-between text-[11px] text-gray-400">
                <span>Recent Leads Reset:</span>
                <span>{formatDate(metrics.recentLeadsResetAt)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Tabs Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20 px-6 pt-3 overflow-x-auto scrollbar-thin">
              <button
                onClick={() => setActiveTab("business")}
                className={`pb-3.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 mr-6 flex-shrink-0 ${
                  activeTab === "business"
                    ? "border-brand-500 text-brand-500"
                    : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                }`}
              >
                Business Profile
              </button>
              <button
                onClick={() => setActiveTab("subscription")}
                className={`pb-3.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 mr-6 flex-shrink-0 ${
                  activeTab === "subscription"
                    ? "border-brand-500 text-brand-500"
                    : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                }`}
              >
                Subscription Info
              </button>
              <button
                onClick={() => setActiveTab("compliance")}
                className={`pb-3.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 mr-6 flex-shrink-0 ${
                  activeTab === "compliance"
                    ? "border-brand-500 text-brand-500"
                    : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                }`}
              >
                Compliance & Vetting
              </button>
              <button
                onClick={() => setActiveTab("reviews-engagement")}
                className={`pb-3.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex-shrink-0 ${
                  activeTab === "reviews-engagement"
                    ? "border-brand-500 text-brand-500"
                    : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                }`}
              >
                Engagement
              </button>
            </div>

            {/* Tab content */}
            <div className="p-6">
              {/* Business Profile Tab */}
              {activeTab === "business" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-4">Company Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                      <div className="flex flex-col pb-3 border-b border-gray-50 dark:border-gray-800/40">
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">Company Name</span>
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-1">
                          {profile?.companyName || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col pb-3 border-b border-gray-50 dark:border-gray-800/40">
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">Company Type</span>
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-1">
                          {profile?.companyType || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col pb-3 border-b border-gray-50 dark:border-gray-800/40">
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">Registration Number</span>
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-1 font-mono">
                          {profile?.registrationNumber || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col pb-3 border-b border-gray-50 dark:border-gray-800/40">
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">Service Location</span>
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-1">
                          {profile?.location || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col pb-3 border-b border-gray-50 dark:border-gray-800/40">
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">Work Radius</span>
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-1">
                          {profile?.workRadius ? `${profile.workRadius} km` : "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col pb-3 border-b border-gray-50 dark:border-gray-800/40">
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">GPS Coordinates</span>
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-1">
                          {trader.latitude && trader.longitude ? (
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${trader.latitude},${trader.longitude}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-brand-500 hover:underline inline-flex items-center gap-1"
                            >
                              {trader.latitude}, {trader.longitude}
                            </a>
                          ) : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {profile?.about && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-2">About / Description</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50/50 dark:bg-gray-950/20 p-4 rounded-xl border border-gray-50 dark:border-gray-800/60">
                        {profile.about}
                      </p>
                    </div>
                  )}

                  {/* Categories and Skills */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-4">Trade Categories & Skills</h3>
                    <div className="space-y-4">
                      {/* Trade Categories */}
                      <div>
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-2">Trade Categories</span>
                        {(!profile?.tradeCategories || profile.tradeCategories.length === 0) ? (
                          <span className="text-xs text-gray-400 dark:text-gray-600 italic">No trade categories defined</span>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {profile.tradeCategories.map((cat) => (
                              <span key={cat.id} className="px-2.5 py-1 bg-gray-55 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-xs rounded-lg">
                                {cat.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Sub Categories */}
                      <div>
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-2">Sub-Categories</span>
                        {(!profile?.subCategories || profile.subCategories.length === 0) ? (
                          <span className="text-xs text-gray-400 dark:text-gray-600 italic">No sub-categories defined</span>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {profile.subCategories.map((sub) => (
                              <span key={sub.id} className="px-2.5 py-1 bg-gray-55 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-xs rounded-lg">
                                {sub.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Skills Services */}
                      <div>
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-2">Skills Services</span>
                        {(!profile?.skillsServices || profile.skillsServices.length === 0) ? (
                          <span className="text-xs text-gray-400 dark:text-gray-600 italic">No skills services defined</span>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {profile.skillsServices.map((skill) => (
                              <span key={skill.id} className="px-2.5 py-1 bg-gray-55 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-xs rounded-lg">
                                {skill.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Subscription Tab */}
              {activeTab === "subscription" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-4">Subscription Overview</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                      <div className="flex flex-col pb-3 border-b border-gray-50 dark:border-gray-800/40">
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">Tier level</span>
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-1 block">
                          {profile?.subscriptionTier ? (
                            <Badge color={profile.subscriptionTier === "GOLD" ? "success" : profile.subscriptionTier === "SILVER" ? "info" : "light"}>
                              {profile.subscriptionTier}
                            </Badge>
                          ) : "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col pb-3 border-b border-gray-50 dark:border-gray-800/40">
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">Billing Status</span>
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-1 block">
                          {profile?.subscriptionStatus ? (
                            <Badge color={getStatusColor(profile.subscriptionStatus)}>
                              {profile.subscriptionStatus}
                            </Badge>
                          ) : "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col pb-3 border-b border-gray-50 dark:border-gray-800/40">
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">Start Date</span>
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-1">
                          {formatDate(profile?.subscriptionStartDate)}
                        </span>
                      </div>
                      <div className="flex flex-col pb-3 border-b border-gray-50 dark:border-gray-800/40">
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">Renewal Date</span>
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-1">
                          {formatDate(profile?.subscriptionEndDate)}
                        </span>
                      </div>
                      <div className="flex flex-col pb-3 border-b border-gray-50 dark:border-gray-800/40">
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">Trial Ends At</span>
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-1">
                          {formatDate(profile?.trialEndsAt)}
                        </span>
                      </div>
                      <div className="flex flex-col pb-3 border-b border-gray-50 dark:border-gray-800/40">
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">Stripe Customer ID</span>
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-250 mt-1 font-mono">
                          {profile?.stripeCustomerId || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Plan Limits & Details */}
                  {profile?.subscription?.plan && (
                    <div className="bg-gray-50/50 dark:bg-gray-950/20 rounded-2xl p-5 border border-gray-150 dark:border-gray-800">
                      <h4 className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider mb-3">
                        Active Plan Details ({profile.subscription.plan.name})
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{profile.subscription.plan.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-gray-400 block">Max Trades Allowed:</span>
                          <span className="font-semibold text-gray-800 dark:text-gray-200">
                            {profile.subscription.plan.unlimitedTrades ? "Unlimited" : profile.subscription.plan.maxTrades}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 block">Quotes Limit:</span>
                          <span className="font-semibold text-gray-800 dark:text-gray-200">{profile.subscription.plan.maxQuotesPerDay} per day</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block">Max Portfolio Uploads:</span>
                          <span className="font-semibold text-gray-800 dark:text-gray-200">{profile.subscription.plan.maxPortfolioUploads} uploads</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block">Pricing Amount:</span>
                          <span className="font-semibold text-gray-850 dark:text-white font-mono">
                            {profile.subscription.price ? `${profile.subscription.price.amount} ${profile.subscription.price.currency} / ${profile.subscription.price.billingCycle.toLowerCase()}` : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Compliance & Vetting Tab */}
              {activeTab === "compliance" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-4">Compliance Checklists</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border border-gray-50 dark:border-gray-850 rounded-xl bg-white dark:bg-gray-950/40">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Minimum Experience Verified</span>
                        <Badge color={profile?.minimumExperience ? "success" : "light"}>
                          {profile?.minimumExperience ? "Checked" : "Unchecked"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border border-gray-50 dark:border-gray-850 rounded-xl bg-white dark:bg-gray-950/40">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Authorised Business Status</span>
                        <Badge color={profile?.authorisedBusiness ? "success" : "light"}>
                          {profile?.authorisedBusiness ? "Verified" : "Unverified"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border border-gray-50 dark:border-gray-850 rounded-xl bg-white dark:bg-gray-950/40">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Understands Vetting Policies</span>
                        <Badge color={profile?.understandVettingPolicy ? "success" : "light"}>
                          {profile?.understandVettingPolicy ? "Acknowledged" : "Pending"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border border-gray-50 dark:border-gray-850 rounded-xl bg-white dark:bg-gray-950/40">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Accepted Terms and Conditions</span>
                        <Badge color={profile?.acceptedTermsConditions ? "success" : "light"}>
                          {profile?.acceptedTermsConditions ? "Accepted" : "Not Accepted"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-4">Vetting Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 pb-4">
                      <div className="flex flex-col pb-3 border-b border-gray-50 dark:border-gray-800/40">
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">Vetting status</span>
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-1 block">
                          {profile?.verificationStatus ? (
                            <Badge color={getStatusColor(profile.verificationStatus)}>
                              {profile.verificationStatus}
                            </Badge>
                          ) : "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col pb-3 border-b border-gray-50 dark:border-gray-800/40">
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">Rejection Reason</span>
                        <span className="text-xs font-semibold text-gray-850 dark:text-gray-250 mt-1">
                          {profile?.rejectReason || "No rejection reason provided"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Documents & business links */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-4">Upload Documents</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile?.logo && (
                        <div className="p-4 border border-gray-50 dark:border-gray-850 rounded-xl flex items-center justify-between">
                          <span className="text-xs text-gray-500">Business Logo</span>
                          <a
                            href={profile.logo}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-brand-500 hover:underline"
                          >
                            View Logo
                          </a>
                        </div>
                      )}
                      {profile?.document && (
                        <div className="p-4 border border-gray-50 dark:border-gray-850 rounded-xl flex items-center justify-between">
                          <span className="text-xs text-gray-500">Vetting Document</span>
                          <a
                            href={profile.document}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-brand-500 hover:underline"
                          >
                            View Document
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Engagement Tab */}
              {activeTab === "reviews-engagement" && (
                <div className="space-y-6">
                  {/* Saved By Customers */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-3">Saved By Customers</h3>
                    {(!trader.savedByCustomers || trader.savedByCustomers.length === 0) ? (
                      <div className="text-center py-8 bg-gray-50/50 dark:bg-gray-950/10 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                        <p className="text-xs text-gray-500 dark:text-gray-400">No customers have saved this trader profile yet.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {trader.savedByCustomers.map((saved) => (
                          <div key={saved.id} className="p-4 border border-gray-50 dark:border-gray-850 rounded-xl bg-white dark:bg-gray-950/20">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                                {getInitials(saved.customer?.fullName || "Customer")}
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-gray-900 dark:text-white">{saved.customer?.fullName || "Customer Info Loading..."}</h4>
                                <span className="text-[10px] text-gray-400 block mt-0.5">Saved on {formatDate(saved.createdAt)}</span>
                              </div>
                            </div>
                            <div className="mt-3 pt-2 border-t border-gray-50 dark:border-gray-850 flex gap-2">
                              <Link
                                href={`/customers/${saved.customerId}`}
                                className="w-full text-center py-1.5 bg-gray-55 hover:bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-[10px] rounded-lg transition-colors border border-gray-100 dark:border-gray-750"
                              >
                                View Customer
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Reviews received */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-3">Reviews Received</h3>
                    {(!trader.traderReviews || trader.traderReviews.length === 0) ? (
                      <div className="text-center py-8 bg-gray-50/50 dark:bg-gray-950/10 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                        <p className="text-xs text-gray-500 dark:text-gray-400">No reviews received for this trader yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {trader.traderReviews.map((rev: any) => (
                          <div key={rev.id} className="p-4 border border-gray-100 dark:border-gray-800/80 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-gray-850 dark:text-white">Rating: {rev.rating}/5</span>
                              <span className="text-[10px] text-gray-400">{formatDate(rev.createdAt)}</span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-305">{rev.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
