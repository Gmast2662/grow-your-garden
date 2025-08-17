@echo off
echo 🌱 Starting Garden Game Public Access...
echo.

REM Kill any existing ngrok processes
taskkill /f /im ngrok.exe >nul 2>&1

REM Start ngrok
echo 🌐 Starting ngrok tunnel...
echo 📡 This will create a public URL for your game...
echo.

REM Start ngrok and show the output
C:\Users\bethg\AppData\Roaming\npm\ngrok.cmd http 3000

echo.
echo 🎮 Your garden game is now publicly accessible!
pause
