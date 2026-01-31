# Complete Backend Setup Guide

This guide will walk you through setting up the entire backend with MySQL, session secrets, and all required configurations.

## 📋 Prerequisites

- Node.js (v18 or higher)
- MySQL 8.0 or higher
- Git

---

## 🗄️ Step 1: Install MySQL

### Option A: MySQL Community Server (Recommended for Development)

1. **Download MySQL:**
   - Go to: https://dev.mysql.com/downloads/mysql/
   - Select your OS (Windows)
   - Download MySQL Installer

2. **Install MySQL:**
   - Run the installer
   - Choose "Developer Default" setup
   - Set root password (remember this!)
   - Keep default port: 3306
   - Complete the installation

3. **Verify Installation:**
   ```powershell
   mysql --version
   ```

### Option B: Using XAMPP (Easier for Beginners)

1. Download XAMPP from: https://www.apachefriends.org/
2. Install and start MySQL from XAMPP Control Panel
3. Default credentials: username=`root`, password=`` (empty)

### Option C: Using Docker (For Advanced Users)

```powershell
docker run --name smartsplit-mysql -e MYSQL_ROOT_PASSWORD=yourpassword -e MYSQL_DATABASE=smartsplit -p 3306:3306 -d mysql:8.0
```

---

## 🔐 Step 2: Generate Secret Keys

### Session Secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
fhhhhhhhh
Generate a strong random session secret using one of these methods:

**Method 1 - Using Node.js:**
```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Method 2 - Using OpenSSL:**
```powershell
openssl rand -hex 64
```

**Method 3 - Using PowerShell:**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

### JWT Secret (if needed in future)

Same process as above - generate another unique secret key.

**Example outputs:**
```
SESSION_SECRET: 4f8a3b2c1d9e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f
```

---

## 🗃️ Step 3: Create MySQL Database

### Using MySQL Command Line:

```powershell
mysql -u root -p
```

Then in MySQL prompt:

```sql
-- Create the database
CREATE DATABASE smartsplit CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Verify database is created
SHOW DATABASES;

-- Exit MySQL
EXIT;
```

### Using XAMPP phpMyAdmin:

1. Open http://localhost/phpmyadmin
2. Click "New" in left sidebar
3. Database name: `smartsplit`
4. Collation: `utf8mb4_unicode_ci`
5. Click "Create"

---

## 🔑 Step 4: Get Google OAuth Credentials

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/

2. **Create a New Project:**
   - Click "Select a project" → "New Project"
   - Project name: `SmartSplit`
   - Click "Create"

3. **Enable Google+ API:**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click and enable it

4. **Create OAuth Credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Configure consent screen (if prompted):
     - User Type: External
     - App name: SmartSplit
     - User support email: your email
     - Developer contact: your email
     - Save and continue through all steps

5. **Create OAuth Client ID:**
   - Application type: Web application
   - Name: SmartSplit Backend
   - Authorized JavaScript origins:
     - `http://localhost:3001`
     - `http://localhost:3000`
   - Authorized redirect URIs:
     - `http://localhost:3001/auth/google/callback`
   - Click "Create"

6. **Copy Credentials:**
   - You'll see your Client ID and Client Secret
   - **Keep these safe!**

---

## ⚙️ Step 5: Configure Environment Variables

1. **Copy the example file:**
   ```powershell
   cd backend
   copy .env.example .env
   ```

2. **Edit `.env` file with your values:**

   Open `backend/.env` and update:

   ```env
   # Database - Replace with your MySQL credentials
   DATABASE_URL="mysql://root:YOUR_MYSQL_PASSWORD@localhost:3306/smartsplit"

   # Session Secret - Use the generated secret from Step 2
   SESSION_SECRET="your-generated-64-character-secret-here"

   # Google OAuth - Use credentials from Step 4
   GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   GOOGLE_CALLBACK_URL="http://localhost:3001/auth/google/callback"

   # Application Settings
   NODE_ENV="development"
   PORT=3001
   FRONTEND_URL="http://localhost:3000"

   # Rate Limiting
   THROTTLE_TTL=900
   THROTTLE_LIMIT=100
   ```

**Important Notes:**
- Replace `YOUR_MYSQL_PASSWORD` with your actual MySQL root password
- If using XAMPP with no password, use: `mysql://root:@localhost:3306/smartsplit`
- Never commit `.env` file to Git!

---

## 📦 Step 6: Install Dependencies

```powershell
cd backend
npm install
```

This will install all required packages including:
- NestJS framework
- Prisma ORM
- Passport for authentication
- Express session management
- And all other dependencies

---

## 🔄 Step 7: Set Up Prisma & Database

### Generate Prisma Client:

```powershell
npm run prisma:generate
```

### Run Database Migrations:

```powershell
npm run prisma:migrate
```

When prompted for migration name, enter: `initial_setup`

This will:
- Create all tables (users, groups, memberships, expenses, settlements)
- Set up relationships
- Create indexes

### View Database (Optional):

```powershell
npm run prisma:studio
```

This opens a visual database browser at http://localhost:5555

---

## 🚀 Step 8: Start the Backend Server

### Development Mode (with auto-reload):

```powershell
npm run start:dev
```

### Production Mode:

```powershell
npm run build
npm run start:prod
```

**You should see:**
```
[Nest] Application successfully started on port 3001
```

---

## ✅ Step 9: Verify Setup

### Test the API:

1. **Health Check:**
   - Open browser: http://localhost:3001
   - Should see a welcome message

2. **Test Google OAuth:**
   - Go to: http://localhost:3001/auth/google
   - Should redirect to Google login

3. **Check Swagger Documentation (if configured):**
   - http://localhost:3001/api

---

## 🔧 Troubleshooting

### Database Connection Errors:

**Error: "Can't connect to MySQL server"**
- Ensure MySQL is running
- Check if port 3306 is correct
- Verify username/password in DATABASE_URL

**Solution for XAMPP:**
```env
DATABASE_URL="mysql://root:@localhost:3306/smartsplit"
```

**Solution for MySQL with password:**
```env
DATABASE_URL="mysql://root:yourpassword@localhost:3306/smartsplit"
```

### Prisma Errors:

**Error: "Unknown database"**
```powershell
mysql -u root -p -e "CREATE DATABASE smartsplit"
```

**Error: "Prisma schema not found"**
```powershell
cd backend
npm run prisma:generate
```

### Port Already in Use:

**Error: "Port 3001 is already in use"**

Find and kill the process:
```powershell
netstat -ano | findstr :3001
taskkill /PID <PID_NUMBER> /F
```

Or change PORT in `.env` file:
```env
PORT=3002
```

### Google OAuth Errors:

**Error: "redirect_uri_mismatch"**
- Go back to Google Cloud Console
- Add exact callback URL to authorized redirects
- Wait 5 minutes for changes to propagate

---

## 📝 Quick Reference Commands

```powershell
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Create/run migrations
npm run prisma:migrate

# View database in browser
npm run prisma:studio

# Start development server
npm run start:dev

# Build for production
npm run build

# Start production server
npm run start:prod

# Run tests
npm test

# Format code
npm run format

# Lint code
npm run lint
```

---

## 🔐 Security Checklist

- [x] Generated strong SESSION_SECRET
- [x] Secured MySQL with password
- [x] Created separate database for the app
- [x] Configured Google OAuth correctly
- [x] Added `.env` to `.gitignore`
- [x] Using HTTPS in production (future)
- [x] Rate limiting enabled

---

## 📚 Additional Resources

- **NestJS Documentation:** https://docs.nestjs.com/
- **Prisma Documentation:** https://www.prisma.io/docs/
- **MySQL Documentation:** https://dev.mysql.com/doc/
- **Passport.js:** http://www.passportjs.org/
- **Google OAuth Guide:** https://developers.google.com/identity/protocols/oauth2

---

## 🎯 Next Steps

After completing this setup:

1. **Test the API** using Postman or Thunder Client
2. **Set up the Frontend** (Next.js app in `frontend/` folder)
3. **Create your first user** via Google OAuth
4. **Start building features!**

---

## 💡 Pro Tips

1. **Use Database Seeding** for test data:
   Create `prisma/seed.ts` for sample data

2. **Enable Logging:**
   Check logs in console for debugging

3. **Use Environment-Specific Configs:**
   Create `.env.development` and `.env.production`

4. **Backup Your Database:**
   ```powershell
   mysqldump -u root -p smartsplit > backup.sql
   ```

5. **Monitor Performance:**
   Use Prisma Studio to analyze queries

---

## 🆘 Need Help?

If you encounter issues:
1. Check error messages carefully
2. Verify all environment variables
3. Ensure MySQL is running
4. Check if all dependencies are installed
5. Review the documentation links above

---

**Good luck with your SmartSplit backend! 🚀**
