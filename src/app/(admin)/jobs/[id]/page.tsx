import type { Metadata } from "next";
import JobDetailPageClient from "./JobDetailPageClient";

export const metadata: Metadata = {
  title: "Job Details | Tuga Trades Admin",
  description: "View detailed job specifications, matched traders, and escalation logs",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <JobDetailPageClient id={id} />;
}
