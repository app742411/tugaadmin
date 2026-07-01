import type { Metadata } from "next";
import CustomerDetailPageClient from "./CustomerDetailPageClient";

export const metadata: Metadata = {
  title: "Customer Details | Tuga Trades Admin",
  description: "View detailed customer information and activity history",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <CustomerDetailPageClient id={id} />;
}
