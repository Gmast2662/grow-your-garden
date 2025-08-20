Write-Host "Running comprehensive admin panel fix..." -ForegroundColor Green
node comprehensive-fix.js
Write-Host "Press any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
