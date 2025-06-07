// src/renderer/services/DataService.js
import moment from 'moment'
import sanitize from 'sanitize-filename'
import { v4 as uuidv4 } from 'uuid'

// Use Electron's exposed APIs instead of direct Node.js imports
const fs = window.electronAPI?.fs
const path = window.electronAPI?.path
const os = window.electronAPI?.os

/**
 * DataService - Core data persistence layer for Projiki
 * Handles all file system operations for projects, tasks, and app data
 */
class DataService {
  constructor() {
    // Check if Electron APIs are available
    if (!fs || !path || !os) {
      console.warn('⚠️ Electron APIs not available - running in browser mode')
      this.browserMode = true
      this.isInitialized = true
      return
    }

    this.browserMode = false
    this.basePath = path.join(os.homedir(), 'Documents', 'Projiki')
    this.projectsPath = path.join(this.basePath, 'projects')
    this.templatesPath = path.join(this.basePath, 'templates')
    this.exportsPath = path.join(this.basePath, 'exports')
    this.backupsPath = path.join(this.basePath, 'backups')
    this.settingsPath = path.join(this.basePath, 'settings.json')
    
    this.isInitialized = false
    this.autoSaveInterval = null
    this.pendingSaves = new Map() // Track pending save operations
    
    this.initializeDirectories()
  }

  // =============================================================================
  // BROWSER MODE FALLBACKS
  // =============================================================================

  _getBrowserStorage(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || 'null')
    } catch {
      return null
    }
  }

  _setBrowserStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  }

  // =============================================================================
  // INITIALIZATION
  // =============================================================================

  /**
   * Initialize the directory structure for Projiki data
   */
  async initializeDirectories() {
    if (this.browserMode) {
      console.log('📱 Running in browser mode - using localStorage')
      this.isInitialized = true
      return
    }

    try {
      const directories = [
        this.basePath,
        this.projectsPath,
        this.templatesPath,
        this.exportsPath,
        this.backupsPath
      ]

      for (const dir of directories) {
        await fs.ensureDir(dir)
      }

      // Create default settings if they don't exist
      if (!(await fs.pathExists(this.settingsPath))) {
        await this.createDefaultSettings()
      }

      this.isInitialized = true
      console.log('✅ DataService initialized successfully')
      console.log(`📁 Data directory: ${this.basePath}`)
      
    } catch (error) {
      console.error('❌ Failed to initialize DataService:', error)
      // Fallback to browser mode
      this.browserMode = true
      this.isInitialized = true
      console.log('📱 Falling back to browser mode')
    }
  }

  /**
   * Create default application settings
   */
  async createDefaultSettings() {
    const defaultSettings = {
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      preferences: {
        autoSave: true,
        autoSaveInterval: 30000, // 30 seconds
        createBackups: true,
        maxBackups: 10,
        defaultProjectMode: 'structured',
        exportFormat: 'json'
      },
      statistics: {
        totalProjects: 0,
        totalTasks: 0,
        appLaunches: 0,
        lastLaunch: new Date().toISOString()
      }
    }

    if (this.browserMode) {
      this._setBrowserStorage('projiki-settings', defaultSettings)
    } else {
      await fs.writeJson(this.settingsPath, defaultSettings, { spaces: 2 })
    }
    
    return defaultSettings
  }

  // =============================================================================
  // PROJECT OPERATIONS
  // =============================================================================

  /**
   * Save a project to the file system or localStorage
   */
  async saveProject(project) {
    if (!this.isInitialized) {
      throw new Error('DataService not initialized')
    }

    try {
      const projectData = {
        ...project,
        savedAt: new Date().toISOString(),
        version: '1.0.0'
      }

      if (this.browserMode) {
        // Browser mode: save to localStorage
        const projects = this._getBrowserStorage('projiki-projects') || []
        const existingIndex = projects.findIndex(p => p.id === project.id)
        
        if (existingIndex >= 0) {
          projects[existingIndex] = projectData
        } else {
          projects.push(projectData)
        }
        
        this._setBrowserStorage('projiki-projects', projects)
      } else {
        // Electron mode: save to file system
        const projectDir = path.join(this.projectsPath, sanitize(project.id))
        await fs.ensureDir(projectDir)
        
        const projectFile = path.join(projectDir, 'project.json')
        await fs.writeJson(projectFile, projectData, { spaces: 2 })
      }

      // Update statistics
      await this.updateStatistics({ lastSave: new Date().toISOString() })

      console.log(`💾 Project saved: ${project.name}`)
      return projectData

    } catch (error) {
      console.error('❌ Failed to save project:', error)
      throw new Error(`Failed to save project: ${error.message}`)
    }
  }

  /**
   * Load a specific project by ID
   */
  async loadProject(projectId) {
    if (!this.isInitialized) {
      throw new Error('DataService not initialized')
    }

    try {
      if (this.browserMode) {
        const projects = this._getBrowserStorage('projiki-projects') || []
        const project = projects.find(p => p.id === projectId)
        
        if (!project) {
          throw new Error(`Project not found: ${projectId}`)
        }
        
        return project
      } else {
        const projectDir = path.join(this.projectsPath, sanitize(projectId))
        const projectFile = path.join(projectDir, 'project.json')

        if (!(await fs.pathExists(projectFile))) {
          throw new Error(`Project not found: ${projectId}`)
        }

        const project = await fs.readJson(projectFile)
        console.log(`📂 Project loaded: ${project.name}`)
        return project
      }

    } catch (error) {
      console.error('❌ Failed to load project:', error)
      throw new Error(`Failed to load project: ${error.message}`)
    }
  }

  /**
   * Load all projects
   */
  async loadAllProjects() {
    if (!this.isInitialized) {
      throw new Error('DataService not initialized')
    }

    try {
      if (this.browserMode) {
        const projects = this._getBrowserStorage('projiki-projects') || []
        console.log(`📚 Loaded ${projects.length} projects from localStorage`)
        return projects.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      } else {
        const projects = []
        const projectDirs = await fs.readdir(this.projectsPath)

        for (const dirName of projectDirs) {
          const projectDir = path.join(this.projectsPath, dirName)
          const projectFile = path.join(projectDir, 'project.json')

          if (await fs.pathExists(projectFile)) {
            try {
              const project = await fs.readJson(projectFile)
              projects.push(project)
            } catch (error) {
              console.warn(`⚠️ Skipping corrupted project: ${dirName}`, error.message)
            }
          }
        }

        // Sort by last updated
        projects.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))

        console.log(`📚 Loaded ${projects.length} projects`)
        return projects
      }

    } catch (error) {
      console.error('❌ Failed to load projects:', error)
      throw new Error(`Failed to load projects: ${error.message}`)
    }
  }

  /**
   * Delete a project
   */
  async deleteProject(projectId) {
    if (!this.isInitialized) {
      throw new Error('DataService not initialized')
    }

    try {
      if (this.browserMode) {
        const projects = this._getBrowserStorage('projiki-projects') || []
        const filteredProjects = projects.filter(p => p.id !== projectId)
        this._setBrowserStorage('projiki-projects', filteredProjects)
        
        // Also delete tasks for this project
        const tasks = this._getBrowserStorage('projiki-tasks') || {}
        delete tasks[projectId]
        this._setBrowserStorage('projiki-tasks', tasks)
      } else {
        const projectDir = path.join(this.projectsPath, sanitize(projectId))
        if (await fs.pathExists(projectDir)) {
          await fs.remove(projectDir)
        }
      }

      console.log(`🗑️ Project deleted: ${projectId}`)

    } catch (error) {
      console.error('❌ Failed to delete project:', error)
      throw new Error(`Failed to delete project: ${error.message}`)
    }
  }

  // =============================================================================
  // TASK OPERATIONS
  // =============================================================================

  /**
   * Save tasks for a specific project
   */
  async saveTasks(projectId, tasks) {
    if (!this.isInitialized) {
      throw new Error('DataService not initialized')
    }

    try {
      const tasksData = {
        projectId,
        tasks,
        savedAt: new Date().toISOString(),
        version: '1.0.0'
      }

      if (this.browserMode) {
        const allTasks = this._getBrowserStorage('projiki-tasks') || {}
        allTasks[projectId] = tasksData
        this._setBrowserStorage('projiki-tasks', allTasks)
      } else {
        const projectDir = path.join(this.projectsPath, sanitize(projectId))
        await fs.ensureDir(projectDir)

        const tasksFile = path.join(projectDir, 'tasks.json')
        await fs.writeJson(tasksFile, tasksData, { spaces: 2 })
      }

      console.log(`📝 Tasks saved for project: ${projectId} (${tasks.length} tasks)`)

    } catch (error) {
      console.error('❌ Failed to save tasks:', error)
      throw new Error(`Failed to save tasks: ${error.message}`)
    }
  }

  /**
   * Load tasks for a specific project
   */
  async loadTasks(projectId) {
    if (!this.isInitialized) {
      throw new Error('DataService not initialized')
    }

    try {
      if (this.browserMode) {
        const allTasks = this._getBrowserStorage('projiki-tasks') || {}
        const projectTasks = allTasks[projectId]
        
        if (!projectTasks) {
          console.log(`📝 No tasks found for project: ${projectId}`)
          return []
        }
        
        console.log(`📝 Tasks loaded for project: ${projectId} (${projectTasks.tasks.length} tasks)`)
        return projectTasks.tasks
      } else {
        const projectDir = path.join(this.projectsPath, sanitize(projectId))
        const tasksFile = path.join(projectDir, 'tasks.json')

        if (!(await fs.pathExists(tasksFile))) {
          console.log(`📝 No tasks file found for project: ${projectId}`)
          return []
        }

        const tasksData = await fs.readJson(tasksFile)
        console.log(`📝 Tasks loaded for project: ${projectId} (${tasksData.tasks.length} tasks)`)
        return tasksData.tasks
      }

    } catch (error) {
      console.error('❌ Failed to load tasks:', error)
      throw new Error(`Failed to load tasks: ${error.message}`)
    }
  }

  /**
   * Save a single task (for real-time updates)
   */
  async saveTask(projectId, task) {
    if (!this.isInitialized) {
      throw new Error('DataService not initialized')
    }

    try {
      // Load current tasks
      const tasks = await this.loadTasks(projectId)
      
      // Update or add the task
      const taskIndex = tasks.findIndex(t => t.id === task.id)
      if (taskIndex >= 0) {
        tasks[taskIndex] = task
      } else {
        tasks.push(task)
      }

      // Save updated tasks
      await this.saveTasks(projectId, tasks)

    } catch (error) {
      console.error('❌ Failed to save task:', error)
      throw new Error(`Failed to save task: ${error.message}`)
    }
  }

  // =============================================================================
  // SETTINGS & PREFERENCES
  // =============================================================================

  /**
   * Load application settings
   */
  async loadSettings() {
    if (!this.isInitialized) {
      throw new Error('DataService not initialized')
    }

    try {
      if (this.browserMode) {
        const settings = this._getBrowserStorage('projiki-settings')
        if (!settings) {
          return await this.createDefaultSettings()
        }
        return settings
      } else {
        if (!(await fs.pathExists(this.settingsPath))) {
          return await this.createDefaultSettings()
        }

        const settings = await fs.readJson(this.settingsPath)
        return settings
      }

    } catch (error) {
      console.error('❌ Failed to load settings:', error)
      throw new Error(`Failed to load settings: ${error.message}`)
    }
  }

  /**
   * Save application settings
   */
  async saveSettings(settings) {
    if (!this.isInitialized) {
      throw new Error('DataService not initialized')
    }

    try {
      const updatedSettings = {
        ...settings,
        updatedAt: new Date().toISOString()
      }

      if (this.browserMode) {
        this._setBrowserStorage('projiki-settings', updatedSettings)
      } else {
        await fs.writeJson(this.settingsPath, updatedSettings, { spaces: 2 })
      }

      console.log('⚙️ Settings saved')

    } catch (error) {
      console.error('❌ Failed to save settings:', error)
      throw new Error(`Failed to save settings: ${error.message}`)
    }
  }

  /**
   * Update application statistics
   */
  async updateStatistics(updates) {
    try {
      const settings = await this.loadSettings()
      settings.statistics = {
        ...settings.statistics,
        ...updates
      }
      await this.saveSettings(settings)

    } catch (error) {
      console.error('❌ Failed to update statistics:', error)
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Check if data directory exists and is accessible
   */
  async checkDataDirectory() {
    if (this.browserMode) {
      return true // localStorage is always accessible
    }

    try {
      await fs.access(this.basePath, fs.constants.R_OK | fs.constants.W_OK)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Get data directory information
   */
  async getDataDirectoryInfo() {
    try {
      if (this.browserMode) {
        const projects = this._getBrowserStorage('projiki-projects') || []
        return {
          path: 'localStorage',
          exists: true,
          size: JSON.stringify(localStorage).length,
          created: new Date(),
          modified: new Date(),
          projectCount: projects.length,
          mode: 'browser'
        }
      } else {
        const stats = await fs.stat(this.basePath)
        const projects = await fs.readdir(this.projectsPath)
        
        return {
          path: this.basePath,
          exists: true,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          projectCount: projects.length,
          mode: 'electron'
        }
      }
    } catch (error) {
      return {
        path: this.browserMode ? 'localStorage' : this.basePath,
        exists: false,
        error: error.message,
        mode: this.browserMode ? 'browser' : 'electron'
      }
    }
  }

  // =============================================================================
  // AUTO-SAVE FUNCTIONALITY
  // =============================================================================

  /**
   * Start auto-save functionality
   */
  startAutoSave(saveCallback, interval = 30000) {
    if (this.autoSaveInterval) {
      this.stopAutoSave()
    }

    this.autoSaveInterval = setInterval(async () => {
      try {
        await saveCallback()
        console.log('💾 Auto-save completed')
      } catch (error) {
        console.error('❌ Auto-save failed:', error)
      }
    }, interval)

    console.log(`⏰ Auto-save started (interval: ${interval}ms)`)
  }

  /**
   * Stop auto-save functionality
   */
  stopAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval)
      this.autoSaveInterval = null
      console.log('⏹️ Auto-save stopped')
    }
  }

  /**
   * Debounced save operation to prevent excessive writes
   */
  debouncedSave(key, saveFunction, delay = 1000) {
    // Clear existing timeout for this key
    if (this.pendingSaves.has(key)) {
      clearTimeout(this.pendingSaves.get(key))
    }

    // Set new timeout
    const timeoutId = setTimeout(async () => {
      try {
        await saveFunction()
        this.pendingSaves.delete(key)
        console.log(`💾 Debounced save completed: ${key}`)
      } catch (error) {
        console.error(`❌ Debounced save failed: ${key}`, error)
        this.pendingSaves.delete(key)
      }
    }, delay)

    this.pendingSaves.set(key, timeoutId)
  }

  /**
   * Cleanup pending saves on shutdown
   */
  async cleanup() {
    console.log('🧹 Cleaning up DataService...')
    
    // Stop auto-save
    this.stopAutoSave()
    
    // Execute any pending saves
    const pendingPromises = []
    for (const [key, timeoutId] of this.pendingSaves) {
      clearTimeout(timeoutId)
      // Could trigger immediate save here if needed
    }
    
    this.pendingSaves.clear()
    
    if (pendingPromises.length > 0) {
      await Promise.all(pendingPromises)
    }
    
    console.log('✅ DataService cleanup completed')
  }
}

// Export singleton instance
const dataService = new DataService()
export default dataService