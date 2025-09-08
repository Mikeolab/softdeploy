// server/services/runService.js
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

class RunService {
  constructor() {
    this.activeRuns = new Map();
    this.runsDataPath = path.join(__dirname, '../data/runs.json');
    this.artifactsPath = path.join(__dirname, '../artifacts');
    this.ensureDirectories();
  }

  async ensureDirectories() {
    try {
      await fs.mkdir(path.dirname(this.runsDataPath), { recursive: true });
      await fs.mkdir(this.artifactsPath, { recursive: true });
    } catch (error) {
      console.error('Error creating directories:', error);
    }
  }

  // Create a new test run
  async createRun(testSuite, projectId, userId) {
    const runId = `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const run = {
      id: runId,
      testSuiteId: testSuite.id,
      projectId,
      userId,
      status: 'queued',
      testSuite: {
        name: testSuite.name,
        description: testSuite.description,
        testType: testSuite.testType,
        toolId: testSuite.toolId,
        baseUrl: testSuite.baseUrl,
        environment: testSuite.environment,
        steps: testSuite.steps
      },
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      duration: null,
      results: {
        totalSteps: testSuite.steps.length,
        passedSteps: 0,
        failedSteps: 0,
        skippedSteps: 0,
        summary: {
          total: testSuite.steps.length,
          passed: 0,
          failed: 0,
          skipped: 0,
          duration: 0
        },
        steps: []
      },
      artifacts: {
        cypressReport: null,
        mochawesomeReport: null,
        allureReport: null,
        screenshots: [],
        videos: []
      },
      logs: []
    };

    // Save run to file
    await this.saveRun(run);
    
    // Queue for execution
    this.queueRun(runId);
    
    return run;
  }

  // Queue a run for execution
  async queueRun(runId) {
    const run = await this.getRun(runId);
    if (!run) {
      throw new Error(`Run ${runId} not found`);
    }

    run.status = 'queued';
    await this.saveRun(run);
    
    // Execute immediately (in production, this would use a proper queue)
    this.executeRun(runId);
  }

  // Execute a test run
  async executeRun(runId) {
    const run = await this.getRun(runId);
    if (!run) {
      throw new Error(`Run ${runId} not found`);
    }

    run.status = 'running';
    run.startedAt = new Date().toISOString();
    await this.saveRun(run);

    this.activeRuns.set(runId, run);

    try {
      console.log(`🚀 [RUN SERVICE] Starting execution of run ${runId}`);
      
      // Generate Cypress test file
      const cypressScript = this.generateCypressScript(run.testSuite);
      const testFilePath = path.join(this.artifactsPath, `${runId}.spec.js`);
      
      await fs.writeFile(testFilePath, cypressScript);
      
      // Execute Cypress test
      const cypressResult = await this.executeCypressTest(testFilePath, runId);
      
      // Process results
      await this.processCypressResults(runId, cypressResult);
      
      // Generate reports
      await this.generateReports(runId);
      
      run.status = 'completed';
      run.completedAt = new Date().toISOString();
      run.duration = new Date(run.completedAt) - new Date(run.startedAt);
      
      console.log(`✅ [RUN SERVICE] Completed execution of run ${runId}`);
      
    } catch (error) {
      console.error(`❌ [RUN SERVICE] Error executing run ${runId}:`, error);
      
      run.status = 'failed';
      run.completedAt = new Date().toISOString();
      run.duration = new Date(run.completedAt) - new Date(run.startedAt);
      run.error = error.message;
      
      await this.addLog(runId, 'error', `Execution failed: ${error.message}`);
    } finally {
      await this.saveRun(run);
      this.activeRuns.delete(runId);
    }
  }

  // Generate Cypress script from test suite
  generateCypressScript(testSuite) {
    let script = `describe('${testSuite.name}', () => {\n`;
    script += `  beforeEach(() => {\n`;
    script += `    cy.log('Starting test suite: ${testSuite.name}')\n`;
    script += `  })\n\n`;
    
    testSuite.steps.forEach((step, index) => {
      script += `  it('Step ${index + 1}: ${step.name}', () => {\n`;
      
      // Add step description
      if (step.description) {
        script += `    cy.log('${step.description}')\n`;
      }
      
      // Generate step-specific code
      switch (step.type) {
        case 'api':
          script += this.generateApiStep(step, testSuite.baseUrl);
          break;
        case 'navigation':
          script += this.generateNavigationStep(step, testSuite.baseUrl);
          break;
        case 'interaction':
          script += this.generateInteractionStep(step);
          break;
        case 'assertion':
          script += this.generateAssertionStep(step);
          break;
        default:
          script += `    cy.log('Unknown step type: ${step.type}')\n`;
      }
      
      script += `  })\n\n`;
    });
    
    script += `})\n`;
    return script;
  }

  // Generate API step code
  generateApiStep(step, baseUrl) {
    const config = step.config || {};
    const url = config.url?.startsWith('http') ? config.url : `${baseUrl}${config.url || ''}`;
    
    let code = `    cy.request({\n`;
    code += `      method: '${config.method || 'GET'}',\n`;
    code += `      url: '${url}',\n`;
    
    if (config.headers) {
      code += `      headers: ${JSON.stringify(config.headers)},\n`;
    }
    
    if (config.body && ['POST', 'PUT', 'PATCH'].includes(config.method)) {
      code += `      body: ${JSON.stringify(config.body)},\n`;
    }
    
    code += `    }).then((response) => {\n`;
    code += `      expect(response.status).to.eq(${config.expectedStatus || 200})\n`;
    
    if (config.expectedResponse) {
      code += `      expect(response.body).to.deep.include(${JSON.stringify(config.expectedResponse)})\n`;
    }
    
    code += `    })\n`;
    return code;
  }

  // Generate navigation step code
  generateNavigationStep(step, baseUrl) {
    const config = step.config || {};
    const url = config.url?.startsWith('http') ? config.url : `${baseUrl}${config.url || ''}`;
    
    let code = `    cy.visit('${url}')\n`;
    
    if (config.waitFor) {
      code += `    cy.wait(${config.waitFor})\n`;
    }
    
    return code;
  }

  // Generate interaction step code
  generateInteractionStep(step) {
    const config = step.config || {};
    
    let code = `    cy.get('${config.selector}').${config.action}(`;
    
    if (config.value) {
      code += `'${config.value}'`;
    }
    
    code += `)\n`;
    
    if (config.waitAfter) {
      code += `    cy.wait(${config.waitAfter})\n`;
    }
    
    return code;
  }

  // Generate assertion step code
  generateAssertionStep(step) {
    const config = step.config || {};
    
    let code = `    cy.get('${config.selector}').should('${config.assertion}'`;
    
    if (config.expectedValue) {
      code += `, '${config.expectedValue}'`;
    }
    
    code += `)\n`;
    
    return code;
  }

  // Execute Cypress test
  async executeCypressTest(testFilePath, runId) {
    try {
      console.log(`🧪 [CYPRESS] Executing test: ${testFilePath}`);
      
      // Create Cypress config
      const configPath = path.join(this.artifactsPath, 'cypress.config.js');
      const cypressConfig = `
module.exports = {
  e2e: {
    baseUrl: 'http://localhost:5000',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    video: true,
    screenshotOnRunFailure: true,
    specPattern: '${testFilePath}',
    supportFile: false,
    fixturesFolder: false
  }
}`;
      
      await fs.writeFile(configPath, cypressConfig);
      
      // Execute Cypress
      const command = `npx cypress run --config-file "${configPath}" --headless --browser chrome --reporter json --reporter-options output="${path.join(this.artifactsPath, `${runId}-results.json`)}"`;
      
      const { stdout, stderr } = await execAsync(command, {
        cwd: this.artifactsPath,
        timeout: 300000, // 5 minutes timeout
        maxBuffer: 1024 * 1024 * 10 // 10MB buffer
      });
      
      console.log(`📊 [CYPRESS] Test completed for run ${runId}`);
      
      return {
        success: true,
        stdout,
        stderr,
        exitCode: 0
      };
      
    } catch (error) {
      console.error(`❌ [CYPRESS] Test failed for run ${runId}:`, error);
      
      return {
        success: false,
        stdout: error.stdout || '',
        stderr: error.stderr || '',
        exitCode: error.code || 1,
        error: error.message
      };
    }
  }

  // Process Cypress results
  async processCypressResults(runId, cypressResult) {
    const run = await this.getRun(runId);
    if (!run) return;

    try {
      // Try to read JSON results
      const resultsPath = path.join(this.artifactsPath, `${runId}-results.json`);
      let jsonResults = null;
      
      try {
        const resultsContent = await fs.readFile(resultsPath, 'utf8');
        jsonResults = JSON.parse(resultsContent);
      } catch (error) {
        console.log(`⚠️ [RUN SERVICE] Could not read JSON results for run ${runId}`);
      }

      if (jsonResults) {
        // Process structured results
        run.results.totalSteps = jsonResults.stats?.tests || run.testSuite.steps.length;
        run.results.passedSteps = jsonResults.stats?.passes || 0;
        run.results.failedSteps = jsonResults.stats?.failures || 0;
        run.results.skippedSteps = jsonResults.stats?.pending || 0;
        run.results.summary.total = run.results.totalSteps;
        run.results.summary.passed = run.results.passedSteps;
        run.results.summary.failed = run.results.failedSteps;
        run.results.summary.skipped = run.results.skippedSteps;
        run.results.summary.duration = jsonResults.stats?.duration || 0;
        
        // Process individual test results
        if (jsonResults.tests) {
          run.results.steps = jsonResults.tests.map((test, index) => ({
            stepNumber: index + 1,
            name: test.title || `Step ${index + 1}`,
            success: test.state === 'passed',
            duration: test.duration || 0,
            error: test.err?.message || null,
            timestamp: new Date().toISOString()
          }));
        }
      } else {
        // Fallback: parse stdout for basic results
        const output = cypressResult.stdout + cypressResult.stderr;
        const passedMatch = output.match(/(\d+) passing/);
        const failedMatch = output.match(/(\d+) failing/);
        
        run.results.passedSteps = passedMatch ? parseInt(passedMatch[1]) : 0;
        run.results.failedSteps = failedMatch ? parseInt(failedMatch[1]) : 0;
        run.results.totalSteps = run.results.passedSteps + run.results.failedSteps;
        run.results.summary.total = run.results.totalSteps;
        run.results.summary.passed = run.results.passedSteps;
        run.results.summary.failed = run.results.failedSteps;
        run.results.summary.duration = run.duration || 0;
      }

      await this.addLog(runId, 'info', `Test execution completed: ${run.results.passedSteps}/${run.results.totalSteps} steps passed`);
      
    } catch (error) {
      console.error(`❌ [RUN SERVICE] Error processing results for run ${runId}:`, error);
      await this.addLog(runId, 'error', `Error processing results: ${error.message}`);
    }
  }

  // Generate reports
  async generateReports(runId) {
    const run = await this.getRun(runId);
    if (!run) return;

    try {
      // Generate Mochawesome report
      const mochawesomeCommand = `npx mochawesome-merge "${path.join(this.artifactsPath, `${runId}-results.json`)}" > "${path.join(this.artifactsPath, `${runId}-mochawesome.json`)}"`;
      
      try {
        await execAsync(mochawesomeCommand, { cwd: this.artifactsPath });
        run.artifacts.mochawesomeReport = `${runId}-mochawesome.json`;
      } catch (error) {
        console.log(`⚠️ [RUN SERVICE] Could not generate Mochawesome report for run ${runId}`);
      }

      // Copy screenshots and videos
      const screenshotsDir = path.join(this.artifactsPath, 'screenshots');
      const videosDir = path.join(this.artifactsPath, 'videos');
      
      try {
        const screenshotFiles = await fs.readdir(screenshotsDir).catch(() => []);
        const videoFiles = await fs.readdir(videosDir).catch(() => []);
        
        run.artifacts.screenshots = screenshotFiles.filter(f => f.includes(runId));
        run.artifacts.videos = videoFiles.filter(f => f.includes(runId));
      } catch (error) {
        console.log(`⚠️ [RUN SERVICE] Could not copy artifacts for run ${runId}`);
      }

      await this.addLog(runId, 'info', 'Reports generated successfully');
      
    } catch (error) {
      console.error(`❌ [RUN SERVICE] Error generating reports for run ${runId}:`, error);
      await this.addLog(runId, 'error', `Error generating reports: ${error.message}`);
    }
  }

  // Add log entry to run
  async addLog(runId, level, message) {
    const run = await this.getRun(runId);
    if (!run) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message
    };

    run.logs.push(logEntry);
    await this.saveRun(run);
  }

  // Get run by ID
  async getRun(runId) {
    try {
      const runs = await this.getAllRuns();
      return runs.find(run => run.id === runId);
    } catch (error) {
      console.error(`Error getting run ${runId}:`, error);
      return null;
    }
  }

  // Get all runs
  async getAllRuns() {
    try {
      const data = await fs.readFile(this.runsDataPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  // Save run
  async saveRun(run) {
    try {
      const runs = await this.getAllRuns();
      const existingIndex = runs.findIndex(r => r.id === run.id);
      
      if (existingIndex >= 0) {
        runs[existingIndex] = run;
      } else {
        runs.push(run);
      }
      
      await fs.writeFile(this.runsDataPath, JSON.stringify(runs, null, 2));
    } catch (error) {
      console.error(`Error saving run ${run.id}:`, error);
    }
  }

  // Get runs by project
  async getRunsByProject(projectId) {
    const runs = await this.getAllRuns();
    return runs.filter(run => run.projectId === projectId);
  }

  // Get runs by user
  async getRunsByUser(userId) {
    const runs = await this.getAllRuns();
    return runs.filter(run => run.userId === userId);
  }

  // Get run status
  async getRunStatus(runId) {
    const run = await this.getRun(runId);
    return run ? {
      id: run.id,
      status: run.status,
      progress: this.calculateProgress(run),
      startedAt: run.startedAt,
      completedAt: run.completedAt,
      duration: run.duration
    } : null;
  }

  // Calculate progress percentage
  calculateProgress(run) {
    if (run.status === 'queued') return 0;
    if (run.status === 'running') {
      const totalSteps = run.testSuite.steps.length;
      const completedSteps = run.results.steps.length;
      return Math.round((completedSteps / totalSteps) * 100);
    }
    if (run.status === 'completed' || run.status === 'failed') return 100;
    return 0;
  }

  // Stop a running test
  async stopRun(runId) {
    const run = await this.getRun(runId);
    if (!run) {
      throw new Error(`Run ${runId} not found`);
    }

    if (run.status === 'running') {
      run.status = 'stopped';
      run.completedAt = new Date().toISOString();
      run.duration = new Date(run.completedAt) - new Date(run.startedAt);
      
      await this.saveRun(run);
      await this.addLog(runId, 'info', 'Test execution stopped by user');
      
      this.activeRuns.delete(runId);
    }

    return run;
  }
}

module.exports = RunService;
