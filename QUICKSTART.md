# SmartSplit - Quick Start Guide

## Prerequisites

- Node.js 18+ ([Download](https://nodejs.org))
- MySQL 8.0+ ([Download](https://dev.mysql.com/downloads/mysql/))
- Google Cloud Console account for OAuth ([Console](https://console.cloud.google.com))
- Git

---

## 1. Clone & Install

```bash
# Navigate to project directory
cd "C:\Users\suriy\OneDrive\Desktop\Software project"

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

## 2. Database Setup

### Option A: Local MySQL
```bash
# Start MySQL server
# Create database
mysql -u root -p
CREATE DATABASE smartsplit;
EXIT;
```

### Option B: PlanetScale (Cloud)
1. Go to [planetscale.com](https://planetscale.com)
2. Create new database: `smartsplit`
3. Copy connection string

---

## 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project: "SmartSplit Dev"
3. Enable **Google+ API**
4. Create **OAuth 2.0 Client ID**:
   - Application type: Web application
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3001/api/auth/google/callback`
5. Copy **Client ID** and **Client Secret**

---

## 4. Backend Configuration

```bash
cd backend

# Copy example env file
cp .env.example .env

# Edit .env (use Notepad or VS Code)
# Replace these values:
DATABASE_URL="mysql://root:password@localhost:3306/smartsplit"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3001/api/auth/google/callback"
FRONTEND_URL="http://localhost:3000"
PORT=3001
NODE_ENV="development"
```

**Generate secure JWT secret:**
```bash
# On Windows PowerShell:
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

# On Mac/Linux:
openssl rand -base64 32
```

---

## 5. Run Database Migrations

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Run migrations (create tables)
npx prisma migrate dev --name init

# (Optional) View database in Prisma Studio
npx prisma studio
```

---

## 6. Frontend Configuration

```bash
cd frontend

# Copy example env file
cp .env.example .env

# Edit .env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 7. Start Development Servers

### Terminal 1 - Backend
```bash
cd backend
npm run start:dev
```

Backend will start at: `http://localhost:3001`

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

Frontend will start at: `http://localhost:3000`

---

## 8. Test the Application

1. Open browser: `http://localhost:3000`
2. Click "Sign in with Google"
3. Authorize with your Google account
4. You should be redirected to dashboard

---

## 9. Verify Installation

### Check Backend Health
```bash
# Terminal 3
curl http://localhost:3001/api/auth/me
# Should return: {"statusCode":401,"message":"Unauthorized"}
```

### Check Frontend
- Visit `http://localhost:3000`
- Should see login page with Google OAuth button

### Check Database
```bash
cd backend
npx prisma studio
```
- Opens at `http://localhost:5555`
- View tables: User, Group, Membership, Expense, Settlement

---

## 10. Common Issues & Solutions

### Issue: "Port 3001 already in use"
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3001 | xargs kill -9
```

### Issue: "Prisma migration failed"
```bash
# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Then re-run migrations
npx prisma migrate dev
```

### Issue: "Google OAuth redirect_uri_mismatch"
- Verify Google Console callback URL matches exactly:
  - `http://localhost:3001/api/auth/google/callback`
- Check `.env` `GOOGLE_CALLBACK_URL` matches

### Issue: "CORS error on login"
- Verify `FRONTEND_URL` in backend `.env` is `http://localhost:3000`
- Restart backend server after env changes

### Issue: "Cannot connect to database"
- Verify MySQL is running: `mysql -u root -p`
- Check `DATABASE_URL` format: `mysql://user:password@host:3306/database`
- For PlanetScale, ensure connection string includes `?sslaccept=strict`

---

## 11. Seed Test Data (Optional)

Create sample users, groups, and expenses:

```bash
cd backend

# Create seed file (if not exists)
# Add to prisma/seed.ts (see docs/TESTING.md for example)

# Run seed
npx prisma db seed
```

---

## 12. Next Steps

### Development
- Explore API documentation: [docs/API_CONTRACT.md](../docs/API_CONTRACT.md)
- Review settlement algorithm: [docs/SETTLEMENT_ALGORITHM.md](../docs/SETTLEMENT_ALGORITHM.md)
- Check performance optimizations: [docs/PERFORMANCE.md](../docs/PERFORMANCE.md)

### Testing
- Run backend unit tests: `cd backend && npm test`
- Run frontend E2E tests: `cd frontend && npx playwright test`
- See full testing guide: [docs/TESTING.md](../docs/TESTING.md)

### Deployment
- Deploy to production: [docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md)
- Security checklist: [docs/SECURITY.md](../docs/SECURITY.md)

---

## 13. Project Commands Reference

### Backend
```bash
npm run start:dev      # Start dev server with hot reload
npm run build          # Build for production
npm run start:prod     # Start production server
npm test               # Run unit tests
npm run test:cov       # Run tests with coverage
npx prisma generate    # Generate Prisma client
npx prisma migrate dev # Run migrations
npx prisma studio      # Open Prisma Studio GUI
```

### Frontend
```bash
npm run dev            # Start dev server
npm run build          # Build for production
npm run start          # Start production server
npm run lint           # Run ESLint
npx playwright test    # Run E2E tests
```

---

## 14. Environment Variables Summary

### Backend (.env)
| Variable | Example | Required |
|----------|---------|----------|
| DATABASE_URL | `mysql://root:password@localhost:3306/smartsplit` | Yes |
| JWT_SECRET | `base64-encoded-32-byte-string` | Yes |
| GOOGLE_CLIENT_ID | `123456.apps.googleusercontent.com` | Yes |
| GOOGLE_CLIENT_SECRET | `GOCSPX-xxxxx` | Yes |
| GOOGLE_CALLBACK_URL | `http://localhost:3001/api/auth/google/callback` | Yes |
| FRONTEND_URL | `http://localhost:3000` | Yes |
| PORT | `3001` | No (default: 3001) |
| NODE_ENV | `development` | No |

### Frontend (.env)
| Variable | Example | Required |
|----------|---------|----------|
| NEXT_PUBLIC_API_URL | `http://localhost:3001` | Yes |

---

## 15. Development Workflow

1. **Start Backend**: `cd backend && npm run start:dev`
2. **Start Frontend**: `cd frontend && npm run dev`
3. **Make Code Changes**: Edit files in `src/` or `app/`
4. **Hot Reload**: Both servers auto-restart on file changes
5. **Test Changes**: Visit `http://localhost:3000`
6. **Commit**: `git add . && git commit -m "message"`

---

## 16. Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│  Browser (http://localhost:3000)                    │
│  ┌──────────────────────────────────────────┐      │
│  │ Next.js 14 Frontend                       │      │
│  │ - React Query (API caching)               │      │
│  │ - Zustand (Auth state)                    │      │
│  │ - TailwindCSS (Styling)                   │      │
│  └───────────────┬──────────────────────────┘      │
└──────────────────┼─────────────────────────────────┘
                   │ HTTP + JWT Cookie
                   ▼
┌─────────────────────────────────────────────────────┐
│  Backend API (http://localhost:3001/api)            │
│  ┌──────────────────────────────────────────┐      │
│  │ NestJS REST API                           │      │
│  │ - Google OAuth 2.0 (Passport)             │      │
│  │ - JWT Authentication                      │      │
│  │ - Rate Limiting (100 req/15min)           │      │
│  │ - Prisma ORM                              │      │
│  └───────────────┬──────────────────────────┘      │
└──────────────────┼─────────────────────────────────┘
                   │ Prisma Client
                   ▼
┌─────────────────────────────────────────────────────┐
│  MySQL Database (localhost:3306)                    │
│  ┌──────────────────────────────────────────┐      │
│  │ Tables:                                   │      │
│  │ - User                                    │      │
│  │ - Group                                   │      │
│  │ - Membership                              │      │
│  │ - Expense                                 │      │
│  │ - Settlement                              │      │
│  └──────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────┘
```

---

## 17. Folder Structure Guide

### Backend (`/backend/src/`)
- `auth/` - Google OAuth + JWT authentication
- `users/` - User profile management
- `groups/` - Group CRUD + membership
- `expenses/` - Expense tracking
- `settlements/` - Settlement algorithm
- `analytics/` - Spending analytics
- `common/` - Shared utilities (guards, interceptors, filters)
- `prisma/` - Database client service

### Frontend (`/frontend/`)
- `app/` - Next.js 14 App Router pages
  - `login/` - Public authentication page
  - `dashboard/` - Protected app pages
- `lib/api/` - API client with TypeScript interfaces
- `lib/store/` - Zustand state management
- `lib/providers/` - React Query provider

---

## 18. Support & Resources

### Documentation
- [API Contract](../docs/API_CONTRACT.md) - All 47 REST endpoints
- [Settlement Algorithm](../docs/SETTLEMENT_ALGORITHM.md) - O(n log n) implementation
- [Performance Guide](../docs/PERFORMANCE.md) - Optimization strategies
- [Security Guide](../docs/SECURITY.md) - Best practices
- [Deployment Guide](../docs/DEPLOYMENT.md) - Production setup
- [Testing Guide](../docs/TESTING.md) - Unit + Integration + E2E

### External Resources
- **NestJS**: [docs.nestjs.com](https://docs.nestjs.com)
- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)
- **Prisma**: [prisma.io/docs](https://prisma.io/docs)
- **React Query**: [tanstack.com/query](https://tanstack.com/query)
- **TailwindCSS**: [tailwindcss.com/docs](https://tailwindcss.com/docs)

---

## 19. Troubleshooting Checklist

- [ ] Node.js 18+ installed: `node --version`
- [ ] MySQL running: `mysql -u root -p`
- [ ] Backend `.env` configured with all variables
- [ ] Frontend `.env` configured with API URL
- [ ] Prisma migrations applied: `npx prisma migrate dev`
- [ ] Google OAuth credentials added to `.env`
- [ ] Google Console callback URL matches: `http://localhost:3001/api/auth/google/callback`
- [ ] Backend running on port 3001: `curl http://localhost:3001/api/auth/me`
- [ ] Frontend running on port 3000: Visit `http://localhost:3000`

---

## 20. Quick Test

After setup, test the complete flow:

1. **Start servers** (backend + frontend)
2. **Visit** `http://localhost:3000`
3. **Click** "Sign in with Google"
4. **Authorize** with Google account
5. **Redirected** to dashboard
6. **Click** "Create New Group"
7. **Enter** group name, click Create
8. **Click** "Add Expense"
9. **Fill** form (description, amount, category), submit
10. **Navigate** to Settlements
11. **Select** your group
12. **View** optimized settlement transactions

✅ If all steps work, setup is complete!

---

**Need Help?** Check [docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md) for production deployment or [docs/TESTING.md](../docs/TESTING.md) for testing strategies.
