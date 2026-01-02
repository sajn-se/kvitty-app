"use client";

import { useState } from "react";
import { House, Gear, Users, SignOut, User } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { NavPeriods } from "@/components/nav-periods";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AddPeriodDialog } from "@/components/periods/add-period-dialog";
import { AddVerificationDialog } from "@/components/verifications/add-verification-dialog";
import type { workspaces, fiscalPeriods } from "@/lib/db/schema";
import { signOut } from "@/lib/auth-client";
import { clearUserCookie } from "@/lib/user-cookie";

type Workspace = typeof workspaces.$inferSelect;
type FiscalPeriod = typeof fiscalPeriods.$inferSelect;

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  workspace: Workspace;
  workspaces: Workspace[];
  periods: FiscalPeriod[];
  user: {
    id: string;
    email: string;
    name?: string | null;
  };
}

export function AppSidebar({
  workspace,
  workspaces,
  periods,
  user,
  ...props
}: AppSidebarProps) {
  const pathname = usePathname();
  const [addPeriodOpen, setAddPeriodOpen] = useState(false);
  const [addVerificationOpen, setAddVerificationOpen] = useState(false);

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email.slice(0, 2).toUpperCase();

  return (
    <>
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <WorkspaceSwitcher
            workspaces={workspaces}
            currentWorkspace={workspace}
          />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Meny</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === `/${workspace.slug}`}
                  tooltip="Översikt"
                >
                  <Link href={`/${workspace.slug}`}>
                    <House className="size-4" weight="duotone" />
                    <span>Översikt</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          <NavPeriods
            periods={periods}
            workspaceSlug={workspace.slug}
            onAddPeriod={() => setAddPeriodOpen(true)}
            onAddVerification={() => setAddVerificationOpen(true)}
          />

          <SidebarGroup className="mt-auto">
            <SidebarGroupLabel>Inställningar</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Medlemmar">
                  <Link href={`/${workspace.slug}/members`}>
                    <Users className="size-4" weight="duotone" />
                    <span>Medlemmar</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Inställningar">
                  <Link href={`/${workspace.slug}/settings`}>
                    <Gear className="size-4" weight="duotone" />
                    <span>Inställningar</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="size-8">
                      <AvatarFallback className="text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">
                        {user.name || "Användare"}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuItem asChild>
                    <Link href="/user/settings">
                      <User className="size-4 mr-2" weight="duotone" />
                      Inställningar
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      clearUserCookie();
                      signOut().then(() => { window.location.href = "/"; });
                    }}
                    className="text-red-600"
                  >
                    <SignOut className="size-4 mr-2" />
                    Logga ut
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <AddPeriodDialog
        workspaceId={workspace.id}
        workspaceSlug={workspace.slug}
        open={addPeriodOpen}
        onOpenChange={setAddPeriodOpen}
      />

      <AddVerificationDialog
        workspaceId={workspace.id}
        periods={periods}
        open={addVerificationOpen}
        onOpenChange={setAddVerificationOpen}
      />
    </>
  );
}
