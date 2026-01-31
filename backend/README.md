# Quick Start: Backend Setup

Follow these steps in order to get your backend running:

## 🚀 Quick Setup (5 Minutes)

### 1. Install MySQL
- **Option A:** Download from https://dev.mysql.com/downloads/mysql/
- **Option B:** Use XAMPP from https://www.apachefriends.org/
- **Option C:** Docker: `docker run --name mysql -e MYSQL_ROOT_PASSWORD=password -p 3306:3306 -d mysql:8.0`

### 2. Create Database
```powershell
mysql -u root -p -e "CREATE DATABASE smartsplit"
```

### 3. Generate Secrets & Setup Environment
```powershell
cd backend
node setup.js
```

This will:
- Generate SESSION_SECRET automatically
- Create .env file from .env.example
- Show you what to do next

### 4. Update .env File

Open `backend/.env` and update:

```env
# Update with your MySQL password
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/smartsplit"

# Copy the generated secret from setup.js output
SESSION_SECRET="<paste-generated-secret-here>"

# Get from https://console.cloud.google.com/
GOOGLE_CLIENT_ID="your-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-secret"
```

### 5. Install & Setup
```powershell
npm install
npm run prisma:generate
npm run prisma:migrate
```

### 6. Start Server
```powershell
npm run start:dev
```

✅ Backend should now be running on http://localhost:3001

---

## 🔑 Getting Google OAuth Credentials

1. Go to https://console.cloud.google.com/
2. Create new project → "SmartSplit"
3. Enable "Google+ API"
4. Go to Credentials → Create OAuth 2.0 Client ID
5. Add redirect URI: `http://localhost:3001/auth/google/callback`
6. Copy Client ID & Secret to .env

---

## 📖 Need More Details?

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for comprehensive instructions including:
- Detailed MySQL installation
- Troubleshooting common errors
- Security best practices
- Production deployment tips

---

## 🆘 Common Issues

**MySQL Connection Error?**
```env
# For XAMPP (no password):
DATABASE_URL="mysql://root:@localhost:3306/smartsplit"

# For MySQL with password:
DATABASE_URL="mysql://root:yourpassword@localhost:3306/smartsplit"
```

**Port 3001 in use?**
```powershell
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

**Prisma Errors?**
```powershell
npm run prisma:generate
npm run prisma:migrate
```
