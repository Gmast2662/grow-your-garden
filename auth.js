const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const sqlite3 = require('sqlite3').verbose();

const router = express.Router();
const db = new sqlite3.Database('./garden_game.db');

// JWT secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Helper function to get client IP
const getClientIP = (req) => {
    return req.headers['x-forwarded-for'] || 
           req.headers['x-real-ip'] || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
           req.ip;
};

// Helper function to generate device fingerprint
const generateDeviceFingerprint = (req) => {
    const userAgent = req.headers['user-agent'] || '';
    const acceptLanguage = req.headers['accept-language'] || '';
    const acceptEncoding = req.headers['accept-encoding'] || '';
    const ip = getClientIP(req);
    
    // Create a simple fingerprint (in production, use a more sophisticated method)
    const fingerprint = `${ip}|${userAgent}|${acceptLanguage}|${acceptEncoding}`;
    return require('crypto').createHash('sha256').update(fingerprint).digest('hex');
};

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const clientIP = getClientIP(req);
        const deviceFingerprint = generateDeviceFingerprint(req);

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

        // Check for suspicious usernames (attempts to impersonate banned users)
        const suspiciousPatterns = ['admin', 'moderator', 'mod', 'owner', 'system', 'root'];
        const lowerUsername = username.toLowerCase();
        if (suspiciousPatterns.some(pattern => lowerUsername.includes(pattern))) {
            return res.status(400).json({ error: 'Username contains restricted terms' });
        }

        // Check if IP address is banned
        db.get('SELECT COUNT(*) as banned_count FROM banned_ips WHERE ip_address = ?', [clientIP], (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (result.banned_count > 0) {
                return res.status(403).json({ error: 'Registration blocked from this IP address' });
            }

            // Check if device fingerprint is banned
            db.get('SELECT COUNT(*) as banned_count FROM banned_devices WHERE device_fingerprint = ?', [deviceFingerprint], (err, result) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }

                if (result.banned_count > 0) {
                    return res.status(403).json({ error: 'Registration blocked from this device' });
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
                            await createUser(username, email, password, clientIP, deviceFingerprint, res);
                        });
                    } else {
                        // Create user without email
                        await createUser(username, null, password, clientIP, deviceFingerprint, res);
                    }
                });
            });
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

async function createUser(username, email, password, clientIP, deviceFingerprint, res) {
    try {
        const userId = uuidv4();
        const hashedPassword = await bcrypt.hash(password, 10);

        db.run(
            'INSERT INTO users (id, username, email, password_hash, registration_ip, device_fingerprint) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, username, email, hashedPassword, clientIP, deviceFingerprint],
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
    const clientIP = getClientIP(req);
    const deviceFingerprint = generateDeviceFingerprint(req);

    // Validate input
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user by username
    db.get('SELECT id, username, email, password_hash, is_banned, ban_reason, registration_ip, device_fingerprint FROM users WHERE username = ?', [username], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Check if user is banned
        if (user.is_banned) {
            // Log failed login attempt from banned user
            db.run('INSERT INTO security_logs (user_id, username, action, ip_address, device_fingerprint, details) VALUES (?, ?, ?, ?, ?, ?)',
                [user.id, username, 'banned_user_login_attempt', clientIP, deviceFingerprint, 'Login attempt from banned account']);
            
            return res.status(403).json({ 
                error: 'Account banned', 
                reason: user.ban_reason || 'No reason provided' 
            });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            // Log failed login attempt
            db.run('INSERT INTO security_logs (user_id, username, action, ip_address, device_fingerprint, details) VALUES (?, ?, ?, ?, ?, ?)',
                [user.id, username, 'failed_login', clientIP, deviceFingerprint, 'Invalid password']);
            
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Check if IP is banned
        db.get('SELECT COUNT(*) as banned_count FROM banned_ips WHERE ip_address = ?', [clientIP], (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (result.banned_count > 0) {
                // Log blocked login attempt
                db.run('INSERT INTO security_logs (user_id, username, action, ip_address, device_fingerprint, details) VALUES (?, ?, ?, ?, ?, ?)',
                    [user.id, username, 'blocked_ip_login', clientIP, deviceFingerprint, 'Login blocked from banned IP']);
                
                return res.status(403).json({ error: 'Login blocked from this IP address' });
            }

            // Check if device is banned
            db.get('SELECT COUNT(*) as banned_count FROM banned_devices WHERE device_fingerprint = ?', [deviceFingerprint], (err, result) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }

                if (result.banned_count > 0) {
                    // Log blocked login attempt
                    db.run('INSERT INTO security_logs (user_id, username, action, ip_address, device_fingerprint, details) VALUES (?, ?, ?, ?, ?, ?)',
                        [user.id, username, 'blocked_device_login', clientIP, deviceFingerprint, 'Login blocked from banned device']);
                    
                    return res.status(403).json({ error: 'Login blocked from this device' });
                }

                // Update last login and IP
                db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP, last_login_ip = ? WHERE id = ?', [clientIP, user.id]);

                // Log successful login
                db.run('INSERT INTO security_logs (user_id, username, action, ip_address, device_fingerprint, details) VALUES (?, ?, ?, ?, ?, ?)',
                    [user.id, username, 'successful_login', clientIP, deviceFingerprint, 'Login successful']);

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
