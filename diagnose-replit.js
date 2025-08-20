const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔍 Diagnosing Replit server issues...\n');

const dbPath = path.join(__dirname, 'garden_game.db');
console.log('Database path:', dbPath);

const db = new sqlite3.Database(dbPath);

// Check if database file exists and is accessible
db.get('SELECT name FROM sqlite_master WHERE type="table"', (err, row) => {
    if (err) {
        console.error('❌ Database error:', err.message);
        console.log('This means the database file might not exist or is corrupted.');
        return;
    }
    
    console.log('✅ Database connection successful');
    
    // List all tables
    db.all('SELECT name FROM sqlite_master WHERE type="table"', (err, tables) => {
        if (err) {
            console.error('❌ Error listing tables:', err.message);
            return;
        }
        
        console.log('\n📋 Existing tables:');
        if (tables.length === 0) {
            console.log('   No tables found!');
        } else {
            tables.forEach(table => {
                console.log(`   - ${table.name}`);
            });
        }
        
        // Check specific tables we need
        const requiredTables = ['banned_ips', 'banned_devices', 'security_logs', 'user_mutes'];
        console.log('\n🔍 Checking required tables:');
        
        requiredTables.forEach(tableName => {
            db.get(`SELECT COUNT(*) as count FROM ${tableName}`, (err, result) => {
                if (err) {
                    console.log(`   ❌ ${tableName}: Table does not exist`);
                } else {
                    console.log(`   ✅ ${tableName}: ${result.count} rows`);
                }
            });
        });
        
        // Check users table structure
        console.log('\n🔍 Checking users table structure:');
        db.all("PRAGMA table_info(users)", (err, columns) => {
            if (err) {
                console.log('   ❌ Users table does not exist');
            } else {
                console.log('   ✅ Users table columns:');
                columns.forEach(col => {
                    console.log(`     - ${col.name} (${col.type})`);
                });
            }
            
            // Check for admin users
            console.log('\n🔍 Checking admin users:');
            db.get('SELECT COUNT(*) as count FROM users WHERE is_admin = 1', (err, result) => {
                if (err) {
                    console.log('   ❌ Error checking admin users');
                } else {
                    console.log(`   ✅ Admin users: ${result.count}`);
                }
                
                db.close();
                console.log('\n📋 Summary:');
                console.log('1. If any required tables are missing, the admin panel won\'t work');
                console.log('2. If no admin users exist, you can\'t access the admin panel');
                console.log('3. Check the Replit console for server startup errors');
            });
        });
    });
});
