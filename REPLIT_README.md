# 🌱 Grow Your Garden - Replit Deployment Guide

This guide will help you deploy your Grow Your Garden game on Replit for free!

## 🚀 Quick Start

### **Step 1: Fork/Import to Replit**
1. Go to [Replit](https://replit.com)
2. Click "Create Repl"
3. Choose "Import from GitHub"
4. Enter your repository URL: `https://github.com/YOUR_USERNAME/grow-your-garden`
5. Click "Import from GitHub"

### **Step 2: Click "Run"**
1. **Click "Run"** - it will automatically start using `index.js`
2. Wait for the server to start
3. You'll see a webview with your game!

### **Step 3: Set Up Admin (First Time Only)**
1. Open the console (bottom panel)
2. Run: `node create-admin.js`
3. This creates an admin account:
   - **Username:** `admin`
   - **Password:** `admin123`
4. Access admin panel at: `https://your-repl-url.repl.co/admin-panel`

## 🔧 Configuration

### **Environment Variables**
In Replit, go to "Tools" → "Secrets" and add:
- `JWT_SECRET` = `your-super-secret-key-here`
- `PORT` = `3000`

### **Package.json Scripts**
The project includes these scripts:
- `npm start` - Start the server
- `npm run dev` - Start with auto-restart (development)

## 🌐 Accessing Your Game

### **Local Development**
- **Game:** `http://localhost:3000`
- **Admin Panel:** `http://localhost:3000/admin-panel`

### **Replit Deployment**
- **Game:** `https://your-repl-name.your-username.repl.co`
- **Admin Panel:** `https://your-repl-name.your-username.repl.co/admin-panel`

## 📁 Important Files for Replit

### **Core Files:**
- `index.js` - Main startup file (Replit will run this)
- `server.js` - Main server logic
- `game.js` - Game client code
- `package.json` - Dependencies and scripts

### **Replit-Specific Files:**
- `restart-server.js` - Auto-restart monitor
- `keep-alive.js` - Prevents idle shutdown
- `.replit` - Replit configuration

### **Admin Files:**
- `create-admin.js` - Create admin account
- `reset-admin.js` - Reset admin account
- `admin-panel.html` - Admin interface

## 🛠️ Troubleshooting

### **Server Won't Start**
1. Check the console for errors
2. Make sure all dependencies are installed: `npm install`
3. Try restarting the repl

### **Admin Panel Issues**
1. Run `node create-admin.js` to create admin account
2. Make sure you're logged in with the admin account
3. Check the console for any error messages

### **Database Issues**
1. The database is automatically created on first run
2. If you need to reset everything: `node reset-admin.js`
3. Database file: `garden_game.db`

## 🎮 Features

### **Multiplayer Features:**
- ✅ Real-time garden updates
- ✅ Friend system
- ✅ Chat system
- ✅ Garden visits
- ✅ Online status

### **Admin Features:**
- ✅ User management
- ✅ Chat moderation
- ✅ Announcements
- ✅ Statistics
- ✅ Security logs

## 📞 Support

If you have issues:
1. Check the console for error messages
2. Make sure all files are present
3. Try restarting the repl
4. Check the main README.md for more details

## 🎯 Next Steps

Once your game is running:
1. **Test the game** - Create an account and play
2. **Set up admin** - Use the admin panel to manage users
3. **Share with friends** - Give them your Replit URL
4. **Customize** - Modify the game code to add features

Happy gardening! 🌱
