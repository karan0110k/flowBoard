import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Clean DB
  await prisma.cardLabel.deleteMany()
  await prisma.cardMember.deleteMany()
  await prisma.checklistItem.deleteMany()
  await prisma.checklist.deleteMany()
  await prisma.card.deleteMany()
  await prisma.list.deleteMany()
  await prisma.board.deleteMany()
  await prisma.member.deleteMany()
  await prisma.label.deleteMany()
  await prisma.user.deleteMany()

  // 1. Demo User
  const hashedPassword = await bcrypt.hash("demo", 10);
  const demoUser = await prisma.user.create({
    data: {
      name: "Demo User",
      email: "demo@example.com",
      password: hashedPassword,
    }
  });

  // 1b. Members
  const karan = await prisma.member.create({ data: { name: 'Karan', avatar: 'K' } })
  const rahul = await prisma.member.create({ data: { name: 'Rahul', avatar: 'R' } })
  const priya = await prisma.member.create({ data: { name: 'Priya', avatar: 'P' } })

  // 2. Labels
  const labelsData = [
    { text: 'Bug', color: 'bg-red-500' },
    { text: 'Feature', color: 'bg-blue-500' },
    { text: 'Design', color: 'bg-purple-500' },
    { text: 'Urgent', color: 'bg-orange-500' },
    { text: 'Planning', color: 'bg-yellow-500' },
    { text: 'Done', color: 'bg-green-500' },
  ]
  const labels = await Promise.all(labelsData.map(l => prisma.label.create({ data: l })))

  // 3. Board
  const board = await prisma.board.create({
    data: { title: 'FlowBoard Placement Project', description: 'Main tracking board for the Kanban application assignment.', userId: demoUser.id }
  })

  // 4. Lists
  const listTodo = await prisma.list.create({ data: { boardId: board.id, title: 'To Do', position: 0 } })
  const listInProgress = await prisma.list.create({ data: { boardId: board.id, title: 'In Progress', position: 1 } })
  const listReview = await prisma.list.create({ data: { boardId: board.id, title: 'Review', position: 2 } })
  const listCompleted = await prisma.list.create({ data: { boardId: board.id, title: 'Completed', position: 3 } })

  // 5. Cards & Relations
  const card1 = await prisma.card.create({
    data: { listId: listTodo.id, title: 'Build landing page', description: 'Create a stunning FlowBoard landing page without Clerk auth.', position: 0, dueDate: new Date(new Date().setDate(new Date().getDate() + 2)) }
  })
  await prisma.cardMember.create({ data: { cardId: card1.id, memberId: karan.id } })
  
  const card2 = await prisma.card.create({
    data: { listId: listTodo.id, title: 'Connect PostgreSQL database', description: 'Set up Prisma schema and run migrations.', position: 1 }
  })
  await prisma.cardLabel.create({ data: { cardId: card2.id, labelId: labels[0].id } }) // Bug label as a test
  
  const card3 = await prisma.card.create({
    data: { listId: listInProgress.id, title: 'Implement drag and drop', description: 'Enhance dnd-kit functionality for cards and lists.', position: 0 }
  })
  await prisma.cardMember.create({ data: { cardId: card3.id, memberId: rahul.id } })
  await prisma.cardLabel.create({ data: { cardId: card3.id, labelId: labels[1].id } }) // Feature
  
  const card4 = await prisma.card.create({
    data: { listId: listReview.id, title: 'Add card modal', description: 'Task detailing modal with checklists, labels, due dates.', position: 0 }
  })
  await prisma.cardMember.create({ data: { cardId: card4.id, memberId: priya.id } })
  
  const card5 = await prisma.card.create({
    data: { listId: listCompleted.id, title: 'Create Prisma schema', position: 0 }
  })
  
  // 6. Checklist for Card 4
  const cl = await prisma.checklist.create({ data: { cardId: card4.id, title: 'Modal Requirements' } })
  await prisma.checklistItem.create({ data: { checklistId: cl.id, text: 'Checklist UI', completed: true } })
  await prisma.checklistItem.create({ data: { checklistId: cl.id, text: 'Label assignment', completed: false } })
  await prisma.checklistItem.create({ data: { checklistId: cl.id, text: 'Due date picker', completed: false } })

  console.log('Seed completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
