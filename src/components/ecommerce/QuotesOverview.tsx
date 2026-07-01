"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function QuotesOverview() {
  const options: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "Manrope, sans-serif",
    },
    colors: ["#6E9625", "#374151", "#D1D5DB"], // Green, Dark Gray, Light Gray
    labels: ["Accepted", "Declined", "Expired"],
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "75%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "14px",
              color: "#6B7280",
              offsetY: 20,
            },
            value: {
              show: true,
              fontSize: "28px",
              fontWeight: 800,
              color: "#111827",
              offsetY: -10,
              formatter: function (val) {
                return "4,883";
              },
            },
            total: {
              show: true,
              showAlways: true,
              label: "Total Quotes Sent",
              fontSize: "12px",
              color: "#6B7280",
              fontWeight: 500,
              formatter: function (w) {
                return "4,883";
              },
            },
          },
        },
      },
    },
    stroke: {
      show: true,
      colors: ["#fff"],
      width: 4,
    },
    legend: {
      show: false,
    },
    tooltip: {
      enabled: true,
      theme: "light",
      y: {
        formatter: (val) => `${val}`,
      },
    },
  };

  const series = [2865, 1280, 738]; // Accepted, Declined, Expired

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 w-full h-full flex flex-col">
      <h3 className="text-base font-bold text-gray-900 dark:text-white mb-6">
        Quotes Overview
      </h3>

      <div className="flex flex-col sm:flex-row items-center justify-between flex-1 gap-6">
        {/* Donut Chart */}
        <div className="relative w-full max-w-[220px] mx-auto sm:mx-0">
          <ReactApexChart options={options} series={series} type="donut" height={220} />
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-4 min-w-[140px]">
          {/* Legend Item 1 */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#6E9625]"></span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Accepted</span>
            </div>
            <div className="text-xs text-gray-500 pl-4 mt-0.5">2,865 (58.7%)</div>
          </div>
          {/* Legend Item 2 */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gray-700"></span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Declined</span>
            </div>
            <div className="text-xs text-gray-500 pl-4 mt-0.5">1,280 (26.2%)</div>
          </div>
          {/* Legend Item 3 */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gray-300"></span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Expired</span>
            </div>
            <div className="text-xs text-gray-500 pl-4 mt-0.5">738 (15.1%)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
