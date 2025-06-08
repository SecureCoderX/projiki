// src/renderer/stores/useSnippetStore.js
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { v4 as uuidv4 } from 'uuid'
import useAppStore from './useAppStore'
import DataService from '../services/DataService'

const useSnippetStore = create()(
  devtools(
    immer((set, get) => ({
      // Snippet state
      snippets: [],
      currentSnippet: null,
      loadingSnippets: false,
      snippetsError: null,
      
      // Programming languages
      languages: [
        'javascript',
        'typescript',
        'python',
        'java',
        'c++',
        'c#',
        'go',
        'rust',
        'php',
        'ruby',
        'swift',
        'kotlin',
        'dart',
        'html',
        'css',
        'scss',
        'sql',
        'json',
        'yaml',
        'markdown',
        'bash',
        'powershell',
        'other'
      ],
      
      // Snippet categories
      categories: [
        'function',
        'component',
        'utility',
        'algorithm',
        'pattern',
        'config',
        'template',
        'hook',
        'class',
        'module',
        'snippet',
        'boilerplate',
        'example'
      ],
      
      // Actions
      setLoadingSnippets: (loading) =>
        set((state) => {
          state.loadingSnippets = loading
        }),
        
      setSnippetsError: (error) =>
        set((state) => {
          state.snippetsError = error
        }),
        
      setSnippets: (snippets) =>
        set((state) => {
          state.snippets = snippets
          state.loadingSnippets = false
          state.snippetsError = null
        }),
        
      createSnippet: async (snippetData) => {
        const newSnippet = {
          id: uuidv4(),
          title: snippetData.title || 'Untitled Snippet',
          description: snippetData.description || '',
          code: snippetData.code || '',
          language: snippetData.language || 'javascript',
          category: snippetData.category || 'snippet',
          tags: snippetData.tags || [],
          isFavorite: false,
          usageCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          metadata: {
            framework: snippetData.framework || null,
            version: snippetData.version || null,
            author: snippetData.author || null,
            project: snippetData.project || null,
            dependencies: snippetData.dependencies || [],
            ...snippetData.metadata
          }
        }
        
        try {
          // Save to DataService first
          await DataService.saveSnippet(newSnippet)
          
          // Then update store
          set((state) => {
            state.snippets.push(newSnippet)
            state.currentSnippet = newSnippet
          })
          
          useAppStore.getState().addNotification({
            type: 'success',
            title: 'Snippet Saved',
            message: `Snippet "${newSnippet.title}" has been saved successfully.`
          })
          
          console.log('✅ Snippet created and saved:', newSnippet.title)
          return newSnippet
          
        } catch (error) {
          console.error('❌ Failed to create snippet:', error)
          useAppStore.getState().addNotification({
            type: 'error',
            title: 'Snippet Save Failed',
            message: `Failed to save snippet: ${error.message}`
          })
          throw error
        }
      },
        
      updateSnippet: async (snippetId, updates) => {
        try {
          const snippetIndex = get().snippets.findIndex(s => s.id === snippetId)
          
          if (snippetIndex !== -1) {
            const updatedSnippet = {
              ...get().snippets[snippetIndex],
              ...updates,
              updatedAt: new Date().toISOString()
            }
            
            // Save to DataService first
            await DataService.saveSnippet(updatedSnippet)
            
            // Then update store
            set((state) => {
              state.snippets[snippetIndex] = updatedSnippet
              
              if (state.currentSnippet?.id === snippetId) {
                state.currentSnippet = updatedSnippet
              }
            })
            
            useAppStore.getState().updateLastSaved()
            console.log('✅ Snippet updated and saved:', updatedSnippet.title)
            
          }
        } catch (error) {
          console.error('❌ Failed to update snippet:', error)
          useAppStore.getState().addNotification({
            type: 'error',
            title: 'Update Failed',
            message: `Failed to update snippet: ${error.message}`
          })
          throw error
        }
      },
        
      deleteSnippet: async (snippetId) => {
        try {
          const snippetToDelete = get().snippets.find(s => s.id === snippetId)
          
          if (snippetToDelete) {
            // Delete from DataService first
            await DataService.deleteSnippet(snippetId)
            
            // Then update store
            set((state) => {
              state.snippets = state.snippets.filter(s => s.id !== snippetId)
              
              if (state.currentSnippet?.id === snippetId) {
                state.currentSnippet = null
              }
            })
            
            useAppStore.getState().addNotification({
              type: 'info',
              title: 'Snippet Deleted',
              message: `Snippet "${snippetToDelete.title}" has been deleted.`
            })
            
            console.log('✅ Snippet deleted:', snippetToDelete.title)
          }
        } catch (error) {
          console.error('❌ Failed to delete snippet:', error)
          useAppStore.getState().addNotification({
            type: 'error',
            title: 'Delete Failed',
            message: `Failed to delete snippet: ${error.message}`
          })
          throw error
        }
      },
        
      duplicateSnippet: async (snippetId) => {
        try {
          const originalSnippet = get().snippets.find(s => s.id === snippetId)
          
          if (originalSnippet) {
            const duplicatedSnippet = {
              ...originalSnippet,
              id: uuidv4(),
              title: `${originalSnippet.title} (Copy)`,
              usageCount: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
            
            await DataService.saveSnippet(duplicatedSnippet)
            
            set((state) => {
              state.snippets.push(duplicatedSnippet)
            })
            
            useAppStore.getState().addNotification({
              type: 'success',
              title: 'Snippet Duplicated',
              message: `Snippet "${duplicatedSnippet.title}" has been created.`
            })
            
            console.log('✅ Snippet duplicated:', duplicatedSnippet.title)
            return duplicatedSnippet
          }
        } catch (error) {
          console.error('❌ Failed to duplicate snippet:', error)
          useAppStore.getState().addNotification({
            type: 'error',
            title: 'Duplicate Failed',
            message: `Failed to duplicate snippet: ${error.message}`
          })
          throw error
        }
      },
        
      toggleFavorite: async (snippetId) => {
        const snippet = get().snippets.find(s => s.id === snippetId)
        if (snippet) {
          await get().updateSnippet(snippetId, { isFavorite: !snippet.isFavorite })
        }
      },
        
      incrementUsage: async (snippetId) => {
        const snippet = get().snippets.find(s => s.id === snippetId)
        if (snippet) {
          await get().updateSnippet(snippetId, { usageCount: snippet.usageCount + 1 })
        }
      },
      
      // Getters and computed values
      getFavoriteSnippets: () => get().snippets.filter(s => s.isFavorite),
      
      getSnippetsByLanguage: (language) => get().snippets.filter(s => s.language === language),
      
      getSnippetsByCategory: (category) => get().snippets.filter(s => s.category === category),
      
      getSnippetsByTag: (tag) => get().snippets.filter(s => s.tags.includes(tag)),
      
      getRecentSnippets: (limit = 5) => {
        return get().snippets
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          .slice(0, limit)
      },
      
      getMostUsedSnippets: (limit = 5) => {
        return get().snippets
          .sort((a, b) => b.usageCount - a.usageCount)
          .slice(0, limit)
      },
      
      getSnippetsByFramework: (framework) => {
        return get().snippets.filter(s => s.metadata?.framework === framework)
      },
      
      getAllTags: () => {
        const allTags = get().snippets.flatMap(s => s.tags)
        return [...new Set(allTags)].sort()
      },
      
      getAllFrameworks: () => {
        const allFrameworks = get().snippets
          .map(s => s.metadata?.framework)
          .filter(Boolean)
        return [...new Set(allFrameworks)].sort()
      },
      
      getSnippetStats: () => {
        const snippets = get().snippets
        return {
          total: snippets.length,
          favorites: snippets.filter(s => s.isFavorite).length,
          byLanguage: get().languages.reduce((acc, lang) => {
            acc[lang] = snippets.filter(s => s.language === lang).length
            return acc
          }, {}),
          byCategory: get().categories.reduce((acc, cat) => {
            acc[cat] = snippets.filter(s => s.category === cat).length
            return acc
          }, {}),
          totalUsage: snippets.reduce((sum, s) => sum + s.usageCount, 0)
        }
      },
      
      // Load snippets from DataService
      loadSnippets: async () => {
        set((state) => {
          state.loadingSnippets = true
          state.snippetsError = null
        })
        
        try {
          console.log('📂 Loading snippets from storage...')
          const snippets = await DataService.loadAllSnippets()
          
          set((state) => {
            state.snippets = snippets
            state.loadingSnippets = false
            state.snippetsError = null
          })
          
          console.log(`✅ Loaded ${snippets.length} snippets`)
          return snippets
          
        } catch (error) {
          console.error('❌ Failed to load snippets:', error)
          set((state) => {
            state.loadingSnippets = false
            state.snippetsError = error.message
          })
          
          useAppStore.getState().addNotification({
            type: 'error',
            title: 'Load Failed',
            message: `Failed to load snippets: ${error.message}`
          })
          
          throw error
        }
      },
      
      // Initialize store
      initialize: async () => {
        try {
          await get().loadSnippets()
        } catch (error) {
          console.error('❌ Failed to initialize snippet store:', error)
        }
      },
    })),
    {
      name: 'snippet-store',
    }
  )
)

export default useSnippetStore