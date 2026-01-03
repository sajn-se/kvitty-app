"use client";

import { Calendar, WarningCircle, CheckCircle } from "@phosphor-icons/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc/client";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import Link from "next/link";

interface AGIDeadlinesWidgetProps {
  workspaceId: string;
  workspaceSlug: string;
}

export function AGIDeadlinesWidget({
  workspaceId,
  workspaceSlug,
}: AGIDeadlinesWidgetProps) {
  const { data: deadlines, isLoading } = trpc.payroll.getAGIDeadlines.useQuery({
    workspaceId,
    includePast: false,
    limit: 5,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AGI-deadlines</CardTitle>
          <CardDescription>Kommande deadlines för AGI-rapportering</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Spinner className="size-6" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!deadlines || deadlines.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AGI-deadlines</CardTitle>
          <CardDescription>Kommande deadlines för AGI-rapportering</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Inga kommande deadlines
          </p>
        </CardContent>
      </Card>
    );
  }

  const overdue = deadlines.filter((d) => d.isOverdue && !d.isConfirmed);
  const upcoming = deadlines.filter((d) => !d.isOverdue && !d.isConfirmed);
  const confirmed = deadlines.filter((d) => d.isConfirmed);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>AGI-deadlines</CardTitle>
            <CardDescription>Kommande deadlines för AGI-rapportering</CardDescription>
          </div>
          {overdue.length > 0 && (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              <WarningCircle className="size-3 mr-1" />
              {overdue.length} försenad{overdue.length > 1 ? "a" : ""}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {overdue.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-red-600 mb-2">Försenade</h3>
            <div className="space-y-2">
              {overdue.map((deadline) => (
                <div
                  key={deadline.id}
                  className="flex items-center justify-between p-2 bg-red-50 rounded-md border border-red-200"
                >
                  <div className="flex items-center gap-2">
                    <WarningCircle className="size-4 text-red-600" />
                    <div>
                      <div className="text-sm font-medium">
                        {deadline.period.substring(0, 4)}-{deadline.period.substring(4)} • Körning {deadline.runNumber}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Deadline: {format(new Date(deadline.agiDeadline!), "d MMM yyyy", { locale: sv })}
                      </div>
                    </div>
                  </div>
                  <Link href={`/${workspaceSlug}/personal/lon/${deadline.id}`}>
                    <Button variant="outline" size="sm">
                      Öppna
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {upcoming.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2">Kommande</h3>
            <div className="space-y-2">
              {upcoming.map((deadline) => (
                <div
                  key={deadline.id}
                  className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">
                        {deadline.period.substring(0, 4)}-{deadline.period.substring(4)} • Körning {deadline.runNumber}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Deadline: {format(new Date(deadline.agiDeadline!), "d MMM yyyy", { locale: sv })}
                      </div>
                    </div>
                  </div>
                  <Link href={`/${workspaceSlug}/personal/lon/${deadline.id}`}>
                    <Button variant="ghost" size="sm">
                      Öppna
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {confirmed.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-green-600 mb-2">Bekräftade</h3>
            <div className="space-y-2">
              {confirmed.map((deadline) => (
                <div
                  key={deadline.id}
                  className="flex items-center justify-between p-2 bg-green-50 rounded-md border border-green-200"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-green-600" />
                    <div>
                      <div className="text-sm font-medium">
                        {deadline.period.substring(0, 4)}-{deadline.period.substring(4)} • Körning {deadline.runNumber}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Bekräftad: {deadline.agiConfirmedAt && format(new Date(deadline.agiConfirmedAt), "d MMM yyyy", { locale: sv })}
                      </div>
                    </div>
                  </div>
                  <Link href={`/${workspaceSlug}/personal/lon/${deadline.id}`}>
                    <Button variant="ghost" size="sm">
                      Öppna
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

