# SoftDeploy - Real Test Management Application

A comprehensive test management platform with **real server-side test execution**, **AI-powered test generation**, **user management**, and **unified reporting**.

## 🚀 Real Application Features

### ✅ What Makes This a REAL App (Not Demo)

1. **Server-Side Test Execution**: Real browser automation using Puppeteer
2. **Actual HTTP Requests**: Real API testing with axios and fetch
3. **WebSocket Real-Time Updates**: Live test execution progress
4. **AI-Powered Test Generation**: Gemini AI integration for intelligent test creation
5. **User Management & Invitations**: Complete user authentication and project collaboration
6. **Account Switching**: Personal vs invited project contexts
7. **Unified Reporting**: Mochawesome reports with Jenkins integration
8. **Sample Data Management**: Editable sample data for testing

### 🧪 Test Types Supported

- **API Testing**: Real HTTP requests with authentication, headers, body, validation
- **Functional Testing**: Real browser automation (navigation, interactions, assertions)
- **Performance Testing**: Real load and stress testing with concurrent users
- **AI-Generated Tests**: Intelligent test creation using natural language prompts

### 🛠️ Technology Stack

**Backend (Real Test Execution)**:
- Node.js + Express
- Puppeteer (Real browser automation)
- WebSocket (Real-time communication)
- Axios (Real HTTP requests)
- Gemini AI (Test generation)

**Frontend (Test Management UI)**:
- React + Vite
- Tailwind CSS
- Real-time WebSocket updates
- AI Assistant integration

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
npm start

# Or start separately:
npm run dev:server  # Backend on port 5000
npm run dev:client  # Frontend on port 5173
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 🌱 Sample Data Management

### Seeding Sample Data

```bash
# Seed sample data for testing
cd server
npm run seed:sample
```

This creates:
- 3 sample users
- 3 sample projects
- 3 sample test suites
- 3 sample test runs
- LocalStorage test data

### Sample Data Editor

Access the sample data editor at `/sample-data-editor` to:
- View and edit sample data
- Add new projects, users, test suites
- Delete existing data
- Persist changes across sessions

## 🧪 How to Use Real Testing

### 1. Creating Test Suites

#### Manual Creation
1. Navigate to **Test Management** → **Create Test Suite**
2. Fill in the form with:
   - **Name**: Test suite name
   - **Description**: What the suite tests
   - **Test Type**: API, UI, or Performance
   - **Tool**: axios, playwright, etc.
   - **Base URL**: Target application URL
   - **Steps**: Individual test steps

#### AI-Powered Creation
1. Click the **AI Assistant** button (✨)
2. Describe your test requirements in natural language
3. AI generates test steps automatically
4. Review and modify generated steps
5. Save the test suite

### 2. Duplicating Test Suites

1. Find an existing test suite
2. Click the **Duplicate** button (📋)
3. Modify the duplicated suite as needed
4. Save with a new name

### 3. Editing Test Suites

1. Click the **Edit** button (✏️) on any test suite
2. Modify the test suite details
3. Add, remove, or reorder test steps
4. Save changes

### 4. Running Tests

1. Click **Run Test** (▶️) on any test suite
2. Watch real-time execution progress
3. View detailed logs and results
4. Access test artifacts (screenshots, videos)

## 👥 User Management & Collaboration

### Account Switching

The application supports two contexts:
- **Personal**: Your own projects and test suites
- **Invited Projects**: Projects you've been invited to

Switch between contexts using the **Account Switcher** in the sidebar.

### Inviting Team Members

1. Navigate to **Project Members** page
2. Click **Invite Member**
3. Enter email address and role (Owner, Admin, Member)
4. Send invitation
5. Invited user receives email with acceptance link

### Roles & Permissions

- **Owner**: Full project control, can invite/remove members
- **Admin**: Can create/edit test suites, run tests
- **Member**: Can view and run tests

## 📊 Unified Reporting & CI/CD

### Local Testing

```bash
# Run all tests with unified reporting
cd client
npm run test:e2e:report
```

This generates:
- **HTML Report**: `cypress/reports/html/index.html`
- **JSON Report**: `cypress/reports/merged-report.json`
- **JUnit XML**: `cypress/reports/junit/cypress-results.xml`
- **Videos**: `cypress/videos/`
- **Screenshots**: `cypress/screenshots/`

### Jenkins Integration

The `Jenkinsfile` provides:
- **Parallel Test Execution**: Unit tests and E2E tests run simultaneously
- **Artifact Archiving**: Videos, screenshots, and reports
- **Slack Notifications**: Success/failure notifications with screenshots
- **JUnit Integration**: Test trends and history
- **HTML Report Publishing**: Accessible test reports

### Testing Commands

```bash
# Global testing commands (run after every queue)
npm run seed:sample    # Seed sample data
npm run test:unit      # Run unit tests
npm run test:api       # Run API tests
npm run test:e2e       # Run E2E tests
```

## 🔧 Real Test Execution Architecture

```
┌─────────────────┐    WebSocket    ┌─────────────────┐
│   React Client  │ ←──────────────→ │  Node.js Server │
│   (Port 5173)   │                  │   (Port 5000)   │
└─────────────────┘                  └─────────────────┘
         │                                     │
         │ HTTP API Calls                     │
         ▼                                     ▼
┌─────────────────┐                  ┌─────────────────┐
│  Test Builder   │                  │  Puppeteer      │
│  AI Assistant   │                  │  Browser Control│
└─────────────────┘                  └─────────────────┘
         │                                     │
         │ Test Suite Data                     │
         ▼                                     ▼
┌─────────────────┐                  ┌─────────────────┐
│  Account Switcher│                  │  Real HTTP       │
│  User Management│                  │  Requests        │
└─────────────────┘                  └─────────────────┘
```

## 📊 Real Test Execution Flow

1. **User creates test suite** (manually or via AI)
2. **Test suite sent to server** via HTTP API
3. **Server initializes real browser** (Puppeteer)
4. **Real test execution** with actual browser automation
5. **Real-time progress updates** via WebSocket
6. **Real results returned** to client
7. **Test results stored** for history
8. **Unified reports generated** for CI/CD

## 🔍 Feature Comparison

| Feature | Demo Version | Real Version |
|---------|-------------|--------------|
| API Testing | Simulated responses | Real HTTP requests |
| Browser Testing | Mock interactions | Real Puppeteer automation |
| AI Test Generation | ❌ | ✅ Gemini AI integration |
| User Management | ❌ | ✅ Complete auth & invitations |
| Account Switching | ❌ | ✅ Personal vs invited contexts |
| Unified Reporting | ❌ | ✅ Mochawesome + Jenkins |
| Sample Data Editor | ❌ | ✅ Editable sample data |
| Real-time Updates | Polling | WebSocket streaming |
| Test Execution | Client-side only | Server-side with browser control |

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
# Server port (default: 5000)
PORT=5000

# AI Integration (optional)
GEMINI_API_KEY=your_gemini_api_key

# Supabase (optional)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in package.json
2. **Puppeteer issues**: Ensure Node.js 18+ and proper permissions
3. **WebSocket connection**: Check server is running on port 5000
4. **CORS issues**: Server includes CORS middleware
5. **AI features disabled**: Set GEMINI_API_KEY environment variable

### Debug Mode

```bash
# Server with debug logging
cd server && DEBUG=* npm run dev

# Client with debug logging
cd client && npm run dev -- --debug
```

## 📈 Next Steps

- [x] Real Cypress integration
- [x] Real test reporting and analytics
- [x] Real user authentication
- [x] Real AI test generation
- [x] Real project collaboration
- [x] Real CI/CD integration
- [ ] Real test scheduling
- [ ] Real performance monitoring
- [ ] Real test data management

---

**This is a REAL application that performs REAL testing with AI, collaboration, and unified reporting!** 🎯
