// src/renderer/pages/Vault.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Input, Badge } from '../components/ui';
import PromptCard from '../components/prompts/PromptCard';
import PromptForm from '../components/prompts/PromptForm';
import usePromptStore from '../stores/usePromptStore';
import useAppStore from '../stores/useAppStore';

const Vault = () => {
  const {
    prompts,
    loadingPrompts,
    promptsError,
    categories,
    createPrompt,
    updatePrompt,
    deletePrompt,
    duplicatePrompt,
    toggleFavorite,
    incrementUsage,
    getFavoritePrompts,
    getPromptsByCategory,
    getPromptsByTag,
    getRecentPrompts,
    getMostUsedPrompts,
    getAllTags,
    getPromptStats,
    initialize
  } = usePromptStore();

  const { addNotification } = useAppStore();

  // Local state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [sortBy, setSortBy] = useState('updated'); // updated, created, usage, alphabetical
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Initialize store on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Filter and sort prompts
  const filteredPrompts = React.useMemo(() => {
  console.log('🐛 Starting filteredPrompts calculation');
  console.log('🐛 prompts:', prompts);
  console.log('🐛 prompts type:', typeof prompts, Array.isArray(prompts));
  
  let filtered = [...prompts]; // Start with a copy
  console.log('🐛 After copy:', filtered);

  // Filter by search term
  if (searchTerm) {
    console.log('🐛 Filtering by search term:', searchTerm);
    filtered = filtered.filter(prompt =>
      prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    console.log('🐛 After search filter:', filtered.length);
  }

  // Filter by category
  if (selectedCategory !== 'all') {
    console.log('🐛 Filtering by category:', selectedCategory);
    const categoryPrompts = getPromptsByCategory(selectedCategory);
    console.log('🐛 Category prompts:', categoryPrompts);
    filtered = [...categoryPrompts]; // Create a copy
    console.log('🐛 After category filter:', filtered.length);
  }

    // Filter by tag
    if (selectedTag !== 'all') {
      filtered = getPromptsByTag(selectedTag);
    }

    // Filter by favorites
    if (showFavoritesOnly) {
      filtered = filtered.filter(prompt => prompt.isFavorite);
    }

    // Sort prompts
    switch (sortBy) {
      case 'created':
        return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'updated':
        return filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      case 'usage':
        return filtered.sort((a, b) => b.usageCount - a.usageCount);
      case 'alphabetical':
        return filtered.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return filtered;
    }
  }, [prompts, searchTerm, selectedCategory, selectedTag, sortBy, showFavoritesOnly, getPromptsByCategory, getPromptsByTag]);

  // Event handlers
  const handleCreatePrompt = () => {
    setEditingPrompt(null);
    setIsFormOpen(true);
  };

  const handleEditPrompt = (prompt) => {
    setEditingPrompt(prompt);
    setIsFormOpen(true);
  };

  const handleDeletePrompt = async (prompt) => {
    if (window.confirm(`Are you sure you want to delete "${prompt.title}"?`)) {
      try {
        await deletePrompt(prompt.id);
      } catch (error) {
        console.error('Failed to delete prompt:', error);
      }
    }
  };

  const handleDuplicatePrompt = async (prompt) => {
    try {
      await duplicatePrompt(prompt.id);
    } catch (error) {
      console.error('Failed to duplicate prompt:', error);
    }
  };

  const handleToggleFavorite = async (prompt) => {
    try {
      await toggleFavorite(prompt.id);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleUsePrompt = async (prompt) => {
    try {
      await incrementUsage(prompt.id);
      await navigator.clipboard.writeText(prompt.content);
      
      addNotification({
        type: 'success',
        title: 'Prompt Copied',
        message: `"${prompt.title}" has been copied to clipboard and usage count updated.`
      });
    } catch (error) {
      console.error('Failed to use prompt:', error);
      addNotification({
        type: 'error',
        title: 'Copy Failed',
        message: 'Failed to copy prompt to clipboard.'
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedTag('all');
    setShowFavoritesOnly(false);
  };

  // Get stats and data for display
  const stats = getPromptStats();
  const allTags = getAllTags();
  const recentPrompts = getRecentPrompts(3);
  const mostUsedPrompts = getMostUsedPrompts(3);

  if (loadingPrompts) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-text-muted">Loading prompts...</p>
          </div>
        </div>
      </div>
    );
  }

  if (promptsError) {
    return (
      <div className="p-6">
        <Card padding="large" className="text-center">
          <div className="text-red-500 mb-4">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2 text-text-primary">Failed to Load Prompts</h3>
          <p className="text-text-muted mb-4">{promptsError}</p>
          <Button variant="primary" onClick={() => initialize()}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Prompt Vault</h1>
          <p className="text-text-secondary">
            Store and organize your AI prompts • {stats.total} prompts • {stats.totalUsage} total uses
          </p>
        </div>
        <Button variant="primary" onClick={handleCreatePrompt}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Prompt
        </Button>
      </div>

      {/* Quick Stats */}
      {prompts.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card padding="medium" className="text-center">
            <div className="text-2xl font-bold text-accent">{stats.total}</div>
            <div className="text-sm text-text-muted">Total Prompts</div>
          </Card>
          <Card padding="medium" className="text-center">
            <div className="text-2xl font-bold text-yellow-500">{stats.favorites}</div>
            <div className="text-sm text-text-muted">Favorites</div>
          </Card>
          <Card padding="medium" className="text-center">
            <div className="text-2xl font-bold text-green-500">{stats.totalUsage}</div>
            <div className="text-sm text-text-muted">Total Uses</div>
          </Card>
          <Card padding="medium" className="text-center">
            <div className="text-2xl font-bold text-blue-500">{allTags.length}</div>
            <div className="text-sm text-text-muted">Unique Tags</div>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card padding="medium" className="mb-6">
        <div className="space-y-4">
          {/* Search and View Controls */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search prompts by title, content, or tags..."
                className="w-full"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={showFavoritesOnly ? "primary" : "outline"}
                size="small"
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Favorites
              </Button>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border rounded-lg px-3 py-1 text-sm bg-bg-secondary text-text-primary border-border hover:border-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors duration-200"
              >
                <option value="updated">Recently Updated</option>
                <option value="created">Recently Created</option>
                <option value="usage">Most Used</option>
                <option value="alphabetical">A-Z</option>
              </select>
            </div>
          </div>

          {/* Category and Tag Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-bg-secondary text-text-primary border-border hover:border-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors duration-200"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} ({stats.byCategory[category] || 0})
                  </option>
                ))}
              </select>
            </div>

            {/* Tag Filter */}
            {allTags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Tag
                </label>
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-bg-secondary text-text-primary border-border hover:border-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors duration-200"
                >
                  <option value="all">All Tags</option>
                  {allTags.map(tag => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort Filter */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-bg-secondary text-text-primary border-border hover:border-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors duration-200"
              >
                <option value="updated">Recently Updated</option>
                <option value="created">Recently Created</option>
                <option value="usage">Most Used</option>
                <option value="alphabetical">A-Z</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {(searchTerm || selectedCategory !== 'all' || selectedTag !== 'all' || showFavoritesOnly) && (
            <div className="flex justify-end pt-2">
              <Button
                variant="ghost"
                size="small"
                onClick={clearFilters}
                className="text-text-muted hover:text-text-primary"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Main Content */}
      {prompts.length === 0 ? (
        /* Empty State */
        <Card>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-accent/20 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-text-primary">No Prompts Yet</h3>
            <p className="text-text-secondary mb-4">
              Create your first AI prompt to start building your collection
            </p>
            <Button variant="primary" onClick={handleCreatePrompt}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Create First Prompt
            </Button>
          </div>
        </Card>
      ) : filteredPrompts.length === 0 ? (
        /* No Results */
        <Card>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-text-primary">No Prompts Found</h3>
            <p className="text-text-secondary mb-4">
              Try adjusting your filters or search terms
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </Card>
      ) : (
        /* Prompts Grid */
        <div>
          {/* Results Info */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-text-muted">
              Showing {filteredPrompts.length} of {prompts.length} prompts
            </p>
          </div>

          {/* Prompts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredPrompts.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  onEdit={handleEditPrompt}
                  onDelete={handleDeletePrompt}
                  onDuplicate={handleDuplicatePrompt}
                  onToggleFavorite={handleToggleFavorite}
                  onUse={handleUsePrompt}
                  onSelect={() => {/* Could implement detailed view */}}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Quick Access Panels */}
      {prompts.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Recent Prompts */}
          <Card padding="medium">
            <h3 className="text-lg font-semibold mb-4 text-text-primary">Recently Updated</h3>
            <div className="space-y-3">
              {recentPrompts.map((prompt) => (
                <div key={prompt.id} className="flex items-center justify-between p-2 hover:bg-background-secondary rounded">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary truncate">{prompt.title}</p>
                    <p className="text-sm text-text-muted">{prompt.category}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => handleUsePrompt(prompt)}
                    className="ml-2"
                  >
                    Use
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Most Used Prompts */}
          <Card padding="medium">
            <h3 className="text-lg font-semibold mb-4 text-text-primary">Most Used</h3>
            <div className="space-y-3">
              {mostUsedPrompts.map((prompt) => (
                <div key={prompt.id} className="flex items-center justify-between p-2 hover:bg-background-secondary rounded">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary truncate">{prompt.title}</p>
                    <p className="text-sm text-text-muted">{prompt.usageCount} uses</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => handleUsePrompt(prompt)}
                    className="ml-2"
                  >
                    Use
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Prompt Form Modal */}
      <PromptForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        prompt={editingPrompt}
        mode={editingPrompt ? 'edit' : 'create'}
      />
    </div>
  );
};

export default Vault;