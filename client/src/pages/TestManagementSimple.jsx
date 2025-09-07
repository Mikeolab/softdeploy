// src/pages/TestManagement.jsx - SIMPLIFIED VERSION
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const TestManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simple project fetch - no loops
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!projectId) {
      console.log('No projectId, redirecting to projects');
      navigate('/projects');
      return;
    }

    const fetchProject = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('projects')
          .select('id, name, description')
          .eq('id', projectId)
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Project fetch error:', error);
          navigate('/projects');
          return;
        }

        setCurrentProject(data);
      } catch (err) {
        console.error('Project fetch failed:', err);
        navigate('/projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [user, projectId, navigate]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Project Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The project you're looking for doesn't exist or you don't have access to it.
          </p>
          <button
            onClick={() => navigate('/projects')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Test Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage tests for <strong>{currentProject.name}</strong>
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Test Management Dashboard
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Test Suites</h3>
            <p className="text-gray-600 dark:text-gray-400">0 suites</p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Test Cases</h3>
            <p className="text-gray-600 dark:text-gray-400">0 cases</p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Recent Runs</h3>
            <p className="text-gray-600 dark:text-gray-400">0 runs</p>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={() => navigate(`/projects/${projectId}`)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 mr-3"
          >
            Back to Project
          </button>
          <button
            onClick={() => navigate('/projects')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            All Projects
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestManagement;
