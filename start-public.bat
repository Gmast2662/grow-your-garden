@echo off
echo 🌱 Starting Garden Game with Public Access...
echo.

REM Start the server in background
echo 🚀 Starting server...
start /B npm start

REM Wait a moment for server to start
timeout /t 3 /nobreak >nul

REM Start ngrok tunnel
echo 🌐 Creating public tunnel...
echo 📡 Your game will be available at a public URL!
echo.
ngrok http 3000

pause
