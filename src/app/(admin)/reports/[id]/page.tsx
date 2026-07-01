import type { Metadata } from "next";
import ReportDetailPageClient from "./ReportDetailPageClient";

export const metadata: Metadata = {
  title: "Report Details | Tuga Trades Admin",
  description: "View detailed flag report information, targets, and administrative action logs",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ReportDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <ReportDetailPageClient id={id} />;
}
