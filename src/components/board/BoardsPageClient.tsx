/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { Clock, ChevronDown, Plus } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { popularTemplates } from "@/src/data/templates";
import CreateBoardModal from "@/src/components/modal/CreateBoardModal";

export default function BoardsPageClient({ boards }: { boards: any[] }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const searchParams = useSearchParams();
  const query = (searchParams.get("q") || "").toLowerCase();

  const filteredBoards = query
    ? boards.filter((b: any) => b.title.toLowerCase().includes(query))
    : boards;

  const filteredPopular = query
    ? popularTemplates.filter((t) => t.title.toLowerCase().includes(query))
    : popularTemplates;

  const hasResults = filteredBoards.length > 0 || filteredPopular.length > 0;

  return (
    <main className="flex-1 overflow-y-auto p-6 md:p-10">

      {/* No results */}
      {query && !hasResults && (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-gray-400 text-lg mb-1">No matching results</p>
          <p className="text-gray-500 text-sm">Try a different search term.</p>
        </div>
      )}

      {/* Most popular templates */}
      {filteredPopular.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-bold text-white">Most popular templates</h2>
            <button className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition cursor-pointer">
              Category <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-sm text-gray-400 mb-5">Get going faster with a template from the FlowBoard community.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {filteredPopular.map((t) => (
              <Link key={t.id} href="/templates">
                <div 
                  className={`h-24 rounded-lg bg-gradient-to-br ${t.background} p-3 cursor-pointer hover:brightness-110 hover:scale-[1.02] transition-all relative overflow-hidden group bg-cover bg-center`}
                  style={t.image ? { backgroundImage: `url(${t.image})` } : undefined}
                >
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
                  <span className="text-2xl absolute top-2 right-3 opacity-30 group-hover:opacity-50 transition-opacity">{t.icon}</span>
                  <h3 className="relative text-white font-semibold text-sm z-10">{t.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recently viewed / boards */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-gray-400" />
          <h2 className="text-lg font-bold text-white">Recently viewed</h2>
          {query && <span className="text-xs text-gray-500">({filteredBoards.length} found)</span>}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredBoards.map((board: any) => {
            const bg = board.background;
            const isImageUrl = bg && (bg.startsWith("http") || bg.startsWith("data:"));
            const gradientClass = bg && !isImageUrl ? bg : (board.description && board.description.includes("from-") ? board.description : "from-blue-700 to-purple-800");

            return (
            <Link key={board.id} href={`/boards/${board.id}`}>
              <div 
                className={`h-24 rounded-lg bg-gradient-to-br ${gradientClass} p-3 cursor-pointer hover:brightness-110 hover:scale-[1.02] transition-all relative overflow-hidden group bg-cover bg-center`}
                style={isImageUrl ? { backgroundImage: `url(${bg})` } : undefined}
              >
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
                <h4 className="relative text-white font-bold text-sm truncate z-10">{board.title}</h4>
              </div>
            </Link>
            );
          })}

          {!query && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="h-24 rounded-lg flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors text-white text-sm font-medium cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Create new board
            </button>
          )}

          {query && filteredBoards.length === 0 && (
            <div className="h-24 rounded-lg flex items-center justify-center bg-white/5 text-gray-500 text-sm col-span-full">
              No boards match your search
            </div>
          )}
        </div>
      </section>

      <CreateBoardModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </main>
  );
}
