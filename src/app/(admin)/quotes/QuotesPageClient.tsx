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
import Select from "@/components/ui/select/Select";
import { useGetQuotes } from "@/hooks/useQuotes";
import Link from "next/link";
import { MoreDotIcon } from "@/icons";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { QuoteItem } from "@/types/quote.types";

export default function QuotesPageClient() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState<string>("--");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedQuote, setSelectedQuote] = useState<QuoteItem | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Debounce search input
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
      status: status === "--" ? undefined : status,
      search: debouncedSearch || undefined,
    };
  }, [page, limit, status, debouncedSearch]);

  const { data, isLoading, error } = useGetQuotes(queryParams);

  const quotesList = data?.data || [];
  const paginationInfo = data?.pagination || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  };

  const getStatusColor = (statusVal: string): "success" | "warning" | "error" | "info" | "light" => {
    switch (statusVal) {
      case "ACCEPTED":
        return "success";
      case "REJECTED":
        return "error";
      case "PENDING":
        return "warning";
      default:
        return "light";
    }
  };

  const formatDate = (dateString: string | null) => {
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
          <PageBreadcrumb pageTitle="Quotes Management" />
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 ml-0.5">
            Monitor, inspect, and track quotes.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xs">
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search quotes by keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 dark:border-gray-850 rounded-xl bg-gray-55/10 dark:bg-gray-950/20 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Status:</span>
          <div className="w-40">
            <Select
              options={[
                { value: "--", label: "All Quotes" },
                { value: "ACCEPTED", label: "Accepted" },
                { value: "REJECTED", label: "Rejected" },
                { value: "PENDING", label: "Pending" },
              ]}
              value={status}
              onChange={setStatus}
            />
          </div>
        </div>
      </div>

      {/* Quotes Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-55/40 dark:bg-gray-950/20 border-b border-gray-100 dark:border-gray-800/80">
                <TableCell className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-400 text-start">Job</TableCell>
                <TableCell className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-400 text-start">Trader</TableCell>
                <TableCell className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-400 text-start">Price / Days</TableCell>
                <TableCell className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-400 text-start">Customer</TableCell>
                <TableCell className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-400 text-center">Status</TableCell>
                <TableCell className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-400 text-center">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell colSpan={6} className="px-6 py-4.5 text-center">
                      <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse w-full"></div>
                    </TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} className="px-6 py-10 text-center text-red-500">
                    <h4 className="text-sm font-semibold">Failed to fetch quotes</h4>
                    <p className="text-xs mt-1">{error}</p>
                  </TableCell>
                </TableRow>
              ) : quotesList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="px-6 py-16 text-center text-gray-400">
                    <p className="text-xs font-semibold">No Quotes Found</p>
                  </TableCell>
                </TableRow>
              ) : (
                quotesList.map((quote) => (
                  <TableRow key={quote.id} onClick={() => setSelectedQuote(quote)} className="cursor-pointer hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors border-b border-gray-100 dark:border-gray-800/80">
                    {/* Job Title / ID */}
                    <TableCell className="px-6 py-3.5 text-start">
                      <div className="flex flex-col">
                        <span
                          className="font-semibold text-brand-500 text-xs truncate max-w-[200px]"
                        >
                          {quote.job?.title || "N/A"}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono mt-0.5 truncate max-w-[160px] select-all">
                          ID: {quote.jobId}
                        </span>
                      </div>
                    </TableCell>

                    {/* Trader */}
                    <TableCell className="px-6 py-3.5 text-start">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-800 dark:text-gray-250 text-xs">
                          {quote.trader?.fullName || "Unknown"}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {quote.trader?.email || "No email"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Price / Days */}
                    <TableCell className="px-6 py-3.5 text-start">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-250">
                          ${quote.price}
                        </span>
                        <span className="text-[10px] text-gray-450 dark:text-gray-500">
                          {quote.estimatedDays} days
                        </span>
                      </div>
                    </TableCell>

                    {/* Customer */}
                    <TableCell className="px-6 py-3.5 text-start">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-850 dark:text-gray-200">
                           {quote.job?.customer?.fullName || "N/A"}
                        </span>
                        <span className="text-[10px] text-gray-400 mt-0.5">
                           {quote.job?.customer?.email || "N/A"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell className="px-6 py-3.5 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <Badge size="sm" color={getStatusColor(quote.status)}>
                          {quote.status}
                        </Badge>
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-6 py-3.5 text-center">
                      <div className="relative inline-block text-left">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(openDropdownId === quote.id ? null : quote.id);
                          }}
                          className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        >
                          <MoreDotIcon />
                        </button>

                        <Dropdown
                          isOpen={openDropdownId === quote.id}
                          onClose={() => setOpenDropdownId(null)}
                          className="w-48 right-0 top-full z-50 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg p-2"
                        >
                          <div onClick={(e) => e.stopPropagation()} className="flex flex-col gap-1">
                            <DropdownItem
                              onItemClick={() => {
                                setOpenDropdownId(null);
                                setSelectedQuote(quote);
                              }}
                              className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            >
                              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Quick Details
                            </DropdownItem>

                            <div className="h-px bg-gray-100 dark:bg-gray-800 my-1 mx-2" />

                            <DropdownItem
                              onItemClick={() => setOpenDropdownId(null)}
                              className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete Quote
                            </DropdownItem>
                          </div>
                        </Dropdown>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {!isLoading && !error && quotesList.length > 0 && (
        <Pagination
          currentPage={paginationInfo.page}
          totalPages={paginationInfo.totalPages}
          totalItems={paginationInfo.total}
          limit={paginationInfo.limit}
          onPageChange={setPage}
          onLimitChange={(l) => {
            setLimit(l);
            setPage(1);
          }}
        />
      )}

      {/* Slide-over Inspection Drawer */}
      {selectedQuote && (
        <div className="fixed inset-0 z-[1000] flex justify-end bg-black/40 backdrop-blur-xs transition-opacity duration-300">
          <div className="absolute inset-0 cursor-default" onClick={() => setSelectedQuote(null)} />
          
          <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col z-10 border-l border-gray-150 dark:border-gray-800">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-150 dark:border-gray-800 flex-shrink-0">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Quote Inspection Details
              </h3>
              <button
                onClick={() => setSelectedQuote(null)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Quote Title and status badges */}
              <div className="pb-4 border-b border-gray-100 dark:border-gray-850">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-base font-bold text-gray-900 dark:text-white leading-snug">
                    Quote for Job: {selectedQuote.job?.title || "N/A"}
                  </h4>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <Badge color={getStatusColor(selectedQuote.status)}>
                      {selectedQuote.status}
                    </Badge>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 font-mono select-all mt-2">Quote ID: {selectedQuote.id}</p>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Message</span>
                <p className="text-xs text-gray-650 dark:text-gray-300 leading-relaxed bg-gray-50/50 dark:bg-gray-950/20 p-4 rounded-xl border border-gray-100 dark:border-gray-850 whitespace-pre-wrap">
                  {selectedQuote.message || "No message provided."}
                </p>
              </div>

              {/* Quote details Info */}
              <div className="grid grid-cols-2 gap-6 pt-2">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Price</span>
                  <span className="text-xs font-bold text-gray-850 dark:text-gray-250 mt-1 block">
                    ${selectedQuote.price}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Estimated Days</span>
                  <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-1 block">
                    {selectedQuote.estimatedDays} days
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Created At</span>
                  <span className="text-xs font-semibold text-gray-800 mt-1 block">
                    {formatDate(selectedQuote.createdAt)}
                  </span>
                </div>
                 <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Updated At</span>
                  <span className="text-xs font-semibold text-gray-800 mt-1 block">
                    {formatDate(selectedQuote.updatedAt)}
                  </span>
                </div>
              </div>

              {/* Trader Info */}
              <div className="p-4 bg-gray-50/50 dark:bg-gray-950/20 border border-gray-150 dark:border-gray-800 rounded-xl space-y-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Trader Details</span>
                <div className="flex flex-col gap-1 text-xs">
                  <div>
                    <span className="text-gray-400">Name: </span>
                    <Link href={`/traders/${selectedQuote.traderId}`} className="font-semibold text-brand-500 hover:underline">
                      {selectedQuote.trader?.fullName || "N/A"}
                    </Link>
                  </div>
                  <div>
                    <span className="text-gray-400">Email: </span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedQuote.trader?.email || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Phone: </span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedQuote.trader?.phone || "N/A"}</span>
                  </div>
                </div>
              </div>

               {/* Job Info */}
              <div className="p-4 bg-gray-50/50 dark:bg-gray-950/20 border border-gray-150 dark:border-gray-800 rounded-xl space-y-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Job Details</span>
                <div className="flex flex-col gap-1 text-xs">
                  <div>
                    <span className="text-gray-400">Job Title: </span>
                    <Link href={`/jobs/${selectedQuote.jobId}`} className="font-semibold text-brand-500 hover:underline">
                      {selectedQuote.job?.title || "N/A"}
                    </Link>
                  </div>
                  <div>
                    <span className="text-gray-400">Budget Range: </span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedQuote.job?.budgetRange || "N/A"}</span>
                  </div>
                   <div>
                    <span className="text-gray-400">Customer: </span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedQuote.job?.customer?.fullName || "N/A"}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Drawer Footer */}
            <div className="p-6 border-t border-gray-150 dark:border-gray-800 flex-shrink-0 bg-gray-50/50 dark:bg-gray-950/20 flex gap-3">
              <button
                onClick={() => setSelectedQuote(null)}
                className="flex-1 py-2.5 bg-white hover:bg-gray-50 text-gray-750 dark:bg-gray-800 dark:text-gray-350 dark:hover:bg-white/[0.03] border border-gray-200 dark:border-gray-750 font-bold rounded-xl text-xs transition"
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
