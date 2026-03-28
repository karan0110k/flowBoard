/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { AlignLeft, Calendar, CheckSquare, MessageSquare, Tag, Users, Trash2, Archive, X, Check, Image as ImageIcon, Paperclip, Activity } from "lucide-react";
import { Button } from "../ui/button";
import {
  updateCard,
  deleteCard,
  archiveCard,
  addLabelToCard,
  removeLabelFromCard,
  addMemberToCard,
  removeMemberFromCard,
  addChecklist,
  addChecklistItem,
  toggleChecklistItem,
  deleteChecklistItem,
  updateCardDueDate,
  addComment,
  addAttachment,
  updateCardCover,
  logActivity
} from "@/src/lib/actions";

const COLORS = [
  "#216e4e", "#7f5f01", "#a54800", "#ae2e24", 
  "#5e4db2", "#0c66e4", "#206a83", "#4bce97"
];

export default function CardModal({ isOpen, onClose, card, boardId, allLists, allMembers, allLabels, currentUserSession }: any) {
  const [description, setDescription] = useState(card?.description || "");
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(card?.title || "");
  const [newComment, setNewComment] = useState("");
  const [showLabels, setShowLabels] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showCovers, setShowCovers] = useState(false);
  const [showAddChecklist, setShowAddChecklist] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date(card?.dueDate || new Date()));
  const [newChecklistTitle, setNewChecklistTitle] = useState("Checklist");
  const [addingItemTo, setAddingItemTo] = useState<string | null>(null);
  const [newItemText, setNewItemText] = useState("");
  const [isPending, startTransition] = useTransition();
  const titleRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (card) {
      setDescription(card.description || "");
      setTitle(card.title || "");
    }
  }, [card]);

  if (!card) return null;

  const completedChecklists = card.checklists?.reduce((acc: number, cl: any) => 
    acc + cl.items.filter((i: any) => i.completed).length, 0) || 0;
  const totalChecklists = card.checklists?.reduce((acc: number, cl: any) => 
    acc + cl.items.length, 0) || 0;
  const progress = totalChecklists === 0 ? 0 : Math.round((completedChecklists / totalChecklists) * 100);

  const cardLabelIds = card.labels?.map((cl: any) => cl.label.id) || [];
  const cardMemberIds = card.members?.map((cm: any) => cm.member.id) || [];

  const handleSaveDescription = () => {
    startTransition(async () => {
      await updateCard(card.id, { description }, boardId);
      await logActivity(boardId, "DESCRIPTION_UPDATED", card.id, "Updated this card's description");
    });
  };

  const handleSaveTitle = () => {
    if (!title.trim() || title.trim() === card.title) {
      setTitle(card.title);
      setEditingTitle(false);
      return;
    }
    startTransition(async () => {
      await updateCard(card.id, { title: title.trim() }, boardId);
      await logActivity(boardId, "TITLE_UPDATED", card.id, `Renamed card from ${card.title} to ${title.trim()}`);
      setEditingTitle(false);
    });
  };

  const handleDeleteCard = () => {
    startTransition(async () => {
      await deleteCard(card.id, boardId);
      await logActivity(boardId, "DELETED_CARD", undefined, `Deleted card ${card.title}`);
      onClose();
    });
  };

  const handleArchiveCard = () => {
    startTransition(async () => {
      await archiveCard(card.id, boardId);
      await logActivity(boardId, "ARCHIVED_CARD", card.id, `Archived card`);
      onClose();
    });
  };

  const handleToggleLabel = (labelId: string) => {
    startTransition(async () => {
      if (cardLabelIds.includes(labelId)) {
        await removeLabelFromCard(card.id, labelId, boardId);
      } else {
        await addLabelToCard(card.id, labelId, boardId);
        await logActivity(boardId, "LABEL_ADDED", card.id, `Added a label`);
      }
    });
  };

  const handleToggleMember = (memberId: string, memberName: string) => {
    startTransition(async () => {
      if (cardMemberIds.includes(memberId)) {
        await removeMemberFromCard(card.id, memberId, boardId);
      } else {
        await addMemberToCard(card.id, memberId, boardId);
        await logActivity(boardId, "MEMBER_ASSIGNED", card.id, `Assigned ${memberName} to this card`);
      }
    });
  };

  const handleAddChecklist = () => {
    startTransition(async () => {
      await addChecklist(card.id, newChecklistTitle.trim() || "Checklist", boardId);
      setShowAddChecklist(false);
      setNewChecklistTitle("Checklist");
    });
  };

  const handleAddChecklistItem = (checklistId: string) => {
    if (!newItemText.trim()) return;
    startTransition(async () => {
      await addChecklistItem(checklistId, newItemText.trim(), boardId);
      setNewItemText("");
      setAddingItemTo(null);
    });
  };

  const handleToggleChecklistItem = (itemId: string, completed: boolean) => {
    startTransition(async () => {
      await toggleChecklistItem(itemId, !completed, boardId);
    });
  };

  const handleDeleteChecklistItem = (itemId: string) => {
    startTransition(async () => {
      await deleteChecklistItem(itemId, boardId);
    });
  };

  const handleDueDateChange = (date: Date | null) => {
    const value = date ? date.toISOString() : null;
    startTransition(async () => {
      await updateCardDueDate(card.id, value, boardId);
      await logActivity(boardId, "DUE_DATE_CHANGED", card.id, date ? `Set due date to ${date.toLocaleDateString()}` : "Removed due date");
      setShowDatePicker(false);
    });
  };

  const renderCalendar = () => {
    const month = calendarMonth.getMonth();
    const year = calendarMonth.getFullYear();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(calendarMonth);
    
    const prevMonth = () => setCalendarMonth(new Date(year, month - 1, 1));
    const nextMonth = () => setCalendarMonth(new Date(year, month + 1, 1));

    const dateItems = [];
    for (let i = 0; i < firstDay; i++) {
        dateItems.push(<div key={`empty-${i}`} className="h-8 w-8" />);
    }
    for (let d = 1; d <= days; d++) {
        const date = new Date(year, month, d);
        const isSelected = card.dueDate && new Date(card.dueDate).toDateString() === date.toDateString();
        const isToday = new Date().toDateString() === date.toDateString();
        
        dateItems.push(
            <button
                key={d}
                onClick={() => handleDueDateChange(date)}
                className={`h-8 w-8 rounded-md text-sm flex items-center justify-center transition-colors cursor-pointer
                    ${isSelected ? "bg-blue-600 text-white font-bold" : "hover:bg-gray-100 text-[#172b4d]"}
                    ${isToday && !isSelected ? "text-blue-600 font-bold border border-blue-200" : ""}
                `}
            >
                {d}
            </button>
        );
    }

    return (
        <div className="absolute right-0 md:left-0 top-full mt-1 w-[280px] bg-white rounded-lg shadow-2xl border border-gray-200 p-4 z-[100] animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-md transition-colors cursor-pointer text-[#44546f]"><X className="h-4 w-4 rotate-180" /></button>
                <div className="text-sm font-bold text-[#172b4d]">{monthName} {year}</div>
                <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-md transition-colors cursor-pointer text-[#44546f] font-bold">»</button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                    <div key={day} className="h-8 w-8 flex items-center justify-center text-[11px] font-bold text-[#44546f]">{day}</div>
                ))}
                {dateItems}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                <Button variant="ghost" size="sm" className="flex-1 text-xs text-[#44546f] hover:bg-red-50 hover:text-red-700" onClick={() => handleDueDateChange(null)}>Remove date</Button>
                <Button variant="outline" size="sm" className="flex-1 text-xs border-gray-200" onClick={() => setShowDatePicker(false)}>Cancel</Button>
            </div>
        </div>
    );
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    startTransition(async () => {
      await addComment(card.id, newComment.trim(), boardId);
      await logActivity(boardId, "COMMENT_ADDED", card.id, "Left a comment");
      setNewComment("");
    });
  };

  const handleUpdateCover = (colorOrUrl: string | null) => {
    startTransition(async () => {
      await updateCardCover(card.id, colorOrUrl, boardId);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate upload by reading base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      startTransition(async () => {
        await addAttachment(card.id, file.name, base64, file.type, boardId);
        await logActivity(boardId, "ATTACHMENT_ADDED", card.id, `Attached ${file.name}`);
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] md:max-w-3xl max-h-[90vh] overflow-y-auto bg-[#f1f2f4] text-[#172b4d] p-0 border-none gap-0 shadow-2xl rounded-xl">
        
        {/* Cover Strip */}
        {card.cover && (
          <div 
            className="w-full h-32 rounded-t-xl bg-cover bg-center" 
            style={{ 
              backgroundColor: !(card.cover.startsWith("data:") || card.cover.startsWith("http")) ? card.cover : undefined,
              backgroundImage: (card.cover.startsWith("data:") || card.cover.startsWith("http")) ? `url(${card.cover})` : undefined,
            }}
          />
        )}

        {/* Header */}
        <div className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl font-bold flex items-start gap-4">
            <span className="mt-1 text-gray-700">📋</span>
            <div className="w-full">
              {editingTitle ? (
                <input
                  ref={titleRef}
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSaveTitle(); if (e.key === "Escape") { setTitle(card.title); setEditingTitle(false); } }}
                  className="text-[20px] font-semibold text-[#172b4d] leading-6 w-full bg-white border border-blue-400 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <h2 
                  className="text-[20px] font-semibold text-[#172b4d] leading-6 cursor-pointer hover:bg-[#091e420f] rounded px-2 py-1 transition-colors" 
                  onClick={() => setEditingTitle(true)}
                >
                  {card.title}
                </h2>
              )}
               <p className="text-sm text-[#44546f] font-normal mt-1 px-2">
                 in list <span className="underline cursor-pointer">{allLists.find((l:any) => l.id === card.listId)?.title}</span>
               </p>
            </div>
          </DialogTitle>
        </div>

        {/* Current Labels/Members display */}
        {(card.labels?.length > 0 || card.members?.length > 0 || card.dueDate) && (
          <div className="px-6 pb-2 flex flex-wrap gap-4 ml-10 mb-4">
            {card.members?.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-[#44546f] block mb-1">Members</span>
                <div className="flex -space-x-1">
                  {card.members.map((cm: any) => (
                    <div key={cm.member.id} title={cm.member.name} className="h-8 w-8 rounded-full bg-blue-500 border-2 border-[#f1f2f4] flex items-center justify-center text-white text-xs font-bold">
                      {cm.member.avatar || cm.member.name.charAt(0)}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {card.labels?.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-[#44546f] block mb-1">Labels</span>
                <div className="flex flex-wrap gap-1">
                  {card.labels.map((cl: any) => (
                    <span key={cl.label.id} className={`${cl.label.color} text-white text-xs px-3 py-1 rounded font-medium`}>
                      {cl.label.text}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {card.dueDate && (
              <div>
                <span className="text-xs font-semibold text-[#44546f] block mb-1">Due date</span>
                <span className={`text-xs px-2 py-1 rounded font-medium ${new Date(card.dueDate) < new Date() ? "bg-red-100 text-red-700" : "bg-gray-200 text-[#172b4d]"}`}>
                  {new Date(card.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Content Body */}
        <div className="flex flex-col md:flex-row px-6 pb-6 gap-8">
           <div className="flex-1 space-y-8">

             {/* Description */}
             <div>
               <div className="flex items-center gap-3 font-semibold text-[#172b4d] mb-3">
                 <AlignLeft className="h-5 w-5 text-[#44546f]" />
                 <h3 className="text-base font-semibold">Description</h3>
               </div>
               <div className="ml-8">
                 <textarea
                   value={description}
                   onChange={(e) => setDescription(e.target.value)}
                   className="w-full bg-[#091e420f] hover:bg-[#091e4214] border-none rounded-[3px] p-3 text-[14px] text-[#172b4d] min-h-[56px] focus:min-h-[108px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all resize-none placeholder:text-[#44546f]"
                   placeholder="Add a more detailed description..."
                 />
                 {description !== (card.description || "") && (
                   <div className="flex gap-2 mt-2">
                     <Button className="text-white bg-[#0c66e4] hover:bg-[#0055CC] font-medium transition-colors" size="sm" onClick={handleSaveDescription} disabled={isPending}>
                       {isPending ? "Saving..." : "Save"}
                     </Button>
                     <Button variant="ghost" size="sm" onClick={() => setDescription(card.description || "")}>Cancel</Button>
                   </div>
                 )}
               </div>
             </div>

             {/* Attachments */}
             {card.attachments && card.attachments.length > 0 && (
               <div>
                 <div className="flex items-center gap-3 font-semibold text-[#172b4d] mb-3">
                   <Paperclip className="h-5 w-5 text-[#44546f]" />
                   <h3 className="text-base font-semibold">Attachments</h3>
                 </div>
                 <div className="ml-8 space-y-3">
                   {card.attachments.map((att: any) => (
                     <div key={att.id} className="flex gap-3 hover:bg-[#091e420f] p-2 rounded transition cursor-pointer group items-center">
                       {att.type.startsWith("image/") ? (
                         <div className="h-20 w-28 rounded bg-gray-200 shrink-0 overflow-hidden">
                           <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
                         </div>
                       ) : (
                         <div className="h-20 w-28 rounded bg-[#091e420f] shrink-0 flex items-center justify-center font-bold text-gray-500 uppercase">
                           {att.name.split('.').pop() || "FILE"}
                         </div>
                       )}
                       <div>
                         <p className="font-semibold text-sm text-[#172b4d]">{att.name}</p>
                         <p className="text-xs text-gray-500">Added {new Date(att.createdAt).toLocaleDateString()}</p>
                         <p className="text-xs text-[#0c66e4] underline mt-1">Download</p>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             )}

             {/* Checklists */}
             {card.checklists?.map((checklist: any) => (
               <div key={checklist.id}>
                 <div className="flex items-center gap-3 font-semibold text-[#172b4d] mb-3">
                   <CheckSquare className="h-5 w-5 text-[#44546f]" />
                   <h3 className="text-base font-semibold">{checklist.title}</h3>
                 </div>
                 <div className="ml-8 flex items-center gap-3 mb-4">
                   <span className="text-xs text-[#44546f] w-8 text-right">{progress}%</span>
                   <div className="h-2 w-full bg-[#091e4214] rounded-full overflow-hidden">
                     <div className="h-full bg-green-600 transition-all duration-300" style={{ width: `${progress}%` }} />
                   </div>
                 </div>
                 <div className="ml-8 space-y-1">
                   {checklist.items.map((item: any) => (
                     <div key={item.id} className="flex items-center gap-3 hover:bg-[#091e420f] p-2 rounded transition cursor-pointer group">
                       <input 
                         type="checkbox" 
                         checked={item.completed} 
                         onChange={() => handleToggleChecklistItem(item.id, item.completed)}
                         className="h-4 w-4 cursor-pointer rounded-sm border-gray-300 text-blue-600 accent-blue-600" 
                       />
                       <span className={`text-sm flex-1 ${item.completed ? "line-through text-[#44546f]" : "text-[#172b4d]"}`}>{item.text}</span>
                       <button 
                         onClick={() => handleDeleteChecklistItem(item.id)}
                         className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all cursor-pointer"
                       >
                         <X className="h-3.5 w-3.5" />
                       </button>
                     </div>
                   ))}
                   {addingItemTo === checklist.id ? (
                     <div className="mt-2">
                       <input
                         autoFocus
                         type="text"
                         value={newItemText}
                         onChange={(e) => setNewItemText(e.target.value)}
                         onKeyDown={(e) => { if (e.key === "Enter") handleAddChecklistItem(checklist.id); if (e.key === "Escape") setAddingItemTo(null); }}
                         placeholder="Add an item"
                         className="w-full text-sm bg-white border border-blue-400 rounded px-3 py-2 text-[#172b4d] focus:outline-none focus:ring-2 focus:ring-blue-500"
                       />
                       <div className="flex gap-2 mt-2">
                         <Button size="sm" className="bg-[#0c66e4] hover:bg-[#0055CC] text-white" onClick={() => handleAddChecklistItem(checklist.id)} disabled={isPending}>Add</Button>
                         <Button variant="ghost" size="sm" onClick={() => setAddingItemTo(null)}>Cancel</Button>
                       </div>
                     </div>
                   ) : (
                     <Button 
                       variant="secondary" size="sm" 
                       className="mt-3 bg-[#091e420f] hover:bg-[#091e4214] text-[#172b4d] font-medium border-none shadow-none transition-colors"
                       onClick={() => { setAddingItemTo(checklist.id); setNewItemText(""); }}
                     >
                       Add an item
                     </Button>
                   )}
                 </div>
               </div>
             ))}

             {/* Activity / Comments */}
             <div>
               <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-3 font-semibold text-[#172b4d]">
                   <Activity className="h-5 w-5 text-[#44546f]" />
                   <h3 className="text-base font-semibold">Activity</h3>
                 </div>
               </div>
               
               <div className="flex gap-3 mb-6">
                 <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">U</div>
                 <div className="flex-1">
                   <div className="bg-white rounded-lg shadow-sm border border-gray-200 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                     <textarea
                       value={newComment}
                       onChange={(e) => setNewComment(e.target.value)}
                       className="w-full bg-transparent border-none rounded-lg p-3 text-[14px] text-[#172b4d] min-h-[40px] focus:min-h-[80px] focus:outline-none resize-none placeholder:text-[#44546f]"
                       placeholder="Write a comment..."
                     />
                     {newComment && (
                       <div className="p-2 border-t border-gray-100 flex justify-end">
                         <Button size="sm" className="text-white bg-[#0c66e4] hover:bg-[#0055CC] font-medium h-8" onClick={handleAddComment} disabled={isPending}>Save</Button>
                       </div>
                     )}
                   </div>
                 </div>
               </div>

               <div className="space-y-4 ml-11">
                 {/* Mix Comments and Activities together and sort by date */}
                 {[...(card.comments || []), ...(card.activities || [])]
                   .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                   .map((item: any) => {
                     const isComment = !!item.text;
                     const userInitial = item.user?.name ? item.user.name.charAt(0).toUpperCase() : "U";
                     
                     if (isComment) {
                       return (
                         <div key={`comment-${item.id}`} className="flex gap-3 relative">
                           <div className="absolute -left-11 h-8 w-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">{userInitial}</div>
                           <div className="flex-1 group">
                             <span className="font-bold text-[#172b4d] text-sm mr-2">{item.user?.name || "User"}</span>
                             <span className="text-[#44546f] text-xs">{new Date(item.createdAt).toLocaleDateString()}</span>
                             <div className="bg-white p-2.5 rounded shadow-sm text-sm border border-gray-200 text-[#172b4d] mt-1">
                               <p>{item.text}</p>
                             </div>
                           </div>
                         </div>
                       );
                     } else {
                       return (
                         <div key={`act-${item.id}`} className="flex gap-3 relative items-center">
                           <div className="absolute -left-11 h-8 w-8 rounded-full bg-[#f1f2f4] text-[#172b4d] flex items-center justify-center font-bold text-sm shrink-0">{userInitial}</div>
                           <p className="text-sm text-[#172b4d] flex items-center gap-1.5 flex-wrap">
                             <span className="font-bold">{item.user?.name || "User"}</span>
                             <span className="text-[#44546f]">{item.content}</span>
                             <span className="text-[#44546f] text-xs ml-1">{new Date(item.createdAt).toLocaleDateString()}</span>
                           </p>
                         </div>
                       );
                     }
                 })}
               </div>
             </div>

           </div>

           {/* Sidebar Actions */}
           <div className="w-full md:w-48 shrink-0 flex flex-col gap-5 mt-2">
             <div>
                <h4 className="text-xs font-semibold text-[#44546f] mb-2 pointer-events-none">Add to card</h4>
                <div className="flex flex-col gap-2">
                  
                  {/* Members */}
                  <div className="relative">
                    <Button variant="secondary" className="w-full justify-start bg-[#091e420f] hover:bg-[#091e4214] text-[#172b4d] font-medium text-sm shadow-none transition-colors" onClick={() => { setShowMembers(!showMembers); setShowLabels(false); setShowCovers(false); }}>
                      <Users className="h-4 w-4 mr-2 text-[#44546f]" /> Members
                    </Button>
                    {showMembers && (
                      <div className="absolute left-0 top-full mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                        <div className="px-3 py-1 text-xs font-semibold text-[#44546f]">Board members</div>
                        {allMembers?.map((m: any) => {
                          if(!m) return null;
                          return (
                            <button
                              key={m.id}
                              onClick={() => handleToggleMember(m.id, m.name)}
                              className="w-full text-left px-3 py-2 text-sm text-[#172b4d] hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
                            >
                              <div className="h-7 w-7 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">{m.avatar || m.name.charAt(0)}</div>
                              <span className="flex-1">{m.name}</span>
                              {cardMemberIds.includes(m.id) && <Check className="h-4 w-4 text-blue-600" />}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Labels */}
                  <div className="relative">
                    <Button variant="secondary" className="w-full justify-start bg-[#091e420f] hover:bg-[#091e4214] text-[#172b4d] font-medium text-sm shadow-none transition-colors" onClick={() => { setShowLabels(!showLabels); setShowMembers(false); setShowCovers(false); }}>
                      <Tag className="h-4 w-4 mr-2 text-[#44546f]" /> Labels
                    </Button>
                    {showLabels && (
                      <div className="absolute left-0 top-full mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                        <div className="px-3 py-1 text-xs font-semibold text-[#44546f]">Labels</div>
                        {allLabels?.map((l: any) => (
                          <button
                            key={l.id}
                            onClick={() => handleToggleLabel(l.id)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
                          >
                            <span className={`${l.color} h-6 flex-1 rounded text-white text-xs font-medium flex items-center px-2`}>{l.text}</span>
                            {cardLabelIds.includes(l.id) && <Check className="h-4 w-4 text-blue-600" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Checklist */}
                  <div className="relative">
                    <Button variant="secondary" className="w-full justify-start bg-[#091e420f] hover:bg-[#091e4214] text-[#172b4d] font-medium text-sm shadow-none transition-colors" onClick={() => { setShowAddChecklist(!showAddChecklist); setShowLabels(false); setShowMembers(false); setShowCovers(false); }}>
                      <CheckSquare className="h-4 w-4 mr-2 text-[#44546f]" /> Checklist
                    </Button>
                    {showAddChecklist && (
                      <div className="absolute left-0 top-full mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-50">
                        <label className="text-xs font-semibold text-[#44546f] block mb-1">Title</label>
                        <input
                          autoFocus
                          type="text"
                          value={newChecklistTitle}
                          onChange={(e) => setNewChecklistTitle(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") handleAddChecklist(); }}
                          className="w-full text-sm bg-white border border-gray-300 rounded px-2 py-1.5 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-[#172b4d]"
                        />
                        <Button size="sm" className="w-full bg-[#0c66e4] hover:bg-[#0055CC] text-white" onClick={handleAddChecklist} disabled={isPending}>Add</Button>
                      </div>
                    )}
                  </div>

                  {/* Dates */}
                  <div className="relative">
                    <Button variant="secondary" className="w-full justify-start bg-[#091e420f] hover:bg-[#091e4214] text-[#172b4d] font-medium text-sm shadow-none transition-colors" onClick={() => { setShowDatePicker(!showDatePicker); setShowMembers(false); setShowLabels(false); setShowCovers(false); }}>
                      <Calendar className="h-4 w-4 mr-2 text-[#44546f]" /> Dates
                    </Button>
                    {showDatePicker && renderCalendar()}
                  </div>

                  {/* Attachment */}
                  <div className="relative">
                    <Button variant="secondary" className="w-full justify-start bg-[#091e420f] hover:bg-[#091e4214] text-[#172b4d] font-medium text-sm shadow-none transition-colors">
                      <Paperclip className="h-4 w-4 mr-2 text-[#44546f]" /> Attachment
                    </Button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="absolute opacity-0 inset-0 cursor-pointer w-full h-full" 
                      onChange={handleFileUpload} 
                    />
                  </div>

                  {/* Cover */}
                  <div className="relative">
                    <Button variant="secondary" className="w-full justify-start bg-[#091e420f] hover:bg-[#091e4214] text-[#172b4d] font-medium text-sm shadow-none transition-colors" onClick={() => { setShowCovers(!showCovers); setShowLabels(false); setShowMembers(false); }}>
                      <ImageIcon className="h-4 w-4 mr-2 text-[#44546f]" /> Cover
                    </Button>
                    {showCovers && (
                      <div className="absolute left-0 top-full mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-50">
                        <div className="text-xs font-semibold text-[#44546f] mb-2 flex justify-between items-center">
                          Covers 
                          {card.cover && <button className="text-blue-600 hover:underline" onClick={() => handleUpdateCover(null)}>Remove</button>}
                        </div>
                        <div className="grid grid-cols-4 gap-2 mb-2">
                          {COLORS.map(c => (
                            <button key={c} onClick={() => handleUpdateCover(c)} className="h-8 rounded cursor-pointer hover:opacity-80 transition-opacity" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                        <div className="text-xs font-semibold text-[#44546f] mb-2 mt-4 block">Image URL</div>
                        <input
                          type="text"
                          placeholder="Paste image URL here"
                          className="w-full text-sm bg-white border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                          onKeyDown={(e) => { 
                            if (e.key === "Enter") {
                              const val = (e.target as HTMLInputElement).value;
                              if (val) handleUpdateCover(val);
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
             </div>

             {/* Actions */}
             <div>
                <h4 className="text-xs font-semibold text-[#44546f] mb-2 pointer-events-none mt-4">Actions</h4>
                <div className="flex flex-col gap-2">
                  <Button variant="secondary" className="w-full justify-start bg-[#091e420f] hover:bg-[#091e4214] text-[#172b4d] font-medium text-sm shadow-none transition-colors" onClick={handleArchiveCard} disabled={isPending}>
                    <Archive className="h-4 w-4 mr-2 text-[#44546f]" /> Archive
                  </Button>
                  <Button variant="secondary" className="w-full justify-start bg-red-50 hover:bg-red-100 text-red-700 font-medium text-sm shadow-none transition-colors" onClick={handleDeleteCard} disabled={isPending}>
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </Button>
                </div>
             </div>

           </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}
