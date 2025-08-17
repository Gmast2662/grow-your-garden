@echo off
echo 🌐 Getting your public ngrok URL...
echo.

REM Wait a moment for ngrok to start
timeout /t 2 /nobreak >nul

REM Try to get the URL
curl -s http://localhost:4040/api/tunnels > ngrok-status.json 2>nul

if exist ngrok-status.json (
    echo ✅ ngrok is running!
    echo.
    echo 📡 Your public URL should be visible in the ngrok window.
    echo 🌐 Look for a line like: "Forwarding https://abc123.ngrok.io -> http://localhost:3000"
    echo.
    echo 💡 If you don't see the URL, check the ngrok terminal window.
) else (
    echo ❌ ngrok might not be running yet.
    echo.
    echo 🔧 To start ngrok manually:
    echo 1. Open a new terminal
    echo 2. Run: ngrok http 3000
    echo 3. Copy the HTTPS URL that appears
)

echo.
echo 🎮 Your garden game is ready to share with the world!
pause
