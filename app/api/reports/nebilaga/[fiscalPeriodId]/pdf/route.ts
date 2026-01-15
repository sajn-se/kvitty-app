import { NextRequest, NextResponse } from "next/server";
import { appRouter } from "@/lib/trpc/router";
import { createTRPCContext } from "@/lib/trpc/init";
import { generateNebilagaPdf } from "@/lib/utils/report-pdf/nebilaga-pdf";
import { db } from "@/lib/db";
import { fiscalPeriods, workspaces, workspaceMembers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fiscalPeriodId: string }> }
) {
  const { fiscalPeriodId } = await params;

  try {
    // Create context (includes session check)
    const ctx = await createTRPCContext();

    // Session check
    if (!ctx.session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get fiscal period to find workspaceId
    const period = await db.query.fiscalPeriods.findFirst({
      where: eq(fiscalPeriods.id, fiscalPeriodId),
    });

    if (!period) {
      return NextResponse.json({ error: "Period not found" }, { status: 404 });
    }

    // Verify user has access to this workspace
    const membership = await db.query.workspaceMembers.findFirst({
      where: and(
        eq(workspaceMembers.workspaceId, period.workspaceId),
        eq(workspaceMembers.userId, ctx.session.user.id)
      ),
    });

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get workspace to verify it's an enskild firma
    const workspace = await db.query.workspaces.findFirst({
      where: eq(workspaces.id, period.workspaceId),
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    if (workspace.businessType !== "enskild_firma") {
      return NextResponse.json(
        { error: "NE-bilaga är endast tillgänglig för enskild firma" },
        { status: 400 }
      );
    }

    // Create tRPC caller
    const caller = appRouter.createCaller(ctx);

    // Get NE-bilaga data
    const nebilagaData = await caller.nebilaga.get({
      workspaceId: period.workspaceId,
      fiscalPeriodId,
    });

    // Generate PDF
    try {
      const pdfDoc = generateNebilagaPdf({
        ...nebilagaData,
        workspace: {
          id: workspace.id,
          name: workspace.name,
          orgName: workspace.orgName,
          orgNumber: workspace.orgNumber,
          address: workspace.address,
          postalCode: workspace.postalCode,
          city: workspace.city,
        },
        period: {
          label: period.label,
          startDate: period.startDate,
          endDate: period.endDate,
        },
      });

      const pdfBuffer = Buffer.from(pdfDoc.output("arraybuffer") as ArrayBuffer);

      return new NextResponse(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="NE-bilaga_${period.label.replace(/\s/g, "_")}.pdf"`,
        },
      });
    } catch (pdfError) {
      console.error("[NE-bilaga PDF] PDF generation failed", {
        error: pdfError instanceof Error ? pdfError.message : String(pdfError),
        errorStack: pdfError instanceof Error ? pdfError.stack : undefined,
        fiscalPeriodId,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json(
        { error: "Kunde inte generera PDF" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[NE-bilaga PDF] Error", {
      error: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      fiscalPeriodId,
      timestamp: new Date().toISOString(),
    });

    // Check for specific errors
    if (error instanceof Error && error.message.includes("NOT_FOUND")) {
      return NextResponse.json({ error: "Period not found" }, { status: 404 });
    }

    if (error instanceof Error && error.message.includes("FORBIDDEN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Ett fel uppstod" },
      { status: 500 }
    );
  }
}
