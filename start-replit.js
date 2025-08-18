#!/usr/bin/env node

console.log('🌱 Starting Garden Game Server on Replit...');

// Check if we're on Replit
const isReplit = process.env.REPL_ID || process.env.REPL_OWNER;
if (isReplit) {
    console.log('✅ Detected Replit environment');
    console.log(`📦 REPL_ID: ${process.env.REPL_ID}`);
    console.log(`👤 REPL_OWNER: ${process.env.REPL_OWNER}`);
}

// Set default environment variables for Replit
if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'garden-game-2025-secret-key-jwt-123';
    console.log('🔑 Set default JWT_SECRET');
}

if (!process.env.PORT) {
    process.env.PORT = '3000';
    console.log('🌐 Set default PORT to 3000');
}

// Import and start the server
try {
    require('./server.js');
    console.log('✅ Server started successfully!');
} catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
}
