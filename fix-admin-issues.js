const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./garden_game.db');

console.log('🔧 Fixing admin panel issues...\n');

// Fix 1: Ensure all required tables exist with correct structure
db.serialize(() => {
    // Fix banned_ips table
    db.run(`CREATE TABLE IF NOT EXISTS banned_ips (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ip_address TEXT UNIQUE NOT NULL,
        reason TEXT,
        banned_by_admin_id TEXT,
        banned_by_admin_username TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (banned_by_admin_id) REFERENCES users (id)
    )`, (err) => {
        if (err) {
            console.error('❌ Error creating banned_ips table:', err);
        } else {
            console.log('✅ banned_ips table ready');
        }
    });

    // Fix banned_devices table
    db.run(`CREATE TABLE IF NOT EXISTS banned_devices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        device_fingerprint TEXT UNIQUE NOT NULL,
        reason TEXT,
        banned_by_admin_id TEXT,
        banned_by_admin_username TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (banned_by_admin_id) REFERENCES users (id)
    )`, (err) => {
        if (err) {
            console.error('❌ Error creating banned_devices table:', err);
        } else {
            console.log('✅ banned_devices table ready');
        }
    });

    // Fix security_logs table
    db.run(`CREATE TABLE IF NOT EXISTS security_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        username TEXT,
        action TEXT NOT NULL,
        ip_address TEXT,
        device_fingerprint TEXT,
        details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`, (err) => {
        if (err) {
            console.error('❌ Error creating security_logs table:', err);
        } else {
            console.log('✅ security_logs table ready');
        }
    });

    // Fix user_mutes table
    db.run(`CREATE TABLE IF NOT EXISTS user_mutes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        muted_until DATETIME,
        mute_reason TEXT,
        muted_by_admin_id TEXT,
        muted_by_admin_username TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (muted_by_admin_id) REFERENCES users (id)
    )`, (err) => {
        if (err) {
            console.error('❌ Error creating user_mutes table:', err);
        } else {
            console.log('✅ user_mutes table ready');
        }
    });

    // Add missing columns to users table
    db.run(`ALTER TABLE users ADD COLUMN last_login_ip TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
            console.error('❌ Error adding last_login_ip column:', err);
        } else {
            console.log('✅ last_login_ip column ready');
        }
    });

    db.run(`ALTER TABLE users ADD COLUMN registration_ip TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
            console.error('❌ Error adding registration_ip column:', err);
        } else {
            console.log('✅ registration_ip column ready');
        }
    });

    db.run(`ALTER TABLE users ADD COLUMN device_fingerprint TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
            console.error('❌ Error adding device_fingerprint column:', err);
        } else {
            console.log('✅ device_fingerprint column ready');
        }
    });

    db.run(`ALTER TABLE users ADD COLUMN is_banned BOOLEAN DEFAULT 0`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
            console.error('❌ Error adding is_banned column:', err);
        } else {
            console.log('✅ is_banned column ready');
        }
    });

    // Add some test data to verify the system works
    setTimeout(() => {
        console.log('\n🧪 Adding test data...');
        
        // Add a test security log
        db.run(`INSERT OR IGNORE INTO security_logs (username, action, ip_address, details) VALUES (?, ?, ?, ?)`,
            ['TestUser', 'Test Action', '192.168.1.100', 'Testing security system'], (err) => {
            if (err) {
                console.error('❌ Error adding test security log:', err);
            } else {
                console.log('✅ Test security log added');
            }
        });

        // Check current data
        db.all('SELECT COUNT(*) as count FROM security_logs', (err, result) => {
            if (err) {
                console.error('❌ Error checking security logs:', err);
            } else {
                console.log(`📝 Security logs count: ${result[0].count}`);
            }
        });

        db.all('SELECT COUNT(*) as count FROM banned_ips', (err, result) => {
            if (err) {
                console.error('❌ Error checking banned IPs:', err);
            } else {
                console.log(`🌐 Banned IPs count: ${result[0].count}`);
            }
        });

        db.all('SELECT COUNT(*) as count FROM user_mutes', (err, result) => {
            if (err) {
                console.error('❌ Error checking user mutes:', err);
            } else {
                console.log(`🔇 User mutes count: ${result[0].count}`);
            }
        });

        console.log('\n✅ Admin panel fixes complete!');
        console.log('\n📋 Next steps:');
        console.log('1. Restart your server');
        console.log('2. Test the security tab');
        console.log('3. Try banning a fake IP (192.168.1.999)');
        console.log('4. Test the mute system');
        
        db.close();
    }, 1000);
});
