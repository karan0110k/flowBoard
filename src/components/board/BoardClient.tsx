/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  closestCorners,
} from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import FlowList from "../list/FlowList";
import FlowCard from "../card/FlowCard";
import { moveCard, createList, reorderLists, reorderCards } from "@/src/lib/actions";
import { Plus, X } from "lucide-react";
import { Button } from "../ui/button";

interface BoardClientProps {
  board: any;
  allMembers: any[];
  allLabels: any[];
  searchQuery?: string;
  filterLabel?: string;
  filterMember?: string;
  filterDue?: string;
}

export default function BoardClient({ board, allMembers, allLabels, searchQuery, filterLabel, filterMember, filterDue }: BoardClientProps) {
  const [mounted, setMounted] = useState(false);
  const [lists, setLists] = useState(board.lists || []);
  const [activeCard, setActiveCard] = useState<any | null>(null);
  const [activeList, setActiveList] = useState<any | null>(null);
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const [isPending, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (board.lists) {
      setLists(board.lists);
    }
  }, [board.lists]);

  if (!mounted) return <div className="flex-1 p-4 h-[calc(100vh-120px)] bg-black/20" />;

  const handleAddList = async () => {
    if (!newListTitle.trim()) return;
    startTransition(async () => {
      await createList(board.id, newListTitle.trim(), lists.length);
      setNewListTitle("");
      setIsAddingList(false);
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const { data } = active;
    if (data.current?.type === "Card") {
      setActiveCard(data.current.card);
      setActiveList(null);
    } else if (data.current?.type === "List") {
      setActiveList(data.current.list);
      setActiveCard(null);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveCard = active.data.current?.type === "Card";
    const isOverCard = over.data.current?.type === "Card";
    const isOverList = over.data.current?.type === "List";

    if (isActiveCard) {
      if (isOverCard) {
        setLists((prev: any) => {
          const activeListId = active.data.current?.card.listId;
          const overListId = over.data.current?.card.listId;
          
          const activeListIndex = prev.findIndex((l: any) => l.id === activeListId);
          const overListIndex = prev.findIndex((l: any) => l.id === overListId);

          if (activeListIndex === -1 || overListIndex === -1) return prev;

          const newLists = prev.map((l: any) => ({ ...l, cards: [...l.cards] }));
          const activeList = newLists[activeListIndex];
          const overList = newLists[overListIndex];
          
          const activeItemIndex = activeList.cards.findIndex((c: any) => c.id === activeId);
          const overItemIndex = overList.cards.findIndex((c: any) => c.id === overId);

          if (activeListIndex === overListIndex) {
            newLists[activeListIndex].cards = arrayMove(activeList.cards, activeItemIndex, overItemIndex);
          } else {
            const [movedCard] = newLists[activeListIndex].cards.splice(activeItemIndex, 1);
            movedCard.listId = overList.id;
            newLists[overListIndex].cards.splice(overItemIndex, 0, movedCard);
          }
          return newLists;
        });
      }

      if (isOverList) {
        setLists((prev: any) => {
          const activeListId = active.data.current?.card.listId;
          const overListId = overId;

          const activeListIndex = prev.findIndex((l: any) => l.id === activeListId);
          const overListIndex = prev.findIndex((l: any) => l.id === overListId);

          if (activeListIndex === -1 || overListIndex === -1) return prev;
          if (activeListIndex === overListIndex) return prev;

          const newLists = prev.map((l: any) => ({ ...l, cards: [...l.cards] }));
          const activeItemIndex = newLists[activeListIndex].cards.findIndex((c: any) => c.id === activeId);
          
          const [movedCard] = newLists[activeListIndex].cards.splice(activeItemIndex, 1);
          movedCard.listId = overListId;
          newLists[overListIndex].cards.push(movedCard);
          
          return newLists;
        });
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    const activeType = active.data.current?.type;
    
    setActiveCard(null);
    setActiveList(null);

    if (!over) return;

    if (activeType === "List") {
      const activeId = active.id;
      const overId = over.id;

      if (activeId !== overId) {
        setLists((items: any) => {
          const oldIndex = items.findIndex((i: any) => i.id === activeId);
          const newIndex = items.findIndex((i: any) => i.id === overId);
          const newOrder = arrayMove(items, oldIndex, newIndex);
          
          // Persist list reorder
          fetch("/api/lists/reorder", {
            method: "PATCH",
            body: JSON.stringify({
              boardId: board.id,
              listIds: newOrder.map((l: any) => l.id),
            }),
          });

          return newOrder;
        });
      }
    } else if (activeType === "Card") {
      const activeId = active.id;
      const overId = over.id;
      
      // Find current state for the card
      let currentListId = "";
      let currentPos = 0;
      
      for (const list of lists) {
        const idx = list.cards.findIndex((c: any) => c.id === activeId);
        if (idx !== -1) {
          currentListId = list.id;
          currentPos = idx;
          break;
        }
      }

      if (currentListId) {
        fetch("/api/cards/move", {
          method: "PATCH",
          body: JSON.stringify({
            cardId: activeId,
            destListId: currentListId,
            newPosition: currentPos,
            boardId: board.id
          }),
        });
      }
    }
  };

  // Filtering logic
  const getFilteredCards = (cards: any[]) => {
    let filtered = cards;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((c: any) => c.title.toLowerCase().includes(q));
    }
    if (filterLabel) {
      filtered = filtered.filter((c: any) => c.labels?.some((cl: any) => cl.label.id === filterLabel));
    }
    if (filterMember) {
      filtered = filtered.filter((c: any) => c.members?.some((cm: any) => cm.member.id === filterMember));
    }
    if (filterDue === "overdue") {
      filtered = filtered.filter((c: any) => c.dueDate && new Date(c.dueDate) < new Date());
    } else if (filterDue === "upcoming") {
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((c: any) => c.dueDate && new Date(c.dueDate) >= now && new Date(c.dueDate) <= nextWeek);
    }
    return filtered;
  };

  return (
    <div className="flex-1 overflow-x-auto p-4 flex gap-4 items-start relative h-[calc(100vh-120px)] custom-scrollbar">
      <DndContext
        id="board-dnd-context"
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 items-start pb-4">
          <SortableContext items={lists.map((l: any) => l.id)} strategy={horizontalListSortingStrategy}>
            {lists.map((list: any) => (
              <FlowList 
                key={list.id} 
                list={{ ...list, cards: getFilteredCards(list.cards) }} 
                boardId={board.id} 
                allLists={lists} 
                allMembers={allMembers} 
                allLabels={allLabels} 
              />
            ))}
          </SortableContext>
          
          {/* Add List */}
          {isAddingList ? (
            <div className="w-[272px] shrink-0 bg-[#f1f2f4] rounded-2xl p-3 shadow-sm border border-gray-200">
              <input
                autoFocus
                type="text"
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAddList(); if (e.key === "Escape") setIsAddingList(false); }}
                placeholder="Enter list title..."
                className="w-full text-sm px-3 py-2 rounded-lg border border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-[#172b4d] mb-2"
              />
              <div className="flex items-center gap-2">
                <Button size="sm" className="bg-[#0c66e4] hover:bg-[#0055CC] text-white rounded-lg" onClick={handleAddList} disabled={isPending}>
                  {isPending ? "Adding..." : "Add list"}
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-600" onClick={() => setIsAddingList(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div 
              className="w-[272px] shrink-0 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-2xl p-3 px-4 flex items-center font-medium cursor-pointer transition-all shadow-sm border border-white/10"
              onClick={() => setIsAddingList(true)}
            >
              <Plus className="h-4 w-4 mr-2" /> Add another list
            </div>
          )}
        </div>

        <DragOverlay dropAnimation={{ duration: 200, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
           {activeCard ? (
             <div className="rotate-2">
               <FlowCard 
                 card={activeCard} 
                 boardId={board.id} 
                 lists={lists} 
                 members={allMembers} 
                 labels={allLabels} 
               />
             </div>
           ) : activeList ? (
             <div className="rotate-2">
               <FlowList 
                 list={activeList} 
                 boardId={board.id} 
                 allLists={lists} 
                 allMembers={allMembers} 
                 allLabels={allLabels} 
               />
             </div>
           ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
