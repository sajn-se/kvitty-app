"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { sv } from "date-fns/locale/sv";
import { Warning, CheckCircle, Clock } from "@phosphor-icons/react";

interface VatPaymentInfoProps {
  netVat: number;
  deadline: string;
  bankgiro: string;
  recipient: string;
  isPeriodLocked?: boolean;
  isPeriodClosed?: boolean;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function VatPaymentInfo({
  netVat,
  deadline,
  bankgiro,
  recipient,
  isPeriodLocked,
  isPeriodClosed,
}: VatPaymentInfoProps) {
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const isOverdue = deadlineDate < now;
  const isUpcoming = !isOverdue && deadlineDate.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000;

  const shouldPay = netVat > 0;
  const shouldReclaim = netVat < 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>
              {shouldPay ? "Moms att betala" : shouldReclaim ? "Moms att få tillbaka" : "Moms att betala"}
            </CardTitle>
            <CardDescription>
              Deadline: {format(deadlineDate, "d MMMM yyyy", { locale: sv })}
            </CardDescription>
          </div>
          {isOverdue && !isPeriodClosed && (
            <Badge variant="destructive" className="gap-1">
              <Warning className="size-3" />
              Förfallen
            </Badge>
          )}
          {isUpcoming && !isOverdue && !isPeriodClosed && (
            <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-600">
              <Clock className="size-3" />
              Snart deadline
            </Badge>
          )}
          {isPeriodClosed && (
            <Badge variant="secondary" className="gap-1">
              <CheckCircle className="size-3" />
              Stängd
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-3xl font-bold">
            {formatCurrency(Math.abs(netVat))}
          </div>

          {shouldPay && !isPeriodClosed && (
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                Betala till {recipient}:
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Bankgiro:</span>
                  <p className="font-mono font-medium">{bankgiro}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Belopp:</span>
                  <p className="font-mono font-medium">{formatCurrency(netVat)}</p>
                </div>
              </div>
            </div>
          )}

          {shouldReclaim && !isPeriodClosed && (
            <div className="rounded-lg bg-green-50 dark:bg-green-950 p-4">
              <p className="text-sm text-green-700 dark:text-green-300">
                Du har {formatCurrency(Math.abs(netVat))} i ingående moms att dra av.
                Detta belopp kommer att krediteras på ditt skattekonto.
              </p>
            </div>
          )}

          {isPeriodLocked && (
            <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950 p-4">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Bokslutet är gjort för detta år. Året är stängt och nya transaktioner
                kan inte bokföras.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
