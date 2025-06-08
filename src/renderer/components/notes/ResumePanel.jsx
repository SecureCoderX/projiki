// src/renderer/components/notes/ResumePanel.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Card, Button } from '../ui';
import useNotesStore from '../../stores/useNotesStore';
import useProjectStore from '../../stores/useProjectStore';
import usePromptStore from '../../stores/usePromptStore';
import useSnippetStore from '../../stores/useSnippetStore';
import { useNavigate } from 'react-router-dom';

const ResumePanel = ({ className = '' }) => {
  const navigate = useNavigate();
  
  const { sessionData, notes, setCurrentNote } = useNotesStore();
  const { projects, setCurrentProject } = useProjectStore();
  const { prompts } = usePromptStore();
  const { snippets } = useSnippetStore();

  // Get recent items from session
  const recentItems = sessionData.recentItems || [];
  const lastActiveNote = notes.find(n => n.id === sessionData.lastActiveNote);
  const lastActiveProject = projects.find(p => p.id === sessionData.lastActiveProject);
  const lastActivePrompt = prompts.find(p => p.id === sessionData.lastActivePrompt);
  const lastActiveSnippet = snippets.find(s => s.id === sessionData.lastActiveSnippet);

  // Quick actions
  const handleResumeNote = () => {
    if (lastActiveNote) {
      setCurrentNote(lastActiveNote);
      navigate('/notes');
    }
  };

  const handleResumeProject = () => {
    if (lastActiveProject) {
      setCurrentProject(lastActiveProject);
      navigate('/projects');
    }
  };

  const handleResumePrompt = () => {
    if (lastActivePrompt) {
      navigate('/vault');
    }
  };

  const handleResumeSnippet = () => {
    if (lastActiveSnippet) {
      navigate('/snippets');
    }
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const date = new Date(timestamp);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const getItemIcon = (type) => {
    const icons = {
      note: '📝',
      project: '📁',
      prompt: '🤖',
      snippet: '💾',
      task: '✅',
      idea: '💡'
    };
    return icons[type] || '📄';
  };

  // Don't show if no recent activity
  if (recentItems.length === 0 && !lastActiveNote && !lastActiveProject) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card padding="medium" className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
                <polyline points="17,6 23,6 23,12"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-primary">Resume Where You Left Off</h3>
          </div>
          <div className="text-xs text-text-muted">
            {sessionData.sessionStartTime && (
              <span>Session started {formatTimeAgo(sessionData.sessionStartTime)}</span>
            )}
          </div>
        </div>

        {/* Last Active Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {/* Last Note */}
          {lastActiveNote && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <button
                onClick={handleResumeNote}
                className="w-full p-3 bg-bg-primary rounded-lg border border-border hover:border-accent transition-colors text-left group"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">📝</span>
                  <span className="text-sm font-medium text-accent">Last Note</span>
                </div>
                <p className="text-sm font-medium text-text-primary truncate group-hover:text-accent transition-colors">
                  {lastActiveNote.title}
                </p>
                <p className="text-xs text-text-muted">
                  {lastActiveNote.type} • {lastActiveNote.metadata?.wordCount || 0} words
                </p>
              </button>
            </motion.div>
          )}

          {/* Last Project */}
          {lastActiveProject && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <button
                onClick={handleResumeProject}
                className="w-full p-3 bg-bg-primary rounded-lg border border-border hover:border-accent transition-colors text-left group"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">📁</span>
                  <span className="text-sm font-medium text-accent">Last Project</span>
                </div>
                <p className="text-sm font-medium text-text-primary truncate group-hover:text-accent transition-colors">
                  {lastActiveProject.name}
                </p>
                <p className="text-xs text-text-muted">
                  {lastActiveProject.status} • {lastActiveProject.mode}
                </p>
              </button>
            </motion.div>
          )}

          {/* Last Prompt */}
          {lastActivePrompt && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <button
                onClick={handleResumePrompt}
                className="w-full p-3 bg-bg-primary rounded-lg border border-border hover:border-accent transition-colors text-left group"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">🤖</span>
                  <span className="text-sm font-medium text-accent">Last Prompt</span>
                </div>
                <p className="text-sm font-medium text-text-primary truncate group-hover:text-accent transition-colors">
                  {lastActivePrompt.title}
                </p>
                <p className="text-xs text-text-muted">
                  Used {lastActivePrompt.usageCount} times
                </p>
              </button>
            </motion.div>
          )}

          {/* Last Snippet */}
          {lastActiveSnippet && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <button
                onClick={handleResumeSnippet}
                className="w-full p-3 bg-bg-primary rounded-lg border border-border hover:border-accent transition-colors text-left group"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">💾</span>
                  <span className="text-sm font-medium text-accent">Last Snippet</span>
                </div>
                <p className="text-sm font-medium text-text-primary truncate group-hover:text-accent transition-colors">
                  {lastActiveSnippet.title}
                </p>
                <p className="text-xs text-text-muted">
                  {lastActiveSnippet.language} • {lastActiveSnippet.usageCount} uses
                </p>
              </button>
            </motion.div>
          )}
        </div>

        {/* Recent Activity */}
        {recentItems.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-text-primary mb-3">Recent Activity</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {recentItems.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-2 hover:bg-bg-secondary rounded">
                  <span className="text-sm">{getItemIcon(activity.item.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary truncate">
                      {activity.action.replace('_', ' ')} "{activity.item.title}"
                    </p>
                  </div>
                  <span className="text-xs text-text-muted flex-shrink-0">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="text-xs text-text-muted">
              Quick actions to continue your work
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="small"
                onClick={() => navigate('/notes')}
                className="text-xs"
              >
                All Notes
              </Button>
              <Button
                variant="ghost"
                size="small"
                onClick={() => navigate('/projects')}
                className="text-xs"
              >
                All Projects
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default ResumePanel;