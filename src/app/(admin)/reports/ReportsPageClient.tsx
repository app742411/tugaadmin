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
import { useGetReports, useUpdateReportStatus } from "@/hooks/useReports";
import { ReportItem } from "@/types/report.types";
import Link from "next/link";
import { MoreDotIcon } from "@/icons";
import { useRouter } from "next/navigation";

export default function ReportsPageClient() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState<string>("--");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const router = useRouter();
  
  const updateStatusMutation = useUpdateReportStatus();
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Reset drawer states when selectedReport changes
  useEffect(() => {
    setActionError(null);
    setActionSuccess(null);
  }, [selectedReport]);

  const queryParams = useMemo(() => {
    return {
      page,
      limit,
      status: status === "--" ? undefined : status,
      search: debouncedSearch || undefined,
    };
  }, [page, limit, status, debouncedSearch]);

  const { data, isLoading, error, refetch } = useGetReports(queryParams);

  const reportsList = data?.data || [];
  const totalItems = data?.total || 0;
  const totalPages = Math.ceil(totalItems / limit);

  const paginationInfo = {
    total: totalItems,
    page,
    limit,
    totalPages,
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

  const handleUpdateStatus = async (reportId: string, newStatus: "REVIEWED" | "RESOLVED" | "REJECTED") => {
    setActionError(null);
    setActionSuccess(null);
    try {
      await updateStatusMutation.mutateAsync({ reportId, status: newStatus });
      setActionSuccess(`Report status updated to ${newStatus} successfully!`);
      // Update selected report details client-side
      if (selectedReport && selectedReport.id === reportId) {
        setSelectedReport((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            status: newStatus,
            reviewedAt: new Date().toISOString(),
          };
        });
      }
      setTimeout(() => {
        refetch();
      }, 1000);
    } catch (err: any) {
      setActionError(err.message || "Failed to update report status.");
    }
  };

  return (
    <div className="w-full pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <PageBreadcrumb pageTitle="Reports Management" />
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 ml-0.5">
            Monitor and resolve spam, abuse, or content flags on Tuga Trades.
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
            placeholder="Search reports by reason or reporter..."
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
                { value: "--", label: "All Statuses" },
                { value: "PENDING", label: "Pending" },
                { value: "REVIEWED", label: "Reviewed" },
                { value: "RESOLVED", label: "Resolved" },
                { value: "REJECTED", label: "Rejected" },
              ]}
              value={status}
              onChange={setStatus}
            />
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-55/40 dark:bg-gray-950/20 border-b border-gray-100 dark:border-gray-800/80">
                <TableCell className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-400 text-start">Reporter</TableCell>
                <TableCell className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-400 text-start">Report Type</TableCell>
                <TableCell className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-400 text-start">Reason</TableCell>
                <TableCell className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-400 text-start">Custom Comment</TableCell>
                <TableCell className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-400 text-center">Status</TableCell>
                <TableCell className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-400 text-center">Created At</TableCell>
                <TableCell className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-400 text-center">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell colSpan={7} className="px-6 py-4.5 text-center">
                      <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse w-full"></div>
                    </TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-6 py-10 text-center text-red-500">
                    <h4 className="text-sm font-semibold">Failed to fetch reports</h4>
                    <p className="text-xs mt-1">{error}</p>
                  </TableCell>
                </TableRow>
              ) : reportsList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-6 py-16 text-center text-gray-400">
                    <p className="text-xs font-semibold">No Reports Found</p>
                  </TableCell>
                </TableRow>
              ) : (
                reportsList.map((report) => (
                  <TableRow
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors border-b border-gray-100 dark:border-gray-800/80 cursor-pointer"
                  >
                    {/* Reporter */}
                    <TableCell className="px-6 py-3.5 text-start">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-850 dark:text-white/90 text-xs">
                          {report.reporter?.fullName || "System / Unknown"}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {report.reporter?.email || "N/A"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Report Type */}
                    <TableCell className="px-6 py-3.5 text-start">
                      <Badge size="xs" color={getTypeColor(report.reportType)}>
                        {report.reportType}
                      </Badge>
                    </TableCell>

                    {/* Reason */}
                    <TableCell className="px-6 py-3.5 text-start">
                      <Badge size="xs" color={getReasonColor(report.reason)} variant="light">
                        {report.reason}
                      </Badge>
                    </TableCell>

                    {/* Comment */}
                    <TableCell className="px-6 py-3.5 text-start">
                      <span className="text-xs text-gray-600 dark:text-gray-300 truncate max-w-[220px] block">
                        {report.customReason || "—"}
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="px-6 py-3.5 text-center">
                      <Badge size="xs" color={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                    </TableCell>

                    {/* Created At */}
                    <TableCell className="px-6 py-3.5 text-center text-[10px] font-mono text-gray-450 dark:text-gray-400">
                      {formatDate(report.createdAt)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-6 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Open an action menu in the future
                          }}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:text-gray-200 dark:hover:bg-white/[0.05] transition-colors shrink-0"
                        >
                          <MoreDotIcon />
                        </button>
                        {report.status !== "RESOLVED" && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleUpdateStatus(report.id, "RESOLVED")}
                              disabled={updateStatusMutation.isPending}
                              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold rounded-lg text-[10px] transition shrink-0"
                              title="Resolve Report"
                            >
                              Resolve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(report.id, "REJECTED")}
                              disabled={updateStatusMutation.isPending}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-105 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 font-bold rounded-lg text-[10px] transition shrink-0"
                              title="Reject Report"
                            >
                              Reject
                            </button>
                          </div>
                        )}
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
      {!isLoading && !error && reportsList.length > 0 && (
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
      {selectedReport && (
        <div className="fixed inset-0 z-[1000] flex justify-end bg-black/40 backdrop-blur-xs transition-opacity duration-300">
          <div className="absolute inset-0 cursor-default" onClick={() => setSelectedReport(null)} />
          
          <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col z-10 border-l border-gray-150 dark:border-gray-800">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-150 dark:border-gray-800 flex-shrink-0">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Report Inspection
              </h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-gray-650 dark:hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Type and Status Header */}
              <div className="pb-4 border-b border-gray-100 dark:border-gray-850 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge color={getTypeColor(selectedReport.reportType)}>
                    {selectedReport.reportType} REPORT
                  </Badge>
                  <Badge color={getReasonColor(selectedReport.reason)} variant="light">
                    {selectedReport.reason}
                  </Badge>
                </div>
                <Badge color={getStatusColor(selectedReport.status)}>
                  {selectedReport.status}
                </Badge>
              </div>

              {/* Custom comment description */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-450 uppercase tracking-wider block">Admin Reason / Comment</span>
                <p className="text-xs text-gray-650 dark:text-gray-300 leading-relaxed bg-gray-55/10 dark:bg-gray-950/20 p-4 rounded-xl border border-gray-100 dark:border-gray-850">
                  {selectedReport.customReason || "No additional custom comment was provided."}
                </p>
              </div>

              {/* Card: Reporter Profile */}
              <div className="p-4 bg-gray-50/50 dark:bg-gray-950/20 border border-gray-150 dark:border-gray-800 rounded-xl space-y-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Reporter Details</span>
                <div className="flex flex-col gap-1 text-xs">
                  <div>
                    <span className="text-gray-400">Name: </span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {selectedReport.reporter?.fullName || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Email: </span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200 select-all">
                      {selectedReport.reporter?.email || "N/A"}
                    </span>
                  </div>
                  {selectedReport.reporterId && (
                    <div className="text-[10px] font-mono text-gray-400 pt-1">
                      ID: {selectedReport.reporterId}
                    </div>
                  )}
                </div>
              </div>

              {/* Card: Target Details (Targeted user/content) */}
              {selectedReport.targetData ? (
                <div className="p-4 bg-gray-50/50 dark:bg-gray-950/20 border border-gray-150 dark:border-gray-800 rounded-xl space-y-3">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Targeted Profile Details</span>
                  <div className="flex flex-col gap-1.5 text-xs">
                    <div>
                      <span className="text-gray-400">Name: </span>
                      <span className="font-bold text-gray-850 dark:text-gray-100">
                        {selectedReport.targetData.fullName || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Email: </span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200 select-all">
                        {selectedReport.targetData.email || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Role: </span>
                      <Badge size="xs" color="light" className="ml-1 font-bold">
                        {selectedReport.targetData.role || "N/A"}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-gray-400">Target Status: </span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {selectedReport.targetData.status || "N/A"}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-gray-400 pt-1 border-t border-gray-100 dark:border-gray-800/80">
                      Target ID: {selectedReport.targetId}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50/50 dark:bg-gray-950/20 border border-gray-150 dark:border-gray-800 rounded-xl space-y-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Targeted Content Details</span>
                  <div className="flex flex-col gap-1 text-xs">
                    <div>
                      <span className="text-gray-400 font-mono">Target ID: </span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200 font-mono select-all">
                        {selectedReport.targetId}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-400 italic">Target details payload not loaded.</span>
                  </div>
                </div>
              )}

              {/* Card: Status Action Controls */}
              {selectedReport.status === "PENDING" && (
                <div className="p-4 bg-gray-55/10 dark:bg-gray-950/30 border border-gray-150 dark:border-gray-800 rounded-xl space-y-4 pt-4">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Report Administrative Action</span>
                  
                  {actionError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-150 text-rose-600 rounded-xl text-xs font-semibold">
                      {actionError}
                    </div>
                  )}
                  {actionSuccess && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-150 text-emerald-600 rounded-xl text-xs font-semibold">
                      {actionSuccess}
                    </div>
                  )}

                  <div className="flex flex-col gap-2.5">
                    <button
                      onClick={() => handleUpdateStatus(selectedReport.id, "RESOLVED")}
                      disabled={updateStatusMutation.isPending}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-xs"
                    >
                      Mark as Resolved
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedReport.id, "REVIEWED")}
                      disabled={updateStatusMutation.isPending}
                      className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs transition shadow-xs"
                    >
                      Mark as Reviewed
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedReport.id, "REJECTED")}
                      disabled={updateStatusMutation.isPending}
                      className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/20 dark:text-rose-455 font-bold rounded-xl text-xs transition border border-rose-100 dark:border-rose-900/30"
                    >
                      Reject / Dismiss Report
                    </button>
                  </div>
                </div>
              )}

              {/* Reviewed / Resolved Metadata info */}
              {(selectedReport.status === "RESOLVED" || selectedReport.status === "REVIEWED" || selectedReport.status === "REJECTED") && (
                <div className="p-4 bg-gray-50/50 dark:bg-gray-950/20 border border-gray-150 dark:border-gray-800 rounded-xl space-y-3">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Resolution History</span>
                  <div className="flex flex-col gap-1 text-xs">
                    <div>
                      <span className="text-gray-400">Status: </span>
                      <Badge size="xs" color={getStatusColor(selectedReport.status)} className="ml-1 font-bold">
                        {selectedReport.status}
                      </Badge>
                    </div>
                    {selectedReport.reviewedBy && (
                      <div>
                        <span className="text-gray-400">Reviewed By: </span>
                        <span className="font-semibold text-gray-805 dark:text-gray-200">
                          {selectedReport.reviewedBy.fullName} ({selectedReport.reviewedBy.email})
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-400">Processed At: </span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {formatDate(selectedReport.reviewedAt || selectedReport.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-6 border-t border-gray-150 dark:border-gray-800 flex-shrink-0 bg-gray-50/50 dark:bg-gray-950/20">
              <button
                onClick={() => setSelectedReport(null)}
                className="w-full py-2.5 bg-white hover:bg-gray-55 text-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03] border border-gray-200 dark:border-gray-750 font-bold rounded-xl text-xs transition"
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
