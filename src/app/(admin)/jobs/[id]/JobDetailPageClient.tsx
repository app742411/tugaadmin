"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Badge from "@/components/ui/badge/Badge";
import { Modal } from "@/components/ui/modal";
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

  const [traderSearch, setTraderSearch] = useState("");
  const [selectedTraderIds, setSelectedTraderIds] = useState<string[]>([]);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);
  const assignMutation = useAssignManualReviewTraders();

  const pauseMutation = usePauseJob();
  const resumeMutation = useResumeJob();
  const restartAutoMutation = useRestartAutoJob();
  const increaseRadiusMutation = useIncreaseRadius();
  const closeMutation = useCloseJob();

  const [radiusInput, setRadiusInput] = useState<string>("10");
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false);

  const handlePause = async () => {
    setActionError(null);
    setActionSuccess(null);
    try {
      await pauseMutation.mutateAsync(id);
      setActionSuccess("Job distribution paused successfully!");
    } catch (err: any) {
      setActionError(err.message || "Failed to pause job matching.");
    }
  };

  const handleResume = async () => {
    setActionError(null);
    setActionSuccess(null);
    try {
      await resumeMutation.mutateAsync(id);
      setActionSuccess("Job distribution resumed successfully!");
    } catch (err: any) {
      setActionError(err.message || "Failed to resume job matching.");
    }
  };

  const handleRestartAuto = async () => {
    setActionError(null);
    setActionSuccess(null);
    try {
      await restartAutoMutation.mutateAsync(id);
      setActionSuccess("Auto matching restarted successfully!");
    } catch (err: any) {
      setActionError(err.message || "Failed to restart auto matching.");
    }
  };

  const handleIncreaseRadius = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);
    const radiusKm = parseInt(radiusInput, 10);
    if (isNaN(radiusKm) || radiusKm <= 0) {
      setActionError("Please enter a valid radius in kilometers.");
      return;
    }
    try {
      await increaseRadiusMutation.mutateAsync({ jobId: id, radiusKm });
      setActionSuccess(`Search radius increased by ${radiusKm} km successfully!`);
    } catch (err: any) {
      setActionError(err.message || "Failed to increase search radius.");
    }
  };

  const handleClose = async () => {
    setIsCloseConfirmOpen(false);
    setActionError(null);
    setActionSuccess(null);
    try {
      await closeMutation.mutateAsync(id);
      setActionSuccess("Job closed successfully.");
    } catch (err: any) {
      setActionError(err.message || "Failed to close job posting.");
    }
  };

  // Reset states when job changes
  useEffect(() => {
    setTraderSearch("");
    setSelectedTraderIds([]);
    setAssignError(null);
    setAssignSuccess(null);
    setActionError(null);
    setActionSuccess(null);
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
    setAssignError(null);
    setAssignSuccess(null);

    if (selectedTraderIds.length === 0) {
      setAssignError("Please select at least one trader.");
      return;
    }

    try {
      await assignMutation.mutateAsync({
        jobId: job.id,
        traderIds: selectedTraderIds,
      });
      setAssignSuccess("Job distributed to traders successfully!");
      setSelectedTraderIds([]);
      setTraderSearch("");
      setTimeout(() => {
        setAssignSuccess(null);
        refetch();
      }, 1500);
    } catch (err: any) {
      setAssignError(err.message || "Failed to distribute job.");
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
            className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
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
          <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-full mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h4 className="text-base font-bold text-gray-900 dark:text-white mb-2">Failed to load job</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
            {error || "We could not fetch the details for this job. Please try again."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-12">
      {/* Header and Back Link */}
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/jobs"
            className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            &larr; Back to Jobs
          </Link>
          {job.distributionStatus === "MANUAL_REVIEW" && (
            <>
              <span className="text-gray-300 dark:text-gray-700">|</span>
              <Link
                href="/jobs/manual-review"
                className="inline-flex items-center text-xs font-semibold text-brand-500 hover:text-brand-600 transition-colors"
              >
                Go to Manual Review
              </Link>
            </>
          )}
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <PageBreadcrumb pageTitle="Job Details" />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 ml-0.5">
              Inspect job parameters, customer info, match history, and escalation logs.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge color={getStatusColor(job.status)} size="md">
              {job.status}
            </Badge>
            <Badge color={getDistributionColor(job.distributionStatus)} size="md" variant="light">
              {job.distributionStatus}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns: Job Details, Matches, Logs */}
        <div className="lg:col-span-2 space-y-6">

          {/* Card: Job Overview */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex items-start justify-between border-b border-gray-100 dark:border-gray-850 pb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-snug">
                  {job.title}
                </h2>
                <span className="text-xs font-mono text-gray-400 block mt-1 select-all">
                  Job ID: {job.id}
                </span>
              </div>
              {job.emergency && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 animate-pulse">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  Emergency
                </span>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Job Description</h3>
              <p className="text-xs text-gray-650 dark:text-gray-300 leading-relaxed bg-gray-55/10 dark:bg-gray-950/25 p-4 rounded-xl border border-gray-100 dark:border-gray-850">
                {job.description}
              </p>
            </div>

            {/* Grid properties */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-2">
              <div>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Category</span>
                <span className="text-xs font-bold text-gray-855 dark:text-gray-250 mt-1 block">
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
                <span className="text-xs font-semibold text-gray-855 dark:text-gray-250 mt-1 block">
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
                <span className="text-xs font-semibold text-gray-855 dark:text-gray-200 mt-1 block">
                  {job.timescale}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Current Search Radius</span>
                <span className="text-xs font-bold text-gray-855 dark:text-gray-200 mt-1 block">
                  {job.currentRadiusKm} km
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Location (Coords)</span>
                {job.latitude && job.longitude ? (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${job.latitude},${job.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-brand-500 hover:underline inline-flex items-center gap-1 mt-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {job.postcode || `${job.latitude}, ${job.longitude}`}
                  </a>
                ) : (
                  <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-1 block">N/A</span>
                )}
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Created At</span>
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

          {/* Card: Attachments */}
          {job.attachments && job.attachments.length > 0 && (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-xs">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                Job Attachments ({job.attachments.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {job.attachments.map((attach) => {
                  const fileUrl = attach.file.startsWith("http") ? attach.file : `${getBaseUrl()}/${attach.file}`;
                  return (
                    <div
                      key={attach.id}
                      className="border border-gray-150 dark:border-gray-800 rounded-xl p-3 flex flex-col items-center justify-between bg-gray-55/10 dark:bg-gray-950/20 text-center group hover:border-brand-500 transition-colors"
                    >
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-2 bg-black/5 flex items-center justify-center border border-gray-100 dark:border-gray-800">
                        <img
                          src={fileUrl}
                          alt="Job Attachment"
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      </div>
                      <div className="w-full flex items-center justify-between gap-2 px-0.5">
                        <span className="text-[10px] text-gray-400 font-mono truncate">
                          {attach.file.split("/").pop()}
                        </span>
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-bold text-brand-500 hover:underline shrink-0"
                        >
                          View
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Card: Matched Traders */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-855 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Matched Traders History
                </h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Traders notified within current/past radii matching rules.
                </p>
              </div>
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2.5 py-1 rounded-lg">
                Total: {job.traderMatches?.length || 0}
              </span>
            </div>

            {!job.traderMatches || job.traderMatches.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-xs text-gray-400 dark:text-gray-500">No trader matches recorded yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 dark:bg-gray-950/20 text-[10px] text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-855">
                      <th className="px-6 py-3">Trader</th>
                      <th className="px-6 py-3">Radius (Km)</th>
                      <th className="px-6 py-3">Distance (Km)</th>
                      <th className="px-6 py-3">Score</th>
                      <th className="px-6 py-3 text-center">Status</th>
                      <th className="px-6 py-3">Notified At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-850">
                    {job.traderMatches.map((match) => (
                      <tr key={match.id} className="hover:bg-gray-50/40 dark:hover:bg-white/[0.01] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center bg-gray-100 dark:bg-gray-805">
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
                            <div className="flex flex-col">
                              <Link
                                href={`/traders/${match.traderId}`}
                                className="text-xs font-semibold text-brand-500 hover:underline"
                              >
                                {match.trader.fullName}
                              </Link>
                              <span className="text-[10px] text-gray-400 truncate max-w-[150px]">
                                {match.trader.email}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-gray-700 dark:text-gray-300">
                          {match.radiusKm} km
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-gray-700 dark:text-gray-300">
                          {match.distanceKm ? `${match.distanceKm.toFixed(2)} km` : "N/A"}
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-gray-800 dark:text-gray-250">
                          {match.score ? match.score.toFixed(3) : "0.000"}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge size="xs" color={getMatchStatusColor(match.status)}>
                            {match.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-[10px] font-mono text-gray-450 dark:text-gray-400">
                          {formatDate(match.sentAt || match.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Card: Escalation Logs */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-855">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Radius Escalation History
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Logs of automated search scope expansions when trader response is low.
              </p>
            </div>

            {!job.escalationLogs || job.escalationLogs.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-xs text-gray-400 dark:text-gray-500">No radius escalation logs recorded yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 dark:bg-gray-950/20 text-[10px] text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-855">
                      <th className="px-6 py-3">Previous Radius</th>
                      <th className="px-6 py-3">New Radius</th>
                      <th className="px-6 py-3">New Traders Notified</th>
                      <th className="px-6 py-3">Escalated At</th>
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
            )}
          </div>

        </div>

        {/* Right Column: Customer and Trader Cards */}
        <div className="space-y-6">

          {/* Card: Job Controls */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-850 pb-2">
              Job Administration
            </h3>

            <div className="flex flex-col gap-3">
              {/* Status Indicator */}
              <div className="flex items-center justify-between text-xs py-1 border-b border-gray-50/50 dark:border-gray-850/50">
                <span className="text-gray-450">Matching Status</span>
                <span className="font-semibold text-gray-850 dark:text-gray-200">
                  {job.status === "POSTED" ? "Searching / Distributing" : job.status}
                </span>
              </div>

              {/* Action Messages */}
              {actionError && (
                <div className="p-2.5 bg-rose-50 border border-rose-150 text-rose-600 rounded-xl text-[11px] font-semibold">
                  {actionError}
                </div>
              )}
              {actionSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-150 text-emerald-600 rounded-xl text-[11px] font-semibold">
                  {actionSuccess}
                </div>
              )}

              {/* Pause / Resume Matching */}
              {job.status === "POSTED" && job.distributionStatus !== "PAUSED" && (
                <button
                  onClick={handlePause}
                  disabled={pauseMutation.isPending}
                  className="w-full py-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 text-amber-700 dark:text-amber-450 text-xs font-bold rounded-xl transition"
                >
                  {pauseMutation.isPending ? "Pausing..." : "Pause Matching"}
                </button>
              )}

              {job.distributionStatus === "PAUSED" && (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleResume}
                    disabled={resumeMutation.isPending}
                    className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-450 text-xs font-bold rounded-xl transition"
                  >
                    {resumeMutation.isPending ? "Resuming..." : "Resume Matching"}
                  </button>
                  <button
                    onClick={handleRestartAuto}
                    disabled={restartAutoMutation.isPending}
                    className="w-full py-2 bg-gray-55/15 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl transition border border-gray-200 dark:border-gray-700"
                  >
                    {restartAutoMutation.isPending ? "Restarting..." : "Restart Auto Matching"}
                  </button>
                </div>
              )}

              {/* Increase search radius form */}
              {job.status === "POSTED" && (
                <form onSubmit={handleIncreaseRadius} className="space-y-2 pt-2 border-t border-gray-50 dark:border-gray-850/50">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Increase Search Radius</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          placeholder="Km to add..."
                          value={radiusInput}
                          onChange={(e) => setRadiusInput(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-950/25 text-gray-805 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition"
                        />
                        <span className="absolute inset-y-0 right-3 flex items-center text-[10px] text-gray-400">km</span>
                      </div>
                      <button
                        type="submit"
                        disabled={increaseRadiusMutation.isPending}
                        className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 disabled:bg-gray-100 text-white text-xs font-bold rounded-lg transition"
                      >
                        {increaseRadiusMutation.isPending ? "..." : "Expand"}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Close Job posting */}
              {job.status !== "COMPLETED" && job.status !== "CANCELLED" && (
                <button
                  onClick={() => setIsCloseConfirmOpen(true)}
                  disabled={closeMutation.isPending}
                  className="w-full py-2 mt-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-700 dark:text-rose-450 text-xs font-bold rounded-xl transition border border-rose-100/30"
                >
                  {closeMutation.isPending ? "Closing..." : "Close Job Posting"}
                </button>
              )}
            </div>
          </div>

          {/* Card: Customer Details */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-850 pb-2">
              Customer Details
            </h3>
            {job.customer ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center bg-gray-100 dark:bg-gray-805">
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
                    <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {job.customer.fullName}
                    </span>
                    <span className="text-xs text-gray-400 truncate">
                      Customer Profile
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5 pt-2 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-gray-50/50 dark:border-gray-850/50">
                    <span className="text-gray-400">Email Address</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-250 select-all truncate max-w-[180px]">
                      {job.customer.email}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-gray-50/50 dark:border-gray-850/50">
                    <span className="text-gray-400">Phone Number</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-250">
                      {job.customer.phone || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-gray-400">Joined Platform</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-250">
                      {formatDate(job.customer.createdAt).split(",")[0]}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/customers/${job.customerId}`}
                  className="w-full mt-4 inline-flex items-center justify-center px-4 py-2 border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                >
                  View Client Profile
                </Link>
              </div>
            ) : (
              <p className="text-xs text-gray-455 dark:text-gray-500">Customer details unavailable.</p>
            )}
          </div>

          {/* Card: Selected Trader Details */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-850 pb-2">
              Assigned Trader
            </h3>
            {job.selectedTrader ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center bg-gray-100 dark:bg-gray-805">
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
                    <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {job.selectedTrader.fullName}
                    </span>
                    <span className="text-xs text-gray-400 truncate">
                      Selected Trader Profile
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5 pt-2 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-gray-50/50 dark:border-gray-850/50">
                    <span className="text-gray-400">Email Address</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-250 select-all truncate max-w-[180px]">
                      {job.selectedTrader.email}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-gray-400">Phone Number</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-250">
                      {job.selectedTrader.phone || "N/A"}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/traders/${job.selectedTraderId}`}
                  className="w-full mt-4 inline-flex items-center justify-center px-4 py-2 border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                >
                  View Trader Profile
                </Link>
              </div>
            ) : job.distributionStatus === "MANUAL_REVIEW" ? (
              <div className="space-y-3.5 pt-1">
                <div className="flex flex-col">
                  <h4 className="text-xs font-bold text-gray-700 dark:text-gray-255 uppercase tracking-wider">Distribute to Traders</h4>
                  <span className="text-[11px] text-gray-450 dark:text-gray-500 mt-1">
                    Search and select active traders to manually distribute this job.
                  </span>
                </div>

                <form onSubmit={handleAssignTraders} className="space-y-3">
                  {/* Search box */}
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-gray-400">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      placeholder="Search active traders..."
                      value={traderSearch}
                      onChange={(e) => setTraderSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-950/25 text-gray-850 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition"
                    />
                  </div>

                  {/* Checklist */}
                  <div className="max-h-48 overflow-y-auto border border-gray-150 dark:border-gray-800 rounded-xl divide-y divide-gray-100 dark:divide-gray-850 bg-white dark:bg-gray-950/10">
                    {isLoadingSuggested ? (
                      <div className="p-3 text-center text-xs text-gray-400">Loading suggested traders...</div>
                    ) : filteredSuggestedTraders.length === 0 ? (
                      <div className="p-3 text-center text-xs text-gray-400">No suggested traders found.</div>
                    ) : (
                      filteredSuggestedTraders.map((trader) => (
                        <label
                          key={trader.traderId}
                          className="flex items-center gap-3 p-2.5 hover:bg-gray-50/55 dark:hover:bg-gray-800/10 cursor-pointer text-xs text-gray-850 dark:text-gray-250 select-none"
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
                              <span className="font-semibold truncate text-gray-900 dark:text-white">{trader.fullName}</span>
                              <span className="text-[9px] text-gray-400 dark:text-gray-550 truncate">
                                {trader.email}
                              </span>
                            </div>
                            <div className="flex flex-col items-end shrink-0 pl-2">
                              <span className="text-[10px] font-bold text-brand-500">
                                Score: {trader.finalScore.toFixed(3)}
                              </span>
                              <span className="text-[9px] text-gray-400 dark:text-gray-500">
                                {trader.distanceKm.toFixed(1)} km away
                              </span>
                            </div>
                          </div>
                        </label>
                      ))
                    )}
                  </div>

                  {assignError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-150 text-rose-600 rounded-lg text-[11px] font-semibold">
                      {assignError}
                    </div>
                  )}

                  {assignSuccess && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-150 text-emerald-600 rounded-lg text-[11px] font-semibold">
                      {assignSuccess}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={assignMutation.isPending || selectedTraderIds.length === 0}
                    className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-450 dark:disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs transition"
                  >
                    {assignMutation.isPending
                      ? "Assigning..."
                      : selectedTraderIds.length > 0
                        ? `Assign & Distribute (${selectedTraderIds.length} Selected)`
                        : "Assign & Distribute"}
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 dark:bg-gray-950/20 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-center">
                <span className="text-[11px] text-gray-450 block">No trader has been selected or assigned.</span>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Confirmation Modal for closing job */}
      <Modal isOpen={isCloseConfirmOpen} onClose={() => setIsCloseConfirmOpen(false)} className="max-w-md p-6">
        <div className="flex flex-col items-center text-center space-y-4 pt-4">
          <div className="h-12 w-12 rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-500 flex items-center justify-center border border-rose-100 dark:border-rose-900/30">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="space-y-1.5">
            <h4 className="text-base font-bold text-gray-900 dark:text-white">Close Job Posting</h4>
            <p className="text-xs text-gray-450 dark:text-gray-400 max-w-xs leading-relaxed">
              Are you sure you want to close this job posting? This action is permanent and cannot be undone.
            </p>
          </div>
          <div className="flex w-full gap-3 pt-2">
            <button
              onClick={() => setIsCloseConfirmOpen(false)}
              className="flex-1 py-2 px-4 bg-gray-55/15 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleClose}
              className="flex-1 py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
            >
              Confirm Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
