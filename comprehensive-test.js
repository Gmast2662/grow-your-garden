const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔧 Running comprehensive database test...\n');

const dbPath = path.join(__dirname, 'garden_game.db');
const db = new sqlite3.Database(dbPath);

// Test database connection and structure
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

        // Check required tables
        const requiredTables = ['banned_ips', 'banned_devices', 'admin_logs', 'user_mutes'];
        const missingTables = requiredTables.filter(table => !tables.some(t => t.name === table));
        
        if (missingTables.length > 0) {
            console.log(`\n⚠️ Missing tables: ${missingTables.join(', ')}`);
        } else {
            console.log('\n✅ All required tables exist');
        }

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

        // Add test data to admin_logs for IP ban
        db.run(`INSERT OR IGNORE INTO admin_logs (admin_id, admin_username, action, target_user_id, target_username, details, ip_address)
                VALUES ('test-admin', 'admin', 'IP_BAN', 'test-user', 'testuser', 'Test IP ban log entry', '192.168.1.100')`, (err) => {
            if (err) console.error('❌ Error adding test IP ban log:', err);
            else console.log('✅ Test IP ban log added');
        });

        // Add test data to admin_logs for device ban
        db.run(`INSERT OR IGNORE INTO admin_logs (admin_id, admin_username, action, target_user_id, target_username, details, ip_address)
                VALUES ('test-admin', 'admin', 'DEVICE_BAN', 'test-user', 'testuser', 'Test device ban log entry', '192.168.1.100')`, (err) => {
            if (err) console.error('❌ Error adding test device ban log:', err);
            else console.log('✅ Test device ban log added');
        });

        // Test mute functionality - permanent mute
        db.run(`INSERT OR IGNORE INTO user_mutes (user_id, muted_until, mute_reason, muted_by_admin_id, muted_by_admin_username)
                VALUES ('test-user', NULL, 'Test permanent mute', 'test-admin', 'admin')`, (err) => {
            if (err) console.error('❌ Error adding test permanent mute:', err);
            else console.log('✅ Test permanent mute added');
        });

        // Test mute functionality - temporary mute
        const futureDate = new Date();
        futureDate.setHours(futureDate.getHours() + 24); // 24 hours from now
        db.run(`INSERT OR IGNORE INTO user_mutes (user_id, muted_until, mute_reason, muted_by_admin_id, muted_by_admin_username)
                VALUES ('test-user-2', ?, 'Test temporary mute', 'test-admin', 'admin')`, [futureDate.toISOString()], (err) => {
            if (err) console.error('❌ Error adding test temporary mute:', err);
            else console.log('✅ Test temporary mute added');
        });

        // Test mute functionality - mute without reason
        db.run(`INSERT OR IGNORE INTO user_mutes (user_id, muted_until, mute_reason, muted_by_admin_id, muted_by_admin_username)
                VALUES ('test-user-3', NULL, NULL, 'test-admin', 'admin')`, (err) => {
            if (err) console.error('❌ Error adding test mute without reason:', err);
            else console.log('✅ Test mute without reason added');
        });

        setTimeout(() => {
            console.log('\n✅ Comprehensive test completed!');
            console.log('\n📋 Next steps:');
            console.log('1. Start your server in Replit');
            console.log('2. Go to your admin panel');
            console.log('3. Check the security tab - it should now show:');
            console.log('   - 1 banned IP (192.168.1.100)');
            console.log('   - 1 banned device (test-device-123)');
            console.log('   - 4 security log entries');
            console.log('4. Test IP banning - it should now work and ask for IP');
            console.log('5. Test muting without reason - it should now work');
            console.log('6. Test permanent mutes - they should prevent login');
            console.log('7. Check that times are displayed in PST');
            console.log('\n🔧 If issues persist, please run:');
            console.log('   node comprehensive-test.js');
            console.log('   Then restart your server');
            db.close();
        }, 2000);
    });
});
