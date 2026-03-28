/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Star, Filter, UserPlus, X, MoreHorizontal, Image as ImageIcon, Archive, RotateCcw } from "lucide-react";
import { Button } from "../ui/button";
import { useState, useTransition, useRef, useEffect } from "react";
import { inviteMember, updateBoardBackground, updateCard } from "@/src/lib/actions";

const BACKGROUNDS = [
  "linear-gradient(to bottom right, #581c87, #2563eb)",
  "linear-gradient(to bottom right, #b91c1c, #d97706)",
  "linear-gradient(to bottom right, #047857, #065f46)",
  "linear-gradient(to bottom right, #4c1d95, #be185d)",
  "url('https://images.unsplash.com/photo-1542435503-956c469947f6?q=80&w=2000&auto=format&fit=crop')",
  "url('https://images.unsplash.com/photo-1506744626753-2ba9b0df4fcb?q=80&w=2000&auto=format&fit=crop')",
  "url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2000&auto=format&fit=crop')",
];

interface BoardHeaderProps {
  board: any;
  allMembers?: any[];
  allLabels?: any[];
  onFilterChange?: (filters: { label?: string; member?: string; due?: string }) => void;
}

export default function BoardHeader({ board, allMembers, allLabels, onFilterChange }: BoardHeaderProps) {
  const [activePopover, setActivePopover] = useState<"invite" | "filter" | "menu" | null>(null);
  
  const [inviteEmail, setInviteEmail] = useState("");
  const [isPending, startTransition] = useTransition();

  const [selectedLabel, setSelectedLabel] = useState("");
  const [selectedMember, setSelectedMember] = useState("");
  const [selectedDue, setSelectedDue] = useState("");

  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setActivePopover(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filterActive = !!(selectedLabel || selectedMember || selectedDue);

  // Filter archived cards from the board object
  const archivedCards = board.lists?.flatMap((l: any) => l.cards).filter((c: any) => c.archived) || [];

  const applyFilter = (label: string, member: string, due: string) => {
    setSelectedLabel(label);
    setSelectedMember(member);
    setSelectedDue(due);
    onFilterChange?.({ label: label || undefined, member: member || undefined, due: due || undefined });
  };

  const clearFilters = () => {
    applyFilter("", "", "");
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    startTransition(async () => {
      await inviteMember(board.id, inviteEmail.trim());
      setInviteEmail("");
      setActivePopover(null);
    });
  };

  const handleSetBackground = (bg: string) => {
    startTransition(async () => {
      await updateBoardBackground(board.id, bg);
    });
  };

  const handleRestoreCard = (cardId: string) => {
    startTransition(async () => {
      await updateCard(cardId, { archived: false }, board.id);
    });
  };

  return (
    <div ref={headerRef} className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 py-2 sm:py-3 bg-white/20 backdrop-blur-md border-b border-white/10 shrink-0">
      
      <div className="flex items-center gap-2 mb-2 sm:mb-0">
        <h1 className="text-xl font-bold text-white px-2 py-1 hover:bg-white/20 rounded cursor-pointer transition">
          {board?.title}
        </h1>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8">
          <Star className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Avatars */}
        {board?.members && board.members.length > 0 && (
          <div className="flex -space-x-2 mr-2">
            {board.members.map((bm: any) => (
              <div
                key={bm.member.id}
                title={bm.member.name}
                className={`h-8 w-8 rounded-full border-2 border-[#1d2125] flex items-center justify-center bg-blue-600 text-white text-xs font-bold`}
              >
                {bm.member.avatar || bm.member.name.charAt(0)}
              </div>
            ))}
          </div>
        )}

        {/* Invite Popover */}
        <div className="relative">
          <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none h-8 font-medium" onClick={() => setActivePopover(activePopover === "invite" ? null : "invite")}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite
          </Button>
          {activePopover === "invite" && (
             <div className="absolute right-0 top-full mt-2 w-72 bg-[#282E33] rounded-2xl shadow-2xl border border-white/10 p-4 z-40">
               <div className="flex items-center justify-between mb-3 text-white">
                 <h3 className="font-semibold text-sm">Invite to board</h3>
                 <button onClick={() => setActivePopover(null)} className="text-gray-400 hover:text-white cursor-pointer"><X className="h-4 w-4" /></button>
               </div>
               <form onSubmit={handleInvite}>
                 <label className="text-xs font-semibold text-gray-400 block mb-1">Email address</label>
                 <input
                   autoFocus
                   type="email"
                   required
                   value={inviteEmail}
                   onChange={(e) => setInviteEmail(e.target.value)}
                   className="w-full text-sm bg-[#22272b] border border-white/10 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white mb-3 placeholder-gray-500"
                   placeholder="name@example.com"
                 />
                 <Button type="submit" className="w-full bg-[#0c66e4] hover:bg-[#0055CC] text-white" disabled={isPending}>
                   {isPending ? "Inviting..." : "Send invitation"}
                 </Button>
               </form>
             </div>
          )}
        </div>

        {/* Filter Popover */}
        <div className="relative">
          <Button 
            size="sm" 
            variant="secondary" 
            className={`h-8 font-medium transition-colors ${filterActive ? 'bg-blue-500 hover:bg-blue-600 text-white border-none' : 'bg-white/20 hover:bg-white/30 text-white border-none'}`}
            onClick={() => setActivePopover(activePopover === "filter" ? null : "filter")}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
            {filterActive && (
              <X className="h-3 w-3 ml-1 cursor-pointer" onClick={(e) => { e.stopPropagation(); clearFilters(); }} />
            )}
          </Button>

          {activePopover === "filter" && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-[#282E33] rounded-2xl shadow-2xl border border-white/10 p-4 z-40">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm text-white">Filter cards</h3>
                <button onClick={() => setActivePopover(null)} className="text-gray-400 hover:text-white cursor-pointer"><X className="h-4 w-4" /></button>
              </div>
              
              <div className="mb-3">
                <label className="text-xs font-semibold text-gray-400 block mb-1">Label</label>
                <select 
                  value={selectedLabel} 
                  onChange={(e) => applyFilter(e.target.value, selectedMember, selectedDue)}
                  className="w-full text-sm bg-[#22272b] border border-white/10 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                >
                  <option value="">All labels</option>
                  {allLabels?.map((l: any) => (
                    <option key={l.id} value={l.id}>{l.text}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="text-xs font-semibold text-gray-400 block mb-1">Member</label>
                <select 
                  value={selectedMember} 
                  onChange={(e) => applyFilter(selectedLabel, e.target.value, selectedDue)}
                  className="w-full text-sm bg-[#22272b] border border-white/10 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                >
                  <option value="">All members</option>
                  {allMembers?.map((m: any) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="text-xs font-semibold text-gray-400 block mb-1">Due date</label>
                <select 
                  value={selectedDue} 
                  onChange={(e) => applyFilter(selectedLabel, selectedMember, e.target.value)}
                  className="w-full text-sm bg-[#22272b] border border-white/10 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                >
                  <option value="">Any</option>
                  <option value="overdue">Overdue</option>
                  <option value="upcoming">Due next 7 days</option>
                </select>
              </div>

              {filterActive && (
                <Button variant="ghost" size="sm" className="w-full text-blue-400 hover:text-blue-300 hover:bg-blue-900/30" onClick={clearFilters}>
                  Clear all filters
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Board Menu / Customizer Popover */}
        <div className="relative">
          <Button 
            size="sm" 
            variant="secondary" 
            className="bg-white/20 hover:bg-white/30 text-white border-none h-8 font-medium"
            onClick={() => setActivePopover(activePopover === "menu" ? null : "menu")}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>

          {activePopover === "menu" && (
             <div className="absolute right-0 top-full mt-2 w-80 bg-[#282E33] rounded-2xl shadow-2xl border border-white/10 p-4 z-40 max-h-[70vh] overflow-y-auto custom-scrollbar">
               <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10 text-white">
                 <h3 className="font-semibold text-sm mx-auto">Menu</h3>
                 <button onClick={() => setActivePopover(null)} className="text-gray-400 hover:text-white cursor-pointer absolute right-4"><X className="h-4 w-4" /></button>
               </div>

               {/* Background Customizer */}
               <div className="mb-6">
                 <div className="flex items-center gap-2 mb-2 font-semibold text-white text-sm">
                   <ImageIcon className="h-4 w-4" /> Change background
                 </div>
                 <div className="grid grid-cols-4 gap-2">
                   {BACKGROUNDS.map((bg, i) => (
                     <div 
                       key={i} 
                       onClick={() => handleSetBackground(bg)}
                       className="h-12 rounded cursor-pointer border border-transparent hover:opacity-80 transition hover:border-[#0c66e4]"
                       style={{ background: bg.includes("url") ? `${bg} center/cover no-repeat` : bg }} 
                     />
                   ))}
                 </div>
                 <div className="mt-4 text-xs font-semibold text-gray-400 block mb-1">Image URL</div>
                 <input
                     type="text"
                     placeholder="Or paste an image URL..."
                     className="w-full text-sm bg-[#22272b] border border-white/10 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 text-white placeholder-gray-500"
                     onKeyDown={(e) => { 
                       if (e.key === "Enter") {
                         const val = (e.target as HTMLInputElement).value;
                         if (val) handleSetBackground(val);
                       }
                     }}
                   />
               </div>

               {/* Archived Items */}
               <div>
                  <div className="flex items-center gap-2 mb-2 font-semibold text-white text-sm">
                   <Archive className="h-4 w-4" /> Archived items
                 </div>
                 <div className="max-h-[200px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                   {archivedCards.length === 0 ? (
                     <p className="text-sm text-gray-400 py-2">No archived cards.</p>
                   ) : (
                     archivedCards.map((c: any) => (
                       <div key={c.id} className="p-2 border border-white/10 rounded shadow-sm text-sm text-gray-200 flex items-start justify-between bg-[#22272b]">
                         <span className="font-medium mr-2">{c.title}</span>
                         <button 
                           onClick={() => handleRestoreCard(c.id)}
                           className="text-gray-400 hover:text-[#0c66e4] flex items-center gap-1 text-xs underline cursor-pointer shrink-0"
                         >
                           <RotateCcw className="h-3 w-3" /> Restore
                         </button>
                       </div>
                     ))
                   )}
                 </div>
               </div>
               
             </div>
          )}
        </div>

      </div>
    </div>
  );
}
