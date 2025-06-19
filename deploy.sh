#!/bin/bash

# AWS Deployment Script for MJD Application
# This script deploys both the backend (Lambda) and frontend (Amplify)

set -e

echo "🚀 Starting deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking requirements..."
    
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install Node.js and npm first."
        exit 1
    fi
    
    print_status "All requirements met!"
}

# Deploy backend to AWS Lambda
deploy_backend() {
    print_status "Deploying backend to AWS Lambda..."
    
    cd server
    
    # Install dependencies
    print_status "Installing server dependencies..."
    npm install
    
    # Deploy using Serverless Framework
    print_status "Deploying with Serverless Framework..."
    npm run deploy
    
    # Get the API endpoint
    API_ENDPOINT=$(npx serverless info --verbose | grep "HttpApiUrl" | awk '{print $2}')
    if [ -n "$API_ENDPOINT" ]; then
        print_status "Backend deployed successfully!"
        print_status "API Endpoint: $API_ENDPOINT"
        echo "$API_ENDPOINT" > ../api-endpoint.txt
    else
        print_warning "Could not extract API endpoint. Check serverless output above."
    fi
    
    cd ..
}

# Deploy frontend to AWS Amplify
deploy_frontend() {
    print_status "Preparing frontend for deployment..."
    
    # Update environment variables if API endpoint was captured
    if [ -f "api-endpoint.txt" ]; then
        API_ENDPOINT=$(cat api-endpoint.txt)
        print_status "Using API endpoint: $API_ENDPOINT"
        
        # Create or update .env file for client
        echo "VITE_API_URL=$API_ENDPOINT" > client/.env.production
    fi
    
    cd client
    
    # Install dependencies
    print_status "Installing client dependencies..."
    npm install
    
    # Build the application
    print_status "Building React application..."
    npm run build
    
    print_status "Frontend build completed!"
    print_status "Deploy the 'client/dist' folder to AWS Amplify Console"
    print_status "Or use the Amplify CLI: amplify publish"
    
    cd ..
}

# Main deployment function
main() {
    echo "🏗️  MJD Application Deployment"
    echo "=============================="
    
    check_requirements
    
    # Ask user what to deploy
    echo ""
    echo "What would you like to deploy?"
    echo "1) Backend only (AWS Lambda)"
    echo "2) Frontend only (prepare for Amplify)"
    echo "3) Both backend and frontend"
    read -p "Enter your choice (1-3): " choice
    
    case $choice in
        1)
            deploy_backend
            ;;
        2)
            deploy_frontend
            ;;
        3)
            deploy_backend
            deploy_frontend
            ;;
        *)
            print_error "Invalid choice. Please run the script again."
            exit 1
            ;;
    esac
    
    echo ""
    print_status "Deployment process completed!"
    
    if [ -f "api-endpoint.txt" ]; then
        API_ENDPOINT=$(cat api-endpoint.txt)
        echo ""
        echo "📋 Deployment Summary:"
        echo "====================="
        echo "Backend API: $API_ENDPOINT"
        echo "Frontend: Ready for Amplify deployment"
        echo ""
        echo "Next steps:"
        echo "1. Go to AWS Amplify Console"
        echo "2. Connect your repository or upload the client/dist folder"
        echo "3. Set environment variables in Amplify:"
        echo "   VITE_API_URL=$API_ENDPOINT"
        echo "   VITE_SUPABASE_URL=<your-supabase-url>"
        echo "   VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>"
    fi
}

# Run main function
main "$@" 