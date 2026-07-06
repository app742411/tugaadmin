"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import React from "react";
import { MoreDotIcon } from "@/icons";

// TypeScript interface for trader application rows
interface TraderApplication {
  id: number;
  name: string;
  email: string;
  initials: string;
  trade: string;
  submitted: string;
  docs: ("pdf" | "img")[];
  color: string;
}

// Data matching the Figma screen mockup exactly
const tableData: TraderApplication[] = [
  {
    id: 1,
    name: "Alex Johnson",
    email: "alex.j@tugatrades.com",
    initials: "AJ",
    trade: "Plumbing",
    submitted: "2 hours ago",
    docs: ["pdf", "img"],
    color: "bg-gray-800",
  },
  {
    id: 2,
    name: "BuildPro Solutions",
    email: "info@buildpro.com",
    initials: "BS",
    trade: "Building",
    submitted: "5 hours ago",
    docs: ["pdf"],
    color: "bg-emerald-600",
  },
  {
    id: 3,
    name: "Mark HomeFix",
    email: "mark@homefix.com",
    initials: "MH",
    trade: "Electrical",
    submitted: "1 day ago",
    docs: ["pdf", "img"],
    color: "bg-green-500",
  },
  {
    id: 4,
    name: "ProLine Services",
    email: "proline@service.com",
    initials: "PL",
    trade: "HVAC",
    submitted: "2 days ago",
    docs: ["pdf"],
    color: "bg-gray-800",
  },
];

// Premium styled PDF Document Badge
const PdfIcon = () => (
  <span className="inline-flex items-center justify-center bg-white text-red-500 border border-red-200 text-[10px] font-bold px-1.5 py-0.5 rounded gap-1 cursor-pointer hover:bg-red-50 transition-colors">
    <svg width="10" height="12" viewBox="0 0 10 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="stroke-current">
      <path d="M1 11V1M9 11V4.5L5.5 1H1" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    PDF
  </span>
);

// Premium styled Image Document Badge
const ImgIcon = () => (
  <span className="inline-flex items-center justify-center bg-white text-blue-500 border border-blue-200 text-[10px] font-bold px-1.5 py-0.5 rounded gap-1 cursor-pointer hover:bg-blue-50 transition-colors">
    <svg width="10" height="12" viewBox="0 0 10 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="stroke-current">
      <path d="M1 11V1M9 11V4.5L5.5 1H1" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    IMG
  </span>
);

export default function TradersAwaitingVerification() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-gray-900 shadow-sm w-full h-full flex flex-col">
      <div className="flex flex-col gap-2 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Traders Awaiting Verification
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Review pending applications and documentation
          </p>
        </div>

        <div>
          <button className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors">
            View all (23)
          </button>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto flex-1">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-b">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 font-semibold text-gray-400 text-start text-[10px] uppercase tracking-wider dark:text-gray-500"
              >
                TRADER
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-semibold text-gray-400 text-start text-[10px] uppercase tracking-wider dark:text-gray-500"
              >
                TRADE
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-semibold text-gray-400 text-start text-[10px] uppercase tracking-wider dark:text-gray-500"
              >
                SUBMITTED
              </TableCell>
              {/* <TableCell
                isHeader
                className="py-3 font-semibold text-gray-400 text-start text-[10px] uppercase tracking-wider dark:text-gray-500"
              >
                DOCUMENTS
              </TableCell> */}
              <TableCell
                isHeader
                className="py-3 font-semibold text-gray-400 text-start text-[10px] uppercase tracking-wider dark:text-gray-500"
              >
                ACTIONS
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {tableData.map((trader) => (
              <TableRow key={trader.id} className="hover:bg-gray-50/[0.3] dark:hover:bg-white/[0.01] transition-colors border-b border-gray-50">
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 flex items-center justify-center rounded-full text-white font-bold text-xs ${trader.color}`}>
                      {trader.initials}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm dark:text-white">
                        {trader.name}
                      </p>
                      <span className="text-gray-400 text-xs dark:text-gray-500 block">
                        {trader.email}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4 text-gray-700 font-semibold text-sm dark:text-gray-300">
                  {trader.trade}
                </TableCell>
                <TableCell className="py-4 text-gray-500 font-medium text-xs dark:text-gray-400">
                  {trader.submitted}
                </TableCell>
                {/* <TableCell className="py-4">
                  <div className="flex items-center gap-1.5">
                    {trader.docs.map((doc, i) =>
                      doc === "pdf" ? <PdfIcon key={i} /> : <ImgIcon key={i} />
                    )}
                  </div>
                </TableCell> */}
                <TableCell className="py-4">
                  <div className="flex items-center gap-2">
                    <button className="inline-flex items-center justify-center py-1.5 px-3 font-bold rounded-lg bg-[#6E9625] text-white text-xs hover:bg-[#5a7a1e] transition-colors shadow-sm cursor-pointer">
                      Approve
                    </button>
                    <button className="inline-flex items-center justify-center py-1.5 px-3 font-bold rounded-lg bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 dark:bg-red-500/10 dark:border-red-500/20 dark:hover:bg-red-500/20 text-xs transition-colors shadow-sm cursor-pointer">
                      Reject
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <MoreDotIcon className="w-5 h-5" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
