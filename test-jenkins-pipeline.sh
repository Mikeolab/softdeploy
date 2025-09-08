#!/bin/bash
# Local Jenkins Pipeline Test Script
# This script simulates the Jenkins pipeline locally for testing

set -e  # Exit on any error

echo "🚀 Starting Local Jenkins Pipeline Test"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

print_status "Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "npm version: $(npm --version)"

# Stage 1: Install Dependencies
echo ""
echo "📦 Installing Dependencies..."
echo "============================="

# Install client dependencies
print_status "Installing client dependencies..."
cd client
npm ci
cd ..

# Install server dependencies
print_status "Installing server dependencies..."
cd server
npm ci
cd ..

# Stage 2: Seed Sample Data
echo ""
echo "🌱 Seeding Sample Data..."
echo "========================"
cd server
npm run seed:sample
cd ..

# Stage 3: Start Server
echo ""
echo "🚀 Starting Server..."
echo "===================="
cd server
npm start &
SERVER_PID=$!
cd ..

# Wait for server to start
print_status "Waiting for server to start..."
sleep 10

# Check if server is running
if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    print_status "Server is running on port 5000"
else
    print_error "Server failed to start"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

# Stage 4: Run Tests
echo ""
echo "🧪 Running Tests..."
echo "=================="

# Run unit tests
print_status "Running client unit tests..."
cd client
npm run test:unit
cd ..

print_status "Running server API tests..."
cd server
npm run test:api
cd ..

# Run E2E tests
print_status "Running E2E tests..."
cd client
npm run test:e2e:ci
cd ..

# Stage 5: Generate Reports
echo ""
echo "📊 Generating Reports..."
echo "======================="
cd client
npm run merge:reports
npm run generate:report
cd ..

# Stage 6: Check Artifacts
echo ""
echo "📁 Checking Artifacts..."
echo "======================="

# Check if reports were generated
if [ -f "client/cypress/reports/merged-report.json" ]; then
    print_status "Merged report generated"
else
    print_warning "Merged report not found"
fi

if [ -d "client/cypress/reports/html" ]; then
    print_status "HTML report generated"
    print_status "Report location: client/cypress/reports/html/index.html"
else
    print_warning "HTML report not found"
fi

if [ -d "client/cypress/videos" ]; then
    VIDEO_COUNT=$(find client/cypress/videos -name "*.mp4" | wc -l)
    print_status "Videos generated: $VIDEO_COUNT"
else
    print_warning "No videos found"
fi

if [ -d "client/cypress/screenshots" ]; then
    SCREENSHOT_COUNT=$(find client/cypress/screenshots -name "*.png" | wc -l)
    print_status "Screenshots generated: $SCREENSHOT_COUNT"
else
    print_warning "No screenshots found"
fi

if [ -f "client/cypress/reports/junit/cypress-results.xml" ]; then
    print_status "JUnit XML report generated"
else
    print_warning "JUnit XML report not found"
fi

# Cleanup
echo ""
echo "🧹 Cleaning Up..."
echo "================="
kill $SERVER_PID 2>/dev/null || true
print_status "Server stopped"

# Final Status
echo ""
echo "🎉 Local Jenkins Pipeline Test Complete!"
echo "========================================"
print_status "All stages completed successfully"
print_status "Check the following locations for artifacts:"
echo "  📊 HTML Report: client/cypress/reports/html/index.html"
echo "  📄 JSON Report: client/cypress/reports/merged-report.json"
echo "  🎥 Videos: client/cypress/videos/"
echo "  📸 Screenshots: client/cypress/screenshots/"
echo "  📋 JUnit XML: client/cypress/reports/junit/cypress-results.xml"

echo ""
print_status "Pipeline test completed successfully! 🚀"
