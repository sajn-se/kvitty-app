import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export interface BreadcrumbLinkItem {
  label: string;
  href: string;
}

export interface PageHeaderProps {
  /** Show workspace as first breadcrumb link */
  workspaceSlug?: string;
  workspaceName?: string;
  /** Intermediate breadcrumb links (between workspace and current page) */
  breadcrumbs?: BreadcrumbLinkItem[];
  /** Current page name (shown as non-link) */
  currentPage: string;
  /** Optional actions to show on the right side */
  actions?: React.ReactNode;
}

export function PageHeader({
  workspaceSlug,
  workspaceName,
  breadcrumbs = [],
  currentPage,
  actions,
}: PageHeaderProps) {
  const hasWorkspace = workspaceSlug && workspaceName;
  const allBreadcrumbs: BreadcrumbLinkItem[] = [
    ...(hasWorkspace
      ? [{ label: workspaceName, href: `/${workspaceSlug}` }]
      : []),
    ...breadcrumbs,
  ];

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className={`flex items-center gap-2 px-4${actions ? " flex-1" : ""}`}>
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4 mt-1.5"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {allBreadcrumbs.map((item, index) => (
              <span key={item.href} className="contents">
                <BreadcrumbItem>
                  <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </span>
            ))}
            <BreadcrumbItem>
              <BreadcrumbPage>{currentPage}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      {actions && <div className="px-4">{actions}</div>}
    </header>
  );
}
