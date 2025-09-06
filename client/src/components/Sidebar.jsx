// src/components/Sidebar.jsx
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  HomeIcon, 
  FolderIcon, 
  ChartBarIcon, 
  Cog6ToothIcon,
  SunIcon,
  MoonIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PlayIcon,
  RocketLaunchIcon,
  PlusIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

function Sidebar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isNear, setIsNear] = useState(false);
  const [projects, setProjects] = useState([]);
  const [expandedSections, setExpandedSections] = useState({});
  const [selectedProject, setSelectedProject] = useState(null);

  // Fetch projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from('projects')
            .select('id, name, description')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          setProjects(data || []);
          
          // Set first project as selected by default
          if (data && data.length > 0) {
            setSelectedProject(data[0]);
          }
        } catch (error) {
          console.error('Error fetching projects:', error);
        }
      }
    };

    fetchProjects();
  }, [user?.id]);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Projects', href: '/projects', icon: FolderIcon },
    { name: 'Test Management', href: '/test-management', icon: PlayIcon },
    { name: 'Deploy', href: '/deploy', icon: RocketLaunchIcon },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
  ];

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isActive = (href) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Handle mouse proximity to sidebar
  useEffect(() => {
    const handleMouseMove = (e) => {
      const sidebarWidth = isCollapsed ? 64 : 256;
      const isNearSidebar = e.clientX <= sidebarWidth + 20; // 20px buffer zone
      
      if (isNearSidebar && !isHovered) {
        setIsNear(true);
        setIsCollapsed(false);
      } else if (!isNearSidebar && !isHovered) {
        setIsNear(false);
        setIsCollapsed(true);
      }
    };

    // Only add listener on desktop
    if (window.innerWidth >= 1024) {
      document.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isCollapsed, isHovered]);

  // Auto-collapse when not near or hovered (desktop only)
  useEffect(() => {
    let timeout;
    if (!isHovered && !isNear && !isCollapsed) {
      timeout = setTimeout(() => {
        setIsCollapsed(true);
      }, 500); // Shorter delay for more responsive feel
    }
    return () => clearTimeout(timeout);
  }, [isHovered, isNear, isCollapsed]);

  return (
    <>
      {/* Mobile overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`
          fixed top-0 left-0 h-full z-50 transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-16' : 'w-64'} 
          ${!isCollapsed ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        onMouseEnter={() => {
          setIsHovered(true);
          setIsCollapsed(false);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          // Don't immediately collapse, let the proximity detection handle it
        }}
      >
        <div className="
          h-full bg-white/95 backdrop-blur-xl border-r border-gray-200/50
          dark:bg-gray-900/95 dark:border-gray-700/50
          flex flex-col shadow-xl
        ">
                     {/* Header */}
           <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
             {!isCollapsed && (
               <Link to="/" className="flex items-center gap-3 group">
                 <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 grid place-items-center group-hover:scale-110 transition-transform">
                   <span className="text-black font-bold text-sm">SD</span>
                 </div>
                 <span className="text-xl font-bold text-gray-900 dark:text-white">SoftDeploy</span>
               </Link>
             )}
             <button
               onClick={() => setIsCollapsed(!isCollapsed)}
               className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
             >
               {isCollapsed ? (
                 <Bars3Icon className="h-5 w-5 text-gray-700 dark:text-gray-200" />
               ) : (
                 <XMarkIcon className="h-5 w-5 text-gray-700 dark:text-gray-200 lg:hidden" />
               )}
             </button>
           </div>

                     {/* Navigation */}
           <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
             {/* Main Navigation */}
             {navigation.slice(0, 2).map((item) => (
               <Link
                 key={item.name}
                 to={item.href}
                 className={`
                   flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200
                   ${isActive(item.href)
                     ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30'
                     : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                   }
                   ${isCollapsed ? 'justify-center' : ''}
                 `}
                 title={isCollapsed ? item.name : ''}
               >
                 <item.icon className="h-5 w-5 flex-shrink-0" />
                 {!isCollapsed && (
                   <span className="font-medium">{item.name}</span>
                 )}
               </Link>
             ))}

             {/* Project-based Navigation */}
             {!isCollapsed && projects.length > 0 && (
               <div className="mt-6">
                 <div className="px-3 py-2">
                   <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                     Projects
                   </h3>
                 </div>
                 
                 {projects.map((project) => (
                   <div key={project.id} className="mb-2">
                     {/* Project Header */}
                     <button
                       onClick={() => toggleSection(project.id)}
                       className={`
                         w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200
                         ${expandedSections[project.id] 
                           ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' 
                           : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                         }
                       `}
                     >
                       <div className="flex items-center gap-3">
                         <FolderIcon className="h-4 w-4 flex-shrink-0" />
                         <span className="font-medium text-sm truncate">{project.name}</span>
                       </div>
                       {expandedSections[project.id] ? (
                         <ChevronDownIcon className="h-4 w-4 flex-shrink-0" />
                       ) : (
                         <ChevronRightIcon className="h-4 w-4 flex-shrink-0" />
                       )}
                     </button>

                     {/* Project Sub-navigation */}
                     {expandedSections[project.id] && (
                       <div className="ml-6 mt-1 space-y-1">
                         <Link
                           to={`/projects/${project.id}`}
                           className={`
                             flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm
                             ${isActive(`/projects/${project.id}`)
                               ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30'
                               : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                             }
                           `}
                         >
                           <DocumentTextIcon className="h-4 w-4 flex-shrink-0" />
                           <span>Overview</span>
                         </Link>
                         
                         <Link
                           to={`/test-management?project=${project.id}`}
                           className={`
                             flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm
                             ${isActive('/test-management')
                               ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-700 dark:text-green-300 border border-green-500/30'
                               : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                             }
                           `}
                         >
                           <PlayIcon className="h-4 w-4 flex-shrink-0" />
                           <span>Test Management</span>
                         </Link>
                         
                         <Link
                           to={`/deploy?project=${project.id}`}
                           className={`
                             flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm
                             ${isActive('/deploy')
                               ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30'
                               : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                             }
                           `}
                         >
                           <RocketLaunchIcon className="h-4 w-4 flex-shrink-0" />
                           <span>Deployments</span>
                         </Link>
                       </div>
                     )}
                   </div>
                 ))}
               </div>
             )}

             {/* Global Navigation */}
             {navigation.slice(2).map((item) => (
               <Link
                 key={item.name}
                 to={item.href}
                 className={`
                   flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200
                   ${isActive(item.href)
                     ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30'
                     : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                   }
                   ${isCollapsed ? 'justify-center' : ''}
                 `}
                 title={isCollapsed ? item.name : ''}
               >
                 <item.icon className="h-5 w-5 flex-shrink-0" />
                 {!isCollapsed && (
                   <span className="font-medium">{item.name}</span>
                 )}
               </Link>
             ))}
           </nav>

                     {/* Bottom section */}
           <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
             {/* Theme toggle */}
             <button
               onClick={toggleTheme}
               className="
                 w-full flex items-center gap-3 px-3 py-2 rounded-lg
                 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700
                 transition-colors
                 ${isCollapsed ? 'justify-center' : ''}
               "
               title={isCollapsed ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : ''}
             >
               {theme === 'dark' ? (
                 <SunIcon className="h-5 w-5" />
               ) : (
                 <MoonIcon className="h-5 w-5" />
               )}
               {!isCollapsed && (
                 <span className="font-medium">
                   {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                 </span>
               )}
             </button>

             {/* User info */}
             {!isCollapsed && (
               <div className="px-3 py-2">
                 <div className="flex items-center gap-3">
                   <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 grid place-items-center">
                     <span className="text-white text-sm font-semibold">
                       {user?.email?.charAt(0).toUpperCase() || 'U'}
                     </span>
                   </div>
                   <div className="flex-1 min-w-0">
                     <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                       {user?.user_metadata?.full_name || user?.email || 'User'}
                     </p>
                     <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                       {user?.email}
                     </p>
                   </div>
                 </div>
               </div>
             )}

             {/* Logout */}
             <button
               onClick={handleLogout}
               className="
                 w-full flex items-center gap-3 px-3 py-2 rounded-lg
                 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20
                 transition-colors
                 ${isCollapsed ? 'justify-center' : ''}
               "
               title={isCollapsed ? 'Logout' : ''}
             >
               <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
               </svg>
               {!isCollapsed && (
                 <span className="font-medium">Logout</span>
               )}
             </button>
           </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
