"use client";
import React from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import {
  GroupIcon,
  UserCircleIcon,
  BoxCubeIcon,
  DocsIcon,
  TimeIcon,
} from "@/icons";

// Dynamically import ApexCharts to avoid SSR issues
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

// Custom Euro icon for Revenue (MRR)
const EuroIcon = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5" />
    <path d="M14.5 9C14 7.5 12.5 7 11.5 7C9.5 7 8 8.7 8 11.5V12.5C8 15.3 9.5 17 11.5 17C12.5 17 14 16.5 14.5 15M7 11H12M7 13H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SparklineChart = ({ color, data }: { color: string; data: number[] }) => {
  const options: ApexOptions = {
    chart: {
      type: "area",
      sparkline: { enabled: true },
      animations: { enabled: false },
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0,
        stops: [0, 100],
      },
    },
    colors: [color],
    tooltip: {
      fixed: { enabled: false },
      x: { show: false },
      y: { title: { formatter: () => "" } },
      marker: { show: false },
    },
  };

  return (
    <div className="h-10 w-full mt-2">
      <ReactApexChart options={options} series={[{ data }]} type="area" height={40} width="100%" />
    </div>
  );
};

export const EcommerceMetrics = () => {
  const metrics = [
    {
      title: "TOTAL USERS",
      value: "12,847",
      change: "12.5%",
      isPositive: true,
      color: "#22c55e", // green-500
      icon: <GroupIcon className="text-green-600 size-5" />,
      bg: "bg-green-100",
      data: [10, 15, 12, 18, 14, 22, 20],
    },
    {
      title: "TOTAL TRADERS",
      value: "2,153",
      change: "8.1%",
      isPositive: true,
      color: "#f97316", // orange-500
      icon: <UserCircleIcon className="text-orange-600 size-5" />,
      bg: "bg-orange-100",
      data: [5, 10, 15, 12, 18, 20, 25],
    },
    {
      title: "ACTIVE JOBS",
      value: "1,478",
      change: "15.3%",
      isPositive: true,
      color: "#a855f7", // purple-500
      icon: <BoxCubeIcon className="text-purple-600 size-5" />,
      bg: "bg-purple-100",
      data: [12, 18, 15, 20, 18, 22, 26],
    },
    {
      title: "QUOTES SENT",
      value: "4,883",
      change: "18.7%",
      isPositive: true,
      color: "#3b82f6", // blue-500
      icon: <DocsIcon className="text-blue-600 size-5" />,
      bg: "bg-blue-100",
      data: [20, 22, 18, 25, 22, 30, 28],
    },
    {
      title: "REVENUE (MRR)",
      value: "€18,945",
      change: "16.9%",
      isPositive: true,
      color: "#10b981", // emerald-500
      icon: <EuroIcon className="text-emerald-600 size-5" />,
      bg: "bg-emerald-100",
      data: [15, 20, 22, 18, 25, 28, 30],
    },
    {
      title: "PENDING VER.",
      value: "23",
      change: "5.3%",
      isPositive: false,
      color: "#ef4444", // red-500
      icon: <TimeIcon className="text-red-600 size-5" />,
      bg: "bg-red-100",
      data: [30, 25, 28, 20, 15, 12, 10],
    },
  ];

  return (
    <div className="grid grid-cols-2 gap- sm:grid-cols-3 xl:grid-cols-6 md:gap-3 w-full">
      {metrics.map((item, index) => (
        <div
          key={index}
          className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${item.bg}`}>
              {item.icon}
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                {item.title}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-gray-900 text-lg dark:text-white">
                  {item.value}
                </span>
                <span
                  className={`text-xs font-semibold flex items-center ${item.isPositive ? "text-green-500" : "text-red-500"
                    }`}
                >
                  {item.isPositive ? (
                    <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                  ) : (
                    <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                  )}
                  {item.change}
                </span>
              </div>
              <span className="text-[10px] text-gray-400 mt-0.5">vs last month</span>
            </div>
          </div>

          <SparklineChart color={item.color} data={item.data} />
        </div>
      ))}
    </div>
  );
};
