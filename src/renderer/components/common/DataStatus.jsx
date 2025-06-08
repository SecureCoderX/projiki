// src/renderer/components/common/DataStatus.jsx
import React from 'react'
import { useAppStore } from '../../stores'
import { useAutoSave } from '../../hooks/useAutoSave'

/**
 * DataStatus component - Shows save status and data sync information
 */
const DataStatus = ({ className = '' }) => {
  const lastSaved = useAppStore(state => state.lastSaved)
  const isOnline = useAppStore(state => state.isOnline)
  const currentProject = useAppStore(state => state.currentProject)
  
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

  if (!currentProject) {
    return (
      <div className={`flex items-center justify-between text-sm text-text-secondary ${className}`}>
        <div className="flex items-center space-x-2">
          <span>📄</span>
          <span>No project selected</span>
        </div>
        <span className="text-text-muted">Create a project to get started</span>
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

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        <button 
          onClick={autoSave.saveNow}
          className="px-2 py-1 bg-gray-600 hover:bg-gray-500 text-white text-xs rounded transition-colors"
          disabled={autoSave.isSaving}
        >
          {autoSave.isSaving ? 'Saving...' : 'Save Now'}
        </button>
      </div>
    </div>
  )
}

export default DataStatus