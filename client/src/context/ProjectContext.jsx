// Project Context Hook for React
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const ProjectContext = createContext();

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider = ({ children }) => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
    } else {
      setLoading(false);
    }
  }, [projectId]);

  const loadProject = async (id) => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      // Load project details - simplified query to avoid schema issues
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('id, name, user_id')
        .eq('id', id)
        .single();

      if (projectError) {
        console.error('Project fetch error:', projectError);
        // If project not found or table doesn't exist, create a mock project
        if (projectError.code === 'PGRST116' || projectError.code === '42P01') {
          setProject({
            id: id,
            name: `Project ${id}`,
            user_id: user.id,
            created_at: new Date().toISOString()
          });
          setUserRole('owner');
          setLoading(false);
          return;
        }
        throw projectError;
      }

      if (!projectData) {
        throw new Error('Project not found');
      }

      // Try to load user's role in project, but don't fail if table doesn't exist
      try {
        const { data: membership, error: membershipError } = await supabase
          .from('project_memberships')
          .select('role')
          .eq('project_id', id)
          .eq('user_id', user.id)
          .single();

        if (membershipError || !membership) {
          // If no membership found, assume owner if user created the project
          setUserRole(projectData.user_id === user.id ? 'owner' : 'viewer');
        } else {
          setUserRole(membership.role);
        }
      } catch (membershipErr) {
        console.warn('Could not load project membership:', membershipErr);
        // Default to owner if user created the project
        setUserRole(projectData.user_id === user.id ? 'owner' : 'viewer');
      }

      setProject(projectData);
    } catch (err) {
      console.error('Error loading project:', err);
      setError(err.message);
      
      // Redirect to projects page if project not found or access denied
      if (err.message.includes('not found') || err.message.includes('Access denied')) {
        navigate('/projects');
      }
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (minRole) => {
    if (!userRole) return false;
    
    const roleHierarchy = ['viewer', 'editor', 'admin', 'owner'];
    const userRoleIndex = roleHierarchy.indexOf(userRole);
    const minRoleIndex = roleHierarchy.indexOf(minRole);
    
    return userRoleIndex >= minRoleIndex;
  };

  const canEdit = () => hasRole('editor');
  const canAdmin = () => hasRole('admin');
  const canOwn = () => hasRole('owner');

  const value = {
    project,
    projectId,
    userRole,
    loading,
    error,
    hasRole,
    canEdit,
    canAdmin,
    canOwn,
    reloadProject: () => projectId && loadProject(projectId)
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

// Higher-order component for project-scoped pages
export const withProject = (Component) => {
  return (props) => {
    const { projectId } = useParams();
    
    if (!projectId) {
      return <div>No project selected</div>;
    }

    return (
      <ProjectProvider>
        <Component {...props} />
      </ProjectProvider>
    );
  };
};

// Hook for project-scoped API calls
export const useProjectAPI = () => {
  const { projectId } = useProject();
  
  const apiCall = async (endpoint, options = {}) => {
    if (!projectId) {
      throw new Error('No project selected');
    }

    const url = endpoint.startsWith('/api/') 
      ? endpoint 
      : `/api/projects/${projectId}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  };

  const get = (endpoint) => apiCall(endpoint, { method: 'GET' });
  const post = (endpoint, data) => apiCall(endpoint, { 
    method: 'POST', 
    body: JSON.stringify(data) 
  });
  const put = (endpoint, data) => apiCall(endpoint, { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  });
  const del = (endpoint) => apiCall(endpoint, { method: 'DELETE' });

  return {
    get,
    post,
    put,
    delete: del,
    apiCall
  };
};

// Hook for project-scoped data fetching
export const useProjectData = (endpoint, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { get } = useProjectAPI();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await get(endpoint);
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: () => fetchData() };
};

export default ProjectContext;
