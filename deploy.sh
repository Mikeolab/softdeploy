#!/bin/bash
# deploy.sh - Deployment script for Render

echo "🚀 Starting deployment..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install server dependencies
echo "🔧 Installing server dependencies..."
cd server
npm install --production
cd ..

# Install client dependencies
echo "🎨 Installing client dependencies..."
cd client
npm install
npm run build
cd ..

echo "✅ Deployment setup complete!"
