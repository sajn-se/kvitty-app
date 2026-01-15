import { NextRequest, NextResponse } from "next/server";
import { createNotification } from "@/lib/utils/create-notification";

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "This endpoint is only available in development" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const {
      userId,
      workspaceId,
      type = "test",
      title = "Test Notification",
      message,
      link,
    } = body;

    if (!userId || !workspaceId) {
      return NextResponse.json(
        { error: "userId and workspaceId are required" },
        { status: 400 }
      );
    }

    const notification = await createNotification({
      userId,
      workspaceId,
      type,
      title,
      message,
      link,
    });

    return NextResponse.json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("Error creating test notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}
