"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import React from "react";
import Image from "next/image";

// TypeScript interface for trader application rows
interface TraderApplication {
  id: number;
  name: string;
  email: string;
  avatar: string;
  trade: string;
  submitted: string;
  docs: ("pdf" | "img")[];
}

// Data matching the Figma screen mockup exactly
const tableData: TraderApplication[] = [
  {
    id: 1,
    name: "Alex Johnson",
    email: "alex.j@tugatrades.com",
    avatar: "/images/user/user-01.png", // Fallback mapping in code
    trade: "Plumbing",
    submitted: "2 hours ago",
    docs: ["pdf", "img"],
  },
  {
    id: 2,
    name: "BuildPro Solutions",
    email: "info@buildpro.com",
    avatar: "/images/user/user-02.png",
    trade: "Building",
    submitted: "5 hours ago",
    docs: ["pdf"],
  },
  {
    id: 3,
    name: "Electric Fix Ltd",
    email: "contact@electricfix.co.uk",
    avatar: "/images/user/user-03.png",
    trade: "Electrical",
    submitted: "Yesterday",
    docs: ["pdf", "pdf"],
  },
  {
    id: 4,
    name: "Green Heat Ltd",
    email: "service@greenheat.com",
    avatar: "/images/user/user-04.png",
    trade: "Heating",
    submitted: "Oct 12, 2023",
    docs: ["img"],
  },
  {
    id: 5,
    name: "Smooth Finish",
    email: "pete@smoothfinish.ie",
    avatar: "/images/user/user-05.png",
    trade: "Plastering",
    submitted: "Oct 11, 2023",
    docs: ["pdf", "img"],
  },
];

// Premium styled PDF Document Badge
const PdfIcon = () => (
  <span className="inline-flex items-center justify-center bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-bold px-1.5 py-0.5 rounded gap-1 cursor-pointer hover:bg-rose-100 transition-colors">
    <svg width="10" height="12" viewBox="0 0 10 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="stroke-current">
      <path d="M1 11V1M9 11V4.5L5.5 1H1" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
    PDF
  </span>
);

// Premium styled Image Document Badge
const ImgIcon = () => (
  <span className="inline-flex items-center justify-center bg-blue-50 text-blue-600 border border-blue-200 text-[10px] font-bold px-1.5 py-0.5 rounded gap-1 cursor-pointer hover:bg-blue-100 transition-colors">
    <svg width="10" height="12" viewBox="0 0 10 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="stroke-current">
      <path d="M1 11V1M9 11V4.5L5.5 1H1" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
    IMG
  </span>
);

export default function RecentOrders() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 shadow-sm w-full">
      <div className="flex flex-col gap-2 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Traders Awaiting Verification
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Review pending applications and documentation
          </p>
        </div>

        <div>
          <button className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03] transition-colors">
            View all (23)
          </button>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Table Header */}
          <TableHeader className="border-gray-100 dark:border-gray-800 border-b">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 font-semibold text-gray-400 text-start text-xs uppercase tracking-wider dark:text-gray-500"
              >
                Trader
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-semibold text-gray-400 text-start text-xs uppercase tracking-wider dark:text-gray-500"
              >
                Trade
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-semibold text-gray-400 text-start text-xs uppercase tracking-wider dark:text-gray-500"
              >
                Submitted
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-semibold text-gray-400 text-start text-xs uppercase tracking-wider dark:text-gray-500"
              >
                Documents
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-semibold text-gray-400 text-center text-xs uppercase tracking-wider dark:text-gray-500 w-[120px]"
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {tableData.map((trader) => (
              <TableRow key={trader.id} className="hover:bg-gray-50/[0.3] dark:hover:bg-white/[0.01] transition-colors">
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full relative border border-gray-100 dark:border-gray-800 bg-gray-50">
                      {/* Generates a nice SVG initials fallback if image doesn't exist */}
                      <Image
                        width={40}
                        height={40}
                        src={trader.avatar}
                        className="h-10 w-10 rounded-full object-cover"
                        alt={trader.name}
                        onError={(e) => {
                          // Fallback to initial colored placeholder
                          (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${trader.name}`;
                        }}
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm dark:text-white">
                        {trader.name}
                      </p>
                      <span className="text-gray-400 text-xs dark:text-gray-500 block">
                        {trader.email}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4 text-gray-800 font-medium text-sm dark:text-gray-300">
                  {trader.trade}
                </TableCell>
                <TableCell className="py-4 text-gray-500 text-sm dark:text-gray-400">
                  {trader.submitted}
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center gap-1.5">
                    {trader.docs.map((doc, i) =>
                      doc === "pdf" ? <PdfIcon key={i} /> : <ImgIcon key={i} />
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-4 text-center">
                  <button className="inline-flex items-center justify-center py-2 px-5 font-bold rounded-lg bg-[#243A24] text-white text-xs hover:bg-[#1a2d1d] transition-colors shadow-sm cursor-pointer">
                    Review
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
