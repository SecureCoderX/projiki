import React, { useState } from 'react';
import { Button, Badge } from '../ui';
import useTaskStore from '../../stores/useTaskStore';

const BugFilters = ({ className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const {
    statusFilter,
    priorityFilter,
    severityFilter,
    typeFilter,
    tagFilter,
    setStatusFilter,
    setPriorityFilter,
    setSeverityFilter,
    setTypeFilter,
    setTagFilter,
    clearFilters,
    getAllTaskTags,
    getTaskStats
  } = useTaskStore();

  const stats = getTaskStats();
  const availableTags = getAllTaskTags();

  const statusOptions = [
    { value: 'open', label: 'Open', count: stats.bugs?.open || 0, color: 'text-red-500' },
    { value: 'in-progress', label: 'In Progress', count: stats.bugs?.inProgress || 0, color: 'text-blue-500' },
    { value: 'testing', label: 'Testing', count: stats.bugs?.testing || 0, color: 'text-purple-500' },
    { value: 'resolved', label: 'Resolved', count: stats.bugs?.resolved || 0, color: 'text-green-500' },
    { value: 'closed', label: 'Closed', count: stats.bugs?.closed || 0, color: 'text-gray-500' }
  ];

  const severityOptions = [
    { value: 'critical', label: 'Critical', count: stats.bugs?.bySeverity?.critical || 0, color: 'text-red-500' },
    { value: 'major', label: 'Major', count: stats.bugs?.bySeverity?.major || 0, color: 'text-orange-500' },
    { value: 'medium', label: 'Medium', count: stats.bugs?.bySeverity?.medium || 0, color: 'text-yellow-500' },
    { value: 'minor', label: 'Minor', count: stats.bugs?.bySeverity?.minor || 0, color: 'text-blue-500' },
    { value: 'trivial', label: 'Trivial', count: stats.bugs?.bySeverity?.trivial || 0, color: 'text-gray-500' }
  ];

  const priorityOptions = [
    { value: 'urgent', label: 'Urgent', color: 'text-red-500' },
    { value: 'high', label: 'High', color: 'text-orange-500' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-500' },
    { value: 'low', label: 'Low', color: 'text-green-500' }
  ];

  const typeOptions = [
    { value: 'bug', label: 'Bugs', count: stats.byType?.bug || 0, color: 'text-red-500' },
    { value: 'task', label: 'Tasks', count: stats.byType?.task || 0, color: 'text-blue-500' },
    { value: 'feature', label: 'Features', count: stats.byType?.feature || 0, color: 'text-green-500' },
    { value: 'improvement', label: 'Improvements', count: stats.byType?.improvement || 0, color: 'text-purple-500' }
  ];

  const handleFilterToggle = (filterType, value, setFilter, currentFilter) => {
    const newFilter = currentFilter.includes(value)
      ? currentFilter.filter(item => item !== value)
      : [...currentFilter, value];
    setFilter(newFilter);
  };

  const getActiveFilterCount = () => {
    return statusFilter.length + priorityFilter.length + severityFilter.length + 
           typeFilter.length + tagFilter.length;
  };

  const FilterSection = ({ title, options, currentFilter, setFilter, showCounts = false }) => (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-text-primary">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {options.map(option => {
          const isActive = currentFilter.includes(option.value);
          return (
            <button
              key={option.value}
              onClick={() => handleFilterToggle(title, option.value, setFilter, currentFilter)}
              className={`px-3 py-1 text-xs rounded-full border transition-all ${
                isActive
                  ? 'bg-accent text-white border-accent'
                  : 'bg-bg-tertiary text-text-secondary border-border hover:border-accent hover:text-text-primary'
              }`}
            >
              {option.label}
              {showCounts && option.count !== undefined && (
                <span className="ml-1 opacity-75">({option.count})</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className={`bg-bg-secondary border border-border rounded-lg ${className}`}>
      {/* Filter Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <h3 className="font-medium text-text-primary">Filters</h3>
          {getActiveFilterCount() > 0 && (
            <Badge variant="primary" className="text-xs">
              {getActiveFilterCount()} active
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {getActiveFilterCount() > 0 && (
            <Button
              variant="ghost"
              size="small"
              onClick={clearFilters}
              className="text-xs"
            >
              Clear All
            </Button>
          )}
          <Button
            variant="ghost"
            size="small"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2"
          >
            {isExpanded ? '−' : '+'}
          </Button>
        </div>
      </div>

      {/* Quick Filters (Always Visible) */}
      <div className="p-4 space-y-4">
        <FilterSection
          title="Type"
          options={typeOptions}
          currentFilter={typeFilter}
          setFilter={setTypeFilter}
          showCounts={true}
        />
        
        <FilterSection
          title="Status"
          options={statusOptions.filter(opt => opt.count > 0)}
          currentFilter={statusFilter}
          setFilter={setStatusFilter}
          showCounts={true}
        />
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="border-t border-border p-4 space-y-4">
          <FilterSection
            title="Severity"
            options={severityOptions.filter(opt => opt.count > 0)}
            currentFilter={severityFilter}
            setFilter={setSeverityFilter}
            showCounts={true}
          />
          
          <FilterSection
            title="Priority"
            options={priorityOptions}
            currentFilter={priorityFilter}
            setFilter={setPriorityFilter}
          />
          
          {/* Tags Filter */}
          {availableTags.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-text-primary">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {availableTags.slice(0, 10).map(tag => {
                  const isActive = tagFilter.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => handleFilterToggle('Tags', tag, setTagFilter, tagFilter)}
                      className={`px-3 py-1 text-xs rounded-full border transition-all ${
                        isActive
                          ? 'bg-accent text-white border-accent'
                          : 'bg-bg-tertiary text-text-secondary border-border hover:border-accent hover:text-text-primary'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
                {availableTags.length > 10 && (
                  <span className="text-xs text-text-muted px-3 py-1">
                    +{availableTags.length - 10} more
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* Active Filters Summary */}
          {getActiveFilterCount() > 0 && (
            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-medium text-text-primary mb-2">Active Filters</h4>
              <div className="flex flex-wrap gap-2">
                {statusFilter.map(status => (
                  <Badge key={`status-${status}`} variant="primary" className="text-xs flex items-center gap-1">
                    Status: {status}
                    <button
                      onClick={() => setStatusFilter(statusFilter.filter(s => s !== status))}
                      className="ml-1 hover:text-red-300"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
                
                {severityFilter.map(severity => (
                  <Badge key={`severity-${severity}`} variant="warning" className="text-xs flex items-center gap-1">
                    Severity: {severity}
                    <button
                      onClick={() => setSeverityFilter(severityFilter.filter(s => s !== severity))}
                      className="ml-1 hover:text-red-300"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
                
                {priorityFilter.map(priority => (
                  <Badge key={`priority-${priority}`} variant="secondary" className="text-xs flex items-center gap-1">
                    Priority: {priority}
                    <button
                      onClick={() => setPriorityFilter(priorityFilter.filter(p => p !== priority))}
                      className="ml-1 hover:text-red-300"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
                
                {typeFilter.map(type => (
                  <Badge key={`type-${type}`} variant="success" className="text-xs flex items-center gap-1">
                    Type: {type}
                    <button
                      onClick={() => setTypeFilter(typeFilter.filter(t => t !== type))}
                      className="ml-1 hover:text-red-300"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
                
                {tagFilter.map(tag => (
                  <Badge key={`tag-${tag}`} variant="default" className="text-xs flex items-center gap-1">
                    Tag: {tag}
                    <button
                      onClick={() => setTagFilter(tagFilter.filter(t => t !== tag))}
                      className="ml-1 hover:text-red-300"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Filter Stats */}
      <div className="border-t border-border p-4">
        <div className="text-sm text-text-muted">
          {stats.bugs?.total || 0} total bugs • {stats.bugs?.open || 0} open • {stats.bugs?.resolved || 0} resolved
        </div>
      </div>
    </div>
  );
};

export default BugFilters;