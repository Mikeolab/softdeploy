// Debug server with explicit error handling
console.log('Starting debug server...');

try {
  const express = require('express');
  const cors = require('cors');
  
  console.log('Express and CORS loaded successfully');
  
  const app = express();
  const PORT = 3001;
  
  console.log('App created, setting up middleware...');
  
  app.use(cors());
  app.use(express.json());
  
  console.log('Middleware set up, adding routes...');
  
  app.get('/api/health', (req, res) => {
    console.log('Health check requested');
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      message: 'Debug server is working'
    });
  });
  
  console.log('Routes added, starting server...');
  
  const server = app.listen(PORT, () => {
    console.log(`🚀 Debug server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  });
  
  server.on('error', (error) => {
    console.error('Server error:', error);
  });
  
  console.log('Server started successfully');
  
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}

// Handle errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
