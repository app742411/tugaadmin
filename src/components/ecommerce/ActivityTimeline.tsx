import React from "react";
import { CheckLineIcon, GroupIcon, BoxCubeIcon, DocsIcon } from "@/icons"; // Reusing icons as placeholers

const timelineData = [
  {
    id: 1,
    title: "New quote accepted",
    description: "Quote #QT-4892 has been accepted",
    time: "10 min ago",
    icon: <CheckLineIcon className="w-4 h-4 text-green-600" />,
    bg: "bg-green-100",
  },
  {
    id: 2,
    title: "New trader registered",
    description: "John Smith has registered as trader",
    time: "1 hour ago",
    icon: <GroupIcon className="w-4 h-4 text-blue-600" />,
    bg: "bg-blue-100",
  },
  {
    id: 3,
    title: "New job posted",
    description: "Plumbing job in Berlin posted",
    time: "3 hours ago",
    icon: <BoxCubeIcon className="w-4 h-4 text-orange-600" />,
    bg: "bg-orange-100",
  },
  {
    id: 4,
    title: "Subscription renewed",
    description: "BuildPro Solutions renewed subscription",
    time: "5 hours ago",
    icon: <DocsIcon className="w-4 h-4 text-purple-600" />,
    bg: "bg-purple-100",
  },
];

export default function ActivityTimeline() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 w-full h-full flex flex-col">
      <h3 className="text-base font-bold text-gray-900 dark:text-white mb-6">
        Activity Timeline
      </h3>

      <div className="relative border-l border-gray-100 dark:border-gray-800 ml-4 space-y-6">
        {timelineData.map((item) => (
          <div key={item.id} className="relative pl-6">
            {/* Timeline Dot */}
            <span className={`absolute -left-[17px] top-1 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white dark:border-gray-900 ${item.bg}`}>
              {item.icon}
            </span>

            {/* Content */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  {item.title}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {item.description}
                </p>
              </div>
              <span className="text-[10px] font-semibold text-gray-400 whitespace-nowrap">
                {item.time}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
