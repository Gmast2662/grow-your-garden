const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');

// Database connection
const db = new sqlite3.Database('./garden_game.db');

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

async function createAdmin() {
    const username = 'AviDev'; // Change this to your desired username
    const password = 'GardenDevAgmast2662'; // Change this to your desired password
    const email = 'avigmast@icloud.com'; // Change this to your email
    
    console.log('🌱 Creating admin account...');
    console.log(`Username: ${username}`);
    console.log(`Email: ${email}`);
    
    // First, ensure the users table has the is_admin column
    db.run(`ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.error('❌ Error adding is_admin column:', err);
            return;
        }
        
        // Check if admin already exists
        db.get('SELECT COUNT(*) as admin_count FROM users WHERE is_admin = 1', (err, result) => {
            if (err) {
                console.error('❌ Database error:', err);
                return;
            }
            
            if (result.admin_count > 0) {
                console.log('❌ Admin account already exists');
                return;
            }
            
            // Create admin account
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
                        
                        console.log('✅ Admin account created successfully!');
                        console.log(`User ID: ${userId}`);
                        console.log(`Username: ${username}`);
                        console.log(`Password: ${password}`);
                        console.log('\n🔐 You can now login to the admin panel at:');
                        console.log('http://localhost:3000/admin-panel');
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
    });
}

createAdmin();
