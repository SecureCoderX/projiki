// src/renderer/components/changelogs/ChangelogCard.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Button, Badge } from '../ui';

const ChangelogCard = ({ 
  changelog, 
  onEdit, 
  onDelete, 
  onDuplicate, 
  onPublish,
  onExport 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'feature':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'bugfix':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'improvement':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'breaking':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'deprecated':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const changesByCategory = changelog.changes?.reduce((acc, change) => {
    if (!acc[change.category]) acc[change.category] = [];
    acc[change.category].push(change);
    return acc;
  }, {}) || {};

  const hasBreakingChanges = changelog.metadata?.breakingChanges || 
    changelog.changes?.some(change => change.category === 'breaking');

  return (
    <Card 
      className="transition-all duration-200 hover:shadow-md border border-border"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-text-primary text-lg">
                v{changelog.version}
              </h3>
              {hasBreakingChanges && (
                <Badge variant="warning" size="small">
                  Breaking
                </Badge>
              )}
              {changelog.metadata?.securityUpdate && (
                <Badge variant="error" size="small">
                  Security
                </Badge>
              )}
              {changelog.metadata?.hotfix && (
                <Badge variant="warning" size="small">
                  Hotfix
                </Badge>
              )}
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(changelog.status)}`}>
              {changelog.status}
            </span>
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: showActions ? 1 : 0 }}
            className="flex items-center gap-1"
          >
            <Button
              variant="ghost"
              size="small"
              onClick={() => onEdit(changelog)}
              title="Edit changelog"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </Button>

            <Button
              variant="ghost"
              size="small"
              onClick={() => onDuplicate(changelog)}
              title="Duplicate changelog"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            </Button>

            {changelog.status === 'draft' && (
              <Button
                variant="ghost"
                size="small"
                onClick={() => onPublish(changelog)}
                title="Publish changelog"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                  <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                  <path d="M2 2l7.586 7.586"/>
                  <circle cx="11" cy="11" r="2"/>
                </svg>
              </Button>
            )}

            <Button
              variant="ghost"
              size="small"
              onClick={() => onExport(changelog, 'markdown')}
              title="Export changelog"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </Button>

            <Button
              variant="ghost"
              size="small"
              onClick={() => onDelete(changelog)}
              title="Delete changelog"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3,6 5,6 21,6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
            </Button>
          </motion.div>
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-4 text-sm text-text-muted mb-3">
          <div className="flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
            <span>{formatDate(changelog.releaseDate)}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c.39 0 .78.02 1.17.06"/>
            </svg>
            <span>{changelog.changes?.length || 0} changes</span>
          </div>

          {changelog.publishedBy && (
            <div className="flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span>by {changelog.publishedBy}</span>
            </div>
          )}
        </div>

        {/* Release Notes Preview */}
        {changelog.releaseNotes && (
          <div className="mb-3">
            <p className="text-sm text-text-secondary line-clamp-2">
              {changelog.releaseNotes}
            </p>
          </div>
        )}

        {/* Changes Summary */}
        {changelog.changes && changelog.changes.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-text-primary">Changes</h4>
              <Button
                variant="ghost"
                size="small"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? 'Show Less' : 'Show More'}
                <svg 
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  className={`ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                >
                  <polyline points="6,9 12,15 18,9"/>
                </svg>
              </Button>
            </div>

            {/* Category Summary */}
            <div className="flex flex-wrap gap-2 mb-2">
              {Object.entries(changesByCategory).map(([category, changes]) => (
                <Badge
                  key={category}
                  variant="outline"
                  size="small"
                  className={getCategoryColor(category)}
                >
                  {category} ({changes.length})
                </Badge>
              ))}
            </div>

            {/* Expanded Changes */}
            <motion.div
              initial={false}
              animate={{ height: isExpanded ? 'auto' : 0 }}
              className="overflow-hidden"
            >
              {isExpanded && (
                <div className="space-y-3 pt-2">
                  {Object.entries(changesByCategory).map(([category, changes]) => (
                    <div key={category}>
                      <h5 className={`text-xs font-medium uppercase tracking-wide mb-1 ${
                        category === 'feature' ? 'text-blue-600' :
                        category === 'bugfix' ? 'text-red-600' :
                        category === 'improvement' ? 'text-purple-600' :
                        category === 'breaking' ? 'text-orange-600' :
                        'text-gray-600'
                      }`}>
                        {category}
                      </h5>
                      <ul className="space-y-1">
                        {changes.map((change, index) => (
                          <li key={index} className="text-sm text-text-secondary flex items-start gap-2">
                            <span className="text-text-muted mt-1">•</span>
                            <div className="flex-1">
                              <span>{change.description}</span>
                              {change.linkedTasks && change.linkedTasks.length > 0 && (
                                <div className="text-xs text-text-muted mt-1">
                                  Linked tasks: {change.linkedTasks.join(', ')}
                                </div>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* Tags */}
        {changelog.tags && changelog.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {changelog.tags.map((tag, index) => (
              <Badge key={index} variant="outline" size="small">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ChangelogCard;