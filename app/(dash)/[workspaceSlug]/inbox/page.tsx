import type { Metadata } from "next";
import { InboxPageClient } from "@/components/inbox/inbox-page-client";

export const metadata: Metadata = {
  title: "Inkorg — Kvitty",
};

export default async function InboxPage() {
  return <InboxPageClient />;
}
