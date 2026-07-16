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
import { useGetCategoryRequests, useReviewCategoryRequest } from "@/hooks/useCategoryRequests";
import { useGetCategories } from "@/hooks/useCategories";
import { CategoryRequestItem } from "@/types/category-request.types";
import { MoreDotIcon } from "@/icons";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { useRouter } from "next/navigation";
import { categoryService } from "@/services/categoryService";

export default function CategoriesRequestsPageClient() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState<string>("--");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [selectedRequest, setSelectedRequest] = useState<CategoryRequestItem | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewType, setReviewType] = useState<"APPROVE" | "REJECT">("APPROVE");
  const [rejectReason, setRejectReason] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resolvedNames, setResolvedNames] = useState<Record<string, string>>({});

  // Dynamic recursive loading of category tree names when inspect drawer opens
  useEffect(() => {
    if (!selectedRequest) return;
    
    const loadNames = async () => {
      const names: Record<string, string> = {};
      try {
        const catIds = selectedRequest.tradeCategories || [];
        const skillServicePromises = catIds.map(id => 
          categoryService.getSkillServices(id).catch(() => [])
        );
        const skillServicesResults = await Promise.all(skillServicePromises);
        const allSkillServices = skillServicesResults.flat();
        
        allSkillServices.forEach(s => {
          names[s.id] = s.name;
        });

        const skillIds = allSkillServices.map(s => s.id);
        const subCategoryPromises = skillIds.map(id => 
          categoryService.getSubCategories(id).catch(() => [])
        );
        const subCategoriesResults = await Promise.all(subCategoryPromises);
        const allSubCategories = subCategoriesResults.flat();
        
        allSubCategories.forEach(sub => {
          names[sub.id] = sub.name;
        });
        
        setResolvedNames(prev => ({ ...prev, ...names }));
      } catch (err) {
        console.error("Failed loading category tree names:", err);
      }
    };
    
    loadNames();
  }, [selectedRequest]);

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
      status: status === "--" ? undefined : status,
      search: debouncedSearch || undefined,
    };
  }, [page, limit, status, debouncedSearch]);

  const { data, isLoading, error, refetch } = useGetCategoryRequests(queryParams);
  const reviewMutation = useReviewCategoryRequest();
  const { categories } = useGetCategories();

  const requestsList = data?.data || [];
  const paginationInfo = data?.pagination || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name[0].toUpperCase();
  };

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
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  const getStatusColor = (statusVal: string): "success" | "warning" | "error" | "info" | "light" => {
    switch (statusVal) {
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

  const formatDate = (dateString: string | null) => {
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

  const resolveCategoryName = (id: string) => {
    const found = categories?.find((c) => c.id === id);
    return found ? found.name : id;
  };

  const resolveSkillName = (id: string) => {
    return resolvedNames[id] || id;
  };

  const resolveSubCategoryName = (id: string) => {
    return resolvedNames[id] || id;
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    if (reviewType === "REJECT" && !rejectReason.trim()) {
      setErrorMessage("Please enter a rejection reason.");
      return;
    }

    setErrorMessage(null);
    try {
      await reviewMutation.mutateAsync({
        id: selectedRequest.id,
        payload: {
          action: reviewType === "APPROVE" ? "APPROVE" : "REJECT",
          rejectReason: reviewType === "REJECT" ? rejectReason : null,
        },
      });
      setIsReviewing(false);
      setSelectedRequest(null);
      setRejectReason("");
      refetch();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update review status. Please try again.");
    }
  };

  const handleDirectApprove = async (reqId: string) => {
    setErrorMessage(null);
    try {
      await reviewMutation.mutateAsync({
        id: reqId,
        payload: {
          action: "APPROVE",
          rejectReason: null,
        },
      });
      refetch();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to approve request.");
    }
  };

  return (
    <div className="w-full pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <PageBreadcrumb pageTitle="Category Change Requests" />
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 ml-0.5">
            Review and manage requests from traders to update their business categories.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="p-5 mb-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Search Box */}
          <div className="flex flex-col gap-1.5 lg:col-span-2">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Search Requests
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
                placeholder="Search by Trader name or company..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/80 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
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
                { value: "--", label: "All Requests" },
                { value: "PENDING", label: "Pending" },
                { value: "APPROVED", label: "Approved" },
                { value: "REJECTED", label: "Rejected" },
              ]}
              value={status}
              onChange={(val) => {
                setStatus(val);
                setPage(1);
              }}
            />
          </div>

          {/* Results summary */}
          <div className="flex justify-start sm:justify-end text-xs text-gray-400 dark:text-gray-500 sm:pb-2">
            {isLoading ? (
              <span>Loading results...</span>
            ) : (
              <span>Found {paginationInfo.total} request{paginationInfo.total === 1 ? "" : "s"}</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto min-h-[300px]">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-55/40 dark:bg-gray-950/20 border-b border-gray-100 dark:border-gray-800/80">
                <TableCell className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-400 text-start">Trader / Company</TableCell>
                <TableCell className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-400 text-start">Requested Categories</TableCell>
                <TableCell className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-400 text-start">Date Requested</TableCell>
                <TableCell className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-400 text-center">Status</TableCell>
                <TableCell className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-400 text-center">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell colSpan={5} className="px-6 py-4.5 text-center">
                      <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse w-full"></div>
                    </TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="px-6 py-10 text-center text-red-500">
                    <h4 className="text-sm font-semibold">Failed to fetch requests</h4>
                    <p className="text-xs mt-1">{error}</p>
                  </TableCell>
                </TableRow>
              ) : requestsList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="px-6 py-16 text-center text-gray-400">
                    <p className="text-xs font-semibold">No Category Change Requests Found</p>
                  </TableCell>
                </TableRow>
              ) : (
                requestsList.map((req, index) => {
                  const trader = req.traderProfile?.user;
                  const profile = req.traderProfile;
                  const initials = getInitials(trader?.fullName || "Trader");
                  const avatarBg = getAvatarBg(trader?.fullName || "Trader");

                  return (
                    <TableRow
                      key={req.id}
                      onClick={() => {
                        if (trader?.id) {
                          router.push(`/traders/${trader.id}`);
                        }
                      }}
                      className={`hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors border-b border-gray-100 dark:border-gray-800/80 cursor-pointer ${
                        openDropdownId === req.id ? "relative z-30" : ""
                      }`}
                    >
                      {/* Name / User Info */}
                      <TableCell className="px-6 py-3.5 text-start">
                        <div className="flex items-center gap-3">
                          {profile?.logo ? (
                            <div className="w-10 h-10 overflow-hidden rounded-full border border-gray-150 dark:border-gray-800 flex-shrink-0">
                              <img
                                src={`${process.env.NEXT_PUBLIC_API_URL || ""}${profile.logo}`}
                                alt={trader?.fullName || "Logo"}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${avatarBg}`}>
                              {initials}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-850 dark:text-white/90 text-sm">
                              {trader?.fullName || "Unknown Trader"}
                            </span>
                            <span className="text-gray-400 dark:text-gray-500 text-xs">
                              {profile?.companyName || trader?.email || "No company info"}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Trade Categories Requested */}
                      <TableCell className="px-6 py-3.5 text-start max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {req.tradeCategories?.map((catId) => (
                            <span
                              key={catId}
                              className="px-2 py-0.5 bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 font-semibold text-[10px] rounded"
                            >
                              {resolveCategoryName(catId)}
                            </span>
                          ))}
                        </div>
                      </TableCell>

                      {/* Created At */}
                      <TableCell className="px-6 py-3.5 text-start text-xs font-medium text-gray-600 dark:text-gray-400">
                        {formatDate(req.createdAt)}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="px-6 py-3.5 text-center">
                        <Badge size="sm" color={getStatusColor(req.status)}>
                          {req.status}
                        </Badge>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="px-6 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="relative inline-block text-left">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdownId(openDropdownId === req.id ? null : req.id);
                            }}
                            className={`dropdown-toggle inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 bg-gray-50/50 hover:bg-gray-100 hover:border-gray-300 text-gray-500 hover:text-gray-800 transition-all duration-200 dark:border-gray-800 dark:bg-gray-900/50 dark:hover:bg-gray-800 dark:hover:border-gray-700 dark:text-gray-400 dark:hover:text-white ${
                              openDropdownId === req.id
                                ? "bg-gray-100 border-gray-300 dark:bg-gray-850 dark:border-gray-700 text-gray-800 dark:text-white"
                                : ""
                            }`}
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                            </svg>
                          </button>
                          <Dropdown
                            isOpen={openDropdownId === req.id}
                            onClose={() => setOpenDropdownId(null)}
                            className={`w-44 absolute right-0 z-50 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-lg dark:shadow-none p-1.5 ${
                              req.status === "PENDING" && index >= 2 && index >= requestsList.length - 2
                                ? "bottom-full mb-1.5"
                                : "top-full mt-1.5"
                            }`}
                          >
                            <div onClick={(e) => e.stopPropagation()} className="flex flex-col gap-1">
                              {req.status === "PENDING" && (
                                <>
                                  <DropdownItem
                                    baseClassName=""
                                    onItemClick={() => {
                                      handleDirectApprove(req.id);
                                      setOpenDropdownId(null);
                                    }}
                                    className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs font-semibold text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-500/10 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Approve
                                  </DropdownItem>
                                  <DropdownItem
                                    baseClassName=""
                                    onItemClick={() => {
                                      setSelectedRequest(req);
                                      setReviewType("REJECT");
                                      setIsReviewing(true);
                                      setOpenDropdownId(null);
                                    }}
                                    className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Reject
                                  </DropdownItem>
                                  <div className="h-px bg-gray-100 dark:bg-gray-850 my-1 mx-1.5" />
                                </>
                              )}
                              {/*
                              <DropdownItem
                                baseClassName=""
                                onItemClick={() => {
                                  setSelectedRequest(req);
                                  setOpenDropdownId(null);
                                }}
                                className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-850 rounded-lg transition-colors cursor-pointer"
                              >
                                <svg className="w-4 h-4 flex-shrink-0 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Inspect Details
                              </DropdownItem>
                              */}
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

      {/* Pagination */}
      {!isLoading && !error && requestsList.length > 0 && (
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

      {/* Slide-over Inspect Drawer */}
      {selectedRequest && (
        <div className="fixed inset-0 z-[1000] flex justify-end bg-black/40 backdrop-blur-xs transition-opacity duration-300">
          <div className="absolute inset-0 cursor-default" onClick={() => { setSelectedRequest(null); setIsReviewing(false); }} />
          
          <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col z-10 border-l border-gray-150 dark:border-gray-800">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-150 dark:border-gray-800 flex-shrink-0">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Category Request Details
              </h3>
              <button
                onClick={() => { setSelectedRequest(null); setIsReviewing(false); }}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Profile card summary */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50/50 dark:bg-gray-950/20 border border-gray-100 dark:border-gray-850">
                {selectedRequest.traderProfile?.logo ? (
                  <div className="w-12 h-12 overflow-hidden rounded-full border border-gray-155 dark:border-gray-800 flex-shrink-0">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL || ""}${selectedRequest.traderProfile.logo}`}
                      alt={selectedRequest.traderProfile?.user?.fullName || "Logo"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${getAvatarBg(selectedRequest.traderProfile?.user?.fullName || "Trader")}`}>
                    {getInitials(selectedRequest.traderProfile?.user?.fullName || "Trader")}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">
                    {selectedRequest.traderProfile?.user?.fullName || "Unknown Trader"}
                  </h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400 block">
                    {selectedRequest.traderProfile?.companyName || "No Company Info"}
                  </span>
                </div>
              </div>

              {/* General Request Info */}
              <div className="space-y-4">
                <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400">Request Stats</h5>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400">Request ID:</span>
                    <p className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5 break-all font-mono">{selectedRequest.id}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Date Requested:</span>
                    <p className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{formatDate(selectedRequest.createdAt)}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Current Request Status:</span>
                    <div className="mt-0.5">
                      <Badge color={getStatusColor(selectedRequest.status)} size="sm">
                        {selectedRequest.status}
                      </Badge>
                    </div>
                  </div>
                  {selectedRequest.reviewedAt && (
                    <div>
                      <span className="text-gray-400">Reviewed At:</span>
                      <p className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{formatDate(selectedRequest.reviewedAt)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Categories/Skills details list */}
              <div className="space-y-4 pt-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400">Requested Categories & Services</h5>
                
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50/30 dark:bg-gray-950/10 rounded-xl border border-gray-100 dark:border-gray-850">
                    <span className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold block mb-1.5">Trade Categories</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedRequest.tradeCategories?.map((c) => (
                        <span key={c} className="px-2.5 py-0.5 bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 font-semibold text-xs rounded">
                          {resolveCategoryName(c)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-gray-55/10 dark:bg-gray-950/10 rounded-xl border border-gray-100 dark:border-gray-850">
                    <span className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold block mb-1.5">Skills Services</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedRequest.skillsServices?.map((s) => (
                        <span key={s} className="px-2.5 py-0.5 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 font-semibold text-xs rounded">
                          {resolveSkillName(s)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-gray-55/10 dark:bg-gray-950/10 rounded-xl border border-gray-100 dark:border-gray-850">
                    <span className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold block mb-1.5">Sub-Categories</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedRequest.subCategories?.map((sub) => (
                        <span key={sub} className="px-2.5 py-0.5 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 font-semibold text-xs rounded">
                          {resolveSubCategoryName(sub)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Show Rejection Info if rejected */}
              {selectedRequest.status === "REJECTED" && selectedRequest.rejectReason && (
                <div className="p-4 bg-red-50 dark:bg-red-950/10 border border-red-150 dark:border-red-900 rounded-xl">
                  <span className="text-[11px] text-red-500 uppercase tracking-wider font-bold block mb-1">Rejection Reason</span>
                  <p className="text-xs text-red-650 dark:text-red-400 font-medium">{selectedRequest.rejectReason}</p>
                </div>
              )}

              {/* Interactive Vetting Action Form */}
              {selectedRequest.status === "PENDING" && (
                <div className="pt-4 border-t border-gray-150 dark:border-gray-800">
                  {!isReviewing ? (
                    <div className="flex gap-3">
                      <button
                        onClick={() => { setReviewType("APPROVE"); setIsReviewing(true); }}
                        className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs transition-colors"
                      >
                        Approve Request
                      </button>
                      <button
                        onClick={() => { setReviewType("REJECT"); setIsReviewing(true); }}
                        className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/10 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-450 border border-rose-200 dark:border-rose-900/60 font-bold rounded-xl text-xs transition-colors"
                      >
                        Reject Request
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      <h4 className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider">
                        {reviewType === "APPROVE" ? "Confirm Approval" : "Specify Rejection Reason"}
                      </h4>
                      
                      {reviewType === "REJECT" && (
                        <div>
                          <textarea
                            placeholder="Please provide details on why this request is rejected..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            rows={3}
                            className="w-full p-3 text-xs border border-gray-250 dark:border-gray-800 rounded-xl bg-gray-50/20 dark:bg-gray-950/20 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition"
                          />
                        </div>
                      )}

                      {errorMessage && (
                        <div className="p-3 bg-red-50 text-red-500 border border-red-150 rounded-xl text-xs font-semibold">
                          {errorMessage}
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={reviewMutation.isPending}
                          className={`w-full py-2.5 text-white font-bold rounded-xl text-xs transition ${
                            reviewType === "APPROVE" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
                          } disabled:opacity-50`}
                        >
                          {reviewMutation.isPending ? "Submitting..." : reviewType === "APPROVE" ? "Confirm Approve" : "Confirm Reject"}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setIsReviewing(false); setRejectReason(""); setErrorMessage(null); }}
                          className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl text-xs border border-gray-200 dark:border-gray-750 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* Footer close button */}
            {!isReviewing && (
              <div className="p-6 border-t border-gray-150 dark:border-gray-800 flex-shrink-0 bg-gray-50/50 dark:bg-gray-950/20">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="w-full py-2.5 bg-white hover:bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03] border border-gray-200 dark:border-gray-750 font-bold rounded-xl text-xs transition"
                >
                  Close Details
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
