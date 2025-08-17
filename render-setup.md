# 🎨 Render Deployment - Free Permanent URL

## What you get:
- ✅ **Permanent URL** (never changes)
- ✅ **Free tier** (unlimited)
- ✅ **Automatic deployment** from GitHub
- ✅ **Custom domain** possible

## Setup Steps:

### 1. **Go to Render**
- Visit: https://render.com/
- Sign up with GitHub
- Click "New +" → "Web Service"

### 2. **Connect GitHub**
- Choose "Connect a repository"
- Select your garden game repository

### 3. **Configure deployment**
- **Name:** garden-game (or whatever you want)
- **Environment:** Node
- **Build Command:** `npm install`
- **Start Command:** `npm start`

### 4. **Get your permanent URL**
- Render will give you: `https://your-app-name.onrender.com`
- This URL never changes!

### 5. **Environment Variables**
Add these in Render dashboard:
- `JWT_SECRET`: your-secret-key-here
- `PORT`: 3000

## Benefits:
- 🌐 **Always online** (even when your computer is off)
- 🔒 **HTTPS included**
- 📊 **Built-in monitoring**
- 🚀 **Automatic scaling**

## Cost:
- **Free tier:** Completely free (with some limitations)
- **Custom domain:** $10-15/year (optional)
