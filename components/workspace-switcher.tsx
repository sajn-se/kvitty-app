"use client";

import * as React from "react";
import Link from "next/link";
import { CaretUpDown, Plus, Receipt, Users, Gear, Check } from "@phosphor-icons/react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { trpc } from "@/lib/trpc/client";
import type { workspaces } from "@/lib/db/schema";

type Workspace = typeof workspaces.$inferSelect;

function formatOrgNumber(orgNumber: string | null | undefined): string {
  if (!orgNumber) return "";
  if (orgNumber.length === 10) {
    return `${orgNumber.slice(0, 6)}-${orgNumber.slice(6)}`;
  }
  if (orgNumber.length === 12) {
    return `${orgNumber.slice(0, 10)}-${orgNumber.slice(10)}`;
  }
  return orgNumber;
}

export function WorkspaceSwitcher({
  workspaces,
  currentWorkspace,
}: {
  workspaces: Workspace[];
  currentWorkspace: Workspace;
}) {
  const { isMobile } = useSidebar();
  const displayValue = currentWorkspace.orgNumber
    ? formatOrgNumber(currentWorkspace.orgNumber)
    : currentWorkspace.slug;

  const { data: members } = trpc.members.list.useQuery(
    { workspaceId: currentWorkspace.id },
    { enabled: !!currentWorkspace.id }
  );

  const memberCount = members?.length ?? 0;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary flex aspect-square size-8 items-center justify-center rounded-lg [&_svg]:text-sidebar-primary-foreground">
                <Receipt className="size-4" weight="duotone" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {currentWorkspace.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {displayValue}
                </span>
              </div>
              <CaretUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-64 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel>Arbetsytor</DropdownMenuLabel>
            {workspaces.map((workspace) => {
              const isActive = workspace.id === currentWorkspace.id;
              return (
                <DropdownMenuItem key={workspace.id} asChild>
                  <Link href={`/${workspace.slug}`} className="flex items-center gap-2">
                    <div className="bg-sidebar-primary flex aspect-square size-8 items-center justify-center rounded-lg isolate [&_svg]:text-sidebar-primary-foreground!">
                      <Receipt className="size-4" weight="duotone" style={{ color: 'hsl(var(--sidebar-primary-foreground))', fill: 'currentColor' }} />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="truncate font-medium">{workspace.name}</span>
                      {workspace.orgNumber && (
                        <span className="truncate text-xs text-muted-foreground">
                          {formatOrgNumber(workspace.orgNumber)}
                        </span>
                      )}
                    </div>
                    {isActive && (
                      <Check className="size-4 ml-auto" weight="bold" />
                    )}
                  </Link>
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/${currentWorkspace.slug}/medlemmar`} className="flex items-center gap-2">
                <Users className="size-4" weight="duotone" />
                <div className="flex flex-row items-center gap-1 justify-between flex-1 min-w-0">
                  <span className="font-medium">Medlemmar</span>{" "}<span className=" text-muted-foreground">({memberCount})</span>
                </div>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/${currentWorkspace.slug}/installningar`} className="flex items-center gap-2">
                <Gear className="size-4" weight="duotone" />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-medium">Inställningar</span>
                </div>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/new-workspace" className="flex items-center gap-2">
                <Plus className="size-4" />
                <span>Ny arbetsyta</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
