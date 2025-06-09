// src/renderer/pages/Snippets.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Input, Badge } from '../components/ui';
import SnippetCard from '../components/snippets/SnippetCard';
import SnippetForm from '../components/snippets/SnippetForm';
import useSnippetStore from '../stores/useSnippetStore';
import useAppStore from '../stores/useAppStore';

const Snippets = () => {
  const {
    snippets,
    loadingSnippets,
    snippetsError,
    languages,
    categories,
    createSnippet,
    updateSnippet,
    deleteSnippet,
    duplicateSnippet,
    toggleFavorite,
    incrementUsage,
    getFavoriteSnippets,
    getSnippetsByLanguage,
    getSnippetsByCategory,
    getSnippetsByTag,
    getRecentSnippets,
    getMostUsedSnippets,
    getAllTags,
    getAllFrameworks,
    getSnippetStats,
    initialize
  } = useSnippetStore();

  const { addNotification } = useAppStore();

  // Local state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFramework, setSelectedFramework] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [sortBy, setSortBy] = useState('updated'); // updated, created, usage, alphabetical
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Initialize store on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Filter and sort snippets
  const filteredSnippets = React.useMemo(() => {
  let filtered = [...snippets]; // Start with a copy

  // Filter by search term
  if (searchTerm) {
    filtered = filtered.filter(snippet =>
      snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snippet.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snippet.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snippet.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }

  // Filter by language
  if (selectedLanguage !== 'all') {
    const languageSnippets = getSnippetsByLanguage(selectedLanguage);
    filtered = [...languageSnippets]; // Create a copy
  }

  // Filter by category
  if (selectedCategory !== 'all') {
    const categorySnippets = getSnippetsByCategory(selectedCategory);
    filtered = [...categorySnippets]; // Create a copy
  }

  // Filter by framework
  if (selectedFramework !== 'all') {
    filtered = filtered.filter(snippet => snippet.metadata?.framework === selectedFramework);
  }

  // Filter by tag
  if (selectedTag !== 'all') {
    const tagSnippets = getSnippetsByTag(selectedTag);
    filtered = [...tagSnippets]; // Create a copy
  }

  // Filter by favorites
  if (showFavoritesOnly) {
    filtered = filtered.filter(snippet => snippet.isFavorite);
  }

  // Sort snippets (create a copy before sorting)
  const sortedFiltered = [...filtered];
  switch (sortBy) {
    case 'created':
      return sortedFiltered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    case 'updated':
      return sortedFiltered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    case 'usage':
      return sortedFiltered.sort((a, b) => b.usageCount - a.usageCount);
    case 'alphabetical':
      return sortedFiltered.sort((a, b) => a.title.localeCompare(b.title));
    default:
      return sortedFiltered;
  }
}, [snippets, searchTerm, selectedLanguage, selectedCategory, selectedFramework, selectedTag, sortBy, showFavoritesOnly, getSnippetsByLanguage, getSnippetsByCategory, getSnippetsByTag]);

  // Event handlers
  const handleCreateSnippet = () => {
    setEditingSnippet(null);
    setIsFormOpen(true);
  };

  const handleEditSnippet = (snippet) => {
    setEditingSnippet(snippet);
    setIsFormOpen(true);
  };

  const handleDeleteSnippet = async (snippet) => {
    if (window.confirm(`Are you sure you want to delete "${snippet.title}"?`)) {
      try {
        await deleteSnippet(snippet.id);
      } catch (error) {
        console.error('Failed to delete snippet:', error);
      }
    }
  };

  const handleDuplicateSnippet = async (snippet) => {
    try {
      await duplicateSnippet(snippet.id);
    } catch (error) {
      console.error('Failed to duplicate snippet:', error);
    }
  };

  const handleToggleFavorite = async (snippet) => {
    try {
      await toggleFavorite(snippet.id);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleUseSnippet = async (snippet) => {
    try {
      await incrementUsage(snippet.id);
      await navigator.clipboard.writeText(snippet.code);
      
      addNotification({
        type: 'success',
        title: 'Code Copied',
        message: `"${snippet.title}" has been copied to clipboard and usage count updated.`
      });
    } catch (error) {
      console.error('Failed to use snippet:', error);
      addNotification({
        type: 'error',
        title: 'Copy Failed',
        message: 'Failed to copy code to clipboard.'
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLanguage('all');
    setSelectedCategory('all');
    setSelectedFramework('all');
    setSelectedTag('all');
    setShowFavoritesOnly(false);
  };

  // Get stats and data for display
  const stats = getSnippetStats();
  const allTags = getAllTags();
  const allFrameworks = getAllFrameworks();
  const recentSnippets = getRecentSnippets(3);
  const mostUsedSnippets = getMostUsedSnippets(3);

  if (loadingSnippets) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-text-muted">Loading snippets...</p>
          </div>
        </div>
      </div>
    );
  }

  if (snippetsError) {
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
          <h3 className="text-lg font-semibold mb-2 text-text-primary">Failed to Load Snippets</h3>
          <p className="text-text-muted mb-4">{snippetsError}</p>
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
          <h1 className="text-2xl font-bold text-text-primary">Code Snippets</h1>
          <p className="text-text-secondary">
            Manage your reusable code snippets • {stats.total} snippets • {stats.totalUsage} total uses
          </p>
        </div>
        <Button variant="primary" onClick={handleCreateSnippet}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Snippet
        </Button>
      </div>

      {/* Quick Stats */}
      {snippets.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card padding="medium" className="text-center">
            <div className="text-2xl font-bold text-accent">{stats.total}</div>
            <div className="text-sm text-text-muted">Total Snippets</div>
          </Card>
          <Card padding="medium" className="text-center">
            <div className="text-2xl font-bold text-yellow-500">{stats.favorites}</div>
            <div className="text-sm text-text-muted">Favorites</div>
          </Card>
          <Card padding="medium" className="text-center">
            <div className="text-2xl font-bold text-green-500">{Object.keys(stats.byLanguage).filter(lang => stats.byLanguage[lang] > 0).length}</div>
            <div className="text-sm text-text-muted">Languages</div>
          </Card>
          <Card padding="medium" className="text-center">
            <div className="text-2xl font-bold text-blue-500">{stats.totalUsage}</div>
            <div className="text-sm text-text-muted">Total Uses</div>
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
                placeholder="Search snippets by title, description, code, or tags..."
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

          {/* Advanced Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Language Filter */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-bg-secondary text-text-primary border-border hover:border-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors duration-200"
              >
                <option value="all">All Languages</option>
                {languages.map(language => (
                  <option key={language} value={language}>
                    {language.charAt(0).toUpperCase() + language.slice(1)} ({stats.byLanguage[language] || 0})
                  </option>
                ))}
              </select>
            </div>

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
                    {category.charAt(0).toUpperCase() + category.slice(1)} ({stats.byCategory[category] || 0})
                  </option>
                ))}
              </select>
            </div>

            {/* Framework Filter */}
            {allFrameworks.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Framework
                </label>
                <select
                  value={selectedFramework}
                  onChange={(e) => setSelectedFramework(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-bg-secondary text-text-primary border-border hover:border-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors duration-200"
                >
                  <option value="all">All Frameworks</option>
                  {allFrameworks.map(framework => (
                    <option key={framework} value={framework}>
                      {framework}
                    </option>
                  ))}
                </select>
              </div>
            )}

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
          </div>

          {/* Clear Filters */}
          {(searchTerm || selectedLanguage !== 'all' || selectedCategory !== 'all' || selectedFramework !== 'all' || selectedTag !== 'all' || showFavoritesOnly) && (
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
      {snippets.length === 0 ? (
        /* Empty State */
        <Card>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-accent/20 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                <polyline points="16,18 22,12 16,6"/>
                <polyline points="8,6 2,12 8,18"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-text-primary">No Snippets Yet</h3>
            <p className="text-text-secondary mb-4">
              Create your first code snippet to start building your collection
            </p>
            <Button variant="primary" onClick={handleCreateSnippet}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Create First Snippet
            </Button>
          </div>
        </Card>
      ) : filteredSnippets.length === 0 ? (
        /* No Results */
        <Card>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-text-primary">No Snippets Found</h3>
            <p className="text-text-secondary mb-4">
              Try adjusting your filters or search terms
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </Card>
      ) : (
        /* Snippets Grid */
        <div>
          {/* Results Info */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-text-muted">
              Showing {filteredSnippets.length} of {snippets.length} snippets
            </p>
          </div>

          {/* Snippets Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatePresence>
              {filteredSnippets.map((snippet) => (
                <SnippetCard
                  key={snippet.id}
                  snippet={snippet}
                  onEdit={handleEditSnippet}
                  onDelete={handleDeleteSnippet}
                  onDuplicate={handleDuplicateSnippet}
                  onToggleFavorite={handleToggleFavorite}
                  onUse={handleUseSnippet}
                  onSelect={() => {/* Could implement detailed view */}}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Quick Access Panels */}
      {snippets.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Recent Snippets */}
          <Card padding="medium">
            <h3 className="text-lg font-semibold mb-4 text-text-primary">Recently Updated</h3>
            <div className="space-y-3">
              {recentSnippets.map((snippet) => (
                <div key={snippet.id} className="flex items-center justify-between p-2 hover:bg-bg-secondary rounded">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary truncate">{snippet.title}</p>
                    <p className="text-sm text-text-muted">{snippet.language} • {snippet.category}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => handleUseSnippet(snippet)}
                    className="ml-2"
                  >
                    Use
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Most Used Snippets */}
          <Card padding="medium">
            <h3 className="text-lg font-semibold mb-4 text-text-primary">Most Used</h3>
            <div className="space-y-3">
              {mostUsedSnippets.map((snippet) => (
                <div key={snippet.id} className="flex items-center justify-between p-2 hover:bg-bg-secondary rounded">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary truncate">{snippet.title}</p>
                    <p className="text-sm text-text-muted">{snippet.usageCount} uses • {snippet.language}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => handleUseSnippet(snippet)}
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

      {/* Snippet Form Modal */}
      <SnippetForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        snippet={editingSnippet}
        mode={editingSnippet ? 'edit' : 'create'}
      />
    </div>
  );
};

export default Snippets;