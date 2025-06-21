Write-Host "🚀 Starting MJD Backend with ngrok tunnel (DEBUG MODE)..." -ForegroundColor Green
Write-Host ""

# Check if server is already running
$serverPort = 3001
$serverRunning = Test-NetConnection -ComputerName localhost -Port $serverPort -InformationLevel Quiet

if ($serverRunning) {
    Write-Host "✅ Server already running on port $serverPort" -ForegroundColor Green
}
else {
    # Start the server in background
    Write-Host "📡 Starting Node.js server on port $serverPort..." -ForegroundColor Yellow
    $serverProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm start" -WindowStyle Normal -PassThru
    
    # Wait for server to start
    Write-Host "⏳ Waiting for server to start..." -ForegroundColor Yellow
    $attempts = 0
    while (-not (Test-NetConnection -ComputerName localhost -Port $serverPort -InformationLevel Quiet) -and $attempts -lt 10) {
        Start-Sleep -Seconds 1
        $attempts++
        Write-Host "." -NoNewline
    }
    Write-Host ""
    
    if ($attempts -eq 10) {
        Write-Host "❌ Server failed to start after 10 seconds" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Server started successfully!" -ForegroundColor Green
}

# Test local server endpoints
Write-Host ""
Write-Host "🔍 Testing local server endpoints..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:$serverPort/health" -Method Get
    Write-Host "✅ Health check passed: $($healthResponse.status)" -ForegroundColor Green
}
catch {
    Write-Host "❌ Health check failed: $_" -ForegroundColor Red
}

# Check if ngrok is installed
try {
    $ngrokVersion = & ngrok version 2>&1
    Write-Host "✅ Ngrok found: $ngrokVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Ngrok not found. Please install ngrok first." -ForegroundColor Red
    Write-Host "   Download from: https://ngrok.com/download" -ForegroundColor Yellow
    exit 1
}

# Start ngrok tunnel
Write-Host ""
Write-Host "🌐 Starting ngrok tunnel..." -ForegroundColor Yellow
Write-Host "📌 Important: Copy the HTTPS URL that appears below and update your frontend" -ForegroundColor Cyan
Write-Host ""

# Start ngrok with additional logging
ngrok http $serverPort --log=stdout --log-level=info

Write-Host ""
Write-Host "🛑 Tunnel stopped." -ForegroundColor Red

# Ask if user wants to stop the server
$stopServer = Read-Host "Stop the server too? (Y/N)"
if ($stopServer -eq 'Y' -or $stopServer -eq 'y') {
    if ($serverProcess) {
        Stop-Process -Id $serverProcess.Id -Force
        Write-Host "✅ Server stopped" -ForegroundColor Green
    }
}

Read-Host "Press Enter to exit" 