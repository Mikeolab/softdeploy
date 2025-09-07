// Project Isolation Middleware
// This middleware ensures all API routes are properly scoped to projects

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// ===== PROJECT MIDDLEWARE =====

/**
 * Middleware to load project and validate user access
 * Expects projectId in route params or headers
 */
const loadProject = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.headers['x-project-id'];
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required',
        timestamp: new Date().toISOString()
      });
    }

    // Get user ID from auth (assuming JWT token in Authorization header)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        timestamp: new Date().toISOString()
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token',
        timestamp: new Date().toISOString()
      });
    }

    // Load project details
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name, user_id, created_at')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
        timestamp: new Date().toISOString()
      });
    }

    // Check user membership in project
    const { data: membership, error: membershipError } = await supabase
      .from('project_memberships')
      .select('role')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not a member of this project',
        timestamp: new Date().toISOString()
      });
    }

    // Attach project and user info to request
    req.project = project;
    req.user = user;
    req.userRole = membership.role;

    next();
  } catch (error) {
    console.error('❌ [MIDDLEWARE] Project loading error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Middleware to assert minimum role requirement
 * Usage: assertMembership('editor') - requires editor role or higher
 */
const assertMembership = (minRole) => {
  const roleHierarchy = ['viewer', 'editor', 'admin', 'owner'];
  
  return (req, res, next) => {
    const userRole = req.userRole;
    const minRoleIndex = roleHierarchy.indexOf(minRole);
    const userRoleIndex = roleHierarchy.indexOf(userRole);

    if (userRoleIndex < minRoleIndex) {
      return res.status(403).json({
        success: false,
        message: `Access denied: Requires ${minRole} role or higher. Your role: ${userRole}`,
        timestamp: new Date().toISOString()
      });
    }

    next();
  };
};

/**
 * Middleware to validate resource ownership within project
 * Checks that the resource's project_id matches the current project
 */
const validateResourceProject = (resourceType) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id || req.params[`${resourceType}Id`];
      const projectId = req.project.id;

      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: `${resourceType} ID is required`,
          timestamp: new Date().toISOString()
        });
      }

      // Query the resource to check its project_id
      const { data: resource, error } = await supabase
        .from(resourceType)
        .select('project_id')
        .eq('id', resourceId)
        .single();

      if (error || !resource) {
        return res.status(404).json({
          success: false,
          message: `${resourceType} not found`,
          timestamp: new Date().toISOString()
        });
      }

      if (resource.project_id !== projectId) {
        return res.status(403).json({
          success: false,
          message: `Access denied: ${resourceType} does not belong to this project`,
          timestamp: new Date().toISOString()
        });
      }

      // Attach resource to request for use in route handlers
      req.resource = resource;
      next();
    } catch (error) {
      console.error(`❌ [MIDDLEWARE] Resource validation error for ${resourceType}:`, error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  };
};

/**
 * Middleware to ensure project_id is set in request body
 * Automatically sets project_id from route params
 */
const enforceProjectId = (req, res, next) => {
  const projectId = req.params.projectId;
  
  if (!projectId) {
    return res.status(400).json({
      success: false,
      message: 'Project ID is required',
      timestamp: new Date().toISOString()
    });
  }

  // Ensure project_id is set in body for POST/PUT requests
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    req.body.project_id = projectId;
  }

  next();
};

// ===== WEBSOCKET MIDDLEWARE =====

/**
 * Middleware for WebSocket connections to validate project access
 */
const validateWebSocketProject = async (ws, req) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const projectId = url.searchParams.get('projectId');
    
    if (!projectId) {
      ws.close(1008, 'Project ID is required');
      return false;
    }

    // Get user from token (assuming token in query params)
    const token = url.searchParams.get('token');
    if (!token) {
      ws.close(1008, 'Authentication token is required');
      return false;
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      ws.close(1008, 'Invalid authentication token');
      return false;
    }

    // Check project membership
    const { data: membership, error: membershipError } = await supabase
      .from('project_memberships')
      .select('role')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership) {
      ws.close(1008, 'Access denied: Not a member of this project');
      return false;
    }

    // Attach project info to WebSocket
    ws.projectId = projectId;
    ws.userId = user.id;
    ws.userRole = membership.role;

    return true;
  } catch (error) {
    console.error('❌ [WEBSOCKET] Project validation error:', error);
    ws.close(1011, 'Internal server error');
    return false;
  }
};

// ===== UTILITY FUNCTIONS =====

/**
 * Get user's role in a project
 */
const getUserProjectRole = async (userId, projectId) => {
  try {
    const { data: membership, error } = await supabase
      .from('project_memberships')
      .select('role')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single();

    if (error || !membership) {
      return null;
    }

    return membership.role;
  } catch (error) {
    console.error('❌ [UTILITY] Error getting user project role:', error);
    return null;
  }
};

/**
 * Check if user has minimum role in project
 */
const hasMinimumRole = (userRole, minRole) => {
  const roleHierarchy = ['viewer', 'editor', 'admin', 'owner'];
  const userRoleIndex = roleHierarchy.indexOf(userRole);
  const minRoleIndex = roleHierarchy.indexOf(minRole);
  
  return userRoleIndex >= minRoleIndex;
};

/**
 * Get project-scoped query builder
 */
const getProjectQuery = (tableName, projectId) => {
  return supabase
    .from(tableName)
    .select('*')
    .eq('project_id', projectId);
};

/**
 * Log project-scoped operations
 */
const logProjectOperation = (operation, projectId, userId, details = {}) => {
  console.log(`📊 [PROJECT-${projectId}] ${operation} by user ${userId}:`, details);
};

// ===== EXPORT MIDDLEWARE =====

module.exports = {
  // Core middleware
  loadProject,
  assertMembership,
  validateResourceProject,
  enforceProjectId,
  
  // WebSocket middleware
  validateWebSocketProject,
  
  // Utility functions
  getUserProjectRole,
  hasMinimumRole,
  getProjectQuery,
  logProjectOperation,
  
  // Role hierarchy for reference
  ROLE_HIERARCHY: ['viewer', 'editor', 'admin', 'owner']
};
