"use client";

import { useState } from "react";
import { CaretDown, CaretRight } from "@phosphor-icons/react";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { formatCurrencyFromOre } from "@/lib/utils";

interface NebilagaFieldMappingDialogProps {
  workspaceId: string;
  fiscalPeriodId: string;
  field: string;
  fieldLabel: string;
  open: boolean;
  onClose: () => void;
}

export function NebilagaFieldMappingDialog({
  workspaceId,
  fiscalPeriodId,
  field,
  fieldLabel,
  open,
  onClose,
}: NebilagaFieldMappingDialogProps) {
  const [accountsOpen, setAccountsOpen] = useState(true);
  const [verificationsOpen, setVerificationsOpen] = useState(true);
  const [openingOpen, setOpeningOpen] = useState(false);

  const { data, isLoading } = trpc.nebilaga.getFieldMapping.useQuery(
    { workspaceId, fiscalPeriodId, field },
    { enabled: open }
  );

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Mappingar för rutan {field}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="text-sm text-muted-foreground mb-4">
          {fieldLabel}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : data ? (
          <div className="space-y-2">
            {/* Mapped Accounts */}
            <Collapsible open={accountsOpen} onOpenChange={setAccountsOpen} className="border rounded-lg">
              <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 font-medium hover:bg-muted/50">
                <span>Mappade konton</span>
                {accountsOpen ? <CaretDown className="h-4 w-4" /> : <CaretRight className="h-4 w-4" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4">
                {data.accounts.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20">Konto</TableHead>
                        <TableHead>Namn</TableHead>
                        <TableHead className="text-right">Saldo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.accounts.map((account) => (
                        <TableRow key={account.accountNumber}>
                          <TableCell className="font-mono">
                            {account.accountNumber}
                          </TableCell>
                          <TableCell>{account.accountName}</TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrencyFromOre(account.balance)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Inga konton mappade till denna ruta.
                  </p>
                )}
              </CollapsibleContent>
            </Collapsible>

            {/* Verifications */}
            <Collapsible open={verificationsOpen} onOpenChange={setVerificationsOpen} className="border rounded-lg">
              <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 font-medium hover:bg-muted/50">
                <span>Verifikationer</span>
                {verificationsOpen ? <CaretDown className="h-4 w-4" /> : <CaretRight className="h-4 w-4" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4">
                {data.verifications.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Ver</TableHead>
                        <TableHead>Beskrivning</TableHead>
                        <TableHead className="w-20">Konto</TableHead>
                        <TableHead className="text-right">Summa</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.verifications.map((ver, idx) => (
                        <TableRow key={`${ver.verificationNumber}-${idx}`}>
                          <TableCell className="font-mono">
                            V{ver.verificationNumber}
                          </TableCell>
                          <TableCell className="truncate max-w-[200px]">
                            {ver.description}
                          </TableCell>
                          <TableCell className="font-mono">
                            {ver.accountNumber}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrencyFromOre(ver.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Inga verifikationer hittades för denna ruta.
                  </p>
                )}
              </CollapsibleContent>
            </Collapsible>

            {/* Opening Balance */}
            <Collapsible open={openingOpen} onOpenChange={setOpeningOpen} className="border rounded-lg">
              <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 font-medium hover:bg-muted/50">
                <span>Ingående balanser</span>
                {openingOpen ? <CaretDown className="h-4 w-4" /> : <CaretRight className="h-4 w-4" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Ingående balans</span>
                  <span className="font-mono">
                    {formatCurrencyFromOre(data.openingBalance)}
                  </span>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Kunde inte ladda mappningar.
          </p>
        )}

        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={onClose}>
            Stäng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
