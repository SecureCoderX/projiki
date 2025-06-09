// src/renderer/components/StoreProvider.jsx
import React, { useEffect, useState } from 'react'
import useProjectStore from '../stores/useProjectStore'
import useTaskStore from '../stores/useTaskStore'
import usePromptStore from '../stores/usePromptStore'
import useSnippetStore from '../stores/useSnippetStore'
import useNotesStore from '../stores/useNotesStore'
import useAppStore from '../stores/useAppStore'
import useChangelogStore from '../stores/useChangelogStore'

/**
 * StoreProvider - Initializes all Zustand stores on app startup
 */
const StoreProvider = ({ children }) => {
  const [storesInitialized, setStoresInitialized] = useState(false)
  const [initError, setInitError] = useState(null)

  // Get store initialization methods
  const initializeProjectStore = useProjectStore(state => state.initialize)
  const initializeTaskStore = useTaskStore(state => state.initialize)
  const initializePromptStore = usePromptStore(state => state.initialize)
  const initializeSnippetStore = useSnippetStore(state => state.initialize)
  const initializeNotesStore = useNotesStore(state => state.initialize)
  const setLoading = useAppStore(state => state.setLoading)
  const addNotification = useAppStore(state => state.addNotification)
  const initializeChangelogStore = useChangelogStore(state => state.initialize)

  useEffect(() => {
    const initializeStores = async () => {
      try {
        console.log('🚀 Initializing Projiki stores...')
        setLoading(true)
        
        // Initialize project store (loads projects from localStorage)
        await initializeProjectStore()
        
        // Initialize task store
        await initializeTaskStore()
        
        // Initialize Phase 3.3 stores
        console.log('🤖 Initializing prompt store...')
        await initializePromptStore()
        
        console.log('💾 Initializing snippet store...')
        await initializeSnippetStore()
        
        console.log('📝 Initializing notes store...')
        await initializeNotesStore()

        console.log('📋 Initializing changelog store...')
        await initializeChangelogStore()
        
        // Mark stores as initialized
        setStoresInitialized(true)
        setLoading(false)
        
        console.log('✅ All stores initialized successfully')
        
        // Show welcome notification on first run
        const isFirstRun = useAppStore.getState().isFirstRun
        if (isFirstRun) {
          addNotification({
            type: 'success',
            title: 'Welcome to Projiki!',
            message: 'Your AI-native project management workspace is ready.'
          })
          useAppStore.getState().markAsNotFirstRun()
        }
        
      } catch (error) {
        console.error('❌ Failed to initialize stores:', error)
        setInitError(error.message)
        setLoading(false)
        
        addNotification({
          type: 'error',
          title: 'Initialization Failed',
          message: `Failed to initialize app: ${error.message}`
        })
      }
    }

    initializeStores()
  }, [initializeProjectStore, initializeTaskStore, initializePromptStore, initializeSnippetStore, initializeNotesStore, setLoading, addNotification])

  // Show loading state while stores initialize
  if (!storesInitialized && !initError) {
    return (
      <div className="h-screen bg-bg-primary text-text-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold mb-2">Initializing Projiki</h2>
          <p className="text-text-secondary">Loading your projects, notes, and workspace...</p>
        </div>
      </div>
    )
  }

  // Show error state if initialization failed
  if (initError) {
    return (
      <div className="h-screen bg-bg-primary text-text-primary flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <h2 className="text-lg font-semibold mb-2 text-red-400">Initialization Failed</h2>
          <p className="text-text-secondary mb-4">{initError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Render children once stores are initialized
  return children
}

export default StoreProvider;