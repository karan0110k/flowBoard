"use client";

import { useState, useTransition } from "react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { createBoard } from "@/src/lib/actions";

const backgroundOptions = [
  { label: "Ocean", value: "from-blue-700 to-purple-800" },
  { label: "Sunset", value: "from-orange-500 to-red-600" },
  { label: "Forest", value: "from-green-600 to-teal-700" },
  { label: "Berry", value: "from-pink-600 to-purple-700" },
  { label: "Night", value: "from-gray-700 to-gray-900" },
  { label: "Sky", value: "from-cyan-500 to-blue-600" },
];

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateBoardModal({ isOpen, onClose }: CreateBoardModalProps) {
  const [title, setTitle] = useState("");
  const [selectedBg, setSelectedBg] = useState(backgroundOptions[0].value);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleCreate = () => {
    if (!title.trim()) return;
    startTransition(async () => {
      const board = await createBoard(title.trim(), selectedBg);
      setTitle("");
      onClose();
      router.push(`/boards/${board.id}`);
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md bg-[#282e33] text-white border border-white/10 p-0 gap-0 rounded-xl shadow-2xl">
        <div className="p-6">
          <DialogTitle className="text-lg font-semibold mb-5">Create board</DialogTitle>

          {/* Background Preview */}
          <div className={`h-28 rounded-lg bg-gradient-to-br ${selectedBg} mb-5 flex items-center justify-center shadow-inner`}>
            <span className="text-white/60 text-sm font-medium">{title || "Board preview"}</span>
          </div>

          {/* Background Selection */}
          <div className="mb-5">
            <label className="text-xs font-semibold text-gray-400 block mb-2">Background</label>
            <div className="flex gap-2 flex-wrap">
              {backgroundOptions.map((bg) => (
                <button
                  key={bg.value}
                  onClick={() => setSelectedBg(bg.value)}
                  className={`h-9 w-12 rounded-md bg-gradient-to-br ${bg.value} cursor-pointer transition-all ${
                    selectedBg === bg.value ? "ring-2 ring-white ring-offset-2 ring-offset-[#282e33] scale-110" : "hover:opacity-80"
                  }`}
                  title={bg.label}
                />
              ))}
            </div>
          </div>

          {/* Board Title */}
          <div className="mb-5">
            <label className="text-xs font-semibold text-gray-400 block mb-2">
              Board title <span className="text-red-400">*</span>
            </label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
              placeholder="Enter board title"
              className="w-full bg-[#22272b] border border-white/20 text-white text-sm rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500"
            />
          </div>

          {/* Actions */}
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            onClick={handleCreate}
            disabled={!title.trim() || isPending}
          >
            {isPending ? "Creating..." : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
