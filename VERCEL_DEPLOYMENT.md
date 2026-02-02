# Vercel Deployment Guide for SmartSplit

This guide will help you deploy the SmartSplit application to Vercel.

## Deployment Architecture

- **Frontend**: Vercel (Next.js 14)
- **Backend**: Vercel Serverless Functions (NestJS)
- **Database**: Railway, Supabase, or PlanetScale (MySQL/PostgreSQL)

## Prerequisites

- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com))
- Database hosting (Railway, Supabase, or PlanetScale)
- Google Cloud Console project for OAuth

---

## Step 1: Prepare Your Database

### Option A: Railway (Recommended - Easiest)

1. Go to [railway.app](https://railway.app)
2. Click **New Project** → **Provision MySQL**
3. Copy the connection string from the **Connect** tab
4. Format: `mysql://user:password@host:port/railway`

### Option B: Supabase (PostgreSQL)

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **Settings** → **Database**
4. Copy the connection string (URI format)
5. Update `backend/prisma/schema.prisma` to use PostgreSQL:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

### Option C: PlanetScale (MySQL)

1. Go to [planetscale.com](https://planetscale.com)
2. Create a new database: `smartsplit`
3. Create a branch: `main`
4. Copy the connection string (Prisma format)

---

## Step 2: Push to GitHub

If you haven't already pushed your code to GitHub:

```bash
# Initialize git in the root directory
cd "c:\Users\suriy\OneDrive\Desktop\Software project"
git init
git add .
git commit -m "Initial commit - SmartSplit"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/smartsplit.git
git branch -M main
git push -u origin main
```

---

## Step 3: Configure Google OAuth

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create or select a project
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
5. Configure:
   - Application type: **Web application**
   - Authorized JavaScript origins:
     - `https://YOUR_PROJECT.vercel.app`
   - Authorized redirect URIs:
     - `https://YOUR_PROJECT.vercel.app/api/auth/google/callback`
6. Copy the **Client ID** and **Client Secret**

---

## Step 4: Deploy Backend to Vercel

### Option A: Monorepo Deployment (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure:
   - **Project Name**: `smartsplit-backend`
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Add Environment Variables:
   ```
   DATABASE_URL=mysql://user:password@host:port/database
   SESSION_SECRET=your-generated-secret-key
   GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=https://smartsplit-backend.vercel.app/api/auth/google/callback
   FRONTEND_URL=https://smartsplit-frontend.vercel.app
   NODE_ENV=production
   PORT=3001
   ```

6. Click **Deploy**

### Generate SESSION_SECRET:
```bash
# On Windows (PowerShell):
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Or use online generator:
# https://generate-secret.vercel.app/32
```

---

## Step 5: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **Add New** → **Project**
3. Import your GitHub repository (or create a separate one for frontend)
4. Configure:
   - **Project Name**: `smartsplit-frontend`
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

5. Add Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://smartsplit-backend.vercel.app
   ```

6. Click **Deploy**

---

## Step 6: Run Database Migrations

After backend is deployed:

1. Install Vercel CLI locally:
   ```bash
   npm install -g vercel
   ```

2. Link your project:
   ```bash
   cd backend
   vercel link
   ```

3. Run migrations:
   ```bash
   vercel env pull .env.production
   npx prisma migrate deploy
   ```

Or run migrations manually via Vercel dashboard:
1. Go to your backend project
2. Click **Settings** → **Functions**
3. Add a serverless function for migrations

---

## Step 7: Update Google OAuth URLs

1. Go back to Google Cloud Console
2. Update OAuth redirect URIs with your actual Vercel URLs:
   - `https://YOUR-BACKEND.vercel.app/api/auth/google/callback`
3. Update Authorized JavaScript origins:
   - `https://YOUR-FRONTEND.vercel.app`

---

## Step 8: Test Your Deployment

1. Visit your frontend URL: `https://smartsplit-frontend.vercel.app`
2. Click **Login with Google**
3. Complete OAuth flow
4. Test creating groups and expenses

---

## Important Notes

### Custom Domains

To add custom domains:
1. Go to project **Settings** → **Domains**
2. Add your domain
3. Configure DNS records as instructed

### Environment Variables

- Backend env vars are in backend project settings
- Frontend env vars are in frontend project settings
- Use `NEXT_PUBLIC_` prefix for client-side env vars

### Continuous Deployment

Vercel automatically redeploys when you push to GitHub:
- Push to `main` branch → Production deployment
- Push to other branches → Preview deployments

### Database Migrations

Run migrations after schema changes:
```bash
# Locally
npx prisma migrate dev

# Production
vercel env pull .env.production
npx prisma migrate deploy
```

### Troubleshooting

**Backend not responding:**
- Check environment variables are set correctly
- Verify DATABASE_URL is accessible
- Check Vercel function logs

**OAuth not working:**
- Verify GOOGLE_CALLBACK_URL matches exactly
- Check Google Console redirect URIs
- Ensure FRONTEND_URL is correct

**Database connection errors:**
- Verify DATABASE_URL format
- Check database is publicly accessible
- Verify IP whitelist (if applicable)

**CORS errors:**
- Update FRONTEND_URL in backend env vars
- Check backend CORS configuration in `main.ts`

---

## Alternative: Combined Deployment

You can also deploy both frontend and backend in a single Vercel project using the root `vercel.json`:

1. Deploy from root directory
2. Vercel will detect the monorepo structure
3. Routes starting with `/api` go to backend
4. All other routes go to frontend

This is simpler but gives you less control over separate deployments.

---

## Cost Estimation

- **Vercel**: Free tier supports hobby projects (100 GB bandwidth)
- **Railway**: $5/month for 500 hours + database
- **Supabase**: Free tier includes 500 MB database
- **PlanetScale**: Free tier includes 5 GB storage

Total estimated cost: **$0-10/month** for small projects

---

## Next Steps

1. Set up custom domain
2. Configure monitoring and analytics
3. Set up error tracking (Sentry)
4. Configure automatic backups for database
5. Add SSL certificates (automatic with Vercel)

For production-ready deployment, also review:
- [SECURITY.md](./SECURITY.md) - Security best practices
- [PERFORMANCE.md](./PERFORMANCE.md) - Performance optimization
- [TESTING.md](./TESTING.md) - Testing strategies
