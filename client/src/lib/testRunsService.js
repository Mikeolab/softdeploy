// src/lib/testRunsService.js
import { supabase } from './supabaseClient';

export class TestRunsService {
  // Save a test run to Supabase
  static async saveTestRun(testRun) {
    try {
      const { data, error } = await supabase
        .from('test_runs')
        .insert([{
          id: testRun.executionId,
          user_id: testRun.userId || 'anonymous',
          test_suite_name: testRun.testSuiteName,
          test_type: testRun.testType,
          tool_id: testRun.toolId,
          status: testRun.status,
          total_steps: testRun.totalSteps,
          passed_steps: testRun.passedSteps,
          failed_steps: testRun.failedSteps,
          total_time: testRun.totalTime,
          results: testRun.results,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select();

      if (error) {
        console.error('Error saving test run:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Test run saved successfully:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Error saving test run:', error);
      return { success: false, error: error.message };
    }
  }

  // Get test runs for a user
  static async getTestRuns(userId = 'anonymous', limit = 50) {
    try {
      const { data, error } = await supabase
        .from('test_runs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching test runs:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error fetching test runs:', error);
      return { success: false, error: error.message };
    }
  }

  // Get test run by ID
  static async getTestRunById(executionId) {
    try {
      const { data, error } = await supabase
        .from('test_runs')
        .select('*')
        .eq('id', executionId)
        .single();

      if (error) {
        console.error('Error fetching test run:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error fetching test run:', error);
      return { success: false, error: error.message };
    }
  }

  // Update test run status
  static async updateTestRunStatus(executionId, status, results = null) {
    try {
      const updateData = {
        status,
        updated_at: new Date().toISOString()
      };

      if (results) {
        updateData.results = results;
        updateData.total_steps = results.totalSteps;
        updateData.passed_steps = results.passedSteps;
        updateData.failed_steps = results.failedSteps;
        updateData.total_time = results.totalTime;
      }

      const { data, error } = await supabase
        .from('test_runs')
        .update(updateData)
        .eq('id', executionId)
        .select();

      if (error) {
        console.error('Error updating test run:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error updating test run:', error);
      return { success: false, error: error.message };
    }
  }

  // Get test run statistics
  static async getTestRunStats(userId = 'anonymous') {
    try {
      const { data, error } = await supabase
        .from('test_runs')
        .select('status, total_steps, passed_steps, failed_steps, total_time')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching test run stats:', error);
        return { success: false, error: error.message };
      }

      const stats = {
        totalRuns: data.length,
        successfulRuns: data.filter(run => run.status === 'completed' && run.failed_steps === 0).length,
        failedRuns: data.filter(run => run.status === 'failed' || run.failed_steps > 0).length,
        totalSteps: data.reduce((sum, run) => sum + (run.total_steps || 0), 0),
        totalTime: data.reduce((sum, run) => sum + (run.total_time || 0), 0),
        averageTime: data.length > 0 ? data.reduce((sum, run) => sum + (run.total_time || 0), 0) / data.length : 0
      };

      return { success: true, data: stats };
    } catch (error) {
      console.error('Error fetching test run stats:', error);
      return { success: false, error: error.message };
    }
  }
}

export default TestRunsService;
