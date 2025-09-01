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
            'friend_request': [],
            'user_unfriended': [] // Added for unfriended event
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

        // Handle when user is unfriended by someone else
        this.socket.on('user_unfriended', (data) => {
            console.log(`😢 ${data.byName} unfriended you`);
            this.emit('user_unfriended', data);
            
            // Show notification to user
            if (window.game && window.game.showMessage) {
                window.game.showMessage(`😢 ${data.byName} unfriended you.`, 'info');
            } else {
                alert(`😢 ${data.byName} unfriended you.`);
            }
            
            // Refresh friends list to remove the unfriended user
            if (window.game && window.game.loadFriendsList) {
                setTimeout(() => {
                    window.game.loadFriendsList();
                }, 1000);
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
            
            // Check if message already exists to prevent duplicates
            const messageExists = this.chatMessages.some(msg => 
                msg.id === data.id || 
                (msg.senderId === data.senderId && msg.message === data.message && msg.timestamp === data.timestamp)
            );
            
            if (!messageExists) {
                this.chatMessages.push(data);
                
                // Keep only last 100 messages to prevent memory issues
                if (this.chatMessages.length > 100) {
                    this.chatMessages = this.chatMessages.slice(-100);
                }
            }
            
            this.emit('chat_message', data);
            
            // Update UI if game is available
            if (window.game && window.game.updateMultiplayerUI) {
                window.game.updateMultiplayerUI();
            }
            
            // Also update chat display
            if (window.game && window.game.loadChatMessages) {
                window.game.loadChatMessages();
            }
        });

        this.socket.on('message_sent', (data) => {
            if (data.success) {
                console.log('✅ Message sent successfully');
                // Add message to local chat if it's a global message
                if (data.message) {
                    // Check if message already exists to prevent duplicates
                    const messageExists = this.chatMessages.some(msg => 
                        msg.id === data.message.id || 
                        (msg.senderId === data.message.senderId && msg.message === data.message.message && msg.timestamp === data.message.timestamp)
                    );
                    
                    if (!messageExists) {
                        this.chatMessages.push(data.message);
                        this.emit('chat_message', data.message);
                    }
                    
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
            console.log(`👥 New friend request from ${data.fromName}`);
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
        console.log('🌱 Garden visit request received:', data);
        const message = `${data.visitorName} wants to visit your garden. Allow?`;
        const allowed = confirm(message);
        
        if (allowed) {
            console.log('✅ User allowed garden visit, getting garden data...');
            // Try to get current garden data from different possible sources
            let gardenData = null;
            let dataSource = 'none';
            
            if (window.game && typeof window.game.getGardenData === 'function') {
                gardenData = window.game.getGardenData();
                dataSource = 'window.game';
            } else if (window.menuSystem && window.menuSystem.currentGame && typeof window.menuSystem.currentGame.getGardenData === 'function') {
                gardenData = window.menuSystem.currentGame.getGardenData();
                dataSource = 'window.menuSystem.currentGame';
            } else if (window.currentGame && typeof window.currentGame.getGardenData === 'function') {
                gardenData = window.currentGame.getGardenData();
                dataSource = 'window.currentGame';
            }
            
            console.log(`🌱 Garden data source: ${dataSource}`);
            console.log('🌱 Garden data retrieved:', gardenData);
            
            if (gardenData && gardenData.garden) {
                console.log('✅ Garden data is valid, sending response');
                this.respondToGardenVisit(data.visitorId, true, gardenData);
            } else {
                console.log('❌ Garden data is invalid or missing, sending response without data');
                this.respondToGardenVisit(data.visitorId, true, gardenData);
            }
        } else {
            console.log('❌ User denied garden visit');
            this.respondToGardenVisit(data.visitorId, false);
        }
    }

    // Handle garden visit result
    handleGardenVisitResult(data) {
        console.log('🌱 Garden visit result received:', data);
        
        if (data.allowed) {
            console.log(`🌱 Visiting ${data.ownerName}'s garden`);
            if (data.gardenData && data.gardenData.garden) {
                console.log('✅ Garden data is valid, showing garden viewer');
                this.showGardenViewer(data.gardenData, data.ownerName);
            } else {
                console.log('❌ Garden data is missing or invalid');
                alert(`Garden visit allowed but no garden data available from ${data.ownerName}`);
            }
        } else {
            console.log('❌ Garden visit was denied');
            if (data.error) {
                alert(`Garden visit denied: ${data.error}`);
            } else {
                alert('Garden visit was denied');
            }
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
        console.log(`👥 Friend request ${status} by ${data.byName}`);
        
        const message = data.accepted
            ? `🎉 ${data.byName} accepted your friend request! You are now friends.`
            : `❌ ${data.byName} rejected your friend request.`;

        // Show a more user-friendly notification
        if (window.game && window.game.showMessage) {
            window.game.showMessage(message, data.accepted ? 'success' : 'info');
        } else {
            alert(message);
        }

        // Refresh friends list to show updated status
        if (window.game && window.game.loadFriendsList) {
            setTimeout(() => {
                window.game.loadFriendsList();
            }, 1000);
        }
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

    // Show garden viewer (proper implementation)
    showGardenViewer(gardenData, ownerName) {
        if (!gardenData) {
            alert('No garden data available to view');
            return;
        }

        // Create a proper garden viewer modal
        const modal = document.createElement('div');
        modal.className = 'garden-viewer-modal';
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
            overflow-y: auto;
        `;
        
        // Create garden display
        const gardenDisplay = this.createGardenDisplay(gardenData);
        
        modal.innerHTML = `
            <div class="garden-viewer-content" style="
                background: white;
                padding: 20px;
                border-radius: 15px;
                max-width: 90vw;
                max-height: 90vh;
                overflow-y: auto;
                position: relative;
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="margin: 0; color: #2c5530;">🏡 ${ownerName}'s Garden</h2>
                    <button onclick="this.closest('.garden-viewer-modal').remove()" style="
                        background: #f44336;
                        color: white;
                        border: none;
                        border-radius: 50%;
                        width: 30px;
                        height: 30px;
                        cursor: pointer;
                        font-size: 16px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">×</button>
                </div>
                
                <div class="garden-info" style="margin-bottom: 20px; padding: 15px; background: #f5f5f5; border-radius: 10px;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">
                        <div><strong>💰 Money:</strong> $${gardenData.money || 0}</div>
                        <div><strong>💧 Water:</strong> ${gardenData.water || 0}</div>
                        <div><strong>🌱 Fertilizer:</strong> ${gardenData.fertilizer || 0}</div>
                        <div><strong>⭐ Score:</strong> ${gardenData.score || 0}</div>
                        <div><strong>🌿 Plants:</strong> ${gardenData.stats?.totalPlantsHarvested || 0}</div>
                        <div><strong>🌤️ Weather:</strong> ${gardenData.weather || 'Unknown'}</div>
                    </div>
                </div>
                
                <div class="garden-display" style="text-align: center;">
                    ${gardenDisplay}
                </div>
                
                <div style="margin-top: 20px; text-align: center; color: #666;">
                    <small>This is a read-only view of ${ownerName}'s garden</small>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Create visual garden display
    createGardenDisplay(gardenData) {
        if (!gardenData.garden || !Array.isArray(gardenData.garden)) {
            return '<p style="color: #666;">Garden layout not available</p>';
        }

        const garden = gardenData.garden;
        const size = garden.length;
        const cellSize = Math.min(400 / size, 30); // Responsive cell size
        
        let html = `<div class="garden-grid" style="
            display: inline-grid;
            grid-template-columns: repeat(${size}, ${cellSize}px);
            gap: 2px;
            background: #8B4513;
            padding: 10px;
            border-radius: 10px;
            border: 3px solid #654321;
        ">`;
        
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const cell = garden[row][col];
                let cellContent = '';
                let cellClass = 'garden-cell';
                
                if (cell && cell.plant) {
                    const plant = cell.plant;
                    const stage = plant.growthStage || 0;
                    const plantType = plant.type || 'unknown';
                    
                    // Plant emojis based on type and stage
                    const plantEmojis = {
                        'carrot': ['🥕', '🥕', '🥕', '🥕', '🥕'],
                        'tomato': ['🍅', '🍅', '🍅', '🍅', '🍅'],
                        'corn': ['🌽', '🌽', '🌽', '🌽', '🌽'],
                        'lettuce': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'strawberry': ['🍓', '🍓', '🍓', '🍓', '🍓'],
                        'apple': ['🍎', '🍎', '🍎', '🍎', '🍎'],
                        'orange': ['🍊', '🍊', '🍊', '🍊', '🍊'],
                        'banana': ['🍌', '🍌', '🍌', '🍌', '🍌'],
                        'grape': ['🍇', '🍇', '🍇', '🍇', '🍇'],
                        'cherry': ['🍒', '🍒', '🍒', '🍒', '🍒'],
                        'peach': ['🍑', '🍑', '🍑', '🍑', '🍑'],
                        'pear': ['🍐', '🍐', '🍐', '🍐', '🍐'],
                        'lemon': ['🍋', '🍋', '🍋', '🍋', '🍋'],
                        'lime': ['🫒', '🫒', '🫒', '🫒', '🫒'],
                        'mango': ['🥭', '🥭', '🥭', '🥭', '🥭'],
                        'pineapple': ['🍍', '🍍', '🍍', '🍍', '🍍'],
                        'watermelon': ['🍉', '🍉', '🍉', '🍉', '🍉'],
                        'cantaloupe': ['🍈', '🍈', '🍈', '🍈', '🍈'],
                        'honeydew': ['🍈', '🍈', '🍈', '🍈', '🍈'],
                        'cucumber': ['🥒', '🥒', '🥒', '🥒', '🥒'],
                        'bell_pepper': ['🫑', '🫑', '🫑', '🫑', '🫑'],
                        'jalapeno': ['🌶️', '🌶️', '🌶️', '🌶️', '🌶️'],
                        'onion': ['🧅', '🧅', '🧅', '🧅', '🧅'],
                        'garlic': ['🧄', '🧄', '🧄', '🧄', '🧄'],
                        'potato': ['🥔', '🥔', '🥔', '🥔', '🥔'],
                        'sweet_potato': ['🍠', '🍠', '🍠', '🍠', '🍠'],
                        'radish': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'beet': ['🫘', '🫘', '🫘', '🫘', '🫘'],
                        'turnip': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'parsnip': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'celery': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'asparagus': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'broccoli': ['🥦', '🥦', '🥦', '🥦', '🥦'],
                        'cauliflower': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'brussels_sprouts': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'kale': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'spinach': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'arugula': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'endive': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'escarole': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'frisée': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'radicchio': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'watercress': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'mizuna': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'tatsoi': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'bok_choy': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'napa_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'savoy_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'red_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'green_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'white_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'purple_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'blue_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'pink_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'yellow_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'orange_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'brown_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'black_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'gray_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'cyan_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'magenta_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'lime_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'navy_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'teal_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'olive_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'maroon_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'fuchsia_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'aqua_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'silver_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'gold_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'platinum_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'diamond_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'ruby_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'emerald_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'sapphire_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'amethyst_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'topaz_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'opal_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'jade_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'pearl_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'coral_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'ivory_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'cream_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'beige_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'tan_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'khaki_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'wheat_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'honey_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'caramel_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'chocolate_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'vanilla_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'strawberry_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'blueberry_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'raspberry_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'blackberry_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'cranberry_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'elderberry_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'gooseberry_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'currant_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'mulberry_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'boysenberry_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'loganberry_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'tayberry_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'dewberry_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'marionberry_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'olallieberry_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'santiam_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'chehalem_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'kotata_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'black_cap_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'purple_cap_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'red_cap_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'white_cap_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'yellow_cap_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'orange_cap_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'green_cap_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'blue_cap_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'pink_cap_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'brown_cap_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'gray_cap_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'black_cap_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'purple_cap_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'red_cap_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'white_cap_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'yellow_cap_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'orange_cap_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'green_cap_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'blue_cap_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'pink_cap_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'brown_cap_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'gray_cabbage': ['🥬', '🥬', '🥬', '🥬', '🥬'],
                        'unknown': ['🌱', '🌱', '🌱', '🌱', '🌱']
                    };
                    
                    const emoji = plantEmojis[plantType] ? plantEmojis[plantType][stage] : '🌱';
                    cellContent = emoji;
                    cellClass = 'garden-cell plant-cell';
                    
                    // Add tooltip with plant info
                    const tooltip = `Plant: ${plantType}<br>Stage: ${stage + 1}/5<br>Health: ${plant.health || 100}%`;
                    cellContent = `<div title="${tooltip}" style="cursor: help;">${emoji}</div>`;
                } else if (cell && cell.sprinkler) {
                    // Sprinkler
                    const sprinklerType = cell.sprinkler.type || 'basic';
                    const sprinklerEmojis = {
                        'basic': '💧',
                        'advanced': '🚿',
                        'premium': '🌊',
                        'legendary': '⚡'
                    };
                    cellContent = sprinklerEmojis[sprinklerType] || '💧';
                    cellClass = 'garden-cell sprinkler-cell';
                } else {
                    // Empty cell
                    cellContent = '';
                    cellClass = 'garden-cell empty-cell';
                }
                
                html += `<div class="${cellClass}" style="
                    width: ${cellSize}px;
                    height: ${cellSize}px;
                    background: ${cell && cell.plant ? '#90EE90' : cell && cell.sprinkler ? '#87CEEB' : '#8B4513'};
                    border: 1px solid #654321;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: ${Math.max(12, cellSize - 8)}px;
                    cursor: default;
                ">${cellContent}</div>`;
            }
        }
        
        html += '</div>';
        return html;
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

    // Clear chat messages and reset state (useful when switching accounts)
    clearChatMessages() {
        this.chatMessages = [];
        console.log('💬 Chat messages cleared');
    }
    
    // Reset multiplayer state (useful when switching accounts)
    resetState() {
        this.chatMessages = [];
        this.friends = [];
        this.onlineUsers = [];
        console.log('🔄 Multiplayer state reset');
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
