"use client";

import React, { useState, useEffect, useMemo } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import {
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Pagination from "@/components/ui/pagination/Pagination";
import { useGetAllReviews } from "@/hooks/useReviews";
import Select from "@/components/ui/select/Select";
import { MoreDotIcon } from "@/icons";
import { ReviewItem, ReviewProof } from "@/types/review.types";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/useToast";
import { reviewService } from "@/services/reviewService";

// Toast styling
const toastStyles: Record<string, string> = {
  success: "bg-white dark:bg-gray-900 border-l-4 border-green-500 text-gray-800 dark:text-white shadow-lg",
  error: "bg-white dark:bg-gray-900 border-l-4 border-red-500 text-gray-800 dark:text-white shadow-lg",
  info: "bg-white dark:bg-gray-900 border-l-4 border-blue-500 text-gray-800 dark:text-white shadow-lg",
  warning: "bg-white dark:bg-gray-900 border-l-4 border-yellow-500 text-gray-800 dark:text-white shadow-lg",
};

const toastIcons: Record<string, React.JSX.Element> = {
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
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
  ),
  warning: (
    <svg className="w-4 h-4 text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ),
};

export default function AllReviewsClient() {
  const queryClient = useQueryClient();
  const { toasts, showToast, removeToast } = useToast();

  // Query states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("--");
  const [reviewType, setReviewType] = useState("--");
  const [moderationType, setModerationType] = useState("--");

  // UI state
  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(null);
  const [isModerating, setIsModerating] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectModalReviewId, setRejectModalReviewId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  const queryParams = useMemo(() => {
    return {
      page,
      limit,
      search: debouncedSearch || undefined,
      status: status === "--" ? undefined : status,
      reviewType: reviewType === "--" ? undefined : reviewType,
      moderationType: moderationType === "--" ? undefined : moderationType,
    };
  }, [page, limit, debouncedSearch, status, reviewType, moderationType]);

  const { data, isLoading, error } = useGetAllReviews(queryParams);

  const reviewsList = data?.data || [];
  const paginationInfo = data?.pagination || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  // Helper to format image URLs
  const getFormattedImageUrl = (path: string | null | undefined) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
      return path;
    }
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
  };

  // Approve review handler
  const handleApproveReview = async (id: string) => {
    setIsModerating(true);
    try {
      await reviewService.approveReview(id);
      showToast("success", "Review approved successfully!");
      queryClient.invalidateQueries({ queryKey: ["allReviews"] });
      setSelectedReview(null);
    } catch (err: any) {
      showToast("error", err?.message || "Failed to approve review.");
    } finally {
      setIsModerating(false);
    }
  };

  // Open Rejection Modal
  const handleOpenRejectModal = (id: string) => {
    setRejectModalReviewId(id);
    setRejectionReason("");
    setIsRejectModalOpen(true);
  };

  // Submit rejection handler
  const handleRejectReviewSubmit = async () => {
    if (!rejectModalReviewId) return;
    if (!rejectionReason.trim()) {
      showToast("warning", "Please provide a rejection reason.");
      return;
    }
    setIsModerating(true);
    try {
      await reviewService.rejectReview(rejectModalReviewId, rejectionReason.trim());
      showToast("success", "Review rejected successfully.");
      queryClient.invalidateQueries({ queryKey: ["allReviews"] });
      setSelectedReview(null);
      setIsRejectModalOpen(false);
      setRejectModalReviewId(null);
    } catch (err: any) {
      showToast("error", err?.message || "Failed to reject review.");
    } finally {
      setIsModerating(false);
    }
  };

  // Render Stars
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300 dark:text-gray-700"}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499c.15-.36.6-.36.75 0l2.22 5.384 5.753.518c.397.036.556.544.258.824l-4.39 4.103 1.34 5.678c.092.392-.32.69-.663.486L12 17.545l-4.798 2.946c-.344.204-.755-.094-.663-.486l1.34-5.678-4.39-4.103c-.298-.28-.139-.788.258-.824l5.753-.518 2.22-5.384z"
            />
          </svg>
        ))}
      </div>
    );
  };

  // Initials and Color Helpers for Avatars
  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const getAvatarBg = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      "bg-teal-50 text-teal-600 dark:bg-teal-500/15 dark:text-teal-400",
      "bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400",
      "bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-500/15 dark:text-fuchsia-400",
      "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
      "bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400",
    ];
    return colors[Math.abs(hash) % colors.length];
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

  return (
    <div className="w-full pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <PageBreadcrumb pageTitle="All Reviews" />
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 ml-0.5">
            View and manage all customer reviews across the platform
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-5 mb-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Search Box */}
          <div className="flex flex-col gap-1.5 col-span-1 sm:col-span-2">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Search Reviews
            </label>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by customer name, trader name, review title..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/80 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
             <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Status</label>
             <Select
                options={[
                  { value: "--", label: "All Statuses" },
                  { value: "PENDING", label: "Pending" },
                  { value: "APPROVED", label: "Approved" },
                  { value: "REJECTED", label: "Rejected" }
                ]}
                value={status}
                onChange={setStatus}
             />
          </div>
          <div className="flex flex-col gap-1.5">
             <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Review Type</label>
             <Select
                options={[
                  { value: "--", label: "All Types" },
                  { value: "DIRECTORY", label: "Directory" },
                  { value: "JOB", label: "Job" }
                ]}
                value={reviewType}
                onChange={setReviewType}
             />
          </div>
          <div className="flex flex-col gap-1.5">
             <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Moderation</label>
             <Select
                options={[
                  { value: "--", label: "All" },
                  { value: "AUTO", label: "Auto" },
                  { value: "MANUAL", label: "Manual" }
                ]}
                value={moderationType}
                onChange={setModerationType}
             />
          </div>

          {/* Results Summary */}
          <div className="flex justify-start sm:justify-end text-xs text-gray-400 dark:text-gray-500 sm:pb-2">
            {isLoading ? (
              <span>Loading reviews...</span>
            ) : (
              <span>Found {paginationInfo.total} review{paginationInfo.total === 1 ? "" : "s"}</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-sm flex flex-col">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1100px] w-full">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-6 py-4 font-bold text-gray-600 text-start text-xs uppercase tracking-wider dark:text-gray-400"
                  >
                    Customer
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-4 font-bold text-gray-600 text-start text-xs uppercase tracking-wider dark:text-gray-400"
                  >
                    Trader
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-4 font-bold text-gray-600 text-start text-xs uppercase tracking-wider dark:text-gray-400"
                  >
                    Rating & Title
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-4 font-bold text-gray-600 text-start text-xs uppercase tracking-wider dark:text-gray-400"
                  >
                    Review Comment
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-4 font-bold text-gray-600 text-center text-xs uppercase tracking-wider dark:text-gray-400"
                  >
                    Proofs
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-4 font-bold text-gray-600 text-start text-xs uppercase tracking-wider dark:text-gray-400"
                  >
                    Submitted At
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-4 font-bold text-gray-600 text-center text-xs uppercase tracking-wider dark:text-gray-400"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800/65">
                {isLoading ? (
                  // Skeleton state
                  Array.from({ length: limit }).map((_, rowIndex) => (
                    <TableRow key={`skeleton-${rowIndex}`}>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3 animate-pulse">
                          <div className="w-9 h-9 rounded-full bg-gray-250 dark:bg-gray-800" />
                          <div className="space-y-2">
                            <div className="h-3 bg-gray-255 dark:bg-gray-800 rounded w-20" />
                            <div className="h-2 bg-gray-250 dark:bg-gray-800 rounded w-28" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3 animate-pulse">
                          <div className="w-9 h-9 rounded-full bg-gray-250 dark:bg-gray-800" />
                          <div className="space-y-2">
                            <div className="h-3 bg-gray-255 dark:bg-gray-800 rounded w-20" />
                            <div className="h-2 bg-gray-250 dark:bg-gray-800 rounded w-28" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="space-y-2 animate-pulse">
                          <div className="h-3.5 bg-gray-250 dark:bg-gray-800 rounded w-16" />
                          <div className="h-3 bg-gray-255 dark:bg-gray-800 rounded w-24" />
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="h-3 bg-gray-250 dark:bg-gray-800 rounded w-48 animate-pulse" />
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center">
                        <div className="inline-block h-5 bg-gray-250 dark:bg-gray-800 rounded-full w-12 animate-pulse" />
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="h-3 bg-gray-250 dark:bg-gray-800 rounded w-24 animate-pulse" />
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center">
                        <div className="inline-block h-8 bg-gray-250 dark:bg-gray-800 rounded-lg w-16 animate-pulse" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : error ? (
                  // Error state
                  <TableRow>
                    <TableCell colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center max-w-md mx-auto">
                        <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-500 dark:text-red-400 rounded-full mb-3">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Failed to fetch reviews</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{error}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : reviewsList.length === 0 ? (
                  // Empty state
                  <TableRow>
                    <TableCell colSpan={7} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                        <div className="p-4 bg-gray-50 dark:bg-gray-950/40 text-gray-400 dark:text-gray-600 rounded-full mb-4">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11.48 3.499c.15-.36.6-.36.75 0l2.22 5.384 5.753.518c.397.036.556.544.258.824l-4.39 4.103 1.34 5.678c.092.392-.32.69-.663.486L12 17.545l-4.798 2.946c-.344.204-.755-.094-.663-.486l1.34-5.678-4.39-4.103c-.298-.28-.139-.788.258-.824l5.753-.518 2.22-5.384z" />
                          </svg>
                        </div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">No Pending Reviews</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Excellent! There are no pending reviews requiring moderation at this time.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  // Data state
                  reviewsList.map((review) => {
                    const custInit = getInitials(review.customer.fullName);
                    const custColor = getAvatarBg(review.customer.fullName);
                    const tradInit = getInitials(review.trader.fullName);
                    const tradColor = getAvatarBg(review.trader.fullName);

                    return (
                      <TableRow
                        key={review.id}
                        onClick={() => setSelectedReview(review)}
                        className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors cursor-pointer"
                      >
                        {/* Customer */}
                        <TableCell className="px-6 py-3.5 text-start">
                          <div className="flex items-center gap-3">
                            {review.customer.profileImage ? (
                              <div className="w-9 h-9 overflow-hidden rounded-full border border-gray-100 dark:border-gray-800 flex-shrink-0">
                                <img
                                  src={getFormattedImageUrl(review.customer.profileImage)}
                                  alt={review.customer.fullName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-[11px] flex-shrink-0 ${custColor}`}
                              >
                                {custInit}
                              </div>
                            )}
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-gray-800 dark:text-white/90 text-sm truncate">
                                {review.customer.fullName}
                              </span>
                              <span className="text-gray-400 dark:text-gray-500 text-xs truncate">
                                {review.customer.email}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Trader */}
                        <TableCell className="px-6 py-3.5 text-start">
                          <div className="flex items-center gap-3">
                            {review.trader.profileImage ? (
                              <div className="w-9 h-9 overflow-hidden rounded-full border border-gray-100 dark:border-gray-800 flex-shrink-0">
                                <img
                                  src={getFormattedImageUrl(review.trader.profileImage)}
                                  alt={review.trader.fullName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-[11px] flex-shrink-0 ${tradColor}`}
                              >
                                {tradInit}
                              </div>
                            )}
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-gray-800 dark:text-white/90 text-sm truncate">
                                {review.trader.fullName}
                              </span>
                              <span className="text-gray-400 dark:text-gray-500 text-xs truncate">
                                {review.trader.email}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Rating & Title */}
                        <TableCell className="px-6 py-3.5 text-start">
                          <div className="flex flex-col gap-1">
                            {renderStars(review.rating)}
                            <span className="font-semibold text-gray-800 dark:text-white text-xs truncate max-w-[150px]">
                              {review.title}
                            </span>
                          </div>
                        </TableCell>

                        {/* Review text */}
                        <TableCell className="px-6 py-3.5 text-start text-sm text-gray-500 dark:text-gray-400 font-normal">
                          <p className="line-clamp-2 max-w-[300px] break-words">
                            {review.review}
                          </p>
                        </TableCell>

                        {/* Proofs count */}
                        <TableCell className="px-6 py-3.5 text-center">
                          {review.proofs && review.proofs.length > 0 ? (
                            <Badge color="info" size="sm" variant="light">
                              📎 {review.proofs.length} Proof{review.proofs.length > 1 ? "s" : ""}
                            </Badge>
                          ) : (
                            <span className="text-gray-450 dark:text-gray-600 text-xs italic">None</span>
                          )}
                        </TableCell>

                        {/* Submitted Date */}
                        <TableCell className="px-6 py-3.5 text-start text-gray-500 dark:text-gray-400 text-sm">
                          {formatDate(review.createdAt)}
                        </TableCell>

                        {/* Action buttons */}
                        <TableCell className="px-6 py-3.5 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Open an action menu in the future
                            }}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:text-gray-200 dark:hover:bg-white/[0.05] transition-colors"
                          >
                            <MoreDotIcon />
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Global Pagination */}
        <Pagination
          currentPage={paginationInfo.page}
          totalPages={paginationInfo.totalPages}
          totalItems={paginationInfo.total}
          limit={paginationInfo.limit}
          onPageChange={(p) => setPage(p)}
          onLimitChange={(l) => {
            setLimit(l);
            setPage(1);
          }}
          isLoading={isLoading}
        />
      </div>

      {/* Side Inspect Drawer */}
      {selectedReview && (
        <div className="fixed inset-0 z-[1000] flex justify-end bg-black/45 backdrop-blur-xs transition-opacity duration-300">
          <div
            className="absolute inset-0 cursor-default"
            onClick={() => setSelectedReview(null)}
          />

          <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col z-10 border-l border-gray-100 dark:border-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>Review Details Moderation</span>
                <Badge color="warning" size="sm">PENDING</Badge>
              </h3>
              <button
                onClick={() => setSelectedReview(null)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Customer & Trader Profiles */}
              <div className="grid grid-cols-2 gap-4">
                {/* Customer card */}
                <div className="p-4 rounded-xl bg-gray-50/50 dark:bg-gray-950/20 border border-gray-100 dark:border-gray-850 flex flex-col items-center text-center">
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider mb-2">
                    Review Submitted By
                  </span>
                  {selectedReview.customer.profileImage ? (
                    <img
                      src={getFormattedImageUrl(selectedReview.customer.profileImage)}
                      alt={selectedReview.customer.fullName}
                      className="w-12 h-12 rounded-full border border-gray-150 dark:border-gray-700 object-cover mb-2"
                    />
                  ) : (
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm mb-2 ${getAvatarBg(
                        selectedReview.customer.fullName
                      )}`}
                    >
                      {getInitials(selectedReview.customer.fullName)}
                    </div>
                  )}
                  <span className="text-xs font-bold text-gray-800 dark:text-white leading-tight">
                    {selectedReview.customer.fullName}
                  </span>
                  <span className="text-[10px] text-gray-450 dark:text-gray-500 mt-0.5 truncate max-w-full">
                    {selectedReview.customer.email}
                  </span>
                </div>

                {/* Trader card */}
                <div className="p-4 rounded-xl bg-gray-50/50 dark:bg-gray-950/20 border border-gray-100 dark:border-gray-850 flex flex-col items-center text-center">
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider mb-2">
                    Review Target Trader
                  </span>
                  {selectedReview.trader.profileImage ? (
                    <img
                      src={getFormattedImageUrl(selectedReview.trader.profileImage)}
                      alt={selectedReview.trader.fullName}
                      className="w-12 h-12 rounded-full border border-gray-150 dark:border-gray-700 object-cover mb-2"
                    />
                  ) : (
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm mb-2 ${getAvatarBg(
                        selectedReview.trader.fullName
                      )}`}
                    >
                      {getInitials(selectedReview.trader.fullName)}
                    </div>
                  )}
                  <span className="text-xs font-bold text-gray-800 dark:text-white leading-tight">
                    {selectedReview.trader.fullName}
                  </span>
                  <span className="text-[10px] text-gray-455 dark:text-gray-500 mt-0.5 truncate max-w-full">
                    {selectedReview.trader.email}
                  </span>
                </div>
              </div>

              {/* Review Content */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Review Text & Rating
                </h5>

                <div className="p-4 rounded-xl bg-gray-50/20 dark:bg-gray-900/60 border border-gray-150 dark:border-gray-800 space-y-3">
                  <div className="flex items-center justify-between">
                    {renderStars(selectedReview.rating)}
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      Score: {selectedReview.rating} / 5
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                      "{selectedReview.title}"
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed italic whitespace-pre-wrap pt-1">
                      "{selectedReview.review}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Job & Work Details */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Work Verification Details
                </h5>

                <div className="divide-y divide-gray-100 dark:divide-gray-800/80 bg-gray-50/20 dark:bg-gray-900/60 rounded-xl border border-gray-150 dark:border-gray-800 overflow-hidden">
                  <div className="flex items-center justify-between text-xs p-3">
                    <span className="text-gray-500 dark:text-gray-400">Was work completed?</span>
                    <span className={`font-semibold ${selectedReview.wasWorkCompleted ? "text-green-500" : "text-red-500"}`}>
                      {selectedReview.wasWorkCompleted ? "Yes" : "No"}
                    </span>
                  </div>

                  {selectedReview.wasWorkCompleted && selectedReview.workCompletedDate && (
                    <div className="flex items-center justify-between text-xs p-3">
                      <span className="text-gray-500 dark:text-gray-400">Work completed date:</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {formatDate(selectedReview.workCompletedDate).split(",")[0]}
                      </span>
                    </div>
                  )}

                  {!selectedReview.wasWorkCompleted && (
                    <div className="flex flex-col gap-1 p-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Reason for no work:</span>
                        <span className="font-semibold text-amber-500">{selectedReview.noWorkReason || "N/A"}</span>
                      </div>
                      {selectedReview.noWorkReasonText && (
                        <p className="text-[11px] text-gray-450 dark:text-gray-500 bg-gray-50/50 dark:bg-gray-950/40 p-2 rounded mt-1.5 italic">
                          "{selectedReview.noWorkReasonText}"
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs p-3">
                    <span className="text-gray-500 dark:text-gray-400">Would recommend trader?</span>
                    <span className={`font-semibold ${selectedReview.wouldRecommendTrader ? "text-green-500" : "text-red-500"}`}>
                      {selectedReview.wouldRecommendTrader ? "Yes" : "No"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs p-3">
                    <span className="text-gray-500 dark:text-gray-400">Source:</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-300">
                      {selectedReview.interactionSource} ({selectedReview.reviewType})
                    </span>
                  </div>
                </div>
              </div>

              {/* Uploaded Proofs */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Verification Proof Files
                </h5>

                {selectedReview.proofs && selectedReview.proofs.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {selectedReview.proofs.map((proof: ReviewProof) => {
                      const proofUrl = getFormattedImageUrl(proof.fileUrl);
                      const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(proof.fileUrl);

                      return (
                        <div
                          key={proof.id}
                          className="flex flex-col border border-gray-150 dark:border-gray-800 rounded-xl overflow-hidden bg-gray-50/20 dark:bg-gray-950/20 p-2.5"
                        >
                          {isImage ? (
                            <a
                              href={proofUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="relative h-28 rounded-lg overflow-hidden group border border-gray-100 dark:border-gray-850"
                            >
                              <img
                                src={proofUrl}
                                alt="Proof upload"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </div>
                            </a>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-28 bg-gray-100/50 dark:bg-gray-800/40 rounded-lg text-gray-400 dark:text-gray-500">
                              <svg className="w-8 h-8 mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span className="text-[10px] px-2 text-center font-medium truncate max-w-full">
                                {proof.originalName || "Document Proof"}
                              </span>
                            </div>
                          )}

                          <a
                            href={proofUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 text-center text-[10px] font-bold text-brand-500 dark:text-brand-400 hover:underline"
                          >
                            Download Attachment
                          </a>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 text-center text-xs text-gray-450 dark:text-gray-500 italic bg-gray-50/10 dark:bg-gray-900/10">
                    No attachment proofs uploaded for this review.
                  </div>
                )}
              </div>
            </div>

            {/* Sticky Actions Footer */}
            <div className="px-6 py-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20 flex items-center justify-end gap-3 flex-shrink-0">
              <button
                disabled={isModerating}
                onClick={() => handleOpenRejectModal(selectedReview.id)}
                className="flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-650 hover:bg-red-50/30 rounded-xl text-xs font-bold disabled:opacity-40 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reject Review
              </button>

              <button
                disabled={isModerating}
                onClick={() => handleApproveReview(selectedReview.id)}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold disabled:opacity-40 shadow-sm transition-colors"
              >
                {isModerating ? (
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                Approve Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 backdrop-blur-xs">
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full border border-gray-150 dark:border-gray-800 shadow-2xl overflow-hidden flex flex-col p-6 m-4 animate-scale-up">
            <h4 className="text-base font-bold text-gray-900 dark:text-white mb-2">
              Reject Customer Review
            </h4>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
              Please enter the reason for rejecting this review. This explanation will help customer support if inquiries arise.
            </p>

            <textarea
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Provide detail on why this review is being rejected (e.g. inappropriate language, false proof, spam, etc.)..."
              className="w-full text-sm p-3 rounded-lg border border-gray-200 dark:border-gray-850 bg-gray-50 dark:bg-gray-900/60 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-500 resize-none mb-5"
            />

            <div className="flex items-center justify-end gap-3">
              <button
                disabled={isModerating}
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 disabled:opacity-40 transition-colors"
              >
                Cancel
              </button>

              <button
                disabled={isModerating}
                onClick={handleRejectReviewSubmit}
                className="flex items-center gap-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold disabled:opacity-40 shadow-sm transition-colors"
              >
                {isModerating && (
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Toast Container */}
      <div className="fixed top-6 right-6 z-[999999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border border-gray-250 dark:border-gray-800
              max-w-sm w-full pointer-events-auto transition-all duration-300
              ${toastStyles[toast.type]}
            `}
          >
            {toastIcons[toast.type]}
            <span className="text-sm font-medium flex-1 leading-normal">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-650 dark:hover:text-gray-300 transition-colors flex-shrink-0"
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
