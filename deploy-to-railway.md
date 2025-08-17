# 🚂 Deploy to Railway - Step by Step Guide

## 🎯 **What you'll get:**
- ✅ **Permanent URL** (never changes)
- ✅ **Always online** (even when your computer is off)
- ✅ **Free hosting** ($5 credit/month)
- ✅ **Automatic HTTPS**

## 📋 **Step 1: Prepare Your Code (Already Done!)**
✅ `package.json` - Ready
✅ `server.js` - Ready  
✅ `Procfile` - Ready
✅ All dependencies - Ready

## 🌐 **Step 2: Deploy to Railway**

### **Option A: Deploy from GitHub (Recommended)**

1. **Go to Railway:** https://railway.app/
2. **Sign up** with your GitHub account
3. **Click "New Project"**
4. **Choose "Deploy from GitHub repo"**
5. **Select your garden game repository**
6. **Railway will automatically detect it's a Node.js app**
7. **Click "Deploy Now"**

### **Option B: Deploy from Local Files**

1. **Go to Railway:** https://railway.app/
2. **Sign up** with your GitHub account
3. **Click "New Project"**
4. **Choose "Deploy from GitHub repo"**
5. **Create a new GitHub repository** (if you don't have one)
6. **Upload your files** to the GitHub repository
7. **Select the repository** in Railway
8. **Click "Deploy Now"**

## ⚙️ **Step 3: Configure Environment Variables**

After deployment, in Railway dashboard:

1. **Go to your project**
2. **Click "Variables" tab**
3. **Add these environment variables:**

```
JWT_SECRET=your-super-secret-key-here-change-this
PORT=3000
```

## 🌐 **Step 4: Get Your Permanent URL**

1. **In Railway dashboard**, go to your project
2. **Click on your service** (usually named after your repo)
3. **Look for "Domains" section**
4. **You'll see:** `https://your-app-name.railway.app`
5. **This URL never changes!**

## 🎮 **Step 5: Test Your Game**

1. **Visit your Railway URL**
2. **You should see the login page**
3. **Create an account**
4. **Start playing!**

## 🔧 **Troubleshooting**

### **If deployment fails:**
- Check Railway logs for errors
- Make sure all files are in the repository
- Verify `package.json` is correct

### **If game doesn't work:**
- Check if environment variables are set
- Look at Railway logs for errors
- Make sure database tables are created

## 🎉 **You're Done!**

Your garden game now has a **permanent URL** that:
- ✅ **Never changes**
- ✅ **Always works**
- ✅ **Is accessible from anywhere**
- ✅ **Has HTTPS security**

## 📱 **Share with Friends**

Share your Railway URL with friends:
`https://your-app-name.railway.app`

They can play your multiplayer garden game from anywhere in the world!
