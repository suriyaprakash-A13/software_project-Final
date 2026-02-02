# 🚀 Quick Vercel Deployment Guide

## What I've Set Up For You

I've created all the necessary configuration files to deploy your SmartSplit project to Vercel:

### Created Files:
1. ✅ `vercel.json` - Root configuration for monorepo
2. ✅ `frontend/vercel.json` - Frontend-specific config
3. ✅ `backend/vercel.json` - Backend-specific config
4. ✅ `backend/api/index.ts` - Vercel serverless adapter
5. ✅ `.env.production` files - Production environment templates
6. ✅ `VERCEL_DEPLOYMENT.md` - Complete deployment guide
7. ✅ `DEPLOYMENT_CHECKLIST.md` - Step-by-step checklist

---

## 🎯 Quick Start (3 Steps)

### Step 1: Set Up Database (5 minutes)

**Recommended: Railway (Easiest)**
1. Go to https://railway.app
2. Click "New Project" → "Provision MySQL"
3. Copy the connection string
4. Save it for Step 3

### Step 2: Push to GitHub (2 minutes)

```powershell
# In your project root
git init
git add .
git commit -m "Initial commit - Ready for Vercel"

# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/smartsplit.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Vercel (10 minutes)

#### A. Deploy Backend
1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repo
4. **Root Directory**: Select `backend`
5. **Framework**: Other
6. Add these Environment Variables (click "Environment Variables"):
   ```
   DATABASE_URL=<your-railway-connection-string>
   SESSION_SECRET=<generate-random-32-chars>
   GOOGLE_CLIENT_ID=<your-google-client-id>
   GOOGLE_CLIENT_SECRET=<your-google-client-secret>
   GOOGLE_CALLBACK_URL=https://your-project-backend.vercel.app/api/auth/google/callback
   FRONTEND_URL=https://your-project-frontend.vercel.app
   NODE_ENV=production
   PORT=3001
   ```
7. Click "Deploy"
8. **Save your backend URL**: `https://______.vercel.app`

#### B. Deploy Frontend
1. Click "Add New" → "Project" again
2. Import the same GitHub repo
3. **Root Directory**: Select `frontend`
4. **Framework**: Next.js (auto-detected)
5. Add Environment Variable:
   ```
   NEXT_PUBLIC_API_URL=<your-backend-url-from-step-A>
   ```
6. Click "Deploy"
7. **Save your frontend URL**: `https://______.vercel.app`

---

## 🔐 Google OAuth Setup (5 minutes)

1. Go to https://console.cloud.google.com
2. Create a project or select existing
3. Navigate to "APIs & Services" → "Credentials"
4. Click "Create Credentials" → "OAuth client ID"
5. Configure:
   - Application type: **Web application**
   - Authorized JavaScript origins: `https://your-frontend.vercel.app`
   - Authorized redirect URIs: `https://your-backend.vercel.app/api/auth/google/callback`
6. Copy **Client ID** and **Client Secret**
7. Update backend environment variables in Vercel with these values

---

## 📊 Run Database Migrations

After backend deployment:

```powershell
# Install Vercel CLI
npm install -g vercel

# Navigate to backend
cd backend

# Link to your Vercel project
vercel link

# Pull environment variables
vercel env pull .env.production

# Run migrations
npx prisma migrate deploy
```

---

## ✅ Test Your Deployment

1. Visit your frontend URL
2. Click "Login with Google"
3. Complete the OAuth flow
4. Create a test group
5. Add a test expense
6. Check settlements

---

## 📝 Generate Random Secrets

**For SESSION_SECRET** (PowerShell):
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

Or use online: https://generate-secret.vercel.app/32

---

## 🆘 Troubleshooting

### Backend not responding?
- Check environment variables in Vercel dashboard
- Verify DATABASE_URL is correct
- Check Vercel function logs

### OAuth errors?
- Verify GOOGLE_CALLBACK_URL matches exactly
- Check Google Console redirect URIs match your Vercel URLs
- Ensure FRONTEND_URL is set correctly in backend

### CORS errors?
- Update FRONTEND_URL in backend environment variables
- Verify it matches your actual frontend URL exactly

### Database connection issues?
- Test DATABASE_URL locally first
- Ensure database allows external connections
- Check if IP whitelist is needed (Railway doesn't need this)

---

## 📚 Full Documentation

- **Complete Guide**: See `VERCEL_DEPLOYMENT.md`
- **Checklist**: See `DEPLOYMENT_CHECKLIST.md`
- **Original Docs**: See `docs/DEPLOYMENT.md`

---

## 💰 Estimated Costs

- **Vercel**: Free for hobby projects
- **Railway**: ~$5/month for starter database
- **Total**: **$5/month** for small to medium usage

---

## 🎉 You're All Set!

Your SmartSplit app should now be live on Vercel. Share your frontend URL with your team!

**Need help?** Check the full guides or Vercel's documentation.
