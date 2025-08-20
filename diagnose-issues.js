const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to the database
const dbPath = path.join(__dirname, 'garden_game.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 DIAGNOSING ALL REPORTED ISSUES...\n');

// Test 1: Check timezone handling
console.log('1️⃣ TESTING TIMEZONE HANDLING:');
const testDate = new Date('2025-08-18T21:01:00.000Z');
console.log(`   UTC timestamp: ${testDate.toISOString()}`);
console.log(`   PST display: ${testDate.toLocaleString('en-US', {timeZone: 'America/Los_Angeles'})}`);
console.log(`   Local display: ${testDate.toLocaleString()}`);
console.log('   ✅ Timezone conversion should work correctly\n');

// Test 2: Check database tables
console.log('2️⃣ CHECKING DATABASE TABLES:');
const requiredTables = [
    'users', 'gardens', 'banned_ips', 'banned_devices', 
    'admin_logs', 'user_mutes', 'announcements', 'filter_words'
];

requiredTables.forEach(table => {
    db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='${table}'`, (err, result) => {
        if (err) {
            console.log(`   ❌ Error checking ${table}: ${err.message}`);
        } else if (result) {
            console.log(`   ✅ ${table} table exists`);
        } else {
            console.log(`   ❌ ${table} table missing`);
        }
    });
});

// Test 3: Check security data
console.log('\n3️⃣ CHECKING SECURITY DATA:');
db.all('SELECT COUNT(*) as count FROM banned_ips', (err, result) => {
    if (err) {
        console.log(`   ❌ Error checking banned_ips: ${err.message}`);
    } else {
        console.log(`   📊 Banned IPs: ${result[0].count}`);
    }
});

db.all('SELECT COUNT(*) as count FROM banned_devices', (err, result) => {
    if (err) {
        console.log(`   ❌ Error checking banned_devices: ${err.message}`);
    } else {
        console.log(`   📊 Banned Devices: ${result[0].count}`);
    }
});

db.all('SELECT COUNT(*) as count FROM admin_logs', (err, result) => {
    if (err) {
        console.log(`   ❌ Error checking admin_logs: ${err.message}`);
    } else {
        console.log(`   📊 Admin Logs: ${result[0].count}`);
    }
});

// Test 4: Check user mutes
console.log('\n4️⃣ CHECKING USER MUTES:');
db.all('SELECT COUNT(*) as count FROM user_mutes', (err, result) => {
    if (err) {
        console.log(`   ❌ Error checking user_mutes: ${err.message}`);
    } else {
        console.log(`   📊 Muted Users: ${result[0].count}`);
    }
});

// Test 5: Check total gardens stat
console.log('\n5️⃣ CHECKING TOTAL GARDENS STAT:');
db.get('SELECT COUNT(DISTINCT user_id) as total_gardens FROM gardens WHERE user_id IS NOT NULL', (err, result) => {
    if (err) {
        console.log(`   ❌ Error checking total gardens: ${err.message}`);
    } else {
        console.log(`   📊 Total Gardens: ${result.total_gardens || 0}`);
    }
});

// Test 6: Check sample data
console.log('\n6️⃣ CHECKING SAMPLE DATA:');
db.all('SELECT * FROM admin_logs LIMIT 3', (err, rows) => {
    if (err) {
        console.log(`   ❌ Error checking admin_logs data: ${err.message}`);
    } else if (rows.length > 0) {
        console.log(`   📊 Sample admin_logs entries: ${rows.length}`);
        rows.forEach((row, i) => {
            console.log(`      ${i+1}. ${row.action} by ${row.admin_username} at ${row.created_at}`);
        });
    } else {
        console.log(`   📊 No admin_logs entries found`);
    }
});

db.all('SELECT * FROM user_mutes LIMIT 3', (err, rows) => {
    if (err) {
        console.log(`   ❌ Error checking user_mutes data: ${err.message}`);
    } else if (rows.length > 0) {
        console.log(`   📊 Sample user_mutes entries: ${rows.length}`);
        rows.forEach((row, i) => {
            console.log(`      ${i+1}. User ${row.user_id} muted until ${row.muted_until} by ${row.muted_by_admin_username}`);
        });
    } else {
        console.log(`   📊 No user_mutes entries found`);
    }
});

// Test 7: Check users table structure
console.log('\n7️⃣ CHECKING USERS TABLE STRUCTURE:');
db.all("PRAGMA table_info(users)", (err, rows) => {
    if (err) {
        console.log(`   ❌ Error checking users table structure: ${err.message}`);
    } else {
        console.log(`   📊 Users table columns:`);
        rows.forEach(row => {
            console.log(`      - ${row.name} (${row.type})`);
        });
    }
});

// Close database after a delay to allow all queries to complete
setTimeout(() => {
    console.log('\n🔍 DIAGNOSIS COMPLETE!');
    console.log('\n📋 SUMMARY OF ISSUES TO CHECK:');
    console.log('   1. If timezone shows wrong times, the conversion might be working but user expects different timezone');
    console.log('   2. If security tab is empty, check if tables exist and have data');
    console.log('   3. If IP bans don\'t work, check if banned_ips table exists and has correct structure');
    console.log('   4. If mutes don\'t work, check if user_mutes table exists and has correct structure');
    console.log('   5. If total gardens stat is wrong, check if gardens table has correct data');
    console.log('\n💡 NEXT STEPS:');
    console.log('   1. Run this script to see the actual state of your database');
    console.log('   2. Check the console output for any ❌ errors');
    console.log('   3. If tables are missing, run the comprehensive-test.js script');
    console.log('   4. If data is missing, the comprehensive-test.js script will add test data');
    
    db.close();
}, 2000);
