@echo off
echo Installing dependencies...
npm install

echo.
echo Running database fix...
node quick-fix.js

echo.
echo Fix completed! Press any key to continue...
pause
