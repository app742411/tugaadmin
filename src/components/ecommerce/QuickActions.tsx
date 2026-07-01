import React from 'react';
import { UserCircleIcon, BoxCubeIcon, DocsIcon, GroupIcon, TimeIcon } from '@/icons'; // Reuse available icons

export default function QuickActions() {
  const actions = [
    {
      title: "Add New Trader",
      icon: <UserCircleIcon className="w-6 h-6 text-green-500" />,
      bg: "bg-green-50",
    },
    {
      title: "Post a Job",
      icon: <BoxCubeIcon className="w-6 h-6 text-blue-500" />,
      bg: "bg-blue-50",
    },
    {
      title: "Create Quote",
      icon: <DocsIcon className="w-6 h-6 text-purple-500" />,
      bg: "bg-purple-50",
    },
    {
      title: "Verify Trader",
      icon: <GroupIcon className="w-6 h-6 text-orange-500" />,
      bg: "bg-orange-50",
    },
    {
      title: "View Reports",
      icon: <TimeIcon className="w-6 h-6 text-emerald-500" />,
      bg: "bg-emerald-50",
    },
    {
      title: "System Settings",
      icon: (
        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
      ),
      bg: "bg-gray-100",
    }
  ];

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 w-full h-full flex flex-col">
      <h3 className="text-base font-bold text-gray-900 dark:text-white mb-6">
        Quick Actions
      </h3>

      <div className="grid grid-cols-2 gap-4 flex-1">
        {actions.map((action, idx) => (
          <button
            key={idx}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-50 hover:border-gray-200 bg-gray-50/50 hover:bg-gray-50 transition-all dark:border-gray-800 dark:bg-gray-800/50 dark:hover:bg-gray-800 group"
          >
            <div className={`p-3 rounded-xl mb-3 ${action.bg} dark:bg-opacity-10 transition-transform group-hover:scale-110`}>
              {action.icon}
            </div>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              {action.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
