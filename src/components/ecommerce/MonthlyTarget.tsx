"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import React from "react";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function MonthlyTarget() {
  // Chart 1 Options: Quotes Overview
  const quotesOptions: ApexOptions = {
    colors: ["#6E9625", "#1E3524", "#E5E7EB"], // Bright Green, Dark Forest Green, Light Grey
    chart: {
      fontFamily: "Manrope, sans-serif",
      type: "donut",
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["#ffffff"],
    },
    plotOptions: {
      pie: {
        donut: {
          size: "72%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "11px",
              fontFamily: "Manrope, sans-serif",
              color: "#9CA3AF",
              offsetY: 20,
            },
            value: {
              show: true,
              fontSize: "24px",
              fontFamily: "Bricolage Grotesque, sans-serif",
              fontWeight: "800",
              color: "#111827",
              offsetY: -15,
              formatter: () => "4,883",
            },
            total: {
              show: true,
              label: "Total Quotes Sent",
              color: "#9CA3AF",
              formatter: () => "4,883",
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: (value) => `${value}%`,
      },
    },
  };

  const quotesSeries = [60, 25, 15]; // Accepted, Declined, Expired

  // Chart 2 Options: Subscription Status
  const subOptions: ApexOptions = {
    colors: ["#6E9625", "#1E3524", "#E5E7EB"],
    chart: {
      fontFamily: "Manrope, sans-serif",
      type: "donut",
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["#ffffff"],
    },
    plotOptions: {
      pie: {
        donut: {
          size: "72%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "11px",
              fontFamily: "Manrope, sans-serif",
              color: "#9CA3AF",
              offsetY: 20,
            },
            value: {
              show: true,
              fontSize: "24px",
              fontFamily: "Bricolage Grotesque, sans-serif",
              fontWeight: "800",
              color: "#111827",
              offsetY: -15,
              formatter: () => "2,153",
            },
            total: {
              show: true,
              label: "Total Traders Subscribed",
              color: "#9CA3AF",
              formatter: () => "2,153",
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: (value) => `${value}%`,
      },
    },
  };

  const subSeries = [65, 20, 15]; // Active, Trial, Cancelled

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 1. Quotes Overview Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm flex flex-col justify-between h-[360px]">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Quotes Overview
          </h3>
        </div>

        <div className="relative flex justify-center items-center my-2 max-h-[190px]">
          <ReactApexChart
            options={quotesOptions}
            series={quotesSeries}
            type="donut"
            height={190}
            width={280}
          />
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-xs font-semibold text-gray-500 dark:text-gray-400 mt-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-[#6E9625]"></span>
            <span>Accepted</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-[#1E3524]"></span>
            <span>Declined</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-[#E5E7EB]"></span>
            <span>Expired</span>
          </div>
        </div>
      </div>

      {/* 2. Subscription Status Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm flex flex-col justify-between h-[400px]">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Subscription Status
          </h3>
        </div>

        <div className="relative flex justify-center items-center my-2 max-h-[190px]">
          <ReactApexChart
            options={subOptions}
            series={subSeries}
            type="donut"
            height={190}
            width={280}
          />
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-xs font-semibold text-gray-500 dark:text-gray-400 mt-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-[#6E9625]"></span>
            <span>Active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-[#1E3524]"></span>
            <span>Trial</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-[#E5E7EB]"></span>
            <span>Cancelled</span>
          </div>
        </div>

        {/* View subscriptions link */}
        <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mt-3 text-center">
          <a
            href="#"
            className="text-xs font-bold text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
          >
            View all subscriptions
          </a>
        </div>
      </div>
    </div>
  );
}
