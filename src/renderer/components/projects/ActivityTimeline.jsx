// ActivityTimeline.jsx - Complete activity tracking for ProjectWorkspace
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, Badge } from '../ui';

const ActivityTimeline = ({ 
  projectId, 
  tasks = [], 
  notes = [], 
  prompts = [], 
  snippets = [], 
  changelogs = [],
  project = null 
}) => {
  // Combine all activities into a timeline
  const activities = useMemo(() => {
    const activityList = [];

    // Add project creation
    if (project) {
      activityList.push({
        id: `project-${project.id}`,
        type: 'project',
        action: 'created',
        title: `Project "${project.name}" created`,
        description: project.description || 'New project started',
        timestamp: new Date(project.createdAt),
        metadata: {
          mode: project.mode,
          status: project.status,
          priority: project.metadata?.priority
        }
      });

      // Add project updates
      if (project.updatedAt && project.updatedAt !== project.createdAt) {
        activityList.push({
          id: `project-update-${project.id}`,
          type: 'project',
          action: 'updated',
          title: `Project "${project.name}" updated`,
          description: 'Project details were modified',
          timestamp: new Date(project.updatedAt),
          metadata: {
            mode: project.mode,
            status: project.status
          }
        });
      }
    }

    // Add task activities
    tasks.forEach(task => {
      if (task.projectId === projectId) {
        activityList.push({
          id: `task-${task.id}`,
          type: task.type === 'bug' ? 'bug' : 'task',
          action: 'created',
          title: `${task.type === 'bug' ? 'Bug' : 'Task'} "${task.title}" created`,
          description: task.content || 'No description provided',
          timestamp: new Date(task.createdAt),
          metadata: {
            status: task.status,
            priority: task.metadata?.priority || task.priority,
            severity: task.metadata?.severity,
            category: task.metadata?.category,
            type: task.type
          }
        });

        // Add status changes (if updated)
        if (task.updatedAt && task.updatedAt !== task.createdAt) {
          activityList.push({
            id: `task-update-${task.id}`,
            type: task.type === 'bug' ? 'bug' : 'task',
            action: task.status === 'done' ? 'completed' : 'updated',
            title: `${task.type === 'bug' ? 'Bug' : 'Task'} "${task.title}" ${task.status === 'done' ? 'completed' : 'updated'}`,
            description: `Status changed to ${task.status}`,
            timestamp: new Date(task.updatedAt),
            metadata: {
              status: task.status,
              priority: task.metadata?.priority || task.priority,
              type: task.type
            }
          });
        }
      }
    });

    // Add note activities
    notes.forEach(note => {
      if (note.projectId === projectId) {
        activityList.push({
          id: `note-${note.id}`,
          type: 'note',
          action: 'created',
          title: `Note "${note.title}" created`,
          description: note.content?.substring(0, 100) + (note.content?.length > 100 ? '...' : '') || 'No content',
          timestamp: new Date(note.createdAt),
          metadata: {
            type: note.type,
            wordCount: note.metadata?.wordCount,
            tags: note.tags
          }
        });
      }
    });

    // Add prompt activities
    prompts.forEach(prompt => {
      if (prompt.projectId === projectId || prompt.tags?.includes(projectId)) {
        activityList.push({
          id: `prompt-${prompt.id}`,
          type: 'prompt',
          action: 'created',
          title: `AI Prompt "${prompt.title}" saved`,
          description: prompt.content?.substring(0, 100) + (prompt.content?.length > 100 ? '...' : '') || 'No content',
          timestamp: new Date(prompt.createdAt),
          metadata: {
            category: prompt.category,
            tags: prompt.tags,
            aiModel: prompt.metadata?.aiModel
          }
        });

        // Add usage tracking
        if (prompt.usageCount > 0) {
          activityList.push({
            id: `prompt-used-${prompt.id}`,
            type: 'prompt',
            action: 'used',
            title: `AI Prompt "${prompt.title}" used`,
            description: `Prompt has been used ${prompt.usageCount} times`,
            timestamp: new Date(prompt.lastUsed || prompt.updatedAt),
            metadata: {
              usageCount: prompt.usageCount,
              category: prompt.category
            }
          });
        }
      }
    });

    // Add snippet activities
    snippets.forEach(snippet => {
      if (snippet.projectId === projectId || snippet.tags?.includes(projectId)) {
        activityList.push({
          id: `snippet-${snippet.id}`,
          type: 'snippet',
          action: 'created',
          title: `Code Snippet "${snippet.title}" saved`,
          description: `${snippet.language} code snippet added`,
          timestamp: new Date(snippet.createdAt),
          metadata: {
            language: snippet.language,
            category: snippet.category,
            tags: snippet.tags
          }
        });

        // Add usage tracking
        if (snippet.usageCount > 0) {
          activityList.push({
            id: `snippet-used-${snippet.id}`,
            type: 'snippet',
            action: 'used',
            title: `Code Snippet "${snippet.title}" used`,
            description: `Snippet has been copied ${snippet.usageCount} times`,
            timestamp: new Date(snippet.lastUsed || snippet.updatedAt),
            metadata: {
              usageCount: snippet.usageCount,
              language: snippet.language
            }
          });
        }
      }
    });

    // Add changelog activities
    changelogs.forEach(changelog => {
      if (changelog.projectId === projectId) {
        activityList.push({
          id: `changelog-${changelog.id}`,
          type: 'changelog',
          action: changelog.status === 'published' ? 'published' : 'created',
          title: `Version ${changelog.version} ${changelog.status === 'published' ? 'released' : 'drafted'}`,
          description: changelog.releaseNotes?.substring(0, 100) + (changelog.releaseNotes?.length > 100 ? '...' : '') || 'No release notes',
          timestamp: new Date(changelog.status === 'published' ? changelog.publishedAt : changelog.createdAt),
          metadata: {
            version: changelog.version,
            status: changelog.status,
            changesCount: changelog.changes?.length || 0
          }
        });
      }
    });

    // Sort by timestamp (newest first)
    return activityList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [projectId, tasks, notes, prompts, snippets, changelogs, project]);

  // Group activities by date
  const groupedActivities = useMemo(() => {
    const groups = {};
    
    activities.forEach(activity => {
      const date = activity.timestamp.toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(activity);
    });
    
    return groups;
  }, [activities]);

  // Get activity icon and color
  const getActivityIcon = (type, action) => {
    switch (type) {
      case 'project':
        return {
          icon: '📁',
          color: 'bg-blue-500/20 text-blue-400 dark:text-blue-300',
          bgColor: 'bg-blue-50 dark:bg-blue-900/30'
        };
      case 'task':
        return {
          icon: action === 'completed' ? '✅' : '📋',
          color: action === 'completed' ? 'bg-green-500/20 text-green-400 dark:text-green-300' : 'bg-gray-500/20 text-gray-400 dark:text-gray-300',
          bgColor: action === 'completed' ? 'bg-green-50 dark:bg-green-900/30' : 'bg-gray-50 dark:bg-gray-900/30'
        };
      case 'bug':
        return {
          icon: action === 'completed' ? '🔧' : '🐛',
          color: action === 'completed' ? 'bg-green-500/20 text-green-400 dark:text-green-300' : 'bg-red-500/20 text-red-400 dark:text-red-300',
          bgColor: action === 'completed' ? 'bg-green-50 dark:bg-green-900/30' : 'bg-red-50 dark:bg-red-900/30'
        };
      case 'note':
        return {
          icon: '📝',
          color: 'bg-purple-500/20 text-purple-400 dark:text-purple-300',
          bgColor: 'bg-purple-50 dark:bg-purple-900/30'
        };
      case 'prompt':
        return {
          icon: action === 'used' ? '🎯' : '🤖',
          color: 'bg-indigo-500/20 text-indigo-400 dark:text-indigo-300',
          bgColor: 'bg-indigo-50 dark:bg-indigo-900/30'
        };
      case 'snippet':
        return {
          icon: action === 'used' ? '📋' : '💾',
          color: 'bg-cyan-500/20 text-cyan-400 dark:text-cyan-300',
          bgColor: 'bg-cyan-50 dark:bg-cyan-900/30'
        };
      case 'changelog':
        return {
          icon: action === 'published' ? '🚀' : '📄',
          color: action === 'published' ? 'bg-green-500/20 text-green-400 dark:text-green-300' : 'bg-yellow-500/20 text-yellow-400 dark:text-yellow-300',
          bgColor: action === 'published' ? 'bg-green-50 dark:bg-green-900/30' : 'bg-yellow-50 dark:bg-yellow-900/30'
        };
      default:
        return {
          icon: '📌',
          color: 'bg-gray-500/20 text-gray-400 dark:text-gray-300',
          bgColor: 'bg-gray-50 dark:bg-gray-900/30'
        };
    }
  };

  // Format relative time
  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  if (activities.length === 0) {
    return (
      <Card className="p-8 text-center">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 mx-auto mb-4">
          <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
        </svg>
        <h3 className="text-lg font-medium text-text-primary mb-2">
          No Activity Yet
        </h3>
        <p className="text-text-muted">
          Project activity will appear here as you work on tasks, create notes, and update the project.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedActivities).map(([date, dateActivities], dateIndex) => (
        <motion.div
          key={date}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: dateIndex * 0.1 }}
          className="space-y-4"
        >
          {/* Date Header */}
          <div className="flex items-center">
            <div className="flex-1 h-px bg-border"></div>
            <div className="px-4 py-2 bg-bg-tertiary rounded-full border border-border">
              <span className="text-sm font-medium text-text-primary">
                {new Date(date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          {/* Activities for this date */}
          <div className="space-y-3">
            {dateActivities.map((activity, activityIndex) => {
              const { icon, color, bgColor } = getActivityIcon(activity.type, activity.action);
              
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (dateIndex * 0.1) + (activityIndex * 0.05) }}
                >
                  <Card className="p-4 border-l-4 border-l-accent hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-4">
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-lg flex-shrink-0`}>
                        {icon}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-text-primary mb-1">
                              {activity.title}
                            </h4>
                            <p className="text-sm text-text-muted mb-2 line-clamp-2">
                              {activity.description}
                            </p>
                            
                            {/* Metadata badges */}
                            <div className="flex flex-wrap gap-1">
                              <Badge variant="outline" size="small">
                                {activity.type}
                              </Badge>
                              
                              {activity.metadata?.status && (
                                <Badge 
                                  variant={activity.metadata.status === 'done' ? 'success' : 'secondary'} 
                                  size="small"
                                >
                                  {activity.metadata.status}
                                </Badge>
                              )}
                              
                              {activity.metadata?.priority && (
                                <Badge 
                                  variant={
                                    activity.metadata.priority === 'urgent' ? 'danger' :
                                    activity.metadata.priority === 'high' ? 'warning' : 'secondary'
                                  }
                                  size="small"
                                >
                                  {activity.metadata.priority}
                                </Badge>
                              )}
                              
                              {activity.metadata?.severity && (
                                <Badge 
                                  variant={
                                    activity.metadata.severity === 'critical' ? 'danger' :
                                    activity.metadata.severity === 'major' ? 'warning' : 'secondary'
                                  }
                                  size="small"
                                >
                                  {activity.metadata.severity}
                                </Badge>
                              )}
                              
                              {activity.metadata?.language && (
                                <Badge variant="outline" size="small">
                                  {activity.metadata.language}
                                </Badge>
                              )}
                              
                              {activity.metadata?.version && (
                                <Badge variant="primary" size="small">
                                  v{activity.metadata.version}
                                </Badge>
                              )}
                              
                              {activity.metadata?.usageCount && (
                                <Badge variant="success" size="small">
                                  {activity.metadata.usageCount} uses
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {/* Timestamp */}
                          <div className="text-xs text-text-muted ml-4 flex-shrink-0">
                            {getRelativeTime(activity.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      ))}
      
      {/* Activity Summary */}
      <Card className="p-4 bg-bg-secondary border border-border">
        <h4 className="text-sm font-medium text-text-primary mb-2">Activity Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-blue-400 dark:text-blue-300">
              {activities.filter(a => a.type === 'task' || a.type === 'bug').length}
            </div>
            <div className="text-xs text-text-muted">Tasks & Bugs</div>
          </div>
          <div>
            <div className="text-lg font-bold text-purple-400 dark:text-purple-300">
              {activities.filter(a => a.type === 'note').length}
            </div>
            <div className="text-xs text-text-muted">Notes</div>
          </div>
          <div>
            <div className="text-lg font-bold text-indigo-400 dark:text-indigo-300">
              {activities.filter(a => a.type === 'prompt' || a.type === 'snippet').length}
            </div>
            <div className="text-xs text-text-muted">AI Resources</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-400 dark:text-green-300">
              {activities.filter(a => a.action === 'completed').length}
            </div>
            <div className="text-xs text-text-muted">Completed</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ActivityTimeline;