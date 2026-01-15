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
    const { userId, workspaceId, count = 10 } = body;

    if (!userId || !workspaceId) {
      return NextResponse.json(
        { error: "userId and workspaceId are required" },
        { status: 400 }
      );
    }

    if (count < 1 || count > 50) {
      return NextResponse.json(
        { error: "count must be between 1 and 50" },
        { status: 400 }
      );
    }

    const types = ["test", "comment_mention", "inbox_email"];
    const titles = [
      "Nytt e-postmeddelande",
      "Någon nämnde dig i en kommentar",
      "Faktura har betalats",
      "Ny medlem i workspace",
      "Löneköring klar",
    ];
    const messages = [
      "Kolla in detta viktiga meddelande",
      "Du har en ny uppgift att granska",
      "Systemuppdatering tillgänglig",
      null,
      "Detta är ett testmeddelande",
    ];

    const notifications = [];

    for (let i = 0; i < count; i++) {
      const notification = await createNotification({
        userId,
        workspaceId,
        type: types[i % types.length],
        title: `${titles[i % titles.length]} #${i + 1}`,
        message: messages[i % messages.length] ?? undefined,
        link: i % 3 === 0 ? `/${workspaceId}/notifikationer` : undefined,
      });
      notifications.push(notification);
    }

    return NextResponse.json({
      success: true,
      created: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("Error creating bulk notifications:", error);
    return NextResponse.json(
      { error: "Failed to create notifications" },
      { status: 500 }
    );
  }
}
