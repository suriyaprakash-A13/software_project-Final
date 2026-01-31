# SmartSplit - Intelligent Expense & Settlement Management System

A production-ready expense tracking and settlement optimization platform built with modern web technologies. SmartSplit helps groups track shared expenses and calculates optimized settlement transactions to minimize the number of payments needed.

## 🚀 Features

### Core Functionality
- **📊 Expense Tracking**: Record and categorize group expenses with 9 predefined categories
- **👥 Group Management**: Create groups, invite members via email, manage roles (OWNER/MEMBER)
- **💸 Smart Settlements**: Optimized transaction calculation using O(n log n) greedy algorithm
- **📈 Analytics Dashboard**: Monthly spending trends, category breakdowns, interactive charts
- **🔐 Secure Authentication**: Google OAuth 2.0 with stateless JWT validation (no password storage)

### Technical Highlights
- **Performance**: Settlement calculation <2s for 100 expenses, login <2s, group creation <1s
- **Security**: Rate limiting (100 req/15min), httpOnly cookies, CORS restrictions, input validation
- **Scalability**: Cursor-based pagination, connection pooling, indexed database queries
- **Developer Experience**: Full TypeScript, API contract documentation, comprehensive testing strategy

## 🛠 Tech Stack

**Backend:**
- Node.js 18+ + NestJS 10
- Prisma ORM 5 + MySQL 8.0+
- Google OAuth 2.0 + JWT
- TypeScript (strict mode)
- Helmet, Throttler, class-validator

**Frontend:**
- Next.js 14 (App Router)
- React 18 + TypeScript
- React Query (TanStack) 5
- Zustand 4 (state management)
- TailwindCSS + Recharts
- Axios with interceptors

**Deployment:**
- Frontend: Vercel (CDN + Auto-scaling)
- Backend: Render (Docker containers)
- Database: AWS RDS or PlanetScale (MySQL)

## 📁 Project Structure

```
smartsplit/
├── backend/          # NestJS API Server
│   ├── src/
│   │   ├── auth/              # Google OAuth + JWT
│   │   ├── users/             # User profile management
│   │   ├── groups/            # Group CRUD + membership
│   │   ├── expenses/          # Expense tracking + validation
│   │   ├── settlements/       # Settlement algorithm integration
│   │   ├── analytics/         # Monthly + category analytics
│   │   ├── common/            # Interceptors, filters, decorators
│   │   ├── prisma/            # Prisma client service
│   │   ├── main.ts            # Bootstrap with security middleware
│   │   └── app.module.ts      # Root module configuration
│   ├── prisma/
│   │   └── schema.prisma      # Database schema (5 models, 12+ indexes)
│   ├── package.json
│   └── tsconfig.json
├── frontend/         # Next.js 14 Application
│   ├── app/
│   │   ├── layout.tsx         # Root layout with QueryProvider
│   │   ├── page.tsx           # Home redirect logic
│   │   ├── login/             # Public login page
│   │   │   └── page.tsx
│   │   └── dashboard/         # Protected dashboard area
│   │       ├── layout.tsx     # Auth wrapper + navigation
│   │       ├── page.tsx       # Dashboard home
│   │       ├── groups/        # Group pages (list + detail)
│   │       ├── expenses/      # Expense pages (list + add form)
│   │       ├── settlements/   # Settlement visualization
│   │       └── analytics/     # Analytics dashboard
│   ├── lib/
│   │   ├── api/               # API client + TypeScript interfaces
│   │   ├── providers/         # React Query provider
│   │   ├── store/             # Zustand auth state with persist
│   │   └── utils.ts           # Utility functions
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── next.config.mjs
└── docs/
    ├── API_CONTRACT.md        # 47 REST endpoints documented
    ├── SETTLEMENT_ALGORITHM.md # Pseudocode + implementation + test cases
    ├── PERFORMANCE.md         # Optimization strategies
    ├── SECURITY.md            # Security best practices
    ├── DEPLOYMENT.md          # Step-by-step deployment guide
    └── TESTING.md             # Unit + integration + E2E testing
```

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Configure your .env file with database and OAuth credentials
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Configure your .env.local file
npm run dev
```

## 📚 Documentation

See individual documentation files in `/docs` for:
- API Contract
- Database Schema
- Settlement Algorithm
- Deployment Guide
- Testing Strategy

## 🎯 Features

- ✅ Google OAuth 2.0 Authentication
- ✅ Group & Membership Management
- ✅ Expense Tracking
- ✅ Optimized Settlement Generation (O(n log n))
- ✅ Monthly & Category Analytics
- ✅ Rate Limiting & Security
- ✅ Mobile-Responsive UI

## 📄 License

MIT
