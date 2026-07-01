"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function RevenueOverview() {
  const options: ApexOptions = {
    colors: ["#6E9625"],
    chart: {
      fontFamily: "Manrope, sans-serif",
      type: "bar",
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: "40%",
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
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
        },
      },
    },
    yaxis: {
      min: 0,
      max: 25000,
      tickAmount: 5,
      labels: {
        style: {
          colors: "#9CA3AF",
          fontSize: "11px",
          fontFamily: "Manrope, sans-serif",
        },
        formatter: (value) => value >= 1000 ? `${value / 1000}K` : `${value}`,
      },
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
        },
      },
    },
    tooltip: {
      theme: "light",
      y: {
        formatter: (val) => `€${val}`,
      },
    },
  };

  const series = [
    {
      name: "Revenue",
      data: [8000, 11000, 15000, 18000, 22000, 24000],
    },
  ];

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">
          Revenue Overview
        </h3>
        <button className="flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 px-2 py-1 rounded-md border border-gray-100 dark:border-gray-700">
          This Year
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </button>
      </div>

      <div className="mb-4">
        <div className="text-2xl font-extrabold text-gray-900 dark:text-white">€18,945</div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs font-semibold text-gray-500">Total Revenue (MRR)</span>
        </div>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs font-semibold flex items-center text-green-500">
            <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
            16.9%
          </span>
          <span className="text-[10px] text-gray-400">vs last month</span>
        </div>
      </div>

      <div className="flex-1 w-full overflow-hidden">
        <div className="-ml-3 w-full pr-1">
          <ReactApexChart options={options} series={series} type="bar" height={190} />
        </div>
      </div>
    </div>
  );
}
