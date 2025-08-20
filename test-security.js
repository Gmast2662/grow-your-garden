const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./garden_game.db');

console.log('🔍 Testing security endpoints...\n');

// Test 1: Check if tables exist and have data
db.all("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('banned_ips', 'banned_devices', 'security_logs')", (err, tables) => {
    if (err) {
        console.error('❌ Error checking tables:', err);
        return;
    }
    
    console.log('📋 Security tables found:', tables.map(t => t.name));
    
    // Test 2: Check banned_ips
    db.all('SELECT * FROM banned_ips', (err, ips) => {
        if (err) {
            console.error('❌ Error checking banned_ips:', err);
        } else {
            console.log('📋 Banned IPs:', ips.length);
            ips.forEach(ip => console.log(`  - ${ip.ip_address}: ${ip.reason}`));
        }
        
        // Test 3: Check banned_devices
        db.all('SELECT * FROM banned_devices', (err, devices) => {
            if (err) {
                console.error('❌ Error checking banned_devices:', err);
            } else {
                console.log('📱 Banned Devices:', devices.length);
                devices.forEach(device => console.log(`  - ${device.device_fingerprint.substring(0, 16)}...: ${device.reason}`));
            }
            
            // Test 4: Check security_logs
            db.all('SELECT * FROM security_logs ORDER BY created_at DESC LIMIT 5', (err, logs) => {
                if (err) {
                    console.error('❌ Error checking security_logs:', err);
                } else {
                    console.log('📝 Security Logs (latest 5):', logs.length);
                    logs.forEach(log => console.log(`  - ${log.action}: ${log.details}`));
                }
                
                // Test 5: Check users table for admin
                db.get('SELECT * FROM users WHERE is_admin = 1 LIMIT 1', (err, admin) => {
                    if (err) {
                        console.error('❌ Error checking admin user:', err);
                    } else if (admin) {
                        console.log('👑 Admin user found:', admin.username);
                    } else {
                        console.log('❌ No admin user found');
                    }
                    
                    db.close();
                });
            });
        });
    });
});
