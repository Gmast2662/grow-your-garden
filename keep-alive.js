// Keep-alive script to prevent Replit from shutting down
const https = require('https');
const http = require('http');

// Get the Replit URL from environment variables
const REPL_URL = process.env.REPL_SLUG ? 
    `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.replit.dev` : 
    null;

if (!REPL_URL) {
    console.log('❌ No Replit URL found, keep-alive disabled');
    process.exit(0);
}

console.log(`🔄 Keep-alive started for: ${REPL_URL}`);

function pingServer() {
    const healthUrl = new URL('/health', REPL_URL);
    const client = healthUrl.protocol === 'https:' ? https : http;
    
    const req = client.get(healthUrl, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                const health = JSON.parse(data);
                console.log(`✅ Ping successful - Status: ${res.statusCode}, Uptime: ${Math.round(health.uptime)}s, Online: ${health.onlineUsers}`);
            } catch (e) {
                console.log(`✅ Ping successful - Status: ${res.statusCode}`);
            }
        });
    });
    
    req.on('error', (err) => {
        console.log(`❌ Ping failed: ${err.message}`);
    });
    
    req.setTimeout(5000, () => {
        console.log('⏰ Ping timeout');
        req.destroy();
    });
}

// Ping every 5 minutes to keep the server alive
setInterval(pingServer, 5 * 60 * 1000);

// Initial ping
pingServer();

console.log('🔄 Keep-alive running - pinging every 5 minutes');
