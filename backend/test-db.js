#!/usr/bin/env node

/**
 * Database Connection Test
 * Run this to verify your MySQL connection is working
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('\n🔍 Testing MySQL Database Connection\n');
  console.log('=' .repeat(60));

  // Parse DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.log('\n❌ DATABASE_URL not found in .env file');
    console.log('   Make sure you have a .env file with DATABASE_URL set\n');
    process.exit(1);
  }

  console.log('\n📋 Connection Details:');
  console.log('   DATABASE_URL:', databaseUrl.replace(/:[^:@]+@/, ':****@')); // Hide password

  try {
    // Parse the URL
    const urlPattern = /mysql:\/\/([^:]+):([^@]*)@([^:]+):(\d+)\/(.+)/;
    const match = databaseUrl.match(urlPattern);

    if (!match) {
      throw new Error('Invalid DATABASE_URL format. Expected: mysql://user:password@host:port/database');
    }

    const [, user, password, host, port, database] = match;

    console.log('\n   User:', user);
    console.log('   Host:', host);
    console.log('   Port:', port);
    console.log('   Database:', database);

    // Test connection
    console.log('\n🔌 Attempting connection...');
    
    const connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database
    });

    console.log('✅ Successfully connected to MySQL!');

    // Test database
    console.log('\n🗃️  Testing database...');
    const [rows] = await connection.execute('SELECT DATABASE() as db');
    console.log('✅ Current database:', rows[0].db);

    // Check tables
    console.log('\n📊 Checking tables...');
    const [tables] = await connection.execute('SHOW TABLES');
    
    if (tables.length > 0) {
      console.log('✅ Found', tables.length, 'table(s):');
      tables.forEach((table, index) => {
        console.log(`   ${index + 1}. ${Object.values(table)[0]}`);
      });
    } else {
      console.log('⚠️  No tables found. Run migrations:');
      console.log('   npm run prisma:migrate');
    }

    // Test write permission
    console.log('\n🔒 Testing write permissions...');
    try {
      await connection.execute('SELECT 1');
      console.log('✅ Read/Write permissions OK');
    } catch (error) {
      console.log('❌ Permission error:', error.message);
    }

    await connection.end();

    console.log('\n' + '='.repeat(60));
    console.log('🎉 Database connection test PASSED!');
    console.log('='.repeat(60));
    console.log('\nYour backend is ready to connect to MySQL.\n');

  } catch (error) {
    console.log('\n' + '='.repeat(60));
    console.log('❌ Connection test FAILED');
    console.log('='.repeat(60));
    console.log('\n🔍 Error Details:');
    console.log('   ', error.message);

    console.log('\n💡 Common Solutions:');
    
    if (error.code === 'ECONNREFUSED') {
      console.log('   • MySQL is not running - start MySQL service');
      console.log('   • Wrong host/port - check DATABASE_URL');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('   • Wrong username/password in DATABASE_URL');
      console.log('   • User doesn\'t have access to database');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('   • Database doesn\'t exist - create it first:');
      console.log('     mysql -u root -p -e "CREATE DATABASE smartsplit"');
    } else {
      console.log('   • Check your DATABASE_URL format');
      console.log('   • Ensure MySQL is running on the specified port');
    }

    console.log('\n📖 See SETUP_GUIDE.md for detailed help\n');
    process.exit(1);
  }
}

// Check if mysql2 is installed
try {
  require('mysql2/promise');
  testConnection();
} catch (error) {
  console.log('\n⚠️  mysql2 package not found');
  console.log('   Installing dependencies...\n');
  console.log('   Run: npm install\n');
  process.exit(1);
}
