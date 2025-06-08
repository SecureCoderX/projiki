// src/renderer/stores/useNotesStore.js
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { v4 as uuidv4 } from 'uuid'
import useAppStore from './useAppStore'
import DataService from '../services/DataService'

const useNotesStore = create()(
  devtools(
    immer((set, get) => ({
      // Notes state
      notes: [],
      currentNote: null,
      loadingNotes: false,
      notesError: null,
      
      // Note types
      noteTypes: [
        'note',
        'journal',
        'idea',
        'meeting',
        'changelog',
        'bug',
        'feature',
        'research',
        'todo',
        'other'
      ],
      
      // Quick capture
      unsortedBin: [],
      quickCaptureOpen: false,
      
      // Session data for "Resume where I left off"
      sessionData: {
        lastActiveNote: null,
        lastActiveProject: null,
        lastActivePrompt: null,
        lastActiveSnippet: null,
        recentItems: [],
        workingNotes: [],
        sessionStartTime: null
      },
      
      // Actions
      setLoadingNotes: (loading) =>
        set((state) => {
          state.loadingNotes = loading
        }),
        
      setNotesError: (error) =>
        set((state) => {
          state.notesError = error
        }),
        
      setNotes: (notes) =>
        set((state) => {
          state.notes = notes
          state.loadingNotes = false
          state.notesError = null
        }),
        
      setCurrentNote: (note) =>
        set((state) => {
          state.currentNote = note
          // Update session data
          if (note) {
            state.sessionData.lastActiveNote = note.id
            get().updateSessionData({ lastActiveNote: note.id })
          }
        }),
        
      createNote: async (noteData) => {
        const newNote = {
          id: uuidv4(),
          title: noteData.title || 'Untitled Note',
          content: noteData.content || '',
          type: noteData.type || 'note',
          tags: noteData.tags || [],
          projectId: noteData.projectId || null,
          isFavorite: false,
          isArchived: false,
          metadata: {
            wordCount: noteData.content ? noteData.content.split(' ').length : 0,
            readTime: noteData.content ? Math.ceil(noteData.content.split(' ').length / 200) : 0,
            ...noteData.metadata
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        try {
          // Save to DataService first
          await DataService.saveNote(newNote)
          
          // Then update store
          set((state) => {
            state.notes.unshift(newNote) // Add to beginning
            state.currentNote = newNote
          })
          
          // Update session data
          get().updateRecentActivity('note_created', newNote)
          
          useAppStore.getState().addNotification({
            type: 'success',
            title: 'Note Created',
            message: `Note "${newNote.title}" has been created.`
          })
          
          console.log('✅ Note created and saved:', newNote.title)
          return newNote
          
        } catch (error) {
          console.error('❌ Failed to create note:', error)
          useAppStore.getState().addNotification({
            type: 'error',
            title: 'Note Creation Failed',
            message: `Failed to create note: ${error.message}`
          })
          throw error
        }
      },
        
      updateNote: async (noteId, updates) => {
        try {
          const noteIndex = get().notes.findIndex(n => n.id === noteId)
          
          if (noteIndex !== -1) {
            const updatedNote = {
              ...get().notes[noteIndex],
              ...updates,
              metadata: {
                ...get().notes[noteIndex].metadata,
                ...updates.metadata,
                wordCount: updates.content ? updates.content.split(' ').length : get().notes[noteIndex].metadata.wordCount,
                readTime: updates.content ? Math.ceil(updates.content.split(' ').length / 200) : get().notes[noteIndex].metadata.readTime
              },
              updatedAt: new Date().toISOString()
            }
            
            // Save to DataService first
            await DataService.saveNote(updatedNote)
            
            // Then update store
            set((state) => {
              state.notes[noteIndex] = updatedNote
              
              if (state.currentNote?.id === noteId) {
                state.currentNote = updatedNote
              }
            })
            
            // Update session data
            get().updateRecentActivity('note_updated', updatedNote)
            useAppStore.getState().updateLastSaved()
            
            console.log('✅ Note updated and saved:', updatedNote.title)
            
          }
        } catch (error) {
          console.error('❌ Failed to update note:', error)
          useAppStore.getState().addNotification({
            type: 'error',
            title: 'Update Failed',
            message: `Failed to update note: ${error.message}`
          })
          throw error
        }
      },
        
      deleteNote: async (noteId) => {
        try {
          const noteToDelete = get().notes.find(n => n.id === noteId)
          
          if (noteToDelete) {
            // Delete from DataService first
            await DataService.deleteNote(noteId)
            
            // Then update store
            set((state) => {
              state.notes = state.notes.filter(n => n.id !== noteId)
              
              if (state.currentNote?.id === noteId) {
                state.currentNote = null
              }
            })
            
            useAppStore.getState().addNotification({
              type: 'info',
              title: 'Note Deleted',
              message: `Note "${noteToDelete.title}" has been deleted.`
            })
            
            console.log('✅ Note deleted:', noteToDelete.title)
          }
        } catch (error) {
          console.error('❌ Failed to delete note:', error)
          useAppStore.getState().addNotification({
            type: 'error',
            title: 'Delete Failed',
            message: `Failed to delete note: ${error.message}`
          })
          throw error
        }
      },
        
      duplicateNote: async (noteId) => {
        try {
          const originalNote = get().notes.find(n => n.id === noteId)
          
          if (originalNote) {
            const duplicatedNote = {
              ...originalNote,
              id: uuidv4(),
              title: `${originalNote.title} (Copy)`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
            
            await DataService.saveNote(duplicatedNote)
            
            set((state) => {
              state.notes.unshift(duplicatedNote)
            })
            
            useAppStore.getState().addNotification({
              type: 'success',
              title: 'Note Duplicated',
              message: `Note "${duplicatedNote.title}" has been created.`
            })
            
            console.log('✅ Note duplicated:', duplicatedNote.title)
            return duplicatedNote
          }
        } catch (error) {
          console.error('❌ Failed to duplicate note:', error)
          useAppStore.getState().addNotification({
            type: 'error',
            title: 'Duplicate Failed',
            message: `Failed to duplicate note: ${error.message}`
          })
          throw error
        }
      },
        
      toggleFavorite: async (noteId) => {
        const note = get().notes.find(n => n.id === noteId)
        if (note) {
          await get().updateNote(noteId, { isFavorite: !note.isFavorite })
        }
      },
        
      archiveNote: async (noteId) => {
        const note = get().notes.find(n => n.id === noteId)
        if (note) {
          await get().updateNote(noteId, { isArchived: !note.isArchived })
        }
      },
      
      // Quick Capture & Unsorted Bin
      addToUnsortedBin: async (content, type = 'idea') => {
        const binItem = {
          id: uuidv4(),
          content,
          type,
          createdAt: new Date().toISOString()
        }
        
        try {
          set((state) => {
            state.unsortedBin.unshift(binItem)
          })
          
          // Save unsorted bin to storage
          await DataService.saveUnsortedBin(get().unsortedBin)
          
          console.log('✅ Added to unsorted bin:', content.substring(0, 50))
        } catch (error) {
          console.error('❌ Failed to save to unsorted bin:', error)
        }
      },
      
      removeFromUnsortedBin: async (itemId) => {
        set((state) => {
          state.unsortedBin = state.unsortedBin.filter(item => item.id !== itemId)
        })
        
        try {
          await DataService.saveUnsortedBin(get().unsortedBin)
        } catch (error) {
          console.error('❌ Failed to save unsorted bin:', error)
        }
      },
      
      convertBinItemToNote: async (itemId) => {
        const item = get().unsortedBin.find(i => i.id === itemId)
        if (item) {
          // Create note from bin item
          const note = await get().createNote({
            title: item.content.substring(0, 50) + (item.content.length > 50 ? '...' : ''),
            content: item.content,
            type: item.type
          })
          
          // Remove from bin
          await get().removeFromUnsortedBin(itemId)
          
          return note
        }
      },
      
      setQuickCaptureOpen: (open) =>
        set((state) => {
          state.quickCaptureOpen = open
        }),
      
      // Session Management
      updateSessionData: async (updates) => {
        set((state) => {
          state.sessionData = {
            ...state.sessionData,
            ...updates,
            lastUpdated: new Date().toISOString()
          }
        })
        
        try {
          await DataService.saveSessionData(get().sessionData)
        } catch (error) {
          console.error('❌ Failed to save session data:', error)
        }
      },
      
      updateRecentActivity: (action, item) => {
        const activity = {
          id: uuidv4(),
          action,
          item: {
            id: item.id,
            title: item.title || item.name,
            type: item.type || 'unknown'
          },
          timestamp: new Date().toISOString()
        }
        
        set((state) => {
          state.sessionData.recentItems.unshift(activity)
          // Keep only last 20 items
          if (state.sessionData.recentItems.length > 20) {
            state.sessionData.recentItems = state.sessionData.recentItems.slice(0, 20)
          }
        })
        
        get().updateSessionData({ recentItems: get().sessionData.recentItems })
      },
      
      // Getters and computed values
      getFavoriteNotes: () => get().notes.filter(n => n.isFavorite && !n.isArchived),
      
      getNotesByType: (type) => get().notes.filter(n => n.type === type && !n.isArchived),
      
      getNotesByProject: (projectId) => get().notes.filter(n => n.projectId === projectId && !n.isArchived),
      
      getRecentNotes: (limit = 5) => {
        return get().notes
          .filter(n => !n.isArchived)
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          .slice(0, limit)
      },
      
      getArchivedNotes: () => get().notes.filter(n => n.isArchived),
      
      getAllTags: () => {
        const allTags = get().notes.flatMap(n => n.tags)
        return [...new Set(allTags)].sort()
      },
      
      getNotesStats: () => {
        const notes = get().notes.filter(n => !n.isArchived)
        return {
          total: notes.length,
          favorites: notes.filter(n => n.isFavorite).length,
          byType: get().noteTypes.reduce((acc, type) => {
            acc[type] = notes.filter(n => n.type === type).length
            return acc
          }, {}),
          totalWords: notes.reduce((sum, n) => sum + (n.metadata?.wordCount || 0), 0),
          archived: get().notes.filter(n => n.isArchived).length
        }
      },
      
      // Load notes from DataService
      loadNotes: async () => {
        set((state) => {
          state.loadingNotes = true
          state.notesError = null
        })
        
        try {
          console.log('📂 Loading notes from storage...')
          const notes = await DataService.loadAllNotes()
          
          set((state) => {
            state.notes = notes
            state.loadingNotes = false
            state.notesError = null
          })
          
          console.log(`✅ Loaded ${notes.length} notes`)
          return notes
          
        } catch (error) {
          console.error('❌ Failed to load notes:', error)
          set((state) => {
            state.loadingNotes = false
            state.notesError = error.message
          })
          
          useAppStore.getState().addNotification({
            type: 'error',
            title: 'Load Failed',
            message: `Failed to load notes: ${error.message}`
          })
          
          throw error
        }
      },
      
      // Load session data and unsorted bin
      loadSessionData: async () => {
        try {
          const sessionData = await DataService.loadSessionData()
          const unsortedBin = await DataService.loadUnsortedBin()
          
          set((state) => {
            state.sessionData = sessionData
            state.unsortedBin = unsortedBin
          })
          
          console.log('✅ Session data loaded')
        } catch (error) {
          console.error('❌ Failed to load session data:', error)
        }
      },
      
      // Initialize store
      initialize: async () => {
        try {
          await get().loadNotes()
          await get().loadSessionData()
          
          // Start new session
          get().updateSessionData({
            sessionStartTime: new Date().toISOString()
          })
        } catch (error) {
          console.error('❌ Failed to initialize notes store:', error)
        }
      },
    })),
    {
      name: 'notes-store',
    }
  )
)

export default useNotesStore