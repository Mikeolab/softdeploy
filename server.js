// Root server entry point for deployment
const path = require('path');

// Check if server dependencies are installed
try {
  require('express');
  console.log('✅ Express found - running server...');
  
  // Start the server
  require('./server/index.js');
  
} catch (error) {
  console.error('❌ Server dependencies not found:', error.message);
  console.log('🔧 Installing server dependencies...');
  
  const { execSync } = require('child_process');
  try {
    execSync('cd server && npm install --production', { stdio: 'inherit' });
    console.log('✅ Server dependencies installed successfully');
    require('./server/index.js');
  } catch (installError) {
    console.error('❌ Failed to install server dependencies:', installError.message);
    process.exit(1);
  }
}
