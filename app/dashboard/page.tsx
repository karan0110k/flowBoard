import Link from "next/link";
import { Plus, Trash2, Clock, Layout, Star } from "lucide-react";
import FlowBoardNavbar from "@/src/components/navbar/FlowBoardNavbar";
import Sidebar from "@/src/components/sidebar/Sidebar";
import { getBoards, createBoard, deleteBoard } from "@/src/lib/actions";
import { redirect } from "next/navigation";
import { getSession } from "@/src/lib/auth";
import prisma from "@/src/lib/db";
import { revalidatePath } from "next/cache";
import { popularTemplates, templates } from "@/src/data/templates";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const session = await getSession();
  const user = session ? await prisma.user.findUnique({ where: { id: session.userId } }) : null;
  const allBoards = await getBoards();
  const query = (resolvedSearchParams.q || "").toLowerCase();

  const boards = query
    ? allBoards.filter((b) => b.title.toLowerCase().includes(query))
    : allBoards;

  const filteredTemplates = query
    ? templates.filter((t) => t.title.toLowerCase().includes(query))
    : templates.slice(0, 3);

  const filteredPopular = query
    ? popularTemplates.filter((t) => t.title.toLowerCase().includes(query))
    : popularTemplates;

  async function handleCreateBoard(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    if (!title?.trim()) return;
    const board = await createBoard(title.trim(), description?.trim() || undefined);
    redirect(`/boards/${board.id}`);
  }

  async function handleDeleteBoard(formData: FormData) {
    "use server";
    const boardId = formData.get("boardId") as string;
    if (!boardId) return;
    await deleteBoard(boardId);
    revalidatePath("/dashboard");
  }

  const hasResults = boards.length > 0 || filteredTemplates.length > 0 || filteredPopular.length > 0;

  return (
    <div className="min-h-screen bg-[#1d2125] flex flex-col">
      <FlowBoardNavbar user={user} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-6 md:p-10">

          {/* No results message */}
          {query && !hasResults && (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-gray-400 text-lg mb-1">No matching results</p>
              <p className="text-gray-500 text-sm">Try a different search term.</p>
            </div>
          )}

          {/* Popular Templates */}
          {filteredPopular.length > 0 && (
            <section className="mb-10">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Layout className="h-5 w-5 text-gray-400" />
                  <h2 className="text-lg font-bold text-white">Most popular templates</h2>
                </div>
                <Link href="/templates" className="text-sm text-blue-400 hover:text-blue-300 transition">
                  Browse all →
                </Link>
              </div>
              <p className="text-sm text-gray-400 mb-5 ml-7">Get going faster with a template from the FlowBoard community.</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {filteredPopular.map((t) => (
                  <Link key={t.id} href="/templates">
                    <div className={`h-24 rounded-lg bg-gradient-to-br ${t.background} p-3 cursor-pointer hover:brightness-110 hover:scale-[1.02] transition-all relative overflow-hidden group`}>
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                      <span className="text-2xl absolute top-2 right-3 opacity-30 group-hover:opacity-50 transition-opacity">{t.icon}</span>
                      <h3 className="relative text-white font-semibold text-sm z-10">{t.title}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Featured templates */}
          {filteredTemplates.length > 0 && (
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-gray-400" />
                  <h2 className="text-lg font-bold text-white">Featured templates</h2>
                </div>
                <Link href="/templates" className="text-sm text-blue-400 hover:text-blue-300 transition">
                  See all →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map((template) => (
                  <Link key={template.id} href="/templates">
                    <div className="bg-[#282e33] rounded-xl overflow-hidden border border-white/5 hover:border-white/20 transition-all hover:shadow-xl group cursor-pointer">
                      <div className={`h-20 bg-gradient-to-br ${template.background} relative overflow-hidden`}>
                        <span className="absolute top-2 left-3 text-2xl opacity-40 group-hover:opacity-60 transition-opacity">{template.icon}</span>
                      </div>
                      <div className="p-3">
                        <h3 className="text-white font-semibold text-sm mb-0.5">{template.title}</h3>
                        <p className="text-gray-400 text-xs line-clamp-1">{template.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* YOUR BOARDS */}
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-bold text-white">Your boards</h2>
              {query && <span className="text-xs text-gray-500">({boards.length} found)</span>}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {boards.map((board) => (
                <div key={board.id} className={`h-24 rounded-lg overflow-hidden relative group bg-gradient-to-br ${board.description && board.description.includes("from-") ? board.description : "from-blue-700 to-purple-800"} p-3 hover:brightness-110 hover:scale-[1.02] transition-all cursor-pointer`}>
                  <Link href={`/boards/${board.id}`} className="absolute inset-0 z-10">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  </Link>
                  <h4 className="relative text-white font-bold text-sm truncate z-20 pointer-events-none">{board.title}</h4>
                  <form action={handleDeleteBoard} className="absolute top-2 right-2 z-30">
                    <input type="hidden" name="boardId" value={board.id} />
                    <button
                      type="submit"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 flex items-center justify-center bg-black/40 hover:bg-red-600 text-white rounded cursor-pointer"
                      title="Delete board"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </div>
              ))}

              {!query && (
                <form action={handleCreateBoard} className="h-24 relative">
                  <details className="group h-full">
                    <summary className="w-full h-full rounded-lg flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors text-white text-sm font-medium border-none cursor-pointer list-none">
                      <Plus className="h-4 w-4 mr-1.5" />
                      Create new board
                    </summary>
                    <div className="absolute top-full left-0 mt-2 w-72 bg-[#282e33] rounded-lg shadow-xl p-4 z-50 border border-white/10">
                      <label className="text-sm text-gray-300 font-medium block mb-1">Board title *</label>
                      <input
                        type="text"
                        name="title"
                        required
                        autoFocus
                        placeholder="Enter board title"
                        className="w-full bg-[#22272b] border border-white/20 text-white text-sm rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500"
                      />
                      <label className="text-sm text-gray-300 font-medium block mb-1">Description</label>
                      <input
                        type="text"
                        name="description"
                        placeholder="Optional"
                        className="w-full bg-[#22272b] border border-white/20 text-white text-sm rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500"
                      />
                      <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded transition-colors cursor-pointer">
                        Create
                      </button>
                    </div>
                  </details>
                </form>
              )}

              {!query && boards.length === 0 && (
                <div className="col-span-full h-32 rounded-lg flex flex-col items-center justify-center bg-white/5 border border-dashed border-white/20 text-gray-500">
                  <p className="text-white font-medium mb-1">No boards yet</p>
                  <p className="text-sm">Create your first board to get started!</p>
                </div>
              )}

              {query && boards.length === 0 && (
                <div className="h-24 rounded-lg flex items-center justify-center bg-white/5 text-gray-500 text-sm">
                  No boards yet. Click &quot;Create Board&quot; to start."
                </div>
              )}
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
