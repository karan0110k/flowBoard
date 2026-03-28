export interface TemplateDefinition {
  id: string;
  title: string;
  category: string;
  description: string;
  background: string;
  icon: string;
  defaultLists: {
    title: string;
    cards: string[];
  }[];
}

export const templateCategories = [
  "Business",
  "Design",
  "Education",
  "Engineering",
  "Marketing",
  "Project Management",
  "Personal",
  "Productivity",
] as const;

export const templates: TemplateDefinition[] = [
  {
    id: "my-tasks",
    title: "My Tasks",
    category: "Personal",
    description: "Track your daily and weekly tasks with a simple, effective workflow.",
    background: "from-sky-600/90 to-blue-700/90",
    icon: "📋",
    defaultLists: [
      { title: "Today", cards: ["Morning standup", "Review PRs", "Update documentation"] },
      { title: "This Week", cards: ["Prepare presentation", "Team sync meeting", "Code review"] },
      { title: "Later", cards: ["Learn new framework", "Refactor auth module", "Write blog post"] },
    ],
  },
  {
    id: "new-hire-onboarding",
    title: "New Hire Onboarding",
    category: "Business",
    description: "Streamline the onboarding process for new team members with clear steps.",
    background: "from-emerald-600/90 to-green-700/90",
    icon: "👋",
    defaultLists: [
      { title: "Before Day 1", cards: ["Send welcome email", "Prepare workstation", "Create accounts"] },
      { title: "Day 1", cards: ["Office tour", "Meet the team", "Setup dev environment"] },
      { title: "Week 1", cards: ["Shadow team members", "First small task", "1:1 with manager"] },
      { title: "Month 1", cards: ["Complete training", "First project assignment", "30-day feedback"] },
    ],
  },
  {
    id: "sprint-planner",
    title: "Sprint Planner",
    category: "Engineering",
    description: "Plan and execute sprints with a clear Agile workflow board.",
    background: "from-violet-600/90 to-purple-800/90",
    icon: "🏃",
    defaultLists: [
      { title: "Backlog", cards: ["User authentication flow", "API rate limiting", "Database optimization"] },
      { title: "In Progress", cards: ["Dashboard redesign", "Payment integration"] },
      { title: "Review", cards: ["Search feature PR", "Unit test coverage"] },
      { title: "Done", cards: ["Landing page", "Email notifications"] },
    ],
  },
  {
    id: "product-roadmap",
    title: "Product Roadmap",
    category: "Project Management",
    description: "Plan your product vision and track feature development across quarters.",
    background: "from-orange-500/90 to-rose-600/90",
    icon: "🗺️",
    defaultLists: [
      { title: "Ideas", cards: ["AI-powered search", "Mobile app", "Dark mode"] },
      { title: "Q1 Planned", cards: ["User onboarding flow", "Analytics dashboard"] },
      { title: "Q2 Planned", cards: ["Team collaboration", "API v2"] },
      { title: "Shipped", cards: ["Core platform", "Auth system", "Billing"] },
    ],
  },
  {
    id: "design-workflow",
    title: "Design Workflow",
    category: "Design",
    description: "Manage the design process from research to final delivery.",
    background: "from-pink-500/90 to-rose-700/90",
    icon: "🎨",
    defaultLists: [
      { title: "Research", cards: ["User interviews", "Competitive analysis", "Survey results"] },
      { title: "Wireframes", cards: ["Homepage layout", "Dashboard wireframe"] },
      { title: "In Design", cards: ["Component library", "Icon set"] },
      { title: "Review", cards: ["Design QA checklist", "Stakeholder feedback"] },
      { title: "Delivered", cards: ["Brand guidelines", "Style guide"] },
    ],
  },
  {
    id: "marketing-calendar",
    title: "Marketing Calendar",
    category: "Marketing",
    description: "Plan and schedule marketing campaigns, content, and launches.",
    background: "from-amber-500/90 to-orange-700/90",
    icon: "📅",
    defaultLists: [
      { title: "Planned", cards: ["Blog post series", "Social media campaign", "Email newsletter"] },
      { title: "In Progress", cards: ["Product launch video", "Landing page copy"] },
      { title: "In Review", cards: ["Press release draft", "Ad creatives"] },
      { title: "Published", cards: ["January newsletter", "Product announcement"] },
    ],
  },
];

export const popularTemplates = [
  { id: "project-management", title: "Project Management", background: "from-blue-600/80 to-blue-800/80", icon: "📊" },
  { id: "scrum", title: "Scrum Board", background: "from-emerald-600/80 to-teal-700/80", icon: "🔄" },
  { id: "bug-tracking", title: "Bug Tracking", background: "from-rose-600/80 to-red-700/80", icon: "🐛" },
  { id: "web-design", title: "Web Design Process", background: "from-violet-600/80 to-indigo-700/80", icon: "🌐" },
];

export const featuredCategories = [
  { name: "Business", icon: "💼", color: "from-blue-600/70 to-blue-800/70" },
  { name: "Design", icon: "🎨", color: "from-pink-500/70 to-rose-700/70" },
  { name: "Education", icon: "📚", color: "from-emerald-600/70 to-green-800/70" },
  { name: "Engineering", icon: "⚙️", color: "from-slate-500/70 to-slate-700/70" },
  { name: "Marketing", icon: "📢", color: "from-amber-500/70 to-orange-700/70" },
  { name: "Project Management", icon: "📋", color: "from-violet-500/70 to-purple-700/70" },
  { name: "Remote Work", icon: "🏠", color: "from-teal-500/70 to-teal-700/70" },
];
