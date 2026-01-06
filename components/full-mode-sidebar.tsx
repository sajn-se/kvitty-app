"use client";

import { useState, useRef } from "react";
import {
  HouseIcon,
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
  CaretDown,
  UploadSimple,
  FileText,
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AddPeriodDialog } from "@/components/periods/add-period-dialog";
import { AddJournalEntryDialog } from "@/components/journal-entry/add-journal-entry-dialog";
import { CreateInvoiceDialog } from "@/components/invoices/create-invoice-dialog";
import { AddBankTransactionDialog } from "@/components/bank-transactions/add-bank-transaction-dialog";
import type { Workspace, BankAccount } from "@/lib/db/schema";
import type { fiscalPeriods } from "@/lib/db/schema";
import { signOut } from "@/lib/auth-client";
import { clearUserCookie } from "@/lib/user-cookie";
import { trpc } from "@/lib/trpc/client";
import type { JournalEntryLineInput } from "@/lib/validations/journal-entry";

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
  const [createInvoiceOpen, setCreateInvoiceOpen] = useState(false);
  const [addBankTransactionOpen, setAddBankTransactionOpen] = useState(false);
  const [menuExpanded, setMenuExpanded] = useState(true);
  const [bookkeepingExpanded, setBookkeepingExpanded] = useState(true);
  const [salesExpanded, setSalesExpanded] = useState(true);
  const [personnelExpanded, setPersonnelExpanded] = useState(true);
  const [reportsExpanded, setReportsExpanded] = useState(false);
  const [bookkeepingAnnualExpanded, setBookkeepingAnnualExpanded] = useState(false);
  const [bankExpanded, setBankExpanded] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedData, setAnalyzedData] = useState<{
    files: File[];
    description?: string;
    lines?: JournalEntryLineInput[];
    entryDate?: string;
  } | null>(null);

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

  const analyzeReceipt = async (file: File) => {
    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/analyze-receipt", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.data) {
        const files = [file];
        const data: {
          files: File[];
          description?: string;
          lines?: JournalEntryLineInput[];
          entryDate?: string;
        } = { files };

        if (result.data.date) {
          data.entryDate = result.data.date;
        }
        if (result.data.suggestedEntry) {
          if (result.data.suggestedEntry.description) {
            data.description = result.data.suggestedEntry.description;
          }
          if (result.data.suggestedEntry.lines) {
            data.lines = result.data.suggestedEntry.lines.map(
              (l: { accountNumber: number; accountName: string; debit: number; credit: number }) => ({
                accountNumber: l.accountNumber,
                accountName: l.accountName,
                debit: l.debit || undefined,
                credit: l.credit || undefined,
              })
            );
          }
        } else if (result.data.description) {
          data.description = result.data.description;
        }

        setAnalyzedData(data);
        setAddEntryOpen(true);
      }
    } catch (err) {
      console.error("Failed to analyze receipt:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      analyzeReceipt(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <WorkspaceSwitcher
            workspaces={workspaces}
            currentWorkspace={workspace}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full justify-between mt-2 group/create">
                <span>Skapa ny</span>
                <CaretDown className="size-4 transition-transform duration-200 group-data-[state=open]/create:rotate-180" weight="bold" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Bokföring</DropdownMenuLabel>
              <DropdownMenuItem onClick={handleUploadClick} disabled={isAnalyzing}>
                <UploadSimple className="size-4" weight="duotone" />
                {isAnalyzing ? "Analyserar..." : "Ladda upp underlag"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setAddEntryOpen(true)}>
                <FileText className="size-4" weight="duotone" />
                Utan underlag
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setAddBankTransactionOpen(true)}>
                <Bank className="size-4" weight="duotone" />
                Importera från bank
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Skapa</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setCreateInvoiceOpen(true)}>
                <Invoice className="size-4" weight="duotone" />
                Faktura
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${workspace.slug}/personal/lon`}>
                  <Money className="size-4" weight="duotone" />
                  Lön
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarHeader>
        <SidebarContent>
          {/* Main Menu */}
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

          {/* Bokföring */}
          <NavPeriods
            workspaceSlug={workspace.slug}
            isFullMode
            expanded={bookkeepingExpanded}
            onExpandedChange={setBookkeepingExpanded}
          />

          {/* Försäljning */}
          <SidebarGroup>
            <Collapsible open={salesExpanded} onOpenChange={setSalesExpanded} className="group/collapsible">
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="w-full flex items-center justify-between group">
                  <span>Försäljning</span>
                  <div className="relative size-3.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className={`absolute inset-0 size-3.5 transition-all duration-200 ${salesExpanded ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'}`} />
                    <Minus className={`absolute inset-0 size-3.5 transition-all duration-200 ${salesExpanded ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`} />
                  </div>
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
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
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>

          {/* Personal & Löner */}
          <SidebarGroup>
            <Collapsible open={personnelExpanded} onOpenChange={setPersonnelExpanded} className="group/collapsible">
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="w-full flex items-center justify-between group">
                  <span>Personal & Löner</span>
                  <div className="relative size-3.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className={`absolute inset-0 size-3.5 transition-all duration-200 ${personnelExpanded ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'}`} />
                    <Minus className={`absolute inset-0 size-3.5 transition-all duration-200 ${personnelExpanded ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`} />
                  </div>
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
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
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>

          {/* Rapporter */}
          <SidebarGroup>
            <Collapsible open={reportsExpanded} onOpenChange={setReportsExpanded} className="group/collapsible">
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="w-full flex items-center justify-between group">
                  <span>Rapporter</span>
                  <div className="relative size-3.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className={`absolute inset-0 size-3.5 transition-all duration-200 ${reportsExpanded ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'}`} />
                    <Minus className={`absolute inset-0 size-3.5 transition-all duration-200 ${reportsExpanded ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`} />
                  </div>
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
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
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>

          {/* Bokföring och bokslut */}
          <SidebarGroup>
            <Collapsible open={bookkeepingAnnualExpanded} onOpenChange={setBookkeepingAnnualExpanded} className="group/collapsible">
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="w-full flex items-center justify-between group">
                  <span>Bokföring och bokslut</span>
                  <div className="relative size-3.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className={`absolute inset-0 size-3.5 transition-all duration-200 ${bookkeepingAnnualExpanded ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'}`} />
                    <Minus className={`absolute inset-0 size-3.5 transition-all duration-200 ${bookkeepingAnnualExpanded ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`} />
                  </div>
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
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
              </CollapsibleContent>
            </Collapsible>
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
              <CollapsibleContent>
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
                    <Link href="/user/installningar">
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

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      {addEntryOpen && (
        <AddJournalEntryDialog
          workspaceId={workspace.id}
          workspaceSlug={workspace.slug}
          periods={periods}
          open={addEntryOpen}
          onOpenChange={(open) => {
            setAddEntryOpen(open);
            if (!open) {
              setAnalyzedData(null);
            }
          }}
          initialFiles={analyzedData?.files}
          initialDescription={analyzedData?.description}
          initialLines={analyzedData?.lines}
          initialEntryDate={analyzedData?.entryDate}
        />
      )}

      <CreateInvoiceDialog
        workspaceId={workspace.id}
        open={createInvoiceOpen}
        onOpenChange={setCreateInvoiceOpen}
      />

      <AddBankTransactionDialog
        workspaceId={workspace.id}
        open={addBankTransactionOpen}
        onOpenChange={setAddBankTransactionOpen}
      />
    </>
  );
}
