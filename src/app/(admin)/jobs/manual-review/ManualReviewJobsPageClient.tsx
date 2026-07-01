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
import { useGetManualReviewJobs, useAssignManualReviewTraders, useGetSuggestedTraders } from "@/hooks/useJobs";
import { JobItem } from "@/types/job.types";
import Link from "next/link";
import { MoreDotIcon } from "@/icons";

export default function ManualReviewJobsPageClient() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState<string>("--");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);

  const [traderSearch, setTraderSearch] = useState("");
  const [selectedTraderIds, setSelectedTraderIds] = useState<string[]>([]);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);
  const assignMutation = useAssignManualReviewTraders();

  // Reset states when selectedJob changes
  useEffect(() => {
    setTraderSearch("");
    setSelectedTraderIds([]);
    setAssignError(null);
    setAssignSuccess(null);
  }, [selectedJob]);

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

  // Calls useGetManualReviewJobs query
  const { data, isLoading, error, refetch } = useGetManualReviewJobs(queryParams);

  const jobsList = data?.data || [];
  const paginationInfo = data?.pagination || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  };

  // Fetch suggested traders for selection
  const { data: suggestedTraders, isLoading: isLoadingSuggested } = useGetSuggestedTraders(
    selectedJob?.id || "",
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
    if (!selectedJob) return;
    setAssignError(null);
    setAssignSuccess(null);

    if (selectedTraderIds.length === 0) {
      setAssignError("Please select at least one trader.");
      return;
    }

    try {
      await assignMutation.mutateAsync({
        jobId: selectedJob.id,
        traderIds: selectedTraderIds,
      });
      setAssignSuccess("Job distributed to traders successfully!");
      setSelectedTraderIds([]);
      setTraderSearch("");
      setTimeout(() => {
        setSelectedJob(null);
        setAssignSuccess(null);
        refetch();
      }, 1500);
    } catch (err: any) {
      setAssignError(err.message || "Failed to distribute job.");
    }
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

  const formatBudgetRange = (budgetVal: string) => {
    if (!budgetVal) return "N/A";
    const clean = budgetVal.replace(/_/g, " ").toLowerCase();
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  };

  const getBaseUrl = () => {
    return process.env.NEXT_PUBLIC_API_URL || "";
  };

  return (
    <div className="w-full pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <PageBreadcrumb pageTitle="Manual Review Jobs" />
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 ml-0.5">
            View and inspect posted client jobs flagged for manual admin distribution review.
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
            placeholder="Search manual review jobs..."
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
                { value: "--", label: "All Jobs" },
                { value: "POSTED", label: "Posted" },
                { value: "IN_PROGRESS", label: "In Progress" },
                { value: "COMPLETED", label: "Completed" },
                { value: "CANCELLED", label: "Cancelled" },
              ]}
              value={status}
              onChange={setStatus}
            />
          </div>
        </div>
      </div>

      {/* Table grid */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-55/40 dark:bg-gray-950/20 border-b border-gray-100 dark:border-gray-800/80">
                <TableCell className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-400 text-start">Job Title</TableCell>
                <TableCell className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-400 text-start">Customer</TableCell>
                <TableCell className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-400 text-start">Category</TableCell>
                <TableCell className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-400 text-start">Budget & Timescale</TableCell>
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
                    <h4 className="text-sm font-semibold">Failed to fetch manual review jobs</h4>
                    <p className="text-xs mt-1">{error}</p>
                  </TableCell>
                </TableRow>
              ) : jobsList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="px-6 py-16 text-center text-gray-400">
                    <p className="text-xs font-semibold">No Manual Review Jobs Found</p>
                  </TableCell>
                </TableRow>
              ) : (
                jobsList.map((job) => (
                  <TableRow
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors border-b border-gray-100 dark:border-gray-800/80 cursor-pointer"
                  >
                    <TableCell className="px-6 py-3.5 text-start">
                      <div className="flex flex-col">
                        <Link
                          href={`/jobs/${job.id}`}
                          className="font-semibold text-brand-500 hover:underline text-xs truncate max-w-[200px]"
                        >
                          {job.title}
                        </Link>
                        <span className="text-[10px] text-gray-400 font-mono mt-0.5 truncate max-w-[160px] select-all">ID: {job.id}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-3.5 text-start">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-800 dark:text-gray-250 text-xs">{job.customer?.fullName || "Unknown"}</span>
                        <span className="text-[10px] text-gray-400">{job.customer?.email || "No email"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-3.5 text-start">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-250">{job.category?.name || "N/A"}</span>
                        <span className="text-[10px] text-gray-450 dark:text-gray-500">{job.subCategory?.name || "N/A"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-3.5 text-start">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-850 dark:text-gray-200">{formatBudgetRange(job.budgetRange)}</span>
                        <span className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1.5">
                          {job.emergency && <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />}
                          {job.timescale}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-3.5 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <Badge size="sm" color={getStatusColor(job.status)}>{job.status}</Badge>
                        <Badge size="sm" color={getDistributionColor(job.distributionStatus)} variant="light">{job.distributionStatus}</Badge>
                      </div>
                    </TableCell>
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {!isLoading && !error && jobsList.length > 0 && (
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

      {/* Inspection Drawer */}
      {selectedJob && (
        <div className="fixed inset-0 z-[1000] flex justify-end bg-black/40 backdrop-blur-xs transition-opacity duration-300">
          <div className="absolute inset-0 cursor-default" onClick={() => setSelectedJob(null)} />

          <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col z-10 border-l border-gray-150 dark:border-gray-800">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-150 dark:border-gray-800 flex-shrink-0">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Job Manual Inspection</h3>
              <button
                onClick={() => setSelectedJob(null)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              <div className="pb-4 border-b border-gray-100 dark:border-gray-850">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-base font-bold text-gray-900 dark:text-white leading-snug">{selectedJob.title}</h4>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <Badge color={getStatusColor(selectedJob.status)}>{selectedJob.status}</Badge>
                    {selectedJob.emergency && <Badge color="error" size="sm">Emergency</Badge>}
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 font-mono select-all mt-2">Job ID: {selectedJob.id}</p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Job Description</span>
                <p className="text-xs text-gray-650 dark:text-gray-300 leading-relaxed bg-gray-55/50 dark:bg-gray-950/20 p-4 rounded-xl border border-gray-100 dark:border-gray-850">
                  {selectedJob.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-2">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Trades Category</span>
                  <span className="text-xs font-bold text-gray-855 mt-1 block">{selectedJob.category?.name || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Skill Service / Sub</span>
                  <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-1 block">
                    {selectedJob.skillService?.name || "N/A"}
                    {selectedJob.subCategory?.name && ` (${selectedJob.subCategory.name})`}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Budget Range</span>
                  <span className="text-xs font-bold text-brand-500 mt-1 block">{formatBudgetRange(selectedJob.budgetRange)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Timescale</span>
                  <span className="text-xs font-semibold text-gray-850 dark:text-gray-200 mt-1 block">{selectedJob.timescale}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Coordinates / Postcode</span>
                  {selectedJob.latitude && selectedJob.longitude ? (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${selectedJob.latitude},${selectedJob.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-brand-500 hover:underline inline-flex items-center gap-1 mt-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {selectedJob.postcode || `${selectedJob.latitude}, ${selectedJob.longitude}`}
                    </a>
                  ) : (
                    <span className="text-xs font-semibold text-gray-850 mt-1 block">N/A</span>
                  )}
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Post Date</span>
                  <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 mt-1 block">
                    Posted: {formatDate(selectedJob.createdAt)}
                  </span>
                </div>
              </div>

              {/* Customer */}
              <div className="p-4 bg-gray-50/50 dark:bg-gray-950/20 border border-gray-150 dark:border-gray-800 rounded-xl space-y-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Customer Details</span>
                <div className="flex flex-col gap-1 text-xs">
                  <div>
                    <span className="text-gray-400">Name: </span>
                    <Link href={`/customers/${selectedJob.customerId}`} className="font-semibold text-brand-500 hover:underline">
                      {selectedJob.customer?.fullName || "N/A"}
                    </Link>
                  </div>
                  <div>
                    <span className="text-gray-400">Email: </span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedJob.customer?.email || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Phone: </span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedJob.customer?.phone || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Selected Trader Info if available */}
              {selectedJob.selectedTrader && (
                <div className="p-4 bg-gray-50/50 dark:bg-gray-950/20 border border-gray-150 dark:border-gray-800 rounded-xl space-y-3">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Assigned Trader Details</span>
                  <div className="flex flex-col gap-1 text-xs">
                    <div>
                      <span className="text-gray-400">Name: </span>
                      <Link href={`/traders/${selectedJob.selectedTraderId}`} className="font-semibold text-brand-500 hover:underline">
                        {selectedJob.selectedTrader.fullName}
                      </Link>
                    </div>
                    <div>
                      <span className="text-gray-400">Email: </span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedJob.selectedTrader.email}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Attachments */}
              {selectedJob.attachments && selectedJob.attachments.length > 0 && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Job Attachments</span>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedJob.attachments.map((attach) => {
                      const fileUrl = attach.file.startsWith("http") ? attach.file : `${getBaseUrl()}/${attach.file}`;
                      return (
                        <div key={attach.id} className="border border-gray-150 dark:border-gray-850 rounded-xl p-3 flex flex-col items-center justify-center bg-gray-55/10 dark:bg-gray-950/20 text-center">
                          <img
                            src={fileUrl}
                            alt="Job Attachment"
                            className="max-h-28 object-contain rounded-lg mb-2 border border-gray-100"
                            onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                          />
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] font-bold text-brand-500 hover:underline truncate w-full"
                          >
                            View Attachment
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {/* Manual Review Trader Assignment Form */}
              {selectedJob.distributionStatus === "MANUAL_REVIEW" && (
                <div className="p-4 bg-gray-50/50 dark:bg-gray-950/20 border border-gray-150 dark:border-gray-850 rounded-xl space-y-3 pt-4">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Distribute to Traders</span>
                  <form onSubmit={handleAssignTraders} className="space-y-3">
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Search and select active traders to manually distribute this job.
                    </p>

                    {/* Trader Search Box */}
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
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-250 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-950/25 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition"
                      />
                    </div>

                    {/* Trader Checkbox List */}
                    <div className="max-h-48 overflow-y-auto border border-gray-150 dark:border-gray-800 rounded-xl divide-y divide-gray-100 dark:divide-gray-850 bg-white dark:bg-gray-950/10">
                      {isLoadingSuggested ? (
                        <div className="p-3 text-center text-xs text-gray-400">Loading suggested traders...</div>
                      ) : filteredSuggestedTraders.length === 0 ? (
                        <div className="p-3 text-center text-xs text-gray-400">No suggested traders found.</div>
                      ) : (
                        filteredSuggestedTraders.map((trader) => (
                          <label
                            key={trader.traderId}
                            className="flex items-center gap-3 p-2.5 hover:bg-gray-50/55 dark:hover:bg-gray-800/10 cursor-pointer text-xs text-gray-800 dark:text-gray-200 select-none"
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
                                <span className="font-semibold truncate">{trader.fullName}</span>
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
              )}
            </div>

            <div className="p-6 border-t border-gray-150 dark:border-gray-800 flex-shrink-0 bg-gray-50/50 dark:bg-gray-950/20 flex gap-3">
              <Link
                href={`/jobs/${selectedJob.id}`}
                className="flex-1 inline-flex items-center justify-center py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs transition shadow-xs"
              >
                View Full Details
              </Link>
              <button
                onClick={() => setSelectedJob(null)}
                className="flex-1 py-2.5 bg-white hover:bg-gray-50 text-gray-755 dark:bg-gray-800 dark:text-gray-350 dark:hover:bg-white/[0.03] border border-gray-200 dark:border-gray-750 font-bold rounded-xl text-xs transition"
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
