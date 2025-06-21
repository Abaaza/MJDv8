Write-Host "📦 Creating Lambda Deployment Package..." -ForegroundColor Green
Write-Host ""

# Navigate to server directory
Set-Location server

# Clean up old files
Write-Host "🧹 Cleaning up old files..." -ForegroundColor Yellow
if (Test-Path "../lambda-function.zip") {
    Remove-Item "../lambda-function.zip"
    Write-Host "   Removed old lambda-function.zip"
}

# Install production dependencies
Write-Host "📥 Installing productcdion dependencies..." -ForegroundColor Yellow
npm install --production

# Create the zip file
Write-Host "📁 Creating deployment package..." -ForegroundColor Yellow

# Files to include (everything except what we exclude)
$excludePatterns = @(
    "node_modules\.cache\*",
    "*.log",
    "temp\*",
    "output\*",
    ".env*",
    "test-*.js",
    "deploy-manual.js",
    "start-tunnel*",
    "*.ps1"
)

# Create zip using PowerShell Compress-Archive
$files = Get-ChildItem -Recurse | Where-Object {
    $file = $_
    $shouldExclude = $false
    
    foreach ($pattern in $excludePatterns) {
        if ($file.FullName -like "*$pattern*") {
            $shouldExclude = $true
            break
        }
    }
    
    return -not $shouldExclude
}

Write-Host "   Including $($files.Count) files in package..."

# Compress to parent directory
Compress-Archive -Path $files -DestinationPath "../lambda-function.zip" -Force

# Get file size
$zipFile = Get-Item "../lambda-function.zip"
$sizeInMB = [math]::Round($zipFile.Length / 1MB, 2)

Write-Host ""
Write-Host "✅ Lambda deployment package created!" -ForegroundColor Green
Write-Host "📦 File: lambda-function.zip" -ForegroundColor Cyan
Write-Host "📊 Size: $sizeInMB MB" -ForegroundColor Cyan
Write-Host ""

if ($sizeInMB -gt 50) {
    Write-Host "⚠️  Warning: Package is large ($sizeInMB MB). Lambda has a 50MB limit for direct upload." -ForegroundColor Yellow
    Write-Host "   Consider using S3 for deployment if upload fails." -ForegroundColor Yellow
}
else {
    Write-Host "✅ Package size is good for direct Lambda upload." -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Go to AWS Lambda Console"
Write-Host "2. Create new function (Node.js 20.x)"
Write-Host "3. Upload lambda-function.zip"
Write-Host "4. Set handler: lambda-handler.handler"
Write-Host "5. Add environment variables"
Write-Host "6. Create API Gateway"
Write-Host ""

# Go back to root directory
Set-Location ..

Read-Host "Press Enter to exit" 