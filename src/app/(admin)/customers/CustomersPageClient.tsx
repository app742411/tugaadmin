"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import { useGetCustomers } from "@/hooks/useCustomers";
import { CustomerItem } from "@/types/customer.types";
import Select from "@/components/ui/select/Select";
import Link from "next/link";
import { MoreDotIcon } from "@/icons";

export default function CustomersPageClient() {
  // Query parameters state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState<string>("--");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Side drawer state for customer details inspection
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);

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

  // Fetch customers data via custom hook
  const queryParams = useMemo(() => {
    return {
      page,
      limit,
      status: status === "--" ? undefined : status,
      search: debouncedSearch || undefined,
    };
  }, [page, limit, status, debouncedSearch]);

  const { data, isLoading, error } = useGetCustomers(queryParams);

  const customersList = data?.data || [];
  const paginationInfo = data?.pagination || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
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

  // Format creation dates nicely
  const formatDate = (dateString: string) => {
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
          <PageBreadcrumb pageTitle="Customer Management" />
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 ml-0.5">
            Overview, view, and inspect all registered customers
          </p>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="p-5 mb-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Search Box */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Search Customers
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
                placeholder="Search by name or email..."
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

          {/* Spacer for desktops */}
          <div className="hidden lg:block"></div>

          {/* Results summary / Quick action */}
          <div className="flex justify-start sm:justify-end text-xs text-gray-400 dark:text-gray-500 sm:pb-2">
            {isLoading ? (
              <span>Loading results...</span>
            ) : (
              <span>Found {paginationInfo.total} customer{paginationInfo.total === 1 ? "" : "s"}</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-sm flex flex-col">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[900px] w-full">
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
                    Phone
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-4 font-bold text-gray-600 text-start text-xs uppercase tracking-wider dark:text-gray-400"
                  >
                    Location
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-4 font-bold text-gray-600 text-center text-xs uppercase tracking-wider dark:text-gray-400"
                  >
                    Status
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
                        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-24 animate-pulse" />
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-32 animate-pulse" />
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
                    <TableCell colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center max-w-md mx-auto">
                        <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-500 dark:text-red-400 rounded-full mb-3">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Failed to fetch customers</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{error}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : customersList.length === 0 ? (
                  // Empty state
                  <TableRow>
                    <TableCell colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                        <div className="p-4 bg-gray-50 dark:bg-gray-950/40 text-gray-400 dark:text-gray-600 rounded-full mb-4">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">No Customers Found</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          We couldn't find any customers matching your filters or search term. Try expanding your parameters.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  // Data state
                  customersList.map((customer) => {
                    const initials = getInitials(customer.fullName);
                    const avatarColorClass = getAvatarBg(customer.fullName);
                    const location = [customer.city, customer.country].filter(Boolean).join(", ") || "N/A";

                    return (
                      <TableRow
                        key={customer.id}
                        onClick={() => setSelectedCustomer(customer)}
                        className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors border-b border-gray-100 dark:border-gray-800/80 cursor-pointer"
                      >
                        {/* Name and avatar info */}
                        <TableCell className="px-6 py-3.5 text-start">
                          <div className="flex items-center gap-3">
                            {customer.profileImage ? (
                              <div className="w-10 h-10 overflow-hidden rounded-full border border-gray-100 dark:border-gray-800">
                                <img
                                  src={customer.profileImage}
                                  alt={customer.fullName}
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
                                {customer.fullName}
                              </span>
                              <span className="text-gray-400 dark:text-gray-500 text-xs">
                                {customer.email}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Phone */}
                        <TableCell className="px-6 py-3.5 text-start text-gray-600 dark:text-gray-400 text-sm font-medium">
                          {customer.phone || (
                            <span className="text-gray-300 dark:text-gray-600 italic">No phone</span>
                          )}
                        </TableCell>

                        {/* Location */}
                        <TableCell className="px-6 py-3.5 text-start text-gray-600 dark:text-gray-400 text-sm">
                          {location}
                        </TableCell>

                        {/* Status badge */}
                        <TableCell className="px-6 py-3.5 text-center">
                          <Badge
                            size="sm"
                            color={getStatusColor(customer.status)}
                            variant="light"
                          >
                            {customer.status}
                          </Badge>
                        </TableCell>

                        {/* Created Date */}
                        <TableCell className="px-6 py-3.5 text-start text-gray-600 dark:text-gray-400 text-sm font-medium">
                          {formatDate(customer.createdAt)}
                        </TableCell>

                        {/* Actions */}
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

        {/* Reusable Global Pagination */}
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

      {/* Premium Inspect Slide-over Drawer / Modal backdrop */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-[1000] flex justify-end bg-black/40 backdrop-blur-xs transition-opacity duration-300">
          {/* Modal Backdrop Click area */}
          <div
            className="absolute inset-0 cursor-default"
            onClick={() => setSelectedCustomer(null)}
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-md bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col animate-slide-left z-10 border-l border-gray-100 dark:border-gray-800">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Customer Details
              </h3>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Profile Card Summary */}
              <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-950/20 border border-gray-100 dark:border-gray-800/80">
                {selectedCustomer.profileImage ? (
                  <img
                    src={selectedCustomer.profileImage}
                    alt={selectedCustomer.fullName}
                    className="w-16 h-16 rounded-full border border-gray-200 dark:border-gray-700 object-cover mb-3"
                  />
                ) : (
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg mb-3 ${getAvatarBg(
                      selectedCustomer.fullName
                    )}`}
                  >
                    {getInitials(selectedCustomer.fullName)}
                  </div>
                )}
                <h4 className="text-base font-bold text-gray-850 dark:text-white">
                  {selectedCustomer.fullName}
                </h4>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {selectedCustomer.email}
                </p>

                <div className="mt-4 flex gap-2">
                  <Badge color={getStatusColor(selectedCustomer.status)} size="sm">
                    {selectedCustomer.status}
                  </Badge>
                  {selectedCustomer.isVerified ? (
                    <Badge color="success" size="sm">
                      Verified Account
                    </Badge>
                  ) : (
                    <Badge color="warning" size="sm">
                      Unverified
                    </Badge>
                  )}
                </div>
              </div>

              {/* Information Sections */}
              <div className="space-y-4">
                <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Account Details
                </h5>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-[11px] text-gray-400 dark:text-gray-500">
                      Customer ID
                    </span>
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 break-all select-all font-mono">
                      {selectedCustomer.id}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] text-gray-400 dark:text-gray-500">
                      System Role
                    </span>
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                      {selectedCustomer.role}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] text-gray-400 dark:text-gray-500">
                      Joined Date
                    </span>
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                      {formatDate(selectedCustomer.createdAt)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] text-gray-400 dark:text-gray-500">
                      Last Updated
                    </span>
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                      {formatDate(selectedCustomer.updatedAt)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] text-gray-400 dark:text-gray-500">
                      Terms Accepted
                    </span>
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                      {selectedCustomer.acceptedTerms ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] text-gray-400 dark:text-gray-500">
                      Phone Number
                    </span>
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                      {selectedCustomer.phone || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Address / Location Section */}
              <div className="space-y-4 pt-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Address & Location
                </h5>

                <div className="space-y-3">
                  <div className="flex flex-col">
                    <span className="text-[11px] text-gray-400 dark:text-gray-500">
                      Street Address
                    </span>
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                      {selectedCustomer.addressLine || "N/A"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="text-[11px] text-gray-400 dark:text-gray-500">
                        City
                      </span>
                      <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                        {selectedCustomer.city || "N/A"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] text-gray-400 dark:text-gray-500">
                        State/Region
                      </span>
                      <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                        {selectedCustomer.state || "N/A"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] text-gray-400 dark:text-gray-500">
                        Country
                      </span>
                      <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                        {selectedCustomer.country || "N/A"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] text-gray-400 dark:text-gray-500">
                        Postal Code
                      </span>
                      <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                        {selectedCustomer.postalCode || "N/A"}
                      </span>
                    </div>
                  </div>

                  {(selectedCustomer.latitude || selectedCustomer.longitude) && (
                    <div className="flex flex-col">
                      <span className="text-[11px] text-gray-400 dark:text-gray-500">
                        GPS Coordinates
                      </span>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${selectedCustomer.latitude},${selectedCustomer.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-brand-500 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {selectedCustomer.latitude}, {selectedCustomer.longitude}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex-shrink-0 flex gap-3 bg-gray-50/50 dark:bg-gray-950/20">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-full py-2.5 bg-white hover:bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03] border border-gray-200 dark:border-gray-750 font-bold rounded-lg text-xs transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
