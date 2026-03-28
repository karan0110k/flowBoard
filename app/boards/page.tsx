import { getBoards } from "@/src/lib/actions";
import { getSession } from "@/src/lib/auth";
import prisma from "@/src/lib/db";
import FlowBoardNavbar from "@/src/components/navbar/FlowBoardNavbar";
import Sidebar from "@/src/components/sidebar/Sidebar";
import BoardsPageClient from "@/src/components/board/BoardsPageClient";

export const dynamic = "force-dynamic";

export default async function BoardsPage() {
  const session = await getSession();
  const user = session ? await prisma.user.findUnique({ where: { id: session.userId } }) : null;
  const boards = await getBoards();

  return (
    <div className="min-h-screen bg-[#1d2125] flex flex-col">
      <FlowBoardNavbar user={user} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <BoardsPageClient boards={boards} />
      </div>
    </div>
  );
}
