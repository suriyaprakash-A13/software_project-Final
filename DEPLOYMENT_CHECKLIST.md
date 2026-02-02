# Vercel Deployment Checklist

Follow this checklist to deploy SmartSplit to Vercel.

## Pre-Deployment

- [ ] Code is committed to GitHub
- [ ] Database is set up (Railway/Supabase/PlanetScale)
- [ ] Google OAuth credentials created
- [ ] Vercel account created

## Database Setup

- [ ] Database instance created
- [ ] Connection string obtained
- [ ] Database is accessible from external services
- [ ] Backup strategy in place (optional)

## Backend Deployment

- [ ] Create new Vercel project for backend
- [ ] Set root directory to `backend`
- [ ] Add all environment variables:
  - [ ] `DATABASE_URL`
  - [ ] `SESSION_SECRET`
  - [ ] `GOOGLE_CLIENT_ID`
  - [ ] `GOOGLE_CLIENT_SECRET`
  - [ ] `GOOGLE_CALLBACK_URL`
  - [ ] `FRONTEND_URL`
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=3001`
- [ ] Deploy backend
- [ ] Verify deployment successful
- [ ] Note backend URL: `_______________________`

## Frontend Deployment

- [ ] Create new Vercel project for frontend
- [ ] Set root directory to `frontend`
- [ ] Add environment variable:
  - [ ] `NEXT_PUBLIC_API_URL` (backend URL)
- [ ] Deploy frontend
- [ ] Verify deployment successful
- [ ] Note frontend URL: `_______________________`

## Database Migration

- [ ] Install Vercel CLI: `npm install -g vercel`
- [ ] Navigate to backend folder
- [ ] Link project: `vercel link`
- [ ] Pull environment: `vercel env pull .env.production`
- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Verify tables created

## Google OAuth Configuration

- [ ] Update Google Console with production URLs:
  - [ ] Authorized JavaScript origins: Frontend URL
  - [ ] Authorized redirect URIs: `{backend-url}/api/auth/google/callback`
- [ ] Test OAuth login flow

## Testing

- [ ] Visit frontend URL
- [ ] Test Google login
- [ ] Create a test user
- [ ] Create a test group
- [ ] Add a test expense
- [ ] Verify settlements calculation
- [ ] Test analytics page

## Post-Deployment

- [ ] Update environment variables with actual URLs
- [ ] Enable automatic deployments from GitHub
- [ ] Set up custom domain (optional)
- [ ] Configure monitoring (optional)
- [ ] Set up error tracking (optional)
- [ ] Document deployment URLs for team

## URLs to Save

```
Frontend URL: https://_____________________.vercel.app
Backend URL: https://_____________________.vercel.app
Database Host: _____________________________________
```

## Troubleshooting

If you encounter issues, check:

1. **Backend not responding:**
   - Verify all environment variables are set
   - Check Vercel function logs
   - Verify DATABASE_URL is correct

2. **OAuth errors:**
   - Check GOOGLE_CALLBACK_URL matches exactly
   - Verify Google Console redirect URIs
   - Ensure FRONTEND_URL is correct in backend

3. **Database connection errors:**
   - Verify DATABASE_URL format
   - Check database is publicly accessible
   - Test connection string locally first

4. **CORS errors:**
   - Update FRONTEND_URL in backend env vars
   - Check CORS configuration in backend/src/main.ts

## Need Help?

Refer to:
- [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) - Full deployment guide
- [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) - Original deployment docs
- Vercel Documentation: https://vercel.com/docs
