# 🌱 Replit Setup Guide

## 🚀 Quick Start

1. **Click the "Run" button** in Replit
2. **Wait for the server to start** - you should see:
   ```
   🔄 Server restart monitor started for: [your-replit-url]
   🚀 Starting server...
   🌱 Garden Game Server running on port 3000
   📡 WebSocket server ready for multiplayer connections
   🌐 Game available at: http://localhost:3000
   🔄 Starting keep-alive for Replit...
   🔄 Keep-alive started for: [your-replit-url]
   ```

## 🛡️ Anti-Shutdown Protection

The server now includes:
- **Keep-alive pings** every 5 minutes to prevent idle shutdown
- **Auto-restart** if the server crashes
- **Health monitoring** every 30 seconds
- **Maximum 5 restart attempts** to prevent infinite loops

## 🔧 If Server Won't Start

### Step 1: Test Environment
Run this in the Replit console:
```bash
node test-replit.js
```

### Step 2: Install Dependencies
If dependencies are missing:
```bash
npm install
```

### Step 3: Manual Start
Try starting manually:
```bash
node server.js
```

## 🌐 Access Your Game

- **Main URL**: Your Replit project URL
- **Login Page**: Add `/login` to the end of your URL
- **Example**: `https://your-repl-name.your-username.replit.dev/login`

## 🔍 Troubleshooting

### "502 Bad Gateway" Error
- Server isn't running
- Click "Run" button in Replit
- Check console for error messages

### "Cannot find module" Error
- Dependencies not installed
- Run `npm install` in console

### Game loads but multiplayer doesn't work
- Create an account first
- Check browser console for errors
- Make sure you're logged in

### Buttons don't work in garden
- Refresh the page
- Check browser console for JavaScript errors
- Try creating a new garden

## 📝 Environment Variables

The server automatically sets:
- `JWT_SECRET`: `garden-game-2025-secret-key-jwt-123`
- `PORT`: `3000`

## 🆘 Still Having Issues?

1. **Check the console** for error messages
2. **Try the test script**: `node test-replit.js`
3. **Restart Replit** by clicking "Run" again
4. **Check browser console** (F12) for client-side errors
