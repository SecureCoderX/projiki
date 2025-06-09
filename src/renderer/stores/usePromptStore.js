// src/renderer/stores/usePromptStore.js
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { v4 as uuidv4 } from 'uuid'
import useAppStore from './useAppStore'
import DataService from '../services/DataService'

const usePromptStore = create()(
  devtools(
    immer((set, get) => ({
      // Prompt state
      prompts: [],
      currentPrompt: null,
      loadingPrompts: false,
      promptsError: null,
      
      // Prompt categories
      categories: [
        'debugging',
        'optimization', 
        'documentation',
        'code-generation',
        'code-review',
        'testing',
        'refactoring',
        'planning',
        'learning',
        'general'
      ],
      
      // Actions
      setLoadingPrompts: (loading) =>
        set((state) => {
          state.loadingPrompts = loading
        }),
        
      setPromptsError: (error) =>
        set((state) => {
          state.promptsError = error
        }),
        
      setPrompts: (prompts) =>
        set((state) => {
          state.prompts = prompts
          state.loadingPrompts = false
          state.promptsError = null
        }),
        
      createPrompt: async (promptData) => {
  const newPrompt = {
    id: uuidv4(),
    title: promptData.title || 'Untitled Prompt',
    content: promptData.content || '',
    category: promptData.category || 'general',
    tags: promptData.tags || [],
    response: promptData.response || '',
    isFavorite: false,
    usageCount: 0,
    projectId: promptData.projectId || null, // Add this line
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
      aiModel: promptData.aiModel || null,
      language: promptData.language || null,
      project: promptData.project || null,
      ...promptData.metadata
    }
  }
        
        try {
          // Save to DataService first
          await DataService.savePrompt(newPrompt)
          
          // Then update store
          set((state) => {
            state.prompts.push(newPrompt)
            state.currentPrompt = newPrompt
          })
          
          useAppStore.getState().addNotification({
            type: 'success',
            title: 'Prompt Saved',
            message: `Prompt "${newPrompt.title}" has been saved successfully.`
          })
          
          console.log('✅ Prompt created and saved:', newPrompt.title)
          return newPrompt
          
        } catch (error) {
          console.error('❌ Failed to create prompt:', error)
          useAppStore.getState().addNotification({
            type: 'error',
            title: 'Prompt Save Failed',
            message: `Failed to save prompt: ${error.message}`
          })
          throw error
        }
      },
        
      updatePrompt: async (promptId, updates) => {
        try {
          const promptIndex = get().prompts.findIndex(p => p.id === promptId)
          
          if (promptIndex !== -1) {
            const updatedPrompt = {
              ...get().prompts[promptIndex],
              ...updates,
              updatedAt: new Date().toISOString()
            }
            
            // Save to DataService first
            await DataService.savePrompt(updatedPrompt)
            
            // Then update store
            set((state) => {
              state.prompts[promptIndex] = updatedPrompt
              
              if (state.currentPrompt?.id === promptId) {
                state.currentPrompt = updatedPrompt
              }
            })
            
            useAppStore.getState().updateLastSaved()
            console.log('✅ Prompt updated and saved:', updatedPrompt.title)
            
          }
        } catch (error) {
          console.error('❌ Failed to update prompt:', error)
          useAppStore.getState().addNotification({
            type: 'error',
            title: 'Update Failed',
            message: `Failed to update prompt: ${error.message}`
          })
          throw error
        }
      },
        
      deletePrompt: async (promptId) => {
        try {
          const promptToDelete = get().prompts.find(p => p.id === promptId)
          
          if (promptToDelete) {
            // Delete from DataService first
            await DataService.deletePrompt(promptId)
            
            // Then update store
            set((state) => {
              state.prompts = state.prompts.filter(p => p.id !== promptId)
              
              if (state.currentPrompt?.id === promptId) {
                state.currentPrompt = null
              }
            })
            
            useAppStore.getState().addNotification({
              type: 'info',
              title: 'Prompt Deleted',
              message: `Prompt "${promptToDelete.title}" has been deleted.`
            })
            
            console.log('✅ Prompt deleted:', promptToDelete.title)
          }
        } catch (error) {
          console.error('❌ Failed to delete prompt:', error)
          useAppStore.getState().addNotification({
            type: 'error',
            title: 'Delete Failed',
            message: `Failed to delete prompt: ${error.message}`
          })
          throw error
        }
      },
        
      duplicatePrompt: async (promptId) => {
        try {
          const originalPrompt = get().prompts.find(p => p.id === promptId)
          
          if (originalPrompt) {
            const duplicatedPrompt = {
              ...originalPrompt,
              id: uuidv4(),
              title: `${originalPrompt.title} (Copy)`,
              usageCount: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
            
            await DataService.savePrompt(duplicatedPrompt)
            
            set((state) => {
              state.prompts.push(duplicatedPrompt)
            })
            
            useAppStore.getState().addNotification({
              type: 'success',
              title: 'Prompt Duplicated',
              message: `Prompt "${duplicatedPrompt.title}" has been created.`
            })
            
            console.log('✅ Prompt duplicated:', duplicatedPrompt.title)
            return duplicatedPrompt
          }
        } catch (error) {
          console.error('❌ Failed to duplicate prompt:', error)
          useAppStore.getState().addNotification({
            type: 'error',
            title: 'Duplicate Failed',
            message: `Failed to duplicate prompt: ${error.message}`
          })
          throw error
        }
      },
        
      toggleFavorite: async (promptId) => {
        const prompt = get().prompts.find(p => p.id === promptId)
        if (prompt) {
          await get().updatePrompt(promptId, { isFavorite: !prompt.isFavorite })
        }
      },
        
      incrementUsage: async (promptId) => {
        const prompt = get().prompts.find(p => p.id === promptId)
        if (prompt) {
          await get().updatePrompt(promptId, { usageCount: prompt.usageCount + 1 })
        }
      },
      
      // Getters and computed values
      getFavoritePrompts: () => get().prompts.filter(p => p.isFavorite),
      
      getPromptsByCategory: (category) => get().prompts.filter(p => p.category === category),
      
      getPromptsByTag: (tag) => get().prompts.filter(p => p.tags.includes(tag)),
      
      getRecentPrompts: (limit = 5) => {
  return [...get().prompts]  // Create copy first
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, limit)
},
      
      getMostUsedPrompts: (limit = 5) => {
  return [...get().prompts]  // Create copy first
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, limit)
},
      
      getAllTags: () => {
        const allTags = get().prompts.flatMap(p => p.tags)
        return [...new Set(allTags)].sort()
      },
      
      getPromptStats: () => {
        const prompts = get().prompts
        return {
          total: prompts.length,
          favorites: prompts.filter(p => p.isFavorite).length,
          byCategory: get().categories.reduce((acc, cat) => {
            acc[cat] = prompts.filter(p => p.category === cat).length
            return acc
          }, {}),
          totalUsage: prompts.reduce((sum, p) => sum + p.usageCount, 0)
        }
      },
      
      // Load prompts from DataService
      loadPrompts: async () => {
        set((state) => {
          state.loadingPrompts = true
          state.promptsError = null
        })
        
        try {
          console.log('📂 Loading prompts from storage...')
          const prompts = await DataService.loadAllPrompts()
          
          set((state) => {
            state.prompts = prompts
            state.loadingPrompts = false
            state.promptsError = null
          })
          
          console.log(`✅ Loaded ${prompts.length} prompts`)
          return prompts
          
        } catch (error) {
          console.error('❌ Failed to load prompts:', error)
          set((state) => {
            state.loadingPrompts = false
            state.promptsError = error.message
          })
          
          useAppStore.getState().addNotification({
            type: 'error',
            title: 'Load Failed',
            message: `Failed to load prompts: ${error.message}`
          })
          
          throw error
        }
      },
      
      // Initialize store
      initialize: async () => {
        try {
          await get().loadPrompts()
        } catch (error) {
          console.error('❌ Failed to initialize prompt store:', error)
        }
      },
    })),
    {
      name: 'prompt-store',
    }
  )
)

export default usePromptStore