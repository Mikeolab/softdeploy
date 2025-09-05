// server.js - Production entry point
// This file is the main entry point for production deployment
// It imports and runs the real-time test execution server

const path = require('path');

// Import the real-time server
require('./server/index-real.js');