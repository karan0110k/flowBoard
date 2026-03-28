/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
// HMR trigger for prisma client update


import prisma from "./db";
import { revalidatePath } from "next/cache";
import { getSession } from "./auth";

// ─── Boards ────────────────────────────────────────
export async function getBoards() {
  const session = await getSession();
  if (!session) return [];
  return prisma.board.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getBoard(id: string) {
  const session = await getSession();
  if (!session) return null;
  return prisma.board.findUnique({
    where: { id, userId: session.userId },
    include: {
      user: true,
      members: { include: { member: true } },
      activities: { include: { user: true }, orderBy: { createdAt: 'desc' } },
      lists: {
        orderBy: { position: 'asc' },
        include: {
          cards: {
            where: { archived: false },
            orderBy: { position: 'asc' },
            include: {
              labels: { include: { label: true } },
              members: { include: { member: true } },
              checklists: { include: { items: true } },
              attachments: true,
              comments: { include: { user: true }, orderBy: { createdAt: 'desc' } },
              activities: { include: { user: true }, orderBy: { createdAt: 'desc' } }
            }
          }
        }
      }
    }
  });
}

export async function createBoard(title: string, description?: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  const board = await prisma.board.create({
    data: { title, description, userId: session.userId }
  });
  revalidatePath('/dashboard');
  return board;
}

export async function deleteBoard(boardId: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  await prisma.board.delete({ where: { id: boardId, userId: session.userId } });
  revalidatePath('/dashboard');
}

// ─── Lists ─────────────────────────────────────────
export async function createList(boardId: string, title: string, position: number) {
  const list = await prisma.list.create({
    data: { boardId, title, position }
  });
  revalidatePath(`/boards/${boardId}`);
  return list;
}

export async function updateList(id: string, title: string) {
  const list = await prisma.list.update({
    where: { id },
    data: { title }
  });
  revalidatePath(`/boards/${list.boardId}`);
  return list;
}

export async function deleteList(listId: string, boardId: string) {
  await prisma.list.delete({ where: { id: listId } });
  revalidatePath(`/boards/${boardId}`);
}

export async function reorderLists(boardId: string, orderedIds: string[]) {
  await Promise.all(
    orderedIds.map((id, index) =>
      prisma.list.update({ where: { id }, data: { position: index } })
    )
  );
  revalidatePath(`/boards/${boardId}`);
}

// ─── Cards ─────────────────────────────────────────
export async function createCard(listId: string, title: string, position: number, boardId: string, description?: string, dueDate?: Date) {
  const card = await prisma.card.create({
    data: { listId, title, position, description, dueDate }
  });
  revalidatePath(`/boards/${boardId}`);
  return card;
}

export async function updateCard(cardId: string, data: any, boardId: string) {
  const card = await prisma.card.update({
    where: { id: cardId },
    data
  });
  if (boardId) revalidatePath(`/boards/${boardId}`);
  return card;
}

export async function deleteCard(cardId: string, boardId: string) {
  await prisma.card.delete({ where: { id: cardId } });
  revalidatePath(`/boards/${boardId}`);
}

export async function archiveCard(cardId: string, boardId: string) {
  await prisma.card.update({
    where: { id: cardId },
    data: { archived: true }
  });
  revalidatePath(`/boards/${boardId}`);
}

export async function moveCard(cardId: string, newListId: string, newPosition: number, boardId: string) {
  const card = await prisma.card.update({
    where: { id: cardId },
    data: { listId: newListId, position: newPosition }
  });
  revalidatePath(`/boards/${boardId}`);
  return card;
}

export async function reorderCards(boardId: string, listId: string, orderedCardIds: string[]) {
  await Promise.all(
    orderedCardIds.map((id, index) =>
      prisma.card.update({ where: { id }, data: { position: index, listId } })
    )
  );
  revalidatePath(`/boards/${boardId}`);
}

// ─── Labels on Cards ───────────────────────────────
export async function addLabelToCard(cardId: string, labelId: string, boardId: string) {
  try {
    await prisma.cardLabel.create({ data: { cardId, labelId } });
  } catch { /* already exists */ }
  revalidatePath(`/boards/${boardId}`);
}

export async function removeLabelFromCard(cardId: string, labelId: string, boardId: string) {
  try {
    await prisma.cardLabel.delete({ where: { cardId_labelId: { cardId, labelId } } });
  } catch { /* not found */ }
  revalidatePath(`/boards/${boardId}`);
}

// ─── Members on Cards ──────────────────────────────
export async function addMemberToCard(cardId: string, memberId: string, boardId: string) {
  try {
    await prisma.cardMember.create({ data: { cardId, memberId } });
  } catch { /* already exists */ }
  revalidatePath(`/boards/${boardId}`);
}

export async function removeMemberFromCard(cardId: string, memberId: string, boardId: string) {
  try {
    await prisma.cardMember.delete({ where: { cardId_memberId: { cardId, memberId } } });
  } catch { /* not found */ }
  revalidatePath(`/boards/${boardId}`);
}

// ─── Checklists ────────────────────────────────────
export async function addChecklist(cardId: string, title: string, boardId: string) {
  const checklist = await prisma.checklist.create({
    data: { cardId, title }
  });
  revalidatePath(`/boards/${boardId}`);
  return checklist;
}

export async function addChecklistItem(checklistId: string, text: string, boardId: string) {
  const item = await prisma.checklistItem.create({
    data: { checklistId, text }
  });
  revalidatePath(`/boards/${boardId}`);
  return item;
}

export async function toggleChecklistItem(itemId: string, completed: boolean, boardId: string) {
  await prisma.checklistItem.update({
    where: { id: itemId },
    data: { completed }
  });
  revalidatePath(`/boards/${boardId}`);
}

export async function deleteChecklistItem(itemId: string, boardId: string) {
  await prisma.checklistItem.delete({ where: { id: itemId } });
  revalidatePath(`/boards/${boardId}`);
}

// ─── Due Date ──────────────────────────────────────
export async function updateCardDueDate(cardId: string, dueDate: string | null, boardId: string) {
  await prisma.card.update({
    where: { id: cardId },
    data: { dueDate: dueDate ? new Date(dueDate) : null }
  });
  revalidatePath(`/boards/${boardId}`);
}

// ─── Board from Template ───────────────────────────
export async function createBoardFromTemplate(
  title: string,
  description: string,
  defaultLists: { title: string; cards: string[] }[],
  background?: string
) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  const board = await prisma.board.create({
    data: { title, description, background, userId: session.userId }
  });

  for (let i = 0; i < defaultLists.length; i++) {
    const listDef = defaultLists[i];
    const list = await prisma.list.create({
      data: { boardId: board.id, title: listDef.title, position: i }
    });
    for (let j = 0; j < listDef.cards.length; j++) {
      await prisma.card.create({
        data: { listId: list.id, title: listDef.cards[j], position: j }
      });
    }
  }

  revalidatePath('/boards');
  revalidatePath('/dashboard');
  return board;
}

// ─── Members & Labels (global) ─────────────────────
export async function getMembers() {
  return prisma.member.findMany();
}

export async function getLabels() {
  return prisma.label.findMany();
}

// ─── NEW FEATURES ──────────────────────────────────
export async function updateBoardBackground(boardId: string, background: string) {
  await prisma.board.update({
    where: { id: boardId },
    data: { background }
  });
  revalidatePath(`/boards/${boardId}`);
  revalidatePath('/dashboard');
}

export async function updateCardCover(cardId: string, cover: string | null, boardId: string) {
  await prisma.card.update({
    where: { id: cardId },
    data: { cover }
  });
  revalidatePath(`/boards/${boardId}`);
}

export async function addComment(cardId: string, text: string, boardId: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  await prisma.comment.create({
    data: { cardId, text, userId: session.userId }
  });
  revalidatePath(`/boards/${boardId}`);
}

export async function addAttachment(cardId: string, name: string, url: string, type: string, boardId: string) {
  await prisma.attachment.create({
    data: { cardId, name, url, type }
  });
  revalidatePath(`/boards/${boardId}`);
}

export async function inviteMember(boardId: string, email: string, name?: string) {
  let member = await prisma.member.findFirst({ where: { email } });
  if (!member) {
    member = await prisma.member.create({
      data: { email, name: name || email.split('@')[0], avatar: name ? name.charAt(0).toUpperCase() : email.charAt(0).toUpperCase() }
    });
  }
  try {
    await prisma.boardMember.create({ data: { boardId, memberId: member.id } });
  } catch { /* already exists */ }
  revalidatePath(`/boards/${boardId}`);
}

// ─── Notifications ─────────────────────────────────
export async function getNotifications() {
  const session = await getSession();
  if (!session) return [];
  
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  const userName = user?.name || "User";

  let dbNotifications: any[] = [];
  try {
    dbNotifications = await (prisma as any).notification.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
  }

  if (dbNotifications.length === 0) {
    return [
      {
        id: "welcome-sample",
        text: `Welcome ${userName} to FlowBoard! 🚀`,
        link: "/dashboard",
        read: false,
        createdAt: new Date(),
      },
      {
        id: "sample-1",
        text: "You were added to 'Project Management' board",
        link: "/dashboard",
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 0.5),
      },
      {
        id: "sample-2",
        text: "Team member assigned you to a new task",
        link: "/dashboard",
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
      }
    ];
  }
  return dbNotifications;
}

export async function markNotificationAsRead(id: string) {
  try {
    const model = (prisma as any).notification;
    if (!model) {
      console.warn("DEBUG: prisma.notification is missing in markNotificationAsRead");
      return;
    }
    await model.update({
      where: { id },
      data: { read: true }
    });
    revalidatePath('/');
  } catch (error) {
    console.error("DEBUG: Failed to mark notification as read:", error);
  }
}

export async function markAllNotificationsAsRead() {
  const session = await getSession();
  if (!session) return;
  try {
    const model = (prisma as any).notification;
    if (!model) {
      console.warn("DEBUG: prisma.notification is missing in markAllNotificationsAsRead");
      return;
    }
    await model.updateMany({
      where: { userId: session.userId, read: false },
      data: { read: true }
    });
    revalidatePath('/');
  } catch (error) {
    console.error("DEBUG: Failed to mark all notifications as read:", error);
  }
}

export async function createNotification(userId: string, text: string, link?: string) {
  try {
    const model = (prisma as any).notification;
    if (!model) {
      console.warn("DEBUG: prisma.notification is missing in createNotification");
      return;
    }
    return await model.create({
      data: { userId, text, link }
    });
  } catch (error) {
    console.error("DEBUG: Failed to create notification:", error);
  }
}

export async function logActivity(boardId: string, type: string, cardId?: string, content?: string) {
  const session = await getSession();
  if (!session) return;
  await prisma.activity.create({
    data: { boardId, userId: session.userId, type, cardId, content }
  });
  revalidatePath(`/boards/${boardId}`);
}
