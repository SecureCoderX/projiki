import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Badge, Input } from '../ui';
import useProjectStore from '../../stores/useProjectStore';

const ProjectFilters = ({ 
  filters, 
  onFiltersChange, 
  onClearFilters,
  projectsCount = 0 
}) => {
  const { getAllTags, getProjectStats } = useProjectStore();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const allTags = getAllTags();
  const stats = getProjectStats();

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleTagToggle = (tag) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    
    handleFilterChange('tags', newTags);
  };

  const hasActiveFilters = () => {
    return filters.status !== 'all' || 
           filters.mode !== 'all' || 
           filters.priority !== 'all' || 
           (filters.tags && filters.tags.length > 0) ||
           filters.search;
  };

  const statusOptions = [
    { value: 'all', label: 'All Status', count: stats.total },
    { value: 'active', label: 'Active', count: stats.active },
    { value: 'paused', label: 'Paused', count: stats.paused },
    { value: 'completed', label: 'Completed', count: stats.completed },
    { value: 'archived', label: 'Archived', count: stats.archived }
  ];

  const modeOptions = [
    { value: 'all', label: 'All Modes' },
    { value: 'structured', label: 'Structured' },
    { value: 'creative', label: 'Creative' },
    { value: 'hybrid', label: 'Hybrid' }
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' }
  ];

  const sortOptions = [
    { value: 'updatedAt-desc', label: 'Recently Updated' },
    { value: 'createdAt-desc', label: 'Recently Created' },
    { value: 'name-asc', label: 'Name A-Z' },
    { value: 'name-desc', label: 'Name Z-A' },
    { value: 'deadline-asc', label: 'Deadline (Soon)' },
    { value: 'priority-desc', label: 'Priority (High)' }
  ];

  return (
    <Card variant="elevated" padding="medium" className="mb-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h3 className="font-semibold text-text-primary">
            Filters & Sort
          </h3>
          
          {projectsCount > 0 && (
            <Badge variant="outline" size="medium">
              {projectsCount} project{projectsCount !== 1 ? 's' : ''}
            </Badge>
          )}
          
          {hasActiveFilters() && (
            <Button
              variant="ghost"
              size="small"
              onClick={onClearFilters}
              className="text-accent hover:text-accent-hover"
            >
              Clear All
            </Button>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="small"
          onClick={() => setIsExpanded(!isExpanded)}
          className="md:hidden"
        >
          {isExpanded ? 'Less' : 'More'}
        </Button>
      </div>

      {/* Quick Filters - Always Visible */}
      <div className="flex flex-wrap gap-2 mb-4">
        {statusOptions.slice(0, 4).map((option) => (
          <Button
            key={option.value}
            variant={filters.status === option.value ? 'primary' : 'ghost'}
            size="small"
            onClick={() => handleFilterChange('status', option.value)}
            className="flex items-center space-x-1"
          >
            <span>{option.label}</span>
            {option.count !== undefined && (
              <Badge
                variant={filters.status === option.value ? 'outline' : 'default'}
                size="small"
                className="ml-1"
              >
                {option.count}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Detailed Filters - Expandable on Mobile */}
      <AnimatePresence>
        <motion.div
          initial={false}
          animate={{
            height: isExpanded || window.innerWidth >= 768 ? 'auto' : 0,
            opacity: isExpanded || window.innerWidth >= 768 ? 1 : 0
          }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden md:block"
        >
          <div className="space-y-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Search Projects
              </label>
              <Input
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search by name or description..."
                className="w-full"
              />
            </div>

            {/* Mode and Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Project Mode
                </label>
                <select
                  value={filters.mode || 'all'}
                  onChange={(e) => handleFilterChange('mode', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-bg-secondary text-text-primary border-border hover:border-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors duration-200"
                >
                  {modeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Priority
                </label>
                <select
                  value={filters.priority || 'all'}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-bg-secondary text-text-primary border-border hover:border-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors duration-200"
                >
                  {priorityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy || 'updatedAt-desc'}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-bg-secondary text-text-primary border-border hover:border-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors duration-200"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            {allTags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Filter by Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => {
                    const isSelected = filters.tags && filters.tags.includes(tag);
                    return (
                      <Badge
                        key={tag}
                        variant={isSelected ? 'primary' : 'outline'}
                        className="cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => handleTagToggle(tag)}
                      >
                        {tag}
                        {isSelected && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-1">
                            <polyline points="20,6 9,17 4,12"/>
                          </svg>
                        )}
                      </Badge>
                    );
                  })}
                </div>
                
                {filters.tags && filters.tags.length > 0 && (
                  <div className="mt-2 text-sm text-text-muted">
                    Filtering by: {filters.tags.join(', ')}
                  </div>
                )}
              </div>
            )}

            {/* Active Filters Summary */}
            {hasActiveFilters() && (
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-muted">
                    Active filters applied
                  </span>
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={onClearFilters}
                    className="text-accent hover:text-accent-hover"
                  >
                    Clear All Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </Card>
  );
};

export default ProjectFilters;