"use client";

import { useState } from "react";
import {
  HouseIcon,
  Gear,
  Users,
  SignOut,
  User,
  Bank,
  Money,
  UserList,
  Receipt,
  Plus,
  Minus,
  Lock,
  AddressBook,
  Invoice,
  Package,
  ChartLine,
  Scales,
  Percent,
  BookOpen,
} from "@phosphor-icons/react";
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AddPeriodDialog } from "@/components/periods/add-period-dialog";
import { AddJournalEntryDialog } from "@/components/journal-entry/add-journal-entry-dialog";
import type { Workspace, BankAccount } from "@/lib/db/schema";
import type { fiscalPeriods } from "@/lib/db/schema";
import { signOut } from "@/lib/auth-client";
import { clearUserCookie } from "@/lib/user-cookie";
import { trpc } from "@/lib/trpc/client";

type FiscalPeriod = typeof fiscalPeriods.$inferSelect;

interface FullModeSidebarProps extends React.ComponentProps<typeof Sidebar> {
  workspace: Workspace;
  workspaces: Workspace[];
  periods: FiscalPeriod[];
  user: {
    id: string;
    email: string;
    name?: string | null;
  };
}

export function FullModeSidebar({
  workspace,
  workspaces,
  periods,
  user,
  ...props
}: FullModeSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [addPeriodOpen, setAddPeriodOpen] = useState(false);
  const [addEntryOpen, setAddEntryOpen] = useState(false);
  const [bankExpanded, setBankExpanded] = useState(true);

  const { data: bankAccounts } = trpc.bankAccounts.list.useQuery(
    { workspaceId: workspace.id },
    { enabled: workspace.mode === "full_bookkeeping" }
  );

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
          {/* Main Menu */}
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
                    <HouseIcon className="size-4" weight="duotone" />
                    <span>Översikt</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          {/* Bokföring */}
          <NavPeriods
            workspaceSlug={workspace.slug}
            onAddVerification={() => setAddEntryOpen(true)}
            isFullMode
          />

          {/* Försäljning */}
          <SidebarGroup>
            <SidebarGroupLabel>Försäljning</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === `/${workspace.slug}/kunder`}
                  tooltip="Kunder"
                >
                  <Link href={`/${workspace.slug}/kunder`}>
                    <AddressBook className="size-4" weight="duotone" />
                    <span>Kunder</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === `/${workspace.slug}/fakturor`}
                  tooltip="Fakturor"
                >
                  <Link href={`/${workspace.slug}/fakturor`}>
                    <Invoice className="size-4" weight="duotone" />
                    <span>Fakturor</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === `/${workspace.slug}/produkter`}
                  tooltip="Produkter"
                >
                  <Link href={`/${workspace.slug}/produkter`}>
                    <Package className="size-4" weight="duotone" />
                    <span>Produkter</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          {/* Personal & Löner */}
          <SidebarGroup>
            <SidebarGroupLabel>Personal & Löner</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === `/${workspace.slug}/personal`}
                  tooltip="Personal"
                >
                  <Link href={`/${workspace.slug}/personal`}>
                    <UserList className="size-4" weight="duotone" />
                    <span>Personal</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(`/${workspace.slug}/personal/lon`)}
                  tooltip="Lönekörningar"
                >
                  <Link href={`/${workspace.slug}/personal/lon`}>
                    <Money className="size-4" weight="duotone" />
                    <span>Lönekörningar</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          {/* Rapporter */}
          <SidebarGroup>
            <SidebarGroupLabel>Rapporter</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === `/${workspace.slug}/rapporter/resultat`}
                  tooltip="Resultatrapport"
                >
                  <Link href={`/${workspace.slug}/rapporter/resultat`}>
                    <ChartLine className="size-4" weight="duotone" />
                    <span>Resultatrapport</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === `/${workspace.slug}/rapporter/balans`}
                  tooltip="Balansrapport"
                >
                  <Link href={`/${workspace.slug}/rapporter/balans`}>
                    <Scales className="size-4" weight="duotone" />
                    <span>Balansrapport</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === `/${workspace.slug}/rapporter/moms`}
                  tooltip="Momsrapport"
                >
                  <Link href={`/${workspace.slug}/rapporter/moms`}>
                    <Percent className="size-4" weight="duotone" />
                    <span>Momsrapport</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          {/* Bokföring och bokslut */}
          <SidebarGroup>
            <SidebarGroupLabel>Bokföring och bokslut</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === `/${workspace.slug}/bokslut`}
                  tooltip="Årsbokslut"
                >
                  <Link href={`/${workspace.slug}/bokslut`}>
                    <BookOpen className="size-4" weight="duotone" />
                    <span>Årsbokslut</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          {/* Bank */}
          <SidebarGroup>
            <Collapsible open={bankExpanded} onOpenChange={setBankExpanded} className="group/collapsible">
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="w-full flex items-center justify-between group">
                  <span>Bank</span>
                  <div className="relative size-3.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className={`absolute inset-0 size-3.5 transition-all duration-200 ${bankExpanded ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'}`} />
                    <Minus className={`absolute inset-0 size-3.5 transition-all duration-200 ${bankExpanded ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`} />
                  </div>
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent className="overflow-hidden">
                <SidebarMenu>
                  {bankAccounts?.map((account) => (
                    <SidebarMenuItem key={account.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === `/${workspace.slug}/bank/${account.accountNumber}`}
                        tooltip={account.name}
                      >
                        <Link href={`/${workspace.slug}/bank/${account.accountNumber}`}>
                          <Bank className="size-4" weight="duotone" />
                          <span className="truncate">
                            {account.accountNumber} {account.name}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Lägg till konto">
                      <Link href={`/${workspace.slug}/bank`}>
                        <Plus className="size-4" />
                        <span>Hantera konton</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>

          {/* Settings */}
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

      {addEntryOpen && (
        <AddJournalEntryDialog
          workspaceId={workspace.id}
          periods={periods}
          open={addEntryOpen}
          onOpenChange={setAddEntryOpen}
        />
      )}
    </>
  );
}
