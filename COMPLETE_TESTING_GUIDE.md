# 🧪 **COMPLETE TESTING GUIDE WITH SAMPLE DATA**

## 📋 **OVERVIEW**
This guide provides comprehensive sample data for testing all test types and tools in the SoftDeploy platform. Each example includes realistic data that you can copy and paste directly into the test configuration forms.

---

## 🚀 **API TESTING EXAMPLES**

### **1. Tcall.ai API Tests (Real API)**
```json
{
  "name": "Tcall.ai User Authentication API Tests",
  "description": "Comprehensive API testing for Tcall.ai user authentication endpoints",
  "testType": "API",
  "toolId": "axios",
  "baseUrl": "https://api.tcall.ai",
  "userStories": [
    {
      "title": "As a user, I want to authenticate with my credentials",
      "priority": "High",
      "description": "User should be able to login with valid email and password",
      "acceptanceCriteria": [
        "Login endpoint returns 200 status",
        "Response includes access token",
        "Response time under 2 seconds"
      ]
    },
    {
      "title": "As a user, I want to register a new account",
      "priority": "High", 
      "description": "New users should be able to create accounts",
      "acceptanceCriteria": [
        "Registration endpoint returns 201 status",
        "User data is properly validated",
        "Email verification is sent"
      ]
    }
  ],
  "steps": [
    {
      "name": "Login User",
      "type": "api",
      "description": "Send POST request to login endpoint with user credentials",
      "config": {
        "method": "POST",
        "url": "/auth/login",
        "headers": {
          "Content-Type": "application/json"
        },
        "body": {
          "email": "test@example.com",
          "password": "testpassword123"
        },
        "validation": {
          "statusCode": 200,
          "responseTime": 2000,
          "responseBody": {
            "access_token": "string",
            "user": "object"
          }
        }
      }
    },
    {
      "name": "Get User Profile",
      "type": "api", 
      "description": "Retrieve user profile information",
      "config": {
        "method": "GET",
        "url": "/user/profile",
        "headers": {
          "Authorization": "Bearer {{access_token}}"
        },
        "validation": {
          "statusCode": 200,
          "responseTime": 1000
        }
      }
    },
    {
      "name": "Update User Profile",
      "type": "api",
      "description": "Update user profile information",
      "config": {
        "method": "PUT",
        "url": "/user/profile",
        "headers": {
          "Authorization": "Bearer {{access_token}}",
          "Content-Type": "application/json"
        },
        "body": {
          "firstName": "John",
          "lastName": "Doe",
          "phone": "+1234567890"
        },
        "validation": {
          "statusCode": 200,
          "responseTime": 1500
        }
      }
    }
  ]
}
```

### **2. JSONPlaceholder API Tests (Demo API)**
```json
{
  "name": "JSONPlaceholder Posts API Tests",
  "description": "Testing CRUD operations on posts endpoint",
  "testType": "API",
  "toolId": "axios",
  "baseUrl": "https://jsonplaceholder.typicode.com",
  "userStories": [
    {
      "title": "As a developer, I want to retrieve all posts",
      "priority": "Medium",
      "description": "Should be able to get a list of all posts",
      "acceptanceCriteria": [
        "GET /posts returns 200 status",
        "Response contains array of posts",
        "Each post has required fields"
      ]
    }
  ],
  "steps": [
    {
      "name": "Get All Posts",
      "type": "api",
      "description": "Retrieve all posts from the API",
      "config": {
        "method": "GET",
        "url": "/posts",
        "validation": {
          "statusCode": 200,
          "responseTime": 1000
        }
      }
    },
    {
      "name": "Get Single Post",
      "type": "api",
      "description": "Retrieve a specific post by ID",
      "config": {
        "method": "GET", 
        "url": "/posts/1",
        "validation": {
          "statusCode": 200,
          "responseTime": 500
        }
      }
    },
    {
      "name": "Create New Post",
      "type": "api",
      "description": "Create a new post",
      "config": {
        "method": "POST",
        "url": "/posts",
        "headers": {
          "Content-Type": "application/json"
        },
        "body": {
          "title": "Test Post",
          "body": "This is a test post",
          "userId": 1
        },
        "validation": {
          "statusCode": 201,
          "responseTime": 1000
        }
      }
    }
  ]
}
```

---

## 🎭 **FUNCTIONAL TESTING EXAMPLES**

### **1. E-commerce Website Testing**
```json
{
  "name": "E-commerce Website Functional Tests",
  "description": "End-to-end testing of e-commerce website functionality",
  "testType": "Functional",
  "toolId": "puppeteer",
  "baseUrl": "https://demo.opencart.com",
  "userStories": [
    {
      "title": "As a customer, I want to browse products",
      "priority": "High",
      "description": "Customer should be able to view product catalog",
      "acceptanceCriteria": [
        "Product page loads successfully",
        "Product images are visible",
        "Add to cart button works"
      ]
    },
    {
      "title": "As a customer, I want to add items to cart",
      "priority": "High",
      "description": "Customer should be able to add products to shopping cart",
      "acceptanceCriteria": [
        "Add to cart button is clickable",
        "Cart counter updates",
        "Success message appears"
      ]
    }
  ],
  "steps": [
    {
      "name": "Navigate to Homepage",
      "type": "navigation",
      "description": "Open the e-commerce website homepage",
      "config": {
        "url": "https://demo.opencart.com"
      }
    },
    {
      "name": "Click on Products Menu",
      "type": "interaction",
      "description": "Click on the products menu to view catalog",
      "config": {
        "selector": "a[href*='product'], .nav-link, #menu",
        "action": "click"
      }
    },
    {
      "name": "Verify Product Page Loads",
      "type": "assertion",
      "description": "Verify that product page loads successfully",
      "config": {
        "selector": ".product-thumb, .product-info, h1",
        "assertion": "visible"
      }
    },
    {
      "name": "Add Product to Cart",
      "type": "interaction",
      "description": "Click add to cart button",
      "config": {
        "selector": "button[onclick*='cart'], .btn-cart, #button-cart",
        "action": "click"
      }
    },
    {
      "name": "Verify Cart Success Message",
      "type": "assertion",
      "description": "Verify success message appears after adding to cart",
      "config": {
        "selector": ".alert-success, .success, .notification",
        "assertion": "visible"
      }
    }
  ]
}
```

### **2. Google Search Testing**
```json
{
  "name": "Google Search Functional Tests",
  "description": "Testing Google search functionality",
  "testType": "Functional", 
  "toolId": "puppeteer",
  "baseUrl": "https://www.google.com",
  "userStories": [
    {
      "title": "As a user, I want to search for information",
      "priority": "High",
      "description": "User should be able to search and get relevant results",
      "acceptanceCriteria": [
        "Search box is visible and clickable",
        "Search results are displayed",
        "Results are relevant to search query"
      ]
    }
  ],
  "steps": [
    {
      "name": "Navigate to Google",
      "type": "navigation",
      "description": "Open Google homepage",
      "config": {
        "url": "https://www.google.com"
      }
    },
    {
      "name": "Accept Cookies",
      "type": "interaction",
      "description": "Accept cookies if popup appears",
      "config": {
        "selector": "button[id*='accept'], button[id*='agree'], #L2AGLb",
        "action": "click"
      }
    },
    {
      "name": "Enter Search Query",
      "type": "interaction",
      "description": "Type search query in search box",
      "config": {
        "selector": "input[name='q'], textarea[name='q'], #search",
        "action": "type",
        "value": "SoftDeploy testing platform"
      }
    },
    {
      "name": "Submit Search",
      "type": "interaction",
      "description": "Press Enter or click search button",
      "config": {
        "selector": "input[name='btnK'], button[type='submit']",
        "action": "click"
      }
    },
    {
      "name": "Verify Search Results",
      "type": "assertion",
      "description": "Verify search results are displayed",
      "config": {
        "selector": "#search, .g, .rc, h3",
        "assertion": "visible"
      }
    }
  ]
}
```

---

## ⚡ **PERFORMANCE TESTING EXAMPLES**

### **1. Load Testing with K6**
```json
{
  "name": "API Load Testing with K6",
  "description": "Load testing API endpoints to measure performance under stress",
  "testType": "Performance",
  "toolId": "k6",
  "baseUrl": "https://api.tcall.ai",
  "userStories": [
    {
      "title": "As a developer, I want to ensure API can handle concurrent users",
      "priority": "High",
      "description": "API should handle multiple concurrent requests without degradation",
      "acceptanceCriteria": [
        "Response time under 2 seconds",
        "Error rate below 1%",
        "Can handle 100 concurrent users"
      ]
    }
  ],
  "steps": [
    {
      "name": "Load Test Login Endpoint",
      "type": "loadTest",
      "description": "Test login endpoint under load",
      "config": {
        "url": "/auth/login",
        "method": "POST",
        "duration": "30s",
        "users": 50,
        "rampUpTime": 10,
        "headers": {
          "Content-Type": "application/json"
        },
        "body": {
          "email": "test@example.com",
          "password": "testpassword123"
        },
        "thresholds": {
          "responseTime": 2000,
          "errorRate": 0.01
        }
      }
    },
    {
      "name": "Load Test Profile Endpoint",
      "type": "loadTest",
      "description": "Test profile endpoint under load",
      "config": {
        "url": "/user/profile",
        "method": "GET",
        "duration": "60s",
        "users": 100,
        "rampUpTime": 20,
        "headers": {
          "Authorization": "Bearer {{access_token}}"
        },
        "thresholds": {
          "responseTime": 1000,
          "errorRate": 0.005
        }
      }
    }
  ]
}
```

### **2. Stress Testing with Inbuilt Tool**
```json
{
  "name": "Website Stress Testing",
  "description": "Stress testing website to find breaking point",
  "testType": "Performance",
  "toolId": "inbuilt",
  "baseUrl": "https://jsonplaceholder.typicode.com",
  "userStories": [
    {
      "title": "As a developer, I want to find the system's breaking point",
      "priority": "Medium",
      "description": "Determine maximum load the system can handle",
      "acceptanceCriteria": [
        "System handles 200+ concurrent users",
        "Graceful degradation under extreme load",
        "Recovery after load reduction"
      ]
    }
  ],
  "steps": [
    {
      "name": "Stress Test Posts Endpoint",
      "type": "stressTest",
      "description": "Apply extreme load to posts endpoint",
      "config": {
        "url": "/posts",
        "method": "GET",
        "duration": "120s",
        "users": 200,
        "rampUpTime": 30,
        "thresholds": {
          "responseTime": 5000,
          "errorRate": 0.05
        }
      }
    },
    {
      "name": "Spike Test",
      "type": "spikeTest",
      "description": "Test system response to sudden traffic spikes",
      "config": {
        "url": "/posts/1",
        "method": "GET",
        "duration": "60s",
        "users": 500,
        "rampUpTime": 5,
        "thresholds": {
          "responseTime": 10000,
          "errorRate": 0.1
        }
      }
    }
  ]
}
```

---

## 🔧 **CYPRESS TESTING EXAMPLES**

### **1. E-commerce Cypress Tests**
```json
{
  "name": "E-commerce Cypress E2E Tests",
  "description": "End-to-end testing with Cypress for e-commerce flow",
  "testType": "Functional",
  "toolId": "cypress",
  "baseUrl": "https://demo.opencart.com",
  "userStories": [
    {
      "title": "As a customer, I want to complete a purchase",
      "priority": "High",
      "description": "Complete end-to-end purchase flow",
      "acceptanceCriteria": [
        "Can browse products",
        "Can add to cart",
        "Can proceed to checkout",
        "Can complete purchase"
      ]
    }
  ],
  "steps": [
    {
      "name": "Browse Products",
      "type": "cypress",
      "description": "Navigate and browse product catalog",
      "config": {
        "commands": [
          "cy.visit('/')",
          "cy.get('.product-thumb').first().click()",
          "cy.get('h1').should('be.visible')",
          "cy.get('#button-cart').click()",
          "cy.get('.alert-success').should('contain', 'Success')"
        ]
      }
    },
    {
      "name": "Add to Cart and Checkout",
      "type": "cypress",
      "description": "Add product to cart and proceed to checkout",
      "config": {
        "commands": [
          "cy.get('#cart-total').click()",
          "cy.get('.btn-block').contains('Checkout').click()",
          "cy.url().should('include', 'checkout')",
          "cy.get('h1').should('contain', 'Checkout')"
        ]
      }
    }
  ]
}
```

---

## 📊 **TEST CONFIGURATION TEMPLATES**

### **Quick Test Templates**

#### **API Test Template**
```json
{
  "name": "{{Test Name}}",
  "description": "{{Test Description}}",
  "testType": "API",
  "toolId": "axios",
  "baseUrl": "{{Your API Base URL}}",
  "steps": [
    {
      "name": "{{Step Name}}",
      "type": "api",
      "description": "{{Step Description}}",
      "config": {
        "method": "{{GET|POST|PUT|DELETE}}",
        "url": "{{Endpoint Path}}",
        "headers": {
          "Content-Type": "application/json"
        },
        "body": {{Request Body}},
        "validation": {
          "statusCode": {{Expected Status Code}},
          "responseTime": {{Max Response Time}}
        }
      }
    }
  ]
}
```

#### **Functional Test Template**
```json
{
  "name": "{{Test Name}}",
  "description": "{{Test Description}}",
  "testType": "Functional",
  "toolId": "puppeteer",
  "baseUrl": "{{Website URL}}",
  "steps": [
    {
      "name": "{{Step Name}}",
      "type": "{{navigation|interaction|assertion}}",
      "description": "{{Step Description}}",
      "config": {
        "url": "{{URL for navigation}}",
        "selector": "{{CSS Selector}}",
        "action": "{{click|type|hover}}",
        "value": "{{Input Value}}",
        "assertion": "{{visible|contains|equals}}"
      }
    }
  ]
}
```

#### **Performance Test Template**
```json
{
  "name": "{{Test Name}}",
  "description": "{{Test Description}}",
  "testType": "Performance",
  "toolId": "{{k6|inbuilt}}",
  "baseUrl": "{{API Base URL}}",
  "steps": [
    {
      "name": "{{Step Name}}",
      "type": "{{loadTest|stressTest|spikeTest}}",
      "description": "{{Step Description}}",
      "config": {
        "url": "{{Endpoint}}",
        "method": "{{HTTP Method}}",
        "duration": "{{Test Duration}}",
        "users": {{Number of Users}},
        "rampUpTime": {{Ramp Up Time}},
        "thresholds": {
          "responseTime": {{Max Response Time}},
          "errorRate": {{Max Error Rate}}
        }
      }
    }
  ]
}
```

---

## 🎯 **TESTING WORKFLOW STEPS**

### **1. Create Test Folder**
- **Folder Name**: `Tcall.ai API Tests`
- **Description**: `Comprehensive API testing for Tcall.ai endpoints`

### **2. Configure Test Suite**
- **Test Suite Name**: `User Authentication API Tests`
- **Description**: `Test user login, registration, and authentication endpoints`
- **Test Type**: `API`
- **Tool**: `Axios (API)`
- **Base URL**: `https://api.tcall.ai`

### **3. Add User Stories**
- **Story Title**: `As a user, I want to authenticate with my credentials`
- **Priority**: `High`
- **Description**: `User should be able to login with valid email and password`
- **Acceptance Criteria**: 
  - Login endpoint returns 200 status
  - Response includes access token
  - Response time under 2 seconds

### **4. Add Test Steps**
- **Step Name**: `Login User`
- **Description**: `Send POST request to login endpoint with user credentials`
- **Method**: `POST`
- **URL**: `/auth/login`
- **Headers**: `Content-Type: application/json`
- **Body**: `{"email": "test@example.com", "password": "testpassword123"}`
- **Validation**: Status Code 200, Response Time < 2000ms

### **5. Run Test**
- Click `Run Test` button
- Monitor real-time execution
- View detailed results and logs
- Check pass/fail status for each step

---

## 🚀 **QUICK START EXAMPLES**

### **Test Tcall.ai API (Copy & Paste Ready)**
```json
{
  "name": "Tcall.ai Login Test",
  "description": "Test user login functionality",
  "testType": "API",
  "toolId": "axios",
  "baseUrl": "https://api.tcall.ai",
  "steps": [
    {
      "name": "Login Test",
      "type": "api",
      "description": "Test user login",
      "config": {
        "method": "POST",
        "url": "/auth/login",
        "headers": {"Content-Type": "application/json"},
        "body": {"email": "test@example.com", "password": "testpassword123"},
        "validation": {"statusCode": 200, "responseTime": 2000}
      }
    }
  ]
}
```

### **Test Google Search (Copy & Paste Ready)**
```json
{
  "name": "Google Search Test",
  "description": "Test Google search functionality",
  "testType": "Functional",
  "toolId": "puppeteer",
  "baseUrl": "https://www.google.com",
  "steps": [
    {
      "name": "Search Test",
      "type": "interaction",
      "description": "Search for SoftDeploy",
      "config": {
        "selector": "input[name='q']",
        "action": "type",
        "value": "SoftDeploy testing platform"
      }
    }
  ]
}
```

---

## 📝 **USAGE INSTRUCTIONS**

1. **Copy** any of the sample configurations above
2. **Paste** into the test configuration form
3. **Modify** URLs, selectors, or data as needed
4. **Run** the test to see results
5. **Analyze** the detailed execution logs
6. **Iterate** and improve based on results

This comprehensive guide provides everything you need to test all aspects of the SoftDeploy platform with realistic, working examples!
