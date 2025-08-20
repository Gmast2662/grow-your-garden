const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const router = express.Router();

// Database connection
const db = new sqlite3.Database('./garden_game.db');

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Function to generate device fingerprint
function generateDeviceFingerprint(req) {
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket?.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';
    const acceptHeaders = req.headers['accept'] || '';
    const acceptLanguage = req.headers['accept-language'] || '';
    const acceptEncoding = req.headers['accept-encoding'] || '';
    
    // Combine all device characteristics
    const deviceString = `${ipAddress}|${userAgent}|${acceptHeaders}|${acceptLanguage}|${acceptEncoding}`;
    
    // Generate SHA256 hash
    const fingerprint = crypto.createHash('sha256').update(deviceString).digest('hex');
    
    console.log(`🔍 Generated device fingerprint: ${fingerprint.substring(0, 16)}... for IP: ${ipAddress}`);
    
    return fingerprint;
}

// Register new user
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    try {
        // Check if username already exists
        db.get('SELECT id FROM users WHERE username = ?', [username], async (err, existingUser) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (existingUser) {
                return res.status(400).json({ error: 'Username already exists' });
            }

            // Check if email already exists (only if email is provided)
            if (email) {
                db.get('SELECT id FROM users WHERE email = ?', [email], async (err, existingEmail) => {
                    if (err) {
                        return res.status(500).json({ error: 'Database error' });
                    }

                    if (existingEmail) {
                        return res.status(400).json({ error: 'Email already exists' });
                    }

                    // Continue with user creation
                    createUser();
                });
            } else {
                // No email provided, continue with user creation
                createUser();
            }

            // Function to create user
            async function createUser() {
                // Hash password
                const passwordHash = await bcrypt.hash(password, 10);

                // Create user
                const userId = uuidv4();
                const ipAddress = req.ip || req.connection.remoteAddress;
                const deviceFingerprint = generateDeviceFingerprint(req);

                db.run(
                    'INSERT INTO users (id, username, email, password_hash, registration_ip, device_fingerprint) VALUES (?, ?, ?, ?, ?, ?)',
                    [userId, username, email || null, passwordHash, ipAddress, deviceFingerprint],
                    function(err) {
                        if (err) {
                            return res.status(500).json({ error: 'Failed to create user' });
                        }

                        // Log security action
                        db.run(
                            'INSERT INTO security_logs (user_id, username, action, ip_address, details) VALUES (?, ?, ?, ?, ?)',
                            [userId, username, 'user_registration', ipAddress, 'New user registration']
                        );

                        console.log(`👤 NEW ACCOUNT CREATED: ${username} (ID: ${userId}) from IP: ${ipAddress}`);

                        res.status(201).json({
                            message: 'User registered successfully',
                            userId: userId
                        });
                    }
                );
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        // Check if user is muted before password verification
        db.get(`
            SELECT u.id, u.username, u.email, u.password_hash, u.is_banned, u.ban_reason, u.is_admin,
                   um.muted_until, um.mute_reason
            FROM users u
            LEFT JOIN user_mutes um ON u.id = um.user_id 
                AND (um.muted_until IS NULL OR um.muted_until > datetime('now', 'localtime'))
            WHERE u.username = ?
        `, [username], async (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (!user) {
                return res.status(401).json({ error: 'Invalid username or password' });
            }

            if (user.is_banned) {
                console.log(`🚫 LOGIN BLOCKED - Banned user ${username} attempted login: ${user.ban_reason || 'No reason'}`);
                return res.status(403).json({ 
                    error: 'Account banned', 
                    reason: user.ban_reason || 'No reason provided' 
                });
            }

            // Check if user is muted (permanent mutes should not block login)
            if (user.muted_until !== null || user.mute_reason !== null) {
                if (user.muted_until !== null) {
                    // Temporary mute - check if still active
                    const now = new Date();
                    const muteUntil = new Date(user.muted_until);
                    if (muteUntil > now) {
                        console.log(`🚫 LOGIN BLOCKED - Temporarily muted user ${username} attempted login until ${muteUntil.toLocaleString()}: ${user.mute_reason || 'No reason'}`);
                        return res.status(403).json({ 
                            error: 'Account muted', 
                            reason: user.mute_reason,
                            muted_until: user.muted_until
                        });
                    }
                } else {
                    // Permanent mute - allow login but log it
                    console.log(`🔇 LOGIN ALLOWED - Permanently muted user ${username} logged in: ${user.mute_reason || 'No reason'}`);
                }
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Invalid username or password' });
            }

            // Generate JWT token
            const token = jwt.sign(
                { id: user.id, username: user.username, isAdmin: !!user.is_admin },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            // Update last login and device fingerprint
            const ipAddress = req.ip || req.connection.remoteAddress;
            const deviceFingerprint = generateDeviceFingerprint(req);
            db.run(
                'UPDATE users SET last_login = CURRENT_TIMESTAMP, last_login_ip = ?, device_fingerprint = ? WHERE id = ?',
                [ipAddress, deviceFingerprint, user.id]
            );

            // Log security action
            db.run(
                'INSERT INTO security_logs (user_id, username, action, ip_address, details) VALUES (?, ?, ?, ?, ?)',
                [user.id, user.username, 'user_login', ipAddress, 'Successful login']
            );

            console.log(`🔑 USER LOGIN: ${username} (ID: ${user.id}) from IP: ${ipAddress}${user.is_admin ? ' [ADMIN]' : ''}`);

            res.json({
                message: 'Login successful',
                token: token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    isAdmin: !!user.is_admin
                }
            });
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
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
