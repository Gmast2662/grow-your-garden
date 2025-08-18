const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./garden_game.db');

console.log('🔍 Checking users in database...');

db.all('SELECT username, id, is_admin FROM users', (err, users) => {
    if (err) {
        console.error('❌ Error:', err);
        return;
    }
    
    if (users.length === 0) {
        console.log('📭 No users found in database');
    } else {
        console.log(`👥 Found ${users.length} user(s):`);
        users.forEach(user => {
            console.log(`  - ${user.username} (ID: ${user.id}) ${user.is_admin ? '[ADMIN]' : ''}`);
        });
    }
    
    db.close();
});
