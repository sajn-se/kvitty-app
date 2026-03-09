"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Plus, Minus, FileText, Swap, CalendarBlank, Tray } from "@phosphor-icons/react";

import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export function NavPeriods({
  workspaceSlug,
  onAddVerification,
  onAddPeriod,
  isFullMode = false,
  expanded = true,
  onExpandedChange,
}: {
  workspaceSlug: string;
  onAddVerification?: () => void;
  onAddPeriod?: () => void;
  isFullMode?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <Collapsible open={expanded} onOpenChange={onExpandedChange} className="group/collapsible">
        <SidebarGroupLabel asChild>
          <CollapsibleTrigger className="w-full flex items-center justify-between group">
            <span>{isFullMode ? "Bokföring" : "Transaktioner"}</span>
            <div className="relative size-3.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <Plus className={`absolute inset-0 size-3.5 transition-all duration-200 ${expanded ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'}`} />
              <Minus className={`absolute inset-0 size-3.5 transition-all duration-200 ${expanded ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`} />
            </div>
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        {isFullMode && onAddVerification && (
          <SidebarGroupAction title="Ny verifikation" onClick={onAddVerification}>
            <Plus className="size-4" />
            <span className="sr-only">Ny verifikation</span>
          </SidebarGroupAction>
        )}
        <CollapsibleContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Transaktioner"
                isActive={pathname === `/${workspaceSlug}/transactions`}
              >
                <Link href={`/${workspaceSlug}/transactions`}>
                  <Swap className="size-4" weight="duotone" />
                  <span>Transaktioner</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Inkorg"
                isActive={pathname === `/${workspaceSlug}/inbox`}
              >
                <Link href={`/${workspaceSlug}/inbox`}>
                  <Tray className="size-4" weight="duotone" />
                  <span>Inkorg</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {isFullMode && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Verifikationer"
                  isActive={pathname === `/${workspaceSlug}/verifications`}
                >
                  <Link href={`/${workspaceSlug}/verifications`}>
                    <FileText className="size-4" weight="duotone" />
                    <span>Verifikationer</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Perioder"
                isActive={pathname === `/${workspaceSlug}/periods`}
              >
                <Link href={`/${workspaceSlug}/periods`}>
                  <CalendarBlank className="size-4" weight="duotone" />
                  <span>Perioder</span>
                </Link>
              </SidebarMenuButton>
              {onAddPeriod && (
                <SidebarMenuAction showOnHover onClick={onAddPeriod} title="Ny period">
                  <Plus className="size-4" />
                </SidebarMenuAction>
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </CollapsibleContent>
      </Collapsible>
    </SidebarGroup>
  );
}
