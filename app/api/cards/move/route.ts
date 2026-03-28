import { NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { getSession } from "@/src/lib/auth";

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { cardId, destListId, newPosition, boardId } = await req.json();

    if (!cardId || !destListId || typeof newPosition !== "number") {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Verify board ownership
    const board = await prisma.board.findFirst({
      where: { id: boardId, userId: session.userId },
    });

    if (!board) {
      return new NextResponse("Board not found", { status: 404 });
    }

    // Get current card and affected lists
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      include: { list: true }
    });

    if (!card) {
      return new NextResponse("Card not found", { status: 404 });
    }

    const sourceListId = card.listId;

    if (sourceListId === destListId) {
      // Reordering within the same list
      const cards = await prisma.card.findMany({
        where: { listId: destListId },
        orderBy: { position: "asc" }
      });

      const updatedCards = [...cards];
      const movedCardIndex = updatedCards.findIndex(c => c.id === cardId);
      const [movedCard] = updatedCards.splice(movedCardIndex, 1);
      updatedCards.splice(newPosition, 0, movedCard);

      const updates = updatedCards.map((c, index) =>
        prisma.card.update({
          where: { id: c.id },
          data: { position: index }
        })
      );

      await prisma.$transaction(updates);
    } else {
      // Moving to a different list
      // 1. Update positions in source list
      const sourceCards = await prisma.card.findMany({
        where: { listId: sourceListId },
        orderBy: { position: "asc" }
      });
      const filteredSource = sourceCards.filter(c => c.id !== cardId);
      const sourceUpdates = filteredSource.map((c, index) =>
        prisma.card.update({
          where: { id: c.id },
          data: { position: index }
        })
      );

      // 2. Update positions in destination list
      const destCards = await prisma.card.findMany({
        where: { listId: destListId },
        orderBy: { position: "asc" }
      });
      const updatedDest = [...destCards];
      type TempCard = {
  id: string;
  title: string;
  description: string | null;
  listId: string;
  position: number;
  dueDate: Date | null;
  archived: boolean;
};

const updatedDest: TempCard[] = [...destCards];

updatedDest.splice(newPosition, 0, {
  ...card,
  listId: destListId,
});
      
      const destUpdates = updatedDest.map((c, index) =>
        prisma.card.update({
          where: { id: c.id },
          data: { 
            position: index,
            listId: destListId
          }
        })
      );

      await prisma.$transaction([...sourceUpdates, ...destUpdates]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CARDS_MOVE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
