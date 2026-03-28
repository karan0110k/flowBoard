"use client";

import Link from "next/link";
import { Search, Bell, HelpCircle, Plus, LayoutTemplate, LogOut, User, X } from "lucide-react";
import { logout } from "@/src/lib/auth-actions";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useCallback, useRef, useEffect, useTransition } from "react";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, createBoard } from "@/src/lib/actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

interface Notification {
  id: string;
  text: string;
  link?: string;
  read: boolean;
  createdAt: string | Date;
}

export default function FlowBoardNavbar({ user }: { user?: { name: string; email: string } | null }) {
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "U";
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get("q") || "");
  const [isFocused, setIsFocused] = useState(false);
  const [activePopup, setActivePopup] = useState<'notifications' | 'help' | 'profile' | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [, startTransition] = useTransition();

  const popupRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    const data = await getNotifications();
    setNotifications(data);
    setUnreadCount(data.filter(n => !n.read).length);
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (activePopup === 'profile' && profileRef.current && !profileRef.current.contains(e.target as Node)) setActivePopup(null);
      if (activePopup === 'notifications' && popupRef.current && !popupRef.current.contains(e.target as Node)) setActivePopup(null);
      if (activePopup === 'help' && helpRef.current && !helpRef.current.contains(e.target as Node)) setActivePopup(null);
    };

    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActivePopup(null);
        setShowShortcuts(false);
      }
      if (e.key === "?" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        setShowShortcuts(true);
        setActivePopup(null);
      }
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", keyHandler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", keyHandler);
    };
  }, [activePopup]);

  // Sync search value when URL changes (e.g. navigating between pages)
  useEffect(() => {
    setSearchValue(searchParams.get("q") || "");
  }, [searchParams]);

  const pushSearch = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) { params.set("q", value); } else { params.delete("q"); }
    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`);
  }, [pathname, router, searchParams]);

  const handleSearch = useCallback((value: string) => {
    setSearchValue(value);
    // Push search params on all searchable pages
    if (pathname === "/dashboard" || pathname === "/boards" || pathname === "/templates" || pathname.startsWith("/boards/")) {
      pushSearch(value);
    }
  }, [pathname, pushSearch]);

  const clearSearch = () => {
    setSearchValue("");
    pushSearch("");
  };

  return (
    <header className="h-12 border-b border-white/[0.08] bg-[#1d2125] flex items-center px-3 sticky top-0 z-50 text-white">
      {/* Left */}
      <div className="flex items-center gap-3 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-1.5 hover:bg-white/[0.08] px-2 py-1 rounded-lg transition">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-0.5 rounded">
            <LayoutTemplate className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white hidden sm:inline">FlowBoard</span>
        </Link>
        <button 
          onClick={() => { setShowCreateBoard(true); setNewBoardTitle(""); }}
          className="hidden sm:flex items-center gap-1 bg-[#0c66e4] hover:bg-[#0a5bc7] text-white h-8 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          Create
        </button>
      </div>

      {/* Center - Search */}
      <div className="flex-1 flex justify-center px-4">
        <div className="relative w-full max-w-[680px] hidden md:block group">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${isFocused ? "text-blue-400" : "text-gray-500"}`} />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search boards, templates, cards..."
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`
              h-9 w-full rounded-xl pl-9 pr-9 text-[13px] text-white
              placeholder:text-gray-500
              transition-all duration-200 ease-out
              outline-none
              ${isFocused
                ? "bg-[#22272b] border border-[#0c66e4]/70 shadow-[0_0_0_2px_rgba(12,102,228,0.15)]"
                : "bg-[#2c333a] border border-white/[0.08] hover:bg-[#262d34] hover:border-white/[0.12]"
              }
            `}
          />
          {searchValue && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center shrink-0 gap-2">
        {/* Notifications */}
        <div className="relative" ref={popupRef}>
          <button 
            onClick={() => setActivePopup(activePopup === 'notifications' ? null : 'notifications')}
            className={`h-8 w-8 flex items-center justify-center hover:bg-white/[0.08] rounded-full transition cursor-pointer relative ${activePopup === 'notifications' ? "bg-blue-500/20 text-blue-400" : "text-gray-400 hover:text-white"}`}
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center border-2 border-[#1d2125]">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {activePopup === 'notifications' && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-[#282e33] rounded-2xl shadow-2xl border border-white/10 z-50 overflow-hidden flex flex-col max-h-[480px]">
              <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <h3 className="text-sm font-bold text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={() => { startTransition(async () => { await markAllNotificationsAsRead(); fetchNotifications(); }); }}
                    className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="overflow-y-auto custom-scrollbar flex-1">
                {notifications.length > 0 ? (
                  notifications.map((n: Notification) => (
                    <div 
                      key={n.id} 
                      onClick={() => { if(!n.read) markNotificationAsRead(n.id); if(n.link) router.push(n.link); setActivePopup(null); }}
                      className={`px-4 py-3 border-b border-white/05 hover:bg-white/05 transition-colors cursor-pointer relative group ${!n.read ? "bg-blue-500/05" : ""}`}
                    >
                      {!n.read && <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full" />}
                      <p className="text-[13px] text-gray-200 leading-snug pr-2">{n.text}</p>
                      <p className="text-[10px] text-gray-500 mt-1.5 font-medium">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                  ))
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center px-6">
                    <div className="bg-white/05 p-3 rounded-full mb-3">
                        <Bell className="h-6 w-6 text-gray-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-400">No new notifications</p>
                    <p className="text-xs text-gray-600 mt-1">We&apos;ll let you know when something important happens.</p>
                  </div>
                )}
              </div>
              <div className="p-2 border-t border-white/10 bg-white/[0.01]">
                <button className="w-full py-1.5 text-xs text-gray-400 hover:text-white hover:bg-white/05 rounded transition-colors font-medium">View all activity</button>
              </div>
            </div>
          )}
        </div>

        {/* Help */}
        <div className="relative" ref={helpRef}>
          <button 
            onClick={() => setActivePopup(activePopup === 'help' ? null : 'help')}
            className={`h-8 w-8 flex items-center justify-center hover:bg-white/[0.08] rounded-full transition hidden sm:flex cursor-pointer ${activePopup === 'help' ? "bg-blue-500/20 text-blue-400" : "text-gray-400 hover:text-white"}`}
          >
            <HelpCircle className="h-4 w-4" />
          </button>

          {activePopup === 'help' && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-[#282e33] rounded-2xl shadow-2xl border border-white/10 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 border-b border-white/10 mb-1">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Help & Support</h3>
              </div>
              <button 
                onClick={() => { router.push('/help'); setActivePopup(null); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition-colors cursor-pointer"
              >
                Help Center
              </button>
              <button 
                onClick={() => { setShowShortcuts(true); setActivePopup(null); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-between"
              >
                Keyboard Shortcuts
                <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-400">?</span>
              </button>
              <button 
                onClick={() => { router.push('/about'); setActivePopup(null); }} 
                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition-colors cursor-pointer"
              >
                About FlowBoard
              </button>
              <button 
                onClick={() => { router.push('/contact'); setActivePopup(null); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition-colors cursor-pointer"
              >
                Contact Support
              </button>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative ml-1" ref={profileRef}>
          <button
            onClick={() => setActivePopup(activePopup === 'profile' ? null : 'profile')}
            title={user?.name || "User"}
            className={`h-7 w-7 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 text-white font-semibold text-xs flex items-center justify-center border border-white/20 cursor-pointer hover:opacity-90 transition-opacity ${activePopup === 'profile' ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-[#1d2125]" : ""}`}
          >
            {initial}
          </button>
          {activePopup === 'profile' && (
            <div className="absolute right-0 top-full mt-2 w-60 bg-[#282e33] rounded-xl shadow-2xl border border-white/10 py-2 z-50">
              <div className="px-4 py-3 border-b border-white/10">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Account</p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 text-white font-bold text-sm flex items-center justify-center shrink-0">{initial}</div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{user?.name || "Guest"}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email || "Not logged in"}</p>
                  </div>
                </div>
              </div>
              <div className="py-1">
                {user ? (
                  <form action={logout}>
                    <button type="submit" className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 flex items-center gap-3 cursor-pointer transition-colors">
                      <LogOut className="h-4 w-4 text-gray-400" /> Log out
                    </button>
                  </form>
                ) : (
                  <>
                    <Link href="/login" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition-colors" onClick={() => setActivePopup(null)}>
                      <User className="h-4 w-4 text-gray-400 inline mr-3" /> Log in
                    </Link>
                    <Link href="/signup" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition-colors" onClick={() => setActivePopup(null)}>
                      <Plus className="h-4 w-4 text-gray-400 inline mr-3" /> Sign up
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Shortcuts Modal */}
      <Dialog open={showShortcuts} onOpenChange={setShowShortcuts}>
        <DialogContent className="bg-[#1d2125] border border-white/10 text-white rounded-2xl shadow-3xl max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold mb-4">Keyboard Shortcuts</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-white/05 rounded-xl border border-white/05">
              <span className="text-sm text-gray-300">Create new card (in list)</span>
              <kbd className="bg-white/20 px-2.5 py-1 rounded text-white font-mono text-sm shadow-sm ring-1 ring-white/10">N</kbd>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/05 rounded-xl border border-white/05">
              <span className="text-sm text-gray-300">Focus search bar</span>
              <kbd className="bg-white/20 px-2.5 py-1 rounded text-white font-mono text-sm shadow-sm ring-1 ring-white/10">/</kbd>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/05 rounded-xl border border-white/05">
              <span className="text-sm text-gray-300">Close open modal/popup</span>
              <kbd className="bg-white/20 px-2.5 py-1 rounded text-white font-mono text-sm shadow-sm ring-1 ring-white/10">Esc</kbd>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/05 rounded-xl border border-white/05">
              <span className="text-sm text-gray-300">Open shortcuts menu</span>
              <kbd className="bg-white/20 px-2.5 py-1 rounded text-white font-mono text-sm shadow-sm ring-1 ring-white/10">?</kbd>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Board Modal */}
      <Dialog open={showCreateBoard} onOpenChange={setShowCreateBoard}>
        <DialogContent className="bg-[#1d2125] border border-white/10 text-white rounded-2xl shadow-3xl max-w-sm p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Create Board</DialogTitle>
          </DialogHeader>
          <div className="mt-2 space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1.5">Board title</label>
              <input
                autoFocus
                type="text"
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newBoardTitle.trim()) {
                    startTransition(async () => {
                      const board = await createBoard(newBoardTitle.trim());
                      setShowCreateBoard(false);
                      router.push(`/boards/${board.id}`);
                    });
                  }
                }}
                placeholder="Enter board name"
                className="w-full h-10 bg-[#22272b] border border-white/10 rounded-lg px-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500/60"
              />
            </div>
            <button
              onClick={() => {
                if (!newBoardTitle.trim()) return;
                startTransition(async () => {
                  const board = await createBoard(newBoardTitle.trim());
                  setShowCreateBoard(false);
                  router.push(`/boards/${board.id}`);
                });
              }}
              disabled={!newBoardTitle.trim()}
              className="w-full h-9 bg-[#0c66e4] hover:bg-[#0a5bc7] text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Create
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
