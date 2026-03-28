/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MoreHorizontal, Plus, X, Pencil, Trash2, GripVertical } from "lucide-react";
import { useState, useRef, useEffect, useTransition } from "react";
import FlowCard from "../card/FlowCard";
import { Button } from "../ui/button";
import { createCard, updateList, deleteList } from "@/src/lib/actions";

export default function FlowList({ list, boardId, allLists, allMembers, allLabels }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: list.id, data: { type: "List", list } });

  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(list.title);
  const [showMenu, setShowMenu] = useState(false);
  const [isPending, startTransition] = useTransition();
  const titleRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditingTitle && titleRef.current) titleRef.current.focus();
  }, [isEditingTitle]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    startTransition(async () => {
      await createCard(list.id, newTaskTitle.trim(), list.cards.length, boardId);
      setNewTaskTitle("");
      setIsAddingTask(false);
    });
  };

  const handleSaveTitle = () => {
    if (!editedTitle.trim() || editedTitle.trim() === list.title) {
      setEditedTitle(list.title);
      setIsEditingTitle(false);
      return;
    }
    startTransition(async () => {
      await updateList(list.id, editedTitle.trim());
      setIsEditingTitle(false);
    });
  };

  const handleDeleteList = () => {
    startTransition(async () => {
      await deleteList(list.id, boardId);
      setShowMenu(false);
    });
  };

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`w-[272px] shrink-0 flex flex-col bg-[#f1f2f4] rounded-2xl max-h-full shadow-sm hover:shadow transition-all ${isDragging ? "opacity-0 border-2 border-blue-500 z-50 invisible" : ""}`}
    >
      {isDragging && (
        <div className="absolute inset-0 bg-blue-100/50 border-2 border-dashed border-blue-500 rounded-2xl" />
      )}
      <div 
        {...attributes}
        {...listeners}
        className="flex items-center justify-between p-3 pb-2 cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <GripVertical className="h-4 w-4 text-gray-400 shrink-0" />
          {isEditingTitle ? (
            <input
              ref={titleRef}
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => { if (e.key === "Enter") handleSaveTitle(); if (e.key === "Escape") { setEditedTitle(list.title); setIsEditingTitle(false); } }}
              className="font-semibold text-sm text-[#172b4d] px-2 py-0.5 w-full rounded border border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          ) : (
            <h3 
              className="font-semibold text-sm text-[#172b4d] px-2 truncate cursor-pointer hover:bg-gray-200 rounded py-0.5 transition-colors"
              onClick={(e) => { e.stopPropagation(); setIsEditingTitle(true); }}
            >
              {list.title}
            </h3>
          )}
        </div>
        <div className="relative" ref={menuRef} onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#172b4d] hover:bg-gray-200" onClick={() => setShowMenu(!showMenu)}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
              <button
                className="w-full text-left px-4 py-2 text-sm text-[#172b4d] hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
                onClick={() => { setShowMenu(false); setIsEditingTitle(true); }}
              >
                <Pencil className="h-3.5 w-3.5" /> Rename list
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                onClick={handleDeleteList}
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete list
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 min-h-[10px]">
        <SortableContext items={list.cards.map((c: any) => c.id)} strategy={verticalListSortingStrategy}>
          {list.cards.map((card: any) => (
            <FlowCard 
              key={card.id} 
              card={card} 
              boardId={boardId} 
              lists={allLists} 
              members={allMembers} 
              labels={allLabels} 
            />
          ))}
        </SortableContext>
      </div>

      <div className="p-2 pt-1">
        {isAddingTask ? (
          <form onSubmit={handleAddCard} className="bg-white p-2 rounded-lg shadow-sm mb-1 border border-blue-400">
            <textarea
              autoFocus
              className="w-full text-sm outline-none resize-none text-[#172b4d]"
              placeholder="Enter a title for this card..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAddCard(e);
                }
                if (e.key === "Escape") setIsAddingTask(false);
              }}
            />
            <div className="flex items-center gap-2 mt-2">
              <Button type="submit" size="sm" className="bg-[#0c66e4] hover:bg-[#0055CC] text-white" disabled={isPending}>
                {isPending ? "Adding..." : "Add card"}
              </Button>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsAddingTask(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </form>
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-start text-[#44546f] hover:text-[#172b4d] hover:bg-gray-200 gap-2 font-medium"
            onClick={() => setIsAddingTask(true)}
          >
            <Plus className="h-4 w-4" />
            Add a card
          </Button>
        )}
      </div>
    </div>
  );
}
