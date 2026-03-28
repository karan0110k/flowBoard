"use client";

import { useState, useTransition } from "react";
import { Search } from "lucide-react";
import { templates, templateCategories, featuredCategories, TemplateDefinition } from "@/src/data/templates";
import { createBoardFromTemplate } from "@/src/lib/actions";
import { useRouter } from "next/navigation";

export default function TemplatesPageClient() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const filteredTemplates = templates.filter((t) => {
    const matchesCategory = !selectedCategory || t.category === selectedCategory;
    const matchesSearch = !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUseTemplate = (template: TemplateDefinition) => {
    setLoadingId(template.id);
    startTransition(async () => {
      const board = await createBoardFromTemplate(template.title, template.description, template.defaultLists, template.image);
      router.push(`/boards/${board.id}`);
    });
  };

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="flex">
        {/* Category Sidebar */}
        <nav className="w-44 shrink-0 border-r border-white/[0.06] p-3 hidden lg:block">
          <p className="px-2 py-1.5 text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-1">Categories</p>
          <div className="space-y-px">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`w-full text-left px-2.5 py-[6px] rounded-lg text-[12px] font-medium transition-colors cursor-pointer ${
                !selectedCategory ? "bg-[#1d4ed8]/15 text-blue-300 border border-white/[0.08]" : "text-gray-400 hover:bg-white/[0.05] hover:text-gray-300 border border-transparent"
              }`}
            >
              All
            </button>
            {templateCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`w-full text-left px-2.5 py-[6px] rounded-lg text-[12px] font-medium transition-colors cursor-pointer ${
                  selectedCategory === cat ? "bg-[#1d4ed8]/15 text-blue-300 border border-white/[0.08]" : "text-gray-400 hover:bg-white/[0.05] hover:text-gray-300 border border-transparent"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </nav>

        {/* Main content */}
        <div className="flex-1 p-6 md:px-10 md:py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Featured Categories</h2>
            <div className="relative w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 w-full bg-[#2c333a] border border-white/10 rounded-lg pl-8 pr-3 text-[13px] text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500/60 transition-all"
              />
            </div>
          </div>

          {/* Featured Category Cards */}
          {!selectedCategory && !searchQuery && (
            <section className="mb-12">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {featuredCategories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`h-[88px] rounded-2xl bg-gradient-to-br ${cat.color} p-4 cursor-pointer border border-white/10 hover:border-white/20 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 transition-all text-left group relative overflow-hidden bg-cover bg-center`}
                    style={cat.image ? { backgroundImage: `url(${cat.image})` } : undefined}
                  >
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
                    <span className="text-xl absolute top-2.5 right-3 opacity-25 group-hover:opacity-40 transition-opacity">{cat.icon}</span>
                    <h3 className="text-white font-semibold text-[13px] relative z-10 mt-auto">{cat.name}</h3>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Templates Grid */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-white">
                {selectedCategory ? selectedCategory : "New and Notable Templates"}
              </h2>
              {selectedCategory && (
                <button onClick={() => setSelectedCategory(null)} className="text-[12px] text-blue-400 hover:text-blue-300 transition cursor-pointer">
                  Clear filter
                </button>
              )}
            </div>

            {filteredTemplates.length === 0 ? (
              <p className="text-gray-500 text-sm py-12 text-center">No templates found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="bg-[#282e33] rounded-2xl overflow-hidden border border-white/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.25)] hover:border-white/[0.15] hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.35)] hover:scale-[1.02] transition-all duration-200 group flex flex-col"
                    style={{ minHeight: 320 }}
                  >
                    {/* Cover — 60% */}
                    <div 
                      className={`h-[190px] bg-gradient-to-br ${template.background} relative overflow-hidden bg-cover bg-center`}
                      style={template.image ? { backgroundImage: `url(${template.image})` } : undefined}
                    >
                      <span className="absolute top-4 right-5 text-3xl opacity-20 group-hover:opacity-35 transition-opacity">{template.icon}</span>
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#282e33]/60 to-transparent" />
                    </div>

                    {/* Content — 40% */}
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="text-white font-semibold text-lg leading-tight mb-1">{template.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 mb-4 flex-1">{template.description}</p>

                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-[11px] text-gray-500 bg-white/[0.04] px-2 py-0.5 rounded">{template.category}</span>
                        <button
                          className="bg-[#0c66e4] hover:bg-[#0a5bc7] text-white text-[12px] font-semibold h-8 px-4 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                          onClick={() => handleUseTemplate(template)}
                          disabled={isPending && loadingId === template.id}
                        >
                          {isPending && loadingId === template.id ? "Creating..." : "Use Template"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
