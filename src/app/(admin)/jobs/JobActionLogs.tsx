"use client";

import React, { useState, useMemo } from "react";
import { useGetJobActionLogs } from "@/hooks/useJobs";
import { JobActionLog } from "@/types/job.types";
import Pagination from "@/components/ui/pagination/Pagination";
import Badge from "@/components/ui/badge/Badge";

export default function JobActionLogs() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const queryParams = useMemo(() => ({ page, limit }), [page, limit]);

  const { data, isLoading, error } = useGetJobActionLogs(queryParams);

  const logs: JobActionLog[] = data?.data || [];
  const paginationInfo = data?.pagination || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  };

  const getActionColor = (action: string): "success" | "warning" | "error" | "info" | "light" => {
    switch (action) {
      case "RESUME_DISTRIBUTION":
      case "RESTART_AUTO_DISTRIBUTION":
        return "success";
      case "PAUSE_DISTRIBUTION":
        return "warning";
      case "INCREASE_RADIUS":
        return "info";
      case "MANUAL_DISTRIBUTION":
        return "light";
      default:
        return "light";
    }
  };

  const formatActionName = (action: string) => {
    return action.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  };

  const formatMetadata = (metadata?: Record<string, any>) => {
    if (!metadata) return null;
    
    const details = [];
    if (metadata.previousStatus && metadata.newStatus) {
      details.push(`Status changed from ${metadata.previousStatus} to ${metadata.newStatus}`);
    } else if (metadata.previousState?.distributionStatus && metadata.newState?.distributionStatus) {
      details.push(`Status changed from ${metadata.previousState.distributionStatus} to ${metadata.newState.distributionStatus}`);
    }

    if (metadata.addedRadiusKm !== undefined) {
      details.push(`Radius increased by ${metadata.addedRadiusKm}km (now ${metadata.newRadiusKm}km)`);
    }

    if (metadata.assignedCount !== undefined) {
      details.push(`Manually distributed to ${metadata.assignedCount} trader(s)`);
    }

    return details.length > 0 ? details.join(' • ') : null;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return new Intl.DateTimeFormat("en-US", {
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
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xs overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <h3 className="font-bold text-gray-900 dark:text-white text-sm">Jobs Audit Log</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="flex items-start gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 shrink-0"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4"></div>
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2"></div>
              </div>
            </div>
          ))
        ) : error ? (
          <div className="text-center text-red-500 py-10">
            <h4 className="text-sm font-semibold">Failed to fetch logs</h4>
            <p className="text-xs mt-1">{error}</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center text-gray-400 py-10">
            <p className="text-xs font-semibold">No Activity Found</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 pb-4 border-b border-gray-50 dark:border-gray-800/50 last:border-0 last:pb-0">
              <div className="w-8 h-8 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-semibold text-xs text-gray-900 dark:text-gray-100 truncate">
                    {log.job?.title || `Job #${log.jobId.slice(0, 8)}`}
                  </span>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap">
                    {formatDate(log.createdAt)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <Badge size="sm" color={getActionColor(log.action)}>
                    {formatActionName(log.action)}
                  </Badge>
                  {log.admin && (
                    <span className="text-[10px] text-gray-500 font-medium">
                      by {log.admin.fullName}
                    </span>
                  )}
                </div>
                
                {formatMetadata(log.metadata) && (
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 mt-1 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg border border-gray-100 dark:border-gray-800">
                    {formatMetadata(log.metadata)}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {!isLoading && !error && logs.length > 0 && (
        <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-4 bg-gray-50/50 dark:bg-gray-900/50 mt-auto">
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
        </div>
      )}
    </div>
  );
}
