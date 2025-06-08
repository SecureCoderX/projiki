// src/renderer/stores/useProjectStore.js
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { v4 as uuidv4 } from 'uuid'
import useAppStore from './useAppStore'
import DataService from '../services/DataService'

const useProjectStore = create()(
  devtools(
    immer((set, get) => ({
      // Project state
      projects: [],
      currentProject: null,
      loadingProjects: false,
      projectsError: null,
      
      // Project templates
      templates: [
        {
          id: 'web-app',
          name: 'Web Application',
          description: 'Full-stack web application project',
          defaultMode: 'structured',
          defaultTasks: [
            { title: 'Set up development environment', type: 'task' },
            { title: 'Create project structure', type: 'task' },
            { title: 'Implement core features', type: 'task' },
          ]
        },
        {
          id: 'creative-project',
          name: 'Creative Project',
          description: 'Open-ended creative development',
          defaultMode: 'creative',
          defaultTasks: [
            { title: 'Brainstorm ideas', type: 'idea' },
            { title: 'Create initial prototype', type: 'task' },
          ]
        }
      ],
      
      // Actions
      setLoadingProjects: (loading) =>
        set((state) => {
          state.loadingProjects = loading
        }),
        
      setProjectsError: (error) =>
        set((state) => {
          state.projectsError = error
        }),
        
      setProjects: (projects) =>
        set((state) => {
          state.projects = projects
          state.loadingProjects = false
          state.projectsError = null
        }),
        
      createProject: async (projectData) => {
        const newProject = {
          id: uuidv4(),
          name: projectData.name || 'Untitled Project',
          description: projectData.description || '',
          mode: projectData.mode || 'structured',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          settings: {
            defaultView: projectData.defaultView || 'kanban',
            autoSave: true,
            syncFrequency: 30000, // 30 seconds
            ...projectData.settings
          },
          metadata: {
            tags: projectData.tags || [],
            priority: projectData.priority || 'medium',
            deadline: projectData.deadline || null,
            estimatedHours: projectData.estimatedHours || null,
            ...projectData.metadata
          }
        }
        
        try {
          // Save to DataService first
          await DataService.saveProject(newProject)
          
          // Then update store
          set((state) => {
            state.projects.push(newProject)
            state.currentProject = newProject
          })
          
          // Update app store
          useAppStore.getState().setCurrentProject(newProject)
          useAppStore.getState().addNotification({
            type: 'success',
            title: 'Project Created',
            message: `Project "${newProject.name}" has been created successfully.`
          })
          
          console.log('✅ Project created and saved:', newProject.name)
          return newProject
          
        } catch (error) {
          console.error('❌ Failed to create project:', error)
          useAppStore.getState().addNotification({
            type: 'error',
            title: 'Project Creation Failed',
            message: `Failed to create project: ${error.message}`
          })
          throw error
        }
      },
        
      updateProject: async (projectId, updates) => {
        try {
          const projectIndex = get().projects.findIndex(p => p.id === projectId)
          
          if (projectIndex !== -1) {
            const updatedProject = {
              ...get().projects[projectIndex],
              ...updates,
              updatedAt: new Date().toISOString()
            }
            
            // Save to DataService first
            await DataService.saveProject(updatedProject)
            
            // Then update store
            set((state) => {
              state.projects[projectIndex] = updatedProject
              
              // Update current project if it's the one being updated
              if (state.currentProject?.id === projectId) {
                state.currentProject = updatedProject
                useAppStore.getState().setCurrentProject(updatedProject)
              }
            })
            
            useAppStore.getState().updateLastSaved()
            console.log('✅ Project updated and saved:', updatedProject.name)
            
          }
        } catch (error) {
          console.error('❌ Failed to update project:', error)
          useAppStore.getState().addNotification({
            type: 'error',
            title: 'Update Failed',
            message: `Failed to update project: ${error.message}`
          })
          throw error
        }
      },
        
      deleteProject: async (projectId) => {
        try {
          const projectToDelete = get().projects.find(p => p.id === projectId)
          
          if (projectToDelete) {
            // Delete from DataService first
            await DataService.deleteProject(projectId)
            
            // Then update store
            set((state) => {
              state.projects = state.projects.filter(p => p.id !== projectId)
              
              // Clear current project if it's the one being deleted
              if (state.currentProject?.id === projectId) {
                state.currentProject = null
                useAppStore.getState().setCurrentProject(null)
              }
            })
            
            useAppStore.getState().addNotification({
              type: 'info',
              title: 'Project Deleted',
              message: `Project "${projectToDelete.name}" has been deleted.`
            })
            
            console.log('✅ Project deleted:', projectToDelete.name)
          }
        } catch (error) {
          console.error('❌ Failed to delete project:', error)
          useAppStore.getState().addNotification({
            type: 'error',
            title: 'Delete Failed',
            message: `Failed to delete project: ${error.message}`
          })
          throw error
        }
      },
        
      setCurrentProject: (project) =>
        set((state) => {
          state.currentProject = project
          useAppStore.getState().setCurrentProject(project)
        }),
        
      duplicateProject: async (projectId) => {
        try {
          const originalProject = get().projects.find(p => p.id === projectId)
          
          if (originalProject) {
            const duplicatedProject = {
              ...originalProject,
              id: uuidv4(),
              name: `${originalProject.name} (Copy)`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
            
            // Save to DataService first
            await DataService.saveProject(duplicatedProject)
            
            // Then update store
            set((state) => {
              state.projects.push(duplicatedProject)
            })
            
            useAppStore.getState().addNotification({
              type: 'success',
              title: 'Project Duplicated',
              message: `Project "${duplicatedProject.name}" has been created.`
            })
            
            console.log('✅ Project duplicated:', duplicatedProject.name)
            return duplicatedProject
          }
        } catch (error) {
          console.error('❌ Failed to duplicate project:', error)
          useAppStore.getState().addNotification({
            type: 'error',
            title: 'Duplicate Failed',
            message: `Failed to duplicate project: ${error.message}`
          })
          throw error
        }
      },
        
      archiveProject: async (projectId) => {
        await get().updateProject(projectId, { status: 'archived' })
      },
        
      unarchiveProject: async (projectId) => {
        await get().updateProject(projectId, { status: 'active' })
      },
        
      // Getters and computed values
      getActiveProjects: () => get().projects.filter(p => p.status === 'active'),
      
      getArchivedProjects: () => get().projects.filter(p => p.status === 'archived'),
      
      getCompletedProjects: () => get().projects.filter(p => p.status === 'completed'),
      
      getProjectsByTag: (tag) => get().projects.filter(p => p.metadata.tags.includes(tag)),
      
      getProjectsByMode: (mode) => get().projects.filter(p => p.mode === mode),
      
      getRecentProjects: (limit = 5) => {
        return get().projects
          .filter(p => p.status === 'active')
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          .slice(0, limit)
      },
      
      getAllTags: () => {
        const allTags = get().projects.flatMap(p => p.metadata.tags)
        return [...new Set(allTags)].sort()
      },
      
      getProjectStats: () => {
        const projects = get().projects
        return {
          total: projects.length,
          active: projects.filter(p => p.status === 'active').length,
          completed: projects.filter(p => p.status === 'completed').length,
          archived: projects.filter(p => p.status === 'archived').length,
          paused: projects.filter(p => p.status === 'paused').length,
        }
      },
      
      // Template operations
      createProjectFromTemplate: async (templateId, customData = {}) => {
        const template = get().templates.find(t => t.id === templateId)
        
        if (template) {
          const projectData = {
            name: customData.name || template.name,
            description: customData.description || template.description,
            mode: template.defaultMode,
            ...customData
          }
          
          return await get().createProject(projectData)
        }
      },
        
      // Load projects from DataService
      loadProjects: async () => {
        set((state) => {
          state.loadingProjects = true
          state.projectsError = null
        })
        
        try {
          console.log('📂 Loading projects from storage...')
          const projects = await DataService.loadAllProjects()
          
          set((state) => {
            state.projects = projects
            state.loadingProjects = false
            state.projectsError = null
          })
          
          console.log(`✅ Loaded ${projects.length} projects`)
          return projects
          
        } catch (error) {
          console.error('❌ Failed to load projects:', error)
          set((state) => {
            state.loadingProjects = false
            state.projectsError = error.message
          })
          
          useAppStore.getState().addNotification({
            type: 'error',
            title: 'Load Failed',
            message: `Failed to load projects: ${error.message}`
          })
          
          throw error
        }
      },
      
      // Save individual project
      saveProject: async (project) => {
        try {
          await DataService.saveProject(project)
          useAppStore.getState().updateLastSaved()
          console.log('✅ Project saved:', project.name)
        } catch (error) {
          console.error('❌ Failed to save project:', error)
          useAppStore.getState().addNotification({
            type: 'error',
            title: 'Save Failed',
            message: `Failed to save project: ${error.message}`
          })
          throw error
        }
      },
      
      // Initialize store - load projects on app start
      initialize: async () => {
        try {
          await get().loadProjects()
        } catch (error) {
          console.error('❌ Failed to initialize project store:', error)
        }
      },
    })),
    {
      name: 'project-store',
    }
  )
)

export default useProjectStore