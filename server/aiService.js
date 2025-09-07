// AI Service for Google Gemini API integration
const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
  constructor() {
    // Initialize with API key from environment variable
    this.apiKey = process.env.GEMINI_API_KEY;
    this.genAI = null;
    this.model = null;
    
    if (this.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      console.log('🤖 AI Service initialized with Gemini API');
    } else {
      console.warn('⚠️ GEMINI_API_KEY not found. AI features will be disabled.');
    }
  }

  // Generate test script based on user prompt
  async generateTestScript(prompt, testType = 'API', projectContext = {}) {
    if (!this.model) {
      throw new Error('AI service not initialized. Please set GEMINI_API_KEY environment variable.');
    }

    try {
      const systemPrompt = this.buildSystemPrompt(testType, projectContext);
      const fullPrompt = `${systemPrompt}\n\nUser Request: ${prompt}`;

      console.log('🤖 Generating test script for:', testType);
      
      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        generatedScript: text,
        testType: testType,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ AI generation error:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Build system prompt based on test type and project context
  buildSystemPrompt(testType, projectContext) {
    const basePrompt = `You are an expert test automation engineer. Generate comprehensive test scripts for ${testType} testing.`;

    const testTypePrompts = {
      'API': `
Focus on API testing with the following structure:
- Test suite name and description
- Base URL configuration
- Test steps including:
  * HTTP method (GET, POST, PUT, DELETE)
  * Endpoint paths
  * Request headers and body
  * Expected response status codes
  * Response validation
  * Error handling

Return the test configuration in JSON format that can be directly used by our test execution engine.`,
      
      'Functional': `
Focus on functional/UI testing with the following structure:
- Test suite name and description
- Base URL for the application
- Test steps including:
  * Navigation actions
  * Element interactions (click, type, select)
  * Assertions (element visibility, text content, form validation)
  * Wait conditions
  * Error handling

Return the test configuration in JSON format optimized for browser automation.`,
      
      'Performance': `
Focus on performance/load testing with the following structure:
- Test suite name and description
- Target URL or API endpoint
- Load test configuration:
  * Number of virtual users
  * Test duration
  * Ramp-up time
  * Expected performance metrics
  * Success criteria

Return the test configuration in JSON format for load testing scenarios.`,
      
      'E2E': `
Focus on end-to-end testing with the following structure:
- Test suite name and description
- Application base URL
- Complete user journey steps:
  * User authentication
  * Navigation through key features
  * Data input and validation
  * Business logic verification
  * Cleanup actions

Return the test configuration in JSON format for comprehensive E2E testing.`
    };

    const projectContextPrompt = projectContext.name ? 
      `\n\nProject Context: This test is for the "${projectContext.name}" project. ${projectContext.description || ''}` : '';

    return `${basePrompt}${testTypePrompts[testType] || testTypePrompts['API']}${projectContextPrompt}

IMPORTANT: Return ONLY valid JSON that matches this exact structure:
{
  "name": "Test Suite Name",
  "description": "Test suite description",
  "testType": "${testType}",
  "toolId": "appropriate_tool",
  "baseUrl": "https://example.com",
  "steps": [
    {
      "id": 1,
      "name": "Step Name",
      "type": "step_type",
      "description": "Step description",
      "config": {
        // Step-specific configuration
      }
    }
  ]
}`;
  }

  // Generate test suggestions based on project context
  async generateTestSuggestions(projectContext) {
    if (!this.model) {
      throw new Error('AI service not initialized');
    }

    try {
      const prompt = `Based on this project context, suggest 3-5 test scenarios that would be valuable to implement:

Project: ${projectContext.name || 'Unknown'}
Description: ${projectContext.description || 'No description provided'}
Type: ${projectContext.type || 'Web Application'}

Provide suggestions in JSON format:
{
  "suggestions": [
    {
      "title": "Suggestion Title",
      "description": "What this test covers",
      "testType": "API|Functional|Performance|E2E",
      "priority": "High|Medium|Low",
      "estimatedTime": "5-10 minutes"
    }
  ]
}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        suggestions: JSON.parse(text),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ AI suggestions error:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Check if AI service is available
  isAvailable() {
    return !!this.model;
  }

  // Get usage statistics (placeholder for monitoring)
  getUsageStats() {
    return {
      available: this.isAvailable(),
      model: 'gemini-1.5-flash',
      freeTier: true,
      dailyLimit: 1500,
      requestsPerMinute: 15
    };
  }
}

module.exports = AIService;

