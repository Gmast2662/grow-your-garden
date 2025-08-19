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
const disconnectUser = (userId, reason = null) => {
    const socket = userSockets.get(userId);
    if (socket) {
        let message = 'Your account has been modified by an administrator. Please log in again.';
        if (reason) {
            message = reason;
        }
        
        socket.emit('admin_action', {
            type: 'force_logout',
            message: message
        });
        socket.disconnect();
        console.log(`🔌 Admin forced logout for user: ${userId}${reason ? ` - ${reason}` : ''}`);
    }
};

// Function to log admin actions
const logAdminAction = (adminId, adminUsername, action, targetUserId = null, targetUsername = null, details = null, ipAddress = null) => {
    db.run(
        'INSERT INTO admin_logs (admin_id, admin_username, action, target_user_id, target_username, details, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [adminId, adminUsername, action, targetUserId, targetUsername, details, ipAddress],
        function(err) {
            if (err) {
                console.error('❌ Error logging admin action:', err);
            } else {
                console.log(`📝 Admin log: ${adminUsername} ${action} ${targetUsername || ''}`);
            }
        }
    );
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
        db.get('SELECT is_admin FROM users WHERE id = ?', [decoded.id], (err, user) => {
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
            { id: user.id, username: user.username, isAdmin: true },
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
            id, username, email, created_at, last_login, last_login_ip, registration_ip, device_fingerprint,
            is_online, is_banned, ban_reason, is_admin
        FROM users 
        ORDER BY created_at DESC
    `, (err, users) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        res.json({ users });
    });
});

// Ban IP address (admin only)
router.post('/ban-ip', authenticateAdmin, (req, res) => {
    const { ipAddress, reason } = req.body;
    
    if (!ipAddress) {
        return res.status(400).json({ error: 'IP address is required' });
    }
    
    // Validate IP address format
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(ipAddress)) {
        return res.status(400).json({ error: 'Invalid IP address format' });
    }
    
    db.run(
        'INSERT OR REPLACE INTO banned_ips (ip_address, reason, banned_by_admin_id, banned_by_admin_username) VALUES (?, ?, ?, ?)',
        [ipAddress, reason || null, req.user.id, req.user.username],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            
            // Log the action
            logAdminAction(
                req.user.id,
                req.user.username,
                'banned IP address',
                null,
                null,
                `IP: ${ipAddress}${reason ? ` - Reason: ${reason}` : ''}`,
                req.ip
            );
            
            // Disconnect all users from this IP
            userSockets.forEach((socket, userId) => {
                if (socket.handshake.address === ipAddress) {
                    socket.emit('admin_action', {
                        type: 'force_logout',
                        message: 'Your IP address has been banned from this server.'
                    });
                    socket.disconnect();
                }
            });
            
            res.json({
                message: 'IP address banned successfully',
                ipAddress,
                reason
            });
        }
    );
});

// Unban IP address (admin only)
router.post('/unban-ip', authenticateAdmin, (req, res) => {
    const { ipAddress } = req.body;
    
    if (!ipAddress) {
        return res.status(400).json({ error: 'IP address is required' });
    }
    
    db.run(
        'DELETE FROM banned_ips WHERE ip_address = ?',
        [ipAddress],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (this.changes === 0) {
                return res.status(404).json({ error: 'IP address not found in ban list' });
            }
            
            // Log the action
            logAdminAction(
                req.user.id,
                req.user.username,
                'unbanned IP address',
                null,
                null,
                `IP: ${ipAddress}`,
                req.ip
            );
            
            res.json({
                message: 'IP address unbanned successfully',
                ipAddress
            });
        }
    );
});

// Ban device (admin only)
router.post('/ban-device', authenticateAdmin, (req, res) => {
    const { deviceFingerprint, reason } = req.body;
    
    if (!deviceFingerprint) {
        return res.status(400).json({ error: 'Device fingerprint is required' });
    }
    
    db.run(
        'INSERT OR REPLACE INTO banned_devices (device_fingerprint, reason, banned_by_admin_id, banned_by_admin_username) VALUES (?, ?, ?, ?)',
        [deviceFingerprint, reason || null, req.user.id, req.user.username],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            
            // Log the action
            logAdminAction(
                req.user.id,
                req.user.username,
                'banned device',
                null,
                null,
                `Device: ${deviceFingerprint}${reason ? ` - Reason: ${reason}` : ''}`,
                req.ip
            );
            
            // Disconnect all users with this device fingerprint
            userSockets.forEach((socket, userId) => {
                // Note: This would require storing device fingerprint in socket data
                // For now, we'll just log the action
            });
            
            res.json({
                message: 'Device banned successfully',
                deviceFingerprint,
                reason
            });
        }
    );
});

// Unban device (admin only)
router.post('/unban-device', authenticateAdmin, (req, res) => {
    const { deviceFingerprint } = req.body;
    
    if (!deviceFingerprint) {
        return res.status(400).json({ error: 'Device fingerprint is required' });
    }
    
    db.run(
        'DELETE FROM banned_devices WHERE device_fingerprint = ?',
        [deviceFingerprint],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Device not found in ban list' });
            }
            
            // Log the action
            logAdminAction(
                req.user.id,
                req.user.username,
                'unbanned device',
                null,
                null,
                `Device: ${deviceFingerprint}`,
                req.ip
            );
            
            res.json({
                message: 'Device unbanned successfully',
                deviceFingerprint
            });
        }
    );
});

// Get banned IPs (admin only)
router.get('/banned-ips', authenticateAdmin, (req, res) => {
    db.all(`
        SELECT 
            ip_address,
            reason,
            banned_by_admin_username,
            created_at
        FROM banned_ips 
        ORDER BY created_at DESC
    `, (err, bannedIPs) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        res.json({ bannedIPs });
    });
});

// Get banned devices (admin only)
router.get('/banned-devices', authenticateAdmin, (req, res) => {
    db.all(`
        SELECT 
            device_fingerprint,
            reason,
            banned_by_admin_username,
            created_at
        FROM banned_devices 
        ORDER BY created_at DESC
    `, (err, bannedDevices) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        res.json({ bannedDevices });
    });
});

// Get security logs (admin only)
router.get('/security-logs', authenticateAdmin, (req, res) => {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    
    db.all(`
        SELECT 
            username,
            action,
            ip_address,
            device_fingerprint,
            details,
            created_at
        FROM security_logs 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
    `, [limit, offset], (err, securityLogs) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        res.json({ securityLogs });
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
    const { reason, banType = 'user', banIP = false, banDevice = false } = req.body;
    
    if (!reason) {
        return res.status(400).json({ error: 'Ban reason required' });
    }
    
    // Determine ban options based on banType
    let shouldBanUser = false;
    let shouldBanIP = false;
    let shouldBanDevice = false;
    
    switch(banType) {
        case 'user':
            shouldBanUser = true;
            break;
        case 'ip':
            shouldBanIP = true;
            break;
        case 'device':
            shouldBanDevice = true;
            break;
        case 'all':
            shouldBanUser = true;
            shouldBanIP = true;
            shouldBanDevice = true;
            break;
        default:
            return res.status(400).json({ error: 'Invalid ban type. Use: user, ip, device, or all' });
    }
    
    // Get target user info for logging
    db.get('SELECT username, registration_ip, device_fingerprint FROM users WHERE id = ?', [userId], (err, targetUser) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (!targetUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Ban user account if requested
        if (shouldBanUser) {
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
                }
            );
        }
        
        // Log the action
        const banDetails = [];
        if (shouldBanUser) banDetails.push('User banned');
        if (shouldBanIP) banDetails.push('IP banned');
        if (shouldBanDevice) banDetails.push('Device banned');
        
        logAdminAction(
            req.user.id,
            req.user.username,
            'banned user',
            userId,
            targetUser.username,
            `Reason: ${reason} | Types: ${banDetails.join(', ')}`,
            req.ip
        );
        
        // Ban IP address if requested and available
        if (shouldBanIP && targetUser.registration_ip) {
            db.run(
                'INSERT OR REPLACE INTO banned_ips (ip_address, reason, banned_by_admin_id, banned_by_admin_username) VALUES (?, ?, ?, ?)',
                [targetUser.registration_ip, `User ban: ${reason}`, req.user.id, req.user.username]
            );
        }
        
        // Ban device if requested and available
        if (shouldBanDevice && targetUser.device_fingerprint) {
            db.run(
                'INSERT OR REPLACE INTO banned_devices (device_fingerprint, reason, banned_by_admin_id, banned_by_admin_username) VALUES (?, ?, ?, ?)',
                [targetUser.device_fingerprint, `User ban: ${reason}`, req.user.id, req.user.username]
            );
        }
        
        res.json({ 
            message: 'Ban executed successfully',
            userId,
            reason,
            banType,
            userBanned: shouldBanUser,
            ipBanned: shouldBanIP && targetUser.registration_ip,
            deviceBanned: shouldBanDevice && targetUser.device_fingerprint
        });
    });
});

// Unban user (admin only)
router.post('/users/:userId/unban', authenticateAdmin, (req, res) => {
    const { userId } = req.params;
    
    // Get target user info for logging
    db.get('SELECT username FROM users WHERE id = ?', [userId], (err, targetUser) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (!targetUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        
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
                
                // Log the action
                logAdminAction(
                    req.user.id,
                    req.user.username,
                    'unbanned user',
                    userId,
                    targetUser.username,
                    null,
                    req.ip
                );
                
                res.json({ 
                    message: 'User unbanned successfully',
                    userId
                });
            }
        );
    });
});

// Delete user account (admin only)
router.delete('/users/:userId', authenticateAdmin, (req, res) => {
    const { userId } = req.params;
    
    // Get target user info for logging
    db.get('SELECT username FROM users WHERE id = ?', [userId], (err, targetUser) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (!targetUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        
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
                
                // Log the action
                logAdminAction(
                    req.user.id,
                    req.user.username,
                    'deleted user account',
                    userId,
                    targetUser.username,
                    'All user data deleted (messages, friends, garden)',
                    req.ip
                );
                
                // Disconnect user if online
                disconnectUser(userId);
                
                res.json({ 
                    message: 'User account deleted successfully',
                    userId
                });
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
    
    // Get target user info for logging
    db.get('SELECT username FROM users WHERE id = ?', [userId], async (err, targetUser) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (!targetUser) {
            return res.status(404).json({ error: 'User not found' });
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
                    
                    // Log the action
                    logAdminAction(
                        req.user.id,
                        req.user.username,
                        'reset user password',
                        userId,
                        targetUser.username,
                        'Password changed by admin',
                        req.ip
                    );
                    
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
});

// Make user admin (admin only)
router.post('/users/:userId/make-admin', authenticateAdmin, (req, res) => {
    const { userId } = req.params;
    
    // Get target user info for logging
    db.get('SELECT username FROM users WHERE id = ?', [userId], (err, targetUser) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (!targetUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        
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
                
                // Log the action
                logAdminAction(
                    req.user.id,
                    req.user.username,
                    'made user admin',
                    userId,
                    targetUser.username,
                    'Admin privileges granted',
                    req.ip
                );
                
                res.json({ 
                    message: 'User made admin successfully',
                    userId
                });
            }
        );
    });
});

// Remove admin privileges (admin only)
router.post('/users/:userId/remove-admin', authenticateAdmin, (req, res) => {
    const { userId } = req.params;
    
    // Prevent removing admin from self
    if (userId === req.user.id) {
        return res.status(400).json({ error: 'Cannot remove admin privileges from yourself' });
    }
    
    // Get target user info for logging
    db.get('SELECT username FROM users WHERE id = ?', [userId], (err, targetUser) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (!targetUser) {
            return res.status(404).json({ error: 'User not found' });
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
                
                // Log the action
                logAdminAction(
                    req.user.id,
                    req.user.username,
                    'removed admin privileges',
                    userId,
                    targetUser.username,
                    'Admin privileges revoked',
                    req.ip
                );
                
                res.json({ 
                    message: 'Admin privileges removed successfully',
                    userId
                });
            }
        );
    });
});

// Get server statistics (admin only)
router.get('/stats', authenticateAdmin, (req, res) => {
    // Get all stats in parallel for better performance
    Promise.all([
        new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) as total_users FROM users', (err, result) => {
                if (err) reject(err);
                else resolve(result.total_users);
            });
        }),
        new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) as online_users FROM users WHERE is_online = 1', (err, result) => {
                if (err) reject(err);
                else resolve(result.online_users);
            });
        }),
        new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) as banned_users FROM users WHERE is_banned = 1', (err, result) => {
                if (err) reject(err);
                else resolve(result.banned_users);
            });
        }),

        new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) as total_messages FROM chat_messages', (err, result) => {
                if (err) reject(err);
                else resolve(result.total_messages);
            });
        }),
        new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) as total_friends FROM friends WHERE status = "accepted"', (err, result) => {
                if (err) reject(err);
                else resolve(result.total_friends);
            });
        }),
        new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) as pending_friends FROM friends WHERE status = "pending"', (err, result) => {
                if (err) reject(err);
                else resolve(result.pending_friends);
            });
        }),
        new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) as total_announcements FROM announcements', (err, result) => {
                if (err) reject(err);
                else resolve(result.total_announcements);
            });
        }),
        new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) as admin_users FROM users WHERE is_admin = 1', (err, result) => {
                if (err) reject(err);
                else resolve(result.admin_users);
            });
        }),
        new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) as total_logs FROM admin_logs', (err, result) => {
                if (err) reject(err);
                else resolve(result.total_logs || 0);
            });
        }),
        new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) as today_users FROM users WHERE DATE(created_at) = DATE("now")', (err, result) => {
                if (err) reject(err);
                else resolve(result.today_users);
            });
        }),
        new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) as today_messages FROM chat_messages WHERE DATE(created_at) = DATE("now")', (err, result) => {
                if (err) reject(err);
                else resolve(result.today_messages);
            });
        }),
        new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) as muted_users FROM user_mutes WHERE muted_until IS NULL OR muted_until > datetime("now")', (err, result) => {
                if (err) reject(err);
                else resolve(result.muted_users);
            });
        }),
        new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) as total_filter_words FROM chat_filter_words', (err, result) => {
                if (err) reject(err);
                else resolve(result.total_filter_words);
            });
        }),
        new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) as total_gardens FROM gardens', (err, result) => {
                if (err) reject(err);
                else resolve(result.total_gardens || 0);
            });
        })
    ]).then(([totalUsers, onlineUsers, bannedUsers, totalMessages, totalFriends, pendingFriends, totalAnnouncements, adminUsers, totalLogs, todayUsers, todayMessages, mutedUsers, totalFilterWords, totalGardens]) => {
        res.json({
            stats: {
                totalUsers,
                onlineUsers,
                bannedUsers,
                totalMessages,
                totalFriends,
                pendingFriends,
                totalAnnouncements,
                adminUsers,
                totalLogs,
                todayUsers,
                todayMessages,
                mutedUsers,
                totalFilterWords,
                totalGardens
            }
        });
    }).catch(error => {
        console.error('❌ Error getting stats:', error);
        res.status(500).json({ error: 'Failed to get stats' });
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
        [req.user.id, req.user.username, message],
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
            
            // Log the action
            logAdminAction(
                req.user.id,
                req.user.username,
                'sent announcement',
                null,
                null,
                `Message: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`,
                req.ip
            );
            
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
    
    // Get announcement info for logging
    db.get('SELECT admin_username, message FROM announcements WHERE id = ?', [id], (err, announcement) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (!announcement) {
            return res.status(404).json({ error: 'Announcement not found' });
        }
        
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
                
                // Log the action
                logAdminAction(
                    req.user.id,
                    req.user.username,
                    'deactivated announcement',
                    null,
                    announcement.admin_username,
                    `Announcement ID: ${id}`,
                    req.ip
                );
                
                res.json({ message: 'Announcement deactivated successfully' });
            }
        );
    });
});

// Get admin logs (admin only)
router.get('/logs', authenticateAdmin, (req, res) => {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    
    db.all(`
        SELECT 
            id, admin_username, action, target_username, details, ip_address, created_at
        FROM admin_logs 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
    `, [limit, offset], (err, logs) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        res.json({ logs });
    });
});

// Mute user (admin only)
router.post('/mute', authenticateAdmin, (req, res) => {
    const { userId, duration, reason } = req.body;
    
    if (!userId || !duration) {
        return res.status(400).json({ error: 'User ID and duration required' });
    }
    
    // Calculate mute end time
    let mutedUntil = null;
    if (duration === 'permanent') {
        mutedUntil = null; // NULL means permanent
    } else {
        const now = new Date();
        const durationInMinutes = parseInt(duration);
        if (isNaN(durationInMinutes) || durationInMinutes <= 0) {
            return res.status(400).json({ error: 'Invalid duration' });
        }
        now.setMinutes(now.getMinutes() + durationInMinutes);
        mutedUntil = now.toISOString().slice(0, 19).replace('T', ' ');
    }
    
    // Get target user info for logging
    db.get('SELECT username FROM users WHERE id = ?', [userId], (err, targetUser) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (!targetUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Remove any existing mutes for this user
        db.run('DELETE FROM user_mutes WHERE user_id = ?', [userId], (err) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            
            // Add new mute
            db.run(
                'INSERT INTO user_mutes (user_id, muted_until, mute_reason, muted_by_admin_id, muted_by_admin_username) VALUES (?, ?, ?, ?, ?)',
                [userId, mutedUntil, reason || null, req.user.id, req.user.username],
                function(err) {
                    if (err) {
                        return res.status(500).json({ error: 'Database error' });
                    }
                    
                    // Log the action
                    const muteDetails = duration === 'permanent' ? 
                        'Permanent mute' : 
                        `Muted for ${duration} minutes`;
                    logAdminAction(
                        req.user.id,
                        req.user.username,
                        'muted user',
                        userId,
                        targetUser.username,
                        `${muteDetails}${reason ? ` - Reason: ${reason}` : ''}`,
                        req.ip
                    );
                    
                    // Disconnect user if permanently muted
                    if (duration === 'permanent') {
                        const disconnectMessage = `You have been permanently muted: ${reason || 'No reason provided'}. You have been disconnected from the server.`;
                        disconnectUser(userId, disconnectMessage);
                    }
                    
                    res.json({
                        message: 'User muted successfully',
                        userId,
                        mutedUntil,
                        reason
                    });
                }
            );
        });
    });
});

// Unmute user (admin only)
router.post('/unmute', authenticateAdmin, (req, res) => {
    const { userId } = req.body;
    
    if (!userId) {
        return res.status(400).json({ error: 'User ID required' });
    }
    
    // Get target user info for logging
    db.get('SELECT username FROM users WHERE id = ?', [userId], (err, targetUser) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (!targetUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        db.run(
            'DELETE FROM user_mutes WHERE user_id = ?',
            [userId],
            function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }
                
                if (this.changes === 0) {
                    return res.status(404).json({ error: 'User is not muted' });
                }
                
                // Log the action
                logAdminAction(
                    req.user.id,
                    req.user.username,
                    'unmuted user',
                    userId,
                    targetUser.username,
                    'User unmuted',
                    req.ip
                );
                
                res.json({
                    message: 'User unmuted successfully',
                    userId
                });
            }
        );
    });
});

// Get muted users (admin only)
router.get('/muted-users', authenticateAdmin, (req, res) => {
    db.all(`
        SELECT 
            um.user_id,
            u.username,
            um.muted_until,
            um.mute_reason,
            um.muted_by_admin_username,
            um.created_at,
            CASE 
                WHEN um.muted_until IS NULL THEN 'permanent'
                WHEN um.muted_until > datetime('now') THEN 'active'
                ELSE 'expired'
            END as status
        FROM user_mutes um
        JOIN users u ON um.user_id = u.id
        ORDER BY um.created_at DESC
    `, (err, mutedUsers) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        res.json({ mutedUsers });
    });
});

// Add word to chat filter (admin only)
router.post('/chat-filter/add', authenticateAdmin, (req, res) => {
    const { word } = req.body;
    
    if (!word || typeof word !== 'string' || word.trim().length === 0) {
        return res.status(400).json({ error: 'Valid word required' });
    }
    
    const cleanWord = word.trim().toLowerCase();
    
    db.run(
        'INSERT INTO chat_filter_words (word, added_by_admin_id, added_by_admin_username) VALUES (?, ?, ?)',
        [cleanWord, req.user.id, req.user.username],
        function(err) {
            if (err) {
                if (err.code === 'SQLITE_CONSTRAINT') {
                    return res.status(400).json({ error: 'Word already exists in filter' });
                }
                return res.status(500).json({ error: 'Database error' });
            }
            
            // Log the action
            logAdminAction(
                req.user.id,
                req.user.username,
                'added word to chat filter',
                null,
                null,
                `Word: "${cleanWord}"`,
                req.ip
            );
            
            res.json({
                message: 'Word added to chat filter successfully',
                word: cleanWord
            });
        }
    );
});

// Remove word from chat filter (admin only)
router.post('/chat-filter/remove', authenticateAdmin, (req, res) => {
    const { word } = req.body;
    
    if (!word || typeof word !== 'string' || word.trim().length === 0) {
        return res.status(400).json({ error: 'Valid word required' });
    }
    
    const cleanWord = word.trim().toLowerCase();
    
    db.run(
        'DELETE FROM chat_filter_words WHERE word = ?',
        [cleanWord],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Word not found in filter' });
            }
            
            // Log the action
            logAdminAction(
                req.user.id,
                req.user.username,
                'removed word from chat filter',
                null,
                null,
                `Word: "${cleanWord}"`,
                req.ip
            );
            
            res.json({
                message: 'Word removed from chat filter successfully',
                word: cleanWord
            });
        }
    );
});

// Get chat filter words (admin only)
router.get('/chat-filter/words', authenticateAdmin, (req, res) => {
    db.all(`
        SELECT 
            word,
            added_by_admin_username,
            created_at
        FROM chat_filter_words 
        ORDER BY created_at DESC
    `, (err, words) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        res.json({ words });
    });
});

// Clear all gardens for a user (admin only)
router.post('/users/:userId/clear-gardens', authenticateAdmin, (req, res) => {
    const { userId } = req.params;
    
    // Get target user info for logging
    db.get('SELECT username FROM users WHERE id = ?', [userId], (err, targetUser) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (!targetUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Delete all gardens for this user
        db.run(
            'DELETE FROM gardens WHERE user_id = ?',
            [userId],
            function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }
                
                // Log the action
                logAdminAction(
                    req.user.id,
                    req.user.username,
                    'cleared all gardens',
                    userId,
                    targetUser.username,
                    `Cleared ${this.changes} garden(s)`,
                    req.ip
                );
                
                // Disconnect user if online to force them to reload
                disconnectUser(userId);
                
                res.json({
                    message: 'All gardens cleared successfully',
                    userId,
                    gardensCleared: this.changes
                });
            }
        );
    });
});

// Export the router and the setWebSocketMaps function
module.exports = { router, setWebSocketMaps };
