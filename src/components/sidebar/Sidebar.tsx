"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Layout, Home, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [wsExpanded, setWsExpanded] = useState(true);

  const navItems = [
    { href: "/boards", label: "Boards", icon: LayoutDashboard },
    { href: "/templates", label: "Templates", icon: Layout },
    { href: "/dashboard", label: "Home", icon: Home },
  ];

  return (
    <aside className="w-[240px] shrink-0 bg-[#161a1d] border-r border-white/[0.06] h-full overflow-y-auto hidden md:flex flex-col pt-4">
      {/* Nav items */}
      <nav className="px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 h-11 px-4 rounded-xl text-[15px] font-medium transition-colors ${
                isActive
                  ? "bg-[#1d3a5f] text-[#9cc8ff]"
                  : "text-gray-400 hover:bg-white/[0.06] hover:text-gray-200"
              }`}
            >
              <item.icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? "text-[#9cc8ff]" : "text-gray-500"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mx-4 my-3 border-t border-white/[0.06]" />

      {/* Workspaces */}
      <div className="px-3">
        <p className="px-4 py-1.5 text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Workspaces</p>
        <button
          onClick={() => setWsExpanded(!wsExpanded)}
          className="w-full flex items-center gap-3 h-11 px-4 rounded-xl text-[14px] font-medium text-gray-300 hover:bg-white/[0.06] transition-colors cursor-pointer"
        >
          <div className="h-7 w-7 rounded bg-gradient-to-br from-blue-500/80 to-purple-600/80 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
            F
          </div>
          <span className="flex-1 text-left truncate">FlowBoard Workspace</span>
          {wsExpanded ? <ChevronDown className="h-3.5 w-3.5 text-gray-600 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 text-gray-600 shrink-0" />}
        </button>

        {wsExpanded && (
          <div className="ml-5 pl-3 border-l border-white/[0.06] space-y-px mt-1 mb-2">
            <Link href="/boards" className="flex items-center gap-2.5 px-4 py-1.5 rounded-lg text-[12px] text-gray-500 hover:bg-white/[0.06] hover:text-gray-300 transition-colors">
              <LayoutDashboard className="h-3.5 w-3.5" /> Boards
            </Link>
            <Link href="/dashboard" className="flex items-center gap-2.5 px-4 py-1.5 rounded-lg text-[12px] text-gray-500 hover:bg-white/[0.06] hover:text-gray-300 transition-colors">
              <Home className="h-3.5 w-3.5" /> Members
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
