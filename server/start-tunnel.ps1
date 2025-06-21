Write-Host "🚀 Starting MJD Backend with ngrok tunnel..." -ForegroundColor Green
Write-Host ""

# Start the server in background
Write-Host "📡 Starting Node.js server on port 3001..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Minimized

# Wait for server to start
Write-Host "⏳ Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start ngrok tunnel
Write-Host "🌐 Starting ngrok tunnel..." -ForegroundColor Yellow
Write-Host ""
Write-Host "✅ Your API will be available at the ngrok URL below:" -ForegroundColor Green
Write-Host ""

ngrok http 3001

Write-Host ""
Write-Host "🛑 Tunnel stopped. Server is still running in background." -ForegroundColor Red
Read-Host "Press Enter to continue" 