// Root server entry point for deployment
const path = require('path');

console.log('🚀 Starting SoftDeploy server...');
console.log('📁 Current directory:', process.cwd());
console.log('📦 Node version:', process.version);
console.log('🌍 Environment:', process.env.NODE_ENV || 'development');

// Handle errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Check if server dependencies are installed
try {
  console.log('🔍 Checking server dependencies...');
  require('express');
  console.log('✅ Express found - running server...');
  
  // Start the server (deployment version)
  require('./server/index-deploy.js');
  
} catch (error) {
  console.error('❌ Server dependencies not found:', error.message);
  console.log('🔧 Installing server dependencies...');
  
  const { execSync } = require('child_process');
  try {
    execSync('cd server && npm install --production', { stdio: 'inherit' });
    console.log('✅ Server dependencies installed successfully');
    require('./server/index-deploy.js');
  } catch (installError) {
    console.error('❌ Failed to install server dependencies:', installError.message);
    console.error('📋 Install error details:', installError);
    process.exit(1);
  }
}
