// src/renderer/stores/useChangelogStore.js
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { v4 as uuidv4 } from 'uuid'
import useAppStore from './useAppStore'
import DataService from '../services/DataService'

const useChangelogStore = create()(
  devtools(
    immer((set, get) => ({
      // Changelog state
      changelogs: [],
      loadingChangelogs: false,
      changelogsError: null,
      
      // Actions
      setLoadingChangelogs: (loading) =>
        set((state) => {
          state.loadingChangelogs = loading
        }),
        
      setChangelogsError: (error) =>
        set((state) => {
          state.changelogsError = error
        }),
        
      setChangelogs: (changelogs) =>
        set((state) => {
          state.changelogs = changelogs
          state.loadingChangelogs = false
          state.changelogsError = null
        }),
        
      createChangelog: async (changelogData) => {
        console.log('📋 STORE DEBUG: createChangelog called with:', changelogData);
        
        if (!changelogData.projectId) {
          console.log('📋 STORE DEBUG: No projectId provided in changelogData');
          useAppStore.getState().addNotification({
            type: 'error',
            title: 'Missing Project ID',
            message: 'Changelog must be associated with a project.'
          });
          throw new Error('Project ID is required');
        }

        const newChangelog = {
          id: uuidv4(),
          projectId: changelogData.projectId,
          version: changelogData.version || '1.0.0',
          releaseDate: changelogData.releaseDate || new Date().toISOString(),
          status: changelogData.status || 'draft', // draft, published, archived
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          
          // Change entries
          changes: changelogData.changes || [
            {
              id: uuidv4(),
              category: 'feature', // feature, bugfix, improvement, breaking, deprecated
              description: '',
              linkedTasks: [], // array of task IDs
              impact: 'minor' // major, minor, patch
            }
          ],
          
          // Release notes and metadata
          releaseNotes: changelogData.releaseNotes || '',
          tags: changelogData.tags || [],
          createdBy: changelogData.createdBy || '',
          publishedBy: changelogData.publishedBy || '',
          publishedAt: changelogData.publishedAt || null,
          
          // Export settings
          exportFormats: changelogData.exportFormats || ['json', 'markdown'],
          githubRelease: changelogData.githubRelease || false,
          
          // Additional metadata
          metadata: {
            breakingChanges: changelogData.metadata?.breakingChanges || false,
            securityUpdate: changelogData.metadata?.securityUpdate || false,
            hotfix: changelogData.metadata?.hotfix || false,
            prerelease: changelogData.metadata?.prerelease || false,
            ...changelogData.metadata
          }
        };

        console.log('📋 STORE DEBUG: New changelog object created:', newChangelog);

        try {
          // Save changelog to DataService
          console.log('📋 STORE DEBUG: Calling DataService.saveChangelog...');
          await DataService.saveChangelog(newChangelog);
          console.log('📋 STORE DEBUG: DataService.saveChangelog completed');

          // Update store
          console.log('📋 STORE DEBUG: Updating store state...');
          set((state) => {
            console.log('📋 STORE DEBUG: Current changelogs in store:', state.changelogs.length);
            state.changelogs.push(newChangelog);
            console.log('📋 STORE DEBUG: Changelogs after adding:', state.changelogs.length);
          });

          useAppStore.getState().addNotification({
            type: 'success',
            title: 'Changelog Created',
            message: `Changelog v${newChangelog.version} has been created.`
          });

          useAppStore.getState().updateLastSaved();
          console.log('✅ Changelog created and saved:', newChangelog.version);
          return newChangelog;

        } catch (error) {
          console.error('❌ Failed to create changelog:', error);
          useAppStore.getState().addNotification({
            type: 'error',
            title: 'Creation Failed',
            message: `Failed to create changelog: ${error.message}`
          });
          throw error;
        }
      },

      updateChangelog: async (changelogId, updates) => {
        try {
          console.log('🔄 Updating changelog:', changelogId, 'with updates:', updates);
          
          const changelogToUpdate = get().changelogs.find(c => c.id === changelogId)
          if (!changelogToUpdate) {
            throw new Error('Changelog not found')
          }
          
          const updatedChangelog = {
            ...changelogToUpdate,
            ...updates,
            updatedAt: new Date().toISOString(),
            
            // Handle publishing
            ...(updates.status === 'published' && {
              publishedAt: new Date().toISOString(),
              publishedBy: updates.publishedBy || changelogToUpdate.publishedBy
            }),
            
            // Merge changes array properly
            changes: updates.changes || changelogToUpdate.changes,
            
            // Merge metadata
            metadata: {
              ...changelogToUpdate.metadata,
              ...updates.metadata
            }
          }
          
          console.log('🔄 Updated changelog object:', updatedChangelog);
          
          // Update in DataService
          await DataService.saveChangelog(updatedChangelog)
          console.log('🔄 DataService.saveChangelog completed');
          
          // Update store
          set((state) => {
            const index = state.changelogs.findIndex(c => c.id === changelogId)
            if (index !== -1) {
              state.changelogs[index] = updatedChangelog
              console.log('🔄 Changelog updated in store at index:', index);
            } else {
              console.log('❌ Changelog not found in store for update');
            }
          })
          
          useAppStore.getState().addNotification({
            type: 'success',
            title: 'Changelog Updated',
            message: `Changelog v${updatedChangelog.version} has been updated.`
          })
          
          useAppStore.getState().updateLastSaved()
          console.log('✅ Changelog updated:', updatedChangelog.version)
          return updatedChangelog
          
        } catch (error) {
          console.error('❌ Failed to update changelog:', error)
          useAppStore.getState().addNotification({
            type: 'error',
            title: 'Update Failed',
            message: `Failed to update changelog: ${error.message}`
          })
          throw error
        }
      },
        
      deleteChangelog: async (changelogId) => {
        try {
          console.log('🗑️ Starting delete for changelog:', changelogId);
          
          const changelogToDelete = get().changelogs.find(c => c.id === changelogId)
          
          if (!changelogToDelete) {
            console.log('❌ Changelog not found for deletion:', changelogId);
            throw new Error('Changelog not found');
          }
          
          console.log('🗑️ Found changelog to delete:', changelogToDelete.version);
          
          // Delete from DataService
          await DataService.deleteChangelog(changelogId)
          console.log('🗑️ DataService.deleteChangelog completed');
          
          // Update store
          set((state) => {
            state.changelogs = state.changelogs.filter(c => c.id !== changelogId)
            console.log('🗑️ Store updated, new changelog count:', state.changelogs.length);
          })
          
          useAppStore.getState().addNotification({
            type: 'info',
            title: 'Changelog Deleted',
            message: `Changelog v${changelogToDelete.version} has been deleted.`
          })
          
          useAppStore.getState().updateLastSaved()
          console.log('✅ Changelog deleted successfully:', changelogToDelete.version)
          
        } catch (error) {
          console.error('❌ Failed to delete changelog:', error)
          useAppStore.getState().addNotification({
            type: 'error',
            title: 'Delete Failed',
            message: `Failed to delete changelog: ${error.message}`
          })
          throw error
        }
      },

      duplicateChangelog: async (changelogId) => {
        try {
          const originalChangelog = get().changelogs.find(c => c.id === changelogId)
          
          if (originalChangelog) {
            // Increment version for duplicate
            const versionParts = originalChangelog.version.split('.')
            const patchVersion = parseInt(versionParts[2] || 0) + 1
            const newVersion = `${versionParts[0]}.${versionParts[1]}.${patchVersion}`
            
            const duplicatedChangelog = {
              ...originalChangelog,
              id: uuidv4(),
              version: newVersion,
              status: 'draft',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              publishedAt: null,
              publishedBy: '',
              changes: originalChangelog.changes.map(change => ({
                ...change,
                id: uuidv4()
              }))
            }
            
            // Save to DataService
            await DataService.saveChangelog(duplicatedChangelog)
            
            // Update store
            set((state) => {
              state.changelogs.push(duplicatedChangelog)
            })
            
            useAppStore.getState().addNotification({
              type: 'success',
              title: 'Changelog Duplicated',
              message: `Changelog v${duplicatedChangelog.version} has been created.`
            })
            
            console.log('✅ Changelog duplicated:', duplicatedChangelog.version)
            return duplicatedChangelog
          }
        } catch (error) {
          console.error('❌ Failed to duplicate changelog:', error)
          useAppStore.getState().addNotification({
            type: 'error',
            title: 'Duplicate Failed',
            message: `Failed to duplicate changelog: ${error.message}`
          })
          throw error
        }
      },

      publishChangelog: async (changelogId, publishedBy) => {
        await get().updateChangelog(changelogId, { 
          status: 'published',
          publishedBy,
          publishedAt: new Date().toISOString()
        })
      },

      archiveChangelog: async (changelogId) => {
        await get().updateChangelog(changelogId, { status: 'archived' })
      },

      // Change management within a changelog
      addChangeToChangelog: async (changelogId, changeData) => {
        const changelog = get().changelogs.find(c => c.id === changelogId)
        if (changelog) {
          const newChange = {
            id: uuidv4(),
            category: changeData.category || 'feature',
            description: changeData.description || '',
            linkedTasks: changeData.linkedTasks || [],
            impact: changeData.impact || 'minor'
          }
          
          const updatedChanges = [...changelog.changes, newChange]
          await get().updateChangelog(changelogId, { changes: updatedChanges })
        }
      },

      updateChangeInChangelog: async (changelogId, changeId, changeUpdates) => {
        const changelog = get().changelogs.find(c => c.id === changelogId)
        if (changelog) {
          const updatedChanges = changelog.changes.map(change => 
            change.id === changeId 
              ? { ...change, ...changeUpdates }
              : change
          )
          await get().updateChangelog(changelogId, { changes: updatedChanges })
        }
      },

      removeChangeFromChangelog: async (changelogId, changeId) => {
        const changelog = get().changelogs.find(c => c.id === changelogId)
        if (changelog) {
          const updatedChanges = changelog.changes.filter(change => change.id !== changeId)
          await get().updateChangelog(changelogId, { changes: updatedChanges })
        }
      },
        
      // Getters and computed values
      getCurrentProjectChangelogs: () => {
        const currentProject = useAppStore.getState().currentProject
        if (!currentProject) return []
        
        return get().changelogs.filter(c => c.projectId === currentProject.id)
      },
      
      getChangelogsByProject: (projectId) => {
        return get().changelogs.filter(c => c.projectId === projectId)
      },

      getChangelogsByStatus: (status) => {
        return get().changelogs.filter(c => c.status === status)
      },

      getPublishedChangelogs: () => {
        return get().changelogs.filter(c => c.status === 'published')
      },

      getDraftChangelogs: () => {
        return get().changelogs.filter(c => c.status === 'draft')
      },

      getChangelogStats: () => {
        const changelogs = get().changelogs
        return {
          total: changelogs.length,
          published: changelogs.filter(c => c.status === 'published').length,
          draft: changelogs.filter(c => c.status === 'draft').length,
          archived: changelogs.filter(c => c.status === 'archived').length,
        }
      },

      getLatestVersionForProject: (projectId) => {
        const projectChangelogs = get().getChangelogsByProject(projectId)
        if (projectChangelogs.length === 0) return '0.0.0'
        
        // Sort by version and get the latest
        const sortedChangelogs = [...projectChangelogs].sort((a, b) => {
          const aVersion = a.version.split('.').map(Number)
          const bVersion = b.version.split('.').map(Number)
          
          for (let i = 0; i < 3; i++) {
            if (aVersion[i] !== bVersion[i]) {
              return bVersion[i] - aVersion[i]
            }
          }
          return 0
        })
        
        return sortedChangelogs[0]?.version || '0.0.0'
      },

      suggestNextVersion: (projectId, impactLevel = 'minor') => {
        const latestVersion = get().getLatestVersionForProject(projectId)
        const versionParts = latestVersion.split('.').map(Number)
        
        switch (impactLevel) {
          case 'major':
            return `${versionParts[0] + 1}.0.0`
          case 'minor':
            return `${versionParts[0]}.${versionParts[1] + 1}.0`
          case 'patch':
            return `${versionParts[0]}.${versionParts[1]}.${versionParts[2] + 1}`
          default:
            return `${versionParts[0]}.${versionParts[1]}.${versionParts[2] + 1}`
        }
      },

      // Export functionality
      exportChangelog: async (changelogId, format = 'markdown') => {
        const changelog = get().changelogs.find(c => c.id === changelogId)
        if (!changelog) {
          throw new Error('Changelog not found')
        }

        try {
          let exportData
          
          switch (format) {
            case 'markdown':
              exportData = get().generateMarkdownExport(changelog)
              break
            case 'json':
              exportData = JSON.stringify(changelog, null, 2)
              break
            case 'html':
              exportData = get().generateHTMLExport(changelog)
              break
            default:
              throw new Error(`Unsupported export format: ${format}`)
          }

          // Create download
          const blob = new Blob([exportData], { 
            type: format === 'json' ? 'application/json' : 'text/plain' 
          })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `changelog-v${changelog.version}.${format === 'markdown' ? 'md' : format}`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)

          useAppStore.getState().addNotification({
            type: 'success',
            title: 'Export Complete',
            message: `Changelog exported as ${format.toUpperCase()}.`
          })

          return exportData
        } catch (error) {
          console.error('❌ Failed to export changelog:', error)
          useAppStore.getState().addNotification({
            type: 'error',
            title: 'Export Failed',
            message: `Failed to export changelog: ${error.message}`
          })
          throw error
        }
      },

      generateMarkdownExport: (changelog) => {
        const date = new Date(changelog.releaseDate).toLocaleDateString()
        let markdown = `# Changelog v${changelog.version}\n\n`
        markdown += `**Release Date**: ${date}\n`
        markdown += `**Status**: ${changelog.status}\n\n`
        
        if (changelog.releaseNotes) {
          markdown += `## Release Notes\n\n${changelog.releaseNotes}\n\n`
        }
        
        markdown += `## Changes\n\n`
        
        const changesByCategory = changelog.changes.reduce((acc, change) => {
          if (!acc[change.category]) acc[change.category] = []
          acc[change.category].push(change)
          return acc
        }, {})
        
        Object.entries(changesByCategory).forEach(([category, changes]) => {
          const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1)
          markdown += `### ${categoryTitle}\n\n`
          
          changes.forEach(change => {
            markdown += `- ${change.description}`
            if (change.linkedTasks.length > 0) {
              markdown += ` (Tasks: ${change.linkedTasks.join(', ')})`
            }
            markdown += '\n'
          })
          
          markdown += '\n'
        })
        
        return markdown
      },

      generateHTMLExport: (changelog) => {
        const date = new Date(changelog.releaseDate).toLocaleDateString()
        let html = `<!DOCTYPE html>
<html>
<head>
    <title>Changelog v${changelog.version}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #2563eb; }
        h2, h3 { color: #374151; }
        .meta { background: #f3f4f6; padding: 10px; border-radius: 8px; margin: 20px 0; }
        .change { margin: 5px 0; }
        .tasks { color: #6b7280; font-size: 0.9em; }
    </style>
</head>
<body>
    <h1>Changelog v${changelog.version}</h1>
    <div class="meta">
        <strong>Release Date:</strong> ${date}<br>
        <strong>Status:</strong> ${changelog.status}
    </div>`
        
        if (changelog.releaseNotes) {
          html += `<h2>Release Notes</h2><p>${changelog.releaseNotes}</p>`
        }
        
        html += `<h2>Changes</h2>`
        
        const changesByCategory = changelog.changes.reduce((acc, change) => {
          if (!acc[change.category]) acc[change.category] = []
          acc[change.category].push(change)
          return acc
        }, {})
        
        Object.entries(changesByCategory).forEach(([category, changes]) => {
          const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1)
          html += `<h3>${categoryTitle}</h3><ul>`
          
          changes.forEach(change => {
            html += `<li class="change">${change.description}`
            if (change.linkedTasks.length > 0) {
              html += ` <span class="tasks">(Tasks: ${change.linkedTasks.join(', ')})</span>`
            }
            html += '</li>'
          })
          
          html += '</ul>'
        })
        
        html += '</body></html>'
        return html
      },
      
      // Load changelogs from DataService
      loadChangelogs: async () => {
        set((state) => {
          state.loadingChangelogs = true
          state.changelogsError = null
        })
        
        try {
          console.log('📋 Loading changelogs from storage...')
          const changelogs = await DataService.loadAllChangelogs()
          
          set((state) => {
            state.changelogs = changelogs
            state.loadingChangelogs = false
            state.changelogsError = null
          })
          
          console.log(`✅ Loaded ${changelogs.length} changelogs`)
          return changelogs
          
        } catch (error) {
          console.error('❌ Failed to load changelogs:', error)
          set((state) => {
            state.loadingChangelogs = false
            state.changelogsError = error.message
          })
          
          useAppStore.getState().addNotification({
            type: 'error',
            title: 'Load Failed',
            message: `Failed to load changelogs: ${error.message}`
          })
          
          throw error
        }
      },
      
      // Save individual changelog
      saveChangelog: async (changelog) => {
        try {
          await DataService.saveChangelog(changelog)
          useAppStore.getState().updateLastSaved()
          console.log('✅ Changelog saved:', changelog.version)
        } catch (error) {
          console.error('❌ Failed to save changelog:', error)
          useAppStore.getState().addNotification({
            type: 'error',
            title: 'Save Failed',
            message: `Failed to save changelog: ${error.message}`
          })
          throw error
        }
      },
      
      // Initialize store - load changelogs on app start
      initialize: async () => {
        try {
          await get().loadChangelogs()
        } catch (error) {
          console.error('❌ Failed to initialize changelog store:', error)
        }
      },
    })),
    {
      name: 'changelog-store',
    }
  )
)

export default useChangelogStore