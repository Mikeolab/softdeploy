# SoftDeploy - Deployment Guide

## 🚀 Render Deployment

This application is configured for deployment on Render.com with the following structure:

### Build Process
1. **Root dependencies** installed
2. **Server dependencies** installed (production only)
3. **Client dependencies** installed
4. **Client build** completed
5. **Server started** with proper error handling

### Key Files
- `server.js` - Root server entry point with dependency handling
- `render.yaml` - Render deployment configuration
- `package.json` - Build and start scripts
- `server/index.js` - Main server logic
- `client/dist/` - Built React application

### Environment Variables
- `NODE_ENV=production`
- `PORT=3001` (or Render-assigned port)

### Troubleshooting
If you see "Cannot find module 'express'" error:
1. Check that `server/package.json` has all required dependencies
2. Verify build script runs `npm install` in server directory
3. Ensure `server.js` handles missing dependencies gracefully

### Local Development
```bash
npm run dev  # Runs both client and server
npm run dev:client  # Client only
npm run dev:server  # Server only
```
