# Deployment Guide

## Overview

SmartSplit uses a 3-tier deployment architecture:
- **Frontend**: Vercel (Next.js 14)
- **Backend**: Render (NestJS)
- **Database**: AWS RDS or PlanetScale (MySQL 8.0+)

## Prerequisites

- GitHub account (for repository hosting)
- Vercel account (frontend deployment)
- Render account (backend deployment)
- AWS account (RDS) or PlanetScale account (database)
- Google Cloud Console project (OAuth credentials)

---

## 1. Database Deployment

### Option A: AWS RDS (Recommended for Production)

#### Step 1: Create RDS Instance
1. Go to AWS RDS Console
2. Click **Create database**
3. Configuration:
   - Engine: MySQL 8.0
   - Template: Production (or Dev/Test for lower cost)
   - DB Instance: `db.t3.micro` (Free tier) or `db.t3.medium`
   - Storage: 20 GB SSD, enable autoscaling to 100 GB
   - Public access: **No** (use VPC)
   - VPC Security Group: Allow inbound from Render IP ranges

#### Step 2: Configure Security Group
1. Edit inbound rules
2. Add MySQL/Aurora (port 3306)
3. Source: Custom (add Render IP ranges from [render.com/docs/static-outbound-ip-addresses](https://render.com/docs/static-outbound-ip-addresses))

#### Step 3: Get Connection String
```
mysql://username:password@database-instance.region.rds.amazonaws.com:3306/smartsplit
```

### Option B: PlanetScale (Serverless, Easier Setup)

#### Step 1: Create Database
1. Go to [planetscale.com](https://planetscale.com)
2. Click **New database**
3. Name: `smartsplit`
4. Region: Choose closest to your users

#### Step 2: Create Branch
1. Create `main` branch (production)
2. Create `dev` branch (development)

#### Step 3: Get Connection String
1. Go to database → **Connect**
2. Select **Prisma** framework
3. Copy connection string:
```
mysql://username:password@aws.connect.psdb.cloud/smartsplit?sslaccept=strict
```

---

## 2. Backend Deployment (Render)

### Step 1: Push Code to GitHub
```bash
cd backend
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/smartsplit-backend.git
git push -u origin main
```

### Step 2: Create Render Web Service
1. Go to [render.com](https://render.com)
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configuration:
   - Name: `smartsplit-backend`
   - Environment: `Node`
   - Region: Choose closest to database
   - Branch: `main`
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npx prisma migrate deploy && npm run start:prod`
   - Instance Type: Starter ($7/month) or Free (spins down after inactivity)

### Step 3: Environment Variables
Add these in Render dashboard (Environment section):

```env
DATABASE_URL=mysql://user:password@host:3306/smartsplit
JWT_SECRET=<generate-with-openssl-rand-base64-32>
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://smartsplit-backend.onrender.com/api/auth/google/callback
FRONTEND_URL=https://smartsplit.vercel.app
PORT=3001
NODE_ENV=production
```

**Generate JWT Secret:**
```bash
openssl rand -base64 32
```

### Step 4: Deploy
1. Click **Create Web Service**
2. Wait for deployment (3-5 minutes)
3. Health check: Visit `https://smartsplit-backend.onrender.com/api/auth/me` (should return 401)

### Step 5: Run Prisma Migrations
Migrations run automatically on start via `npx prisma migrate deploy` in start command.

To manually run:
```bash
# In Render Shell (Dashboard → Shell tab)
npx prisma migrate deploy
```

---

## 3. Frontend Deployment (Vercel)

### Step 1: Push Code to GitHub
```bash
cd frontend
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/smartsplit-frontend.git
git push -u origin main
```

### Step 2: Create Vercel Project
1. Go to [vercel.com](https://vercel.com)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configuration:
   - Framework Preset: Next.js
   - Root Directory: `./` (or leave blank)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)

### Step 3: Environment Variables
Add in Vercel dashboard (Settings → Environment Variables):

```env
NEXT_PUBLIC_API_URL=https://smartsplit-backend.onrender.com
```

### Step 4: Deploy
1. Click **Deploy**
2. Wait for deployment (2-3 minutes)
3. Visit your site: `https://smartsplit.vercel.app`

### Step 5: Custom Domain (Optional)
1. Go to Vercel Project → Settings → Domains
2. Add custom domain (e.g., `smartsplit.com`)
3. Follow DNS configuration instructions

---

## 4. Google OAuth Configuration

### Step 1: Create Google Cloud Project
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create new project: `SmartSplit`

### Step 2: Enable Google+ API
1. Go to **APIs & Services** → **Library**
2. Search "Google+ API"
3. Click **Enable**

### Step 3: Create OAuth Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `SmartSplit Production`
5. Authorized JavaScript origins:
   - `https://smartsplit.vercel.app`
6. Authorized redirect URIs:
   - `https://smartsplit-backend.onrender.com/api/auth/google/callback`
7. Click **Create**
8. Copy **Client ID** and **Client Secret**

### Step 4: Update Environment Variables
1. Update Render backend with:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
2. Redeploy backend (automatic on env var change)

---

## 5. Post-Deployment Testing

### Test Authentication
1. Visit `https://smartsplit.vercel.app`
2. Click "Sign in with Google"
3. Verify redirect to Google OAuth
4. Verify redirect back to dashboard after login

### Test API Endpoints
```bash
# Health check
curl https://smartsplit-backend.onrender.com/api/auth/me

# Create group (requires auth cookie)
curl -X POST https://smartsplit-backend.onrender.com/api/groups \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=YOUR_JWT_TOKEN" \
  -d '{"name": "Test Group"}'
```

### Test Database Connection
```bash
# In Render Shell
npx prisma studio
```

---

## 6. Monitoring & Maintenance

### Render Monitoring
- Dashboard → Metrics: CPU, Memory, Response Time
- Dashboard → Logs: Application logs
- Dashboard → Events: Deployment history

### Vercel Monitoring
- Dashboard → Analytics: Page views, Web Vitals
- Dashboard → Logs: Function logs
- Dashboard → Deployments: Build history

### Database Monitoring
- **AWS RDS**: CloudWatch metrics (CPU, connections, storage)
- **PlanetScale**: Dashboard insights (query latency, connections)

### Alerts
1. **Render**: Set up email alerts for deployment failures
2. **Vercel**: Enable Vercel Alerts for build failures
3. **AWS RDS**: CloudWatch alarms for high CPU, low storage

---

## 7. Scaling Considerations

### Frontend (Vercel)
- **Auto-scales**: No configuration needed
- **CDN**: Global edge network (175+ locations)
- **Cost**: Pay-per-use (first 100 GB free)

### Backend (Render)
- **Vertical Scaling**: Upgrade instance type (Starter → Standard → Pro)
- **Horizontal Scaling**: Add more instances (load balancer auto-configured)
- **Auto-deploy**: Enabled by default on Git push

### Database
- **AWS RDS**: Vertical scaling (db.t3.micro → db.t3.medium → db.r5.large)
- **PlanetScale**: Auto-scales with usage (no configuration)
- **Read Replicas**: For high read workloads (AWS RDS only)

---

## 8. Rollback Procedure

### Frontend (Vercel)
1. Go to Dashboard → Deployments
2. Find previous deployment
3. Click **...** → **Promote to Production**

### Backend (Render)
1. Go to Dashboard → Events
2. Find previous deployment
3. Click **Rollback to this deploy**

### Database Migrations (Prisma)
```bash
# In Render Shell
npx prisma migrate resolve --rolled-back <migration-name>
npx prisma migrate deploy
```

---

## 9. Cost Estimates

### Development (Free Tier)
- Vercel: Free (Hobby plan)
- Render: Free (spins down after inactivity)
- PlanetScale: Free (1 database, 5 GB storage)
- **Total**: $0/month

### Production (Low Traffic <10k MAU)
- Vercel: Free (Hobby plan)
- Render: $7/month (Starter instance)
- PlanetScale: $29/month (Scaler plan) or AWS RDS: $15/month (db.t3.micro)
- **Total**: $36-44/month

### Production (High Traffic >100k MAU)
- Vercel: $20/month (Pro plan)
- Render: $85/month (Standard instance × 2)
- AWS RDS: $180/month (db.r5.large with Multi-AZ)
- **Total**: $285/month

---

## 10. Troubleshooting

### Issue: CORS Error
- **Cause**: `FRONTEND_URL` mismatch
- **Solution**: Update Render env var to match Vercel URL

### Issue: 401 Unauthorized on Login
- **Cause**: Google OAuth callback URL mismatch
- **Solution**: Update Google Cloud Console redirect URI to match Render URL

### Issue: Database Connection Failed
- **Cause**: Invalid `DATABASE_URL` or security group rules
- **Solution**: Verify connection string, check RDS security group inbound rules

### Issue: Prisma Migrations Failed
- **Cause**: Prisma schema out of sync
- **Solution**: Run `npx prisma migrate deploy` manually in Render Shell

### Issue: Slow API Responses
- **Cause**: Render free tier spins down after inactivity
- **Solution**: Upgrade to Starter plan ($7/month) for always-on instances

---

## 11. Environment URLs

| Environment | Frontend | Backend | Database |
|-------------|----------|---------|----------|
| Development | `http://localhost:3000` | `http://localhost:3001` | `localhost:3306` |
| Production | `https://smartsplit.vercel.app` | `https://smartsplit-backend.onrender.com` | AWS RDS or PlanetScale |

---

## 12. CI/CD Pipeline

### Auto-deployment Enabled
- **Frontend**: Auto-deploys on push to `main` branch (Vercel)
- **Backend**: Auto-deploys on push to `main` branch (Render)
- **Database**: Manual migrations via `npx prisma migrate deploy`

### Manual Deployment
```bash
# Frontend
cd frontend
npm run build
vercel --prod

# Backend
cd backend
npm run build
# Push to GitHub, Render auto-deploys
```

---

## 13. Backup Strategy

### Database Backups
- **AWS RDS**: Automated daily snapshots (retain 7 days)
- **PlanetScale**: Automatic backups (restore via dashboard)

### Manual Backup
```bash
# Export MySQL dump
mysqldump -h database-host -u username -p smartsplit > backup.sql

# Import backup
mysql -h database-host -u username -p smartsplit < backup.sql
```

---

## 14. Security Checklist

- [x] HTTPS enforced (Vercel & Render auto-configure)
- [x] Environment variables secured (not in Git)
- [x] CORS restricted to frontend URL only
- [x] JWT secret generated with strong entropy (256-bit)
- [x] Database not publicly accessible (VPC for RDS)
- [x] Google OAuth credentials rotated if compromised
- [x] Rate limiting enabled (100 req/15min)
- [x] Helmet security headers enabled

---

## Support & Resources

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Render Docs**: [render.com/docs](https://render.com/docs)
- **Prisma Docs**: [prisma.io/docs](https://prisma.io/docs)
- **NestJS Docs**: [docs.nestjs.com](https://docs.nestjs.com)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
