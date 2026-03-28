# FlowBoard 🚀

A modern, full-stack Trello clone built with Next.js, Prisma, and PostgreSQL.

## 🌟 Features
- **Dynamic Boards & Lists**: Create and manage your projects with ease.
- **Drag & Drop**: Smooth card and list reordering powered by `@dnd-kit`.
- **Card Enhancements**: Multi-member assignment, labels, checklists, and custom covers.
- **Notifications**: Real-time style notifications for board activities.
- **Modern UI**: Dark-themed, responsive design with polished animations.

## 🛠 Tech Stack
- **Frontend**: Next.js 15 (App Router), Tailwind CSS, Lucide React.
- **Backend**: Next.js Server Actions & API Routes.
- **Database**: PostgreSQL with Prisma ORM.
- **Authentication**: Custom JWT-based auth.

## 🚀 One-Click Deployment on Vercel

To deploy this project to Vercel, follow these steps:

### 1. Database Setup
This project requires a PostgreSQL database. We recommend **[Neon.tech](https://neon.tech/)** or **[Supabase](https://supabase.com/)**.
1. Create a new PostgreSQL project.
2. Copy the **Direct Connection String** (DATABASE_URL).

### 2. Vercel Configuration
When importing your repository to Vercel, add the following **Environment Variables**:
- `DATABASE_URL`: Your PostgreSQL connection string.
- `JWT_SECRET`: A secure random string for authentication.
- `NEXT_PUBLIC_APP_URL`: Your full deployment URL (e.g., `https://flowboard.vercel.app`).

### 3. Build Command
The project is already configured to generate the Prisma client during the build process via the `postinstall` script in `package.json`.
- **Build Command**: `next build`
- **Output Directory**: `.next`

### 4. Initialize Database
Once deployed (or locally before deploying), run the following to sync your schema with the hosted database:
```bash
npx prisma db push
```

## 💻 Local Development

1. Clone the repository.
2. Install dependencies: `npm install`.
3. Set up your `.env` file based on `.env.example`.
4. Run migrations: `npx prisma db push`.
5. Start the dev server: `npm run dev`.

---
*Built with ❤️ by FlowBoard Team*
