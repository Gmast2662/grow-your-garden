// Multiplayer Integration for Grow Your Garden
class MultiplayerManager {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.currentUser = null;
        this.friends = [];
        this.onlineUsers = [];
        this.chatMessages = [];
        this.serverUrl = window.location.origin;
        
        // Event listeners
        this.eventListeners = {
            'connection': [],
            'disconnection': [],
            'friend_online': [],
            'friend_offline': [],
            'garden_update': [],
            'chat_message': [],
            'friend_request': []
        };
    }

    // Initialize multiplayer connection
    async initialize(token) {
        try {
            // Load Socket.IO client
            if (typeof io === 'undefined') {
                await this.loadSocketIO();
            }

            // Connect to server
            this.socket = io(this.serverUrl, {
                auth: { token: token }
            });

            this.setupSocketListeners();
            this.setupEventListeners();
            
            console.log('🌐 Multiplayer initialized');
            return true;
        } catch (error) {
            console.error('Failed to initialize multiplayer:', error);
            return false;
        }
    }

    // Load Socket.IO client dynamically
    async loadSocketIO() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = '/socket.io/socket.io.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Setup Socket.IO event listeners
    setupSocketListeners() {
        this.socket.on('connect', () => {
            console.log('✅ Connected to multiplayer server');
            this.isConnected = true;
            this.emit('connection');
            
            // Update UI if game is available
            if (window.game && window.game.updateMultiplayerUI) {
                window.game.updateMultiplayerUI();
            }
        });

        this.socket.on('disconnect', () => {
            console.log('❌ Disconnected from multiplayer server');
            this.isConnected = false;
            this.emit('disconnection');
            
            // Update UI if game is available
            if (window.game && window.game.updateMultiplayerUI) {
                window.game.updateMultiplayerUI();
            }
        });

        // Friend events
        this.socket.on('friend_online', (data) => {
            console.log(`👋 ${data.username} is now online`);
            this.addOnlineUser(data);
            this.emit('friend_online', data);
            
            // Update UI if game is available
            if (window.game && window.game.updateMultiplayerUI) {
                window.game.updateMultiplayerUI();
            }
        });

        this.socket.on('friend_offline', (data) => {
            console.log(`👋 ${data.username} went offline`);
            this.removeOnlineUser(data.userId);
            this.emit('friend_offline', data);
            
            // Update UI if game is available
            if (window.game && window.game.updateMultiplayerUI) {
                window.game.updateMultiplayerUI();
            }
        });

        // Garden events
        this.socket.on('friend_garden_update', (data) => {
            console.log(`🌱 Garden update from ${data.username}`);
            this.emit('garden_update', data);
        });

        this.socket.on('garden_visit_request', (data) => {
            this.handleGardenVisitRequest(data);
        });

        this.socket.on('garden_visit_result', (data) => {
            this.handleGardenVisitResult(data);
        });

        // Chat events
        this.socket.on('new_message', (data) => {
            console.log(`💬 New message from ${data.senderName}`);
            this.chatMessages.push(data);
            this.emit('chat_message', data);
            
            // Update UI if game is available
            if (window.game && window.game.updateMultiplayerUI) {
                window.game.updateMultiplayerUI();
            }
        });

        this.socket.on('message_sent', (data) => {
            if (data.success) {
                console.log('✅ Message sent successfully');
                // Add message to local chat if it's a global message
                if (data.message) {
                    this.chatMessages.push(data.message);
                    this.emit('chat_message', data.message);
                    
                    // Update UI if game is available
                    if (window.game && window.game.loadChatMessages) {
                        window.game.loadChatMessages();
                    }
                }
            } else {
                console.error('❌ Failed to send message:', data.error);
                
                // Show notification to user for mute and filter errors
                if (data.error && (data.error.includes('muted') || data.error.includes('blocked') || data.error.includes('inappropriate'))) {
                    if (window.game && window.game.showMessage) {
                        window.game.showMessage(data.error, 'error');
                    } else {
                        // Fallback to alert if game.showMessage is not available
                        alert(`❌ ${data.error}`);
                    }
                }
            }
        });

        // Friend request events
        this.socket.on('friend_request_received', (data) => {
            console.log(`👥 Friend request from ${data.fromName}`);
            this.emit('friend_request', data);
        });

        this.socket.on('friend_request_result', (data) => {
            this.handleFriendRequestResult(data);
        });

        this.socket.on('friend_request_responded', (data) => {
            this.handleFriendRequestResponse(data);
        });

        this.socket.on('friend_response_result', (data) => {
            this.handleFriendResponseResult(data);
        });

        // Handle admin actions (force logout, etc.)
        this.socket.on('admin_action', (data) => {
            if (data.type === 'force_logout') {
                alert(`🔒 ${data.message}`);
                // Clear token and redirect to login
                localStorage.removeItem('garden_game_token');
                window.location.href = '/login';
            }
        });

        // Handle admin announcements
        this.socket.on('admin_announcement', (data) => {
            this.showAnnouncement(data);
        });
    }

    // Setup custom event listeners
    setupEventListeners() {
        // Add event listener method
        this.on = (event, callback) => {
            if (this.eventListeners[event]) {
                this.eventListeners[event].push(callback);
            }
        };

        // Remove event listener method
        this.off = (event, callback) => {
            if (this.eventListeners[event]) {
                const index = this.eventListeners[event].indexOf(callback);
                if (index > -1) {
                    this.eventListeners[event].splice(index, 1);
                }
            }
        };
    }

    // Emit custom events
    emit(event, data) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in ${event} event handler:`, error);
                }
            });
        }
    }

    // Send garden update to server
    sendGardenUpdate(gardenData) {
        if (this.isConnected && this.socket) {
            // Include the current save slot in the garden data
            const gardenDataWithSlot = {
                ...gardenData,
                saveSlot: window.game ? window.game.saveSlot : 1
            };
            this.socket.emit('garden_update', gardenDataWithSlot);
        }
    }

    // Request to visit someone's garden
    requestGardenVisit(userId) {
        if (this.isConnected && this.socket) {
            this.socket.emit('visit_garden', userId);
        }
    }

    // Respond to garden visit request
    respondToGardenVisit(visitorId, allowed, gardenData = null) {
        if (this.isConnected && this.socket) {
            this.socket.emit('garden_visit_response', {
                visitorId: visitorId,
                allowed: allowed,
                gardenData: gardenData
            });
        }
    }

    // Send chat message
    sendMessage(message, receiverId = null) {
        if (this.isConnected && this.socket) {
            this.socket.emit('send_message', {
                receiverId: receiverId,
                message: message
            });
        }
    }

    // Send friend request
    sendFriendRequest(username) {
        if (this.isConnected && this.socket) {
            this.socket.emit('send_friend_request', username);
        }
    }

    // Respond to friend request
    respondToFriendRequest(fromId, accepted) {
        if (this.isConnected && this.socket) {
            this.socket.emit('respond_friend_request', {
                fromId: fromId,
                accepted: accepted
            });
        }
    }
    
    // Unfriend a user
    unfriendUser(friendId) {
        if (this.isConnected && this.socket) {
            this.socket.emit('unfriend_user', {
                friendId: friendId
            });
        }
    }

    // Handle garden visit request
    handleGardenVisitRequest(data) {
        const message = `${data.visitorName} wants to visit your garden. Allow?`;
        const allowed = confirm(message);
        
        if (allowed) {
            // Get current garden data from game
            const gardenData = window.game ? window.game.getGardenData() : null;
            this.respondToGardenVisit(data.visitorId, true, gardenData);
        } else {
            this.respondToGardenVisit(data.visitorId, false);
        }
    }

    // Handle garden visit result
    handleGardenVisitResult(data) {
        if (data.allowed) {
            console.log(`🌱 Visiting ${data.ownerName}'s garden`);
            // Here you could open a garden viewer or update the UI
            this.showGardenViewer(data.gardenData, data.ownerName);
        } else {
            console.log('❌ Garden visit was denied');
            alert('Garden visit was denied');
        }
    }

    // Handle friend request result
    handleFriendRequestResult(data) {
        if (data.success) {
            alert(data.message);
        } else {
            alert(`Error: ${data.message}`);
        }
    }

    // Handle friend request response
    handleFriendRequestResponse(data) {
        const status = data.accepted ? 'accepted' : 'rejected';
        alert(`${data.byName} ${status} your friend request!`);
    }

    // Handle friend response result
    handleFriendResponseResult(data) {
        if (data.success) {
            alert(data.message);
        } else {
            alert(`Error: ${data.message}`);
        }
    }

    // Add user to online list
    addOnlineUser(userData) {
        const existingIndex = this.onlineUsers.findIndex(u => u.id === userData.id);
        if (existingIndex === -1) {
            this.onlineUsers.push(userData);
        } else {
            this.onlineUsers[existingIndex] = userData;
        }
    }

    // Remove user from online list
    removeOnlineUser(userId) {
        this.onlineUsers = this.onlineUsers.filter(u => u.id !== userId);
    }

    // Get online users
    getOnlineUsers() {
        return this.onlineUsers;
    }

    // Get friends list
    async getFriends() {
        try {
            // Check if currentUser exists and has an id
            if (!this.currentUser || !this.currentUser.id) {
                console.log('No current user found, cannot get friends');
                return [];
            }
            
            const response = await fetch(`${this.serverUrl}/api/users/${this.currentUser.id}/friends`, {
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                }
            });
            
            if (response.ok) {
                this.friends = await response.json();
                return this.friends;
            }
        } catch (error) {
            console.error('Failed to get friends:', error);
        }
        return [];
    }

    // Get online users from server
    async getOnlineUsersFromServer() {
        try {
            const response = await fetch(`${this.serverUrl}/api/users/online`);
            if (response.ok) {
                this.onlineUsers = await response.json();
                return this.onlineUsers;
            }
        } catch (error) {
            console.error('Failed to get online users:', error);
        }
        return [];
    }

    // Show garden viewer (placeholder)
    showGardenViewer(gardenData, ownerName) {
        // This would be implemented to show another player's garden
        console.log(`Viewing ${ownerName}'s garden:`, gardenData);
        
        // Create a simple modal to show the garden
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;
        
        modal.innerHTML = `
            <div style="background: white; padding: 20px; border-radius: 10px; max-width: 600px;">
                <h2>${ownerName}'s Garden</h2>
                <p>This is a preview of their garden data:</p>
                <pre style="background: #f5f5f5; padding: 10px; border-radius: 5px; overflow: auto; max-height: 300px;">
                    ${JSON.stringify(gardenData, null, 2)}
                </pre>
                <button onclick="this.parentElement.parentElement.remove()" style="margin-top: 10px; padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Close
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    // Get stored token
    getToken() {
        return localStorage.getItem('garden_game_token');
    }
    
    // Set current user
    setCurrentUser(user) {
        this.currentUser = user;
    }
    
    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Disconnect from server
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.isConnected = false;
    }

    // Check if connected
    isConnectedToServer() {
        return this.isConnected && this.socket && this.socket.connected;
    }

    // Show announcement popup
    showAnnouncement(data) {
        // Create announcement popup
        const popup = document.createElement('div');
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 500px;
            text-align: center;
            animation: announcementSlideIn 0.5s ease-out;
        `;
        
        popup.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 15px;">📢</div>
            <h3 style="margin-bottom: 10px; font-size: 1.5rem;">Server Announcement</h3>
            <p style="margin-bottom: 15px; line-height: 1.5; font-size: 1.1rem;">${data.message}</p>
            <div style="font-size: 0.9rem; opacity: 0.8; margin-bottom: 20px;">
                From: ${data.adminUsername}<br>
                ${new Date(data.timestamp).toLocaleString()}
            </div>
            <button onclick="this.parentElement.remove()" style="
                background: rgba(255,255,255,0.2);
                color: white;
                border: 2px solid rgba(255,255,255,0.3);
                padding: 10px 25px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 1rem;
                transition: all 0.3s;
            " onmouseover="this.style.background='rgba(255,255,255,0.3)'" 
               onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                Got it!
            </button>
        `;
        
        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes announcementSlideIn {
                from {
                    opacity: 0;
                    transform: translate(-50%, -60%);
                }
                to {
                    opacity: 1;
                    transform: translate(-50%, -50%);
                }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(popup);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (popup.parentElement) {
                popup.remove();
            }
        }, 10000);
    }
}

// Create global multiplayer instance
window.multiplayer = new MultiplayerManager();

// Auto-initialize if token exists
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('garden_game_token');
    if (token) {
        // Verify token and initialize multiplayer
        fetch('/api/auth/verify', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.valid) {
                window.multiplayer.currentUser = data.user;
                window.multiplayer.initialize(token);
            } else {
                localStorage.removeItem('garden_game_token');
            }
        })
        .catch(error => {
            console.error('Token verification failed:', error);
            localStorage.removeItem('garden_game_token');
        });
    }
});
