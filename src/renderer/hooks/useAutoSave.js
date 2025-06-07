// src/renderer/hooks/useAutoSave.js
import { useEffect, useCallback, useRef, useState } from 'react'
import { useAppStore } from '../stores'
import dataService from '../services/DataService'

/**
 * Real auto-save hook that works with DataService
 */
export const useAutoSave = (options = {}) => {
  const {
    enabled = true,
    debounceDelay = 1000,
    autoSaveInterval = 30000,
    onSaveSuccess = null,
    onSaveError = null
  } = options

  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  const [saveError, setSaveError] = useState(null)

  // Store references
  const currentProject = useAppStore(state => state.currentProject)
  const updateLastSaved = useAppStore(state => state.updateLastSaved)
  const addNotification = useAppStore(state => state.addNotification)

  // Refs for debouncing
  const saveTimeoutRef = useRef(null)

  /**
   * Core save function
   */
  const performSave = useCallback(async () => {
    if (!enabled || !currentProject) {
      return
    }

    setIsSaving(true)
    setSaveError(null)

    try {
      // Save current project using DataService
      await dataService.saveProject(currentProject)

      const saveTime = new Date()
      setLastSaved(saveTime)
      updateLastSaved()

      if (onSaveSuccess) {
        onSaveSuccess({ project: currentProject, savedAt: saveTime })
      }

      console.log(`💾 Auto-save completed for project: ${currentProject.name}`)

    } catch (error) {
      console.error('❌ Auto-save failed:', error)
      setSaveError(error.message)

      if (onSaveError) {
        onSaveError(error)
      }

      addNotification({
        type: 'error',
        title: 'Auto-Save Failed',
        message: `Failed to save project data: ${error.message}`
      })
    } finally {
      setIsSaving(false)
    }
  }, [enabled, currentProject, updateLastSaved, addNotification, onSaveSuccess, onSaveError])

  /**
   * Manual save function (immediate)
   */
  const saveNow = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = null
    }
    await performSave()
  }, [performSave])

  /**
   * Test the save functionality
   */
  const testSave = useCallback(() => {
    if (!currentProject) {
      // Create a test project
      const testProject = {
        id: 'test-project-' + Date.now(),
        name: 'Test Project',
        description: 'This is a test project to verify data persistence',
        mode: 'structured',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        settings: { defaultView: 'kanban', autoSave: true, syncFrequency: 30000 },
        metadata: { tags: ['test'], priority: 'medium', deadline: null, estimatedHours: null }
      }
      
      // Set it as current project (this will trigger auto-save)
      useAppStore.getState().setCurrentProject(testProject)
      
      addNotification({
        type: 'success',
        title: 'Test Project Created',
        message: 'Created test project to verify data persistence'
      })
    } else {
      // Manually save existing project
      saveNow()
    }
  }, [currentProject, saveNow, addNotification])

  // Expose test function globally for easy testing
  useEffect(() => {
    window.testDataPersistence = testSave
    return () => delete window.testDataPersistence
  }, [testSave])

  return {
    isSaving,
    lastSaved,
    saveError,
    saveNow,
    testSave,
    hasPendingSave: saveTimeoutRef.current !== null
  }
}

export default useAutoSave