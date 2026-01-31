# SmartSplit Backend Setup Checker
# Run this to verify your setup is correct

Write-Host "`n🔍 SmartSplit Backend Setup Checker`n" -ForegroundColor Cyan
Write-Host "=" * 60

# Check if MySQL is running
Write-Host "`n📊 Checking MySQL..." -ForegroundColor Yellow
$mysqlRunning = Get-Process mysql* -ErrorAction SilentlyContinue
if ($mysqlRunning) {
    Write-Host "✅ MySQL is running" -ForegroundColor Green
} else {
    Write-Host "❌ MySQL is not running" -ForegroundColor Red
    Write-Host "   Start MySQL from XAMPP or MySQL Workbench" -ForegroundColor Gray
}

# Check if port 3306 is listening
$port3306 = netstat -ano | Select-String ":3306"
if ($port3306) {
    Write-Host "✅ MySQL port 3306 is listening" -ForegroundColor Green
} else {
    Write-Host "⚠️  MySQL port 3306 is not listening" -ForegroundColor Yellow
}

# Check if .env file exists
Write-Host "`n📁 Checking configuration files..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✅ .env file exists" -ForegroundColor Green
    
    # Check if .env has required variables
    $envContent = Get-Content ".env" -Raw
    
    if ($envContent -match "DATABASE_URL") {
        Write-Host "✅ DATABASE_URL is set" -ForegroundColor Green
    } else {
        Write-Host "❌ DATABASE_URL is missing" -ForegroundColor Red
    }
    
    if ($envContent -match "SESSION_SECRET") {
        Write-Host "✅ SESSION_SECRET is set" -ForegroundColor Green
    } else {
        Write-Host "❌ SESSION_SECRET is missing" -ForegroundColor Red
    }
    
    if ($envContent -match "GOOGLE_CLIENT_ID") {
        Write-Host "✅ GOOGLE_CLIENT_ID is set" -ForegroundColor Green
    } else {
        Write-Host "⚠️  GOOGLE_CLIENT_ID is missing (needed for OAuth)" -ForegroundColor Yellow
    }
    
    if ($envContent -match "GOOGLE_CLIENT_SECRET") {
        Write-Host "✅ GOOGLE_CLIENT_SECRET is set" -ForegroundColor Green
    } else {
        Write-Host "⚠️  GOOGLE_CLIENT_SECRET is missing (needed for OAuth)" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ .env file not found" -ForegroundColor Red
    Write-Host "   Run: node setup.js" -ForegroundColor Gray
}

# Check if node_modules exists
Write-Host "`n📦 Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Dependencies not installed" -ForegroundColor Red
    Write-Host "   Run: npm install" -ForegroundColor Gray
}

# Check if Prisma client is generated
if (Test-Path "node_modules\.prisma\client") {
    Write-Host "✅ Prisma client is generated" -ForegroundColor Green
} else {
    Write-Host "❌ Prisma client not generated" -ForegroundColor Red
    Write-Host "   Run: npm run prisma:generate" -ForegroundColor Gray
}

# Check if prisma/migrations folder exists
Write-Host "`n🗃️  Checking database..." -ForegroundColor Yellow
if (Test-Path "prisma\migrations") {
    $migrations = Get-ChildItem "prisma\migrations" -Directory
    if ($migrations.Count -gt 0) {
        Write-Host "✅ Database migrations exist ($($migrations.Count) migration(s))" -ForegroundColor Green
    } else {
        Write-Host "⚠️  No migrations found" -ForegroundColor Yellow
        Write-Host "   Run: npm run prisma:migrate" -ForegroundColor Gray
    }
} else {
    Write-Host "⚠️  Migrations folder not found" -ForegroundColor Yellow
    Write-Host "   Run: npm run prisma:migrate" -ForegroundColor Gray
}

# Check if backend is already running on port 3001
Write-Host "`n🚀 Checking backend server..." -ForegroundColor Yellow
$port3001 = netstat -ano | Select-String ":3001.*LISTENING"
if ($port3001) {
    Write-Host "✅ Backend is running on port 3001" -ForegroundColor Green
} else {
    Write-Host "⚠️  Backend is not running" -ForegroundColor Yellow
    Write-Host "   Run: npm run start:dev" -ForegroundColor Gray
}

# Summary
Write-Host "`n" + "=" * 60
Write-Host "📋 SUMMARY" -ForegroundColor Cyan
Write-Host "=" * 60

$allGood = $true

if (-not $mysqlRunning) { $allGood = $false }
if (-not (Test-Path ".env")) { $allGood = $false }
if (-not (Test-Path "node_modules")) { $allGood = $false }

if ($allGood) {
    Write-Host "`n✅ All critical checks passed!" -ForegroundColor Green
    Write-Host "`nYour backend is ready to run!" -ForegroundColor Green
    Write-Host "`nNext step: npm run start:dev`n" -ForegroundColor Cyan
} else {
    Write-Host "`n⚠️  Some issues found. Please fix them before starting." -ForegroundColor Yellow
    Write-Host "`nSee CHECKLIST.md for detailed setup steps.`n" -ForegroundColor Gray
}

Write-Host "=" * 60 + "`n"
