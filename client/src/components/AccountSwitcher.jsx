// client/src/components/AccountSwitcher.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ChevronDownIcon,
  UserIcon,
  BuildingOfficeIcon,
  PlusIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

const AccountSwitcher = ({ onContextChange }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeContext, setActiveContext] = useState(null);
  const [personalProjects, setPersonalProjects] = useState([]);
  const [invitedProjects, setInvitedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load context data on mount
  useEffect(() => {
    loadContextData();
  }, [user]);

  const loadContextData = async () => {
    try {
      setLoading(true);
      
      // Load personal projects (user's own projects)
      const personalResponse = await fetch('/api/projects/personal', {
        headers: {
          'X-User-Id': user?.id || 'user-1',
          'X-User-Email': user?.email || 'user@example.com'
        }
      });

      if (personalResponse.ok) {
        const personalData = await personalResponse.json();
        setPersonalProjects(personalData.data || []);
      }

      // Load invited projects (projects user is a member of)
      const invitedResponse = await fetch('/api/projects/invited', {
        headers: {
          'X-User-Id': user?.id || 'user-1',
          'X-User-Email': user?.email || 'user@example.com'
        }
      });

      if (invitedResponse.ok) {
        const invitedData = await invitedResponse.json();
        setInvitedProjects(invitedData.data || []);
      }

      // Load saved active context
      const savedContext = localStorage.getItem('activeContext');
      if (savedContext) {
        const context = JSON.parse(savedContext);
        setActiveContext(context);
      } else {
        // Default to Personal context
        const defaultContext = {
          type: 'personal',
          id: 'personal',
          name: 'Personal',
          description: 'Your personal projects and tests'
        };
        setActiveContext(defaultContext);
        localStorage.setItem('activeContext', JSON.stringify(defaultContext));
      }
    } catch (error) {
      console.error('Failed to load context data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContextChange = (context) => {
    setActiveContext(context);
    setIsOpen(false);
    
    // Persist context
    localStorage.setItem('activeContext', JSON.stringify(context));
    
    // Notify parent component
    if (onContextChange) {
      onContextChange(context);
    }
  };

  const getContextIcon = (type) => {
    switch (type) {
      case 'personal':
        return <UserIcon className="h-5 w-5" />;
      case 'project':
        return <BuildingOfficeIcon className="h-5 w-5" />;
      default:
        return <UserIcon className="h-5 w-5" />;
    }
  };

  const getContextBadge = (context) => {
    if (context.type === 'personal') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          Personal
        </span>
      );
    }
    
    if (context.role) {
      const roleColors = {
        owner: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        member: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      };
      
      return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${roleColors[context.role] || roleColors.member}`}>
          {context.role}
        </span>
      );
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
        <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
        data-testid="account-switcher-btn"
      >
        {getContextIcon(activeContext?.type)}
        <span className="truncate max-w-32">{activeContext?.name}</span>
        <ChevronDownIcon className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Switch Account
            </h3>
            
            {/* Personal Section */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Personal
                </h4>
              </div>
              
              <button
                onClick={() => handleContextChange({
                  type: 'personal',
                  id: 'personal',
                  name: 'Personal',
                  description: 'Your personal projects and tests'
                })}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  activeContext?.type === 'personal' 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                data-testid="personal-context-btn"
              >
                <div className="flex items-center space-x-3">
                  <UserIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      Personal
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Your personal projects and tests
                    </div>
                  </div>
                </div>
                {activeContext?.type === 'personal' && (
                  <CheckIcon className="h-5 w-5 text-blue-500" />
                )}
              </button>
            </div>

            {/* Invited Projects Section */}
            {invitedProjects.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Projects
                  </h4>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {invitedProjects.length} project{invitedProjects.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="space-y-2">
                  {invitedProjects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => handleContextChange({
                        type: 'project',
                        id: project.id,
                        name: project.name,
                        description: project.description,
                        role: project.role
                      })}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        activeContext?.id === project.id 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                      data-testid={`project-context-btn-${project.id}`}
                    >
                      <div className="flex items-center space-x-3">
                        <BuildingOfficeIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        <div className="text-left">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {project.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {project.description}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getContextBadge({ role: project.role })}
                        {activeContext?.id === project.id && (
                          <CheckIcon className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State for Invited Projects */}
            {invitedProjects.length === 0 && (
              <div className="text-center py-6">
                <BuildingOfficeIcon className="h-8 w-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No project invitations yet
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  You'll see invited projects here when someone adds you
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSwitcher;
