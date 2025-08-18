#!/usr/bin/env node

const { spawn } = require('child_process');
const https = require('https');
const http = require('http');

// Get the Replit URL
const REPL_URL = process.env.REPL_SLUG ? 
    `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.replit.dev` : 
    null;

if (!REPL_URL) {
    console.log('❌ No Replit URL found, restart script disabled');
    process.exit(0);
}

console.log(`🔄 Server restart monitor started for: ${REPL_URL}`);

let serverProcess = null;
let restartCount = 0;
const MAX_RESTARTS = 5;

function startServer() {
    console.log('🚀 Starting server...');
    
    serverProcess = spawn('node', ['server.js'], {
        stdio: 'inherit',
        detached: false
    });
    
    serverProcess.on('close', (code) => {
        console.log(`❌ Server process exited with code ${code}`);
        
        if (restartCount < MAX_RESTARTS) {
            restartCount++;
            console.log(`🔄 Restarting server (attempt ${restartCount}/${MAX_RESTARTS})...`);
            setTimeout(startServer, 2000); // Wait 2 seconds before restarting
        } else {
            console.log('❌ Max restart attempts reached. Server will not restart automatically.');
        }
    });
    
    serverProcess.on('error', (err) => {
        console.error('❌ Server process error:', err);
    });
}

function checkServerHealth() {
    const healthUrl = new URL('/health', REPL_URL);
    const client = healthUrl.protocol === 'https:' ? https : http;
    
    const req = client.get(healthUrl, (res) => {
        if (res.statusCode === 200) {
            console.log('✅ Server health check passed');
        } else {
            console.log(`⚠️ Server health check failed: ${res.statusCode}`);
        }
    });
    
    req.on('error', (err) => {
        console.log(`❌ Server health check failed: ${err.message}`);
        console.log('🔄 Server may be down, attempting restart...');
        
        if (serverProcess) {
            serverProcess.kill();
        }
    });
    
    req.setTimeout(10000, () => {
        console.log('⏰ Server health check timeout');
        req.destroy();
    });
}

// Start the server
startServer();

// Check server health every 30 seconds
setInterval(checkServerHealth, 30 * 1000);

// Initial health check after 10 seconds
setTimeout(checkServerHealth, 10000);

console.log('🔄 Server restart monitor running - checking health every 30 seconds');
