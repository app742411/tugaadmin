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
import { useGetTraders } from "@/hooks/useTraders";
import { TraderItem } from "@/types/trader.types";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/useToast";
import { traderService } from "@/services/traderService";
import Select from "@/components/ui/select/Select";
import Link from "next/link";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { MoreDotIcon } from "@/icons";

// Toast styling and icons
const toastStyles: Record<string, string> = {
  success: "bg-white dark:bg-gray-900 border-l-4 border-green-500 text-gray-800 dark:text-white",
  error: "bg-white dark:bg-gray-900 border-l-4 border-red-500 text-gray-800 dark:text-white",
  info: "bg-white dark:bg-gray-900 border-l-4 border-blue-500 text-gray-800 dark:text-white",
  warning: "bg-white dark:bg-gray-900 border-l-4 border-yellow-500 text-gray-800 dark:text-white",
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

export default function TradersPageClient() {
  const queryClient = useQueryClient();
  const { toasts, showToast, removeToast } = useToast();

  // Query parameters state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState<string>("--");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Inspect drawer state
  const [selectedTrader, setSelectedTrader] = useState<TraderItem | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Verification states
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectModalTraderId, setRejectModalTraderId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Handler: Approve Trader
  const handleVerifyApprove = async (traderId: string) => {
    setIsVerifying(true);
    try {
      await traderService.verifyTrader(traderId, {
        verificationStatus: "APPROVED",
        rejectReason: null,
      });
      showToast("success", "Trader business profile approved successfully!");
      queryClient.invalidateQueries({ queryKey: ["traders"] });
      
      // Update drawer state in-place
      setSelectedTrader((prev) => {
        if (!prev || prev.id !== traderId) return prev;
        return {
          ...prev,
          traderProfile: prev.traderProfile
            ? { ...prev.traderProfile, verificationStatus: "APPROVED", rejectReason: null }
            : null,
        };
      });
    } catch (err: any) {
      showToast("error", err?.message || "Failed to approve trader.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Handler: Open Rejection Modal
  const handleVerifyRejectOpen = (traderId: string) => {
    setRejectModalTraderId(traderId);
    setRejectReason("");
    setIsRejectModalOpen(true);
  };

  // Handler: Submit Rejection Reason
  const handleVerifyRejectSubmit = async () => {
    if (!rejectModalTraderId) return;
    if (!rejectReason.trim()) {
      showToast("warning", "Please provide a reason for rejecting this trader.");
      return;
    }
    setIsVerifying(true);
    try {
      await traderService.verifyTrader(rejectModalTraderId, {
        verificationStatus: "REJECTED",
        rejectReason: rejectReason,
      });
      showToast("success", "Trader business profile rejected successfully.");
      queryClient.invalidateQueries({ queryKey: ["traders"] });
      
      // Update drawer state in-place
      const reasonCopy = rejectReason;
      setSelectedTrader((prev) => {
        if (!prev || prev.id !== rejectModalTraderId) return prev;
        return {
          ...prev,
          traderProfile: prev.traderProfile
            ? { ...prev.traderProfile, verificationStatus: "REJECTED", rejectReason: reasonCopy }
            : null,
        };
      });
      
      setIsRejectModalOpen(false);
      setRejectModalTraderId(null);
    } catch (err: any) {
      showToast("error", err?.message || "Failed to reject trader.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Debounce search query changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page to 1 on search change
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  // Handle status selection changes
  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    setPage(1); // Reset page to 1 on status filter change
  };

  // Fetch traders data via custom hook
  const queryParams = useMemo(() => {
    return {
      page,
      limit,
      status: status === "--" ? undefined : status,
      search: debouncedSearch || undefined,
    };
  }, [page, limit, status, debouncedSearch]);

  const { data, isLoading, error } = useGetTraders(queryParams);

  const tradersList = data?.data || [];
  const paginationInfo = data?.pagination || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  };

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
      "bg-teal-50 text-teal-600 dark:bg-teal-500/15 dark:text-teal-400",
      "bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400",
      "bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-500/15 dark:text-fuchsia-400",
      "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
      "bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400",
    ];
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  // Verification status mapping to Badge color props
  const getVerificationStatusColor = (vStatus: string): "success" | "warning" | "error" | "info" | "light" => {
    switch (vStatus) {
      case "APPROVED":
        return "success";
      case "PENDING":
        return "info";
      case "REJECTED":
        return "error";
      default:
        return "light";
    }
  };

  // Status mapping to Badge color props
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
          <PageBreadcrumb pageTitle="Trader Management" />
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 ml-0.5">
            Review, verify, and monitor business profiles of traders
          </p>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="p-5 mb-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Search Box */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Search Traders
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
                placeholder="Search by name, email, or company..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/80 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
              />
            </div>
          </div>

          {/* Status Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Filter by Status
            </label>
            <Select
              options={[
                { value: "--", label: "All Statuses" },
                { value: "ACTIVE", label: "ACTIVE" },
                { value: "INACTIVE", label: "INACTIVE" },
                { value: "PENDING", label: "PENDING" },
                { value: "BLOCKED", label: "BLOCKED" },
              ]}
              value={status}
              onChange={handleStatusChange}
            />
          </div>

          {/* Spacer */}
          <div className="hidden lg:block"></div>

          {/* Results summary */}
          <div className="flex justify-start sm:justify-end text-xs text-gray-400 dark:text-gray-500 sm:pb-2">
            {isLoading ? (
              <span>Loading results...</span>
            ) : (
              <span>Found {paginationInfo.total} trader{paginationInfo.total === 1 ? "" : "s"}</span>
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
                    Trader / Business
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-4 font-bold text-gray-600 text-start text-xs uppercase tracking-wider dark:text-gray-400"
                  >
                    Company Details
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-4 font-bold text-gray-600 text-start text-xs uppercase tracking-wider dark:text-gray-400"
                  >
                    Contact
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-4 font-bold text-gray-600 text-center text-xs uppercase tracking-wider dark:text-gray-400"
                  >
                    Vetting Status
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-4 font-bold text-gray-600 text-center text-xs uppercase tracking-wider dark:text-gray-400"
                  >
                    Account Status
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-4 font-bold text-gray-600 text-start text-xs uppercase tracking-wider dark:text-gray-400"
                  >
                    Joined Date
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
                          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800" />
                          <div className="space-y-2">
                            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-28" />
                            <div className="h-2.5 bg-gray-200 dark:bg-gray-800 rounded w-36" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="space-y-2 animate-pulse">
                          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-24" />
                          <div className="h-2.5 bg-gray-200 dark:bg-gray-800 rounded w-16" />
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-28 animate-pulse" />
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center">
                        <div className="inline-block h-5 bg-gray-200 dark:bg-gray-800 rounded-full w-20 animate-pulse" />
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center">
                        <div className="inline-block h-5 bg-gray-200 dark:bg-gray-800 rounded-full w-16 animate-pulse" />
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-20 animate-pulse" />
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center">
                        <div className="inline-block h-8 bg-gray-200 dark:bg-gray-800 rounded-lg w-16 animate-pulse" />
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
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Failed to fetch traders</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{error}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : tradersList.length === 0 ? (
                  // Empty state
                  <TableRow>
                    <TableCell colSpan={7} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                        <div className="p-4 bg-gray-50 dark:bg-gray-950/40 text-gray-400 dark:text-gray-600 rounded-full mb-4">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">No Traders Found</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          We couldn't find any traders matching your filters or search term. Try expanding your parameters.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  // Data state
                  tradersList.map((trader) => {
                    const initials = getInitials(trader.fullName);
                    const avatarColorClass = getAvatarBg(trader.fullName);
                    const profile = trader.traderProfile;

                    return (
                      <TableRow
                        key={trader.id}
                        className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors"
                      >
                        {/* Trader / Business */}
                        <TableCell className="px-6 py-3.5 text-start">
                          <div className="flex items-center gap-3">
                            {trader.profileImage ? (
                              <div className="w-10 h-10 overflow-hidden rounded-full border border-gray-100 dark:border-gray-800">
                                <img
                                  src={trader.profileImage}
                                  alt={trader.fullName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${avatarColorClass}`}
                              >
                                {initials}
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-800 dark:text-white/90 text-sm">
                                {trader.fullName}
                              </span>
                              <span className="text-gray-400 dark:text-gray-500 text-xs">
                                {trader.email}
                              </span>
                              {profile?.companyName && (
                                <span className="text-brand-500 dark:text-brand-400 text-xs font-semibold mt-0.5">
                                  🏢 {profile.companyName}
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Company Details */}
                        <TableCell className="px-6 py-3.5 text-start text-sm">
                          {profile?.companyType ? (
                            <div className="flex flex-col">
                              <span className="text-gray-800 dark:text-white font-medium">
                                {profile.companyType}
                              </span>
                              <span className="text-gray-400 dark:text-gray-500 text-xs">
                                Reg: {profile.registrationNumber || "N/A"}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-600 italic">No business info</span>
                          )}
                        </TableCell>

                        {/* Contact */}
                        <TableCell className="px-6 py-3.5 text-start text-gray-600 dark:text-gray-400 text-sm font-medium">
                          {trader.phone || (
                            <span className="text-gray-300 dark:text-gray-600 italic">No phone</span>
                          )}
                        </TableCell>

                        {/* Vetting status badge */}
                        <TableCell className="px-6 py-3.5 text-center">
                          <Badge
                            size="sm"
                            color={getVerificationStatusColor(profile?.verificationStatus || "PENDING")}
                            variant="light"
                          >
                            {profile?.verificationStatus || "PENDING"}
                          </Badge>
                        </TableCell>

                        {/* Account status badge */}
                        <TableCell className="px-6 py-3.5 text-center">
                          <Badge
                            size="sm"
                            color={getStatusColor(trader.status)}
                            variant="light"
                          >
                            {trader.status}
                          </Badge>
                        </TableCell>

                        {/* Created Date */}
                        <TableCell className="px-6 py-3.5 text-start text-gray-600 dark:text-gray-400 text-sm font-medium">
                          {formatDate(trader.createdAt)}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="px-6 py-3.5 text-center">
                          <div className="relative inline-block text-left">
                            <button
                              onClick={() => setOpenDropdownId(openDropdownId === trader.id ? null : trader.id)}
                              className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                            >
                              <MoreDotIcon className="w-5 h-5" />
                            </button>
                            <Dropdown
                              isOpen={openDropdownId === trader.id}
                              onClose={() => setOpenDropdownId(null)}
                              className="w-48 right-0"
                            >
                              <div className="py-1">
                                <DropdownItem
                                  onItemClick={() => {
                                    handleVerifyApprove(trader.id);
                                    setOpenDropdownId(null);
                                  }}
                                  className="text-green-600 dark:text-green-400 font-medium"
                                >
                                  Approve
                                </DropdownItem>
                                <DropdownItem
                                  onItemClick={() => {
                                    setRejectModalTraderId(trader.id);
                                    setIsRejectModalOpen(true);
                                    setOpenDropdownId(null);
                                  }}
                                  className="text-red-600 dark:text-red-400 font-medium"
                                >
                                  Reject
                                </DropdownItem>
                                <DropdownItem
                                  tag="a"
                                  href={`/traders/${trader.id}`}
                                  className="font-medium"
                                  onClick={() => setOpenDropdownId(null)}
                                >
                                  View details
                                </DropdownItem>
                                <DropdownItem
                                  onItemClick={() => {
                                    setSelectedTrader(trader);
                                    setOpenDropdownId(null);
                                  }}
                                  className="font-medium"
                                >
                                  Quick detail
                                </DropdownItem>
                              </div>
                            </Dropdown>
                          </div>
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

      {/* Premium Inspect Side-over Drawer / Modal backdrop */}
      {selectedTrader && (
        <div className="fixed inset-0 z-[1000] flex justify-end bg-black/40 backdrop-blur-xs transition-opacity duration-300">
          <div
            className="absolute inset-0 cursor-default"
            onClick={() => setSelectedTrader(null)}
          />

          <div className="relative w-full max-w-md bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col animate-slide-left z-10 border-l border-gray-100 dark:border-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Trader Business Profile
              </h3>
              <button
                onClick={() => setSelectedTrader(null)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Profile Card Summary */}
              <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-950/20 border border-gray-100 dark:border-gray-800/80">
                {selectedTrader.profileImage ? (
                  <img
                    src={selectedTrader.profileImage}
                    alt={selectedTrader.fullName}
                    className="w-16 h-16 rounded-full border border-gray-200 dark:border-gray-700 object-cover mb-3"
                  />
                ) : (
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg mb-3 ${getAvatarBg(
                      selectedTrader.fullName
                    )}`}
                  >
                    {getInitials(selectedTrader.fullName)}
                  </div>
                )}
                <h4 className="text-base font-bold text-gray-850 dark:text-white">
                  {selectedTrader.fullName}
                </h4>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {selectedTrader.email}
                </p>

                {selectedTrader.traderProfile?.logo && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-brand-500 font-bold border border-brand-100 dark:border-brand-900/30 rounded-lg px-2.5 py-1 bg-brand-50/40 dark:bg-brand-500/10">
                    📂 Logo Uploaded
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  <Badge color={getStatusColor(selectedTrader.status)} size="sm">
                    Account: {selectedTrader.status}
                  </Badge>
                  <Badge
                    color={getVerificationStatusColor(selectedTrader.traderProfile?.verificationStatus || "PENDING")}
                    size="sm"
                  >
                    Vetting: {selectedTrader.traderProfile?.verificationStatus || "PENDING"}
                  </Badge>
                </div>

                {selectedTrader.traderProfile?.verificationStatus === "REJECTED" &&
                  selectedTrader.traderProfile.rejectReason && (
                    <div className="mt-3.5 text-xs text-red-500 font-semibold border border-red-200/40 bg-red-50/50 dark:bg-red-950/15 dark:border-red-900/30 rounded-lg p-2.5 max-w-full text-center">
                      <span className="block text-[10px] text-red-400 dark:text-red-400 font-bold uppercase tracking-wider mb-0.5">
                        Reason for Rejection:
                      </span>
                      "{selectedTrader.traderProfile.rejectReason}"
                    </div>
                  )}
              </div>

              {/* Company & Vetting */}
              {selectedTrader.traderProfile && (
                <div className="space-y-4">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Business Credentials
                  </h5>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col col-span-2">
                      <span className="text-[11px] text-gray-400 dark:text-gray-500">Company Name</span>
                      <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                        {selectedTrader.traderProfile.companyName || "N/A"}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[11px] text-gray-400 dark:text-gray-500">Business Type</span>
                      <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                        {selectedTrader.traderProfile.companyType || "N/A"}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[11px] text-gray-400 dark:text-gray-500">Reg Number</span>
                      <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 break-all">
                        {selectedTrader.traderProfile.registrationNumber || "N/A"}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[11px] text-gray-400 dark:text-gray-500">Work Radius</span>
                      <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                        {selectedTrader.traderProfile.workRadius ? `${selectedTrader.traderProfile.workRadius} km` : "N/A"}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[11px] text-gray-400 dark:text-gray-500">Location</span>
                      <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 capitalize">
                        {selectedTrader.traderProfile.location || "N/A"}
                      </span>
                    </div>

                    <div className="flex flex-col col-span-2">
                      <span className="text-[11px] text-gray-400 dark:text-gray-500">About Business</span>
                      <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-normal mt-0.5 italic">
                        "{selectedTrader.traderProfile.about || "No business description provided."}"
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Vetting Affirmations */}
              {selectedTrader.traderProfile && (
                <div className="space-y-3 pt-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Vetting Affirmations
                  </h5>

                  <div className="space-y-2">
                    {[
                      { label: "Minimum Experience Met", val: selectedTrader.traderProfile.minimumExperience },
                      { label: "Authorised Business Operator", val: selectedTrader.traderProfile.authorisedBusiness },
                      { label: "Understands Vetting Policy", val: selectedTrader.traderProfile.understandVettingPolicy },
                      { label: "Accepted Business Terms", val: selectedTrader.traderProfile.acceptedTermsConditions },
                      { label: "Accepted Privacy Policies", val: selectedTrader.traderProfile.acceptedPrivacyPolicy },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-gray-50 dark:border-gray-800/40">
                        <span className="text-gray-500 dark:text-gray-400">{item.label}</span>
                        <span className={`font-bold ${item.val ? "text-green-500" : "text-red-500"}`}>
                          {item.val ? "Yes" : "No"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subscription Information */}
              {selectedTrader.traderProfile && (
                <div className="space-y-4 pt-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Subscription Details
                  </h5>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="text-[11px] text-gray-400 dark:text-gray-500">Subscription Tier</span>
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1 mt-0.5">
                        ⭐ {selectedTrader.traderProfile.subscriptionTier || "FREE"}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[11px] text-gray-400 dark:text-gray-500">Status</span>
                      <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-0.5">
                        {selectedTrader.traderProfile.subscriptionStatus || "N/A"}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[11px] text-gray-400 dark:text-gray-500">Start Date</span>
                      <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                        {formatDate(selectedTrader.traderProfile.subscriptionStartDate)}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[11px] text-gray-400 dark:text-gray-500">End Date</span>
                      <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                        {formatDate(selectedTrader.traderProfile.subscriptionEndDate)}
                      </span>
                    </div>

                    {selectedTrader.traderProfile.trialEndsAt && (
                      <div className="flex flex-col col-span-2">
                        <span className="text-[11px] text-gray-400 dark:text-gray-500">Trial Period Ends At</span>
                        <span className="text-xs font-semibold text-amber-600 dark:text-orange-400">
                          {formatDate(selectedTrader.traderProfile.trialEndsAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Uploads Documents */}
              {selectedTrader.traderProfile?.document && (
                <div className="space-y-3 pt-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Business Documentation
                  </h5>

                  <a
                    href={selectedTrader.traderProfile.document}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-800 text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/[0.03] text-xs font-semibold rounded-lg transition-colors w-full justify-center"
                  >
                    <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Vetting Document
                  </a>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex-shrink-0 flex flex-col gap-3 bg-gray-50/50 dark:bg-gray-950/20">
              {selectedTrader.traderProfile && (
                <div className="flex gap-2 w-full">
                  {(selectedTrader.traderProfile.verificationStatus === "PENDING" ||
                    selectedTrader.traderProfile.verificationStatus === "REJECTED") && (
                    <button
                      onClick={() => handleVerifyApprove(selectedTrader.id)}
                      disabled={isVerifying}
                      className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      Approve
                    </button>
                  )}

                  {(selectedTrader.traderProfile.verificationStatus === "PENDING" ||
                    selectedTrader.traderProfile.verificationStatus === "APPROVED") && (
                    <button
                      onClick={() => handleVerifyRejectOpen(selectedTrader.id)}
                      disabled={isVerifying}
                      className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                      Reject
                    </button>
                  )}
                </div>
              )}
              <button
                onClick={() => setSelectedTrader(null)}
                className="w-full py-2.5 bg-white hover:bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03] border border-gray-200 dark:border-gray-750 font-bold rounded-lg text-xs transition-colors cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal Popup */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 flex flex-col gap-4 mx-4 animate-zoom-in">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                Reject Trader Verification
              </h4>
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="text-gray-400 hover:text-gray-650 dark:hover:text-white"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Reason for Rejection
              </label>
              <textarea
                rows={4}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Invalid business registration documents, expired insurance coverage, etc."
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-850 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors"
              />
              <p className="text-[10px] text-gray-400 dark:text-gray-500">
                This reason will be shared with the trader to help them rectify and re-apply.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                disabled={isVerifying}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/5 border border-gray-200 dark:border-gray-750 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyRejectSubmit}
                disabled={isVerifying}
                className="px-4 py-2 text-xs font-bold text-white bg-red-650 hover:bg-red-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {isVerifying && (
                  <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                Submit Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
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
              className="text-gray-400 hover:text-gray-650 dark:hover:text-white transition-colors cursor-pointer"
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
