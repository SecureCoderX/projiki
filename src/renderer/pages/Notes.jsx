// src/renderer/pages/Notes.jsx - Completely Redesigned
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Input, Badge } from '../components/ui';
import NoteCard from '../components/notes/NoteCard';
import NoteForm from '../components/notes/NoteForm';
import QuickCapture from '../components/notes/QuickCapture';
import UnsortedBin from '../components/notes/UnsortedBin';
import useNotesStore from '../stores/useNotesStore';
import useAppStore from '../stores/useAppStore';

const Notes = () => {
  const {
    notes,
    loadingNotes,
    notesError,
    noteTypes,
    unsortedBin,
    quickCaptureOpen,
    sessionData,
    createNote,
    updateNote,
    deleteNote,
    duplicateNote,
    toggleFavorite,
    archiveNote,
    getFavoriteNotes,
    getNotesByType,
    getRecentNotes,
    getAllTags,
    getNotesStats,
    setQuickCaptureOpen,
    initialize
  } = useNotesStore();

  const { addNotification } = useAppStore();

  // Local state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [sortBy, setSortBy] = useState('updated');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [showUnsortedBin, setShowUnsortedBin] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid, list

  // Initialize store on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Filter and sort notes
  const filteredNotes = React.useMemo(() => {
    let filtered = [...notes]; // Create copy to avoid mutation

    // Filter by archived status
    filtered = filtered.filter(note => showArchived ? note.isArchived : !note.isArchived);

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(note => note.type === selectedType);
    }

    // Filter by tag
    if (selectedTag !== 'all') {
      filtered = filtered.filter(note => note.tags.includes(selectedTag));
    }

    // Filter by favorites
    if (showFavoritesOnly) {
      filtered = filtered.filter(note => note.isFavorite);
    }

    // Sort notes
    switch (sortBy) {
      case 'created':
        return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'updated':
        return filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      case 'alphabetical':
        return filtered.sort((a, b) => a.title.localeCompare(b.title));
      case 'type':
        return filtered.sort((a, b) => a.type.localeCompare(b.type) || a.title.localeCompare(b.title));
      default:
        return filtered;
    }
  }, [notes, searchTerm, selectedType, selectedTag, sortBy, showFavoritesOnly, showArchived]);

  // Event handlers
  const handleCreateNote = () => {
    setEditingNote(null);
    setIsFormOpen(true);
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setIsFormOpen(true);
  };

  const handleDeleteNote = async (note) => {
    if (window.confirm(`Are you sure you want to delete "${note.title}"?`)) {
      try {
        await deleteNote(note.id);
      } catch (error) {
        console.error('Failed to delete note:', error);
      }
    }
  };

  const handleDuplicateNote = async (note) => {
    try {
      await duplicateNote(note.id);
    } catch (error) {
      console.error('Failed to duplicate note:', error);
    }
  };

  const handleToggleFavorite = async (note) => {
    try {
      await toggleFavorite(note.id);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleArchiveNote = async (note) => {
    try {
      await archiveNote(note.id);
    } catch (error) {
      console.error('Failed to archive note:', error);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedTag('all');
    setShowFavoritesOnly(false);
  };

  // Get stats and data for display
  const stats = getNotesStats();
  const allTags = getAllTags();
  const recentNotes = getRecentNotes(5);
  const favoriteNotes = getFavoriteNotes().slice(0, 5);

  if (loadingNotes) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-text-muted">Loading notes...</p>
        </div>
      </div>
    );
  }

  if (notesError) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center p-8">
          <div className="text-red-500 mb-4">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2 text-text-primary">Failed to Load Notes</h3>
          <p className="text-text-muted mb-4">{notesError}</p>
          <Button variant="primary" onClick={() => initialize()}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-bg-primary">
      {/* Header - Fixed */}
      <div className="flex-none bg-bg-primary border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Notes & Journal</h1>
            <p className="text-sm text-text-secondary mt-1">
              {stats.total} notes • {stats.totalWords.toLocaleString()} words • {Object.keys(stats.byType).filter(type => stats.byType[type] > 0).length} types
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              size="small"
              onClick={() => setQuickCaptureOpen(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
              Quick Capture
            </Button>
            
            <Button 
              variant={showUnsortedBin ? "primary" : "outline"} 
              size="small"
              onClick={() => setShowUnsortedBin(!showUnsortedBin)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                <path d="M3 6h18l-2 13H5L3 6z"/>
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              Bin {unsortedBin.length > 0 && `(${unsortedBin.length})`}
            </Button>
            
            <Button variant="primary" onClick={handleCreateNote}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New Note
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Bar - Compact */}
      {notes.length > 0 && (
        <div className="flex-none bg-bg-secondary border-b border-border px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span className="text-sm text-text-primary font-medium">{stats.total}</span>
                <span className="text-sm text-text-muted">Total</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-text-primary font-medium">{stats.favorites}</span>
                <span className="text-sm text-text-muted">Favorites</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-text-primary font-medium">{Math.ceil(stats.totalWords / 1000)}k</span>
                <span className="text-sm text-text-muted">Words</span>
              </div>
              {stats.archived > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  <span className="text-sm text-text-primary font-medium">{stats.archived}</span>
                  <span className="text-sm text-text-muted">Archived</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                size="small"
                onClick={() => setViewMode('grid')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                </svg>
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                size="small"
                onClick={() => setViewMode('list')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6"/>
                  <line x1="8" y1="12" x2="21" y2="12"/>
                  <line x1="8" y1="18" x2="21" y2="18"/>
                  <line x1="3" y1="6" x2="3.01" y2="6"/>
                  <line x1="3" y1="12" x2="3.01" y2="12"/>
                  <line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Scrollable */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="flex-none w-80 bg-bg-secondary border-r border-border overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
              </div>
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search notes..."
                className="w-full pl-10"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted hover:text-text-primary">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>

            {/* Quick Filters */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Button
                  variant={showFavoritesOnly ? "primary" : "ghost"}
                  size="small"
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className="flex-1 justify-start"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  Favorites Only
                </Button>
                
                <Button
                  variant={showArchived ? "primary" : "ghost"}
                  size="small"
                  onClick={() => setShowArchived(!showArchived)}
                  className="flex-1 justify-start"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                    <rect x="2" y="3" width="20" height="5"/>
                    <line x1="8" y1="12" x2="16" y2="12"/>
                    <rect x="2" y="8" width="20" height="13"/>
                  </svg>
                  Archived
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-text-muted uppercase tracking-wide mb-2">
                  Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-bg-primary text-text-primary border-border hover:border-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors duration-200"
                >
                  <option value="all">All Types</option>
                  {noteTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)} ({stats.byType[type] || 0})
                    </option>
                  ))}
                </select>
              </div>

              {allTags.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-text-muted uppercase tracking-wide mb-2">
                    Tag
                  </label>
                  <select
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm bg-bg-primary text-text-primary border-border hover:border-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors duration-200"
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

              <div>
                <label className="block text-xs font-medium text-text-muted uppercase tracking-wide mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-bg-primary text-text-primary border-border hover:border-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors duration-200"
                >
                  <option value="updated">Recently Updated</option>
                  <option value="created">Recently Created</option>
                  <option value="alphabetical">A-Z</option>
                  <option value="type">By Type</option>
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            {(searchTerm || selectedType !== 'all' || selectedTag !== 'all' || showFavoritesOnly) && (
              <Button
                variant="ghost"
                size="small"
                onClick={clearFilters}
                className="w-full text-text-muted hover:text-text-primary"
              >
                Clear All Filters
              </Button>
            )}

            {/* Recent Notes */}
            {recentNotes.length > 0 && !showArchived && (
              <div className="pt-4 border-t border-border">
                <h3 className="text-xs font-medium text-text-muted uppercase tracking-wide mb-3">Recent</h3>
                <div className="space-y-2">
                  {recentNotes.map((note) => (
                    <div 
                      key={note.id} 
                      className="p-2 hover:bg-bg-primary rounded cursor-pointer group"
                      onClick={() => handleEditNote(note)}
                    >
                      <p className="font-medium text-text-primary text-sm truncate group-hover:text-accent transition-colors">
                        {note.title}
                      </p>
                      <p className="text-xs text-text-muted">
                        {note.type} • {note.metadata?.wordCount || 0} words
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Favorite Notes */}
            {favoriteNotes.length > 0 && !showArchived && (
              <div className="pt-4 border-t border-border">
                <h3 className="text-xs font-medium text-text-muted uppercase tracking-wide mb-3">Favorites</h3>
                <div className="space-y-2">
                  {favoriteNotes.map((note) => (
                    <div 
                      key={note.id} 
                      className="p-2 hover:bg-bg-primary rounded cursor-pointer group"
                      onClick={() => handleEditNote(note)}
                    >
                      <div className="flex items-center space-x-2">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="text-yellow-500 flex-shrink-0">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        <p className="font-medium text-text-primary text-sm truncate group-hover:text-accent transition-colors">
                          {note.title}
                        </p>
                      </div>
                      <p className="text-xs text-text-muted ml-5">{note.type}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notes Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {notes.length === 0 ? (
              /* Empty State */
              <div className="flex items-center justify-center h-96">
                <div className="text-center max-w-md">
                  <div className="w-20 h-20 bg-accent/10 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14,2 14,8 20,8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10,9 9,9 8,9"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-text-primary">Start Taking Notes</h3>
                  <p className="text-text-secondary mb-6 leading-relaxed">
                    Capture your thoughts, ideas, and insights. Use Quick Capture for rapid input or create structured notes.
                  </p>
                  <div className="flex justify-center space-x-3">
                    <Button variant="primary" onClick={handleCreateNote}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                      Create First Note
                    </Button>
                    <Button variant="outline" onClick={() => setQuickCaptureOpen(true)}>
                      Quick Capture
                    </Button>
                  </div>
                </div>
              </div>
            ) : filteredNotes.length === 0 ? (
              /* No Results */
              <div className="flex items-center justify-center h-96">
                <div className="text-center max-w-md">
                  <div className="w-20 h-20 bg-gray-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="M21 21l-4.35-4.35"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-text-primary">No Notes Found</h3>
                  <p className="text-text-secondary mb-6">
                    Try adjusting your search terms or filters to find what you're looking for.
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear All Filters
                  </Button>
                </div>
              </div>
            ) : (
              /* Notes Content */
              <div>
                {/* Results Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-text-primary">
                      {showArchived ? 'Archived Notes' : 'Your Notes'}
                    </h2>
                    <p className="text-sm text-text-muted">
                      Showing {filteredNotes.length} of {notes.filter(n => showArchived ? n.isArchived : !n.isArchived).length} notes
                    </p>
                  </div>
                </div>

                {/* Notes Grid/List */}
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-3'}>
                  <AnimatePresence>
                    {filteredNotes.map((note) => (
                      <motion.div
                        key={note.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <NoteCard
                          note={note}
                          onEdit={handleEditNote}
                          onDelete={handleDeleteNote}
                          onDuplicate={handleDuplicateNote}
                          onToggleFavorite={handleToggleFavorite}
                          onArchive={handleArchiveNote}
                          viewMode={viewMode}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <NoteForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        note={editingNote}
        mode={editingNote ? 'edit' : 'create'}
      />

      <QuickCapture
        isOpen={quickCaptureOpen}
        onClose={() => setQuickCaptureOpen(false)}
      />

      <UnsortedBin
        isOpen={showUnsortedBin}
        onClose={() => setShowUnsortedBin(false)}
      />
    </div>
  );
};

export default Notes;