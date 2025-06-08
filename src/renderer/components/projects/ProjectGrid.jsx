import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectCard from './ProjectCard';
import { Card, Button } from '../ui';

const ProjectGrid = ({ 
  projects, 
  loading = false,
  onProjectEdit,
  onProjectDelete,
  onProjectDuplicate,
  onProjectArchive,
  onProjectSelect,
  onCreateProject
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <Card key={index} variant="elevated" padding="medium" className="animate-pulse">
            <div className="space-y-4">
              <div className="h-4 bg-bg-tertiary rounded w-3/4"></div>
              <div className="h-3 bg-bg-tertiary rounded w-full"></div>
              <div className="h-3 bg-bg-tertiary rounded w-2/3"></div>
              <div className="flex space-x-2">
                <div className="h-5 bg-bg-tertiary rounded-full w-16"></div>
                <div className="h-5 bg-bg-tertiary rounded-full w-20"></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-8 bg-bg-tertiary rounded"></div>
                <div className="h-8 bg-bg-tertiary rounded"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Empty state
  if (!projects || projects.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card variant="elevated" padding="large" className="text-center">
          <div className="w-16 h-16 bg-accent/20 rounded-lg mx-auto mb-6 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
          
          <h3 className="text-xl font-semibold mb-3 text-text-primary">
            No Projects Yet
          </h3>
          
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            Create your first project to get started with Projiki. Choose from our templates or start from scratch.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              variant="primary" 
              onClick={() => onCreateProject?.()}
              className="min-w-[140px]"
            >
              Create Project
            </Button>
            
            <Button 
              variant="secondary"
              onClick={() => onCreateProject?.('template')}
              className="min-w-[140px]"
            >
              Use Template
            </Button>
          </div>
          
          {/* Quick Start Tips */}
          <div className="mt-8 pt-6 border-t border-border">
            <h4 className="text-sm font-medium text-text-primary mb-3">
              Quick Start Tips
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-text-muted">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <div className="font-medium text-text-secondary">Structured Mode</div>
                  <div>Perfect for client work and deadlines</div>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <div className="font-medium text-text-secondary">Creative Mode</div>
                  <div>Great for experimental projects</div>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <div className="font-medium text-text-secondary">Hybrid Mode</div>
                  <div>Best of both worlds</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  // Projects grid
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      <AnimatePresence mode="popLayout">
        {projects.map((project) => (
          <motion.div
            key={project.id}
            variants={itemVariants}
            layout
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <ProjectCard
              project={project}
              onEdit={onProjectEdit}
              onDelete={onProjectDelete}
              onDuplicate={onProjectDuplicate}
              onArchive={onProjectArchive}
              onSelect={onProjectSelect}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProjectGrid;