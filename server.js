// server.js - Production entry point
// This file is the main entry point for production deployment
// It imports and runs the real-time test execution server

const path = require('path');

console.log('🚀 Starting SoftDeploy production server...');
console.log('📁 Server directory:', __dirname);
console.log('📄 Loading server from:', path.join(__dirname, 'server/index-real.js'));

// Import the real-time server
require('./server/index-real.js');

console.log('✅ Server loaded successfully');