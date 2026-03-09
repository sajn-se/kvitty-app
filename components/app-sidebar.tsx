"use client";

import { useState } from "react";
import { HouseIcon, Users, SignOut, User, Plus, Minus } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AddPeriodDialog } from "@/components/periods/add-period-dialog";
import { AddBankTransactionDialog } from "@/components/bank-transactions/add-bank-transaction-dialog";
import { FullModeSidebar } from "@/components/full-mode-sidebar";
import type { Workspace } from "@/lib/db/schema";
import type { fiscalPeriods } from "@/lib/db/schema";
import { signOut } from "@/lib/auth-client";
import { clearUserCookie } from "@/lib/user-cookie";

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
  // Use full mode sidebar for full_bookkeeping workspaces
  if (workspace.mode === "full_bookkeeping") {
    return (
      <FullModeSidebar
        workspace={workspace}
        workspaces={workspaces}
        periods={periods}
        user={user}
        {...props}
      />
    );
  }

  // Simple mode sidebar (original)
  return (
    <SimpleSidebar
      workspace={workspace}
      workspaces={workspaces}
      periods={periods}
      user={user}
      {...props}
    />
  );
}

// Original sidebar for simple mode
function SimpleSidebar({
  workspace,
  workspaces,
  periods,
  user,
  ...props
}: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [addPeriodOpen, setAddPeriodOpen] = useState(false);
  const [addBankTransactionOpen, setAddBankTransactionOpen] = useState(false);
  const [menuExpanded, setMenuExpanded] = useState(true);
  const [transactionsExpanded, setTransactionsExpanded] = useState(true);

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
            <Collapsible open={menuExpanded} onOpenChange={setMenuExpanded} className="group/collapsible">
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="w-full flex items-center justify-between group">
                  <span>Meny</span>
                  <div className="relative size-3.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className={`absolute inset-0 size-3.5 transition-all duration-200 ${menuExpanded ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'}`} />
                    <Minus className={`absolute inset-0 size-3.5 transition-all duration-200 ${menuExpanded ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`} />
                  </div>
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === `/${workspace.slug}`}
                      tooltip="Översikt"
                    >
                      <Link href={`/${workspace.slug}`}>
                        <HouseIcon className="size-4" weight="duotone" />
                        <span>Översikt</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>

          <NavPeriods
            workspaceSlug={workspace.slug}
            onAddVerification={() => setAddBankTransactionOpen(true)}
            onAddPeriod={() => setAddPeriodOpen(true)}
            expanded={transactionsExpanded}
            onExpandedChange={setTransactionsExpanded}
          />
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
                    onClick={async () => {
                      clearUserCookie();
                      await signOut({
                        fetchOptions: {
                          onSuccess: () => {
                            router.push("/login");
                          },
                        },
                      });
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

      <AddBankTransactionDialog
        workspaceId={workspace.id}
        open={addBankTransactionOpen}
        onOpenChange={setAddBankTransactionOpen}
      />
    </>
  );
}
