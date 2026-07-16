"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Badge from "@/components/ui/badge/Badge";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/hooks/useToast";
import {
  useGetJobDetail,
  useGetSuggestedTraders,
  useAssignManualReviewTraders,
  usePauseJob,
  useResumeJob,
  useRestartAutoJob,
  useIncreaseRadius,
  useCloseJob
} from "@/hooks/useJobs";

interface JobDetailPageClientProps {
  id: string;
}

export default function JobDetailPageClient({ id }: JobDetailPageClientProps) {
  const { data: job, isLoading, error, refetch } = useGetJobDetail(id);
  const { toasts, showToast, removeToast } = useToast();

  const [activeTab, setActiveTab] = useState<"info" | "matches" | "escalations">("info");
  const [traderSearch, setTraderSearch] = useState("");
  const [selectedTraderIds, setSelectedTraderIds] = useState<string[]>([]);
  const assignMutation = useAssignManualReviewTraders();

  const pauseMutation = usePauseJob();
  const resumeMutation = useResumeJob();
  const restartAutoMutation = useRestartAutoJob();
  const increaseRadiusMutation = useIncreaseRadius();
  const closeMutation = useCloseJob();

  const [radiusInput, setRadiusInput] = useState<string>("10");
  const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false);

  const isVerifying = pauseMutation.isPending || resumeMutation.isPending || restartAutoMutation.isPending || increaseRadiusMutation.isPending || closeMutation.isPending;

  const handlePause = async () => {
    try {
      await pauseMutation.mutateAsync(id);
      showToast("success", "Job distribution paused successfully!");
      refetch();
    } catch (err: any) {
      showToast("error", err.message || "Failed to pause job matching.");
    }
  };

  const handleResume = async () => {
    try {
      await resumeMutation.mutateAsync(id);
      showToast("success", "Job distribution resumed successfully!");
      refetch();
    } catch (err: any) {
      showToast("error", err.message || "Failed to resume job matching.");
    }
  };

  const handleRestartAuto = async () => {
    try {
      await restartAutoMutation.mutateAsync(id);
      showToast("success", "Auto matching restarted successfully!");
      refetch();
    } catch (err: any) {
      showToast("error", err.message || "Failed to restart auto matching.");
    }
  };

  const handleIncreaseRadius = async (e: React.FormEvent) => {
    e.preventDefault();
    const radiusKm = parseInt(radiusInput, 10);
    if (isNaN(radiusKm) || radiusKm <= 0) {
      showToast("warning", "Please enter a valid radius in kilometers.");
      return;
    }
    try {
      await increaseRadiusMutation.mutateAsync({ jobId: id, radiusKm });
      showToast("success", `Search radius increased by ${radiusKm} km successfully!`);
      refetch();
    } catch (err: any) {
      showToast("error", err.message || "Failed to increase search radius.");
    }
  };

  const handleClose = async () => {
    setIsCloseConfirmOpen(false);
    try {
      await closeMutation.mutateAsync(id);
      showToast("success", "Job closed successfully.");
      refetch();
    } catch (err: any) {
      showToast("error", err.message || "Failed to close job posting.");
    }
  };

  // Reset states when job changes
  useEffect(() => {
    setTraderSearch("");
    setSelectedTraderIds([]);
    setRadiusInput("10");
  }, [id]);

  // Fetch suggested traders for selection
  const { data: suggestedTraders, isLoading: isLoadingSuggested } = useGetSuggestedTraders(
    id,
    { limit: 50 }
  );

  const filteredSuggestedTraders = useMemo(() => {
    if (!suggestedTraders) return [];
    if (!traderSearch) return suggestedTraders;
    const term = traderSearch.toLowerCase();
    return suggestedTraders.filter(
      (t) =>
        t.fullName.toLowerCase().includes(term) ||
        t.email.toLowerCase().includes(term)
    );
  }, [suggestedTraders, traderSearch]);

  const handleAssignTraders = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    if (selectedTraderIds.length === 0) {
      showToast("warning", "Please select at least one trader.");
      return;
    }

    try {
      await assignMutation.mutateAsync({
        jobId: job.id,
        traderIds: selectedTraderIds,
      });
      showToast("success", "Job distributed to traders successfully!");
      setSelectedTraderIds([]);
      setTraderSearch("");
      setTimeout(() => {
        refetch();
      }, 1000);
    } catch (err: any) {
      showToast("error", err.message || "Failed to distribute job.");
    }
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
      case "POSTED":
        return "info";
      case "IN_PROGRESS":
        return "warning";
      case "COMPLETED":
        return "success";
      case "CANCELLED":
        return "error";
      default:
        return "light";
    }
  };

  const getDistributionColor = (distVal: string): "success" | "warning" | "error" | "info" | "light" => {
    switch (distVal) {
      case "AUTO":
        return "success";
      case "MANUAL_REVIEW":
        return "warning";
      default:
        return "light";
    }
  };

  const getMatchStatusColor = (statusVal: string): "success" | "warning" | "error" | "info" | "light" => {
    switch (statusVal) {
      case "ACCEPTED":
      case "RESPONDED":
        return "success";
      case "SENT":
        return "info";
      case "VIEWED":
        return "warning";
      case "REJECTED":
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

  const formatBudgetRange = (budgetVal: string | undefined) => {
    if (!budgetVal) return "N/A";
    const clean = budgetVal.replace(/_/g, " ").toLowerCase();
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  };

  const getBaseUrl = () => {
    return process.env.NEXT_PUBLIC_API_URL || "";
  };

  if (isLoading) {
    return (
      <div className="w-full pb-8">
        <div className="flex items-center gap-2 mb-6">
          <Link
            href="/jobs"
            className="inline-flex items-center text-xs font-semibold text-gray-550 hover:text-gray-700 dark:text-gray-405 dark:hover:text-gray-205 transition-colors"
          >
            &larr; Back to Jobs
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="w-full pb-8">
        <div className="flex items-center gap-2 mb-6">
          <Link
            href="/jobs"
            className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            &larr; Back to Jobs
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-8 text-center">
          <div className="p-3 bg-red-50 dark:bg-red-955/20 text-red-500 rounded-full mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h4 className="text-base font-bold text-gray-900 dark:text-white mb-2">Failed to load job</h4>
          <p className="text-sm text-gray-550 dark:text-gray-400 max-w-sm mb-6">
            {error || "We could not fetch the details for this job. Please try again."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-12">
      {/* Premium Glassmorphic Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-200/80 dark:border-gray-802/80 bg-white/70 dark:bg-gray-900/60 backdrop-blur-md p-6 shadow-sm mb-6">
        <div className="absolute top-0 right-0 w-80 h-32 bg-gradient-to-l from-brand-500/5 to-transparent dark:from-brand-400/5 rounded-full blur-2xl pointer-events-none" />

        {/* Navigation Action Links */}
        <div className="flex items-center gap-3.5 mb-4 border-b border-gray-100/70 dark:border-gray-800/40 pb-3">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-gray-650 dark:hover:text-white transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Jobs
          </Link>
          {job.distributionStatus === "MANUAL_REVIEW" && (
            <>
              <span className="text-gray-200 dark:text-gray-800 font-light select-none">|</span>
              <Link
                href="/jobs/manual-review"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-500 hover:text-brand-600 transition-colors"
              >
                Go to Manual Review
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </>
          )}
        </div>

        {/* Identity Details Banner */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <PageBreadcrumb pageTitle="Job Specification Detail" />
              {job.emergency && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[9px] font-bold bg-rose-50 text-rose-600 dark:bg-rose-955/25 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 font-mono uppercase tracking-wider animate-pulse">
                  Emergency
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">
              Job ID: <span className="select-all text-gray-550 dark:text-gray-300 font-semibold">{job.id}</span>
            </p>
          </div>

          {/* Status Badges */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge color={getStatusColor(job.status)} size="md">
              {job.status}
            </Badge>
            <Badge color={getDistributionColor(job.distributionStatus)} size="md" variant="light">
              {job.distributionStatus} Matching
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Tabbed View (Job Info, Matches, Escalations) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-802/80 rounded-3xl shadow-sm overflow-hidden flex flex-col">

            {/* Pill-Based Tab Selectors */}
            <div className="px-6 pt-5 pb-0 border-b border-gray-100 dark:border-gray-800 bg-gray-50/20 dark:bg-gray-950/10">
              <div className="flex border-b border-gray-150 dark:border-gray-800 gap-1.5 pb-px">
                <button
                  onClick={() => setActiveTab("info")}
                  className={`px-4.5 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${activeTab === "info"
                    ? "border-brand-500 text-gray-900 dark:text-white"
                    : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-white"
                    }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Job Specification
                </button>
                <button
                  onClick={() => setActiveTab("matches")}
                  className={`px-4.5 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${activeTab === "matches"
                    ? "border-brand-500 text-gray-900 dark:text-white"
                    : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-white"
                    }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Matched History ({job.traderMatches?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab("escalations")}
                  className={`px-4.5 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${activeTab === "escalations"
                    ? "border-brand-500 text-gray-900 dark:text-white"
                    : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-white"
                    }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Escalation Logs ({job.escalationLogs?.length || 0})
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6">

              {/* Tab 1: Job Info */}
              {activeTab === "info" && (
                <div className="space-y-6 animate-fade-in">

                  {/* Job Overview */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider font-mono">Job Description</h3>
                    <div className="bg-gray-50/50 dark:bg-gray-950/20 p-5 rounded-2xl border border-gray-100 dark:border-gray-805/75 shadow-3xs">
                      <h4 className="text-sm font-bold text-gray-850 dark:text-white mb-2 leading-relaxed">{job.title}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-350 leading-relaxed">
                        {job.description}
                      </p>
                    </div>
                  </div>

                  {/* Specification grid parameters */}
                  <div className="pt-2">
                    <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider font-mono mb-3">Specification parameters</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-6 p-5 bg-gray-50/20 dark:bg-gray-950/5 rounded-2xl border border-gray-100/50 dark:border-gray-850/30">
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Trades Category</span>
                        <span className="text-xs font-bold text-gray-850 dark:text-gray-250 mt-1 block">
                          {job.category?.name || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Sub-Category</span>
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-1 block">
                          {job.subCategory?.name || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Skill Service</span>
                        <span className="text-xs font-semibold text-gray-805 dark:text-gray-250 mt-1 block">
                          {job.skillService?.name || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Budget Range</span>
                        <span className="text-xs font-bold text-brand-500 mt-1 block">
                          {formatBudgetRange(job.budgetRange)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Timescale</span>
                        <span className="text-xs font-semibold text-gray-850 dark:text-gray-250 mt-1 block">
                          {job.timescale}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Current Search Scope</span>
                        <span className="text-xs font-bold text-gray-850 dark:text-gray-250 mt-1 block">
                          {job.currentRadiusKm} km Radius
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Postcode / GPS</span>
                        {job.latitude && job.longitude ? (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${job.latitude},${job.longitude}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-semibold text-brand-500 hover:underline flex items-center gap-1 mt-1"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {job.postcode || `${parseFloat(job.latitude).toFixed(4)}, ${parseFloat(job.longitude).toFixed(4)}`}
                          </a>
                        ) : (
                          <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-1 block">N/A</span>
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Posted Date</span>
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-1 block">
                          {formatDate(job.createdAt)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Last Updated</span>
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-1 block">
                          {formatDate(job.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Attachments Section */}
                  {job.attachments && job.attachments.length > 0 && (
                    <div className="pt-2">
                      <h3 className="text-xs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider font-mono mb-3">Job Attachments ({job.attachments.length})</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {job.attachments.map((attach) => {
                          const fileUrl = attach.file.startsWith("http") ? attach.file : `${getBaseUrl()}/${attach.file}`;
                          return (
                            <div
                              key={attach.id}
                              className="border border-gray-150 dark:border-gray-800 rounded-2xl p-3 flex flex-col justify-between bg-white dark:bg-gray-955/15 text-center group hover:border-brand-500 transition-colors shadow-3xs"
                            >
                              <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-2 bg-gray-50 dark:bg-gray-950/30 flex items-center justify-center border border-gray-100 dark:border-gray-800">
                                <img
                                  src={fileUrl}
                                  alt="Job Attachment"
                                  className="max-h-full max-w-full object-contain"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = "none";
                                  }}
                                />
                              </div>
                              <div className="w-full flex items-center justify-between gap-2 px-1">
                                <span className="text-[10px] text-gray-400 font-mono truncate">
                                  {attach.file.split("/").pop()}
                                </span>
                                <a
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[10px] font-bold text-brand-500 hover:underline shrink-0"
                                >
                                  View File
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Matched History */}
              {activeTab === "matches" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider font-mono">Matched History</h3>
                      <p className="text-[10px] text-gray-400 dark:text-gray-550 mt-0.5">Traders targeted within rule parameters.</p>
                    </div>
                    <Badge color="light" size="sm">
                      Total: {job.traderMatches?.length || 0} matches
                    </Badge>
                  </div>

                  {!job.traderMatches || job.traderMatches.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50/50 dark:bg-gray-950/20 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                      <p className="text-xs text-gray-400 dark:text-gray-500 italic">No trader matches recorded yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-805/70 shadow-3xs">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-gray-50/50 dark:bg-gray-950/20 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-855 select-none">
                              <th className="px-5 py-3">Trader</th>
                              <th className="px-5 py-3">Matching Radius</th>
                              <th className="px-5 py-3">Distance</th>
                              <th className="px-5 py-3">Score</th>
                              <th className="px-5 py-3 text-center">Status</th>
                              <th className="px-5 py-3">Notified At</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-gray-850">
                            {job.traderMatches.map((match) => (
                              <tr key={match.id} className="hover:bg-gray-50/40 dark:hover:bg-white/[0.01] transition-colors">
                                <td className="px-5 py-3.5">
                                  <div className="flex items-center gap-3">
                                    <div className="h-8.5 w-8.5 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center bg-gray-100 dark:bg-gray-805">
                                      {match.trader.profileImage ? (
                                        <img
                                          src={match.trader.profileImage.startsWith("http") ? match.trader.profileImage : `${getBaseUrl()}${match.trader.profileImage}`}
                                          alt={match.trader.fullName}
                                          className="h-full w-full object-cover"
                                          onError={(e) => {
                                            (e.target as HTMLElement).style.display = "none";
                                          }}
                                        />
                                      ) : (
                                        <span className={`h-full w-full flex items-center justify-center text-xs font-bold ${getAvatarBg(match.trader.fullName)}`}>
                                          {getInitials(match.trader.fullName)}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                      <Link
                                        href={`/traders/${match.traderId}`}
                                        className="text-xs font-bold text-brand-500 hover:underline truncate"
                                      >
                                        {match.trader.fullName}
                                      </Link>
                                      <span className="text-[10px] text-gray-400 dark:text-gray-550 truncate max-w-[140px]">
                                        {match.trader.email}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-5 py-3.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                                  {match.radiusKm} km
                                </td>
                                <td className="px-5 py-3.5 text-xs font-medium text-gray-700 dark:text-gray-300 font-mono">
                                  {match.distanceKm ? `${match.distanceKm.toFixed(2)} km` : "N/A"}
                                </td>
                                <td className="px-5 py-3.5 text-xs font-bold text-gray-800 dark:text-gray-250 font-mono">
                                  {match.score ? match.score.toFixed(3) : "0.000"}
                                </td>
                                <td className="px-5 py-3.5 text-center">
                                  <Badge size="xs" color={getMatchStatusColor(match.status)}>
                                    {match.status}
                                  </Badge>
                                </td>
                                <td className="px-5 py-3.5 text-[10px] font-mono text-gray-450 dark:text-gray-400">
                                  {formatDate(match.sentAt || match.createdAt)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Escalation Logs */}
              {activeTab === "escalations" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider font-mono">Escalation Logs</h3>
                      <p className="text-[10px] text-gray-400 dark:text-gray-550 mt-0.5">Radius scope automated scaling history.</p>
                    </div>
                    <Badge color="light" size="sm">
                      Total: {job.escalationLogs?.length || 0} scaling steps
                    </Badge>
                  </div>

                  {!job.escalationLogs || job.escalationLogs.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50/50 dark:bg-gray-950/20 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                      <p className="text-xs text-gray-400 dark:text-gray-500 italic">No scope escalations logged yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-805/70 shadow-3xs">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-gray-50/50 dark:bg-gray-950/20 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-855 select-none">
                              <th className="px-6 py-3">Previous radius scope</th>
                              <th className="px-6 py-3">Expanded radius scope</th>
                              <th className="px-6 py-3">Traders Notified</th>
                              <th className="px-6 py-3">Escalated Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-gray-850">
                            {job.escalationLogs.map((log) => (
                              <tr key={log.id} className="hover:bg-gray-50/40 dark:hover:bg-white/[0.01] transition-colors">
                                <td className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400">
                                  {log.previousRadius} km
                                </td>
                                <td className="px-6 py-4 text-xs font-bold text-brand-500">
                                  {log.newRadius} km
                                </td>
                                <td className="px-6 py-4 text-xs font-medium text-gray-700 dark:text-gray-300">
                                  {log.tradersSent}
                                </td>
                                <td className="px-6 py-4 text-[10px] font-mono text-gray-450 dark:text-gray-400">
                                  {formatDate(log.createdAt)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Administration & Details */}
        <div className="lg:col-span-4 space-y-6">

          {/* Job Administration Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-802/80 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 pb-2.5 font-mono">
              Job Administration
            </h3>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50/80 dark:border-gray-850/40">
                <span className="text-gray-450">Status</span>
                <span className="font-bold text-gray-855 dark:text-gray-200">
                  {job.status === "POSTED" ? "Open for matching" : job.status}
                </span>
              </div>

              {/* Pause / Resume matching */}
              {job.status === "POSTED" && job.distributionStatus !== "PAUSED" && (
                <button
                  onClick={handlePause}
                  disabled={isVerifying}
                  className="w-full py-2 bg-amber-50 hover:bg-amber-100/70 dark:bg-amber-955/20 dark:hover:bg-amber-955/35 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-xl transition cursor-pointer border border-amber-100/20 disabled:opacity-50"
                >
                  Pause Matching Scope
                </button>
              )}

              {job.distributionStatus === "PAUSED" && (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleResume}
                    disabled={isVerifying}
                    className="w-full py-2 bg-emerald-50 hover:bg-emerald-100/75 dark:bg-emerald-955/20 dark:hover:bg-emerald-955/35 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-xl transition cursor-pointer border border-emerald-100/20 disabled:opacity-50"
                  >
                    Resume Matching Scope
                  </button>
                  <button
                    onClick={handleRestartAuto}
                    disabled={isVerifying}
                    className="w-full py-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl transition border border-gray-200/80 dark:border-gray-755 cursor-pointer disabled:opacity-50"
                  >
                    Restart Auto Matching
                  </button>
                </div>
              )}

              {/* Increase radius scope */}
              {job.status === "POSTED" && (
                <form onSubmit={handleIncreaseRadius} className="space-y-2 pt-2 border-t border-gray-50 dark:border-gray-850/40">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-400 dark:text-gray-550 font-bold uppercase tracking-wider font-mono">Expand Search Radius</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          placeholder="Km to add..."
                          value={radiusInput}
                          onChange={(e) => setRadiusInput(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-950/25 text-gray-805 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition"
                        />
                        <span className="absolute inset-y-0 right-3.5 flex items-center text-[10px] text-gray-400 font-bold">km</span>
                      </div>
                      <button
                        type="submit"
                        disabled={isVerifying}
                        className="px-3.5 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shadow-3xs cursor-pointer"
                      >
                        Expand
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Close Job posting */}
              {job.status !== "COMPLETED" && job.status !== "CANCELLED" && (
                <button
                  onClick={() => setIsCloseConfirmOpen(true)}
                  disabled={isVerifying}
                  className="w-full py-2 mt-2 bg-rose-50 hover:bg-rose-100/70 dark:bg-rose-955/20 dark:hover:bg-rose-955/35 text-rose-700 dark:text-rose-455 text-xs font-bold rounded-xl transition border border-rose-100/20 cursor-pointer disabled:opacity-50"
                >
                  Close Job Posting
                </button>
              )}
            </div>
          </div>

          {/* Customer Details Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-820/80 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 pb-2.5 font-mono">
              Customer Details
            </h3>
            {job.customer ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-gray-50/20 dark:bg-gray-950/5 p-3 rounded-2xl border border-gray-100/50 dark:border-gray-805/30">
                  <div className="h-11 w-11 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center bg-gray-100 dark:bg-gray-805">
                    {job.customer.profileImage ? (
                      <img
                        src={job.customer.profileImage.startsWith("http") ? job.customer.profileImage : `${getBaseUrl()}${job.customer.profileImage}`}
                        alt={job.customer.fullName}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <span className={`h-full w-full flex items-center justify-center text-sm font-bold ${getAvatarBg(job.customer.fullName)}`}>
                        {getInitials(job.customer.fullName)}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                      {job.customer.fullName}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-0.5">
                      Client Account
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-1 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-gray-55/30 dark:border-gray-850/40">
                    <span className="text-gray-400">Email</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-250 select-all truncate max-w-[160px]">
                      {job.customer.email}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-gray-55/30 dark:border-gray-850/40">
                    <span className="text-gray-400">Phone</span>
                    <span className="font-semibold text-gray-805 dark:text-gray-250">
                      {job.customer.phone || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-gray-400">Joined</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-250">
                      {formatDate(job.customer.createdAt).split(",")[0]}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/customers/${job.customerId}`}
                  className="w-full mt-2 inline-flex items-center justify-center px-4 py-2 border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer shadow-3xs"
                >
                  View Customer Profile
                </Link>
              </div>
            ) : (
              <p className="text-xs text-gray-455 dark:text-gray-500">Customer details unavailable.</p>
            )}
          </div>

          {/* Assigned / Manual Distribution Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-820/80 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 pb-2.5 font-mono">
              Assigned Trader
            </h3>
            {job.selectedTrader ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-gray-50/20 dark:bg-gray-950/5 p-3 rounded-2xl border border-gray-100/50 dark:border-gray-805/30">
                  <div className="h-11 w-11 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center bg-gray-100 dark:bg-gray-805">
                    {job.selectedTrader.profileImage ? (
                      <img
                        src={job.selectedTrader.profileImage.startsWith("http") ? job.selectedTrader.profileImage : `${getBaseUrl()}${job.selectedTrader.profileImage}`}
                        alt={job.selectedTrader.fullName}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <span className={`h-full w-full flex items-center justify-center text-sm font-bold ${getAvatarBg(job.selectedTrader.fullName)}`}>
                        {getInitials(job.selectedTrader.fullName)}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                      {job.selectedTrader.fullName}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-0.5">
                      Assigned Trader
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-1 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-gray-55/30 dark:border-gray-850/40">
                    <span className="text-gray-400">Email</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-250 select-all truncate max-w-[160px]">
                      {job.selectedTrader.email}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-gray-400">Phone</span>
                    <span className="font-semibold text-gray-805 dark:text-gray-250">
                      {job.selectedTrader.phone || "N/A"}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/traders/${job.selectedTraderId}`}
                  className="w-full mt-2 inline-flex items-center justify-center px-4 py-2 border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer shadow-3xs"
                >
                  View Trader Profile
                </Link>
              </div>
            ) : job.distributionStatus === "MANUAL_REVIEW" ? (
              <div className="space-y-3.5 pt-1">
                <div className="flex flex-col">
                  <h4 className="text-xs font-bold text-gray-850 dark:text-white uppercase tracking-wider font-mono">Distribute to Traders</h4>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 leading-relaxed">
                    Search and select active traders to manually distribute this job.
                  </span>
                </div>

                <form onSubmit={handleAssignTraders} className="space-y-3.5">
                  {/* Search box */}
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      placeholder="Search active traders..."
                      value={traderSearch}
                      onChange={(e) => setTraderSearch(e.target.value)}
                      className="w-full pl-8.5 pr-3 py-2 text-xs border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-955/25 text-gray-850 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition"
                    />
                  </div>

                  {/* Checklist */}
                  <div className="max-h-48 overflow-y-auto border border-gray-150 dark:border-gray-800 rounded-2xl divide-y divide-gray-100 dark:divide-gray-850 bg-white dark:bg-gray-950/10 shadow-3xs">
                    {isLoadingSuggested ? (
                      <div className="p-3 text-center text-xs text-gray-400">Loading suggested traders...</div>
                    ) : filteredSuggestedTraders.length === 0 ? (
                      <div className="p-3 text-center text-xs text-gray-400">No suggested traders found.</div>
                    ) : (
                      filteredSuggestedTraders.map((trader) => (
                        <label
                          key={trader.traderId}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50/55 dark:hover:bg-gray-800/10 cursor-pointer text-xs text-gray-855 dark:text-gray-250 select-none transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedTraderIds.includes(trader.traderId)}
                            onChange={() => {
                              setSelectedTraderIds((prev) =>
                                prev.includes(trader.traderId)
                                  ? prev.filter((id) => id !== trader.traderId)
                                  : [...prev, trader.traderId]
                              );
                            }}
                            className="rounded border-gray-255 text-brand-500 focus:ring-brand-500 h-3.5 w-3.5 cursor-pointer"
                          />
                          <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold truncate text-gray-900 dark:text-white">{trader.fullName}</span>
                              <span className="text-[9px] text-gray-400 dark:text-gray-550 truncate">
                                {trader.email}
                              </span>
                            </div>
                            <div className="flex flex-col items-end shrink-0 pl-2">
                              <span className="text-[10px] font-bold text-brand-500">
                                Score: {trader.finalScore.toFixed(3)}
                              </span>
                              <span className="text-[9px] text-gray-400 dark:text-gray-500 font-mono">
                                {trader.distanceKm.toFixed(1)} km
                              </span>
                            </div>
                          </div>
                        </label>
                      ))
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={assignMutation.isPending || selectedTraderIds.length === 0}
                    className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-3xs"
                  >
                    {assignMutation.isPending
                      ? "Assigning..."
                      : selectedTraderIds.length > 0
                        ? `Assign & Distribute (${selectedTraderIds.length})`
                        : "Assign & Distribute"}
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-4 bg-gray-50/50 dark:bg-gray-950/20 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl text-center">
                <span className="text-[11px] text-gray-450 dark:text-gray-550 block italic">No trader assigned to this job yet.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal for closing job */}
      <Modal isOpen={isCloseConfirmOpen} onClose={() => setIsCloseConfirmOpen(false)} className="max-w-md p-6" showCloseButton={false}>
        <div className="flex flex-col items-center text-center space-y-4 pt-2">
          <div className="h-12 w-12 rounded-full bg-rose-50 dark:bg-rose-955/20 text-rose-500 flex items-center justify-center border border-rose-100 dark:border-rose-900/30">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="space-y-1.5">
            <h4 className="text-base font-bold text-gray-900 dark:text-white">Close Job Posting</h4>
            <p className="text-xs text-gray-450 dark:text-gray-400 max-w-xs leading-relaxed">
              Are you sure you want to close this job posting? This action is permanent and cannot be undone. All matching processes will cease.
            </p>
          </div>
          <div className="flex w-full gap-3 pt-2">
            <button
              onClick={() => setIsCloseConfirmOpen(false)}
              className="flex-1 py-2 px-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl border border-gray-200/80 dark:border-gray-700 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleClose}
              className="flex-1 py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
            >
              Confirm Close
            </button>
          </div>
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
