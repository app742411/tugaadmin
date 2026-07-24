"use client";
import React from "react";
import Switch from "../form/switch/Switch";

export default function MaintenanceModeCard() {
  return (
    <div className="p-5 border border-gray-200 rounded-xl dark:border-gray-800 lg:p-6 bg-white dark:bg-white/[0.03]">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Maintenance Mode
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-450 max-w-xl leading-relaxed">
            Activating maintenance mode restricts platform registration, login, and user interactions. Only administrative accounts will be allowed to bypass restrictions.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-gray-50/50 dark:bg-gray-950/20 px-4 py-3.5 rounded-xl border border-gray-100 dark:border-gray-800 flex-shrink-0">
          <Switch
            label="Maintenance Mode (Disabled)"
            defaultChecked={false}
            disabled={true}
          />
        </div>
      </div>
    </div>
  );
}
