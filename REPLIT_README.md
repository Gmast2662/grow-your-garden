# 🌱 Garden Game - Replit Setup

## 🚀 Quick Setup on Replit

### Method 1: Automatic (Recommended)
1. **Import from GitHub** to Replit
2. **Click "Run"** - it will automatically start using `index.js`
3. **Wait for startup** - you should see:
   ```
   🌱 Starting Garden Game on Replit...
   ✅ Detected Replit environment
   🔄 Server restart monitor started
   🚀 Starting server...
   🌱 Garden Game Server running on port 3000
   ```

### Method 2: Manual Setup
If automatic doesn't work:

1. **Set Environment Variables** in Replit:
   - Go to "Tools" → "Secrets"
   - Add: `JWT_SECRET` = `garden-game-2025-secret-key-jwt-123`
   - Add: `PORT` = `3000`

2. **Run in Console**:
   ```bash
   npm install
   npm start
   ```

## 🛡️ Anti-Shutdown Features

This setup includes:
- ✅ **Keep-alive pings** every 5 minutes
- ✅ **Auto-restart** if server crashes
- ✅ **Health monitoring** every 30 seconds
- ✅ **Fallback startup** if restart server fails

## 🌐 Access Your Game

- **Main URL**: Your Replit project URL
- **Login Page**: Add `/login` to the end
- **Example**: `https://your-repl-name.your-username.replit.dev/login`

## 🔧 Troubleshooting

### Server Won't Start
```bash
node test-replit.js
```

### Dependencies Missing
```bash
npm install
```

### Manual Server Start
```bash
node server.js
```

### Check Health
Visit: `https://your-repl-url.replit.dev/health`

## 📁 Important Files

- `index.js` - Main startup file (Replit will run this)
- `restart-server.js` - Auto-restart monitor
- `keep-alive.js` - Prevents idle shutdown
- `server.js` - Main game server
- `package.json` - Dependencies and scripts

## 🆘 Still Having Issues?

1. **Check console** for error messages
2. **Try manual start**: `node server.js`
3. **Check health endpoint**: `/health`
4. **Restart Replit** by clicking "Run" again
