"use client";

import { useState } from "react";
import { useQueryState, parseAsInteger } from "nuqs";
import { Plus, Package } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc/client";
import { useWorkspace } from "@/components/workspace-provider";
import type { Product } from "@/lib/db/schema";
import { ProductFormDialog } from "@/components/products/product-form-dialog";
import { ProductsTable } from "@/components/products/products-table";

const DEFAULT_PAGE_SIZE = 20;

export function ProductsPageClient() {
  const { workspace } = useWorkspace();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState("pageSize", parseAsInteger.withDefault(DEFAULT_PAGE_SIZE));
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.products.list.useQuery({
    workspaceId: workspace.id,
    includeInactive: true,
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  const products = data?.items;
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  const deleteProduct = trpc.products.delete.useMutation({
    onSuccess: () => utils.products.list.invalidate({ workspaceId: workspace.id }),
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Produkter</h1>
          <p className="text-muted-foreground">
            Hantera dina produkter och tjänster för fakturering
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4 mr-2" />
          Ny produkt
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner className="size-8" />
        </div>
      ) : products?.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="size-12 mx-auto mb-4 opacity-50" weight="duotone" />
          <p>Inga produkter ännu</p>
          <p className="text-sm mt-1">
            Skapa produkter för att snabbt kunna lägga till dem på fakturor
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setCreateOpen(true)}
          >
            Lägg till din första produkt
          </Button>
        </div>
      ) : (
        <ProductsTable
          products={products || []}
          onEdit={setEditingProduct}
          onDelete={(product) => {
            deleteProduct.mutate({ workspaceId: workspace.id, id: product.id });
          }}
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      <ProductFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        workspaceId={workspace.id}
        product={null}
      />

      <ProductFormDialog
        open={!!editingProduct}
        onOpenChange={(open) => !open && setEditingProduct(null)}
        workspaceId={workspace.id}
        product={editingProduct}
      />
    </div>
  );
}
