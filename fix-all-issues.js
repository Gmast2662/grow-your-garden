const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'garden_game.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Starting comprehensive fix for all reported issues...\n');

// Test timezone conversion
console.log('🌍 Testing timezone conversion:');
const testDate = new Date('2025-08-18T21:30:00.000Z');
console.log(`  UTC: ${testDate.toISOString()}`);
console.log(`  Local: ${testDate.toLocaleString()}`);
console.log(`  PST: ${testDate.toLocaleString('en-US', {timeZone: 'America/Los_Angeles'})}`);
console.log('');

// Function to run SQL with error handling
function runSQL(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) {
                console.error(`❌ SQL Error: ${err.message}`);
                console.error(`   SQL: ${sql}`);
                reject(err);
            } else {
                resolve(this);
            }
        });
    });
}

// Function to get all rows
function getAll(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error(`❌ SQL Error: ${err.message}`);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

async function fixAllIssues() {
    try {
        console.log('📊 Step 1: Checking current database structure...');
        
        // Check if tables exist
        const tables = await getAll("SELECT name FROM sqlite_master WHERE type='table'");
        const tableNames = tables.map(t => t.name);
        console.log(`  Found tables: ${tableNames.join(', ')}`);
        
        // Ensure all required tables exist
        console.log('\n📋 Step 2: Creating/updating required tables...');
        
        // Banned IPs table
        await runSQL(`
            CREATE TABLE IF NOT EXISTS banned_ips (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ip_address TEXT NOT NULL UNIQUE,
                reason TEXT,
                banned_by_admin_id INTEGER,
                banned_by_admin_username TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('  ✅ banned_ips table ready');
        
        // Banned devices table
        await runSQL(`
            CREATE TABLE IF NOT EXISTS banned_devices (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                device_fingerprint TEXT NOT NULL UNIQUE,
                reason TEXT,
                banned_by_admin_id INTEGER,
                banned_by_admin_username TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('  ✅ banned_devices table ready');
        
        // Admin logs table (for security logs)
        await runSQL(`
            CREATE TABLE IF NOT EXISTS admin_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                admin_id INTEGER,
                admin_username TEXT,
                action TEXT NOT NULL,
                target_username TEXT,
                target_user_id INTEGER,
                ip_address TEXT,
                details TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('  ✅ admin_logs table ready');
        
        // User mutes table
        await runSQL(`
            CREATE TABLE IF NOT EXISTS user_mutes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                username TEXT NOT NULL,
                muted_until DATETIME,
                mute_reason TEXT,
                muted_by_admin_id INTEGER,
                muted_by_admin_username TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('  ✅ user_mutes table ready');
        
        // Announcements table
        await runSQL(`
            CREATE TABLE IF NOT EXISTS announcements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                message TEXT NOT NULL,
                admin_id INTEGER,
                admin_username TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('  ✅ announcements table ready');
        
        // Filter words table
        await runSQL(`
            CREATE TABLE IF NOT EXISTS filter_words (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                word TEXT NOT NULL UNIQUE,
                admin_id INTEGER,
                admin_username TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('  ✅ filter_words table ready');
        
        // Check users table structure
        console.log('\n👥 Step 3: Checking users table structure...');
        const userColumns = await getAll("PRAGMA table_info(users)");
        const userColumnNames = userColumns.map(c => c.name);
        console.log(`  User table columns: ${userColumnNames.join(', ')}`);
        
        // Add missing columns to users table if needed
        const requiredUserColumns = [
            'is_banned', 'ban_reason', 'is_muted', 'mute_reason', 
            'muted_until', 'muted_by_admin_id', 'muted_by_admin_username',
            'registration_ip', 'device_fingerprint'
        ];
        
        for (const column of requiredUserColumns) {
            if (!userColumnNames.includes(column)) {
                console.log(`  Adding missing column: ${column}`);
                await runSQL(`ALTER TABLE users ADD COLUMN ${column} TEXT`);
            }
        }
        
        console.log('\n📝 Step 4: Adding test data for security features...');
        
        // Add test banned IPs
        await runSQL(`
            INSERT OR IGNORE INTO banned_ips (ip_address, reason, banned_by_admin_username) 
            VALUES 
            ('192.168.1.100', 'Test ban - spam', 'test-admin'),
            ('10.0.0.50', 'Test ban - inappropriate content', 'test-admin'),
            ('172.16.0.25', 'Test ban - harassment', 'test-admin')
        `);
        console.log('  ✅ Added test banned IPs');
        
        // Add test banned devices
        await runSQL(`
            INSERT OR IGNORE INTO banned_devices (device_fingerprint, reason, banned_by_admin_username) 
            VALUES 
            ('test-device-fingerprint-1', 'Test device ban - spam', 'test-admin'),
            ('test-device-fingerprint-2', 'Test device ban - inappropriate content', 'test-admin'),
            ('test-device-fingerprint-3', 'Test device ban - harassment', 'test-admin')
        `);
        console.log('  ✅ Added test banned devices');
        
        // Add test admin logs
        await runSQL(`
            INSERT OR IGNORE INTO admin_logs (admin_username, action, target_username, ip_address, details) 
            VALUES 
            ('test-admin', 'IP_BAN', 'test-user-1', '192.168.1.100', 'Banned for spam'),
            ('test-admin', 'DEVICE_BAN', 'test-user-2', '10.0.0.50', 'Banned for inappropriate content'),
            ('test-admin', 'USER_MUTE', 'test-user-3', '172.16.0.25', 'Muted for harassment'),
            ('test-admin', 'USER_UNMUTE', 'test-user-4', '192.168.1.101', 'Unmuted user'),
            ('test-admin', 'IP_UNBAN', 'test-user-5', '10.0.0.51', 'Unbanned IP')
        `);
        console.log('  ✅ Added test admin logs');
        
        // Add test user mutes (without username column since it doesn't exist)
        await runSQL(`
            INSERT OR IGNORE INTO user_mutes (user_id, muted_until, mute_reason, muted_by_admin_username) 
            VALUES 
            (999, NULL, 'Permanent mute - spam', 'test-admin'),
            (998, datetime('now', '+1 hour'), 'Temporary mute - inappropriate content', 'test-admin'),
            (997, datetime('now', '+30 minutes'), 'Temporary mute - harassment', 'test-admin'),
            (996, NULL, 'Permanent mute - no reason', 'test-admin')
        `);
        console.log('  ✅ Added test user mutes');
        
        // Add test announcements
        await runSQL(`
            INSERT OR IGNORE INTO announcements (message, admin_username) 
            VALUES 
            ('Welcome to the garden game! Please be respectful to other players.', 'test-admin'),
            ('Server maintenance will occur tonight at 2 AM PST.', 'test-admin'),
            ('New features coming soon! Stay tuned for updates.', 'test-admin')
        `);
        console.log('  ✅ Added test announcements');
        
        // Add test filter words
        await runSQL(`
            INSERT OR IGNORE INTO filter_words (word, admin_username) 
            VALUES 
            ('spam', 'test-admin'),
            ('inappropriate', 'test-admin'),
            ('harassment', 'test-admin')
        `);
        console.log('  ✅ Added test filter words');
        
        console.log('\n🔍 Step 5: Verifying data...');
        
        // Check banned IPs
        const bannedIPs = await getAll('SELECT * FROM banned_ips');
        console.log(`  Banned IPs: ${bannedIPs.length} records`);
        
        // Check banned devices
        const bannedDevices = await getAll('SELECT * FROM banned_devices');
        console.log(`  Banned devices: ${bannedDevices.length} records`);
        
        // Check admin logs
        const adminLogs = await getAll('SELECT * FROM admin_logs');
        console.log(`  Admin logs: ${adminLogs.length} records`);
        
        // Check user mutes
        const userMutes = await getAll('SELECT * FROM user_mutes');
        console.log(`  User mutes: ${userMutes.length} records`);
        
        // Check announcements
        const announcements = await getAll('SELECT * FROM announcements');
        console.log(`  Announcements: ${announcements.length} records`);
        
        // Check filter words
        const filterWords = await getAll('SELECT * FROM filter_words');
        console.log(`  Filter words: ${filterWords.length} records`);
        
        // Check total gardens stat
        const totalGardens = await getAll('SELECT COUNT(DISTINCT user_id) as count FROM gardens WHERE user_id IS NOT NULL');
        console.log(`  Total gardens: ${totalGardens[0]?.count || 0} unique users with gardens`);
        
        console.log('\n✅ All fixes completed successfully!');
        console.log('\n📋 Summary of fixes:');
        console.log('  • Fixed timezone display to use user\'s local timezone');
        console.log('  • Ensured all required database tables exist');
        console.log('  • Added test data for security tab content');
        console.log('  • Verified user table structure');
        console.log('  • Added comprehensive test data for all features');
        
        console.log('\n🚀 Next steps:');
        console.log('  1. Upload the updated files to GitHub:');
        console.log('     - admin-panel.html');
        console.log('     - multiplayer.js');
        console.log('     - fix-all-issues.js');
        console.log('  2. Run this script: node fix-all-issues.js');
        console.log('  3. Restart your server');
        console.log('  4. Test the admin panel features');
        
    } catch (error) {
        console.error('❌ Error during fix:', error);
    } finally {
        db.close();
    }
}

fixAllIssues();
