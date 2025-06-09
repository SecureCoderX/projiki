import React, { useState } from 'react';
import { Card, Button, Badge } from '../ui';
import useTaskStore from '../../stores/useTaskStore';
import BugForm from './BugForm';

const BugCard = ({ bug, onEdit, onDelete, onDuplicate, className = '' }) => {
  const [showEditForm, setShowEditForm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const updateTaskStatus = useTaskStore(state => state.updateTaskStatus);
  const updateBugSeverity = useTaskStore(state => state.updateBugSeverity);
  const resolveBug = useTaskStore(state => state.resolveBug);
  const reopenBug = useTaskStore(state => state.reopenBug);

  // Get severity color
  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-red-500/20 text-red-500 border-red-500/30',
      major: 'bg-orange-500/20 text-orange-500 border-orange-500/30',
      medium: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
      minor: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
      trivial: 'bg-gray-500/20 text-gray-500 border-gray-500/30'
    };
    return colors[severity] || colors.medium;
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-red-500/20 text-red-500 border-red-500/30',
      'in-progress': 'bg-blue-500/20 text-blue-500 border-blue-500/30',
      testing: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
      resolved: 'bg-green-500/20 text-green-500 border-green-500/30',
      closed: 'bg-gray-500/20 text-gray-500 border-gray-500/30'
    };
    return colors[status] || colors.open;
  };

  // Get priority icon
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent': return '🔥';
      case 'high': return '⚡';
      case 'medium': return '📋';
      case 'low': return '📝';
      default: return '📋';
    }
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    const icons = {
      'ui-ux': '🎨',
      backend: '⚙️',
      frontend: '🖼️',
      performance: '⚡',
      security: '🔒',
      documentation: '📚',
      general: '🐛'
    };
    return icons[category] || icons.general;
  };

  const handleStatusChange = async (newStatus) => {
    setIsUpdating(true);
    try {
      if (newStatus === 'resolved') {
        await resolveBug(bug.id, 'Current User'); // In real app, get from auth
      } else if (newStatus === 'open' && bug.status === 'resolved') {
        await reopenBug(bug.id);
      } else {
        await updateTaskStatus(bug.id, newStatus);
      }
    } catch (error) {
      console.error('Failed to update bug status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSeverityChange = async (newSeverity) => {
    setIsUpdating(true);
    try {
      await updateBugSeverity(bug.id, newSeverity);
    } catch (error) {
      console.error('Failed to update bug severity:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const getTimeSinceReported = () => {
    if (!bug.metadata?.dateReported) return '';
    const reported = new Date(bug.metadata.dateReported);
    const now = new Date();
    const diffTime = Math.abs(now - reported);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  return (
    <>
      <Card className={`p-4 hover:shadow-lg transition-all duration-200 ${className}`}>
        {/* Bug Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{getCategoryIcon(bug.metadata?.category)}</span>
              <h3 className="font-semibold text-text-primary line-clamp-1">
                {bug.title}
              </h3>
              <span className="text-xs text-text-muted">#{bug.id.slice(-6)}</span>
            </div>
            
            {/* Bug Metadata Row */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge 
                className={`text-xs border ${getSeverityColor(bug.metadata?.severity)}`}
                title="Severity"
              >
                {bug.metadata?.severity || 'medium'}
              </Badge>
              
              <Badge 
                className={`text-xs border ${getStatusColor(bug.status)}`}
                title="Status"
              >
                {bug.status}
              </Badge>
              
              <span className="text-xs text-text-muted flex items-center gap-1">
                {getPriorityIcon(bug.metadata?.priority)}
                {bug.metadata?.priority || 'medium'}
              </span>
              
              {bug.metadata?.source && (
                <span className="text-xs text-text-muted">
                  via {bug.metadata.source.replace('-', ' ')}
                </span>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1 ml-2">
            <Button
              variant="ghost"
              size="small"
              onClick={() => setShowEditForm(true)}
              className="p-1 h-8 w-8"
              title="Edit Bug"
            >
              ✏️
            </Button>
            
            <Button
              variant="ghost"
              size="small"
              onClick={() => onDuplicate?.(bug)}
              className="p-1 h-8 w-8"
              title="Duplicate Bug"
            >
              📋
            </Button>
            
            <Button
              variant="ghost"
              size="small"
              onClick={() => onDelete?.(bug.id)}
              className="p-1 h-8 w-8 text-red-500 hover:text-red-400"
              title="Delete Bug"
            >
              🗑️
            </Button>
          </div>
        </div>

        {/* Bug Description */}
        {bug.content && (
          <div className="mb-3">
            <p className="text-sm text-text-secondary line-clamp-2">
              {bug.content}
            </p>
          </div>
        )}

        {/* Reproduction Steps Preview */}
        {bug.metadata?.reproduction && (
          <div className="mb-3">
            <div className="text-xs text-text-muted mb-1">Steps to Reproduce:</div>
            <p className="text-xs text-text-secondary bg-bg-tertiary p-2 rounded line-clamp-2">
              {bug.metadata.reproduction}
            </p>
          </div>
        )}

        {/* Environment & Reporter */}
        {(bug.metadata?.environment || bug.metadata?.reportedBy) && (
          <div className="mb-3 text-xs text-text-muted">
            {bug.metadata?.environment && (
              <div>Environment: {bug.metadata.environment}</div>
            )}
            {bug.metadata?.reportedBy && (
              <div>Reported by: {bug.metadata.reportedBy}</div>
            )}
          </div>
        )}

        {/* Tags */}
        {bug.metadata?.tags && bug.metadata.tags.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {bug.metadata.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="default" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {bug.metadata.tags.length > 3 && (
                <Badge variant="default" className="text-xs">
                  +{bug.metadata.tags.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Status Actions */}
        <div className="border-t border-border pt-3">
          <div className="flex items-center justify-between">
            <div className="text-xs text-text-muted">
              Reported {getTimeSinceReported()}
              {bug.metadata?.dateResolved && (
                <span> • Resolved {formatDate(bug.metadata.dateResolved)}</span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {/* Status Quick Actions */}
              {bug.status === 'open' && (
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => handleStatusChange('in-progress')}
                  disabled={isUpdating}
                  className="text-xs"
                >
                  Start Work
                </Button>
              )}
              
              {bug.status === 'in-progress' && (
                <>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => handleStatusChange('testing')}
                    disabled={isUpdating}
                    className="text-xs"
                  >
                    Testing
                  </Button>
                  <Button
                    variant="primary"
                    size="small"
                    onClick={() => handleStatusChange('resolved')}
                    disabled={isUpdating}
                    className="text-xs"
                  >
                    Resolve
                  </Button>
                </>
              )}
              
              {bug.status === 'testing' && (
                <>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => handleStatusChange('in-progress')}
                    disabled={isUpdating}
                    className="text-xs"
                  >
                    Back to Work
                  </Button>
                  <Button
                    variant="primary"
                    size="small"
                    onClick={() => handleStatusChange('resolved')}
                    disabled={isUpdating}
                    className="text-xs"
                  >
                    Resolve
                  </Button>
                </>
              )}
              
              {bug.status === 'resolved' && (
                <>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => handleStatusChange('open')}
                    disabled={isUpdating}
                    className="text-xs"
                  >
                    Reopen
                  </Button>
                  <Button
                    variant="primary"
                    size="small"
                    onClick={() => handleStatusChange('closed')}
                    disabled={isUpdating}
                    className="text-xs"
                  >
                    Close
                  </Button>
                </>
              )}
              
              {bug.status === 'closed' && (
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => handleStatusChange('open')}
                  disabled={isUpdating}
                  className="text-xs"
                >
                  Reopen
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Edit Form Modal */}
      {showEditForm && (
        <BugForm
          isOpen={showEditForm}
          onClose={() => setShowEditForm(false)}
          bug={bug}
          mode="edit"
        />
      )}
    </>
  );
};

export default BugCard;