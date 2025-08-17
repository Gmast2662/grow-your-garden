Write-Host "🌱 Starting Garden Game with Public Access..." -ForegroundColor Green
Write-Host ""

# Start the server in background
Write-Host "🚀 Starting server..." -ForegroundColor Yellow
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "start"

# Wait a moment for server to start
Write-Host "⏳ Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Start ngrok tunnel
Write-Host "🌐 Creating public tunnel..." -ForegroundColor Cyan
Write-Host "📡 Your game will be available at a public URL!" -ForegroundColor Green
Write-Host ""

# Start ngrok
ngrok http 3000

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
