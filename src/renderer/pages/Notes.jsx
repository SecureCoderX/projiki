// src/renderer/pages/Notes.jsx
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
  const [sortBy, setSortBy] = useState('updated'); // updated, created, alphabetical, type
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [showUnsortedBin, setShowUnsortedBin] = useState(false);

  // Initialize store on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Filter and sort notes
  const filteredNotes = React.useMemo(() => {
    let filtered = notes;

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
  const recentNotes = getRecentNotes(3);
  const favoriteNotes = getFavoriteNotes().slice(0, 3);

  if (loadingNotes) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-text-muted">Loading notes...</p>
          </div>
        </div>
      </div>
    );
  }

  if (notesError) {
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
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Notes & Journal</h1>
          <p className="text-text-secondary">
            Capture thoughts, ideas, and knowledge • {stats.total} notes • {stats.totalWords} words
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={() => setQuickCaptureOpen(true)}
            className="text-sm"
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
            onClick={() => setShowUnsortedBin(!showUnsortedBin)}
            className="text-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
              <path d="M3 6h18l-2 13H5L3 6z"/>
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            Bin ({unsortedBin.length})
          </Button>
          <Button variant="primary" onClick={handleCreateNote}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Note
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      {notes.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card padding="medium" className="text-center">
            <div className="text-2xl font-bold text-accent">{stats.total}</div>
            <div className="text-sm text-text-muted">Total Notes</div>
          </Card>
          <Card padding="medium" className="text-center">
            <div className="text-2xl font-bold text-yellow-500">{stats.favorites}</div>
            <div className="text-sm text-text-muted">Favorites</div>
          </Card>
          <Card padding="medium" className="text-center">
            <div className="text-2xl font-bold text-green-500">{Math.ceil(stats.totalWords / 1000)}k</div>
            <div className="text-sm text-text-muted">Words</div>
          </Card>
          <Card padding="medium" className="text-center">
            <div className="text-2xl font-bold text-blue-500">{Object.keys(stats.byType).filter(type => stats.byType[type] > 0).length}</div>
            <div className="text-sm text-text-muted">Types</div>
          </Card>
          <Card padding="medium" className="text-center">
            <div className="text-2xl font-bold text-purple-500">{stats.archived}</div>
            <div className="text-sm text-text-muted">Archived</div>
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
                placeholder="Search notes by title, content, or tags..."
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
              
              <Button
                variant={showArchived ? "primary" : "outline"}
                size="small"
                onClick={() => setShowArchived(!showArchived)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1">
                  <rect x="2" y="3" width="20" height="5"/>
                  <line x1="8" y1="12" x2="16" y2="12"/>
                  <rect x="2" y="8" width="20" height="13"/>
                </svg>
                Archived
              </Button>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border rounded-lg px-3 py-1 text-sm bg-bg-secondary text-text-primary border-border hover:border-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors duration-200"
              >
                <option value="updated">Recently Updated</option>
                <option value="created">Recently Created</option>
                <option value="alphabetical">A-Z</option>
                <option value="type">By Type</option>
              </select>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Note Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-bg-secondary text-text-primary border-border hover:border-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors duration-200"
              >
                <option value="all">All Types</option>
                {noteTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)} ({stats.byType[type] || 0})
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
          </div>

          {/* Clear Filters */}
          {(searchTerm || selectedType !== 'all' || selectedTag !== 'all' || showFavoritesOnly) && (
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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Notes Grid */}
        <div className="lg:col-span-3">
          {notes.length === 0 ? (
            /* Empty State */
            <Card>
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-accent/20 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10,9 9,9 8,9"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-text-primary">No Notes Yet</h3>
                <p className="text-text-secondary mb-4">
                  Create your first note or use Quick Capture to get started
                </p>
                <div className="flex justify-center space-x-3">
                  <Button variant="primary" onClick={handleCreateNote}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
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
            </Card>
          ) : filteredNotes.length === 0 ? (
            /* No Results */
            <Card>
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="M21 21l-4.35-4.35"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-text-primary">No Notes Found</h3>
                <p className="text-text-secondary mb-4">
                  Try adjusting your filters or search terms
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </Card>
          ) : (
            /* Notes Grid */
            <div>
              {/* Results Info */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-text-muted">
                  Showing {filteredNotes.length} of {notes.filter(n => showArchived ? n.isArchived : !n.isArchived).length} notes
                </p>
              </div>

              {/* Notes Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <AnimatePresence>
                  {filteredNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onEdit={handleEditNote}
                      onDelete={handleDeleteNote}
                      onDuplicate={handleDuplicateNote}
                      onToggleFavorite={handleToggleFavorite}
                      onArchive={handleArchiveNote}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Notes */}
          {recentNotes.length > 0 && (
            <Card padding="medium">
              <h3 className="text-lg font-semibold mb-4 text-text-primary">Recently Updated</h3>
              <div className="space-y-3">
                {recentNotes.map((note) => (
                  <div key={note.id} className="flex items-center justify-between p-2 hover:bg-bg-secondary rounded">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text-primary truncate">{note.title}</p>
                      <p className="text-sm text-text-muted">{note.type} • {note.metadata?.wordCount || 0} words</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => handleEditNote(note)}
                      className="ml-2"
                    >
                      Edit
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Favorite Notes */}
          {favoriteNotes.length > 0 && (
            <Card padding="medium">
              <h3 className="text-lg font-semibold mb-4 text-text-primary">Favorites</h3>
              <div className="space-y-3">
                {favoriteNotes.map((note) => (
                  <div key={note.id} className="flex items-center justify-between p-2 hover:bg-bg-secondary rounded">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text-primary truncate">{note.title}</p>
                      <p className="text-sm text-text-muted">{note.type}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => handleEditNote(note)}
                      className="ml-2"
                    >
                      Edit
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Modals and Overlays */}
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