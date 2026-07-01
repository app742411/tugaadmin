import type { Metadata } from "next";
import TraderDetailPageClient from "./TraderDetailPageClient";

export const metadata: Metadata = {
  title: "Trader Details | Tuga Trades Admin",
  description: "View detailed trader profile, services, categories, and subscription status",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TraderDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <TraderDetailPageClient id={id} />;
}
