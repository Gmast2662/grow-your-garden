const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'garden_game.db');

// Create database connection
const db = new sqlite3.Database(dbPath);

console.log('🔧 Fixing Admin Panel Database Issues...\n');

// Function to run SQL with error handling
function runSQL(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) {
                console.error(`❌ SQL Error: ${err.message}`);
                console.error(`   SQL: ${sql}`);
                reject(err);
            } else {
                console.log(`✅ SQL executed successfully`);
                resolve(this);
            }
        });
    });
}

async function fixDatabase() {
    try {
        console.log('📋 Step 1: Ensuring all required tables exist...');
        
        // Create users table with all required columns
        await runSQL(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                email TEXT,
                password_hash TEXT NOT NULL,
                is_admin INTEGER DEFAULT 0,
                is_banned INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_login DATETIME,
                last_login_ip TEXT,
                registration_ip TEXT,
                device_fingerprint TEXT
            )
        `);

        // Create gardens table
        await runSQL(`
            CREATE TABLE IF NOT EXISTS gardens (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                garden_data TEXT NOT NULL,
                slot_number INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        // Create friends table
        await runSQL(`
            CREATE TABLE IF NOT EXISTS friends (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                friend_id TEXT NOT NULL,
                status TEXT DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (friend_id) REFERENCES users(id)
            )
        `);

        // Create chat_messages table
        await runSQL(`
            CREATE TABLE IF NOT EXISTS chat_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sender_id TEXT NOT NULL,
                receiver_id TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (sender_id) REFERENCES users(id),
                FOREIGN KEY (receiver_id) REFERENCES users(id)
            )
        `);

        // Create announcements table
        await runSQL(`
            CREATE TABLE IF NOT EXISTS announcements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                is_active INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create admin_logs table
        await runSQL(`
            CREATE TABLE IF NOT EXISTS admin_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                admin_id TEXT NOT NULL,
                admin_username TEXT NOT NULL,
                action TEXT NOT NULL,
                target_username TEXT,
                details TEXT,
                ip_address TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (admin_id) REFERENCES users(id)
            )
        `);

        // Create user_mutes table
        await runSQL(`
            CREATE TABLE IF NOT EXISTS user_mutes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                muted_by TEXT NOT NULL,
                reason TEXT,
                expires_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (muted_by) REFERENCES users(id)
            )
        `);

        // Create chat_filter_words table
        await runSQL(`
            CREATE TABLE IF NOT EXISTS chat_filter_words (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                word TEXT UNIQUE NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create banned_ips table
        await runSQL(`
            CREATE TABLE IF NOT EXISTS banned_ips (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ip_address TEXT UNIQUE NOT NULL,
                reason TEXT,
                banned_by TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (banned_by) REFERENCES users(id)
            )
        `);

        // Create banned_devices table
        await runSQL(`
            CREATE TABLE IF NOT EXISTS banned_devices (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                device_fingerprint TEXT UNIQUE NOT NULL,
                reason TEXT,
                banned_by TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (banned_by) REFERENCES users(id)
            )
        `);

        // Create security_logs table
        await runSQL(`
            CREATE TABLE IF NOT EXISTS security_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_type TEXT NOT NULL,
                username TEXT,
                ip_address TEXT,
                device_fingerprint TEXT,
                details TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('\n📋 Step 2: Adding missing columns to existing tables...');
        
        // Add missing columns to users table
        const columnsToAdd = [
            'is_banned',
            'last_login_ip', 
            'registration_ip',
            'device_fingerprint'
        ];

        for (const column of columnsToAdd) {
            try {
                await runSQL(`ALTER TABLE users ADD COLUMN ${column} TEXT`);
                console.log(`✅ Added column: ${column}`);
            } catch (err) {
                if (err.message.includes('duplicate column name')) {
                    console.log(`ℹ️ Column already exists: ${column}`);
                } else {
                    console.error(`❌ Error adding column ${column}:`, err.message);
                }
            }
        }

        console.log('\n📋 Step 3: Adding default chat filter words...');
        
        // Add some default filter words if table is empty
        const defaultWords = ['spam', 'hack', 'cheat', 'exploit'];
        
        for (const word of defaultWords) {
            try {
                await runSQL('INSERT OR IGNORE INTO chat_filter_words (word) VALUES (?)', [word]);
            } catch (err) {
                console.log(`ℹ️ Word already exists: ${word}`);
            }
        }

        console.log('\n📋 Step 4: Creating admin user if none exists...');
        
        // Check if admin exists
        db.get('SELECT COUNT(*) as count FROM users WHERE is_admin = 1', (err, row) => {
            if (err) {
                console.error('❌ Error checking admin:', err.message);
            } else if (row.count === 0) {
                console.log('⚠️ No admin user found. Please run: node create-admin.js');
            } else {
                console.log(`✅ Admin users found: ${row.count}`);
            }
            
            console.log('\n✅ Database migration complete!');
            console.log('🌐 Admin panel should now work correctly.');
            db.close();
        });

    } catch (error) {
        console.error('❌ Database migration failed:', error);
        db.close();
    }
}

fixDatabase();
