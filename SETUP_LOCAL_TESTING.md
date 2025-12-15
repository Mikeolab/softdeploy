# Local Testing Setup Guide

## Install Node.js

### Option 1: Using Homebrew (Recommended)
```bash
brew install node
```

### Option 2: Download from Node.js website
1. Go to https://nodejs.org/
2. Download the LTS version (recommended)
3. Install the .pkg file

### Verify Installation
```bash
node --version  # Should show v20.x.x or similar
npm --version   # Should show 10.x.x or similar
```

## Test Locally

### 1. Navigate to client directory
```bash
cd /Users/mikeolab/devops-real-app/client
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start development server
```bash
npm run dev
```

This will start a local server (usually at http://localhost:5173)

### 4. Build for production (to test build errors)
```bash
npm run build
```

This will create a `dist` folder with the production build. If there are any errors, they'll show here.

### 5. Preview production build
```bash
npm run preview
```

## Common Issues

### If npm commands don't work after installing Node.js:
1. Close and reopen your terminal
2. Or run: `source ~/.zshrc` (or `source ~/.bash_profile` if using bash)

### If you get permission errors:
```bash
sudo chown -R $(whoami) ~/.npm
```

## Quick Test Checklist

Before pushing to GitHub:
- [ ] Run `npm run build` - should complete without errors
- [ ] Run `npm run dev` - should start without errors
- [ ] Check browser console for any runtime errors
- [ ] Test the page locally at http://localhost:5173
