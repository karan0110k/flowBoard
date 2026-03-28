import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log("No user found to seed notifications for.");
    return;
  }

  const board = await prisma.board.findFirst({ where: { userId: user.id } });
  const boardId = board?.id || "mock-board-id";

  const notifications = [
    {
      userId: user.id,
      text: "You were added to the 'Product Launch' board",
      link: `/boards/${boardId}`,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
    {
      userId: user.id,
      text: "Rahul assigned you to 'Prepare presentation'",
      link: `/boards/${boardId}`,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    },
    {
      userId: user.id,
      text: "Card 'Deploy backend' is due tomorrow",
      link: `/boards/${boardId}`,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    }
  ];

  for (const n of notifications) {
    await prisma.notification.create({ data: n });
  }

  console.log(`Seeded ${notifications.length} notifications for user ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
