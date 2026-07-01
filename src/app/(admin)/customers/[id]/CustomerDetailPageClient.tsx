"use client";

import React, { useState } from "react";
import Link from "next/link";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Badge from "@/components/ui/badge/Badge";
import { useGetCustomerDetail } from "@/hooks/useCustomers";

interface CustomerDetailPageClientProps {
  id: string;
}

export default function CustomerDetailPageClient({ id }: CustomerDetailPageClientProps) {
  const { data: customer, isLoading, error } = useGetCustomerDetail(id);
  const [activeTab, setActiveTab] = useState<"general" | "saved-traders" | "reviews">("general");

  // Utility: Generate initials for avatar fallbacks
  const getInitials = (name: string) => {
    if (!name) return "U";
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
        return "success";
      case "PENDING":
        return "info";
      case "INACTIVE":
        return "warning";
      case "BLOCKED":
        return "error";
      default:
        return "light";
    }
  };

  // Format dates
  const formatDate = (dateString: string) => {
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
            href="/customers"
            className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            &larr; Back to Customers
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">Loading customer details...</p>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="w-full pb-8">
        <div className="flex items-center gap-2 mb-6">
          <Link
            href="/customers"
            className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            &larr; Back to Customers
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-8 text-center">
          <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-full mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h4 className="text-base font-bold text-gray-900 dark:text-white mb-2">Failed to load customer</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
            {error || "We could not fetch the details for this customer. Please try again."}
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

  const initials = getInitials(customer.fullName);
  const avatarColorClass = getAvatarBg(customer.fullName);

  return (
    <div className="w-full pb-8">
      {/* Header and Back Link */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/customers"
              className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              &larr; Back to Customers
            </Link>
          </div>
          <PageBreadcrumb pageTitle={customer.fullName} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              {/* Profile Image / Initials */}
              {customer.profileImage ? (
                <div className="w-24 h-24 overflow-hidden rounded-full border-2 border-gray-100 dark:border-gray-800 mb-4 shadow-sm">
                  <img
                    src={customer.profileImage}
                    alt={customer.fullName}
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

              {/* User Name & Email */}
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {customer.fullName}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {customer.email}
              </p>

              {/* Status and Verification Badges */}
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Badge color={getStatusColor(customer.status)} size="md">
                  {customer.status}
                </Badge>
                {customer.isVerified ? (
                  <Badge color="success" size="md">
                    Verified
                  </Badge>
                ) : (
                  <Badge color="warning" size="md">
                    Unverified
                  </Badge>
                )}
              </div>

              {/* Connection Status Indicator */}
              <div className="mt-6 w-full pt-6 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Status:</span>
                <span className="flex items-center gap-1.5 font-semibold">
                  <span className={`h-2.5 w-2.5 rounded-full ${customer.isOnline ? "bg-emerald-500 animate-pulse" : "bg-gray-300 dark:bg-gray-700"}`} />
                  {customer.isOnline ? "Online Now" : "Offline"}
                </span>
              </div>

              {customer.lastSeen && (
                <div className="mt-2 w-full flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Last Seen:</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {formatDate(customer.lastSeen)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Navigation Tabs & Detailed Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
            {/* Tabs Header */}
            <div className="flex border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20 px-6 pt-3">
              <button
                onClick={() => setActiveTab("general")}
                className={`pb-3.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 mr-6 ${
                  activeTab === "general"
                    ? "border-brand-500 text-brand-500"
                    : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                }`}
              >
                General Details
              </button>
              <button
                onClick={() => setActiveTab("saved-traders")}
                className={`pb-3.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 mr-6 relative ${
                  activeTab === "saved-traders"
                    ? "border-brand-500 text-brand-500"
                    : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                }`}
              >
                Saved Traders
                {customer.savedTraders?.length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-brand-100 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                    {customer.savedTraders.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`pb-3.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
                  activeTab === "reviews"
                    ? "border-brand-500 text-brand-500"
                    : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                }`}
              >
                Reviews
              </button>
            </div>

            {/* Tab Panels */}
            <div className="p-6">
              {/* General details Tab */}
              {activeTab === "general" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-4">Account Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                      <div className="flex flex-col pb-3 border-b border-gray-50 dark:border-gray-800/40">
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">User ID</span>
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 select-all font-mono mt-1 break-all">
                          {customer.id}
                        </span>
                      </div>
                      <div className="flex flex-col pb-3 border-b border-gray-50 dark:border-gray-800/40">
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">System Role</span>
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-1">
                          {customer.role}
                        </span>
                      </div>
                      <div className="flex flex-col pb-3 border-b border-gray-50 dark:border-gray-800/40">
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">Phone Number</span>
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-250 mt-1">
                          {customer.phone || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col pb-3 border-b border-gray-50 dark:border-gray-800/40">
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">Terms Acceptance</span>
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-1">
                          {customer.acceptedTerms ? "Accepted" : "Not Accepted"}
                        </span>
                      </div>
                      <div className="flex flex-col pb-3 border-b border-gray-50 dark:border-gray-800/40">
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">Created At</span>
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-1">
                          {formatDate(customer.createdAt)}
                        </span>
                      </div>
                      <div className="flex flex-col pb-3 border-b border-gray-50 dark:border-gray-800/40">
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">Last Updated At</span>
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-1">
                          {formatDate(customer.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-4">Location Coordinates</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                      <div className="flex flex-col pb-3 border-b border-gray-50 dark:border-gray-800/40">
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">Latitude</span>
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-250 mt-1">
                          {customer.latitude !== null ? customer.latitude : "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col pb-3 border-b border-gray-50 dark:border-gray-800/40">
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">Longitude</span>
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-250 mt-1">
                          {customer.longitude !== null ? customer.longitude : "N/A"}
                        </span>
                      </div>
                    </div>

                    {(customer.latitude !== null && customer.longitude !== null) && (
                      <div className="mt-4">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${customer.latitude},${customer.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-500 hover:text-brand-650 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          View location on Google Maps
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Saved Traders Tab */}
              {activeTab === "saved-traders" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-2">Saved Traders</h3>
                  {(!customer.savedTraders || customer.savedTraders.length === 0) ? (
                    <div className="text-center py-10 bg-gray-50/50 dark:bg-gray-950/10 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                      <p className="text-xs text-gray-500 dark:text-gray-400">This customer hasn't saved any traders yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {customer.savedTraders.map((saved) => (
                        <div
                          key={saved.id}
                          className="p-4 border border-gray-100 dark:border-gray-850 bg-white dark:bg-gray-950/40 rounded-xl shadow-xs flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[10px] bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                                {getInitials(saved.trader?.fullName || "Trader")}
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                                  {saved.trader?.fullName || "Trader Info Loading..."}
                                </h4>
                                <span className="text-[9px] font-mono text-gray-400 dark:text-gray-500 block mt-0.5">
                                  Trader ID: {saved.traderId}
                                </span>
                              </div>
                            </div>
                            <div className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center justify-between mt-2 pt-2 border-t border-gray-50 dark:border-gray-800/40">
                              <span>Saved Date:</span>
                              <span className="font-semibold">{formatDate(saved.createdAt)}</span>
                            </div>
                          </div>
                          <div className="mt-4 pt-2 flex gap-2">
                            <Link
                              href={`/traders?search=${saved.traderId}`}
                              className="w-full text-center py-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-white/[0.03] text-gray-700 dark:text-gray-300 font-semibold text-[10px] rounded-lg transition-colors border border-gray-100 dark:border-gray-750"
                            >
                              Inspect in Traders
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === "reviews" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-3">Reviews Given (As Customer)</h3>
                    {(!customer.customerReviews || customer.customerReviews.length === 0) ? (
                      <div className="text-center py-8 bg-gray-50/50 dark:bg-gray-950/10 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                        <p className="text-xs text-gray-500 dark:text-gray-400">No reviews given by this customer.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {customer.customerReviews.map((rev: any) => (
                          <div key={rev.id} className="p-4 border border-gray-100 dark:border-gray-800/80 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-gray-850 dark:text-white">Rating: {rev.rating}/5</span>
                              <span className="text-[10px] text-gray-400">{formatDate(rev.createdAt)}</span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-300">{rev.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-3">Reviews Received</h3>
                    {(!customer.traderReviews || customer.traderReviews.length === 0) ? (
                      <div className="text-center py-8 bg-gray-50/50 dark:bg-gray-950/10 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                        <p className="text-xs text-gray-500 dark:text-gray-400">No reviews received.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {customer.traderReviews.map((rev: any) => (
                          <div key={rev.id} className="p-4 border border-gray-100 dark:border-gray-800/80 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-gray-850 dark:text-white">Rating: {rev.rating}/5</span>
                              <span className="text-[10px] text-gray-400">{formatDate(rev.createdAt)}</span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-300">{rev.comment}</p>
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
