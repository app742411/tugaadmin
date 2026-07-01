import React from "react";
import { Metadata } from "next";
import NotFoundContent from "@/components/common/NotFoundContent";

export const metadata: Metadata = {
  title: "Error 404",
  description: "Tuga Trades Admin Dashboard",
};

export default function Error404() {
  return <NotFoundContent />;
}
