"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { CaretRight, Plus, FileText } from "@phosphor-icons/react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import type { fiscalPeriods } from "@/lib/db/schema";

type FiscalPeriod = typeof fiscalPeriods.$inferSelect;

export function NavPeriods({
  periods,
  workspaceSlug,
  onAddPeriod,
  onAddVerification,
}: {
  periods: FiscalPeriod[];
  workspaceSlug: string;
  onAddPeriod?: () => void;
  onAddVerification?: () => void;
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Verifikationer</SidebarGroupLabel>
      <SidebarGroupAction title="Lägg till verifikationer" onClick={onAddVerification}>
        <Plus className="size-4" />
        <span className="sr-only">Lägg till verifikationer</span>
      </SidebarGroupAction>
      <SidebarMenu>
        <Collapsible asChild defaultOpen className="group/collapsible">
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip="Perioder">
                <FileText className="size-4" weight="duotone" />
                <span>Perioder</span>
                <CaretRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {periods.map((period) => {
                  const periodPath = `/${workspaceSlug}/${period.urlSlug}`;
                  const isActive = pathname === periodPath;

                  return (
                    <SidebarMenuSubItem key={period.id}>
                      <SidebarMenuSubButton asChild isActive={isActive}>
                        <Link href={periodPath}>
                          <span>{period.label}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  );
                })}
                {periods.length === 0 && (
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton
                      asChild
                      className="text-muted-foreground"
                    >
                      <button onClick={onAddPeriod}>
                        <Plus className="size-3 mr-1" />
                        <span>Lägg till period</span>
                      </button>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                )}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      </SidebarMenu>
    </SidebarGroup>
  );
}
