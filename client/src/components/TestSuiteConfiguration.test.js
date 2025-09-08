import { describe, it, expect } from 'vitest'

// Form validation schema tests
describe('Test Suite Form Validation', () => {
  const validateForm = (formData) => {
    const errors = {};
    
    if (!formData.name?.trim()) {
      errors.name = 'Test suite name is required';
    }
    
    if (!formData.baseUrl?.trim()) {
      errors.baseUrl = 'Base URL is required';
    } else if (!isValidUrl(formData.baseUrl)) {
      errors.baseUrl = 'Please enter a valid URL';
    }
    
    if (!formData.projectId) {
      errors.projectId = 'Please select a project';
    }
    
    if (!formData.steps || formData.steps.length === 0) {
      errors.steps = 'At least one test step is required';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  describe('Name validation', () => {
    it('should require test suite name', () => {
      const result = validateForm({
        baseUrl: 'https://api.example.com',
        projectId: 'proj-1',
        steps: [{ id: 1, name: 'Step 1' }]
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBe('Test suite name is required');
    });

    it('should accept valid test suite name', () => {
      const result = validateForm({
        name: 'User Authentication Tests',
        baseUrl: 'https://api.example.com',
        projectId: 'proj-1',
        steps: [{ id: 1, name: 'Step 1' }]
      });
      
      expect(result.isValid).toBe(true);
      expect(result.errors.name).toBeUndefined();
    });

    it('should reject empty string name', () => {
      const result = validateForm({
        name: '   ',
        baseUrl: 'https://api.example.com',
        projectId: 'proj-1',
        steps: [{ id: 1, name: 'Step 1' }]
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBe('Test suite name is required');
    });
  });

  describe('Base URL validation', () => {
    it('should require base URL', () => {
      const result = validateForm({
        name: 'Test Suite',
        projectId: 'proj-1',
        steps: [{ id: 1, name: 'Step 1' }]
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors.baseUrl).toBe('Base URL is required');
    });

    it('should accept valid URLs', () => {
      const validUrls = [
        'https://api.example.com',
        'http://localhost:3000',
        'https://subdomain.example.com/api/v1',
        'https://example.com:8080'
      ];

      validUrls.forEach(url => {
        const result = validateForm({
          name: 'Test Suite',
          baseUrl: url,
          projectId: 'proj-1',
          steps: [{ id: 1, name: 'Step 1' }]
        });
        
        expect(result.isValid).toBe(true);
        expect(result.errors.baseUrl).toBeUndefined();
      });
    });

    it('should reject invalid URLs', () => {
      const invalidUrls = [
        'not-a-url',
        'ftp://example.com',
        'just-text',
        'https://',
        ''
      ];

      invalidUrls.forEach(url => {
        const result = validateForm({
          name: 'Test Suite',
          baseUrl: url,
          projectId: 'proj-1',
          steps: [{ id: 1, name: 'Step 1' }]
        });
        
        expect(result.isValid).toBe(false);
        expect(result.errors.baseUrl).toBeDefined();
      });
    });
  });

  describe('Project validation', () => {
    it('should require project selection', () => {
      const result = validateForm({
        name: 'Test Suite',
        baseUrl: 'https://api.example.com',
        steps: [{ id: 1, name: 'Step 1' }]
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors.projectId).toBe('Please select a project');
    });

    it('should accept valid project ID', () => {
      const result = validateForm({
        name: 'Test Suite',
        baseUrl: 'https://api.example.com',
        projectId: 'proj-1',
        steps: [{ id: 1, name: 'Step 1' }]
      });
      
      expect(result.isValid).toBe(true);
      expect(result.errors.projectId).toBeUndefined();
    });
  });

  describe('Steps validation', () => {
    it('should require at least one step', () => {
      const result = validateForm({
        name: 'Test Suite',
        baseUrl: 'https://api.example.com',
        projectId: 'proj-1',
        steps: []
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors.steps).toBe('At least one test step is required');
    });

    it('should accept valid steps', () => {
      const result = validateForm({
        name: 'Test Suite',
        baseUrl: 'https://api.example.com',
        projectId: 'proj-1',
        steps: [
          { id: 1, name: 'Step 1', type: 'api' },
          { id: 2, name: 'Step 2', type: 'api' }
        ]
      });
      
      expect(result.isValid).toBe(true);
      expect(result.errors.steps).toBeUndefined();
    });

    it('should reject undefined steps', () => {
      const result = validateForm({
        name: 'Test Suite',
        baseUrl: 'https://api.example.com',
        projectId: 'proj-1'
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors.steps).toBe('At least one test step is required');
    });
  });

  describe('Complete form validation', () => {
    it('should validate complete valid form', () => {
      const validForm = {
        name: 'User Authentication API Tests',
        description: 'Tests for user login and authentication',
        baseUrl: 'https://api.example.com',
        projectId: 'proj-1',
        testType: 'API',
        toolId: 'axios',
        environment: 'development',
        steps: [
          { id: 1, name: 'Login Request', type: 'api' },
          { id: 2, name: 'Verify Response', type: 'api' }
        ]
      };

      const result = validateForm(validForm);
      
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('should validate incomplete form with multiple errors', () => {
      const invalidForm = {
        name: '',
        baseUrl: 'invalid-url',
        projectId: '',
        steps: []
      };

      const result = validateForm(invalidForm);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBe('Test suite name is required');
      expect(result.errors.baseUrl).toBe('Please enter a valid URL');
      expect(result.errors.projectId).toBe('Please select a project');
      expect(result.errors.steps).toBe('At least one test step is required');
    });
  });
});
