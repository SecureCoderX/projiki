// src/renderer/services/BackupService.js
import moment from 'moment'
import sanitize from 'sanitize-filename'
import dataService from './DataService'

// Use Electron's exposed APIs or fallback to browser mode
const fs = window.electronAPI?.fs
const path = window.electronAPI?.path

/**
 * BackupService - Handles backup, export, and data recovery operations
 */
class BackupService {
  constructor() {
    this.maxBackups = 10
    this.backupFormats = ['json', 'markdown']
    this.browserMode = !fs || !path
  }

  // =============================================================================
  // BACKUP OPERATIONS
  // =============================================================================

  /**
   * Create a full backup of all Projiki data
   */
  async createFullBackup() {
    try {
      const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss')
      const backupName = `projiki-backup-${timestamp}`

      // Load all projects and their tasks
      const projects = await dataService.loadAllProjects()
      const backupData = {
        metadata: {
          version: '1.0.0',
          createdAt: new Date().toISOString(),
          totalProjects: projects.length,
          backupType: 'full',
          mode: this.browserMode ? 'browser' : 'electron'
        },
        projects: [],
        settings: await dataService.loadSettings()
      }

      // Backup each project with its tasks
      for (const project of projects) {
        try {
          const tasks = await dataService.loadTasks(project.id)
          backupData.projects.push({
            project,
            tasks,
            exportedAt: new Date().toISOString()
          })
        } catch (error) {
          console.warn(`⚠️ Failed to backup project ${project.name}:`, error.message)
        }
      }

      if (this.browserMode) {
        // Browser mode: save to localStorage
        const existingBackups = JSON.parse(localStorage.getItem('projiki-backups') || '[]')
        existingBackups.unshift({
          name: backupName,
          data: backupData,
          created: new Date().toISOString(),
          size: JSON.stringify(backupData).length
        })

        // Keep only the most recent backups
        const trimmedBackups = existingBackups.slice(0, this.maxBackups)
        localStorage.setItem('projiki-backups', JSON.stringify(trimmedBackups))

        console.log(`📦 Browser backup created: ${backupName}`)
        return {
          name: backupName,
          path: 'localStorage',
          size: JSON.stringify(backupData).length,
          projectCount: projects.length,
          mode: 'browser'
        }
      } else {
        // Electron mode: save to file system
        const backupDir = path.join(dataService.backupsPath, backupName)
        await fs.ensureDir(backupDir)

        // Save backup file
        const backupFile = path.join(backupDir, 'backup.json')
        await fs.writeJson(backupFile, backupData, { spaces: 2 })

        // Create readable summary
        await this.createBackupSummary(backupDir, backupData)

        // Cleanup old backups
        await this.cleanupOldBackups()

        console.log(`📦 Full backup created: ${backupName}`)
        return {
          name: backupName,
          path: backupDir,
          size: await this.getDirectorySize(backupDir),
          projectCount: projects.length,
          mode: 'electron'
        }
      }

    } catch (error) {
      console.error('❌ Failed to create backup:', error)
      throw new Error(`Backup failed: ${error.message}`)
    }
  }

  /**
   * Create a backup summary file for easy reading (Electron mode only)
   */
  async createBackupSummary(backupDir, backupData) {
    if (this.browserMode) return

    const summary = [
      '# Projiki Backup Summary',
      '',
      `**Created:** ${moment().format('MMMM Do YYYY, h:mm:ss a')}`,
      `**Projects:** ${backupData.projects.length}`,
      `**Total Tasks:** ${backupData.projects.reduce((sum, p) => sum + p.tasks.length, 0)}`,
      '',
      '## Projects',
      ''
    ]

    for (const projectData of backupData.projects) {
      const { project, tasks } = projectData
      summary.push(`### ${project.name}`)
      summary.push(`- **Status:** ${project.status}`)
      summary.push(`- **Mode:** ${project.mode}`)
      summary.push(`- **Tasks:** ${tasks.length}`)
      summary.push(`- **Created:** ${moment(project.createdAt).format('MMMM Do YYYY')}`)
      summary.push(`- **Last Updated:** ${moment(project.updatedAt).format('MMMM Do YYYY')}`)
      
      if (project.metadata.tags.length > 0) {
        summary.push(`- **Tags:** ${project.metadata.tags.join(', ')}`)
      }
      
      summary.push('')
    }

    await fs.writeFile(
      path.join(backupDir, 'README.md'),
      summary.join('\n'),
      'utf8'
    )
  }

  /**
   * List available backups
   */
  async listBackups() {
    try {
      if (this.browserMode) {
        const backups = JSON.parse(localStorage.getItem('projiki-backups') || '[]')
        return backups.map(backup => ({
          name: backup.name,
          path: 'localStorage',
          created: new Date(backup.created),
          size: backup.size,
          projectCount: backup.data.projects?.length || 0,
          metadata: backup.data.metadata,
          mode: 'browser'
        }))
      } else {
        const backups = []
        const backupDirs = await fs.readdir(dataService.backupsPath)

        for (const dirName of backupDirs) {
          const backupDir = path.join(dataService.backupsPath, dirName)
          const backupFile = path.join(backupDir, 'backup.json')

          if (await fs.pathExists(backupFile)) {
            try {
              const stats = await fs.stat(backupDir)
              const backupData = await fs.readJson(backupFile)
              
              backups.push({
                name: dirName,
                path: backupDir,
                created: stats.birthtime,
                size: await this.getDirectorySize(backupDir),
                projectCount: backupData.projects?.length || 0,
                metadata: backupData.metadata,
                mode: 'electron'
              })
            } catch (error) {
              console.warn(`⚠️ Skipping corrupted backup: ${dirName}`)
            }
          }
        }

        // Sort by creation date (newest first)
        backups.sort((a, b) => new Date(b.created) - new Date(a.created))
        
        return backups
      }

    } catch (error) {
      console.error('❌ Failed to list backups:', error)
      throw new Error(`Failed to list backups: ${error.message}`)
    }
  }

  /**
   * Restore from a backup
   */
  async restoreBackup(backupIdentifier) {
    try {
      let backupData

      if (this.browserMode) {
        const backups = JSON.parse(localStorage.getItem('projiki-backups') || '[]')
        const backup = backups.find(b => b.name === backupIdentifier)
        
        if (!backup) {
          throw new Error('Backup not found')
        }
        
        backupData = backup.data
      } else {
        const backupFile = path.join(backupIdentifier, 'backup.json')
        
        if (!(await fs.pathExists(backupFile))) {
          throw new Error('Invalid backup: backup.json not found')
        }

        backupData = await fs.readJson(backupFile)
      }
      
      if (!backupData.projects || !Array.isArray(backupData.projects)) {
        throw new Error('Invalid backup: projects data not found')
      }

      const restored = {
        projects: 0,
        tasks: 0,
        errors: []
      }

      // Restore each project
      for (const projectData of backupData.projects) {
        try {
          const { project, tasks } = projectData
          
          // Save project
          await dataService.saveProject(project)
          restored.projects++
          
          // Save tasks
          if (tasks && tasks.length > 0) {
            await dataService.saveTasks(project.id, tasks)
            restored.tasks += tasks.length
          }
          
        } catch (error) {
          restored.errors.push(`Failed to restore project ${projectData.project.name}: ${error.message}`)
        }
      }

      // Restore settings if available
      if (backupData.settings) {
        try {
          await dataService.saveSettings(backupData.settings)
        } catch (error) {
          restored.errors.push(`Failed to restore settings: ${error.message}`)
        }
      }

      console.log(`📥 Backup restored: ${restored.projects} projects, ${restored.tasks} tasks`)
      return restored

    } catch (error) {
      console.error('❌ Failed to restore backup:', error)
      throw new Error(`Restore failed: ${error.message}`)
    }
  }

  /**
   * Delete old backups (Electron mode only)
   */
  async cleanupOldBackups() {
    if (this.browserMode) return

    try {
      const backups = await this.listBackups()
      
      if (backups.length > this.maxBackups) {
        const backupsToDelete = backups.slice(this.maxBackups)
        
        for (const backup of backupsToDelete) {
          await fs.remove(backup.path)
          console.log(`🗑️ Deleted old backup: ${backup.name}`)
        }
      }

    } catch (error) {
      console.error('❌ Failed to cleanup old backups:', error)
    }
  }

  // =============================================================================
  // EXPORT OPERATIONS
  // =============================================================================

  /**
   * Export a project to various formats
   */
  async exportProject(projectId, format = 'json', options = {}) {
    try {
      const project = await dataService.loadProject(projectId)
      const tasks = await dataService.loadTasks(projectId)
      
      const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss')
      const fileName = sanitize(`${project.name}-${timestamp}`)
      
      let exportData, result

      switch (format.toLowerCase()) {
        case 'json':
          exportData = {
            metadata: {
              exportedAt: new Date().toISOString(),
              exportFormat: 'json',
              version: '1.0.0'
            },
            project,
            tasks
          }

          if (this.browserMode) {
            // Browser mode: trigger download
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${fileName}.json`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)

            result = {
              fileName: `${fileName}.json`,
              format,
              size: blob.size,
              mode: 'browser'
            }
          } else {
            // Electron mode: save to file system
            const filePath = path.join(dataService.exportsPath, `${fileName}.json`)
            await fs.writeJson(filePath, exportData, { spaces: 2 })
            
            result = {
              filePath,
              format,
              size: (await fs.stat(filePath)).size,
              mode: 'electron'
            }
          }
          break

        case 'markdown':
          exportData = this.generateMarkdownExport(project, tasks)
          
          if (this.browserMode) {
            // Browser mode: trigger download
            const blob = new Blob([exportData], { type: 'text/markdown' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${fileName}.md`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)

            result = {
              fileName: `${fileName}.md`,
              format,
              size: blob.size,
              mode: 'browser'
            }
          } else {
            // Electron mode: save to file system
            const filePath = path.join(dataService.exportsPath, `${fileName}.md`)
            await fs.writeFile(filePath, exportData, 'utf8')
            
            result = {
              filePath,
              format,
              size: (await fs.stat(filePath)).size,
              mode: 'electron'
            }
          }
          break

        default:
          throw new Error(`Unsupported export format: ${format}`)
      }

      console.log(`📤 Project exported: ${project.name} (${format})`)
      return result

    } catch (error) {
      console.error('❌ Failed to export project:', error)
      throw new Error(`Export failed: ${error.message}`)
    }
  }

  /**
   * Generate Markdown export format
   */
  generateMarkdownExport(project, tasks) {
    const lines = [
      `# ${project.name}`,
      '',
      project.description ? `${project.description}` : '',
      '',
      '## Project Details',
      '',
      `- **Status:** ${project.status}`,
      `- **Mode:** ${project.mode}`,
      `- **Priority:** ${project.metadata.priority}`,
      `- **Created:** ${moment(project.createdAt).format('MMMM Do YYYY')}`,
      `- **Last Updated:** ${moment(project.updatedAt).format('MMMM Do YYYY')}`,
      ''
    ]

    if (project.metadata.tags.length > 0) {
      lines.push(`- **Tags:** ${project.metadata.tags.join(', ')}`)
      lines.push('')
    }

    if (project.metadata.deadline) {
      lines.push(`- **Deadline:** ${moment(project.metadata.deadline).format('MMMM Do YYYY')}`)
      lines.push('')
    }

    // Group tasks by status
    const tasksByStatus = tasks.reduce((groups, task) => {
      if (!groups[task.status]) {
        groups[task.status] = []
      }
      groups[task.status].push(task)
      return groups
    }, {})

    // Export tasks by status
    const statusOrder = ['todo', 'in-progress', 'done', 'blocked']
    const statusLabels = {
      'todo': 'To Do',
      'in-progress': 'In Progress',
      'done': 'Completed',
      'blocked': 'Blocked'
    }

    for (const status of statusOrder) {
      if (tasksByStatus[status] && tasksByStatus[status].length > 0) {
        lines.push(`## ${statusLabels[status]}`)
        lines.push('')

        for (const task of tasksByStatus[status]) {
          lines.push(`### ${task.title}`)
          
          if (task.content) {
            lines.push('')
            lines.push(task.content)
          }
          
          lines.push('')
          lines.push(`- **Type:** ${task.type}`)
          lines.push(`- **Priority:** ${task.metadata.priority}`)
          
          if (task.metadata.tags.length > 0) {
            lines.push(`- **Tags:** ${task.metadata.tags.join(', ')}`)
          }
          
          lines.push(`- **Created:** ${moment(task.createdAt).format('MMMM Do YYYY')}`)
          lines.push('')
        }
      }
    }

    lines.push('---')
    lines.push(`*Exported from Projiki on ${moment().format('MMMM Do YYYY, h:mm:ss a')}*`)

    return lines.join('\n')
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Calculate directory size recursively (Electron mode only)
   */
  async getDirectorySize(dirPath) {
    if (this.browserMode) return 0

    try {
      let totalSize = 0
      const files = await fs.readdir(dirPath)

      for (const file of files) {
        const filePath = path.join(dirPath, file)
        const stats = await fs.stat(filePath)

        if (stats.isDirectory()) {
          totalSize += await this.getDirectorySize(filePath)
        } else {
          totalSize += stats.size
        }
      }

      return totalSize
    } catch (error) {
      return 0
    }
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }
}

// Export singleton instance
const backupService = new BackupService()
export default backupService