// src/renderer/stores/index.js
// Real Zustand stores with working search

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

export const useAppStore = create()(
  devtools(
    persist(
      immer((set, get) => ({
        // App-level state
        isLoading: false,
        currentProject: null,
        sidebarCollapsed: false,
        currentMode: 'structured',
        lastSaved: null,
        isOnline: true,
        notifications: [],
        theme: 'dark',
        
        // Actions
        setLoading: (loading) => set((state) => { state.isLoading = loading }),
        setCurrentProject: (project) => set((state) => { 
          state.currentProject = project
          state.lastSaved = new Date().toISOString()
        }),
        toggleSidebar: () => set((state) => { 
          state.sidebarCollapsed = !state.sidebarCollapsed 
        }),
        switchMode: (mode) => set((state) => { state.currentMode = mode }),
        addNotification: (notification) => set((state) => {
          state.notifications.push({
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            type: 'info',
            ...notification
          })
        }),
        removeNotification: (id) => set((state) => {
          state.notifications = state.notifications.filter(n => n.id !== id)
        }),
        clearNotifications: () => set((state) => {
          state.notifications = []
        }),
        updateLastSaved: () => set((state) => {
          state.lastSaved = new Date().toISOString()
        })
      })),
      {
        name: 'projiki-app-store',
        partialize: (state) => ({
          sidebarCollapsed: state.sidebarCollapsed,
          currentMode: state.currentMode,
          theme: state.theme,
        }),
      }
    ),
    { name: 'app-store' }
  )
)

// Real Search Store
export { default as useSearchStore } from './useSearchStore'

// NEW: Phase 3.3 Vibe Coder Stores
export { default as usePromptStore } from './usePromptStore'
export { default as useSnippetStore } from './useSnippetStore'

// Keep the other stores as placeholders for now
export const useProjectStore = (selector) => {
  const mockStore = {
    projects: [],
    currentProject: null,
    loadingProjects: false,
    projectsError: null,
    
    // Add some useful actions for testing
    createProject: (projectData) => {
      console.log('📁 Creating project (placeholder):', projectData.name)
      // For now, just set as current project in app store
      useAppStore.getState().setCurrentProject({
        id: 'project-' + Date.now(),
        name: projectData.name || 'New Project',
        description: projectData.description || '',
        mode: projectData.mode || 'structured',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        settings: { defaultView: 'kanban', autoSave: true, syncFrequency: 30000 },
        metadata: { 
          tags: projectData.tags || [], 
          priority: projectData.priority || 'medium', 
          deadline: null, 
          estimatedHours: null 
        }
      })
    }
  }
  
  if (typeof selector === 'function') {
    return selector(mockStore)
  }
  return mockStore
}

export const useTaskStore = (selector) => {
  const mockStore = {
    tasks: [],
    selectedTasks: [],
    loadingTasks: false,
    tasksError: null,
    
    // Add some useful actions for testing
    createTask: (taskData) => {
      console.log('📝 Creating task (placeholder):', taskData.title)
      return {
        id: 'task-' + Date.now(),
        projectId: taskData.projectId,
        title: taskData.title || 'New Task',
        content: taskData.content || '',
        type: taskData.type || 'task',
        status: taskData.status || 'todo',
        mode: taskData.mode || 'structured',
        position: { x: 0, y: 0 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {
          tags: taskData.tags || [],
          priority: taskData.priority || 'medium',
          estimatedTime: null,
          actualTime: null,
          dependencies: [],
          assignee: null
        }
      }
    }
  }
  
  if (typeof selector === 'function') {
    return selector(mockStore)
  }
  return mockStore
}