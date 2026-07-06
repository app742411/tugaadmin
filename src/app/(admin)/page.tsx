import type { Metadata } from "next";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart"; // This is JobsOverviewChart
import QuotesOverview from "@/components/ecommerce/QuotesOverview";
import QuickActions from "@/components/ecommerce/QuickActions";
import TradersAwaitingVerification from "@/components/ecommerce/TradersAwaitingVerification";
import RevenueOverview from "@/components/ecommerce/RevenueOverview";
import ActivityTimeline from "@/components/ecommerce/ActivityTimeline";
import React from "react";

export const metadata: Metadata = {
  title: "Admin Dashboard | TugaTrades",
  description: "TugaTrades Admin Dashboard Overview",
};

export default function Ecommerce() {
  return (
    <div className="space-y-3 w-full pb-10">
      {/* Top Row: 6 Metrics cards */}
      <EcommerceMetrics />

      {/* Middle Row: Jobs (6), Quotes (3), Quick Actions (3) */}
      <div className="grid grid-cols-12 gap-3 items-stretch w-full">
        <div className="col-span-12 xl:col-span-6">
          <MonthlySalesChart />
        </div>
        <div className="col-span-12 md:col-span-6 xl:col-span-3">
          <QuotesOverview />
        </div>
        <div className="col-span-12 md:col-span-6 xl:col-span-3">
          <QuickActions />
        </div>
      </div>

      {/* Bottom Row: Traders (6), Revenue (3), Timeline (3) */}
      <div className="grid grid-cols-12 gap-3 items-stretch w-full">
        <div className="col-span-12 xl:col-span-5">
          <TradersAwaitingVerification />
        </div>
        <div className="col-span-12 md:col-span-6 xl:col-span-3">
          <RevenueOverview />
        </div>
        <div className="col-span-12 md:col-span-6 xl:col-span-4">
          <ActivityTimeline />
        </div>
      </div>
    </div>
  );
}
