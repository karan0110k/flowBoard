import FlowBoardNavbar from "@/src/components/navbar/FlowBoardNavbar";
import Sidebar from "@/src/components/sidebar/Sidebar";
import { getSession } from "@/src/lib/auth";
import prisma from "@/src/lib/db";
import { LayoutTemplate, Zap, Users, Lock, Smartphone, Globe } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const session = await getSession();
  const user = session ? await prisma.user.findUnique({ where: { id: session.userId } }) : null;

  const features = [
    { icon: LayoutTemplate, title: "Boards & Templates", desc: "Organize anything with flexible boards, lists and pre-built templates." },
    { icon: Zap, title: "Drag & Drop", desc: "Effortlessly move cards and lists with smooth drag-and-drop." },
    { icon: Users, title: "Collaboration", desc: "Assign members, leave comments, and work together in real time." },
    { icon: Lock, title: "Secure by Default", desc: "Your data is protected with industry-standard encryption." },
    { icon: Smartphone, title: "Responsive Design", desc: "Works beautifully on desktop, tablet, and mobile devices." },
    { icon: Globe, title: "Open & Extensible", desc: "Built with modern web technologies — Next.js, Prisma, and PostgreSQL." },
  ];

  return (
    <div className="min-h-screen bg-[#1d2125] flex flex-col">
      <FlowBoardNavbar user={user} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 md:p-10">

          {/* Hero */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-xl">
                <LayoutTemplate className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">FlowBoard</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">About FlowBoard</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
              FlowBoard is a modern, open-source project management tool designed for individuals and teams who want a clean, intuitive Kanban experience without the complexity.
            </p>
          </div>

          {/* Mission */}
          <section className="mb-14 max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl p-8 border border-white/10 text-center">
              <h2 className="text-lg font-bold text-white mb-3">Our Mission</h2>
              <p className="text-gray-300 text-sm leading-relaxed">
                To provide a beautifully simple project management tool that helps you focus on what matters — getting things done. No bloat, no distractions, just clean productivity.
              </p>
            </div>
          </section>

          {/* Features */}
          <section className="mb-14">
            <h2 className="text-lg font-bold text-white mb-5 text-center">Key Features</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {features.map((f) => (
                <div key={f.title} className="bg-[#282e33] rounded-2xl p-5 border border-white/[0.08] text-center hover:border-white/20 transition-all">
                  <div className="h-10 w-10 rounded-xl bg-white/[0.06] flex items-center justify-center mx-auto mb-3">
                    <f.icon className="h-5 w-5 text-blue-400" />
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-1">{f.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Tech Stack */}
          {/* <section className="mb-14 text-center">
            <h2 className="text-lg font-bold text-white mb-5">Built With</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {["Next.js 15", "React 19", "TypeScript", "Prisma ORM", "PostgreSQL", "Tailwind CSS", "@dnd-kit"].map((tech) => (
                <span key={tech} className="bg-[#282e33] text-gray-300 text-xs font-medium px-4 py-2 rounded-xl border border-white/[0.08]">
                  {tech}
                </span>
              ))}
            </div>
          </section> */}

          {/* Version */}
          <div className="text-center text-gray-500 text-xs pb-8">
            FlowBoard v1.0.0 
          </div>
        </main>
      </div>
    </div>
  );
}
