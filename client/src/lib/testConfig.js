// src/lib/testConfig.js
// Advanced test configuration system

export const TEST_TOOLS = {
  inbuilt: {
    id: 'inbuilt',
    name: 'Inbuilt Test Runner',
    description: 'Built-in testing capabilities',
    icon: '🔧',
    category: 'internal',
    capabilities: ['api', 'functional', 'performance'],
    features: [
      'Real HTTP requests',
      'Response validation',
      'Session management',
      'Variable extraction',
      'Conditional logic'
    ]
  },
  external: {
    id: 'external',
    name: 'External Tools',
    description: 'Professional testing frameworks',
    icon: '🛠️',
    category: 'external',
    tools: {
      cypress: {
        id: 'cypress',
        name: 'Cypress',
        description: 'End-to-end testing framework',
        icon: '🟡',
        capabilities: ['functional', 'e2e'],
        features: [
          'Browser automation',
          'Real-time reload',
          'Time travel debugging',
          'Network stubbing',
          'Visual testing'
        ],
        installation: 'npm install cypress --save-dev',
        setup: 'npx cypress open',
        quickTest: {
          enabled: true,
          name: 'Quick Cypress Test',
          description: 'Paste your Cypress script and run it instantly',
          placeholder: `describe('My Test Suite', () => {
  it('should visit the homepage', () => {
    cy.visit('https://example.com')
    cy.contains('Welcome').should('be.visible')
  })
})`,
          language: 'javascript',
          fileExtension: '.cy.js'
        }
      },
      k6: {
        id: 'k6',
        name: 'k6',
        description: 'Modern load testing tool',
        icon: '🟣',
        capabilities: ['performance', 'load'],
        features: [
          'Load testing',
          'Stress testing',
          'Spike testing',
          'Real-time metrics',
          'Cloud execution'
        ],
        installation: 'npm install k6 --save-dev',
        setup: 'k6 run script.js',
        quickTest: {
          enabled: true,
          name: 'Quick k6 Test',
          description: 'Paste your k6 script and run load testing instantly',
          placeholder: `import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 10,
  duration: '30s',
};

export default function() {
  let response = http.get('https://httpbin.org/get');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}`,
          language: 'javascript',
          fileExtension: '.js'
        }
      },
      playwright: {
        id: 'playwright',
        name: 'Playwright',
        description: 'End-to-end testing framework',
        icon: '🎭',
        capabilities: ['functional', 'e2e'],
        features: [
          'Multi-browser support',
          'Mobile testing',
          'API testing',
          'Visual testing',
          'Auto-waiting'
        ],
        installation: 'npm install playwright',
        setup: 'npx playwright test',
        quickTest: {
          enabled: true,
          name: 'Quick Playwright Test',
          description: 'Paste your Playwright script and run it instantly',
          placeholder: `import { test, expect } from '@playwright/test';

test('homepage has title', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page).toHaveTitle(/Example Domain/);
  await expect(page.locator('h1')).toBeVisible();
});`,
          language: 'javascript',
          fileExtension: '.spec.js'
        }
      },
      jmeter: {
        id: 'jmeter',
        name: 'Apache JMeter',
        description: 'Load testing and performance',
        icon: '🟠',
        capabilities: ['performance', 'load'],
        features: [
          'Load testing',
          'Performance testing',
          'GUI interface',
          'Plugin ecosystem',
          'Distributed testing'
        ],
        installation: 'Download from apache.org',
        setup: 'java -jar ApacheJMeter.jar'
      }
    }
  }
};

export const API_STEP_TYPES = {
  request: {
    id: 'request',
    name: 'HTTP Request',
    description: 'Make HTTP requests with full configuration',
    fields: {
      method: {
        type: 'select',
        options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
        required: true
      },
      url: {
        type: 'text',
        placeholder: 'https://api.example.com/endpoint',
        required: true
      },
      headers: {
        type: 'keyvalue',
        placeholder: 'Content-Type: application/json'
      },
      params: {
        type: 'keyvalue',
        placeholder: 'query parameters'
      },
      body: {
        type: 'json',
        placeholder: '{"key": "value"}'
      },
      auth: {
        type: 'select',
        options: ['None', 'Basic', 'Bearer', 'API Key', 'OAuth2'],
        required: false
      }
    }
  },
  validation: {
    id: 'validation',
    name: 'Response Validation',
    description: 'Validate response data and structure',
    fields: {
      statusCode: {
        type: 'number',
        placeholder: '200',
        required: true
      },
      jsonPath: {
        type: 'text',
        placeholder: '$.data.user.id',
        required: false
      },
      expectedValue: {
        type: 'text',
        placeholder: 'Expected value',
        required: false
      },
      contentType: {
        type: 'text',
        placeholder: 'application/json',
        required: false
      },
      responseTime: {
        type: 'number',
        placeholder: 'Max response time in ms',
        required: false
      }
    }
  },
  extraction: {
    id: 'extraction',
    name: 'Data Extraction',
    description: 'Extract data from responses for use in subsequent steps',
    fields: {
      variableName: {
        type: 'text',
        placeholder: 'sessionId',
        required: true
      },
      jsonPath: {
        type: 'text',
        placeholder: '$.token',
        required: true
      },
      defaultValue: {
        type: 'text',
        placeholder: 'Default value if extraction fails',
        required: false
      }
    }
  },
  conditional: {
    id: 'conditional',
    name: 'Conditional Logic',
    description: 'Execute steps based on conditions',
    fields: {
      condition: {
        type: 'select',
        options: ['equals', 'contains', 'greater_than', 'less_than', 'exists', 'not_exists'],
        required: true
      },
      variable: {
        type: 'text',
        placeholder: 'Variable to check',
        required: true
      },
      value: {
        type: 'text',
        placeholder: 'Value to compare against',
        required: true
      },
      onSuccess: {
        type: 'text',
        placeholder: 'Step to execute on success',
        required: false
      },
      onFailure: {
        type: 'text',
        placeholder: 'Step to execute on failure',
        required: false
      }
    }
  }
};

export const FUNCTIONAL_STEP_TYPES = {
  navigation: {
    id: 'navigation',
    name: 'Page Navigation',
    description: 'Navigate to pages and verify loading',
    fields: {
      url: {
        type: 'text',
        placeholder: '/login or https://example.com',
        required: true
      },
      waitFor: {
        type: 'select',
        options: ['load', 'domcontentloaded', 'networkidle', 'selector'],
        required: false
      },
      selector: {
        type: 'text',
        placeholder: '#login-form (if waitFor is selector)',
        required: false
      }
    }
  },
  interaction: {
    id: 'interaction',
    name: 'User Interaction',
    description: 'Click, type, and interact with elements',
    fields: {
      action: {
        type: 'select',
        options: ['click', 'type', 'select', 'check', 'uncheck', 'hover', 'scroll'],
        required: true
      },
      selector: {
        type: 'text',
        placeholder: '#login-button or .form-input',
        required: true
      },
      value: {
        type: 'text',
        placeholder: 'Text to type or value to select',
        required: false
      },
      options: {
        type: 'keyvalue',
        placeholder: 'Additional options (force, timeout, etc.)',
        required: false
      }
    }
  },
  assertion: {
    id: 'assertion',
    name: 'Element Assertion',
    description: 'Verify elements exist, are visible, or contain expected content',
    fields: {
      selector: {
        type: 'text',
        placeholder: '#welcome-message',
        required: true
      },
      assertion: {
        type: 'select',
        options: ['visible', 'exists', 'contains', 'has_class', 'has_value', 'has_attr'],
        required: true
      },
      expectedValue: {
        type: 'text',
        placeholder: 'Expected text, class, or attribute value',
        required: false
      },
      timeout: {
        type: 'number',
        placeholder: 'Timeout in milliseconds',
        required: false
      }
    }
  }
};

export const PERFORMANCE_STEP_TYPES = {
  loadTest: {
    id: 'loadTest',
    name: 'Load Testing',
    description: 'Simulate multiple users accessing the application',
    fields: {
      virtualUsers: {
        type: 'number',
        placeholder: '10',
        required: true
      },
      duration: {
        type: 'number',
        placeholder: '60 (seconds)',
        required: true
      },
      rampUp: {
        type: 'number',
        placeholder: '10 (seconds to ramp up)',
        required: false
      },
      targetUrl: {
        type: 'text',
        placeholder: 'https://example.com',
        required: true
      }
    }
  },
  stressTest: {
    id: 'stressTest',
    name: 'Stress Testing',
    description: 'Test application behavior under extreme load',
    fields: {
      maxUsers: {
        type: 'number',
        placeholder: '100',
        required: true
      },
      stepSize: {
        type: 'number',
        placeholder: '10 (users per step)',
        required: true
      },
      stepDuration: {
        type: 'number',
        placeholder: '30 (seconds per step)',
        required: true
      },
      targetUrl: {
        type: 'text',
        placeholder: 'https://example.com',
        required: true
      }
    }
  }
};

// Helper functions for test configuration
export const getToolByCategory = (category) => {
  if (category === 'internal') {
    return [TEST_TOOLS.inbuilt];
  }
  return Object.values(TEST_TOOLS.external.tools);
};

export const getStepTypesByTool = (toolId, testType) => {
  if (toolId === 'inbuilt') {
    switch (testType) {
      case 'api':
        return API_STEP_TYPES;
      case 'functional':
        return FUNCTIONAL_STEP_TYPES;
      case 'performance':
        return PERFORMANCE_STEP_TYPES;
      default:
        return {};
    }
  }
  
  // For external tools, return appropriate step types
  const tool = TEST_TOOLS.external.tools[toolId];
  if (tool) {
    if (tool.capabilities.includes('functional')) {
      return FUNCTIONAL_STEP_TYPES;
    }
    if (tool.capabilities.includes('performance')) {
      return PERFORMANCE_STEP_TYPES;
    }
  }
  
  return {};
};

export const generateCypressScript = (testSuite) => {
  const { name, baseUrl, steps } = testSuite;
  
  let script = 'describe(\'' + name + '\', () => {\n';
  script += '  beforeEach(() => {\n';
  script += '    cy.visit(\'' + baseUrl + '\')\n';
  script += '  })\n\n';
  
  steps.forEach((step, index) => {
    script += '  it(\'' + step.name + '\', () => {\n';
    
    switch (step.type) {
      case 'navigation':
        script += '    cy.visit(\'' + (step.url || baseUrl) + '\')\n';
        break;
      case 'interaction':
        if (step.action === 'click') {
          script += '    cy.get(\'' + step.selector + '\').click()\n';
        } else if (step.action === 'type') {
          script += '    cy.get(\'' + step.selector + '\').type(\'' + step.value + '\')\n';
        }
        break;
      case 'assertion':
        if (step.assertion === 'visible') {
          script += '    cy.get(\'' + step.selector + '\').should(\'be.visible\')\n';
        } else if (step.assertion === 'contains') {
          script += '    cy.get(\'' + step.selector + '\').should(\'contain\', \'' + step.expectedValue + '\')\n';
        }
        break;
    }
    
    script += '  })\n';
  });
  
  script += '})\n';
  
  return script;
};

export const generateK6Script = (testSuite) => {
  const { name, baseUrl, steps } = testSuite;
  
  let script = 'import http from \'k6/http\';\n';
  script += 'import { check } from \'k6\';\n\n';
  script += 'export const options = {\n';
  script += '  vus: 10,\n';
  script += '  duration: \'30s\',\n';
  script += '};\n\n';
  script += 'export default function () {\n';
  script += '  const url = \'' + baseUrl + '\';\n\n';
  
  steps.forEach((step, index) => {
    if (step.type === 'loadTest') {
      script += '  // Load test step\n';
      script += '  const response = http.get(url);\n';
      script += '  check(response, {\n';
      script += '    \'status is 200\': (r) => r.status === 200,\n';
      script += '    \'response time < 500ms\': (r) => r.timings.duration < 500,\n';
      script += '  });\n';
    }
  });
  
  script += '}\n';
  
  return script;
};
