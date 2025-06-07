import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Breadcrumb = ({ customItems = null }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Route mapping for breadcrumb labels
  const routeLabels = {
    '/': 'Dashboard',
    '/projects': 'Projects',
    '/projects/new': 'New Project',
    '/vault': 'Prompt Vault',
    '/snippets': 'Code Snippets',
    '/notes': 'Notes',
    '/settings': 'Settings',
  };

  const generateBreadcrumbs = () => {
    if (customItems) return customItems;

    const pathSegments = location.pathname.split('/').filter(segment => segment !== '');
    const breadcrumbs = [{ label: 'Dashboard', path: '/' }];

    if (pathSegments.length > 0) {
      let currentPath = '';
      pathSegments.forEach((segment, index) => {
        currentPath += `/${segment}`;
        const label = routeLabels[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1);
        breadcrumbs.push({
          label,
          path: currentPath,
          isLast: index === pathSegments.length - 1,
        });
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <nav className="flex items-center space-x-2 text-sm">
      {breadcrumbs.map((crumb, index) => (
        <motion.div
          key={crumb.path}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center space-x-2"
        >
          {index > 0 && (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-text-muted"
            >
              <polyline points="9,18 15,12 9,6"/>
            </svg>
          )}
          
          {crumb.isLast ? (
            <span className="text-text-primary font-medium">{crumb.label}</span>
          ) : (
            <button
              onClick={() => handleNavigation(crumb.path)}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              {crumb.label}
            </button>
          )}
        </motion.div>
      ))}
    </nav>
  );
};

export default Breadcrumb;