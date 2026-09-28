# skien-taskflow
🧶 Skein
A multi-tenant SaaS project tracker — organizations, Kanban boards, role-based access, and Stripe billing.

Next.jsTypeScriptPrismaPostgreSQLStripeLicense

📖 About
Skein is a B2B project management SaaS where users create organizations, invite team members with role-based access, and manage issues on a drag-and-drop Kanban board. Each organization's data is fully isolated through row-level multi-tenancy, and free plans are gated with usage limits enforced via Stripe billing.

Why "Skein"? A skein is a neatly coiled bundle of yarn — a fitting metaphor for turning tangled work into something organized.

This is a portfolio project built to demonstrate full-stack architecture: multi-tenancy, authentication, billing, and real-time UI updates — the core patterns behind every B2B SaaS.

✨ Features
🔐 Authentication — email/password + Google OAuth
🏢 Multi-tenant organizations — isolated data per org
👥 Role-based access control — Owner / Admin / Member permissions
📋 Projects — with auto-generated issue keys (SKE-1, SKE-2…)
📌 Issues — status, priority, assignment, due dates
🎛️ Kanban board — drag-and-drop status changes with optimistic UI
💬 Comments — discussion threads on every issue
💳 Stripe billing — Free vs Pro plans with enforced usage limits
🌙 Dark mode — Linear-inspired design with shadcn/ui
🛠️ Tech Stack
Layer	Technology
Framework	Next.js 15 (App Router, RSC, Server Actions)
Language	TypeScript
UI	Tailwind CSS v4 + shadcn/ui
Auth	Better Auth (organizations plugin)
Database	PostgreSQL (Neon)
ORM	Prisma
Validation	Zod
Drag & Drop	dnd-kit
Billing	Stripe (Checkout + Webhooks)
Deployment	Vercel + Neon
🏗️ Architecture
Multi-tenancy strategy: row-level tenancy. Every organization-scoped query is filtered by organizationId through a dedicated query helper, guaranteeing complete data isolation between tenants.

User ──┬── Membership ──┬── Organization ──┬── Project ──┬── Issue       │   (role)       │   (billing)     │   (key)     │   (status,       └────────────────┘                 └─────────────┘    priority)                                                        └── Comment
Key patterns:

Org-scoped Prisma client — impossible to query across tenants
Stripe webhooks drive plan state (checkout → subscription lifecycle)
Optimistic UI on drag-drop with rollback on server errors
Per-project issue numbering via Prisma transactions
🚀 Getting Started
Prerequisites: Node.js 20+, a PostgreSQL database (free tier on Neon), Stripe account (test mode)

# Clonegit clone https://github.com/YOUR_USERNAME/skein.gitcd skein# Install dependenciesnpm install# Set up environmentcp .env.example .env.local# → Fill in DATABASE_URL, BETTER_AUTH_SECRET, STRIPE keys, #   Google OAuth credentials# Push database schemanpx prisma db push# Seed demo datanpx prisma db seed# Runnpm run dev
Open localhost:3000 — create an account, then create your first organization.

📁 Project Structure
skein/├── app/│   ├── (auth)/              # Login, signup pages│   ├── [orgSlug]/           # All org-scoped routes│   │   ├── dashboard/       # Org overview│   │   ├── projects/        # Project list + Kanban board│   │   └── settings/        # Members, billing│   ├── api/stripe/webhook/  # Stripe event handler│   └── layout.tsx├── components/│   ├── ui/                  # shadcn/ui components│   └── board/               # Kanban components├── lib/│   ├── auth.ts              # Better Auth config│   ├── org-scoped.ts        # Tenant isolation helper│   └── stripe.ts├── prisma/│   ├── schema.prisma│   └── seed.ts└── actions/                 # Server Actions (CRUD)
🗺️ Build Progress
 Phase 0 — Setup, deploy pipeline, database
 Phase 1 — Authentication (email + Google OAuth)
 Phase 2 — Multi-tenant organizations, roles, invitations
 Phase 3 — Projects + Issues CRUD
 Phase 4 — Kanban board with drag-and-drop
 Phase 5 — Stripe billing + usage limits
 Phase 6 — Polish, seed data, launch
(Uncheck as you build — this doubles as a public build log)

📝 What I Learned
(TODO: Fill in after each phase — 3-4 specific technical lessons with links to write-ups)

Row-level multi-tenancy: enforcing org isolation at the query layer
Billing lifecycle: Checkout → webhooks → plan gating
Optimistic UI with drag-and-drop rollback
Per-project issue numbering with Prisma transactions
📄 License
MIT — see LICENSE

Built by Muhammad Ammar
