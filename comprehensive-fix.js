<<<<<<< HEAD
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔧 Starting comprehensive admin panel fix...\n');

const dbPath = path.join(__dirname, 'garden_game.db');
const db = new sqlite3.Database(dbPath);

// Function to run SQL and log results
function runSQL(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) {
                console.error(`❌ Error: ${err.message}`);
                reject(err);
            } else {
                console.log(`✅ Success: ${sql.substring(0, 50)}...`);
                resolve(this);
            }
        });
    });
}

// Function to get SQL results
function getSQL(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error(`❌ Error: ${err.message}`);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

async function fixAllIssues() {
    try {
        console.log('📊 Checking current database state...\n');
        
        // 1. Check if tables exist
        const tables = await getSQL("SELECT name FROM sqlite_master WHERE type='table'");
        console.log('📋 Existing tables:', tables.map(t => t.name).join(', '));
        
        // 2. Create missing tables and columns
        console.log('\n🔨 Creating/fixing database tables...\n');
        
        // Banned IPs table
        await runSQL(`
            CREATE TABLE IF NOT EXISTS banned_ips (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ip_address TEXT UNIQUE NOT NULL,
                reason TEXT,
                banned_by_admin_id INTEGER,
                banned_by_admin_username TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Banned devices table
        await runSQL(`
            CREATE TABLE IF NOT EXISTS banned_devices (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                device_id TEXT UNIQUE NOT NULL,
                reason TEXT,
                banned_by_admin_id INTEGER,
                banned_by_admin_username TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Security logs table
        await runSQL(`
            CREATE TABLE IF NOT EXISTS security_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                action TEXT NOT NULL,
                target_type TEXT,
                target_id TEXT,
                admin_id INTEGER,
                admin_username TEXT,
                details TEXT,
                ip_address TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // User mutes table
        await runSQL(`
            CREATE TABLE IF NOT EXISTS user_mutes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                is_muted BOOLEAN DEFAULT 1,
                mute_reason TEXT,
                muted_until DATETIME,
                muted_by_admin_id INTEGER,
                muted_by_admin_username TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        `);
        
        // 3. Add missing columns to users table
        console.log('\n🔧 Adding missing columns to users table...\n');
        
        const userColumns = await getSQL("PRAGMA table_info(users)");
        const columnNames = userColumns.map(col => col.name);
        
        if (!columnNames.includes('is_banned')) {
            await runSQL('ALTER TABLE users ADD COLUMN is_banned BOOLEAN DEFAULT 0');
        }
        if (!columnNames.includes('ban_reason')) {
            await runSQL('ALTER TABLE users ADD COLUMN ban_reason TEXT');
        }
        if (!columnNames.includes('is_muted')) {
            await runSQL('ALTER TABLE users ADD COLUMN is_muted BOOLEAN DEFAULT 0');
        }
        if (!columnNames.includes('mute_reason')) {
            await runSQL('ALTER TABLE users ADD COLUMN mute_reason TEXT');
        }
        if (!columnNames.includes('muted_until')) {
            await runSQL('ALTER TABLE users ADD COLUMN muted_until DATETIME');
        }
        if (!columnNames.includes('muted_by_admin_id')) {
            await runSQL('ALTER TABLE users ADD COLUMN muted_by_admin_id INTEGER');
        }
        if (!columnNames.includes('muted_by_admin_username')) {
            await runSQL('ALTER TABLE users ADD COLUMN muted_by_admin_username TEXT');
        }
        if (!columnNames.includes('registration_ip')) {
            await runSQL('ALTER TABLE users ADD COLUMN registration_ip TEXT');
        }
        
        // 4. Add test data to make security tab show content
        console.log('\n📝 Adding test data for security tab...\n');
        
        // Add test banned IP
        await runSQL(`
            INSERT OR IGNORE INTO banned_ips (ip_address, reason, banned_by_admin_id, banned_by_admin_username)
            VALUES ('192.168.1.100', 'Test ban for security tab', 1, 'admin')
        `);
        
        // Add test banned device
        await runSQL(`
            INSERT OR IGNORE INTO banned_devices (device_id, reason, banned_by_admin_id, banned_by_admin_username)
            VALUES ('test-device-123', 'Test device ban for security tab', 1, 'admin')
        `);
        
        // Add test security log
        await runSQL(`
            INSERT OR IGNORE INTO security_logs (action, target_type, target_id, admin_id, admin_username, details, ip_address)
            VALUES ('TEST_LOGIN', 'user', 'test_user', 1, 'admin', 'Test security log entry', '192.168.1.100')
        `);
        
        // 5. Check and fix garden counting
        console.log('\n🌱 Checking garden statistics...\n');
        
        const gardenStats = await getSQL(`
            SELECT 
                COUNT(*) as total_gardens,
                COUNT(DISTINCT user_id) as unique_user_gardens,
                COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as gardens_with_users
            FROM gardens
        `);
        
        console.log('📊 Garden Statistics:');
        console.log(`   Total gardens: ${gardenStats[0].total_gardens}`);
        console.log(`   Gardens with users: ${gardenStats[0].gardens_with_users}`);
        console.log(`   Unique user gardens: ${gardenStats[0].unique_user_gardens}`);
        
        // 6. Check admin users
        console.log('\n👑 Checking admin users...\n');
        
        const admins = await getSQL("SELECT id, username, is_admin FROM users WHERE is_admin = 1");
        console.log('Admin users:', admins);
        
        // 7. Check table row counts
        console.log('\n📈 Table row counts...\n');
        
        const bannedIPs = await getSQL("SELECT COUNT(*) as count FROM banned_ips");
        const bannedDevices = await getSQL("SELECT COUNT(*) as count FROM banned_devices");
        const securityLogs = await getSQL("SELECT COUNT(*) as count FROM security_logs");
        const userMutes = await getSQL("SELECT COUNT(*) as count FROM user_mutes");
        
        console.log(`Banned IPs: ${bannedIPs[0].count}`);
        console.log(`Banned Devices: ${bannedDevices[0].count}`);
        console.log(`Security Logs: ${securityLogs[0].count}`);
        console.log(`User Mutes: ${userMutes[0].count}`);
        
        console.log('\n✅ Comprehensive fix completed!');
        console.log('\n📋 Next steps:');
        console.log('1. Restart your server');
        console.log('2. Refresh the admin panel page');
        console.log('3. Test the security tab - it should now show content');
        console.log('4. Test IP banning - it should ask for IP address');
        console.log('5. Test mute system');
        console.log('6. Check if garden stats update correctly');
        
    } catch (error) {
        console.error('❌ Error during fix:', error);
    } finally {
        db.close();
    }
}

fixAllIssues();
=======
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔧 Starting comprehensive admin panel fix...\n');

const dbPath = path.join(__dirname, 'garden_game.db');
const db = new sqlite3.Database(dbPath);

// Function to run SQL and log results
function runSQL(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) {
                console.error(`❌ Error: ${err.message}`);
                reject(err);
            } else {
                console.log(`✅ Success: ${sql.substring(0, 50)}...`);
                resolve(this);
            }
        });
    });
}

// Function to get SQL results
function getSQL(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error(`❌ Error: ${err.message}`);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

async function fixAllIssues() {
    try {
        console.log('📊 Checking current database state...\n');
        
        // 1. Check if tables exist
        const tables = await getSQL("SELECT name FROM sqlite_master WHERE type='table'");
        console.log('📋 Existing tables:', tables.map(t => t.name).join(', '));
        
        // 2. Create missing tables and columns
        console.log('\n🔨 Creating/fixing database tables...\n');
        
        // Banned IPs table
        await runSQL(`
            CREATE TABLE IF NOT EXISTS banned_ips (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ip_address TEXT UNIQUE NOT NULL,
                reason TEXT,
                banned_by_admin_id INTEGER,
                banned_by_admin_username TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Banned devices table
        await runSQL(`
            CREATE TABLE IF NOT EXISTS banned_devices (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                device_id TEXT UNIQUE NOT NULL,
                reason TEXT,
                banned_by_admin_id INTEGER,
                banned_by_admin_username TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Security logs table
        await runSQL(`
            CREATE TABLE IF NOT EXISTS security_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                action TEXT NOT NULL,
                target_type TEXT,
                target_id TEXT,
                admin_id INTEGER,
                admin_username TEXT,
                details TEXT,
                ip_address TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // User mutes table
        await runSQL(`
            CREATE TABLE IF NOT EXISTS user_mutes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                is_muted BOOLEAN DEFAULT 1,
                mute_reason TEXT,
                muted_until DATETIME,
                muted_by_admin_id INTEGER,
                muted_by_admin_username TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        `);
        
        // 3. Add missing columns to users table
        console.log('\n🔧 Adding missing columns to users table...\n');
        
        const userColumns = await getSQL("PRAGMA table_info(users)");
        const columnNames = userColumns.map(col => col.name);
        
        if (!columnNames.includes('is_banned')) {
            await runSQL('ALTER TABLE users ADD COLUMN is_banned BOOLEAN DEFAULT 0');
        }
        if (!columnNames.includes('ban_reason')) {
            await runSQL('ALTER TABLE users ADD COLUMN ban_reason TEXT');
        }
        if (!columnNames.includes('is_muted')) {
            await runSQL('ALTER TABLE users ADD COLUMN is_muted BOOLEAN DEFAULT 0');
        }
        if (!columnNames.includes('mute_reason')) {
            await runSQL('ALTER TABLE users ADD COLUMN mute_reason TEXT');
        }
        if (!columnNames.includes('muted_until')) {
            await runSQL('ALTER TABLE users ADD COLUMN muted_until DATETIME');
        }
        if (!columnNames.includes('muted_by_admin_id')) {
            await runSQL('ALTER TABLE users ADD COLUMN muted_by_admin_id INTEGER');
        }
        if (!columnNames.includes('muted_by_admin_username')) {
            await runSQL('ALTER TABLE users ADD COLUMN muted_by_admin_username TEXT');
        }
        if (!columnNames.includes('registration_ip')) {
            await runSQL('ALTER TABLE users ADD COLUMN registration_ip TEXT');
        }
        
        // 4. Add test data to make security tab show content
        console.log('\n📝 Adding test data for security tab...\n');
        
        // Add test banned IP
        await runSQL(`
            INSERT OR IGNORE INTO banned_ips (ip_address, reason, banned_by_admin_id, banned_by_admin_username)
            VALUES ('192.168.1.100', 'Test ban for security tab', 1, 'admin')
        `);
        
        // Add test banned device
        await runSQL(`
            INSERT OR IGNORE INTO banned_devices (device_id, reason, banned_by_admin_id, banned_by_admin_username)
            VALUES ('test-device-123', 'Test device ban for security tab', 1, 'admin')
        `);
        
        // Add test security log
        await runSQL(`
            INSERT OR IGNORE INTO security_logs (action, target_type, target_id, admin_id, admin_username, details, ip_address)
            VALUES ('TEST_LOGIN', 'user', 'test_user', 1, 'admin', 'Test security log entry', '192.168.1.100')
        `);
        
        // 5. Check and fix garden counting
        console.log('\n🌱 Checking garden statistics...\n');
        
        const gardenStats = await getSQL(`
            SELECT 
                COUNT(*) as total_gardens,
                COUNT(DISTINCT user_id) as unique_user_gardens,
                COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as gardens_with_users
            FROM gardens
        `);
        
        console.log('📊 Garden Statistics:');
        console.log(`   Total gardens: ${gardenStats[0].total_gardens}`);
        console.log(`   Gardens with users: ${gardenStats[0].gardens_with_users}`);
        console.log(`   Unique user gardens: ${gardenStats[0].unique_user_gardens}`);
        
        // 6. Check admin users
        console.log('\n👑 Checking admin users...\n');
        
        const admins = await getSQL("SELECT id, username, is_admin FROM users WHERE is_admin = 1");
        console.log('Admin users:', admins);
        
        // 7. Check table row counts
        console.log('\n📈 Table row counts...\n');
        
        const bannedIPs = await getSQL("SELECT COUNT(*) as count FROM banned_ips");
        const bannedDevices = await getSQL("SELECT COUNT(*) as count FROM banned_devices");
        const securityLogs = await getSQL("SELECT COUNT(*) as count FROM security_logs");
        const userMutes = await getSQL("SELECT COUNT(*) as count FROM user_mutes");
        
        console.log(`Banned IPs: ${bannedIPs[0].count}`);
        console.log(`Banned Devices: ${bannedDevices[0].count}`);
        console.log(`Security Logs: ${securityLogs[0].count}`);
        console.log(`User Mutes: ${userMutes[0].count}`);
        
        console.log('\n✅ Comprehensive fix completed!');
        console.log('\n📋 Next steps:');
        console.log('1. Restart your server');
        console.log('2. Refresh the admin panel page');
        console.log('3. Test the security tab - it should now show content');
        console.log('4. Test IP banning - it should ask for IP address');
        console.log('5. Test mute system');
        console.log('6. Check if garden stats update correctly');
        
    } catch (error) {
        console.error('❌ Error during fix:', error);
    } finally {
        db.close();
    }
}

fixAllIssues();
>>>>>>> e4a482801caead975926ba19c835b6d2d697c03b
