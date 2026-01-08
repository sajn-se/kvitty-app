"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Plus, Minus, FileText, Swap, CalendarBlank, Tray } from "@phosphor-icons/react";

import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel,
  SidebarMenu,
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
  isFullMode = false,
  expanded = true,
  onExpandedChange,
}: {
  workspaceSlug: string;
  onAddVerification?: () => void;
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
                isActive={pathname === `/${workspaceSlug}/transaktioner`}
              >
                <Link href={`/${workspaceSlug}/transaktioner`}>
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
                  isActive={pathname === `/${workspaceSlug}/verifikationer`}
                >
                  <Link href={`/${workspaceSlug}/verifikationer`}>
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
                isActive={pathname === `/${workspaceSlug}/perioder`}
              >
                <Link href={`/${workspaceSlug}/perioder`}>
                  <CalendarBlank className="size-4" weight="duotone" />
                  <span>Perioder</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </CollapsibleContent>
      </Collapsible>
    </SidebarGroup>
  );
}
