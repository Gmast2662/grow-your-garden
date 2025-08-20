const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'garden_game.db');

// Create database connection
const db = new sqlite3.Database(dbPath);

console.log('🔍 Testing Admin Panel Database Queries...\n');

// Test 1: Check if tables exist
console.log('📋 Checking table existence...');
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
        console.error('❌ Error checking tables:', err.message);
        return;
    }
    
    console.log('✅ Tables found:', tables.map(t => t.name));
    
    // Test 2: Check users table structure
    console.log('\n👥 Checking users table structure...');
    db.all("PRAGMA table_info(users)", (err, columns) => {
        if (err) {
            console.error('❌ Error checking users table:', err.message);
            return;
        }
        
        console.log('✅ Users table columns:', columns.map(c => c.name));
        
        // Test 3: Check if admin exists
        console.log('\n🔐 Checking for admin user...');
        db.get("SELECT COUNT(*) as count FROM users WHERE is_admin = 1", (err, row) => {
            if (err) {
                console.error('❌ Error checking admin:', err.message);
                return;
            }
            
            console.log(`✅ Admin users found: ${row.count}`);
            
            // Test 4: Check total users
            console.log('\n📊 Checking total users...');
            db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
                if (err) {
                    console.error('❌ Error counting users:', err.message);
                    return;
                }
                
                console.log(`✅ Total users: ${row.count}`);
                
                // Test 5: Check gardens table
                console.log('\n🌱 Checking gardens table...');
                db.get("SELECT COUNT(*) as count FROM gardens", (err, row) => {
                    if (err) {
                        console.error('❌ Error counting gardens:', err.message);
                        return;
                    }
                    
                    console.log(`✅ Total gardens: ${row.count}`);
                    
                    // Test 6: Check security tables
                    console.log('\n🔒 Checking security tables...');
                    db.get("SELECT COUNT(*) as count FROM banned_ips", (err, row) => {
                        if (err) {
                            console.error('❌ Error checking banned_ips:', err.message);
                        } else {
                            console.log(`✅ Banned IPs: ${row.count}`);
                        }
                        
                        db.get("SELECT COUNT(*) as count FROM banned_devices", (err, row) => {
                            if (err) {
                                console.error('❌ Error checking banned_devices:', err.message);
                            } else {
                                console.log(`✅ Banned devices: ${row.count}`);
                            }
                            
                            db.get("SELECT COUNT(*) as count FROM security_logs", (err, row) => {
                                if (err) {
                                    console.error('❌ Error checking security_logs:', err.message);
                                } else {
                                    console.log(`✅ Security logs: ${row.count}`);
                                }
                                
                                console.log('\n✅ Database test complete!');
                                db.close();
                            });
                        });
                    });
                });
            });
        });
    });
});
