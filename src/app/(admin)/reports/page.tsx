import type { Metadata } from "next";
import ReportsPageClient from "./ReportsPageClient";

export const metadata: Metadata = {
  title: "Reports | Tuga Trades Admin",
  description: "Monitor and resolve spam, abuse, or content flags on Tuga Trades",
};

export default function ReportsPage() {
  return <ReportsPageClient />;
}
