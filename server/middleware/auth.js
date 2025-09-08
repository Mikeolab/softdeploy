// server/middleware/auth.js
// Authentication middleware for user access control

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with fallback for missing environment variables
let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );
} else {
  console.warn('⚠️ Supabase environment variables not found. Using mock authentication.');
}

/**
 * Middleware to authenticate user and attach user info to request
 * Supports both JWT tokens and mock authentication for development
 */
const authenticateUser = async (req, res, next) => {
  try {
    // Check for Authorization header
    const authHeader = req.headers.authorization;
    
    // If Supabase is not available, use mock authentication
    if (!supabase) {
      // Extract user info from headers or use defaults
      const mockUserId = req.headers['x-user-id'] || 'mock-user-1';
      const mockUserEmail = req.headers['x-user-email'] || 'mock@example.com';
      
      req.user = {
        id: mockUserId,
        email: mockUserEmail,
        user_metadata: {
          full_name: 'Mock User'
        }
      };
      req.isAuthenticated = true;
      return next();
    }

    // If no auth header, try to get user from session or other sources
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // For development, allow requests without auth but with mock user
      const mockUserId = req.headers['x-user-id'] || 'dev-user-1';
      const mockUserEmail = req.headers['x-user-email'] || 'dev@example.com';
      
      req.user = {
        id: mockUserId,
        email: mockUserEmail,
        user_metadata: {
          full_name: 'Development User'
        }
      };
      req.isAuthenticated = false; // Mark as not authenticated
      return next();
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

    // Attach user info to request
    req.user = user;
    req.isAuthenticated = true;

    next();
  } catch (error) {
    console.error('❌ [AUTH] Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Middleware to require authentication (stricter than authenticateUser)
 * Returns 401 if user is not authenticated
 */
const requireAuth = async (req, res, next) => {
  try {
    // Check for Authorization header
    const authHeader = req.headers.authorization;
    
    // If Supabase is not available, use mock authentication
    if (!supabase) {
      const mockUserId = req.headers['x-user-id'] || 'mock-user-1';
      const mockUserEmail = req.headers['x-user-email'] || 'mock@example.com';
      
      req.user = {
        id: mockUserId,
        email: mockUserEmail,
        user_metadata: {
          full_name: 'Mock User'
        }
      };
      req.isAuthenticated = true;
      return next();
    }

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

    // Attach user info to request
    req.user = user;
    req.isAuthenticated = true;

    next();
  } catch (error) {
    console.error('❌ [AUTH] Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Middleware to check if user can access a specific resource
 * Validates that the resource belongs to the authenticated user
 */
const checkResourceAccess = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    try {
      const authenticatedUserId = req.user?.id;
      
      if (!authenticatedUserId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          timestamp: new Date().toISOString()
        });
      }

      // Get resource user ID from params, query, or body
      const resourceUserId = req.params[resourceUserIdField] || 
                           req.query[resourceUserIdField] || 
                           req.body[resourceUserIdField];

      if (!resourceUserId) {
        return res.status(400).json({
          success: false,
          message: `${resourceUserIdField} is required`,
          timestamp: new Date().toISOString()
        });
      }

      // Check if user can access this resource
      if (resourceUserId !== authenticatedUserId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You can only access your own resources',
          timestamp: new Date().toISOString()
        });
      }

      next();
    } catch (error) {
      console.error('❌ [AUTH] Resource access check error:', error);
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
 * Middleware to extract user ID from request and attach to req.userId
 * Useful for consistent user ID handling across routes
 */
const extractUserId = (req, res, next) => {
  try {
    // Try to get user ID from authenticated user first
    if (req.user?.id) {
      req.userId = req.user.id;
      return next();
    }

    // Fallback to headers or params
    const userId = req.headers['x-user-id'] || 
                  req.params.userId || 
                  req.query.userId || 
                  req.body.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
        timestamp: new Date().toISOString()
      });
    }

    req.userId = userId;
    next();
  } catch (error) {
    console.error('❌ [AUTH] User ID extraction error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  authenticateUser,
  requireAuth,
  checkResourceAccess,
  extractUserId
};
