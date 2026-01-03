"use client";

import { WarningCircle } from "@phosphor-icons/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc/client";
import Link from "next/link";

interface OverdueInvoicesWidgetProps {
  workspaceId: string;
  workspaceSlug: string;
}

function formatCurrency(amount: string): string {
  const num = parseFloat(amount);
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function OverdueInvoicesWidget({
  workspaceId,
  workspaceSlug,
}: OverdueInvoicesWidgetProps) {
  const { data: overdueInvoices, isLoading } =
    trpc.invoices.listOverdue.useQuery({
      workspaceId,
      limit: 5,
    });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Förfallna fakturor</CardTitle>
          <CardDescription>Fakturor som passerat förfallodatum</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Spinner className="size-6" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!overdueInvoices || overdueInvoices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Förfallna fakturor</CardTitle>
          <CardDescription>Fakturor som passerat förfallodatum</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Inga förfallna fakturor
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Förfallna fakturor</CardTitle>
            <CardDescription>
              Fakturor som passerat förfallodatum
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800"
          >
            <WarningCircle className="size-3 mr-1" />
            {overdueInvoices.length} förfallen
            {overdueInvoices.length > 1 ? "a" : ""}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {overdueInvoices.map((invoice) => (
          <div
            key={invoice.id}
            className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/50 rounded-md border border-red-200 dark:border-red-800"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <WarningCircle className="size-4 text-red-600 dark:text-red-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">
                  {invoice.customer?.name || "Okänd kund"}
                </div>
                <div className="text-xs text-muted-foreground">
                  Faktura #{invoice.invoiceNumber} &middot;{" "}
                  <span className="text-red-600 dark:text-red-400 font-medium">
                    {invoice.daysOverdue} dagar försenad
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm font-semibold text-right">
                {formatCurrency(invoice.total)}
              </div>
              <Link href={`/${workspaceSlug}/fakturor/${invoice.id}`}>
                <Button variant="outline" size="sm">
                  Öppna
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
