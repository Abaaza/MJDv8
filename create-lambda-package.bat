@echo off
echo 📦 Creating Lambda Deployment Package...
echo.

cd server

echo 🧹 Cleaning up old files...
if exist ..\lambda-function.zip del ..\lambda-function.zip

echo 📥 Installing production dependencies...
call npm install --production

echo 📁 Creating deployment package...
echo    This may take a moment...

:: Create zip using PowerShell (available on Windows 10+)
powershell -Command "Compress-Archive -Path '.\*' -DestinationPath '..\lambda-function.zip' -Force -Exclude '*.log','temp\*','output\*','.env*','test-*.js','deploy-manual.js','start-tunnel*','*.ps1','*.bat'"

cd ..

echo.
echo ✅ Lambda deployment package created!
echo 📦 File: lambda-function.zip
echo.

:: Get file size
for %%A in (lambda-function.zip) do (
    set size=%%~zA
    set /a sizeMB=!size!/1024/1024
)

echo 📊 Size: Approximately %sizeMB% MB
echo.

echo 📋 Next Steps:
echo 1. Go to AWS Lambda Console
echo 2. Create new function (Node.js 20.x)  
echo 3. Upload lambda-function.zip
echo 4. Set handler: lambda-handler.handler
echo 5. Add environment variables
echo 6. Create API Gateway
echo.

pause 