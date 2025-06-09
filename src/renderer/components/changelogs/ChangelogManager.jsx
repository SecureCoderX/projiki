// src/renderer/components/changelogs/ChangelogManager.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Input } from '../ui';
import ChangelogCard from './ChangelogCard';
import ChangelogForm from './ChangelogForm';
import useChangelogStore from '../../stores/useChangelogStore';

const ChangelogManager = ({ projectId }) => {
  const {
    changelogs,
    loadingChangelogs,
    deleteChangelog,
    duplicateChangelog,
    publishChangelog,
    exportChangelog,
    updateChangelog
  } = useChangelogStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('version');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showForm, setShowForm] = useState(false);
  const [editingChangelog, setEditingChangelog] = useState(null);

  // Filter and sort changelogs
  const filteredChangelogs = useMemo(() => {
    let filtered = changelogs.filter(changelog => 
      changelog.projectId === projectId
    );

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(changelog =>
        changelog.version.toLowerCase().includes(searchLower) ||
        changelog.releaseNotes.toLowerCase().includes(searchLower) ||
        changelog.changes?.some(change => 
          change.description.toLowerCase().includes(searchLower)
        ) ||
        changelog.tags?.some(tag => 
          tag.toLowerCase().includes(searchLower)
        )
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(changelog => changelog.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'version':
          // Sort by semantic version
          const aVersion = a.version.split('.').map(Number);
          const bVersion = b.version.split('.').map(Number);
          
          for (let i = 0; i < 3; i++) {
            if (aVersion[i] !== bVersion[i]) {
              aValue = aVersion[i] || 0;
              bValue = bVersion[i] || 0;
              break;
            }
          }
          if (aValue === undefined) aValue = bValue = 0;
          break;
          
        case 'releaseDate':
          aValue = new Date(a.releaseDate);
          bValue = new Date(b.releaseDate);
          break;
          
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
          
        case 'changes':
          aValue = a.changes?.length || 0;
          bValue = b.changes?.length || 0;
          break;
          
        default:
          aValue = new Date(a.updatedAt);
          bValue = new Date(b.updatedAt);
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [changelogs, projectId, searchTerm, statusFilter, sortBy, sortOrder]);

  const handleCreateChangelog = () => {
    setEditingChangelog(null);
    setShowForm(true);
  };

  const handleEditChangelog = (changelog) => {
    setEditingChangelog(changelog);
    setShowForm(true);
  };

  const handleDeleteChangelog = async (changelog) => {
    if (window.confirm(`Are you sure you want to delete changelog v${changelog.version}?`)) {
      try {
        await deleteChangelog(changelog.id);
      } catch (error) {
        console.error('Failed to delete changelog:', error);
      }
    }
  };

  const handleDuplicateChangelog = async (changelog) => {
    try {
      await duplicateChangelog(changelog.id);
    } catch (error) {
      console.error('Failed to duplicate changelog:', error);
    }
  };

  const handlePublishChangelog = async (changelog) => {
    if (window.confirm(`Are you sure you want to publish changelog v${changelog.version}?`)) {
      try {
        const publishedBy = prompt('Enter your name:');
        if (publishedBy) {
          await publishChangelog(changelog.id, publishedBy);
        }
      } catch (error) {
        console.error('Failed to publish changelog:', error);
      }
    }
  };

  const handleExportChangelog = async (changelog, format = 'markdown') => {
    try {
      await exportChangelog(changelog.id, format);
    } catch (error) {
      console.error('Failed to export changelog:', error);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingChangelog(null);
  };

  const stats = useMemo(() => {
    const projectChangelogs = changelogs.filter(c => c.projectId === projectId);
    return {
      total: projectChangelogs.length,
      published: projectChangelogs.filter(c => c.status === 'published').length,
      draft: projectChangelogs.filter(c => c.status === 'draft').length,
      archived: projectChangelogs.filter(c => c.status === 'archived').length
    };
  }, [changelogs, projectId]);

  if (loadingChangelogs) {
    return (
      <Card className="p-8 text-center">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-text-muted">Loading changelogs...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Changelogs</h2>
          <div className="flex items-center gap-4 mt-2 text-sm text-text-muted">
            <span>{stats.total} total</span>
            <span>{stats.published} published</span>
            <span>{stats.draft} drafts</span>
            {stats.archived > 0 && <span>{stats.archived} archived</span>}
          </div>
        </div>
        
        <Button onClick={handleCreateChangelog}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          New Changelog
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <Input
                type="text"
                placeholder="Search changelogs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 text-sm bg-bg-secondary text-text-primary border-border hover:border-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors duration-200"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Sort Options */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm bg-bg-secondary text-text-primary border-border hover:border-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors duration-200"
            >
              <option value="version">Version</option>
              <option value="releaseDate">Release Date</option>
              <option value="status">Status</option>
              <option value="changes">Changes</option>
            </select>
            
            <Button
              variant="outline"
              size="small"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                className={`transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`}
              >
                <polyline points="6,9 12,15 18,9"/>
              </svg>
            </Button>
          </div>
        </div>

        {/* Active Filters */}
        {(searchTerm || statusFilter !== 'all') && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
            <span className="text-sm text-text-muted">Active filters:</span>
            {searchTerm && (
              <div className="flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent rounded text-sm">
                Search: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm('')}
                  className="hover:text-accent-hover"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            )}
            {statusFilter !== 'all' && (
              <div className="flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent rounded text-sm">
                Status: {statusFilter}
                <button
                  onClick={() => setStatusFilter('all')}
                  className="hover:text-accent-hover"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Results */}
      {filteredChangelogs.length === 0 ? (
        <Card className="p-8 text-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 mx-auto mb-4">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
          <h3 className="text-lg font-medium text-text-primary mb-2">
            {searchTerm || statusFilter !== 'all' ? 'No matching changelogs found' : 'No changelogs yet'}
          </h3>
          <p className="text-text-muted mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters.'
              : 'Start documenting your project changes with version changelogs.'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <Button onClick={handleCreateChangelog}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
              Create First Changelog
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence>
            {filteredChangelogs.map((changelog) => (
              <motion.div
                key={changelog.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <ChangelogCard
                  changelog={changelog}
                  onEdit={handleEditChangelog}
                  onDelete={handleDeleteChangelog}
                  onDuplicate={handleDuplicateChangelog}
                  onPublish={handlePublishChangelog}
                  onExport={handleExportChangelog}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Search Results Info */}
      {(searchTerm || statusFilter !== 'all') && filteredChangelogs.length > 0 && (
        <p className="text-sm text-text-muted text-center">
          Showing {filteredChangelogs.length} of {changelogs.filter(c => c.projectId === projectId).length} changelogs
        </p>
      )}

      {/* Changelog Form Modal */}
      <ChangelogForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingChangelog(null);
        }}
        changelog={editingChangelog}
        defaultProjectId={projectId}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
};

export default ChangelogManager;