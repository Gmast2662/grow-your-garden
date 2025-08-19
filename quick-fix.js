const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔧 Quick fix for admin panel issues...\n');

const dbPath = path.join(__dirname, 'garden_game.db');
const db = new sqlite3.Database(dbPath);

// Create missing tables
db.serialize(() => {
    // Create banned_ips table
    db.run(`CREATE TABLE IF NOT EXISTS banned_ips (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ip_address TEXT UNIQUE NOT NULL,
        reason TEXT,
        banned_by_admin_id INTEGER,
        banned_by_admin_username TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) console.error('Error creating banned_ips:', err);
        else console.log('✅ banned_ips table ready');
    });

    // Create banned_devices table
    db.run(`CREATE TABLE IF NOT EXISTS banned_devices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        device_id TEXT UNIQUE NOT NULL,
        reason TEXT,
        banned_by_admin_id INTEGER,
        banned_by_admin_username TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) console.error('Error creating banned_devices:', err);
        else console.log('✅ banned_devices table ready');
    });

    // Create security_logs table
    db.run(`CREATE TABLE IF NOT EXISTS security_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        target_type TEXT,
        target_id TEXT,
        admin_id INTEGER,
        admin_username TEXT,
        details TEXT,
        ip_address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) console.error('Error creating security_logs:', err);
        else console.log('✅ security_logs table ready');
    });

    // Create user_mutes table
    db.run(`CREATE TABLE IF NOT EXISTS user_mutes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        is_muted BOOLEAN DEFAULT 1,
        mute_reason TEXT,
        muted_until DATETIME,
        muted_by_admin_id INTEGER,
        muted_by_admin_username TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) console.error('Error creating user_mutes:', err);
        else console.log('✅ user_mutes table ready');
    });

    // Add test data
    db.run(`INSERT OR IGNORE INTO banned_ips (ip_address, reason, banned_by_admin_id, banned_by_admin_username)
            VALUES ('192.168.1.100', 'Test ban for security tab', 1, 'admin')`, (err) => {
        if (err) console.error('Error adding test IP:', err);
        else console.log('✅ Test IP ban added');
    });

    db.run(`INSERT OR IGNORE INTO banned_devices (device_id, reason, banned_by_admin_id, banned_by_admin_username)
            VALUES ('test-device-123', 'Test device ban for security tab', 1, 'admin')`, (err) => {
        if (err) console.error('Error adding test device:', err);
        else console.log('✅ Test device ban added');
    });

    db.run(`INSERT OR IGNORE INTO security_logs (action, target_type, target_id, admin_id, admin_username, details, ip_address)
            VALUES ('TEST_LOGIN', 'user', 'test_user', 1, 'admin', 'Test security log entry', '192.168.1.100')`, (err) => {
        if (err) console.error('Error adding test log:', err);
        else console.log('✅ Test security log added');
    });

    // Check results
    setTimeout(() => {
        db.all("SELECT COUNT(*) as count FROM banned_ips", (err, rows) => {
            if (err) console.error('Error checking banned_ips:', err);
            else console.log(`📊 Banned IPs: ${rows[0].count}`);
        });

        db.all("SELECT COUNT(*) as count FROM banned_devices", (err, rows) => {
            if (err) console.error('Error checking banned_devices:', err);
            else console.log(`📊 Banned Devices: ${rows[0].count}`);
        });

        db.all("SELECT COUNT(*) as count FROM security_logs", (err, rows) => {
            if (err) console.error('Error checking security_logs:', err);
            else console.log(`📊 Security Logs: ${rows[0].count}`);
        });

        db.all("SELECT COUNT(*) as count FROM user_mutes", (err, rows) => {
            if (err) console.error('Error checking user_mutes:', err);
            else console.log(`📊 User Mutes: ${rows[0].count}`);
        });

        console.log('\n✅ Quick fix completed!');
        console.log('📋 Next steps:');
        console.log('1. Restart your server');
        console.log('2. Refresh the admin panel page');
        console.log('3. Test the security tab - it should now show content');
        console.log('4. Test IP banning and mute system');
        
        db.close();
    }, 1000);
});
