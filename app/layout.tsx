import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FlowBoard – Trello Style Project Management",
  description:
    "FlowBoard is a modern Trello-inspired Kanban project management application for organizing boards, lists, cards, tasks, deadlines, and team collaboration.",

  keywords: [
    "FlowBoard",
    "Kanban Board",
    "Trello Clone",
    "Project Management",
    "Task Management",
    "Next.js",
    "Prisma",
    "PostgreSQL",
    "Drag and Drop",
  ],

  authors: [
    {
      name: "Karan Kalra",
    },
  ],

  openGraph: {
    title: "FlowBoard – Trello Style Project Management",
    description:
      "Organize tasks visually with boards, lists, cards, drag-and-drop, due dates, labels, members, and more.",
    url: "https://flow-board-8shp.vercel.app",
    siteName: "FlowBoard",
    type: "website",
    locale: "en_US",
  },

  twitter: {
    card: "summary_large_image",
    title: "FlowBoard – Trello Style Project Management",
    description:
      "A Trello-inspired Kanban board app built with Next.js, Prisma, and PostgreSQL.",
  },

  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased bg-[#1d2125] text-white`}
      >
        {children}
      </body>
    </html>
  );
}
