# 🚀 COMPLETE BACKEND SETUP GUIDE

## 📚 What You Have Now

I've created several files to help you set up your backend completely:

1. **CHECKLIST.md** - Step-by-step checklist with all your generated secrets
2. **SETUP_GUIDE.md** - Comprehensive guide with detailed explanations
3. **setup.js** - Automated script to generate secrets
4. **test-db.js** - Test your MySQL connection
5. **check-setup.ps1** - Verify your setup is correct
6. **.env.generated** - Your environment file with generated secrets

---

## ⚡ QUICK START (Follow These Steps)

### Step 1: Install MySQL

**Choose ONE:**
- **MySQL:** https://dev.mysql.com/downloads/mysql/ (set password during install)
- **XAMPP:** https://www.apachefriends.org/ (easiest, no password)
- **Docker:** `docker run --name mysql -e MYSQL_ROOT_PASSWORD=password -p 3306:3306 -d mysql:8.0`

### Step 2: Create Database

```powershell
mysql -u root -p
```
Then:
```sql
CREATE DATABASE smartsplit;
EXIT;
```

**OR** use phpMyAdmin (XAMPP): http://localhost/phpmyadmin → Create database `smartsplit`

### Step 3: Update .env File

Open `backend/.env` and replace:

**1. MySQL Password:**
```env
# With password:
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/smartsplit"

# XAMPP (no password):
DATABASE_URL="mysql://root:@localhost:3306/smartsplit"
```

**2. Session Secret (ALREADY GENERATED!):**
```env
SESSION_SECRET="5b2cc3f7eed4d5d0a5e3c9f9b42d2cc5992bfc03ac28ada7bf230c92744fc78849663129de363998af7c2457ccb33aba9b1341cb26afddf1ec58851af10ed118"
```

**3. Google OAuth (Get from console.cloud.google.com):**
```env
GOOGLE_CLIENT_ID="your-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-secret"
```

### Step 4: Install & Setup

```powershell
cd backend

# Install all dependencies
npm install

# Test database connection
npm run test:db

# Generate Prisma client
npm run prisma:generate

# Create all tables
npm run prisma:migrate

# Verify setup
npm run check
```

### Step 5: Start Backend

```powershell
npm run start:dev
```

✅ Backend runs on: http://localhost:3001

---

## 🔑 Getting Google OAuth Credentials

### Quick Steps:

1. **Go to:** https://console.cloud.google.com/
2. **Create project:** "SmartSplit"
3. **Enable API:** Search "Google+ API" → Enable
4. **Create credentials:**
   - APIs & Services → Credentials
   - Create OAuth 2.0 Client ID
   - Type: Web application
   - Authorized redirect: `http://localhost:3001/auth/google/callback`
5. **Copy credentials** to .env

### Detailed Guide:
See **CHECKLIST.md** Step 4 for screenshots and detailed instructions.

---

## 🧪 Testing Your Setup

### Check Everything:
```powershell
npm run check
```

### Test Database:
```powershell
npm run test:db
```

### View Database:
```powershell
npm run prisma:studio
```
Opens at: http://localhost:5555

### Test Google OAuth:
1. Start backend: `npm run start:dev`
2. Visit: http://localhost:3001/auth/google
3. Should redirect to Google login

---

## 📋 Helpful Commands Reference

```powershell
# Generate secrets and create .env
npm run setup

# Test database connection
npm run test:db

# Check your setup status
npm run check

# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run migrations (create tables)
npm run prisma:migrate

# Open database viewer
npm run prisma:studio

# Start development server
npm run start:dev

# Build for production
npm run build

# Start production server
npm run start:prod
```

---

## 🔧 Common Issues & Solutions

### ❌ "Can't connect to MySQL"

**Solution:**
```powershell
# Check if MySQL is running
netstat -ano | findstr :3306

# Start MySQL (XAMPP) or MySQL service
# Update DATABASE_URL in .env with correct password
```

### ❌ "Access denied for user 'root'"

**Solution:**
```env
# Try without password (XAMPP):
DATABASE_URL="mysql://root:@localhost:3306/smartsplit"

# Or with your MySQL password:
DATABASE_URL="mysql://root:yourpassword@localhost:3306/smartsplit"
```

### ❌ "Unknown database 'smartsplit'"

**Solution:**
```powershell
mysql -u root -p -e "CREATE DATABASE smartsplit"
```

### ❌ "Port 3001 already in use"

**Solution:**
```powershell
# Find and kill process
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Or change port in .env
PORT=3002
```

### ❌ "Prisma schema not found"

**Solution:**
```powershell
cd backend
npm run prisma:generate
```

### ❌ Google OAuth "redirect_uri_mismatch"

**Solution:**
- Go to Google Cloud Console
- Add exact URL: `http://localhost:3001/auth/google/callback`
- No trailing slash, must match exactly
- Wait 5 minutes for changes

---

## 📖 Documentation Files

- **CHECKLIST.md** - Complete setup checklist with your secrets
- **SETUP_GUIDE.md** - Comprehensive guide with troubleshooting
- **README.md** - Quick start guide
- **.env.generated** - Your environment variables with secrets
- **setup.js** - Generate new secrets anytime
- **test-db.js** - Test database connection
- **check-setup.ps1** - Verify setup status

---

## 🔐 Your Generated Secrets

**SESSION_SECRET:**
```
5b2cc3f7eed4d5d0a5e3c9f9b42d2cc5992bfc03ac28ada7bf230c92744fc78849663129de363998af7c2457ccb33aba9b1341cb26afddf1ec58851af10ed118
```

**JWT_SECRET (for future):**
```
a4f745eca1abaa4a70845d970208ddc1330715834d322be32446ffafbbdf96a8057c3cf47ba0bc17e7c88b8f5d9f13ca27ebc5f2d19eb0ff9a0eed70646ef339
```

⚠️ **NEVER commit these to Git!**

---

## ✅ What Your Backend Has

Once setup is complete, you'll have:

- ✅ NestJS backend server
- ✅ MySQL database with all tables
- ✅ User authentication with Google OAuth
- ✅ Session management
- ✅ Expense tracking system
- ✅ Group management
- ✅ Settlement calculations
- ✅ Analytics endpoints
- ✅ Rate limiting
- ✅ Security headers

---

## 🎯 Next Steps After Setup

1. **Test API:** Visit http://localhost:3001
2. **Setup Frontend:** Go to `frontend/` folder
3. **Create first user:** Login with Google
4. **Build features:** Start developing!

---

## 🆘 Still Need Help?

1. **Check files:**
   - CHECKLIST.md for step-by-step guide
   - SETUP_GUIDE.md for detailed explanations
   
2. **Run diagnostics:**
   ```powershell
   npm run check    # Overall status
   npm run test:db  # Database connection
   ```

3. **Common problems:**
   - See "Common Issues & Solutions" above
   - See SETUP_GUIDE.md troubleshooting section

4. **Resources:**
   - NestJS: https://docs.nestjs.com/
   - Prisma: https://www.prisma.io/docs/
   - MySQL: https://dev.mysql.com/doc/

---

## 📝 Environment Variables Explained

```env
# Database connection string
DATABASE_URL="mysql://user:password@host:port/database"

# Session encryption key (generated by setup.js)
SESSION_SECRET="random-64-character-string"

# Google OAuth credentials (from console.cloud.google.com)
GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxx"
GOOGLE_CALLBACK_URL="http://localhost:3001/auth/google/callback"

# Environment (development/production)
NODE_ENV="development"

# Backend server port
PORT=3001

# Frontend URL for CORS
FRONTEND_URL="http://localhost:3000"

# Rate limiting (requests per 15 minutes)
THROTTLE_TTL=900
THROTTLE_LIMIT=100
```

---

## 💡 Pro Tips

1. **Use Prisma Studio** to view/edit database: `npm run prisma:studio`
2. **Test connection first** before running migrations: `npm run test:db`
3. **Check setup status** anytime: `npm run check`
4. **Keep .env secure** - never commit to Git
5. **Use development mode** for auto-reload: `npm run start:dev`

---

**Ready to start? Run these commands:**

```powershell
cd backend
npm run setup      # Generate secrets
npm install        # Install dependencies
npm run test:db    # Test MySQL connection
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Create tables
npm run start:dev  # Start backend!
```

---

**🎉 Good luck with your SmartSplit backend!**
