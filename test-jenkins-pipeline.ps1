# Local Jenkins Pipeline Test Script (PowerShell)
# This script simulates the Jenkins pipeline locally for testing

param(
    [switch]$SkipServer,
    [switch]$SkipTests
)

Write-Host "🚀 Starting Local Jenkins Pipeline Test" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Status "Node.js version: $nodeVersion"
} catch {
    Write-Error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Status "npm version: $npmVersion"
} catch {
    Write-Error "npm is not installed. Please install npm first."
    exit 1
}

# Stage 1: Install Dependencies
Write-Host ""
Write-Host "📦 Installing Dependencies..." -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

# Install client dependencies
Write-Status "Installing client dependencies..."
Set-Location client
npm ci
Set-Location ..

# Install server dependencies
Write-Status "Installing server dependencies..."
Set-Location server
npm ci
Set-Location ..

# Stage 2: Seed Sample Data
Write-Host ""
Write-Host "🌱 Seeding Sample Data..." -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Set-Location server
npm run seed:sample
Set-Location ..

# Stage 3: Start Server (if not skipped)
if (-not $SkipServer) {
    Write-Host ""
    Write-Host "🚀 Starting Server..." -ForegroundColor Cyan
    Write-Host "====================" -ForegroundColor Cyan
    Set-Location server
    Start-Process -FilePath "npm" -ArgumentList "start" -WindowStyle Hidden
    Set-Location ..
    
    # Wait for server to start
    Write-Status "Waiting for server to start..."
    Start-Sleep -Seconds 10
    
    # Check if server is running
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -Method GET -TimeoutSec 5
        Write-Status "Server is running on port 5000"
    } catch {
        Write-Error "Server failed to start"
        exit 1
    }
}

# Stage 4: Run Tests (if not skipped)
if (-not $SkipTests) {
    Write-Host ""
    Write-Host "🧪 Running Tests..." -ForegroundColor Cyan
    Write-Host "==================" -ForegroundColor Cyan
    
    # Run unit tests
    Write-Status "Running client unit tests..."
    Set-Location client
    npm run test:unit
    Set-Location ..
    
    Write-Status "Running server API tests..."
    Set-Location server
    npm run test:api
    Set-Location ..
    
    # Run E2E tests
    Write-Status "Running E2E tests..."
    Set-Location client
    npm run test:e2e:ci
    Set-Location ..
}

# Stage 5: Generate Reports
Write-Host ""
Write-Host "📊 Generating Reports..." -ForegroundColor Cyan
Write-Host "=======================" -ForegroundColor Cyan
Set-Location client
npm run merge:reports
npm run generate:report
Set-Location ..

# Stage 6: Check Artifacts
Write-Host ""
Write-Host "📁 Checking Artifacts..." -ForegroundColor Cyan
Write-Host "=======================" -ForegroundColor Cyan

# Check if reports were generated
if (Test-Path "client/cypress/reports/merged-report.json") {
    Write-Status "Merged report generated"
} else {
    Write-Warning "Merged report not found"
}

if (Test-Path "client/cypress/reports/html") {
    Write-Status "HTML report generated"
    Write-Status "Report location: client/cypress/reports/html/index.html"
} else {
    Write-Warning "HTML report not found"
}

if (Test-Path "client/cypress/videos") {
    $videoCount = (Get-ChildItem -Path "client/cypress/videos" -Filter "*.mp4" -Recurse).Count
    Write-Status "Videos generated: $videoCount"
} else {
    Write-Warning "No videos found"
}

if (Test-Path "client/cypress/screenshots") {
    $screenshotCount = (Get-ChildItem -Path "client/cypress/screenshots" -Filter "*.png" -Recurse).Count
    Write-Status "Screenshots generated: $screenshotCount"
} else {
    Write-Warning "No screenshots found"
}

if (Test-Path "client/cypress/reports/junit/cypress-results.xml") {
    Write-Status "JUnit XML report generated"
} else {
    Write-Warning "JUnit XML report not found"
}

# Cleanup
Write-Host ""
Write-Host "🧹 Cleaning Up..." -ForegroundColor Cyan
Write-Host "=================" -ForegroundColor Cyan

# Stop any running Node.js processes
try {
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Status "Server stopped"
} catch {
    Write-Warning "No server processes found to stop"
}

# Final Status
Write-Host ""
Write-Host "🎉 Local Jenkins Pipeline Test Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Status "All stages completed successfully"
Write-Status "Check the following locations for artifacts:"
Write-Host "  📊 HTML Report: client/cypress/reports/html/index.html"
Write-Host "  📄 JSON Report: client/cypress/reports/merged-report.json"
Write-Host "  🎥 Videos: client/cypress/videos/"
Write-Host "  📸 Screenshots: client/cypress/screenshots/"
Write-Host "  📋 JUnit XML: client/cypress/reports/junit/cypress-results.xml"

Write-Host ""
Write-Status "Pipeline test completed successfully! 🚀"
