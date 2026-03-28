import { NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { getSession } from "@/src/lib/auth";

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { boardId, listIds } = await req.json();

    if (!boardId || !listIds || !Array.isArray(listIds)) {
      return new NextResponse("Missing boardId or listIds", { status: 400 });
    }

    // Verify board ownership
    const board = await prisma.board.findFirst({
      where: { id: boardId, userId: session.userId },
    });

    if (!board) {
      return new NextResponse("Board not found", { status: 404 });
    }

    // Batch update positions
    const updates = listIds.map((id, index) =>
      prisma.list.update({
        where: { id, boardId },
        data: { position: index },
      })
    );

    await prisma.$transaction(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[LISTS_REORDER]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
