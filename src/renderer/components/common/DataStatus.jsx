// src/renderer/components/common/DataStatus.jsx
import React from 'react'
import { useAppStore } from '../../stores'
import { useAutoSave } from '../../hooks/useAutoSave'
import SearchBar from './SearchBar'

/**
 * DataStatus component - Shows save status and data sync information
 */
const DataStatus = ({ className = '' }) => {
  const lastSaved = useAppStore(state => state.lastSaved)
  const isOnline = useAppStore(state => state.isOnline)
  const currentProject = useAppStore(state => state.currentProject)
  const addNotification = useAppStore(state => state.addNotification)
  
  const autoSave = useAutoSave({ enabled: !!currentProject })

  const formatLastSaved = (timestamp) => {
    if (!timestamp) return 'Never'
    
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return date.toLocaleDateString()
  }

  const getStatusColor = () => {
    if (autoSave.isSaving) return 'text-blue-400'
    if (autoSave.saveError) return 'text-red-400'
    if (autoSave.hasPendingSave) return 'text-yellow-400'
    return 'text-green-400'
  }

  const getStatusIcon = () => {
    if (autoSave.isSaving) return '💾'
    if (autoSave.saveError) return '❌'
    if (autoSave.hasPendingSave) return '⏳'
    return '✅'
  }

  const getStatusText = () => {
    if (autoSave.isSaving) return 'Saving...'
    if (autoSave.saveError) return 'Save failed'
    if (autoSave.hasPendingSave) return 'Saving soon...'
    return 'Saved'
  }

  // Create sample data for testing 
  const createSampleData = async () => {
    try {
      // Import services dynamically
      const dataService = (await import('../../services/DataService')).default
      
      // Create sample projects
      const sampleProjects = [
        {
          id: 'project-web-app',
          name: 'E-commerce Website',
          description: 'Building a modern e-commerce platform with React and Node.js',
          mode: 'structured',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          settings: { defaultView: 'kanban', autoSave: true, syncFrequency: 30000 },
          metadata: { 
            tags: ['web', 'ecommerce', 'react'], 
            priority: 'high', 
            deadline: null, 
            estimatedHours: 120 
          }
        },
        {
          id: 'project-mobile-app',
          name: 'Mobile Task Manager',
          description: 'Cross-platform mobile app for task management',
          mode: 'creative',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          settings: { defaultView: 'kanban', autoSave: true, syncFrequency: 30000 },
          metadata: { 
            tags: ['mobile', 'react-native', 'productivity'], 
            priority: 'medium', 
            deadline: null, 
            estimatedHours: 80 
          }
        }
      ]

      // Create sample tasks
      const sampleTasks = [
        {
          id: 'task-setup-env',
          projectId: 'project-web-app',
          title: 'Set up development environment',
          content: 'Install Node.js, React, and configure build tools',
          type: 'task',
          status: 'done',
          mode: 'structured',
          position: { x: 0, y: 0 },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          metadata: {
            tags: ['setup', 'environment'],
            priority: 'high',
            estimatedTime: 4,
            actualTime: 3,
            dependencies: [],
            assignee: null
          }
        },
        {
          id: 'task-user-auth',
          projectId: 'project-web-app',
          title: 'Implement user authentication',
          content: 'Create login, register, and password reset functionality',
          type: 'task',
          status: 'in-progress',
          mode: 'structured',
          position: { x: 0, y: 1 },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          metadata: {
            tags: ['auth', 'security', 'backend'],
            priority: 'high',
            estimatedTime: 8,
            actualTime: null,
            dependencies: ['task-setup-env'],
            assignee: null
          }
        }
      ]

      // Save sample data
      console.log('💾 Creating sample projects...')
      for (const project of sampleProjects) {
        await dataService.saveProject(project)
      }

      console.log('💾 Creating sample tasks...')
      for (const task of sampleTasks) {
        await dataService.saveTask(task.projectId, task)
      }

      addNotification({
        type: 'success',
        title: 'Sample Data Created',
        message: 'Created 2 projects and 2 tasks for testing'
      })

      console.log('✅ Sample data created successfully')

    } catch (error) {
      console.error('❌ Failed to create sample data:', error)
      addNotification({
        type: 'error',
        title: 'Sample Data Failed',
        message: error.message
      })
    }
  }

  const handleSearchResult = (result) => {
    console.log('🔍 Search result selected:', result)
    addNotification({
      type: 'info',
      title: 'Search Result',
      message: `Selected: ${result.title} (${result.type})`
    })
  }

  if (!currentProject) {
    return (
      <div className={`flex items-center justify-between ${className}`}>
        <div className="flex items-center space-x-4 text-sm text-text-secondary">
          <span className="mr-2">📄</span>
          <span>No project selected</span>
          <button 
            onClick={() => window.testDataPersistence?.()}
            className="ml-4 px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded"
          >
            Create Test Project
          </button>
          <button 
            onClick={createSampleData}
            className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded"
          >
            Create Sample Data
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-4">
          <SearchBar onResultSelect={handleSearchResult} />
        </div>
      </div>
    )
  }

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center space-x-4 text-sm">
        {/* Project Info */}
        <div className="flex items-center text-text-primary">
          <span className="mr-1">📁</span>
          <span className="font-medium">{currentProject.name}</span>
        </div>

        {/* Save Status */}
        <div className={`flex items-center ${getStatusColor()}`}>
          <span className="mr-1">{getStatusIcon()}</span>
          <span>{getStatusText()}</span>
        </div>

        {/* Last Saved */}
        <div className="flex items-center text-text-secondary">
          <span className="mr-1">🕒</span>
          <span>{formatLastSaved(lastSaved)}</span>
        </div>

        {/* Online Status */}
        <div className={`flex items-center ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
          <span className="mr-1">{isOnline ? '🟢' : '🔴'}</span>
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </div>

        {/* Save Error Details */}
        {autoSave.saveError && (
          <div className="flex items-center text-red-400" title={autoSave.saveError}>
            <span className="mr-1">⚠️</span>
            <span className="truncate max-w-32">{autoSave.saveError}</span>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-md mx-4">
        <SearchBar onResultSelect={handleSearchResult} />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        <button 
          onClick={autoSave.saveNow}
          className="px-2 py-1 bg-gray-600 hover:bg-gray-500 text-white text-xs rounded"
          disabled={autoSave.isSaving}
        >
          {autoSave.isSaving ? 'Saving...' : 'Save Now'}
        </button>
        
        <button 
          onClick={createSampleData}
          className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded"
        >
          Add Sample Data
        </button>
      </div>
    </div>
  )
}

export default DataStatus