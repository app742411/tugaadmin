"use client";

import React, { useState } from "react";
import Link from "next/link";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Badge from "@/components/ui/badge/Badge";
import { useGetReportDetail, useUpdateReportStatus } from "@/hooks/useReports";

interface ReportDetailPageClientProps {
  id: string;
}

export default function ReportDetailPageClient({ id }: ReportDetailPageClientProps) {
  const { data: report, isLoading, error, refetch } = useGetReportDetail(id);
  const updateStatusMutation = useUpdateReportStatus();

  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

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

  const getStatusColor = (statusVal: string): "success" | "warning" | "error" | "info" | "light" => {
    switch (statusVal) {
      case "RESOLVED":
        return "success";
      case "PENDING":
        return "warning";
      case "REJECTED":
        return "error";
      case "REVIEWED":
        return "info";
      default:
        return "light";
    }
  };

  const getTypeColor = (typeVal: string): "success" | "warning" | "error" | "info" | "light" => {
    switch (typeVal) {
      case "USER":
        return "info";
      case "REVIEW":
        return "warning";
      case "JOB":
        return "success";
      default:
        return "light";
    }
  };

  const getReasonColor = (reasonVal: string): "success" | "warning" | "error" | "info" | "light" => {
    switch (reasonVal) {
      case "SPAM":
        return "warning";
      case "ABUSE":
        return "error";
      default:
        return "light";
    }
  };

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

  const handleUpdateStatus = async (newStatus: "REVIEWED" | "RESOLVED" | "REJECTED") => {
    setActionError(null);
    setActionSuccess(null);
    try {
      await updateStatusMutation.mutateAsync({ reportId: id, status: newStatus });
      setActionSuccess(`Report status updated to ${newStatus} successfully!`);
      setTimeout(() => {
        refetch();
      }, 1200);
    } catch (err: any) {
      setActionError(err.message || "Failed to update report status.");
    }
  };

  if (isLoading) {
    return (
      <div className="w-full pb-8">
        <div className="flex items-center gap-2 mb-6">
          <Link
            href="/reports"
            className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            &larr; Back to Reports
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">Loading report details...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="w-full pb-8">
        <div className="flex items-center gap-2 mb-6">
          <Link
            href="/reports"
            className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            &larr; Back to Reports
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-8 text-center">
          <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-full mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h4 className="text-base font-bold text-gray-900 dark:text-white mb-2">Failed to load report</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
            {error || "We could not fetch the details for this report. Please try again."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-12">
      {/* Header & Back link */}
      <div className="flex flex-col gap-2 mb-6">
        <div>
          <Link
            href="/reports"
            className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            &larr; Back to Reports
          </Link>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <PageBreadcrumb pageTitle="Report Details" />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 ml-0.5">
              Inspect spam/abuse flag reasons, targeted content details, and processed state logs.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge color={getStatusColor(report.status)} size="md">
              {report.status}
            </Badge>
            <Badge color={getTypeColor(report.reportType)} size="md" variant="light">
              {report.reportType} Type
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns: Report info & Action panel */}
        <div className="lg:col-span-2 space-y-6">

          {/* Card: Report Overview */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-6 shadow-xs space-y-6">
            <div className="flex items-start justify-between border-b border-gray-100 dark:border-gray-850 pb-4">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Reason Flag</span>
                <span className="text-sm font-bold text-gray-850 dark:text-gray-200 mt-1 block">
                  {report.reason}
                </span>
                <span className="text-xs font-mono text-gray-400 mt-2 block select-all">
                  Report ID: {report.id}
                </span>
              </div>
              <Badge color={getReasonColor(report.reason)} size="md">
                {report.reason}
              </Badge>
            </div>

            {/* Custom Comment Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Reporter Comment / Custom Reason</h3>
              <p className="text-xs text-gray-650 dark:text-gray-300 leading-relaxed bg-gray-55/10 dark:bg-gray-950/20 p-4 rounded-xl border border-gray-100 dark:border-gray-850">
                {report.customReason || "No additional custom comment was provided."}
              </p>
            </div>

            {/* Dates info */}
            <div className="grid grid-cols-2 gap-6 pt-2 border-t border-gray-50 dark:border-gray-850/50">
              <div>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Created At</span>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-305 mt-1 block">
                  {formatDate(report.createdAt)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Last Updated</span>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-305 mt-1 block">
                  {formatDate(report.updatedAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Card: Action Controls */}
          {report.status !== "RESOLVED" && (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-gray-450 uppercase tracking-wider border-b border-gray-100 dark:border-gray-855 pb-2">
                Report Administrative Resolution Actions
              </h3>

              {actionError && (
                <div className="p-2.5 bg-rose-50 border border-rose-150 text-rose-605 rounded-xl text-xs font-semibold">
                  {actionError}
                </div>
              )}
              {actionSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-150 text-emerald-650 rounded-xl text-xs font-semibold">
                  {actionSuccess}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => handleUpdateStatus("RESOLVED")}
                  disabled={updateStatusMutation.isPending}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-xs"
                >
                  Mark as Resolved
                </button>
                <button
                  onClick={() => handleUpdateStatus("REVIEWED")}
                  disabled={updateStatusMutation.isPending}
                  className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs transition shadow-xs"
                >
                  Mark as Reviewed
                </button>
                <button
                  onClick={() => handleUpdateStatus("REJECTED")}
                  disabled={updateStatusMutation.isPending}
                  className="w-full py-2.5 bg-rose-50 hover:bg-rose-105 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 font-bold rounded-xl text-xs transition border border-rose-100 dark:border-rose-900/30"
                >
                  Reject Flag
                </button>
              </div>
            </div>
          )}

          {/* Resolution logs metadata */}
          {report.status !== "PENDING" && (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-gray-450 uppercase tracking-wider border-b border-gray-100 dark:border-gray-855 pb-2">
                Resolution History Logs
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-gray-50/50 dark:border-gray-850/50">
                  <span className="text-gray-400">Processed Status</span>
                  <Badge size="xs" color={getStatusColor(report.status)} className="font-bold">
                    {report.status}
                  </Badge>
                </div>
                {report.reviewedBy && (
                  <>
                    <div className="flex items-center justify-between py-1 border-b border-gray-50/50 dark:border-gray-850/50">
                      <span className="text-gray-400">Reviewed By Administrator</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-250">
                        {report.reviewedBy.fullName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-gray-50/50 dark:border-gray-850/50">
                      <span className="text-gray-400 font-mono">Admin Email</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-250 select-all font-mono">
                        {report.reviewedBy.email}
                      </span>
                    </div>
                  </>
                )}
                <div className="flex items-center justify-between py-1">
                  <span className="text-gray-400">Resolution Timestamp</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-250">
                    {formatDate(report.reviewedAt || report.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Profile details */}
        <div className="space-y-6">

          {/* Card: Reporter Profile */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-850 pb-2">
              Reporter Details
            </h3>
            {report.reporter ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center bg-gray-100 dark:bg-gray-805">
                    <span className={`h-full w-full flex items-center justify-center text-xs font-bold ${getAvatarBg(report.reporter.fullName)}`}>
                      {getInitials(report.reporter.fullName)}
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                      {report.reporter.fullName}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      Reporter Account
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5 pt-2 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-gray-50/50 dark:border-gray-850/50">
                    <span className="text-gray-400">Email Address</span>
                    <span className="font-semibold text-gray-805 dark:text-gray-250 select-all truncate max-w-[170px]">
                      {report.reporter.email}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-gray-400">Account ID</span>
                    <span className="font-mono text-[10px] text-gray-450 select-all">
                      {report.reporterId}
                    </span>
                  </div>
                </div>

                {/* Optional link to view reporter profile details (admin, customer, trader) */}
                <Link
                  href={`/customers/${report.reporterId}`}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                >
                  View Client Profile
                </Link>
              </div>
            ) : (
              <p className="text-xs text-gray-455">Reporter details unavailable.</p>
            )}
          </div>

          {/* Card: Targeted entity details */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-850 pb-2">
              Targeted Account Details
            </h3>
            {report.targetData ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center bg-gray-100 dark:bg-gray-805">
                    {report.targetData.profileImage ? (
                      <img
                        src={report.targetData.profileImage.startsWith("http") ? report.targetData.profileImage : `${getBaseUrl()}${report.targetData.profileImage}`}
                        alt={report.targetData.fullName}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <span className={`h-full w-full flex items-center justify-center text-xs font-bold ${getAvatarBg(report.targetData.fullName)}`}>
                        {getInitials(report.targetData.fullName)}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                      {report.targetData.fullName}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      Targeted Entity Profile
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5 pt-2 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-gray-50/50 dark:border-gray-850/50">
                    <span className="text-gray-400">Email Address</span>
                    <span className="font-semibold text-gray-805 dark:text-gray-250 select-all truncate max-w-[170px]">
                      {report.targetData.email}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-gray-50/50 dark:border-gray-850/50">
                    <span className="text-gray-400">System Role</span>
                    <Badge size="xs" color="light" className="font-bold">
                      {report.targetData.role}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-gray-50/50 dark:border-gray-850/50">
                    <span className="text-gray-400">Account Status</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-250">
                      {report.targetData.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-gray-400">Target ID</span>
                    <span className="font-mono text-[10px] text-gray-450 select-all max-w-[160px] truncate">
                      {report.targetId}
                    </span>
                  </div>
                </div>

                {/* Redirect based on targeted role */}
                <Link
                  href={report.targetData.role === "TRADER" ? `/traders/${report.targetId}` : `/customers/${report.targetId}`}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-705 dark:text-gray-305 rounded-xl hover:bg-gray-55 dark:hover:bg-white/[0.02] transition-colors"
                >
                  View Targeted Profile
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-gray-50 dark:bg-gray-950/20 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-center">
                  <span className="text-[11px] text-gray-400 block">Target details unavailable or targeted content loaded dynamically.</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-gray-400">Target ID</span>
                  <span className="font-mono text-[10px] text-gray-450 select-all max-w-[160px] truncate">
                    {report.targetId}
                  </span>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

// Helper to resolve baseline processes URL
function getBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL || "";
}
