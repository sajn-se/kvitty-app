"use client";

import { Calendar, CheckCircle, Warning, WarningCircle } from "@phosphor-icons/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc/client";
import { format } from "date-fns";
import { sv } from "date-fns/locale";

interface AGIDeadlineCardProps {
  payrollRunId: string;
  workspaceId: string;
  agiDeadline?: string | null;
  agiConfirmedAt?: Date | null;
  hasAGI: boolean;
}

export function AGIDeadlineCard({
  payrollRunId,
  workspaceId,
  agiDeadline,
  agiConfirmedAt,
  hasAGI,
}: AGIDeadlineCardProps) {
  const utils = trpc.useUtils();

  const confirmAGI = trpc.payroll.confirmAGIReported.useMutation({
    onSuccess: () => {
      utils.payroll.getRun.invalidate({ id: payrollRunId, workspaceId });
    },
  });

  if (!agiDeadline) {
    return null;
  }

  const deadlineDate = new Date(agiDeadline);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadlineDate.setHours(0, 0, 0, 0);

  const isOverdue = deadlineDate < today;
  const isConfirmed = !!agiConfirmedAt;
  const daysUntilDeadline = Math.ceil(
    (deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  const getStatusBadge = () => {
    if (isConfirmed) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="size-3 mr-1" />
          Bekräftad
        </Badge>
      );
    }
    if (isOverdue) {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <WarningCircle className="size-3 mr-1" />
          Försenad
        </Badge>
      );
    }
    if (daysUntilDeadline <= 7) {
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <Warning className="size-3 mr-1" />
          Snart förfallodatum
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        <Calendar className="size-3 mr-1" />
        Kommande
      </Badge>
    );
  };

  return (
    <Card className={isOverdue && !isConfirmed ? "border-red-200" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="size-5" />
              AGI-deadline
            </CardTitle>
            <CardDescription>
              Sista datum för att rapportera AGI till Skatteverket
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Förfallodatum:</span>
            <span
              className={`font-medium ${
                isOverdue && !isConfirmed ? "text-red-600" : ""
              }`}
            >
              {format(deadlineDate, "d MMMM yyyy", { locale: sv })}
            </span>
          </div>
          {!isConfirmed && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {isOverdue ? "Dagar över deadline:" : "Dagar kvar:"}
              </span>
              <span
                className={`font-medium ${
                  isOverdue ? "text-red-600" : daysUntilDeadline <= 7 ? "text-yellow-600" : ""
                }`}
              >
                {Math.abs(daysUntilDeadline)} {isOverdue ? "över" : "kvar"}
              </span>
            </div>
          )}
          {isConfirmed && agiConfirmedAt && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Bekräftad:</span>
              <span className="font-medium text-green-600">
                {format(new Date(agiConfirmedAt), "d MMMM yyyy", { locale: sv })}
              </span>
            </div>
          )}
        </div>

        {!isConfirmed && hasAGI && (
          <Button
            onClick={() => confirmAGI.mutate({ payrollRunId, workspaceId })}
            disabled={confirmAGI.isPending}
            variant={isOverdue ? "default" : "outline"}
            className={isOverdue ? "bg-red-600 hover:bg-red-700" : ""}
          >
            {confirmAGI.isPending ? (
              <>
                <Spinner className="size-4 mr-2" />
                Bekräftar...
              </>
            ) : (
              <>
                <CheckCircle className="size-4 mr-2" />
                Bekräfta att AGI är rapporterad
              </>
            )}
          </Button>
        )}

        {!hasAGI && (
          <p className="text-sm text-muted-foreground">
            Generera AGI-fil först innan du kan bekräfta rapportering.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

