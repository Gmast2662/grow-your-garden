const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const sqlite3 = require('sqlite3').verbose();

// Environment variables
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Import authentication routes
const authRoutes = require('./auth');
app.use('/api/auth', authRoutes);

// Admin routes
const adminModule = require('./admin');
app.use('/api/admin', adminModule.router);

// Set WebSocket maps in admin module
adminModule.setWebSocketMaps(userSockets, onlineUsers);

// Database setup
const db = new sqlite3.Database('./garden_game.db');

// Initialize database tables
db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME,
        is_online BOOLEAN DEFAULT 0,
        is_banned BOOLEAN DEFAULT 0,
        ban_reason TEXT,
        is_admin BOOLEAN DEFAULT 0
    )`);

    // Gardens table
    db.run(`CREATE TABLE IF NOT EXISTS gardens (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        garden_data TEXT NOT NULL,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_public BOOLEAN DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Friends table
    db.run(`CREATE TABLE IF NOT EXISTS friends (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        friend_id TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (friend_id) REFERENCES users (id),
        UNIQUE(user_id, friend_id)
    )`);

    // Chat messages table
    db.run(`CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id TEXT NOT NULL,
        receiver_id TEXT,
        message TEXT NOT NULL,
        message_type TEXT DEFAULT 'text',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users (id),
        FOREIGN KEY (receiver_id) REFERENCES users (id)
    )`, function(err) {
        if (err) {
            console.error('❌ Error creating chat_messages table:', err);
        } else {
            console.log('✅ Chat messages table ready');
        }
    });

    // Announcements table
    db.run(`CREATE TABLE IF NOT EXISTS announcements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        admin_id TEXT NOT NULL,
        admin_username TEXT NOT NULL,
        message TEXT NOT NULL,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_id) REFERENCES users (id)
    )`, function(err) {
        if (err) {
            console.error('❌ Error creating announcements table:', err);
        } else {
            console.log('✅ Announcements table ready');
        }
    });

    // Admin logs table
    db.run(`CREATE TABLE IF NOT EXISTS admin_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        admin_id TEXT NOT NULL,
        admin_username TEXT NOT NULL,
        action TEXT NOT NULL,
        target_user_id TEXT,
        target_username TEXT,
        details TEXT,
        ip_address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_id) REFERENCES users (id)
    )`, function(err) {
        if (err) {
            console.error('❌ Error creating admin_logs table:', err);
        } else {
            console.log('✅ Admin logs table ready');
        }
    });
});

// JWT secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Store online users
const onlineUsers = new Map();
const userSockets = new Map();

// Authentication middleware for Socket.IO
const authenticateSocketToken = (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
            return next(new Error('Authentication token required'));
        }
        
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Check if user is banned
        db.get('SELECT is_banned, ban_reason FROM users WHERE id = ?', [decoded.id], (err, user) => {
            if (err) {
                return next(new Error('Database error'));
            }
            
            if (!user) {
                return next(new Error('User not found'));
            }
            
            if (user.is_banned) {
                return next(new Error(`Account banned: ${user.ban_reason || 'No reason provided'}`));
            }
            
            socket.userId = decoded.id;
            socket.username = decoded.username;
            next();
        });
    } catch (error) {
        return next(new Error('Invalid token'));
    }
};

// Socket.IO connection handling
io.use(authenticateSocketToken);

io.on('connection', (socket) => {
    try {
        console.log(`User connected: ${socket.username} (${socket.userId})`);
        
        // Add user to online list
        onlineUsers.set(socket.userId, {
            id: socket.userId,
            username: socket.username,
            socketId: socket.id,
            lastSeen: Date.now()
        });
        userSockets.set(socket.userId, socket);

        // Update user online status in database
        db.run('UPDATE users SET is_online = 1, last_login = CURRENT_TIMESTAMP WHERE id = ?', [socket.userId]);

        // Join user to their personal room
        socket.join(`user_${socket.userId}`);

    // Handle garden updates
    socket.on('garden_update', (gardenData) => {
        try {
            console.log(`Garden update from ${socket.username}`);
            
            // Save garden data to database
            const gardenJson = JSON.stringify(gardenData);
            db.run(
                'INSERT OR REPLACE INTO gardens (id, user_id, garden_data, last_updated) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
                [`garden_${socket.userId}`, socket.userId, gardenJson]
            );

            // Broadcast to friends if garden is public
            db.get('SELECT is_public FROM gardens WHERE user_id = ?', [socket.userId], (err, row) => {
                if (!err && row && row.is_public) {
                    // Get friends list
                    db.all('SELECT friend_id FROM friends WHERE user_id = ? AND status = "accepted"', [socket.userId], (err, friends) => {
                        if (!err && friends) {
                            friends.forEach(friend => {
                                const friendSocket = userSockets.get(friend.friend_id);
                                if (friendSocket) {
                                    friendSocket.emit('friend_garden_update', {
                                        userId: socket.userId,
                                        username: socket.username,
                                        gardenData: gardenData
                                    });
                                }
                            });
                        }
                    });
                }
            });
        } catch (error) {
            console.error('Error handling garden update:', error);
        }
    });

    // Handle garden visit requests
    socket.on('visit_garden', (targetUserId) => {
        console.log(`${socket.username} wants to visit ${targetUserId}'s garden`);
        
        // Check if target user is online
        const targetSocket = userSockets.get(targetUserId);
        if (targetSocket) {
            targetSocket.emit('garden_visit_request', {
                visitorId: socket.userId,
                visitorName: socket.username
            });
        }
    });

    // Handle garden visit responses
    socket.on('garden_visit_response', (data) => {
        const visitorSocket = userSockets.get(data.visitorId);
        if (visitorSocket) {
            visitorSocket.emit('garden_visit_result', {
                allowed: data.allowed,
                gardenData: data.gardenData,
                ownerName: socket.username
            });
        }
    });

    // Handle chat messages
    socket.on('send_message', (data) => {
        try {
            // Validate input
            if (!data || !data.message) {
                socket.emit('message_sent', { 
                    success: false, 
                    error: 'Invalid message data' 
                });
                return;
            }

            const messageData = {
                senderId: socket.userId,
                senderName: socket.username,
                receiverId: data.receiverId || 'global',
                message: data.message,
                timestamp: Date.now()
            };

            // Save to database with error handling (let SQLite auto-generate the id)
            console.log('📝 Attempting to save message:', {
                senderId: socket.userId,
                receiverId: data.receiverId || 'global',
                message: data.message
            });
            
            db.run(
                'INSERT INTO chat_messages (sender_id, receiver_id, message) VALUES (?, ?, ?)',
                [socket.userId, data.receiverId || 'global', data.message],
                function(err) {
                    if (err) {
                        console.error('❌ Database error saving message:', err);
                        console.error('Error details:', {
                            code: err.code,
                            errno: err.errno,
                            message: err.message
                        });
                        socket.emit('message_sent', { 
                            success: false, 
                            error: 'Failed to save message' 
                        });
                        return;
                    }

                    // Add the auto-generated ID to the message data
                    const savedMessageData = {
                        ...messageData,
                        id: this.lastID
                    };

                    // Send to receiver if online (for private messages)
                    if (data.receiverId) {
                        const receiverSocket = userSockets.get(data.receiverId);
                        if (receiverSocket) {
                            receiverSocket.emit('new_message', savedMessageData);
                        }
                    } else {
                        // Broadcast to all online users for global chat
                        userSockets.forEach((userSocket) => {
                            if (userSocket.id !== socket.id) {
                                userSocket.emit('new_message', savedMessageData);
                            }
                        });
                    }

                    // Send confirmation to sender
                    socket.emit('message_sent', { 
                        success: true, 
                        message: savedMessageData 
                    });
                }
            );
        } catch (error) {
            console.error('Error handling chat message:', error);
            socket.emit('message_sent', { 
                success: false, 
                error: 'Server error processing message' 
            });
        }
    });

    // Handle friend requests
    socket.on('send_friend_request', (targetUsername) => {
        // Use case-insensitive search for username
        db.get('SELECT id, username FROM users WHERE LOWER(username) = LOWER(?)', [targetUsername], (err, targetUser) => {
            if (err || !targetUser) {
                socket.emit('friend_request_result', { success: false, message: 'User not found' });
                return;
            }

            if (targetUser.id === socket.userId) {
                socket.emit('friend_request_result', { success: false, message: 'Cannot add yourself as friend' });
                return;
            }

            // Check if already friends or request pending (only check for active relationships)
            console.log(`🔍 Checking existing friendship: userId=${socket.userId}, targetId=${targetUser.id}`);
            db.get('SELECT * FROM friends WHERE ((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)) AND status IN ("pending", "accepted")', 
                [socket.userId, targetUser.id, targetUser.id, socket.userId], (err, existing) => {
                if (err) {
                    console.error('❌ Database error checking friendship:', err);
                    socket.emit('friend_request_result', { success: false, message: 'Database error' });
                    return;
                }

                if (existing) {
                    const status = existing.status === 'accepted' ? 'already friends' : 'request pending';
                    console.log(`❌ Friendship exists with status: ${existing.status}`);
                    socket.emit('friend_request_result', { success: false, message: `Already ${status}` });
                    return;
                }

                console.log(`✅ No existing friendship found, proceeding with friend request`);

                // Send friend request
                db.run('INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, "pending")', 
                    [socket.userId, targetUser.id], function(err) {
                    if (err) {
                        socket.emit('friend_request_result', { success: false, message: 'Failed to send request' });
                        return;
                    }

                    socket.emit('friend_request_result', { success: true, message: 'Friend request sent!' });

                    // Notify target user if online
                    const targetSocket = userSockets.get(targetUser.id);
                    if (targetSocket) {
                        console.log(`📨 Sending friend request notification to ${targetUser.username} from ${socket.username}`);
                        targetSocket.emit('friend_request_received', {
                            fromId: socket.userId,
                            fromName: socket.username
                        });
                    } else {
                        console.log(`📨 Target user ${targetUser.username} is not online, friend request will be seen when they log in`);
                    }
                });
            });
        });
    });

    // Handle friend request responses
    socket.on('respond_friend_request', (data) => {
        if (data.accepted) {
            // Accept the friend request - use INSERT OR REPLACE to avoid duplicates
            console.log(`✅ Accepting friend request: fromId=${data.fromId}, toId=${socket.userId}`);
            
            // First, update the existing request to accepted
            db.run('UPDATE friends SET status = ? WHERE user_id = ? AND friend_id = ?', 
                ['accepted', data.fromId, socket.userId], function(err) {
                if (err) {
                    console.error('❌ Error updating friend request:', err);
                    socket.emit('friend_response_result', { success: false, message: 'Database error' });
                    return;
                }

                console.log(`✅ Updated friend request. Rows affected: ${this.changes}`);

                // Add reverse friendship using INSERT OR REPLACE to avoid constraint violations
                db.run('INSERT OR REPLACE INTO friends (user_id, friend_id, status) VALUES (?, ?, "accepted")', 
                    [socket.userId, data.fromId], function(err) {
                    if (err) {
                        console.error('❌ Error creating reverse friendship:', err);
                        socket.emit('friend_response_result', { success: false, message: 'Database error' });
                        return;
                    }

                    console.log(`✅ Created reverse friendship. Rows affected: ${this.changes}`);

                    socket.emit('friend_response_result', { 
                        success: true, 
                        message: 'Friend request accepted!' 
                    });

                    // Notify requester if online
                    const requesterSocket = userSockets.get(data.fromId);
                    if (requesterSocket) {
                        requesterSocket.emit('friend_request_responded', {
                            byId: socket.userId,
                            byName: socket.username,
                            accepted: true
                        });
                    }
                });
            });
        } else {
            // Reject the friend request - DELETE it completely
            console.log(`🗑️ Deleting friend request: fromId=${data.fromId}, toId=${socket.userId}`);
            db.run('DELETE FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)', 
                [data.fromId, socket.userId, socket.userId, data.fromId], function(err) {
                if (err) {
                    console.error('❌ Error deleting friend request:', err);
                    socket.emit('friend_response_result', { success: false, message: 'Database error' });
                    return;
                }

                console.log(`✅ Friend request deleted successfully. Rows affected: ${this.changes}`);
                socket.emit('friend_response_result', { 
                    success: true, 
                    message: 'Friend request rejected' 
                });

                // Notify requester if online
                const requesterSocket = userSockets.get(data.fromId);
                if (requesterSocket) {
                    requesterSocket.emit('friend_request_responded', {
                        byId: socket.userId,
                        byName: socket.username,
                        accepted: false
                    });
                }
            });
        }
    });

    // Handle unfriend requests
    socket.on('unfriend_user', (data) => {
        try {
            const { friendId } = data;
            console.log(`Unfriend request: userId=${socket.userId}, friendId=${friendId}`);
            
            // Remove friendship from both sides
            db.run(
                'DELETE FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)',
                [socket.userId, friendId, friendId, socket.userId],
                function(err) {
                    if (err) {
                        console.error('Database error unfriending user:', err);
                        socket.emit('unfriend_result', { success: false, message: 'Failed to unfriend user' });
                        return;
                    }
                    
                    if (this.changes > 0) {
                        console.log(`User unfriended successfully`);
                        
                        // Notify the other user
                        const targetSocket = userSockets.get(friendId);
                        if (targetSocket) {
                            targetSocket.emit('user_unfriended', {
                                byId: socket.userId,
                                byName: socket.username
                            });
                        }
                        
                        socket.emit('unfriend_result', { 
                            success: true, 
                            message: 'User unfriended successfully' 
                        });
                    } else {
                        socket.emit('unfriend_result', { success: false, message: 'Friendship not found' });
                    }
                }
            );
        } catch (error) {
            console.error('Error handling unfriend request:', error);
            socket.emit('unfriend_result', { success: false, message: 'Server error' });
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.username}`);
        
        // Remove from online users
        onlineUsers.delete(socket.userId);
        userSockets.delete(socket.userId);

        // Update database
        db.run('UPDATE users SET is_online = 0 WHERE id = ?', [socket.userId]);

        // Notify friends
        db.all('SELECT friend_id FROM friends WHERE user_id = ? AND status = "accepted"', [socket.userId], (err, friends) => {
            if (!err && friends) {
                friends.forEach(friend => {
                    const friendSocket = userSockets.get(friend.friend_id);
                    if (friendSocket) {
                        friendSocket.emit('friend_offline', {
                            userId: socket.userId,
                            username: socket.username
                        });
                    }
                });
            }
        });
    });
    } catch (error) {
        console.error('Socket connection error:', error);
        socket.disconnect();
    }
});

// REST API endpoints
app.get('/api/users/online', (req, res) => {
    const onlineList = Array.from(onlineUsers.values()).map(user => ({
        id: user.id,
        username: user.username,
        lastSeen: user.lastSeen
    }));
    res.json(onlineList);
});

app.get('/api/users/:userId/garden', (req, res) => {
    const userId = req.params.userId;
    db.get('SELECT garden_data FROM gardens WHERE user_id = ?', [userId], (err, row) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Garden not found' });
            return;
        }
        res.json(JSON.parse(row.garden_data));
    });
});

app.get('/api/users/:userId/friends', (req, res) => {
    const userId = req.params.userId;
    db.all(`
        SELECT u.id, u.username, u.is_online, f.status, f.created_at
        FROM friends f
        JOIN users u ON (f.friend_id = u.id)
        WHERE f.user_id = ?
        UNION
        SELECT u.id, u.username, u.is_online, f.status, f.created_at
        FROM friends f
        JOIN users u ON (f.user_id = u.id)
        WHERE f.friend_id = ?
    `, [userId, userId], (err, friends) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
            return;
        }
        
        // Add real-time online status from onlineUsers Map
        const friendsWithRealTimeStatus = friends.map(friend => {
            const isOnlineRealTime = onlineUsers.has(friend.id);
            return {
                ...friend,
                online: isOnlineRealTime,
                isOnline: isOnlineRealTime
            };
        });
        
        res.json(friendsWithRealTimeStatus);
    });
});

// Authentication middleware for protected routes
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Serve login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Serve admin panel page
app.get('/admin-panel', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-panel.html'));
});

// Serve admin setup page
app.get('/setup-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'setup-admin.html'));
});

// Serve connection test page
app.get('/test-connection', (req, res) => {
    res.sendFile(path.join(__dirname, 'test-connection.html'));
});

// Health check endpoint for keep-alive
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        onlineUsers: onlineUsers.size
    });
});

// Serve the main game page (protected) or redirect to login
app.get('/', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        // No token, redirect to login
        res.redirect('/login');
    } else {
        // Check if token is valid
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                // Invalid token, redirect to login
                res.redirect('/login');
            } else {
                // Valid token, serve the game
                res.sendFile(path.join(__dirname, 'index.html'));
            }
        });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🌱 Garden Game Server running on port ${PORT}`);
    console.log(`📡 WebSocket server ready for multiplayer connections`);
    console.log(`🌐 Game available at: http://localhost:${PORT}`);
    
    // Test database connection
    db.get('SELECT COUNT(*) as count FROM chat_messages', (err, row) => {
        if (err) {
            console.error('❌ Database test failed:', err);
        } else {
            console.log(`✅ Database test passed - ${row.count} chat messages in database`);
        }
    });
    
    // Basic keep-alive for Replit
    if (process.env.REPL_ID) {
        console.log('🔄 Basic keep-alive enabled for Replit');
        // Simple ping every 10 minutes
        setInterval(() => {
            console.log('🔄 Server alive - uptime:', Math.round(process.uptime()), 'seconds');
        }, 10 * 60 * 1000);
    }
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    db.close();
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});
