// src/renderer/stores/useAppStore.js
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

const useAppStore = create()(
  devtools(
    persist(
      immer((set, get) => ({
        // App-level state
        isLoading: false,
        currentProject: null,
        sidebarCollapsed: false,
        currentMode: 'structured', // 'structured' | 'creative' | 'hybrid'
        lastSaved: null,
        isOnline: true,
        notifications: [],
        
        // UI state
        theme: 'dark', // Will sync with ThemeContext
        searchQuery: '',
        activeFilters: {},
        
        // App lifecycle
        appVersion: '1.0.0',
        isFirstRun: true,
        
        // Actions
        setLoading: (loading) => 
          set((state) => {
            state.isLoading = loading
          }),
          
        setCurrentProject: (project) =>
          set((state) => {
            state.currentProject = project
            state.lastSaved = new Date().toISOString()
          }),
          
        toggleSidebar: () =>
          set((state) => {
            state.sidebarCollapsed = !state.sidebarCollapsed
          }),
          
        setSidebarCollapsed: (collapsed) =>
          set((state) => {
            state.sidebarCollapsed = collapsed
          }),
          
        switchMode: (mode) =>
          set((state) => {
            if (['structured', 'creative', 'hybrid'].includes(mode)) {
              state.currentMode = mode
              state.lastSaved = new Date().toISOString()
            }
          }),
          
        setTheme: (theme) =>
          set((state) => {
            state.theme = theme
          }),
          
        setSearchQuery: (query) =>
          set((state) => {
            state.searchQuery = query
          }),
          
        setActiveFilters: (filters) =>
          set((state) => {
            state.activeFilters = filters
          }),
          
        addNotification: (notification) =>
          set((state) => {
            const newNotification = {
              id: Date.now().toString(),
              timestamp: new Date().toISOString(),
              type: 'info', // 'info' | 'success' | 'warning' | 'error'
              ...notification
            }
            state.notifications.push(newNotification)
          }),
          
        removeNotification: (id) =>
          set((state) => {
            state.notifications = state.notifications.filter(n => n.id !== id)
          }),
          
        clearNotifications: () =>
          set((state) => {
            state.notifications = []
          }),
          
        setOnlineStatus: (isOnline) =>
          set((state) => {
            state.isOnline = isOnline
          }),
          
        markAsNotFirstRun: () =>
          set((state) => {
            state.isFirstRun = false
          }),
          
        updateLastSaved: () =>
          set((state) => {
            state.lastSaved = new Date().toISOString()
          }),
          
        // Getters (computed values)
        getNotificationCount: () => get().notifications.length,
        
        getActiveNotifications: () => get().notifications.filter(n => !n.dismissed),
        
        hasUnsavedChanges: () => {
          const state = get()
          if (!state.lastSaved) return false
          
          const lastSavedTime = new Date(state.lastSaved).getTime()
          const currentTime = new Date().getTime()
          const timeDiff = currentTime - lastSavedTime
          
          // Consider changes unsaved if more than 30 seconds have passed
          return timeDiff > 30000
        },
        
        // Reset functions
        resetAppState: () =>
          set((state) => {
            state.isLoading = false
            state.currentProject = null
            state.searchQuery = ''
            state.activeFilters = {}
            state.notifications = []
          }),
      })),
      {
        name: 'projiki-app-store',
        partialize: (state) => ({
          // Only persist these values
          sidebarCollapsed: state.sidebarCollapsed,
          currentMode: state.currentMode,
          theme: state.theme,
          isFirstRun: state.isFirstRun,
          appVersion: state.appVersion,
        }),
      }
    ),
    {
      name: 'app-store',
    }
  )
)

export default useAppStore