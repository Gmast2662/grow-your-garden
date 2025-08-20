const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./garden_game.db');

console.log('🔍 Debugging admin panel issues...\n');

// Check if tables exist
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
        console.error('❌ Error checking tables:', err);
        return;
    }
    
    console.log('📋 Existing tables:');
    tables.forEach(table => {
        console.log(`  - ${table.name}`);
    });
    
    // Check specific tables
    const requiredTables = ['banned_ips', 'banned_devices', 'security_logs', 'user_mutes', 'users', 'gardens'];
    
    console.log('\n🔍 Checking required tables:');
    requiredTables.forEach(tableName => {
        db.get(`SELECT COUNT(*) as count FROM ${tableName}`, (err, result) => {
            if (err) {
                console.log(`❌ ${tableName}: Error - ${err.message}`);
            } else {
                console.log(`✅ ${tableName}: ${result.count} records`);
            }
        });
    });
    
    // Check users table structure
    setTimeout(() => {
        console.log('\n🔍 Checking users table structure:');
        db.all("PRAGMA table_info(users)", (err, columns) => {
            if (err) {
                console.error('❌ Error checking users table structure:', err);
            } else {
                console.log('Users table columns:');
                columns.forEach(col => {
                    console.log(`  - ${col.name} (${col.type})`);
                });
            }
            
            // Check if we have any users
            db.get("SELECT COUNT(*) as count FROM users", (err, result) => {
                if (err) {
                    console.error('❌ Error checking users count:', err);
                } else {
                    console.log(`\n👥 Total users: ${result.count}`);
                    
                    if (result.count > 0) {
                        // Show sample user
                        db.get("SELECT id, username, is_admin FROM users LIMIT 1", (err, user) => {
                            if (err) {
                                console.error('❌ Error getting sample user:', err);
                            } else {
                                console.log(`Sample user: ${user.username} (Admin: ${user.is_admin})`);
                            }
                            db.close();
                        });
                    } else {
                        console.log('⚠️ No users found - you may need to create an admin account');
                        db.close();
                    }
                }
            });
        });
    }, 1000);
});
