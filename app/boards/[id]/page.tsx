import { getBoard, getLabels, getMembers } from "@/src/lib/actions";
import { redirect } from "next/navigation";
import FlowBoardNavbar from "@/src/components/navbar/FlowBoardNavbar";
import BoardPageClient from "@/src/components/board/BoardPageClient";
import { getSession } from "@/src/lib/auth";
import prisma from "@/src/lib/db";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export const dynamic = "force-dynamic";

export default async function BoardPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const boardId = resolvedParams.id;
  const board = await getBoard(boardId);
  const session = await getSession();
  const user = session ? await prisma.user.findUnique({ where: { id: session.userId } }) : null;

  if (!board) {
    redirect("/dashboard");
  }

  const allMembers = await getMembers();
  const allLabels = await getLabels();
  const searchQuery = resolvedSearchParams.q || "";

  return (
    <div
      className="flex flex-col h-screen overflow-hidden custom-scrollbar bg-cover bg-center"
      style={{
        background: board.background?.startsWith("http") || board.background?.startsWith("data:")
          ? `url(${board.background}) center/cover no-repeat`
          : board.background || "linear-gradient(to bottom right, #581c87, #2563eb)"
      }}
    >
      {!board.background && (
        <div className="absolute inset-0 bg-center bg-cover pointer-events-none opacity-10 mix-blend-multiply"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542435503-956c469947f6?q=80&w=2000&auto=format&fit=crop')" }} />
      )}

      <div className="relative z-10 flex flex-col h-full w-full bg-black/5 hover:bg-black/10 transition-colors">
        <FlowBoardNavbar user={user} />

        <BoardPageClient
          board={board}
          allMembers={allMembers}
          allLabels={allLabels}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  );
}
