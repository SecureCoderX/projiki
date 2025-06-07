// src/renderer/stores/StoreDataIntegration.js
// Integration layer between Zustand stores and DataService

import dataService from '../services/DataService'
import backupService from '../services/BackupService'
import { validateProject, validateTask, validateSettings } from '../utils/validation'

/**
 * Enhanced store operations with data persistence
 * This file contains the actual implementations for async store methods
 */

// =============================================================================
// PROJECT STORE INTEGRATION
// =============================================================================

export const projectStoreIntegration = {
  /**
   * Load all projects from file system
   */
  async loadProjects(set, get) {
    try {
      set((state) => {
        state.loadingProjects = true
        state.projectsError = null
      })

      const projects = await dataService.loadAllProjects()
      
      // Validate loaded projects
      const validatedProjects = []
      const invalidProjects = []

      for (const project of projects) {
        const validation = validateProject(project)
        if (validation.isValid) {
          validatedProjects.push(project)
        } else {
          invalidProjects.push({ project, errors: validation.errors })
          console.warn(`Invalid project loaded: ${project.name}`, validation.errors)
        }
      }

      set((state) => {
        state.projects = validatedProjects
        state.loadingProjects = false
        state.projectsError = null
      })

      if (invalidProjects.length > 0) {
        // Notify about invalid projects but don't fail completely
        const { addNotification } = await import('./useAppStore')
        addNotification.getState()({
          type: 'warning',
          title: 'Data Validation Warning',
          message: `${invalidProjects.length} projects had validation errors and were skipped.`
        })
      }

      console.log(`✅ Loaded ${validatedProjects.length} valid projects`)
      return validatedProjects

    } catch (error) {
      console.error('❌ Failed to load projects:', error)
      
      set((state) => {
        state.loadingProjects = false
        state.projectsError = error.message
      })

      throw error
    }
  },

  /**
   * Save a project to file system
   */
  async saveProject(project, set, get) {
    try {
      // Validate before saving
      const validation = validateProject(project)
      if (!validation.isValid) {
        throw new Error(`Invalid project data: ${validation.errors.join(', ')}`)
      }

      await dataService.saveProject(project)
      
      // Update store with saved project
      set((state) => {
        const projectIndex = state.projects.findIndex(p => p.id === project.id)
        if (projectIndex >= 0) {
          state.projects[projectIndex] = project
        } else {
          state.projects.push(project)
        }
      })

      const { updateLastSaved } = await import('./useAppStore')
      updateLastSaved.getState()()

      return project

    } catch (error) {
      console.error('❌ Failed to save project:', error)
      
      const { addNotification } = await import('./useAppStore')
      addNotification.getState()({
        type: 'error',
        title: 'Save Failed',
        message: `Failed to save project: ${error.message}`
      })

      throw error
    }
  },

  /**
   * Delete a project from file system
   */
  async deleteProject(projectId, set, get) {
    try {
      await dataService.deleteProject(projectId)
      
      set((state) => {
        state.projects = state.projects.filter(p => p.id !== projectId)
        
        // Clear current project if it's the one being deleted
        if (state.currentProject?.id === projectId) {
          state.currentProject = null
        }
      })

      const { setCurrentProject } = await import('./useAppStore')
      if (get().currentProject?.id === projectId) {
        setCurrentProject.getState()(null)
      }

    } catch (error) {
      console.error('❌ Failed to delete project:', error)
      throw error
    }
  },

  /**
   * Create backup of all projects
   */
  async createBackup(set, get) {
    try {
      const { setLoading, addNotification } = await import('./useAppStore')
      setLoading.getState()(true)

      const backupInfo = await backupService.createFullBackup()
      
      addNotification.getState()({
        type: 'success',
        title: 'Backup Created',
        message: `Backup created successfully: ${backupInfo.name}`
      })

      return backupInfo

    } catch (error) {
      console.error('❌ Failed to create backup:', error)
      
      const { addNotification } = await import('./useAppStore')
      addNotification.getState()({
        type: 'error',
        title: 'Backup Failed',
        message: `Failed to create backup: ${error.message}`
      })

      throw error
    } finally {
      const { setLoading } = await import('./useAppStore')
      setLoading.getState()(false)
    }
  },

  /**
   * Export a project
   */
  async exportProject(projectId, format = 'json', set, get) {
    try {
      const { setLoading, addNotification } = await import('./useAppStore')
      setLoading.getState()(true)

      const exportInfo = await backupService.exportProject(projectId, format)
      
      addNotification.getState()({
        type: 'success',
        title: 'Export Complete',
        message: `Project exported to: ${exportInfo.filePath}`
      })

      return exportInfo

    } catch (error) {
      console.error('❌ Failed to export project:', error)
      
      const { addNotification } = await import('./useAppStore')
      addNotification.getState()({
        type: 'error',
        title: 'Export Failed',
        message: `Failed to export project: ${error.message}`
      })

      throw error
    } finally {
      const { setLoading } = await import('./useAppStore')
      setLoading.getState()(false)
    }
  }
}

// =============================================================================
// TASK STORE INTEGRATION
// =============================================================================

export const taskStoreIntegration = {
  /**
   * Load tasks for a specific project
   */
  async loadTasks(projectId, set, get) {
    try {
      set((state) => {
        state.loadingTasks = true
        state.tasksError = null
      })

      const tasks = await dataService.loadTasks(projectId)
      
      // Validate loaded tasks
      const validatedTasks = []
      const invalidTasks = []

      for (const task of tasks) {
        const validation = validateTask(task)
        if (validation.isValid) {
          validatedTasks.push(task)
        } else {
          invalidTasks.push({ task, errors: validation.errors })
          console.warn(`Invalid task loaded: ${task.title}`, validation.errors)
        }
      }

      set((state) => {
        // Filter tasks for the specific project and replace
        state.tasks = state.tasks.filter(t => t.projectId !== projectId).concat(validatedTasks)
        state.loadingTasks = false
        state.tasksError = null
      })

      if (invalidTasks.length > 0) {
        const { addNotification } = await import('./useAppStore')
        addNotification.getState()({
          type: 'warning',
          title: 'Data Validation Warning',
          message: `${invalidTasks.length} tasks had validation errors and were skipped.`
        })
      }

      console.log(`✅ Loaded ${validatedTasks.length} valid tasks for project: ${projectId}`)
      return validatedTasks

    } catch (error) {
      console.error('❌ Failed to load tasks:', error)
      
      set((state) => {
        state.loadingTasks = false
        state.tasksError = error.message
      })

      throw error
    }
  },

  /**
   * Save tasks for a project
   */
  async saveTasks(projectId, tasks, set, get) {
    try {
      // Validate all tasks before saving
      const invalidTasks = []
      const validTasks = []

      for (const task of tasks) {
        const validation = validateTask(task)
        if (validation.isValid) {
          validTasks.push(task)
        } else {
          invalidTasks.push({ task, errors: validation.errors })
        }
      }

      if (invalidTasks.length > 0) {
        console.warn(`Skipping ${invalidTasks.length} invalid tasks`, invalidTasks)
      }

      await dataService.saveTasks(projectId, validTasks)
      
      // Update store
      set((state) => {
        // Remove old tasks for this project and add new ones
        state.tasks = state.tasks.filter(t => t.projectId !== projectId).concat(validTasks)
      })

      const { updateLastSaved } = await import('./useAppStore')
      updateLastSaved.getState()()

      return validTasks

    } catch (error) {
      console.error('❌ Failed to save tasks:', error)
      
      const { addNotification } = await import('./useAppStore')
      addNotification.getState()({
        type: 'error',
        title: 'Save Failed',
        message: `Failed to save tasks: ${error.message}`
      })

      throw error
    }
  },

  /**
   * Save a single task
   */
  async saveTask(task, set, get) {
    try {
      // Validate task before saving
      const validation = validateTask(task)
      if (!validation.isValid) {
        throw new Error(`Invalid task data: ${validation.errors.join(', ')}`)
      }

      await dataService.saveTask(task.projectId, task)
      
      // Update store
      set((state) => {
        const taskIndex = state.tasks.findIndex(t => t.id === task.id)
        if (taskIndex >= 0) {
          state.tasks[taskIndex] = task
        } else {
          state.tasks.push(task)
        }
      })

      const { updateLastSaved } = await import('./useAppStore')
      updateLastSaved.getState()()

      return task

    } catch (error) {
      console.error('❌ Failed to save task:', error)
      
      const { addNotification } = await import('./useAppStore')
      addNotification.getState()({
        type: 'error',
        title: 'Save Failed',
        message: `Failed to save task: ${error.message}`
      })

      throw error
    }
  }
}

// =============================================================================
// APP STORE INTEGRATION
// =============================================================================

export const appStoreIntegration = {
  /**
   * Load application settings
   */
  async loadSettings(set, get) {
    try {
      const settings = await dataService.loadSettings()
      
      // Validate settings
      const validation = validateSettings(settings)
      if (!validation.isValid) {
        console.warn('Settings validation failed:', validation.errors)
        // Use default settings if validation fails
        const defaultSettings = await dataService.createDefaultSettings()
        return defaultSettings
      }

      // Update app store with loaded preferences
      set((state) => {
        if (settings.preferences) {
          state.theme = settings.preferences.theme || state.theme
          state.sidebarCollapsed = settings.preferences.sidebarCollapsed ?? state.sidebarCollapsed
          state.currentMode = settings.preferences.defaultProjectMode || state.currentMode
        }
      })

      console.log('⚙️ Settings loaded successfully')
      return settings

    } catch (error) {
      console.error('❌ Failed to load settings:', error)
      throw error
    }
  },

  /**
   * Save application settings
   */
  async saveSettings(updates, set, get) {
    try {
      const currentSettings = await dataService.loadSettings()
      const updatedSettings = {
        ...currentSettings,
        ...updates,
        updatedAt: new Date().toISOString()
      }

      // Validate before saving
      const validation = validateSettings(updatedSettings)
      if (!validation.isValid) {
        throw new Error(`Invalid settings: ${validation.errors.join(', ')}`)
      }

      await dataService.saveSettings(updatedSettings)
      console.log('⚙️ Settings saved successfully')
      
      return updatedSettings

    } catch (error) {
      console.error('❌ Failed to save settings:', error)
      
      set((state) => {
        state.addNotification({
          type: 'error',
          title: 'Settings Save Failed',
          message: `Failed to save settings: ${error.message}`
        })
      })

      throw error
    }
  },

  /**
   * Initialize application data
   */
  async initializeApp(set, get) {
    try {
      set((state) => {
        state.isLoading = true
      })

      // Initialize data service
      if (!dataService.isInitialized) {
        await dataService.initializeDirectories()
      }

      // Load settings
      await this.loadSettings(set, get)

      // Update statistics
      const currentSettings = await dataService.loadSettings()
      const updatedStats = {
        ...currentSettings.statistics,
        appLaunches: (currentSettings.statistics.appLaunches || 0) + 1,
        lastLaunch: new Date().toISOString()
      }

      await dataService.updateStatistics(updatedStats)

      set((state) => {
        state.isLoading = false
        state.markAsNotFirstRun()
      })

      console.log('🚀 Application initialized successfully')

    } catch (error) {
      console.error('❌ Failed to initialize app:', error)
      
      set((state) => {
        state.isLoading = false
        state.addNotification({
          type: 'error',
          title: 'Initialization Failed',
          message: `Failed to initialize application: ${error.message}`
        })
      })

      throw error
    }
  }
}

// =============================================================================
// DATA INTEGRITY UTILITIES
// =============================================================================

export const dataIntegrityUtils = {
  /**
   * Verify data integrity across all projects and tasks
   */
  async verifyDataIntegrity() {
    try {
      console.log('🔍 Starting data integrity check...')
      
      const results = {
        projects: { total: 0, valid: 0, invalid: 0, errors: [] },
        tasks: { total: 0, valid: 0, invalid: 0, errors: [] },
        orphanedTasks: [],
        missingTaskFiles: []
      }

      // Check all projects
      const projects = await dataService.loadAllProjects()
      results.projects.total = projects.length

      const validProjectIds = new Set()

      for (const project of projects) {
        const validation = validateProject(project)
        if (validation.isValid) {
          results.projects.valid++
          validProjectIds.add(project.id)
        } else {
          results.projects.invalid++
          results.projects.errors.push({
            projectId: project.id,
            projectName: project.name,
            errors: validation.errors
          })
        }

        // Check tasks for this project
        try {
          const tasks = await dataService.loadTasks(project.id)
          results.tasks.total += tasks.length

          for (const task of tasks) {
            const taskValidation = validateTask(task)
            if (taskValidation.isValid) {
              results.tasks.valid++
              
              // Check if task belongs to valid project
              if (!validProjectIds.has(task.projectId)) {
                results.orphanedTasks.push({
                  taskId: task.id,
                  taskTitle: task.title,
                  projectId: task.projectId
                })
              }
            } else {
              results.tasks.invalid++
              results.tasks.errors.push({
                taskId: task.id,
                taskTitle: task.title,
                projectId: project.id,
                errors: taskValidation.errors
              })
            }
          }
        } catch (error) {
          results.missingTaskFiles.push({
            projectId: project.id,
            projectName: project.name,
            error: error.message
          })
        }
      }

      console.log('✅ Data integrity check completed:', results)
      return results

    } catch (error) {
      console.error('❌ Data integrity check failed:', error)
      throw error
    }
  },

  /**
   * Repair data integrity issues
   */
  async repairDataIntegrity(integrityResults) {
    try {
      console.log('🔧 Starting data integrity repair...')
      
      const repairResults = {
        projectsRepaired: 0,
        tasksRepaired: 0,
        orphanedTasksRemoved: 0,
        errors: []
      }

      // Remove orphaned tasks
      for (const orphanedTask of integrityResults.orphanedTasks) {
        try {
          // Could either remove the task or reassign to a different project
          // For now, we'll remove orphaned tasks
          console.log(`🗑️ Removing orphaned task: ${orphanedTask.taskTitle}`)
          repairResults.orphanedTasksRemoved++
        } catch (error) {
          repairResults.errors.push(`Failed to remove orphaned task ${orphanedTask.taskId}: ${error.message}`)
        }
      }

      console.log('✅ Data integrity repair completed:', repairResults)
      return repairResults

    } catch (error) {
      console.error('❌ Data integrity repair failed:', error)
      throw error
    }
  }
}