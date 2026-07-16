"use client";

import React, { useState } from "react";
import Link from "next/link";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Badge from "@/components/ui/badge/Badge";
import { Modal } from "@/components/ui/modal";
import { useGetCustomerDetail } from "@/hooks/useCustomers";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";

interface CustomerDetailPageClientProps {
  id: string;
}

export default function CustomerDetailPageClient({ id }: CustomerDetailPageClientProps) {
  const { data: customer, isLoading, error } = useGetCustomerDetail(id);
  const [activeTab, setActiveTab] = useState<"general" | "saved-traders" | "reviews">("general");
  const { toasts, showToast, removeToast } = useToast();
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const confirmDelete = () => {
    showToast("success", "Customer account has been successfully deleted.");
    setIsDeleteModalOpen(false);
    setTimeout(() => router.push("/customers"), 1000);
  };

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
      "bg-gradient-to-br from-emerald-50 to-emerald-100/50 text-emerald-600 dark:from-emerald-950/20 dark:to-emerald-900/10 dark:text-emerald-400",
      "bg-gradient-to-br from-blue-50 to-blue-100/50 text-blue-600 dark:from-blue-950/20 dark:to-blue-900/10 dark:text-blue-400",
      "bg-gradient-to-br from-purple-50 to-purple-100/50 text-purple-600 dark:from-purple-950/20 dark:to-purple-900/10 dark:text-purple-400",
      "bg-gradient-to-br from-amber-50 to-amber-100/50 text-amber-600 dark:from-amber-950/20 dark:to-amber-900/10 dark:text-amber-400",
      "bg-gradient-to-br from-rose-50 to-rose-100/50 text-rose-600 dark:from-rose-950/20 dark:to-rose-900/10 dark:text-rose-400",
      "bg-gradient-to-br from-indigo-50 to-indigo-100/50 text-indigo-600 dark:from-indigo-950/20 dark:to-indigo-900/10 dark:text-indigo-400",
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

  // Helper to format image and document URLs
  const getFormattedImageUrl = (path: string | null | undefined) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
      return path;
    }
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
  };

  if (isLoading) {
    return (
      <div className="w-full pb-8">
        <div className="flex items-center gap-2 mb-6">
          <Link
            href="/customers"
            className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-250 transition-colors"
          >
            &larr; Back to Customers
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8">
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
            className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-250 transition-colors"
          >
            &larr; Back to Customers
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 text-center">
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
      {/* Header action bar (Glassmorphism design) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-gray-800/60 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/customers"
            className="flex items-center justify-center h-8.5 w-8.5 rounded-xl border border-gray-150 dark:border-gray-850 bg-white dark:bg-gray-950 text-gray-500 hover:text-gray-750 dark:hover:text-white transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight">{customer.fullName}</h1>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold">Customer Profile Overview</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 relative z-50">
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="inline-flex items-center gap-1.5 justify-center py-2 px-4 font-bold rounded-xl text-xs bg-red-50/50 hover:bg-red-100/50 dark:bg-red-955/20 dark:hover:bg-red-955/40 text-red-650 dark:text-red-400 border border-red-150/40 dark:border-red-900/30 transition-all cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Customer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Span 4) - Profile Card */}
        <div className="lg:col-span-4 space-y-6">
          {/* Executive Profile Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80 rounded-3xl overflow-hidden shadow-xs relative">
            {/* Header Banner */}
            <div className="h-22 w-full bg-gradient-to-r from-blue-500/15 via-purple-500/10 to-indigo-500/5 dark:from-blue-500/10 dark:via-purple-500/5 dark:to-indigo-500/2 relative overflow-hidden">
              <div className="absolute inset-0 bg-grid-white/[0.02]" />
            </div>

            <div className="flex flex-col items-center text-center px-6 pb-6">
              {/* Overlapping Avatar */}
              <div className="relative -mt-11 mb-3.5">
                {customer.profileImage ? (
                  <div className="w-22 h-22 overflow-hidden rounded-full border-4 border-white dark:border-gray-900 shadow-md relative z-10">
                    <img
                      src={getFormattedImageUrl(customer.profileImage)}
                      alt={customer.fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className={`w-22 h-22 rounded-full flex items-center justify-center font-extrabold text-xl border-4 border-white dark:border-gray-900 shadow-md relative z-10 ${avatarColorClass}`}>
                    {initials}
                  </div>
                )}
                {/* Active Indicator dot */}
                <span className={`absolute bottom-0.5 right-0.5 h-4 w-4 rounded-full border-3 border-white dark:border-gray-900 z-20 shadow-sm ${customer.isOnline ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-700"}`} />
              </div>

              <h2 className="text-base font-extrabold text-gray-900 dark:text-white leading-tight">
                {customer.fullName}
              </h2>
              
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 select-all font-medium">
                {customer.email}
              </p>

              {customer.phone && (
                <p className="text-[11px] text-gray-400 dark:text-gray-550 mt-0.5">
                  {customer.phone}
                </p>
              )}

              {/* Status and Verification Badges */}
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Badge color={getStatusColor(customer.status)} size="md">
                  Status: {customer.status}
                </Badge>
                <Badge color={customer.isVerified ? "success" : "warning"} size="md">
                  {customer.isVerified ? "Verified" : "Unverified"}
                </Badge>
              </div>

              {/* Information table */}
              <div className="mt-6 w-full pt-4.5 border-t border-gray-50 dark:border-gray-800/80 space-y-2.5 text-xs text-gray-400">
                <div className="flex items-center justify-between">
                  <span>System Role:</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-[10px]">
                    {customer.role}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Connection Sync:</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {customer.isOnline ? "Connected Now" : "Disconnected"}
                  </span>
                </div>
                {customer.lastSeen && (
                  <div className="flex items-center justify-between">
                    <span>Last Active:</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      {formatDate(customer.lastSeen)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Span 8) - Tabs & Detail Tables */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80 rounded-3xl shadow-xs overflow-hidden">
            {/* Pill tabs headers */}
            <div className="flex border-b border-gray-100 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-950/20 px-6 py-4 overflow-x-auto scrollbar-none gap-2">
              {[
                { id: "general", label: "General Details", icon: (
                  <svg className="w-3.5 h-3.5 mr-1.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                ) },
                { id: "saved-traders", label: "Saved Traders", icon: (
                  <svg className="w-3.5 h-3.5 mr-1.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                ), badgeCount: customer.savedTraders?.length },
                { id: "reviews", label: "Reviews Feed", icon: (
                  <svg className="w-3.5 h-3.5 mr-1.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-brand-500 text-white shadow-sm shadow-brand-500/10"
                      : "text-gray-450 hover:text-gray-700 dark:hover:text-gray-255 hover:bg-gray-50 dark:hover:bg-gray-950/40"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.badgeCount ? (
                    <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-650 dark:bg-gray-800 dark:text-gray-300"}`}>
                      {tab.badgeCount}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>

            {/* Tab Panels */}
            <div className="p-6">
              {/* General details Tab */}
              {activeTab === "general" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider mb-4 font-mono">Account Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                      <div className="flex flex-col pb-3 border-b border-gray-50 dark:border-gray-800/40">
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold">User UUID</span>
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 select-all font-mono mt-1 break-all">
                          {customer.id}
                        </span>
                      </div>
                      <div className="flex flex-col pb-3 border-b border-gray-50 dark:border-gray-800/40">
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold">System Role</span>
                        <span className="text-xs font-semibold text-gray-805 dark:text-gray-200 mt-1">
                          {customer.role}
                        </span>
                      </div>
                      <div className="flex flex-col pb-3 border-b border-gray-50 dark:border-gray-800/40">
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold">Phone Connection</span>
                        <span className="text-xs font-semibold text-gray-805 dark:text-gray-250 mt-1">
                          {customer.phone || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col pb-3 border-b border-gray-50 dark:border-gray-800/40">
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold">Terms Acceptance</span>
                        <span className="text-xs font-semibold text-gray-805 dark:text-gray-200 mt-1">
                          {customer.acceptedTerms ? "Accepted" : "Not Accepted"}
                        </span>
                      </div>
                      <div className="flex flex-col pb-3 border-b border-gray-50 dark:border-gray-800/40">
                        <span className="text-[10px] text-gray-400 dark:text-gray-550 uppercase font-bold">Account Created Date</span>
                        <span className="text-xs font-semibold text-gray-805 dark:text-gray-200 mt-1">
                          {formatDate(customer.createdAt)}
                        </span>
                      </div>
                      <div className="flex flex-col pb-3 border-b border-gray-50 dark:border-gray-800/40">
                        <span className="text-[10px] text-gray-400 dark:text-gray-550 uppercase font-bold">Last Database Sync</span>
                        <span className="text-xs font-semibold text-gray-855 dark:text-gray-200 mt-1">
                          {formatDate(customer.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider mb-4 font-mono">Location Coordinates</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                      <div className="flex flex-col pb-3 border-b border-gray-50 dark:border-gray-800/40">
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold">Latitude</span>
                        <span className="text-xs font-semibold text-gray-805 dark:text-gray-250 mt-1 font-mono">
                          {customer.latitude !== null ? customer.latitude : "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col pb-3 border-b border-gray-50 dark:border-gray-800/40">
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold">Longitude</span>
                        <span className="text-xs font-semibold text-gray-805 dark:text-gray-250 mt-1 font-mono">
                          {customer.longitude !== null ? customer.longitude : "N/A"}
                        </span>
                      </div>
                    </div>

                    {(customer.latitude !== null && customer.longitude !== null) && (
                      <div className="mt-5">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${customer.latitude},${customer.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-750 text-xs font-bold text-brand-500 rounded-xl transition-all border border-gray-150 dark:border-gray-850 cursor-pointer shadow-2xs"
                        >
                          <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Open location on Google Maps
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Saved Traders Tab */}
              {activeTab === "saved-traders" && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider mb-4 font-mono">Bookmarked Traders Profiles</h3>
                  {(!customer.savedTraders || customer.savedTraders.length === 0) ? (
                    <div className="text-center py-10 bg-gray-50/40 dark:bg-gray-950/10 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                      <p className="text-xs text-gray-400 dark:text-gray-600 italic">This customer hasn't bookmarked any traders yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {customer.savedTraders.map((saved) => (
                        <div
                          key={saved.id}
                          className="p-4 border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950/15 rounded-2xl flex flex-col justify-between hover:border-gray-200 dark:hover:border-gray-700 transition-colors shadow-2xs"
                        >
                          <div>
                            <div className="flex items-center gap-3 mb-3">
                              {saved.trader?.profileImage || (saved.trader as any)?.traderProfile?.logo ? (
                                <div className="w-10 h-10 overflow-hidden rounded-full border border-gray-100 dark:border-gray-800 shrink-0">
                                  <img
                                    src={getFormattedImageUrl(saved.trader?.profileImage || (saved.trader as any)?.traderProfile?.logo)}
                                    alt={saved.trader?.fullName}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[11px] bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 shrink-0">
                                  {getInitials(saved.trader?.fullName || "Trader")}
                                </div>
                              )}
                              <div className="truncate">
                                <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                                  {saved.trader?.fullName || "Trader Info Loading..."}
                                </h4>
                                <span className="text-[9px] font-mono text-gray-450 dark:text-gray-500 block mt-0.5">
                                  Trader UUID: {saved.traderId}
                                </span>
                              </div>
                            </div>
                            <div className="text-[10px] text-gray-450 dark:text-gray-500 flex items-center justify-between mt-2.5 pt-2.5 border-t border-gray-50 dark:border-gray-800/40">
                              <span>Saved Date:</span>
                              <span className="font-semibold">{formatDate(saved.createdAt)}</span>
                            </div>
                          </div>
                          <div className="mt-4 pt-2">
                            <Link
                              href={`/traders/${saved.traderId}`}
                              className="block w-full text-center py-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-300 font-bold text-[10px] rounded-lg transition-colors border border-gray-100 dark:border-gray-750 cursor-pointer shadow-3xs"
                            >
                              Inspect Trader &rarr;
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
                  {/* Reviews Given */}
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider mb-4 font-mono">Reviews Written (As Customer)</h3>
                    {(!customer.customerReviews || customer.customerReviews.length === 0) ? (
                      <div className="text-center py-8 bg-gray-50/40 dark:bg-gray-950/10 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                        <p className="text-xs text-gray-400 dark:text-gray-500 italic">No feedback reviews written by this customer.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {customer.customerReviews.map((rev: any) => (
                          <div key={rev.id} className="p-4 border border-gray-100 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-950/5 hover:border-gray-200 dark:hover:border-gray-700 transition-colors shadow-3xs">
                            <div className="flex items-center justify-between mb-2.5 gap-2">
                              <span className="text-xs font-bold text-gray-850 dark:text-white bg-gray-50 dark:bg-gray-800 px-2.5 py-0.5 rounded-lg border border-gray-100 dark:border-gray-755 font-mono">
                                Rating: {rev.rating} / 5
                              </span>
                              <span className="text-[10px] text-gray-400 font-medium">{formatDate(rev.createdAt)}</span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-350 leading-relaxed font-medium">
                              "{rev.comment}"
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Reviews Received */}
                  <div className="pt-2 border-t border-gray-50 dark:border-gray-800/80">
                    <h3 className="text-xs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider mb-4 font-mono">Reviews Received</h3>
                    {(!customer.traderReviews || customer.traderReviews.length === 0) ? (
                      <div className="text-center py-8 bg-gray-50/40 dark:bg-gray-950/10 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                        <p className="text-xs text-gray-400 dark:text-gray-500 italic">No feedback reviews received.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {customer.traderReviews.map((rev: any) => (
                          <div key={rev.id} className="p-4 border border-gray-100 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-950/5 hover:border-gray-200 dark:hover:border-gray-700 transition-colors shadow-3xs">
                            <div className="flex items-center justify-between mb-2.5 gap-2">
                              <span className="text-xs font-bold text-gray-850 dark:text-white bg-gray-50 dark:bg-gray-800 px-2.5 py-0.5 rounded-lg border border-gray-100 dark:border-gray-755 font-mono">
                                Rating: {rev.rating} / 5
                              </span>
                              <span className="text-[10px] text-gray-400 font-medium">{formatDate(rev.createdAt)}</span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-350 leading-relaxed font-medium">
                              "{rev.comment}"
                            </p>
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

      {/* Confirmation Modal: Delete */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} className="max-w-md p-6" showCloseButton={false}>
        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
          Delete Customer Account
        </h4>
        <p className="text-xs text-gray-550 dark:text-gray-400 leading-relaxed mb-5">
          Are you sure you want to permanently delete the profile for <strong className="text-gray-855 dark:text-white">{customer.fullName}</strong>? This action is permanent and cannot be undone. All associated customer reviews, search histories, and list configurations will be removed.
        </p>
        <div className="flex justify-end gap-3 pt-3 border-t border-gray-50 dark:border-gray-850">
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/5 border border-gray-200 dark:border-gray-755 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            Confirm Delete
          </button>
        </div>
      </Modal>

      {/* Floating Toast Notification Container */}
      <div className="fixed top-6 right-6 z-[999999] flex flex-col gap-2.5 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-center gap-3.5 px-4.5 py-3 rounded-2xl shadow-xl border border-gray-200/90 dark:border-gray-805/90 max-w-sm w-full pointer-events-auto transition-all duration-300 bg-white dark:bg-gray-900/95 text-gray-800 dark:text-white"
          >
            <span className="text-xs font-bold flex-1">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors cursor-pointer shrink-0"
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
