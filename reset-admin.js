const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');

// Database connection
const db = new sqlite3.Database('./garden_game.db');

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

async function resetAdmin() {
    const username = 'AviDev'; // Change this to your desired username
    const password = 'GardenDevAgmast2662'; // Change this to your desired password
    const email = 'avigmast@icloud.com'; // Change this to your email
    
    console.log('🗑️ Resetting admin account...');
    console.log(`Username: ${username}`);
    console.log(`Email: ${email}`);
    
    // Delete all existing users
    db.run('DELETE FROM users', (err) => {
        if (err) {
            console.error('❌ Error deleting users:', err);
            return;
        }
        
        console.log('✅ All users deleted from database');
        
        // Create fresh admin account
        const userId = uuidv4();
        bcrypt.hash(password, 10).then(hashedPassword => {
            db.run(
                'INSERT INTO users (id, username, email, password_hash, is_admin) VALUES (?, ?, ?, ?, 1)',
                [userId, username, email, hashedPassword],
                function(err) {
                    if (err) {
                        console.error('❌ Error creating admin:', err);
                        return;
                    }
                    
                    console.log('✅ Fresh admin account created successfully!');
                    console.log(`User ID: ${userId}`);
                    console.log(`Username: ${username}`);
                    console.log(`Password: ${password}`);
                    console.log('\n🔐 You can now login to the admin panel at:');
                    console.log('https://your-replit-url.replit.dev/admin-panel');
                    console.log('\n📝 Use these credentials:');
                    console.log(`Username: ${username}`);
                    console.log(`Password: ${password}`);
                    
                    db.close();
                }
            );
        }).catch(error => {
            console.error('❌ Password hashing error:', error);
        });
    });
}

resetAdmin();
