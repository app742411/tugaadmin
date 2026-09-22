"use client";

import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import {
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import { deactiveAccountService } from "@/services/deactiveAccount";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";
import Select from "@/components/ui/select/Select";
import Pagination from "@/components/ui/pagination/Pagination";

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

export default function ActivateAccountPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Filters & Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [role, setRole] = useState("--");
  const [hasReactivationRequest, setHasReactivationRequest] = useState("--");
  const [paginationInfo, setPaginationInfo] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });

  const { toasts, showToast, removeToast } = useToast();
  const router = useRouter();

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit };
      if (debouncedSearch) params.search = debouncedSearch;
      if (role !== "--") params.role = role;
      if (hasReactivationRequest !== "--") params.hasReactivationRequest = hasReactivationRequest;

      const data = await deactiveAccountService.getDeactivatedAccounts(params);
      setAccounts(data?.data || []);
      if (data?.pagination) {
        setPaginationInfo(data.pagination);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch deactivated accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [page, limit, debouncedSearch, role, hasReactivationRequest]);

  const handleReactivate = async (userId: string) => {
    try {
      setOpenDropdownId(null);
      await deactiveAccountService.reactivateAccount(userId);
      showToast("success", "Account reactivated successfully.");
      // Refresh the list
      fetchAccounts();
    } catch (err: any) {
      showToast("error", err.message || "Failed to reactivate account");
    }
  };

  // Utility to get initials for profile picture fallback
  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name[0].toUpperCase();
  };

  return (
    <div className="w-full pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <PageBreadcrumb pageTitle="Activate Accounts" />
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 ml-0.5">
            View and activate deactivated customer accounts
          </p>
        </div>
      </div>

      <div className="p-5 mb-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Search Box */}
          <div className="flex flex-col gap-1.5 lg:col-span-2">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Search Accounts
            </label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or phone..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/80 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
              />
            </div>
          </div>

          {/* Role Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Filter by Role
            </label>
            <Select
              options={[
                { value: "--", label: "All Roles" },
                { value: "CUSTOMER", label: "CUSTOMER" },
                { value: "TRADER", label: "TRADER" },
              ]}
              value={role}
              onChange={(val) => { setRole(val); setPage(1); }}
            />
          </div>

          {/* Reactivation Request Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Reactivation Request
            </label>
            <Select
              options={[
                { value: "--", label: "All" },
                { value: "true", label: "Yes" },
                { value: "false", label: "No" },
              ]}
              value={hasReactivationRequest}
              onChange={(val) => { setHasReactivationRequest(val); setPage(1); }}
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-sm flex flex-col">
        <div className="max-w-full overflow-x-auto min-h-[280px]">
          <div className="min-w-[900px] w-full">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20">
                <TableRow>
                  <TableCell isHeader className="px-6 py-4 font-bold text-gray-600 text-start text-xs uppercase tracking-wider dark:text-gray-400">
                    User
                  </TableCell>
                  <TableCell isHeader className="px-6 py-4 font-bold text-gray-600 text-center text-xs uppercase tracking-wider dark:text-gray-400">
                    Phone No
                  </TableCell>
                  <TableCell isHeader className="px-6 py-4 font-bold text-gray-600 text-start text-xs uppercase tracking-wider dark:text-gray-400">
                    Role
                  </TableCell>
                  <TableCell isHeader className="px-6 py-4 font-bold text-gray-600 text-start text-xs uppercase tracking-wider dark:text-gray-400">
                    Status
                  </TableCell>
                  <TableCell isHeader className="px-6 py-4 font-bold text-gray-600 text-center text-xs uppercase tracking-wider dark:text-gray-400">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800/65">
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      Loading accounts...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={5} className="px-6 py-12 text-center text-red-500">
                      {error}
                    </TableCell>
                  </TableRow>
                ) : accounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No deactivated accounts found.
                    </TableCell>
                  </TableRow>
                ) : (
                  accounts.map((account, index) => {
                    const name = account.fullName || account.name || "Unknown User";
                    return (
                      <TableRow key={account.id || index} className={`hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors border-b border-gray-100 dark:border-gray-800/80 ${openDropdownId === account.id ? "relative z-30" : ""}`}>
                        <TableCell className="px-6 py-3.5 text-start">
                          <div className="flex items-center gap-3">
                            {account.profileImage ? (
                              <div className="w-10 h-10 overflow-hidden rounded-full border border-gray-200 flex-shrink-0">
                                <img src={account.profileImage.startsWith("http") ? account.profileImage : `${process.env.NEXT_PUBLIC_API_URL || ""}${account.profileImage}`} alt={name} className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 bg-gray-100 text-gray-600">
                                {getInitials(name)}
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-800 dark:text-white/90 text-sm">{name}</span>
                              <span className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">{account.email}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-3.5 text-center text-sm text-gray-600 dark:text-gray-400 font-medium">
                          {account.phone || "-"}
                        </TableCell>
                        <TableCell className="px-6 py-3.5 text-start">
                          <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${account.role === "TRADER" ? "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20" : "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"}`}>
                            {account.role || "CUSTOMER"}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-3.5 text-start">
                          <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-red-50 text-red-600 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20">
                            {account.status || "DEACTIVATED"}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="relative inline-block text-left">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdownId(openDropdownId === account.id ? null : account.id);
                              }}
                              className={`dropdown-toggle inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 bg-gray-50/50 hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-all dark:border-gray-800 dark:bg-gray-900/50 dark:hover:bg-gray-800 dark:text-gray-400 dark:hover:text-white ${openDropdownId === account.id ? "bg-gray-100 border-gray-300 dark:bg-gray-850 dark:border-gray-700 text-gray-800 dark:text-white" : ""}`}
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                              </svg>
                            </button>

                            <Dropdown
                              isOpen={openDropdownId === account.id}
                              onClose={() => setOpenDropdownId(null)}
                              className={`w-44 absolute right-0 z-50 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-lg p-1.5 ${(index >= accounts.length - 2 && accounts.length > 3) ? "bottom-full mb-1.5" : "top-full mt-1.5"}`}
                            >
                              <div onClick={(e) => e.stopPropagation()} className="flex flex-col gap-1">
                                <DropdownItem
                                  baseClassName=""
                                  onItemClick={() => {
                                    setOpenDropdownId(null);
                                    if (account.role === "TRADER") {
                                      router.push(`/traders/${account.id}`);
                                    } else {
                                      router.push(`/customers/${account.id}`);
                                    }
                                  }}
                                  className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-850 rounded-lg transition-colors cursor-pointer"
                                >
                                  <svg className="w-4 h-4 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  View Details
                                </DropdownItem>

                                <DropdownItem
                                  baseClassName=""
                                  onItemClick={() => handleReactivate(account.id)}
                                  className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10 rounded-lg transition-colors cursor-pointer"
                                >
                                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Activate Account
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

        {/* Pagination */}
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
          isLoading={loading}
        />
      </div>

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
