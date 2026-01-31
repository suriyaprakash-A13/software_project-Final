#!/usr/bin/env node

/**
 * Quick Setup Script for SmartSplit Backend
 * This script helps you generate secure keys and validate your configuration
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('\n🚀 SmartSplit Backend Setup Helper\n');
console.log('=' .repeat(50));

// Generate Session Secret
console.log('\n📝 STEP 1: Generate Session Secret\n');
const sessionSecret = crypto.randomBytes(64).toString('hex');
console.log('✅ Session Secret (copy this to your .env file):');
console.log('\x1b[32m%s\x1b[0m', sessionSecret);

// Generate JWT Secret (for future use)
console.log('\n📝 STEP 2: Generate JWT Secret (optional, for future use)\n');
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log('✅ JWT Secret:');
console.log('\x1b[32m%s\x1b[0m', jwtSecret);

// Check if .env exists
console.log('\n📁 STEP 3: Environment File Check\n');
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (fs.existsSync(envPath)) {
  console.log('✅ .env file exists');
} else if (fs.existsSync(envExamplePath)) {
  console.log('⚠️  .env file not found. Creating from .env.example...');
  try {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env file from .env.example');
    console.log('⚠️  Remember to update the values in .env!');
  } catch (error) {
    console.log('❌ Could not create .env file:', error.message);
  }
} else {
  console.log('❌ Neither .env nor .env.example found');
}

// Provide next steps
console.log('\n📋 NEXT STEPS:\n');
console.log('1. Update your .env file with:');
console.log('   - Your MySQL credentials in DATABASE_URL');
console.log('   - The generated SESSION_SECRET above');
console.log('   - Your Google OAuth credentials');
console.log('\n2. Create MySQL database:');
console.log('   \x1b[36m%s\x1b[0m', 'mysql -u root -p -e "CREATE DATABASE smartsplit"');
console.log('\n3. Install dependencies:');
console.log('   \x1b[36m%s\x1b[0m', 'npm install');
console.log('\n4. Generate Prisma client:');
console.log('   \x1b[36m%s\x1b[0m', 'npm run prisma:generate');
console.log('\n5. Run database migrations:');
console.log('   \x1b[36m%s\x1b[0m', 'npm run prisma:migrate');
console.log('\n6. Start the development server:');
console.log('   \x1b[36m%s\x1b[0m', 'npm run start:dev');

console.log('\n' + '='.repeat(50));
console.log('📚 For detailed instructions, see: SETUP_GUIDE.md');
console.log('=' .repeat(50) + '\n');

// Create a sample .env template with generated secrets
console.log('💾 Creating .env.generated file with your secrets...\n');
const envTemplate = `# Generated configuration - ${new Date().toISOString()}
# Copy these values to your .env file

# Database - Update with your MySQL credentials
DATABASE_URL="mysql://root:YOUR_MYSQL_PASSWORD@localhost:3306/smartsplit"

# Session Secret - ALREADY GENERATED
SESSION_SECRET="${sessionSecret}"

# JWT Secret (for future use)
JWT_SECRET="${jwtSecret}"

# Google OAuth - Get from https://console.cloud.google.com/
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
`;

try {
  fs.writeFileSync(path.join(__dirname, '.env.generated'), envTemplate);
  console.log('✅ Created .env.generated file with your secrets');
  console.log('   You can copy values from this file to your .env\n');
} catch (error) {
  console.log('⚠️  Could not create .env.generated file:', error.message);
}
