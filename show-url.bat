@echo off
echo 🌐 Your Garden Game Public URL:
echo.

REM Check if ngrok is running and get the URL
for /f "tokens=*" %%i in ('curl -s http://localhost:4040/api/tunnels ^| findstr "public_url"') do (
    echo %%i
)

echo.
echo 🎮 Share this URL with friends to play multiplayer!
echo.
pause
