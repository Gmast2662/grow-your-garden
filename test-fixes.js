const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔧 Testing database fixes...\n');

const dbPath = path.join(__dirname, 'garden_game.db');
const db = new sqlite3.Database(dbPath);

// Test database connection and add test data
db.serialize(() => {
    // Check if tables exist
    db.all('SELECT name FROM sqlite_master WHERE type="table"', (err, tables) => {
        if (err) {
            console.error('❌ Database error:', err.message);
            return;
        }
        
        console.log('📋 Existing tables:');
        tables.forEach(table => {
            console.log(`   - ${table.name}`);
        });
        
        // Add test data to banned_ips
        db.run(`INSERT OR IGNORE INTO banned_ips (ip_address, reason, banned_by_admin_id, banned_by_admin_username) 
                VALUES ('192.168.1.100', 'Test IP ban', 'test-admin', 'admin')`, (err) => {
            if (err) console.error('❌ Error adding test IP:', err);
            else console.log('✅ Test IP ban added');
        });
        
        // Add test data to banned_devices
        db.run(`INSERT OR IGNORE INTO banned_devices (device_fingerprint, reason, banned_by_admin_id, banned_by_admin_username) 
                VALUES ('test-device-123', 'Test device ban', 'test-admin', 'admin')`, (err) => {
            if (err) console.error('❌ Error adding test device:', err);
            else console.log('✅ Test device ban added');
        });
        
        // Add test data to admin_logs (security logs)
        db.run(`INSERT OR IGNORE INTO admin_logs (admin_id, admin_username, action, target_user_id, target_username, details, ip_address) 
                VALUES ('test-admin', 'admin', 'TEST_LOGIN', 'test-user', 'testuser', 'Test security log entry', '192.168.1.100')`, (err) => {
            if (err) console.error('❌ Error adding test log:', err);
            else console.log('✅ Test security log added');
        });
        
        // Test mute functionality
        db.run(`INSERT OR IGNORE INTO user_mutes (user_id, muted_until, mute_reason, muted_by_admin_id, muted_by_admin_username) 
                VALUES ('test-user', NULL, 'Test permanent mute', 'test-admin', 'admin')`, (err) => {
            if (err) console.error('❌ Error adding test mute:', err);
            else console.log('✅ Test mute added');
        });
        
        setTimeout(() => {
            console.log('\n✅ Database test completed!');
            console.log('📋 Next steps:');
            console.log('1. Start your server');
            console.log('2. Go to your admin panel');
            console.log('3. Check the security tab - it should now show content');
            console.log('4. Test IP banning - it should now work');
            console.log('5. Test muting without reason - it should now work');
            db.close();
        }, 1000);
    });
});
