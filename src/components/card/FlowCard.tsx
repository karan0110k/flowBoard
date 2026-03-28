import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AlignLeft, Calendar, CheckSquare, Paperclip } from "lucide-react";
import { useState } from "react";
import CardModal from "../modal/CardModal";

export default function FlowCard({ card, boardId, lists, members, labels }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, data: { type: "Card", card } });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 100 : 1,
  };

  const completedChecklists = card.checklists?.reduce((acc: number, cl: any) => 
    acc + cl.items.filter((i: any) => i.completed).length, 0) || 0;
  const totalChecklists = card.checklists?.reduce((acc: number, cl: any) => 
    acc + cl.items.length, 0) || 0;

  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date();
  const hasAttachments = card.attachments?.length > 0;

  return (
    <>
      <div 
        ref={setNodeRef} 
        style={style} 
        {...attributes} 
        {...listeners}
        onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}
        className={`bg-white rounded-[8px] cursor-grab active:cursor-grabbing group hover:bg-gray-50 border border-transparent hover:border-blue-500 shadow-sm transition-all mb-2 overflow-hidden ${isDragging ? "opacity-0 invisible" : ""}`}
      >
        {isDragging && (
          <div className="absolute inset-0 bg-blue-50/50 border-2 border-dashed border-blue-400 rounded-lg" />
        )}

        {/* Card Cover */}
        {card.cover && (
          <div 
            className="w-full h-8 bg-cover bg-center" 
            style={{ 
              backgroundColor: !(card.cover.startsWith("data:") || card.cover.startsWith("http")) ? card.cover : undefined,
              backgroundImage: (card.cover.startsWith("data:") || card.cover.startsWith("http")) ? `url(${card.cover})` : undefined,
            }}
          />
        )}

        <div className="p-3 sm:p-3.5 pt-2">
          {/* Labels Map */}
          {card.labels?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1.5">
              {card.labels.map((cl: any) => (
                <div 
                  key={cl.label.id} 
                  className={`h-2 min-w-[32px] rounded-full ${cl.label.color}`}
                  title={cl.label.text}
                />
              ))}
            </div>
          )}

          <h4 className="text-sm text-[#172b4d] mb-2 leading-tight font-medium">
            {card.title}
          </h4>

          {/* Badges Container */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2 text-gray-500">
              {card.dueDate && (
                <div className={`flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded ${isOverdue ? "bg-red-100 text-red-700 font-medium" : "bg-gray-100"}`}>
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(card.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                </div>
              )}
              {card.description && (
                <div title="This card has a description.">
                  <AlignLeft className="h-3.5 w-3.5" />
                </div>
              )}
              {hasAttachments && (
                <div className="flex items-center gap-1 text-[11px]" title={`${card.attachments.length} attachments`}>
                  <Paperclip className="h-3.5 w-3.5" />
                  <span>{card.attachments.length}</span>
                </div>
              )}
              {totalChecklists > 0 && (
                <div className={`flex items-center gap-1 text-[11px] ${completedChecklists === totalChecklists ? "bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium" : ""}`}>
                  <CheckSquare className="h-3.5 w-3.5" />
                  <span>{completedChecklists}/{totalChecklists}</span>
                </div>
              )}
            </div>

            <div className="flex -space-x-1 justify-end">
               {card.members?.map((cm: any) => (
                <div 
                  key={cm.member.id} 
                  title={cm.member.name}
                  className="h-6 w-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold shadow-sm"
                >
                  {cm.member.avatar || cm.member.name.charAt(0)}
                </div>
               ))}
            </div>
          </div>
        </div>
      </div>

      <CardModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        card={card}
        boardId={boardId}
        allLists={lists}
        allMembers={members}
        allLabels={labels}
      />
    </>
  );
}
