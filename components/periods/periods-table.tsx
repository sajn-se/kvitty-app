import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Lock, Calendar } from "@phosphor-icons/react/dist/ssr";
import { format } from "date-fns";
import { sv } from "date-fns/locale/sv";

interface Period {
  id: string;
  label: string;
  urlSlug: string;
  startDate: string;
  endDate: string;
  isLocked: boolean;
  lockedAt: Date | null;
}

interface PeriodsTableProps {
  periods: Period[];
  workspaceSlug: string;
}

export function PeriodsTable({ periods, workspaceSlug }: PeriodsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Period</TableHead>
          <TableHead>Startdatum</TableHead>
          <TableHead>Slutdatum</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {periods.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center text-muted-foreground">
              Inga perioder hittades
            </TableCell>
          </TableRow>
        ) : (
          periods.map((period) => (
            <TableRow key={period.id}>
              <TableCell>
                <Link
                  href={`/${workspaceSlug}/${period.urlSlug}`}
                  className="font-medium hover:underline"
                >
                  {period.label}
                </Link>
              </TableCell>
              <TableCell>
                {format(new Date(period.startDate), "d MMM yyyy", {
                  locale: sv,
                })}
              </TableCell>
              <TableCell>
                {format(new Date(period.endDate), "d MMM yyyy", {
                  locale: sv,
                })}
              </TableCell>
              <TableCell>
                {period.isLocked ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="gap-1">
                      <Lock className="size-3" />
                      Låst
                    </Badge>
                    {period.lockedAt && (
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(period.lockedAt), "d MMM yyyy", {
                          locale: sv,
                        })}
                      </span>
                    )}
                  </div>
                ) : (
                  <Badge variant="secondary" className="gap-1">
                    <Calendar className="size-3" />
                    Öppen
                  </Badge>
                )}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
