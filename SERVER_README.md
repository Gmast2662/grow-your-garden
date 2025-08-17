# 🌱 Garden Game Multiplayer Server

This is the multiplayer server for the Grow Your Garden game, enabling real-time multiplayer features like garden visits, chat, and friend systems.

## 🚀 Quick Start

### Prerequisites
- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **For development (auto-restart on changes):**
   ```bash
   npm run dev
   ```

4. **Access the game:**
   - Open your browser and go to `http://localhost:3000`
   - You'll be redirected to the login page
   - Create an account or log in to start playing

## 🌐 Server Features

### 🔐 Authentication System
- User registration and login
- JWT token-based authentication
- Secure password hashing with bcrypt
- Session management

### 👥 Multiplayer Features
- **Real-time garden updates** - See friends' gardens change in real-time
- **Garden visits** - Request to visit other players' gardens
- **Friend system** - Add friends and manage friend requests
- **Chat system** - Send messages to friends
- **Online status** - See who's currently online

### 💾 Database
- SQLite database for data persistence
- Automatic table creation on first run
- Stores users, gardens, friends, and chat messages

## 📁 File Structure

```
grow-a-garden-game/
├── server.js              # Main server file
├── auth.js                # Authentication routes
├── multiplayer.js         # Client-side multiplayer integration
├── login.html             # Login/registration page
├── package.json           # Dependencies and scripts
├── garden_game.db         # SQLite database (created automatically)
└── ... (existing game files)
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# JWT Secret (change this in production!)
JWT_SECRET=your-super-secret-key-here

# Server Port (optional, defaults to 3000)
PORT=3000
```

### Database
The server automatically creates a SQLite database file (`garden_game.db`) with the following tables:

- **users** - User accounts and authentication
- **gardens** - Garden data for each user
- **friends** - Friend relationships and requests
- **chat_messages** - Chat message history

## 🎮 Multiplayer API

### WebSocket Events

#### Client to Server:
- `garden_update` - Send garden data to server
- `visit_garden` - Request to visit someone's garden
- `garden_visit_response` - Respond to garden visit request
- `send_message` - Send chat message
- `send_friend_request` - Send friend request
- `respond_friend_request` - Respond to friend request

#### Server to Client:
- `friend_garden_update` - Receive garden update from friend
- `garden_visit_request` - Receive garden visit request
- `garden_visit_result` - Result of garden visit request
- `new_message` - Receive new chat message
- `friend_request_received` - Receive friend request
- `friend_online` / `friend_offline` - Friend status updates

### REST API Endpoints

#### Authentication:
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

#### Multiplayer:
- `GET /api/users/online` - Get list of online users
- `GET /api/users/:userId/garden` - Get user's garden data
- `GET /api/users/:userId/friends` - Get user's friends list

## 🛠️ Development

### Adding New Features

1. **Server-side events:** Add new socket event handlers in `server.js`
2. **Client-side integration:** Update `multiplayer.js` to handle new events
3. **Database changes:** Add new tables or columns as needed
4. **API endpoints:** Add new REST endpoints for additional functionality

### Testing

1. **Start the server:** `npm run dev`
2. **Open multiple browser tabs** to test multiplayer features
3. **Use browser console** to see WebSocket events and debug
4. **Check server console** for connection logs and errors

## 🚀 Deployment

### Local Network
To allow other devices on your network to connect:

1. Find your computer's IP address
2. Start the server: `npm start`
3. Other devices can connect to `http://YOUR_IP:3000`

### Production Deployment

For production deployment, consider:

1. **Environment variables:** Set proper JWT_SECRET and PORT
2. **HTTPS:** Use SSL certificates for secure connections
3. **Database:** Consider using PostgreSQL or MySQL for larger scale
4. **Process manager:** Use PM2 or similar for process management
5. **Reverse proxy:** Use Nginx or Apache for load balancing

Example with PM2:
```bash
npm install -g pm2
pm2 start server.js --name "garden-game"
pm2 startup
pm2 save
```

## 🔒 Security Considerations

- **JWT Secret:** Always use a strong, unique JWT secret in production
- **Password Hashing:** Passwords are automatically hashed with bcrypt
- **Input Validation:** All user inputs are validated server-side
- **CORS:** Configure CORS settings for your domain in production
- **Rate Limiting:** Consider adding rate limiting for API endpoints

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Find process using port 3000
   lsof -i :3000
   # Kill the process
   kill -9 <PID>
   ```

2. **Database errors:**
   - Delete `garden_game.db` to reset the database
   - Check file permissions

3. **WebSocket connection issues:**
   - Check browser console for errors
   - Verify server is running
   - Check firewall settings

4. **Authentication issues:**
   - Clear browser localStorage
   - Check JWT token expiration
   - Verify server JWT_SECRET

### Debug Mode

Enable debug logging by setting the environment variable:
```bash
DEBUG=* npm start
```

## 📞 Support

If you encounter issues:

1. Check the browser console for client-side errors
2. Check the server console for server-side errors
3. Verify all dependencies are installed correctly
4. Ensure Node.js version is 14 or higher

## 🎯 Next Steps

Potential enhancements for the multiplayer system:

- **Garden competitions** - Weekly/monthly contests
- **Trading system** - Exchange seeds and items
- **Guilds/Clubs** - Group gardening communities
- **Cross-pollination** - Bees visiting between gardens
- **Weather sharing** - Regional weather affecting all players
- **Achievement system** - Multiplayer achievements and rewards

---

**Happy Gardening! 🌱**
