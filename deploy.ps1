# AWS Deployment Script for MJD Application (PowerShell)
# This script deploys both the backend (Lambda) and frontend (Amplify)

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("backend", "frontend", "both")]
    [string]$Target = "both"
)

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if required tools are installed
function Test-Requirements {
    Write-Status "Checking requirements..."
    
    try {
        aws --version | Out-Null
    } catch {
        Write-Error "AWS CLI is not installed. Please install it first."
        exit 1
    }
    
    try {
        npm --version | Out-Null
    } catch {
        Write-Error "npm is not installed. Please install Node.js and npm first."
        exit 1
    }
    
    Write-Status "All requirements met!"
}

# Deploy backend to AWS Lambda
function Deploy-Backend {
    Write-Status "Deploying backend to AWS Lambda..."
    
    Set-Location server
    
    # Install dependencies
    Write-Status "Installing server dependencies..."
    npm install
    
    # Deploy using Serverless Framework
    Write-Status "Deploying with Serverless Framework..."
    npm run deploy
    
    # Get the API endpoint
    $serverlessInfo = npx serverless info --verbose
    $apiEndpoint = ($serverlessInfo | Select-String "HttpApiUrl").ToString().Split()[-1]
    
    if ($apiEndpoint) {
        Write-Status "Backend deployed successfully!"
        Write-Status "API Endpoint: $apiEndpoint"
        $apiEndpoint | Out-File -FilePath "../api-endpoint.txt" -Encoding UTF8
    } else {
        Write-Warning "Could not extract API endpoint. Check serverless output above."
    }
    
    Set-Location ..
}

# Deploy frontend to AWS Amplify
function Deploy-Frontend {
    Write-Status "Preparing frontend for deployment..."
    
    # Update environment variables if API endpoint was captured
    if (Test-Path "api-endpoint.txt") {
        $apiEndpoint = Get-Content "api-endpoint.txt" -Raw
        $apiEndpoint = $apiEndpoint.Trim()
        Write-Status "Using API endpoint: $apiEndpoint"
        
        # Create or update .env file for client
        "VITE_API_URL=$apiEndpoint" | Out-File -FilePath "client/.env.production" -Encoding UTF8
    }
    
    Set-Location client
    
    # Install dependencies
    Write-Status "Installing client dependencies..."
    npm install
    
    # Build the application
    Write-Status "Building React application..."
    npm run build
    
    Write-Status "Frontend build completed!"
    Write-Status "Deploy the 'client/dist' folder to AWS Amplify Console"
    Write-Status "Or use the Amplify CLI: amplify publish"
    
    Set-Location ..
}

# Main deployment function
function Main {
    Write-Host "🏗️  MJD Application Deployment" -ForegroundColor Cyan
    Write-Host "==============================" -ForegroundColor Cyan
    
    Test-Requirements
    
    # Ask user what to deploy if not specified
    if ($Target -eq "both") {
        Write-Host ""
        Write-Host "What would you like to deploy?"
        Write-Host "1) Backend only (AWS Lambda)"
        Write-Host "2) Frontend only (prepare for Amplify)"
        Write-Host "3) Both backend and frontend"
        
        do {
            $choice = Read-Host "Enter your choice (1-3)"
        } while ($choice -notmatch "^[1-3]$")
        
        switch ($choice) {
            "1" { $Target = "backend" }
            "2" { $Target = "frontend" }
            "3" { $Target = "both" }
        }
    }
    
    try {
        switch ($Target) {
            "backend" {
                Deploy-Backend
            }
            "frontend" {
                Deploy-Frontend
            }
            "both" {
                Deploy-Backend
                Deploy-Frontend
            }
        }
        
        Write-Host ""
        Write-Status "Deployment process completed!"
        
        if (Test-Path "api-endpoint.txt") {
            $apiEndpoint = Get-Content "api-endpoint.txt" -Raw
            $apiEndpoint = $apiEndpoint.Trim()
            
            Write-Host ""
            Write-Host "📋 Deployment Summary:" -ForegroundColor Cyan
            Write-Host "=====================" -ForegroundColor Cyan
            Write-Host "Backend API: $apiEndpoint"
            Write-Host "Frontend: Ready for Amplify deployment"
            Write-Host ""
            Write-Host "Next steps:"
            Write-Host "1. Go to AWS Amplify Console"
            Write-Host "2. Connect your repository or upload the client/dist folder"
            Write-Host "3. Set environment variables in Amplify:"
            Write-Host "   VITE_API_URL=$apiEndpoint"
            Write-Host "   VITE_SUPABASE_URL=<your-supabase-url>"
            Write-Host "   VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>"
        }
    } catch {
        Write-Error "Deployment failed: $($_.Exception.Message)"
        exit 1
    }
}

# Run main function
Main 