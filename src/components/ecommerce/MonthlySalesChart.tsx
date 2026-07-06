"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useState } from "react";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function MonthlySalesChart() {
  const [activeTab, setActiveTab] = useState<"monthly" | "weekly">("monthly");

  const options: ApexOptions = {
    colors: ["#6E9625"], // Premium Figma bright green accent
    chart: {
      fontFamily: "Manrope, sans-serif",
      type: "area",
      height: 250,
      toolbar: {
        show: false,
      },
      sparkline: {
        enabled: false,
      },
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.0,
        stops: [0, 100],
        colorStops: [
          {
            offset: 0,
            color: "#6E9625",
            opacity: 0.35
          },
          {
            offset: 100,
            color: "#6E9625",
            opacity: 0.0
          }
        ]
      },
    },
    dataLabels: {
      enabled: true,
      background: { enabled: false },
      style: {
        fontSize: "10px",
        fontFamily: "Manrope, sans-serif",
        fontWeight: "bold",
        colors: ["#374151"]
      },
      offsetY: -5,
    },
    markers: {
      size: 4,
      colors: ["#6E9625"],
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 6,
      }
    },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: "#9CA3AF",
          fontSize: "11px",
          fontFamily: "Manrope, sans-serif",
        }
      },
      tooltip: { enabled: false }
    },
    yaxis: {
      min: 0,
      max: 2000,
      tickAmount: 4,
      labels: {
        style: {
          colors: "#9CA3AF",
          fontSize: "11px",
          fontFamily: "Manrope, sans-serif",
        },
        formatter: (value) => value >= 1000 ? `${value / 1000}K` : `${value}`,
      }
    },
    grid: {
      borderColor: "#F3F4F6",
      strokeDashArray: 4,
      yaxis: {
        lines: {
          show: true,
        },
      },
      xaxis: {
        lines: {
          show: false,
        }
      }
    },
    tooltip: {
      theme: "light",
      x: {
        show: true,
      },
      y: {
        formatter: (val: number) => `${val}`,
      },
    },
  };

  const series = [
    {
      name: "Active Jobs",
      data: [850, 1020, 1100, 950, 1250, 1500, 1650, 1700, 1800, 1850, 1900, 2000],
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white px-5 pb-5 pt-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:px-6 sm:pt-6 w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Jobs Overview
          </h3>
          <button className="flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 px-2 py-1 rounded-md border border-gray-100 dark:border-gray-700">
            This Year
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
        </div>

        {/* Toggle Pills */}
        <div className="inline-flex rounded-full bg-gray-100 p-1 dark:bg-gray-800">
          <button
            onClick={() => setActiveTab("monthly")}
            className={`rounded-full px-4 py-1 text-xs font-bold transition-all ${activeTab === "monthly"
              ? "bg-[#6E9625] text-white shadow-sm"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
              }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setActiveTab("weekly")}
            className={`rounded-full px-4 py-1 text-xs font-bold transition-all ${activeTab === "weekly"
              ? "bg-[#6E9625] text-white shadow-sm"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
              }`}
          >
            Weekly
          </button>
        </div>
      </div>

      <div className="flex-1 w-full overflow-hidden min-w-0">
        <div className="-ml-2 w-full pr-1 min-w-0">
          <ReactApexChart
            options={options}
            series={series}
            type="area"
            height={220}
            width="100%"
          />
        </div>
      </div>

      {/* Summary Footer to fill empty space */}
      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 dark:text-gray-400">Total Active Jobs (Year)</span>
          <span className="text-lg font-bold text-gray-900 dark:text-white">18,450</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-xs text-gray-500 dark:text-gray-400">Monthly Average</span>
          <span className="text-lg font-bold text-gray-900 dark:text-white">1,537</span>
        </div>
      </div>
    </div>
  );
}
