import UserInfoCard from "@/components/user-profile/UserInfoCard";
import UserMetaCard from "@/components/user-profile/UserMetaCard";
import ChangePasswordCard from "@/components/user-profile/ChangePasswordCard";
import MaintenanceModeCard from "@/components/user-profile/MaintenanceModeCard";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Profile",
  description: "Tuga Trades Admin Dashboard",
};

export default function Profile() {
  return (
    <div>
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3>
        <div className="space-y-6">
          <UserMetaCard />
          <UserInfoCard />
          <ChangePasswordCard />
          <MaintenanceModeCard />
        </div>
      </div>
    </div>
  );
}
