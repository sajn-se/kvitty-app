import type { Metadata } from "next";
import { BookkeepingPageClient } from "@/components/bookkeeping/bookkeeping-page-client";

export const metadata: Metadata = {
  title: "Verifikationer — Kvitty",
};

export default async function BookkeepingPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceSlug: string }>;
  searchParams: Promise<{
    periodId?: string;
  }>;
}) {
  const { workspaceSlug } = await params;
  const { periodId } = await searchParams;

  return (
    <BookkeepingPageClient
      workspaceSlug={workspaceSlug}
      initialPeriodId={periodId || ""}
    />
  );
}
