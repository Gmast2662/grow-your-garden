const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Database connection
const db = new sqlite3.Database('./garden_game.db');

// WebSocket maps (will be set by server.js)
let userSockets = new Map();
let onlineUsers = new Map();

// Function to set WebSocket maps from server
const setWebSocketMaps = (sockets, users) => {
    userSockets = sockets;
    onlineUsers = users;
};

// Function to disconnect user via WebSocket
const disconnectUser = (userId) => {
    const socket = userSockets.get(userId);
    if (socket) {
        socket.emit('admin_action', {
            type: 'force_logout',
            message: 'Your account has been modified by an administrator. Please log in again.'
        });
        socket.disconnect();
        console.log(`🔌 Admin forced logout for user: ${userId}`);
    }
};

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Admin authentication middleware
const authenticateAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Check if user is admin
        db.get('SELECT is_admin FROM users WHERE id = ?', [decoded.userId], (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (!user || !user.is_admin) {
                return res.status(403).json({ error: 'Admin access required' });
            }
            
            req.user = decoded;
            next();
        });
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Admin login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }
    
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        if (!user.is_admin) {
            return res.status(403).json({ error: 'Admin access required' });
        }
        
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const token = jwt.sign(
            { userId: user.id, username: user.username, isAdmin: true },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            message: 'Admin login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                isAdmin: user.is_admin
            }
        });
    });
});

// Get all users (admin only)
router.get('/users', authenticateAdmin, (req, res) => {
    db.all(`
        SELECT 
            id, username, email, created_at, last_login, is_online, is_banned, ban_reason, is_admin
        FROM users 
        ORDER BY created_at DESC
    `, (err, users) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        res.json({ users });
    });
});

// Get user details (admin only)
router.get('/users/:userId', authenticateAdmin, (req, res) => {
    const { userId } = req.params;
    
    db.get(`
        SELECT 
            id, username, email, created_at, last_login, is_online, is_banned, ban_reason, is_admin
        FROM users 
        WHERE id = ?
    `, [userId], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Get user's garden data
        db.get('SELECT * FROM gardens WHERE user_id = ?', [userId], (err, garden) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            
            // Get user's friends
            db.all(`
                SELECT f.*, u.username as friend_username 
                FROM friends f 
                JOIN users u ON f.friend_id = u.id 
                WHERE f.user_id = ?
            `, [userId], (err, friends) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }
                
                // Get user's chat messages
                db.all(`
                    SELECT * FROM chat_messages 
                    WHERE sender_id = ? 
                    ORDER BY created_at DESC 
                    LIMIT 50
                `, [userId], (err, messages) => {
                    if (err) {
                        return res.status(500).json({ error: 'Database error' });
                    }
                    
                    res.json({
                        user,
                        garden: garden || null,
                        friends: friends || [],
                        recentMessages: messages || []
                    });
                });
            });
        });
    });
});

// Ban user (admin only)
router.post('/users/:userId/ban', authenticateAdmin, (req, res) => {
    const { userId } = req.params;
    const { reason } = req.body;
    
    if (!reason) {
        return res.status(400).json({ error: 'Ban reason required' });
    }
    
    db.run(
        'UPDATE users SET is_banned = 1, ban_reason = ? WHERE id = ?',
        [reason, userId],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (this.changes === 0) {
                return res.status(404).json({ error: 'User not found' });
            }
            
            // Disconnect user if online
            disconnectUser(userId);
            
            res.json({ 
                message: 'User banned successfully',
                userId,
                reason
            });
        }
    );
});

// Unban user (admin only)
router.post('/users/:userId/unban', authenticateAdmin, (req, res) => {
    const { userId } = req.params;
    
    db.run(
        'UPDATE users SET is_banned = 0, ban_reason = NULL WHERE id = ?',
        [userId],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (this.changes === 0) {
                return res.status(404).json({ error: 'User not found' });
            }
            
            res.json({ 
                message: 'User unbanned successfully',
                userId
            });
        }
    );
});

// Delete user account (admin only)
router.delete('/users/:userId', authenticateAdmin, (req, res) => {
    const { userId } = req.params;
    
    // Start a transaction to delete all user data
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        // Delete user's chat messages
        db.run('DELETE FROM chat_messages WHERE sender_id = ? OR receiver_id = ?', [userId, userId], (err) => {
            if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: 'Database error' });
            }
        });
        
        // Delete user's friends
        db.run('DELETE FROM friends WHERE user_id = ? OR friend_id = ?', [userId, userId], (err) => {
            if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: 'Database error' });
            }
        });
        
        // Delete user's garden
        db.run('DELETE FROM gardens WHERE user_id = ?', [userId], (err) => {
            if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: 'Database error' });
            }
        });
        
        // Delete user account
        db.run('DELETE FROM users WHERE id = ?', [userId], function(err) {
            if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (this.changes === 0) {
                db.run('ROLLBACK');
                return res.status(404).json({ error: 'User not found' });
            }
            
            db.run('COMMIT');
            
            // Disconnect user if online
            disconnectUser(userId);
            
            res.json({ 
                message: 'User account deleted successfully',
                userId
            });
        });
    });
});

// Reset user password (admin only)
router.post('/users/:userId/reset-password', authenticateAdmin, async (req, res) => {
    const { userId } = req.params;
    const { newPassword } = req.body;
    
    if (!newPassword) {
        return res.status(400).json({ error: 'New password required' });
    }
    
    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        db.run(
            'UPDATE users SET password_hash = ? WHERE id = ?',
            [hashedPassword, userId],
            function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }
                
                if (this.changes === 0) {
                    return res.status(404).json({ error: 'User not found' });
                }
                
                // Disconnect user if online
                disconnectUser(userId);
                
                res.json({ 
                    message: 'Password reset successfully',
                    userId
                });
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'Password hashing error' });
    }
});

// Make user admin (admin only)
router.post('/users/:userId/make-admin', authenticateAdmin, (req, res) => {
    const { userId } = req.params;
    
    db.run(
        'UPDATE users SET is_admin = 1 WHERE id = ?',
        [userId],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (this.changes === 0) {
                return res.status(404).json({ error: 'User not found' });
            }
            
            res.json({ 
                message: 'User made admin successfully',
                userId
            });
        }
    );
});

// Remove admin privileges (admin only)
router.post('/users/:userId/remove-admin', authenticateAdmin, (req, res) => {
    const { userId } = req.params;
    
    // Prevent removing admin from self
    if (userId === req.user.userId) {
        return res.status(400).json({ error: 'Cannot remove admin privileges from yourself' });
    }
    
    db.run(
        'UPDATE users SET is_admin = 0 WHERE id = ?',
        [userId],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (this.changes === 0) {
                return res.status(404).json({ error: 'User not found' });
            }
            
            res.json({ 
                message: 'Admin privileges removed successfully',
                userId
            });
        }
    );
});

// Get server statistics (admin only)
router.get('/stats', authenticateAdmin, (req, res) => {
    db.get('SELECT COUNT(*) as total_users FROM users', (err, userCount) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        db.get('SELECT COUNT(*) as online_users FROM users WHERE is_online = 1', (err, onlineCount) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            
            db.get('SELECT COUNT(*) as banned_users FROM users WHERE is_banned = 1', (err, bannedCount) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }
                
                db.get('SELECT COUNT(*) as total_gardens FROM gardens', (err, gardenCount) => {
                    if (err) {
                        return res.status(500).json({ error: 'Database error' });
                    }
                    
                    db.get('SELECT COUNT(*) as total_messages FROM chat_messages', (err, messageCount) => {
                        if (err) {
                            return res.status(500).json({ error: 'Database error' });
                        }
                        
                        res.json({
                            stats: {
                                totalUsers: userCount.total_users,
                                onlineUsers: onlineCount.online_users,
                                bannedUsers: bannedCount.banned_users,
                                totalGardens: gardenCount.total_gardens,
                                totalMessages: messageCount.total_messages
                            }
                        });
                    });
                });
            });
        });
    });
});

// Create admin account (first time setup)
router.post('/setup-admin', async (req, res) => {
    const { username, password, email } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }
    
    // Check if any admin exists
    db.get('SELECT COUNT(*) as admin_count FROM users WHERE is_admin = 1', (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (result.admin_count > 0) {
            return res.status(403).json({ error: 'Admin account already exists' });
        }
        
        // Create admin account
        const userId = uuidv4();
        bcrypt.hash(password, 10).then(hashedPassword => {
            db.run(
                'INSERT INTO users (id, username, email, password_hash, is_admin) VALUES (?, ?, ?, ?, 1)',
                [userId, username, email || null, hashedPassword],
                function(err) {
                    if (err) {
                        return res.status(500).json({ error: 'Database error' });
                    }
                    
                    const token = jwt.sign(
                        { userId, username, isAdmin: true },
                        JWT_SECRET,
                        { expiresIn: '24h' }
                    );
                    
                    res.json({
                        message: 'Admin account created successfully',
                        token,
                        user: {
                            id: userId,
                            username,
                            isAdmin: true
                        }
                    });
                }
            );
        }).catch(error => {
            res.status(500).json({ error: 'Password hashing error' });
        });
    });
});

// Send announcement (admin only)
router.post('/announce', authenticateAdmin, (req, res) => {
    const { message } = req.body;
    
    if (!message) {
        return res.status(400).json({ error: 'Announcement message required' });
    }
    
    // Save announcement to database
    db.run(
        'INSERT INTO announcements (admin_id, admin_username, message) VALUES (?, ?, ?)',
        [req.user.userId, req.user.username, message],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            
            const announcementData = {
                id: this.lastID,
                adminUsername: req.user.username,
                message: message,
                timestamp: new Date().toISOString()
            };
            
            // Broadcast to all online users
            userSockets.forEach((socket) => {
                socket.emit('admin_announcement', announcementData);
            });
            
            console.log(`📢 Admin announcement from ${req.user.username}: ${message}`);
            
            res.json({
                message: 'Announcement sent successfully',
                announcement: announcementData
            });
        }
    );
});

// Get recent announcements (admin only)
router.get('/announcements', authenticateAdmin, (req, res) => {
    db.all(`
        SELECT id, admin_username, message, is_active, created_at
        FROM announcements 
        ORDER BY created_at DESC 
        LIMIT 50
    `, (err, announcements) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        res.json({ announcements });
    });
});

// Deactivate announcement (admin only)
router.post('/announcements/:id/deactivate', authenticateAdmin, (req, res) => {
    const { id } = req.params;
    
    db.run(
        'UPDATE announcements SET is_active = 0 WHERE id = ?',
        [id],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Announcement not found' });
            }
            
            res.json({ message: 'Announcement deactivated successfully' });
        }
    );
});

// Export the router and the setWebSocketMaps function
module.exports = { router, setWebSocketMaps };
