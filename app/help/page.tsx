import Link from "next/link";
import FlowBoardNavbar from "@/src/components/navbar/FlowBoardNavbar";
import Sidebar from "@/src/components/sidebar/Sidebar";
import { getSession } from "@/src/lib/auth";
import prisma from "@/src/lib/db";
import { BookOpen, FileText, MessageCircle, Zap, Shield, Keyboard } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HelpCenterPage() {
  const session = await getSession();
  const user = session ? await prisma.user.findUnique({ where: { id: session.userId } }) : null;

  const helpTopics = [
    { icon: Zap, title: "Getting Started", description: "Learn how to create your first board, add lists and cards.", color: "from-blue-500 to-blue-600" },
    { icon: BookOpen, title: "Boards & Lists", description: "Organize your work with boards, lists and drag-and-drop.", color: "from-emerald-500 to-emerald-600" },
    { icon: FileText, title: "Cards & Details", description: "Add descriptions, labels, due dates, checklists and attachments.", color: "from-violet-500 to-violet-600" },
    { icon: Shield, title: "Account & Security", description: "Manage your account settings and keep your data safe.", color: "from-amber-500 to-amber-600" },
    { icon: MessageCircle, title: "Collaboration", description: "Invite team members, assign tasks and leave comments.", color: "from-pink-500 to-pink-600" },
    { icon: Keyboard, title: "Keyboard Shortcuts", description: "Speed up your workflow with handy keyboard shortcuts.", color: "from-slate-500 to-slate-600" },
  ];

  const faqs = [
    { q: "How do I create a new board?", a: "Click the 'Create' button in the navbar or use the '+ Create new board' card on your dashboard." },
    { q: "Can I use templates?", a: "Yes! Visit the Templates page to browse and use pre-built templates for various workflows." },
    { q: "How do I add members to a card?", a: "Open any card, then click 'Members' in the sidebar to assign team members." },
    { q: "How do I set a due date?", a: "Open a card and click 'Dates' to pick a due date from the calendar." },
    { q: "Can I drag and drop cards between lists?", a: "Yes! Simply click and drag any card to move it between lists or reorder within a list." },
    { q: "How do I add a cover image to a card?", a: "Open the card, click 'Cover', and choose from color presets, image presets, or paste a custom image URL." },
  ];

  return (
    <div className="min-h-screen bg-[#1d2125] flex flex-col">
      <FlowBoardNavbar user={user} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          {/* Hero */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-white mb-3">Help Center</h1>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">Everything you need to know about FlowBoard. Find answers, learn features, and get the most out of your boards.</p>
          </div>

          {/* Topics Grid */}
          <section className="mb-14">
            <h2 className="text-lg font-bold text-white mb-5">Browse by Topic</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {helpTopics.map((topic) => (
                <div key={topic.title} className="bg-[#282e33] rounded-2xl p-5 border border-white/[0.08] hover:border-white/20 transition-all group">
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${topic.color} flex items-center justify-center mb-3`}>
                    <topic.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-1">{topic.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{topic.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQs */}
          <section className="mb-14">
            <h2 className="text-lg font-bold text-white mb-5">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <details key={i} className="bg-[#282e33] rounded-xl border border-white/[0.08] overflow-hidden group">
                  <summary className="px-5 py-4 cursor-pointer text-white font-medium text-sm hover:bg-white/[0.03] transition-colors list-none flex items-center justify-between">
                    {faq.q}
                    <span className="text-gray-500 text-xs group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="px-5 pb-4 text-gray-400 text-sm leading-relaxed border-t border-white/[0.05] pt-3">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* Still Need Help */}
          <section className="text-center bg-[#282e33] rounded-2xl p-8 border border-white/[0.08]">
            <h2 className="text-lg font-bold text-white mb-2">Still need help?</h2>
            <p className="text-gray-400 text-sm mb-4">Our support team is ready to assist you.</p>
            <Link href="/contact" className="inline-block bg-[#0c66e4] hover:bg-[#0a5bc7] text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors">
              Contact Support
            </Link>
          </section>
        </main>
      </div>
    </div>
  );
}
