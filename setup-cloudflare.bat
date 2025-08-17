@echo off
echo 🌟 Setting up Cloudflare Tunnel for Permanent URL...
echo.

echo 📥 Step 1: Download cloudflared
echo Please download cloudflared from:
echo https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
echo.
echo Choose: Windows 64-bit
echo.

echo 📁 Step 2: Extract and place cloudflared.exe in this folder
echo.

echo 🔐 Step 3: Login to Cloudflare
echo Run: cloudflared.exe tunnel login
echo.

echo 🌐 Step 4: Create tunnel
echo Run: cloudflared.exe tunnel create garden-game
echo.

echo 🚀 Step 5: Start tunnel
echo Run: cloudflared.exe tunnel run garden-game
echo.

echo ✅ You'll get a permanent URL like: https://garden-game.your-subdomain.trycloudflare.com
echo.

pause
