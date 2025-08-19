const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./garden_game.db');

console.log('🔍 Checking security database tables...\n');

// Check banned IPs
db.all('SELECT * FROM banned_ips', (err, rows) => {
    if (err) {
        console.error('❌ Error checking banned_ips:', err);
    } else {
        console.log('📋 Banned IPs:', rows.length);
        rows.forEach(row => {
            console.log(`  - ${row.ip_address} (${row.reason})`);
        });
    }
    
    // Check banned devices
    db.all('SELECT * FROM banned_devices', (err, rows) => {
        if (err) {
            console.error('❌ Error checking banned_devices:', err);
        } else {
            console.log('\n📱 Banned Devices:', rows.length);
            rows.forEach(row => {
                console.log(`  - ${row.device_fingerprint.substring(0, 16)}... (${row.reason})`);
            });
        }
        
        // Check security logs
        db.all('SELECT * FROM security_logs ORDER BY created_at DESC LIMIT 10', (err, rows) => {
            if (err) {
                console.error('❌ Error checking security_logs:', err);
            } else {
                console.log('\n📝 Recent Security Logs:', rows.length);
                rows.forEach(row => {
                    console.log(`  - ${row.action} by ${row.username || 'Unknown'} (${row.ip_address})`);
                });
            }
            
            // Check users table
            db.all('SELECT username, registration_ip, last_login_ip FROM users LIMIT 5', (err, rows) => {
                if (err) {
                    console.error('❌ Error checking users:', err);
                } else {
                    console.log('\n👥 Sample Users:');
                    rows.forEach(row => {
                        console.log(`  - ${row.username}: Reg IP: ${row.registration_ip}, Last IP: ${row.last_login_ip}`);
                    });
                }
                
                console.log('\n✅ Database check complete!');
                db.close();
            });
        });
    });
});
