import type { Metadata } from "next";
import JobsPageClient from "./JobsPageClient";

export const metadata: Metadata = {
  title: "Jobs | Tuga Trades Admin",
  description: "Manage and inspect client jobs posted on Tuga Trades",
};

export default function JobsPage() {
  return <JobsPageClient />;
}
