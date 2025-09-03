# SoftDeploy - Real Test Management Application

A comprehensive test management platform with **real server-side test execution** using Puppeteer, browser automation, and actual HTTP requests.

## 🚀 Real Application Features

### ✅ What Makes This a REAL App (Not Demo)

1. **Server-Side Test Execution**: Real browser automation using Puppeteer
2. **Actual HTTP Requests**: Real API testing with axios and fetch
3. **WebSocket Real-Time Updates**: Live test execution progress
4. **Browser Control**: Real functional testing with actual browser interactions
5. **Performance Testing**: Real load testing with concurrent requests
6. **Variable Management**: Real session management and data extraction
7. **Test Persistence**: Real test suite storage and execution history

### 🧪 Test Types Supported

- **API Testing**: Real HTTP requests with authentication, headers, body, validation
- **Functional Testing**: Real browser automation (navigation, interactions, assertions)
- **Performance Testing**: Real load and stress testing with concurrent users

### 🛠️ Technology Stack

**Backend (Real Test Execution)**:
- Node.js + Express
- Puppeteer (Real browser automation)
- WebSocket (Real-time communication)
- Axios (Real HTTP requests)

**Frontend (Test Management UI)**:
- React + Vite
- Tailwind CSS
- Real-time WebSocket updates

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install all dependencies (root, server, client)
npm run install:all

# Or install manually:
npm install
cd server && npm install
cd ../client && npm install
```

### Running the Application

```bash
# Start both server and client together
npm run dev

# Or start separately:
npm run dev:server  # Backend on port 3001
npm run dev:client  # Frontend on port 5173
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## 🧪 How to Use Real Testing

### 1. API Testing (Real HTTP Requests)

Create API test steps with:
- **Real HTTP methods**: GET, POST, PUT, DELETE, PATCH
- **Real authentication**: Bearer tokens, Basic auth
- **Real headers and parameters**: Custom headers, query params
- **Real request bodies**: JSON payloads
- **Real validation**: Status codes, response times, JSON path validation
- **Real variable extraction**: Extract data from responses for subsequent steps

### 2. Functional Testing (Real Browser Automation)

Create functional test steps with:
- **Real navigation**: Navigate to URLs with real browser
- **Real interactions**: Click, type, select, hover, scroll
- **Real assertions**: Element existence, text content, visibility
- **Real waiting**: Wait for elements, network idle
- **Real screenshots**: Capture browser state

### 3. Performance Testing (Real Load Testing)

Create performance test steps with:
- **Real concurrent users**: Simulate multiple users
- **Real request timing**: Measure actual response times
- **Real error tracking**: Track failed requests
- **Real metrics**: Requests per second, average response time

## 🔧 Real Test Execution Architecture

```
┌─────────────────┐    WebSocket    ┌─────────────────┐
│   React Client  │ ←──────────────→ │  Node.js Server │
│   (Port 5173)   │                  │   (Port 3001)   │
└─────────────────┘                  └─────────────────┘
         │                                     │
         │ HTTP API Calls                     │
         ▼                                     ▼
┌─────────────────┐                  ┌─────────────────┐
│  Test Builder   │                  │  Puppeteer      │
│  UI Components  │                  │  Browser Control│
└─────────────────┘                  └─────────────────┘
         │                                     │
         │ Test Suite Data                     │
         ▼                                     ▼
┌─────────────────┐                  ┌─────────────────┐
│  Test Executor  │                  │  Real HTTP       │
│  (Client-side)  │                  │  Requests        │
└─────────────────┘                  └─────────────────┘
```

## 📊 Real Test Execution Flow

1. **User creates test suite** in React UI
2. **Test suite sent to server** via HTTP API
3. **Server initializes real browser** (Puppeteer)
4. **Real test execution** with actual browser automation
5. **Real-time progress updates** via WebSocket
6. **Real results returned** to client
7. **Test results stored** for history

## 🔍 Real vs Demo Features

| Feature | Demo Version | Real Version |
|---------|-------------|--------------|
| API Testing | Simulated responses | Real HTTP requests |
| Browser Testing | Mock interactions | Real Puppeteer automation |
| Performance Testing | Simulated load | Real concurrent requests |
| Real-time Updates | Polling | WebSocket streaming |
| Test Execution | Client-side only | Server-side with browser control |
| Variable Management | Basic | Real session data extraction |
| Error Handling | Basic | Real error detection and reporting |

## 🚀 Deployment

### For Production

```bash
# Build the client
npm run build

# Start the server (serves built client)
npm start
```

### Environment Variables

```bash
# Server port (default: 3001)
PORT=3001

# Client port (default: 5173)
VITE_PORT=5173
```

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in package.json
2. **Puppeteer issues**: Ensure Node.js 18+ and proper permissions
3. **WebSocket connection**: Check server is running on port 3001
4. **CORS issues**: Server includes CORS middleware

### Debug Mode

```bash
# Server with debug logging
cd server && DEBUG=* npm run dev

# Client with debug logging
cd client && npm run dev -- --debug
```

## 📈 Next Steps

- [ ] Add real Cypress integration
- [ ] Add real k6 performance testing
- [ ] Add real test reporting and analytics
- [ ] Add real user authentication
- [ ] Add real test scheduling
- [ ] Add real CI/CD integration

---

**This is a REAL application that performs REAL testing, not a demo!** 🎯
