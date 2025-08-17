const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const sqlite3 = require('sqlite3').verbose();

const router = express.Router();
const db = new sqlite3.Database('./garden_game.db');

// JWT secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        if (username.length < 3 || username.length > 20) {
            return res.status(400).json({ error: 'Username must be between 3 and 20 characters' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if username already exists
        db.get('SELECT id FROM users WHERE username = ?', [username], async (err, existingUser) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (existingUser) {
                return res.status(400).json({ error: 'Username already exists' });
            }

            // Check if email already exists (if provided)
            if (email) {
                db.get('SELECT id FROM users WHERE email = ?', [email], async (err, existingEmail) => {
                    if (err) {
                        return res.status(500).json({ error: 'Database error' });
                    }

                    if (existingEmail) {
                        return res.status(400).json({ error: 'Email already registered' });
                    }

                    // Create user with email
                    await createUser(username, email, password, res);
                });
            } else {
                // Create user without email
                await createUser(username, null, password, res);
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

async function createUser(username, email, password, res) {
    try {
        const userId = uuidv4();
        const hashedPassword = await bcrypt.hash(password, 10);

        db.run(
            'INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)',
            [userId, username, email, hashedPassword],
            function(err) {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Failed to create user' });
                }

                // Generate JWT token
                const token = jwt.sign(
                    { id: userId, username: username },
                    JWT_SECRET,
                    { expiresIn: '7d' }
                );

                res.status(201).json({
                    message: 'User created successfully',
                    token: token,
                    user: {
                        id: userId,
                        username: username,
                        email: email
                    }
                });
            }
        );
    } catch (error) {
        console.error('User creation error:', error);
        res.status(500).json({ error: 'Server error' });
    }
}

// Login user
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user by username
    db.get('SELECT id, username, email, password_hash FROM users WHERE username = ?', [username], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Update last login
        db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token: token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    });
});

// Verify token
router.get('/verify', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Get user data from database
        db.get('SELECT id, username, email, created_at, last_login FROM users WHERE id = ?', [decoded.id], (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (!user) {
                return res.status(401).json({ error: 'User not found' });
            }

            res.json({
                valid: true,
                user: user
            });
        });
    });
});

// Get user profile
router.get('/profile', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        db.get('SELECT id, username, email, created_at, last_login, is_online FROM users WHERE id = ?', [decoded.id], (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json(user);
        });
    });
});

// Update user profile
router.put('/profile', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    const { email } = req.body;

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Only allow email updates for now
        if (email) {
            db.run('UPDATE users SET email = ? WHERE id = ?', [email, decoded.id], function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Failed to update profile' });
                }

                res.json({ message: 'Profile updated successfully' });
            });
        } else {
            res.status(400).json({ error: 'No valid fields to update' });
        }
    });
});

// Change password
router.put('/change-password', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    const { currentPassword, newPassword } = req.body;

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current and new password are required' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Get current password hash
        db.get('SELECT password_hash FROM users WHERE id = ?', [decoded.id], async (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Verify current password
            const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Current password is incorrect' });
            }

            // Hash new password
            const newPasswordHash = await bcrypt.hash(newPassword, 10);

            // Update password
            db.run('UPDATE users SET password_hash = ? WHERE id = ?', [newPasswordHash, decoded.id], function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Failed to update password' });
                }

                res.json({ message: 'Password changed successfully' });
            });
        });
    });
});

module.exports = router;
