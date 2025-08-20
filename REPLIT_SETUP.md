# 🌱 Replit Setup Guide - Grow Your Garden

This guide provides detailed instructions for setting up your garden game on Replit.

## 📋 Prerequisites

- A Replit account (free at [replit.com](https://replit.com))
- Your GitHub repository with the garden game code

## 🚀 Step-by-Step Setup

### **Step 1: Create New Repl**
1. Go to [Replit](https://replit.com) and sign in
2. Click the **"Create Repl"** button
3. Choose **"Import from GitHub"**
4. Enter your repository URL: `https://github.com/YOUR_USERNAME/grow-your-garden`
5. Click **"Import from GitHub"**

### **Step 2: Wait for Import**
- Replit will download all your files
- This may take a few minutes depending on file size
- You'll see all your project files in the file explorer

### **Step 3: Install Dependencies**
1. Open the **Console** (bottom panel)
2. Run: `npm install`
3. Wait for all packages to install
4. You should see a success message

### **Step 4: Set Environment Variables**
1. Click **"Tools"** in the left sidebar
2. Click **"Secrets"**
3. Add these secrets:
   - **Key:** `JWT_SECRET` | **Value:** `your-super-secret-key-here`
   - **Key:** `PORT` | **Value:** `3000`

### **Step 5: Start the Server**
1. Click the **"Run"** button at the top
2. Replit will automatically run `index.js`
3. Wait for the server to start
4. You should see: `🌱 Garden Game Server running on port 3000`

### **Step 6: Create Admin Account**
1. In the console, run: `node create-admin.js`
2. You should see:
   ```
   ✅ Admin account created successfully!
   👤 Username: admin
   🔑 Password: admin123
   ```

### **Step 7: Access Your Game**
1. Click the **webview** that appears
2. Or go to: `https://your-repl-name.your-username.repl.co`
3. You should see the login page
4. Log in with the admin account or create a new user account

## 🔧 Configuration Files

### **Important Files for Replit:**
- `index.js` - Main entry point (Replit runs this)
- `server.js` - Server logic
- `restart-server.js` - Auto-restart functionality
- `keep-alive.js` - Prevents idle shutdown
- `.replit` - Replit configuration
- `package.json` - Dependencies and scripts

### **Admin Setup Files:**
- `create-admin.js` - Creates admin account
- `reset-admin.js` - Resets admin account
- `setup-admin.html` - Admin setup page

## 🛠️ Troubleshooting

### **Server Won't Start**
1. **Check console errors** - Look for red error messages
2. **Verify dependencies** - Run `npm install` again
3. **Check environment variables** - Make sure JWT_SECRET is set
4. **Restart the repl** - Click the stop button, then run again

### **Database Issues**
1. **Database not created** - The server creates it automatically on first run
2. **Permission errors** - Replit should handle this automatically
3. **Reset database** - Run `node reset-admin.js` to start fresh

### **Admin Panel Issues**
1. **Can't access admin panel** - Make sure you're logged in as admin
2. **Admin account not working** - Run `node create-admin.js` again
3. **Forgot admin password** - Run `node reset-admin.js` to reset everything

### **Common Error Messages**
- `EADDRINUSE` - Port 3000 is already in use (restart the repl)
- `Module not found` - Run `npm install` to install dependencies
- `JWT_SECRET not set` - Add the environment variable in Secrets

## 🌐 Accessing Your Game

### **Local Development (if running locally):**
- **Game:** `http://localhost:3000`
- **Admin Panel:** `http://localhost:3000/admin-panel`

### **Replit Deployment:**
- **Game:** `https://your-repl-name.your-username.repl.co`
- **Admin Panel:** `https://your-repl-name.your-username.repl.co/admin-panel`

## 📱 Sharing Your Game

### **Public URL**
Your game will be available at:
`https://your-repl-name.your-username.repl.co`

### **Sharing with Friends**
1. Copy the URL above
2. Send it to your friends
3. They can play immediately without any setup

## 🔒 Security Notes

### **Admin Account**
- **Default credentials:** admin / admin123
- **Change password** after first login
- **Keep credentials secure** - don't share publicly

### **Environment Variables**
- **JWT_SECRET** should be a long, random string
- **Never commit secrets** to your repository
- **Use Replit Secrets** for secure storage

## 🎯 Next Steps

Once your game is running:
1. **Test all features** - Create accounts, play the game
2. **Set up admin panel** - Manage users and settings
3. **Customize the game** - Modify code to add features
4. **Share with friends** - Give them your Replit URL

## 📞 Getting Help

If you encounter issues:
1. Check the console for error messages
2. Verify all files are present
3. Try restarting the repl
4. Check the main README.md for more details
5. Look at the UPDATE_LOG.md for recent changes

Happy gardening! 🌱
