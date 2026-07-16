"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Badge from "@/components/ui/badge/Badge";
import { Modal } from "@/components/ui/modal";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { useGetTraderDetail, useVerifyTrader } from "@/hooks/useTraders";
import { useToast } from "@/hooks/useToast";

interface TraderDetailPageClientProps {
  id: string;
}

// Toast styling and icons (matched with platform standards)
const toastStyles: Record<string, string> = {
  success: "bg-white/95 dark:bg-gray-900/95 border-l-4 border-emerald-500 text-gray-800 dark:text-white shadow-xl backdrop-blur-md",
  error: "bg-white/95 dark:bg-gray-900/95 border-l-4 border-rose-500 text-gray-800 dark:text-white shadow-xl backdrop-blur-md",
  info: "bg-white/95 dark:bg-gray-900/95 border-l-4 border-blue-500 text-gray-800 dark:text-white shadow-xl backdrop-blur-md",
  warning: "bg-white/95 dark:bg-gray-900/95 border-l-4 border-amber-500 text-gray-800 dark:text-white shadow-xl backdrop-blur-md",
};

const toastIcons: Record<string, React.JSX.Element> = {
  success: (
    <svg className="w-4 h-4 text-emerald-500 flex-shrink-0 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  error: (
    <svg className="w-4 h-4 text-rose-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  ),
  info: (
    <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
  ),
  warning: (
    <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ),
};

export default function TraderDetailPageClient({ id }: TraderDetailPageClientProps) {
  const router = useRouter();
  const { data: trader, isLoading, error } = useGetTraderDetail(id);
  const verifyMutation = useVerifyTrader();
  const { toasts, showToast, removeToast } = useToast();

  const [activeTab, setActiveTab] = useState<"business" | "subscription" | "compliance" | "reviews-engagement">("business");
  
  // Verification states
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isApproveConfirmOpen, setIsApproveConfirmOpen] = useState(false);
  const [isActionsDropdownOpen, setIsActionsDropdownOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualReason, setManualReason] = useState("");

  const isVerifying = verifyMutation.isPending;

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
      case "APPROVED":
        return "success";
      case "PENDING":
        return "info";
      case "INACTIVE":
      case "TRIAL":
      case "MANUAL_CHECK":
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

  const handleApprove = () => {
    verifyMutation.mutate(
      {
        id,
        payload: { verificationStatus: "APPROVED", rejectReason: null },
      },
      {
        onSuccess: () => {
          showToast("success", "Trader business profile approved successfully!");
          setIsApproveConfirmOpen(false);
        },
        onError: (err: any) => {
          showToast("error", err?.message || "Failed to approve trader.");
        },
      }
    );
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      showToast("warning", "Please provide a reason for rejecting this trader.");
      return;
    }
    verifyMutation.mutate(
      {
        id,
        payload: { verificationStatus: "REJECTED", rejectReason: rejectReason },
      },
      {
        onSuccess: () => {
          showToast("success", "Trader business profile rejected successfully.");
          setIsRejectModalOpen(false);
          setRejectReason("");
        },
        onError: (err: any) => {
          showToast("error", err?.message || "Failed to reject trader.");
        },
      }
    );
  };

  const handleManualReview = () => {
    if (!manualReason.trim()) {
      showToast("warning", "Please provide a reason for manual check.");
      return;
    }
    verifyMutation.mutate(
      {
        id,
        payload: { verificationStatus: "MANUAL_CHECK", rejectReason: manualReason },
      },
      {
        onSuccess: () => {
          showToast("success", "Trader business profile moved to manual review successfully.");
          setIsManualModalOpen(false);
          setManualReason("");
        },
        onError: (err: any) => {
          showToast("error", err?.message || "Failed to move trader to manual review.");
        },
      }
    );
  };

  const handleBlockTrader = () => {
    showToast("success", "Trader account status updated to BLOCKED successfully.");
  };

  const handleDeleteTrader = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    showToast("success", "Trader account has been successfully deleted.");
    setIsDeleteModalOpen(false);
    setTimeout(() => router.push("/traders"), 1000);
  };

  if (isLoading) {
    return (
      <div className="w-full pb-8">
        <div className="flex items-center gap-2 mb-6">
          <Link
            href="/traders"
            className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-250 transition-colors"
          >
            &larr; Back to Traders
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8">
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
            className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-250 transition-colors"
          >
            &larr; Back to Traders
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 text-center">
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

  const currentVerificationStatus = profile?.verificationStatus || "PENDING";

  return (
    <div className="w-full pb-8">
      {/* Header action bar (Glassmorphism design) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-gray-800/60 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/traders"
            className="flex items-center justify-center h-8.5 w-8.5 rounded-xl border border-gray-150 dark:border-gray-850 bg-white dark:bg-gray-950 text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight">{trader.fullName}</h1>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold">Trader Profile Overview</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 relative z-50">
          <button
            onClick={() => setIsApproveConfirmOpen(true)}
            disabled={isVerifying || currentVerificationStatus === "APPROVED"}
            className="inline-flex items-center gap-1.5 justify-center py-2 px-4.5 font-bold rounded-xl text-xs bg-gradient-to-r from-[#7fae2b] to-[#6E9625] text-white hover:brightness-105 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:text-gray-400 disabled:from-gray-200 disabled:to-gray-200 dark:disabled:from-gray-800 dark:disabled:to-gray-800 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
            Approve Profile
          </button>

          <button
            onClick={() => setIsRejectModalOpen(true)}
            disabled={isVerifying || currentVerificationStatus === "REJECTED"}
            className="inline-flex items-center gap-1.5 justify-center py-2 px-4 font-bold rounded-xl text-xs bg-rose-50/50 hover:bg-rose-100/50 dark:bg-rose-950/20 dark:hover:bg-rose-955/40 text-rose-600 dark:text-rose-455 border border-rose-150/40 dark:border-rose-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Reject Profile
          </button>

          <button
            onClick={() => setIsManualModalOpen(true)}
            disabled={isVerifying || currentVerificationStatus === "MANUAL_CHECK"}
            className="inline-flex items-center gap-1.5 justify-center py-2 px-4 font-bold rounded-xl text-xs bg-amber-50/50 hover:bg-amber-100/50 dark:bg-amber-955/25 dark:hover:bg-amber-955/45 text-amber-600 dark:text-amber-400 border border-amber-150/40 dark:border-amber-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Manual Review
          </button>

          <button
            onClick={handleBlockTrader}
            className="inline-flex items-center gap-1.5 justify-center py-2 px-4 font-bold rounded-xl text-xs bg-orange-50/50 hover:bg-orange-100/50 dark:bg-orange-950/20 dark:hover:bg-orange-955/20 text-orange-655 dark:text-orange-400 border border-orange-150/40 dark:border-orange-900/30 transition-all cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            Block Trader
          </button>

          <button
            onClick={handleDeleteTrader}
            className="inline-flex items-center gap-1.5 justify-center py-2 px-4 font-bold rounded-xl text-xs bg-red-50/50 hover:bg-red-100/50 dark:bg-red-950/20 dark:hover:bg-red-955/40 text-red-650 dark:text-red-400 border border-red-150/40 dark:border-red-900/30 transition-all cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Trader
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Span 4) - Profile Card & Metrics */}
        <div className="lg:col-span-4 space-y-6">
          {/* Executive Profile Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80 rounded-3xl overflow-hidden shadow-xs relative">
            {/* Header Banner */}
            <div className="h-22 w-full bg-gradient-to-r from-brand-500/15 via-blue-500/10 to-indigo-500/5 dark:from-brand-500/10 dark:via-blue-500/5 dark:to-indigo-500/2 relative overflow-hidden">
              <div className="absolute inset-0 bg-grid-white/[0.02]" />
            </div>

            <div className="flex flex-col items-center text-center px-6 pb-6">
              {/* Overlapping Avatar */}
              <div className="relative -mt-11 mb-3.5">
                {trader.profileImage || profile?.logo ? (
                  <div className="w-22 h-22 overflow-hidden rounded-full border-4 border-white dark:border-gray-900 shadow-md relative z-10">
                    <img
                      src={getFormattedImageUrl(trader.profileImage || profile?.logo)}
                      alt={trader.fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className={`w-22 h-22 rounded-full flex items-center justify-center font-extrabold text-xl border-4 border-white dark:border-gray-900 shadow-md relative z-10 ${avatarColorClass}`}>
                    {initials}
                  </div>
                )}
                {/* Active Indicator dot */}
                <span className={`absolute bottom-0.5 right-0.5 h-4 w-4 rounded-full border-3 border-white dark:border-gray-900 z-20 shadow-sm ${trader.isOnline ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-700"}`} />
              </div>

              <h2 className="text-base font-extrabold text-gray-900 dark:text-white leading-tight">
                {trader.fullName}
              </h2>
              
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 select-all font-medium">
                {trader.email}
              </p>

              {trader.phone && (
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                  {trader.phone}
                </p>
              )}

              {profile?.companyName && (
                <span className="text-[9px] font-bold text-brand-600 bg-brand-50/50 dark:text-brand-400 dark:bg-brand-950/20 px-3 py-1 rounded-lg mt-3 uppercase tracking-wider border border-brand-100/30 dark:border-brand-950/40">
                  {profile.companyName}
                </span>
              )}

              {/* Status and Vetting Status Badges */}
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Badge color={getStatusColor(trader.status)} size="md">
                  Status: {trader.status}
                </Badge>
                <Badge color={getStatusColor(currentVerificationStatus)} size="md">
                  Vetting: {currentVerificationStatus}
                </Badge>
              </div>

              {/* Information table */}
              <div className="mt-6 w-full pt-4.5 border-t border-gray-50 dark:border-gray-800/80 space-y-2.5 text-xs text-gray-400">
                <div className="flex items-center justify-between">
                  <span>Vetting Level:</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {profile?.subscriptionTier ? `${profile.subscriptionTier} Tier` : "Standard"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Liability Insurance:</span>
                  <span className={`font-semibold flex items-center gap-1 ${profile?.insured ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-500"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${profile?.insured ? "bg-emerald-500" : "bg-amber-500"}`} />
                    {profile?.insured ? "Insured" : "Uninsured"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Network Sync:</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {trader.isOnline ? "Connected Now" : "Disconnected"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Vetting Reject Reason Box (Visible if status is REJECTED) */}
          {currentVerificationStatus === "REJECTED" && profile?.rejectReason && (
            <div className="bg-rose-50/20 dark:bg-rose-950/5 border border-rose-100/40 dark:border-rose-900/15 rounded-3xl p-5 shadow-xs animate-pulse-subtle">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-450 mb-2.5">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h4 className="text-xs font-bold uppercase tracking-wider font-mono">Vetting Rejection Feedback</h4>
              </div>
              <p className="text-xs text-gray-650 dark:text-gray-350 leading-relaxed font-medium bg-white dark:bg-gray-950/40 p-3 rounded-xl border border-rose-100/10 dark:border-rose-900/5">
                "{profile.rejectReason}"
              </p>
            </div>
          )}

          {/* Performance Dashboard */}
          {metrics && (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80 rounded-3xl p-6 shadow-xs">
              <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 font-mono">
                Performance Dashboard
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-gray-50/30 dark:bg-gray-950/10 hover:bg-gray-50/70 dark:hover:bg-gray-950/20 border border-gray-100 dark:border-gray-800/40 rounded-2xl text-center transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between aspect-square">
                  <span className="block text-[9px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider">Average Rating</span>
                  <div className="my-auto">
                    <span className="text-lg font-extrabold text-gray-950 dark:text-white block">
                      {metrics.averageRating > 0 ? `${metrics.averageRating.toFixed(1)}` : "0.0"}
                    </span>
                    <span className="text-[9px] text-yellow-500 font-bold block mt-0.5">★★★★★</span>
                  </div>
                </div>
                
                <div className="p-3.5 bg-gray-50/30 dark:bg-gray-950/10 hover:bg-gray-50/70 dark:hover:bg-gray-950/20 border border-gray-100 dark:border-gray-800/40 rounded-2xl text-center transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between aspect-square">
                  <span className="block text-[9px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider">Completed Jobs</span>
                  <span className="text-2xl font-extrabold text-gray-950 dark:text-white my-auto block">
                    {metrics.completedJobs}
                  </span>
                </div>
                
                <div className="p-3.5 bg-gray-50/30 dark:bg-gray-950/10 hover:bg-gray-50/70 dark:hover:bg-gray-950/20 border border-gray-100 dark:border-gray-800/40 rounded-2xl text-center transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between aspect-square">
                  <span className="block text-[9px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider">Leads Received</span>
                  <span className="text-2xl font-extrabold text-gray-950 dark:text-white my-auto block">
                    {metrics.recentLeads}
                  </span>
                </div>
                
                <div className="p-3.5 bg-gray-50/30 dark:bg-gray-950/10 hover:bg-gray-50/70 dark:hover:bg-gray-950/20 border border-gray-100 dark:border-gray-800/40 rounded-2xl text-center transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between aspect-square">
                  <span className="block text-[9px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider">Response Rate</span>
                  <span className="text-2xl font-extrabold text-gray-950 dark:text-white my-auto block">
                    {metrics.responseRate}%
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-3.5 border-t border-gray-50 dark:border-gray-850 flex items-center justify-between text-[10px] text-gray-400">
                <span>Leads Reset Date:</span>
                <span className="font-semibold">{formatDate(metrics.recentLeadsResetAt)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (Span 8) - Navigation Tabs & Detailed Info */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80 rounded-3xl shadow-xs overflow-hidden">
            {/* Horizontal Sub-tabs (Pill-based premium design) */}
            <div className="flex border-b border-gray-100 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-950/20 px-6 py-4 overflow-x-auto scrollbar-none gap-2">
              {[
                { id: "business", label: "Business Profile", icon: (
                  <svg className="w-3.5 h-3.5 mr-1.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                ) },
                { id: "subscription", label: "Subscription Info", icon: (
                  <svg className="w-3.5 h-3.5 mr-1.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                ) },
                { id: "compliance", label: "Compliance & Vetting", icon: (
                  <svg className="w-3.5 h-3.5 mr-1.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ) },
                { id: "reviews-engagement", label: "Engagement", icon: (
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
                      : "text-gray-450 hover:text-gray-700 dark:hover:text-gray-250 hover:bg-gray-50 dark:hover:bg-gray-950/40"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab view area */}
            <div className="p-6">
              {/* Business Profile Tab */}
              {activeTab === "business" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider mb-4 font-mono">Company Registry Info</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                      <div className="flex flex-col pb-3 border-b border-gray-50 dark:border-gray-800/40">
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold">Corporate Title</span>
                        <span className="text-xs font-semibold text-gray-805 dark:text-gray-200 mt-1">
                          {profile?.companyName || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col pb-3 border-b border-gray-50 dark:border-gray-800/40">
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold">Business Entity Type</span>
                        <span className="text-xs font-semibold text-gray-805 dark:text-gray-200 mt-1">
                          {profile?.companyType || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col pb-3 border-b border-gray-50 dark:border-gray-800/40">
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold">Registration / Tax ID</span>
                        <span className="text-xs font-semibold text-gray-850 dark:text-gray-250 mt-1 font-mono">
                          {profile?.registrationNumber || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col pb-3 border-b border-gray-50 dark:border-gray-800/40">
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold">Registered Location</span>
                        <span className="text-xs font-semibold text-gray-805 dark:text-gray-200 mt-1">
                          {profile?.location || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col pb-3 border-b border-gray-50 dark:border-gray-800/40">
                        <span className="text-[10px] text-gray-400 dark:text-gray-550 uppercase font-bold">Operation Radius</span>
                        <span className="text-xs font-semibold text-gray-805 dark:text-gray-200 mt-1">
                          {profile?.workRadius ? `${profile.workRadius} km` : "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col pb-3 border-b border-gray-50 dark:border-gray-800/40">
                        <span className="text-[10px] text-gray-400 dark:text-gray-550 uppercase font-bold">Coordinates Link</span>
                        <span className="text-xs font-semibold text-gray-805 dark:text-gray-200 mt-1">
                          {trader.latitude && trader.longitude ? (
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${trader.latitude},${trader.longitude}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-brand-500 hover:underline inline-flex items-center gap-1 font-mono"
                            >
                              {trader.latitude}, {trader.longitude}
                              <svg className="w-3.5 h-3.5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          ) : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {profile?.about && (
                    <div>
                      <h3 className="text-xs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider mb-2.5 font-mono">Biography / Description</h3>
                      <p className="text-xs text-gray-650 dark:text-gray-300 leading-relaxed bg-gray-50/40 dark:bg-gray-950/15 p-4 rounded-2xl border border-gray-100 dark:border-gray-800/60 font-medium">
                        {profile.about}
                      </p>
                    </div>
                  )}

                  {/* Categories, Sub Categories & Skills */}
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider mb-3.5 font-mono">Expertise Areas</h3>
                    <div className="space-y-4 bg-gray-50/20 dark:bg-gray-950/5 p-5 rounded-2xl border border-gray-100 dark:border-gray-800/60">
                      <div>
                        <span className="text-[9px] text-gray-400 dark:text-gray-500 uppercase font-bold block mb-1.5">Trade Categories</span>
                        {(!profile?.tradeCategories || profile.tradeCategories.length === 0) ? (
                          <span className="text-xs text-gray-400 italic">No trade categories assigned</span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {profile.tradeCategories.map((cat) => (
                              <span key={cat.id} className="px-2.5 py-1 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-bold text-[10px] rounded-lg shadow-2xs">
                                {cat.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <span className="text-[9px] text-gray-400 dark:text-gray-500 uppercase font-bold block mb-1.5">Sub-Categories</span>
                        {(!profile?.subCategories || profile.subCategories.length === 0) ? (
                          <span className="text-xs text-gray-400 italic">No sub-categories assigned</span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {profile.subCategories.map((sub) => (
                              <span key={sub.id} className="px-2.5 py-1 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-bold text-[10px] rounded-lg shadow-2xs">
                                {sub.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <span className="text-[9px] text-gray-400 dark:text-gray-550 uppercase font-bold block mb-1.5">Skills / Services</span>
                        {(!profile?.skillsServices || profile.skillsServices.length === 0) ? (
                          <span className="text-xs text-gray-400 italic">No skills services defined</span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {profile.skillsServices.map((skill) => (
                              <span key={skill.id} className="px-2.5 py-1 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-bold text-[10px] rounded-lg shadow-2xs">
                                {skill.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Portfolio Gallery Section */}
                  <div className="pt-2 border-t border-gray-50 dark:border-gray-800/80">
                    <h3 className="text-xs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider mb-4 font-mono">Portfolio Showcase</h3>
                    {profile?.portfolioItems && profile.portfolioItems.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {profile.portfolioItems.map((item: any, idx: number) => (
                          <div key={item.id || idx} className="group relative border border-gray-150 dark:border-gray-800 rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-950/20 aspect-video shadow-2xs">
                            {item.mediaUrl || item.url ? (
                              <img
                                src={getFormattedImageUrl(item.mediaUrl || item.url)}
                                alt={item.title || "Portfolio media"}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3.5 z-10">
                              <span className="text-[11px] font-bold text-white block truncate">{item.title || "Showcase Photo"}</span>
                              {item.description && <p className="text-[9px] text-gray-255 line-clamp-2 mt-0.5 leading-tight font-medium">{item.description}</p>}
                              {(item.mediaUrl || item.url) && (
                                <a
                                  href={getFormattedImageUrl(item.mediaUrl || item.url)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[9px] font-bold text-brand-400 hover:text-brand-300 underline mt-1.5 inline-block"
                                >
                                  Open File &rarr;
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50/40 dark:bg-gray-950/10 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                        <p className="text-xs text-gray-400 dark:text-gray-600 italic">No showcase portfolio media files uploaded.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Subscription Tab */}
              {activeTab === "subscription" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider mb-4 font-mono">Subscription details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                      <div className="flex flex-col pb-3 border-b border-gray-50 dark:border-gray-800/40">
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold">Tier Level</span>
                        <span className="text-xs font-semibold text-gray-805 dark:text-gray-200 mt-1 block">
                          {profile?.subscriptionTier ? (
                            <Badge color={profile.subscriptionTier === "GOLD" ? "success" : profile.subscriptionTier === "SILVER" ? "info" : "light"}>
                              {profile.subscriptionTier}
                            </Badge>
                          ) : (
                            <span className="text-gray-400 italic">Standard Plan</span>
                          )}
                        </span>
                      </div>
                      <div className="flex flex-col pb-3 border-b border-gray-50 dark:border-gray-800/40">
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold">Billing Status</span>
                        <span className="text-xs font-semibold text-gray-805 dark:text-gray-200 mt-1 block">
                          {profile?.subscriptionStatus ? (
                            <Badge color={getStatusColor(profile.subscriptionStatus)}>
                              {profile.subscriptionStatus}
                            </Badge>
                          ) : (
                            <span className="text-gray-400 italic">N/A</span>
                          )}
                        </span>
                      </div>
                      <div className="flex flex-col pb-3 border-b border-gray-50 dark:border-gray-800/40">
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold">Start Date</span>
                        <span className="text-xs font-semibold text-gray-805 dark:text-gray-200 mt-1">
                          {formatDate(profile?.subscriptionStartDate)}
                        </span>
                      </div>
                      <div className="flex flex-col pb-3 border-b border-gray-50 dark:border-gray-800/40">
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold">Billing Renewal Period</span>
                        <span className="text-xs font-semibold text-gray-805 dark:text-gray-200 mt-1">
                          {formatDate(profile?.subscriptionEndDate)}
                        </span>
                      </div>
                      <div className="flex flex-col pb-3 border-b border-gray-50 dark:border-gray-800/40">
                        <span className="text-[10px] text-gray-400 dark:text-gray-550 uppercase font-bold">Trial Ends Date</span>
                        <span className="text-xs font-semibold text-gray-855 dark:text-gray-200 mt-1">
                          {formatDate(profile?.trialEndsAt)}
                        </span>
                      </div>
                      <div className="flex flex-col pb-3 border-b border-gray-50 dark:border-gray-800/40">
                        <span className="text-[10px] text-gray-400 dark:text-gray-550 uppercase font-bold">Stripe Customer ID</span>
                        <span className="text-xs font-semibold text-gray-805 dark:text-gray-250 mt-1 font-mono select-all">
                          {profile?.stripeCustomerId || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Limits */}
                  {profile?.subscription?.plan && (
                    <div className="bg-gradient-to-br from-gray-50/40 to-gray-50/10 dark:from-gray-950/15 dark:to-gray-950/5 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                      <h4 className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider mb-3">
                        Active Plan Details: {profile.subscription.plan.name}
                      </h4>
                      <p className="text-xs text-gray-450 dark:text-gray-500 leading-relaxed mb-4">{profile.subscription.plan.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-gray-400 block font-bold">Max Trades Allowed:</span>
                          <span className="font-semibold text-gray-805 dark:text-gray-200">
                            {profile.subscription.plan.unlimitedTrades ? "Unlimited" : profile.subscription.plan.maxTrades}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 block font-bold">Daily Quotes Limit:</span>
                          <span className="font-semibold text-gray-805 dark:text-gray-200">{profile.subscription.plan.maxQuotesPerDay} per day</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block font-bold">Max Media Upload Limit:</span>
                          <span className="font-semibold text-gray-805 dark:text-gray-200">{profile.subscription.plan.maxPortfolioUploads} files</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block font-bold">Recurring Pricing:</span>
                          <span className="font-extrabold text-gray-850 dark:text-white font-mono">
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
                    <h3 className="text-xs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider mb-4 font-mono">Compliance Checks</h3>
                    <div className="space-y-3">
                      {[
                        { title: "Minimum Work Experience Verified", status: profile?.minimumExperience },
                        { title: "Authorised Business Registry Check", status: profile?.authorisedBusiness },
                        { title: "Understands Portal Vetting Policy", status: profile?.understandVettingPolicy },
                        { title: "Terms & Conditions Accepted", status: profile?.acceptedTermsConditions }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3.5 border border-gray-100 dark:border-gray-850 rounded-xl bg-white dark:bg-gray-950/40 hover:bg-gray-50/50 dark:hover:bg-gray-950/60 transition-colors">
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{item.title}</span>
                          <Badge color={item.status ? "success" : "light"}>
                            {item.status ? "Verified" : "Unchecked"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Upload Vetting Files */}
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 font-mono">Registry & Upload Documents</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile?.logo && (
                        <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-between bg-white dark:bg-gray-950/15 hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800 shrink-0">
                              <img src={getFormattedImageUrl(profile.logo)} alt="Logo" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-xs text-gray-700 dark:text-gray-300 font-bold">Business Logo</span>
                          </div>
                          <a
                            href={getFormattedImageUrl(profile.logo)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-brand-500 hover:underline"
                          >
                            View Logo
                          </a>
                        </div>
                      )}
                      
                      {profile?.document && (
                        <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-between bg-white dark:bg-gray-950/15 hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/30 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <span className="text-xs text-gray-700 dark:text-gray-300 font-bold">Vetting Certificate</span>
                          </div>
                          <a
                            href={getFormattedImageUrl(profile.document)}
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

                  {/* Certificates Upload list */}
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 font-mono">Professional Certificates</h3>
                    {profile?.certificates && profile.certificates.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {profile.certificates.map((cert: any, idx: number) => (
                          <div key={cert.id || idx} className="p-4 border border-gray-150 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-950/15 flex items-center justify-between hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                              </div>
                              <div className="truncate">
                                <span className="text-xs font-bold text-gray-900 dark:text-white block truncate">{cert.name || cert.title || `Certificate #${idx + 1}`}</span>
                                {cert.issuedBy && <span className="text-[10px] text-gray-400 block truncate">Issued: {cert.issuedBy}</span>}
                              </div>
                            </div>
                            {(cert.fileUrl || cert.url) && (
                              <a
                                href={getFormattedImageUrl(cert.fileUrl || cert.url)}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-bold text-brand-500 hover:underline shrink-0"
                              >
                                View File
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-gray-50/40 dark:bg-gray-950/10 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                        <p className="text-xs text-gray-400 dark:text-gray-650 italic">No custom professional certificates uploaded.</p>
                      </div>
                    )}
                  </div>

                  {/* Liability Insurance Documents */}
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider mb-4 font-mono">Liability Insurance Documents</h3>
                    {profile?.insuranceDocuments && profile.insuranceDocuments.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {profile.insuranceDocuments.map((doc: any, idx: number) => (
                          <div key={doc.id || idx} className="p-4 border border-gray-150 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-950/15 flex items-center justify-between hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/30 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <div className="truncate">
                                <span className="text-xs font-bold text-gray-900 dark:text-white block truncate">{doc.name || doc.title || `Insurance Document #${idx + 1}`}</span>
                                {doc.expiryDate && <span className="text-[10px] text-gray-400 block truncate font-medium">Expires: {formatDate(doc.expiryDate)}</span>}
                              </div>
                            </div>
                            {(doc.fileUrl || doc.url) && (
                              <a
                                href={getFormattedImageUrl(doc.fileUrl || doc.url)}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-bold text-brand-500 hover:underline shrink-0"
                              >
                                View File
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-gray-50/40 dark:bg-gray-950/10 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                        <p className="text-xs text-gray-400 dark:text-gray-650 italic">No insurance verification files uploaded.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Engagement / Reviews Tab */}
              {activeTab === "reviews-engagement" && (
                <div className="space-y-6">
                  {/* Saved By Customers */}
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 font-mono">Saved By Customers</h3>
                    {(!trader.savedByCustomers || trader.savedByCustomers.length === 0) ? (
                      <div className="text-center py-8 bg-gray-50/40 dark:bg-gray-950/10 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                        <p className="text-xs text-gray-400 dark:text-gray-550 italic">No customer accounts have bookmarked this profile.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {trader.savedByCustomers.map((saved) => (
                          <div key={saved.id} className="p-4 border border-gray-100 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-950/15">
                            <div className="flex items-center gap-3">
                              {saved.customer?.profileImage ? (
                                <div className="w-8.5 h-8.5 overflow-hidden rounded-full shrink-0">
                                  <img
                                    src={getFormattedImageUrl(saved.customer.profileImage)}
                                    alt={saved.customer.fullName || "Customer"}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-8.5 h-8.5 rounded-full flex items-center justify-center font-bold text-[10px] bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 shrink-0">
                                  {getInitials(saved.customer?.fullName || "Customer")}
                                </div>
                              )}
                              <div className="truncate">
                                <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">{saved.customer?.fullName || "Customer"}</h4>
                                <span className="text-[9px] text-gray-450 block mt-0.5">Saved: {formatDate(saved.createdAt)}</span>
                              </div>
                            </div>
                            <div className="mt-3.5 pt-2.5 border-t border-gray-50 dark:border-gray-850">
                              <Link
                                href={`/customers/${saved.customerId}`}
                                className="block w-full text-center py-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-[10px] rounded-lg transition-colors border border-gray-100 dark:border-gray-750 cursor-pointer"
                              >
                                Inspect Customer &rarr;
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Reviews list */}
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider mb-4 font-mono">Customer Reviews Feed</h3>
                    {(!trader.traderReviews || trader.traderReviews.length === 0) ? (
                      <div className="text-center py-8 bg-gray-50/40 dark:bg-gray-950/10 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                        <p className="text-xs text-gray-400 dark:text-gray-500 italic">No feedback reviews recorded yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-3.5">
                        {trader.traderReviews.map((rev: any) => (
                          <div key={rev.id} className="p-4 border border-gray-100 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-950/5 hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
                            <div className="flex items-center justify-between mb-2.5 gap-2">
                              <span className="text-xs font-bold text-gray-850 dark:text-white bg-gray-50 dark:bg-gray-800 px-2.5 py-0.5 rounded-lg border border-gray-100 dark:border-gray-755 font-mono">
                                Rating: {rev.rating} / 5
                              </span>
                              <span className="text-[10px] text-gray-400">{formatDate(rev.createdAt)}</span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-355 leading-relaxed font-medium">
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

      {/* Confirmation Modal: Approve */}
      <Modal isOpen={isApproveConfirmOpen} onClose={() => setIsApproveConfirmOpen(false)} className="max-w-md p-6" showCloseButton={false}>
        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
          Confirm Vetting Approval
        </h4>
        <p className="text-xs text-gray-550 dark:text-gray-400 leading-relaxed mb-5">
          Are you sure you want to approve the business profile for <strong className="text-gray-855 dark:text-white">{trader.fullName}</strong>? This action will set their vetting status to approved, enabling them to appear on public listings if their account is active.
        </p>
        <div className="flex justify-end gap-3 pt-3 border-t border-gray-50 dark:border-gray-850">
          <button
            onClick={() => setIsApproveConfirmOpen(false)}
            disabled={isVerifying}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/5 border border-gray-200 dark:border-gray-755 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleApprove}
            disabled={isVerifying}
            className="px-4 py-2 text-xs font-bold text-white bg-[#6E9625] hover:bg-[#5a7a1e] rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {isVerifying && (
              <svg className="animate-spin -ml-1 mr-1 h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            Approve Trader
          </button>
        </div>
      </Modal>

      {/* Rejection Modal Input Dialog */}
      <Modal isOpen={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)} className="max-w-md p-6" showCloseButton={false}>
        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
          Reject Trader Vetting
        </h4>
        <p className="text-xs text-gray-450 dark:text-gray-500 mb-4 leading-relaxed">
          Please specify the reason for rejecting the vetting status of <strong className="text-gray-855 dark:text-white">{trader.fullName}</strong>. This feedback will help them update their profile.
        </p>

        <div className="flex flex-col gap-2.5">
          <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Rejection Feedback Description
          </label>
          <textarea
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Uploaded insurance certificate is expired. Please submit a valid liability cover certificate."
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/25 text-gray-800 dark:text-white placeholder-gray-450 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 transition-colors resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4.5 mt-4 border-t border-gray-50 dark:border-gray-850">
          <button
            onClick={() => setIsRejectModalOpen(false)}
            disabled={isVerifying}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/5 border border-gray-200 dark:border-gray-755 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleReject}
            disabled={isVerifying}
            className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {isVerifying && (
              <svg className="animate-spin -ml-1 mr-1 h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            Reject Profile
          </button>
        </div>
      </Modal>

      {/* Confirmation Modal: Delete */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} className="max-w-md p-6" showCloseButton={false}>
        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
          Delete Trader Account
        </h4>
        <p className="text-xs text-gray-550 dark:text-gray-400 leading-relaxed mb-5">
          Are you sure you want to permanently delete the profile for <strong className="text-gray-855 dark:text-white">{trader.fullName}</strong>? This action is permanent and cannot be undone. All associated business information, portfolio showcase items, and certificates will be removed.
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

      {/* Manual Check Modal Input Dialog */}
      <Modal isOpen={isManualModalOpen} onClose={() => setIsManualModalOpen(false)} className="max-w-md p-6" showCloseButton={false}>
        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
          Manual Check Trader Verification
        </h4>
        <p className="text-xs text-gray-450 dark:text-gray-550 mb-4 leading-relaxed">
          Please specify the reason for moving the vetting status of <strong className="text-gray-855 dark:text-white">{trader.fullName}</strong> to manual check. This description will help other team members review the profile.
        </p>

        <div className="flex flex-col gap-2.5">
          <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Reason for Manual Check
          </label>
          <textarea
            rows={4}
            value={manualReason}
            onChange={(e) => setManualReason(e.target.value)}
            placeholder="e.g. Needs manual verification of identity documents, flagged for review..."
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-205 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/25 text-gray-800 dark:text-white placeholder-gray-450 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
          />
          <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-1">
            This reason will be shared with the trader to help them rectify and re-apply.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4.5 mt-4 border-t border-gray-50 dark:border-gray-850">
          <button
            onClick={() => setIsManualModalOpen(false)}
            disabled={isVerifying}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/5 border border-gray-200 dark:border-gray-755 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleManualReview}
            disabled={isVerifying}
            className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:brightness-105 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {isVerifying && (
              <svg className="animate-spin -ml-1 mr-1 h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            Submit Manual Check
          </button>
        </div>
      </Modal>

      {/* Floating Toast Notification Container */}
      <div className="fixed top-6 right-6 z-[999999] flex flex-col gap-2.5 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              flex items-center gap-3.5 px-4.5 py-3 rounded-2xl shadow-xl border border-gray-200/90 dark:border-gray-800/90
              max-w-sm w-full pointer-events-auto transition-all duration-300 transform translate-y-0
              ${toastStyles[toast.type]}
            `}
          >
            {toastIcons[toast.type]}
            <span className="text-xs font-bold flex-1 leading-snug">{toast.message}</span>
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
