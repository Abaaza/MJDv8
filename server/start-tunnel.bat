@echo off
echo 🚀 Starting MJD Backend with ngrok tunnel...
echo.

REM Start the server in the background
echo 📡 Starting Node.js server on port 3001...
start /min "MJD Server" npm start

REM Wait for server to start
echo ⏳ Waiting for server to start...
timeout /t 5 /nobreak >nul

REM Start ngrok tunnel
echo 🌐 Starting ngrok tunnel...
echo.
echo ✅ Your API will be available at the ngrok URL below:
echo.
ngrok http 3001

echo.
echo 🛑 Tunnel stopped. Server is still running in background.
pause 