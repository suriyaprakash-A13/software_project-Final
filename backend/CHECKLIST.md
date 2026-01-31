# ✅ Backend Setup Checklist

Use this checklist to complete your backend setup step by step.

---

## 🎯 Your Generated Secrets (IMPORTANT!)

**SESSION_SECRET (COPY THIS!):**
```
5b2cc3f7eed4d5d0a5e3c9f9b42d2cc5992bfc03ac28ada7bf230c92744fc78849663129de363998af7c2457ccb33aba9b1341cb26afddf1ec58851af10ed118
```

**JWT_SECRET (For future use):**
```
a4f745eca1abaa4a70845d970208ddc1330715834d322be32446ffafbbdf96a8057c3cf47ba0bc17e7c88b8f5d9f13ca27ebc5f2d19eb0ff9a0eed70646ef339
```

---

## 📋 Setup Steps

### ☐ Step 1: Install MySQL

**Choose ONE option:**

**Option A - MySQL Community Server (Recommended):**
- Download: https://dev.mysql.com/downloads/mysql/
- Install with default settings
- Set a root password (remember it!)
- Default port: 3306

**Option B - XAMPP (Easiest for beginners):**
- Download: https://www.apachefriends.org/
- Install and start MySQL from control panel
- No password needed by default

**Option C - Docker:**
```powershell
docker run --name smartsplit-mysql -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=smartsplit -p 3306:3306 -d mysql:8.0
```

**Verify MySQL is running:**
```powershell
mysql --version
```

---

### ☐ Step 2: Create Database

**If using MySQL:**
```powershell
mysql -u root -p
```
Then in MySQL prompt:
```sql
CREATE DATABASE smartsplit CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SHOW DATABASES;
EXIT;
```

**If using XAMPP phpMyAdmin:**
1. Open http://localhost/phpmyadmin
2. Click "New"
3. Database name: `smartsplit`
4. Click "Create"

---

### ☐ Step 3: Update .env File

Open `backend/.env` and update these values:

**1. Database URL:**

If using MySQL with password:
```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/smartsplit"
```

If using XAMPP (no password):
```env
DATABASE_URL="mysql://root:@localhost:3306/smartsplit"
```

**2. Session Secret (COPY FROM ABOVE):**
```env
SESSION_SECRET="5b2cc3f7eed4d5d0a5e3c9f9b42d2cc5992bfc03ac28ada7bf230c92744fc78849663129de363998af7c2457ccb33aba9b1341cb26afddf1ec58851af10ed118"
```

**3. Keep these as is for now:**
```env
NODE_ENV="development"
PORT=3001
FRONTEND_URL="http://localhost:3000"
THROTTLE_TTL=900
THROTTLE_LIMIT=100
```

---

### ☐ Step 4: Get Google OAuth Credentials

**Follow these steps:**

1. Go to https://console.cloud.google.com/

2. Click "Select a project" → "New Project"
   - Project name: `SmartSplit`
   - Click "Create"

3. Enable Google+ API:
   - Menu → "APIs & Services" → "Library"
   - Search "Google+ API"
   - Click it and click "Enable"

4. Create OAuth Credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - If prompted, configure consent screen:
     - User Type: **External**
     - App name: `SmartSplit`
     - User support email: your email
     - Developer contact: your email
     - Click "Save and Continue" through all steps

5. Create OAuth Client:
   - Application type: **Web application**
   - Name: `SmartSplit Backend`
   - Authorized JavaScript origins:
     - Add: `http://localhost:3001`
     - Add: `http://localhost:3000`
   - Authorized redirect URIs:
     - Add: `http://localhost:3001/auth/google/callback`
   - Click "Create"

6. **COPY YOUR CREDENTIALS!**
   - Client ID: looks like `xxxxx.apps.googleusercontent.com`
   - Client Secret: looks like `GOCSPX-xxxxx`

7. Update .env:
```env
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3001/auth/google/callback"
```

---

### ☐ Step 5: Install Dependencies

```powershell
cd backend
npm install
```

This will install all packages. Takes 2-3 minutes.

---

### ☐ Step 6: Setup Prisma

**Generate Prisma Client:**
```powershell
npm run prisma:generate
```

**Run Migrations (creates all tables):**
```powershell
npm run prisma:migrate
```

When prompted for migration name, enter: `initial_setup`

---

### ☐ Step 7: Start Backend Server

**Development mode (auto-reload):**
```powershell
npm run start:dev
```

**You should see:**
```
[Nest] INFO [NestApplication] Nest application successfully started
[Nest] INFO Application is running on: http://localhost:3001
```

---

### ☐ Step 8: Test Everything

**1. Test basic API:**
- Open browser: http://localhost:3001
- Should see welcome message or API info

**2. Test Google OAuth:**
- Go to: http://localhost:3001/auth/google
- Should redirect to Google login
- After login, should redirect back with user info

**3. View Database:**
```powershell
npm run prisma:studio
```
Opens at http://localhost:5555 - you can view all tables

---

## 🎉 You're Done!

Your backend is now fully configured and running!

**What you have:**
✅ MySQL database connected
✅ All tables created (users, groups, expenses, settlements)
✅ Authentication with Google OAuth
✅ Session management
✅ API ready to use

---

## 🚀 Next Steps

1. **Test the API** using:
   - Browser: http://localhost:3001
   - Postman or Thunder Client extension
   
2. **Set up Frontend:**
   ```powershell
   cd ../frontend
   npm install
   npm run dev
   ```

3. **Create your first user:**
   - Go to frontend (http://localhost:3000)
   - Click "Login with Google"
   - Authorize the app

4. **Start building features!**

---

## 🔧 Troubleshooting

### Database Connection Issues

**Error: "Can't connect to MySQL"**
```powershell
# Check if MySQL is running
netstat -ano | findstr :3306

# For XAMPP - start MySQL from control panel
# For MySQL Service - start from Services app
```

**Error: "Access denied for user"**
- Check your password in DATABASE_URL
- Try without password if using XAMPP:
  ```env
  DATABASE_URL="mysql://root:@localhost:3306/smartsplit"
  ```

### Port Already in Use

**Error: "Port 3001 already in use"**
```powershell
# Find what's using port 3001
netstat -ano | findstr :3001

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Or change port in .env
PORT=3002
```

### Prisma Errors

**Error: "Environment variable not found: DATABASE_URL"**
- Make sure .env file exists in backend folder
- Check DATABASE_URL is set correctly

**Error: "Prisma schema not found"**
```powershell
cd backend
npm run prisma:generate
```

### Google OAuth Errors

**Error: "redirect_uri_mismatch"**
- Go to Google Cloud Console
- Check redirect URI exactly matches: `http://localhost:3001/auth/google/callback`
- No trailing slash!
- Wait 5 minutes for changes to propagate

**Error: "invalid_client"**
- Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env
- Make sure no extra spaces or quotes

---

## 📚 Useful Commands

```powershell
# Start development server
npm run start:dev

# View database in browser
npm run prisma:studio

# Reset database (CAUTION: deletes all data!)
npm run prisma:migrate reset

# Format code
npm run format

# Run tests
npm test

# Build for production
npm run build

# Start production server
npm run start:prod
```

---

## 🔐 Security Notes

- **NEVER** commit `.env` file to Git
- **NEVER** share your SESSION_SECRET
- **NEVER** share your Google OAuth credentials
- In production, use HTTPS only
- Change all secrets before deploying to production

---

## 📖 Documentation Links

- **This Project:** See docs/ folder
- **NestJS:** https://docs.nestjs.com/
- **Prisma:** https://www.prisma.io/docs/
- **MySQL:** https://dev.mysql.com/doc/
- **Google OAuth:** https://developers.google.com/identity/protocols/oauth2

---

**Need help? Check SETUP_GUIDE.md for detailed explanations!**
