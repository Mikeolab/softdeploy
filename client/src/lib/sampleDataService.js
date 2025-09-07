// Sample Data Service - Replaces localStorage with API calls
class SampleDataService {
  constructor() {
    this.baseUrl = '/api/sample-data';
    this.cache = new Map();
  }

  // Generic method to get data by type
  async getData(type) {
    try {
      // Check cache first
      if (this.cache.has(type)) {
        return this.cache.get(type);
      }

      const response = await fetch(`${this.baseUrl}/${type}`);
      const result = await response.json();
      
      if (result.success) {
        this.cache.set(type, result.data);
        return result.data;
      } else {
        console.error(`Error loading ${type}:`, result.error);
        return [];
      }
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      // Fallback to localStorage for backward compatibility
      return this.getFromLocalStorage(type);
    }
  }

  // Generic method to save data by type
  async saveData(type, data) {
    try {
      const response = await fetch(`${this.baseUrl}/${type}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data })
      });

      const result = await response.json();
      if (result.success) {
        this.cache.set(type, data);
        // Also save to localStorage for backward compatibility
        this.saveToLocalStorage(type, data);
        return true;
      } else {
        console.error(`Error saving ${type}:`, result.error);
        return false;
      }
    } catch (error) {
      console.error(`Error saving ${type}:`, error);
      // Fallback to localStorage
      this.saveToLocalStorage(type, data);
      return false;
    }
  }

  // Add new item
  async addItem(type, item) {
    try {
      const response = await fetch(`${this.baseUrl}/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });

      const result = await response.json();
      if (result.success) {
        // Update cache
        const currentData = this.cache.get(type) || [];
        this.cache.set(type, [...currentData, result.data]);
        return result.data;
      } else {
        console.error(`Error adding ${type}:`, result.error);
        return null;
      }
    } catch (error) {
      console.error(`Error adding ${type}:`, error);
      return null;
    }
  }

  // Delete item
  async deleteItem(type, id) {
    try {
      const response = await fetch(`${this.baseUrl}/${type}/${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      if (result.success) {
        // Update cache
        const currentData = this.cache.get(type) || [];
        this.cache.set(type, currentData.filter(item => item.id !== id));
        return true;
      } else {
        console.error(`Error deleting ${type}:`, result.error);
        return false;
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      return false;
    }
  }

  // Specific methods for different data types
  async getUsers() {
    return this.getData('users');
  }

  async getProjects() {
    return this.getData('projects');
  }

  async getTestSuites() {
    return this.getData('testSuites');
  }

  async getTestRuns() {
    return this.getData('testRuns');
  }

  async getTestRunsV2() {
    // This is the localStorage format that the app expects
    const testRuns = await this.getTestRuns();
    const testSuites = await this.getTestSuites();
    
    return testRuns.map(run => ({
      id: run.id,
      projectId: run.project_id,
      testSuite: {
        name: testSuites.find(suite => suite.id === run.test_suite_id)?.name || 'Unknown Test',
        description: testSuites.find(suite => suite.id === run.test_suite_id)?.description || ''
      },
      success: run.status === 'completed' && run.failed_steps === 0,
      totalSteps: run.total_steps,
      passedSteps: run.passed_steps,
      failedSteps: run.failed_steps,
      totalTime: run.total_time,
      executedAt: run.executed_at,
      timestamp: new Date(run.executed_at).getTime(),
      user_id: run.user_id
    }));
  }

  async getTestResultsV2() {
    // This is the localStorage format for test results
    const testRuns = await this.getTestRuns();
    const testSuites = await this.getTestSuites();
    
    return testRuns.map(run => ({
      id: run.id,
      testSuite: testSuites.find(suite => suite.id === run.test_suite_id)?.name || 'Unknown Test',
      testType: testSuites.find(suite => suite.id === run.test_suite_id)?.test_type || 'API',
      toolId: testSuites.find(suite => suite.id === run.test_suite_id)?.tool_id || 'unknown',
      success: run.status === 'completed' && run.failed_steps === 0,
      totalSteps: run.total_steps,
      passedSteps: run.passed_steps,
      failedSteps: run.failed_steps,
      totalTime: run.total_time,
      executedAt: run.executed_at,
      summary: run.results?.summary || {
        total: run.total_steps,
        passed: run.passed_steps,
        failed: run.failed_steps,
        duration: run.total_time
      }
    }));
  }

  // Save test run (used by test execution)
  async saveTestRun(testRun) {
    try {
      // Convert localStorage format to API format
      const apiFormat = {
        test_suite_id: testRun.testSuiteId || 'unknown',
        project_id: testRun.projectId || 'unknown',
        user_id: testRun.user_id || 'unknown',
        status: testRun.success ? 'completed' : 'failed',
        total_steps: testRun.totalSteps || 0,
        passed_steps: testRun.passedSteps || 0,
        failed_steps: testRun.failedSteps || 0,
        total_time: testRun.totalTime || 0,
        executed_at: testRun.executedAt || new Date().toISOString(),
        results: {
          success: testRun.success,
          summary: {
            total: testRun.totalSteps || 0,
            passed: testRun.passedSteps || 0,
            failed: testRun.failedSteps || 0,
            duration: testRun.totalTime || 0
          }
        }
      };

      return await this.addItem('testRuns', apiFormat);
    } catch (error) {
      console.error('Error saving test run:', error);
      // Fallback to localStorage
      this.saveToLocalStorage('testRunsV2', [testRun]);
      return null;
    }
  }

  // Fallback methods for localStorage compatibility
  getFromLocalStorage(type) {
    const keyMap = {
      'testRunsV2': 'testRunsV2',
      'testResultsV2': 'testResultsV2',
      'projects': 'projects',
      'users': 'users'
    };
    
    const key = keyMap[type];
    if (key) {
      try {
        return JSON.parse(localStorage.getItem(key) || '[]');
      } catch (error) {
        console.error(`Error parsing localStorage ${key}:`, error);
        return [];
      }
    }
    return [];
  }

  saveToLocalStorage(type, data) {
    const keyMap = {
      'testRunsV2': 'testRunsV2',
      'testResultsV2': 'testResultsV2',
      'projects': 'projects',
      'users': 'users'
    };
    
    const key = keyMap[type];
    if (key) {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (error) {
        console.error(`Error saving to localStorage ${key}:`, error);
      }
    }
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }
}

// Export singleton instance
export default new SampleDataService();
