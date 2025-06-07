// src/renderer/stores/useProjectStore.js
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { v4 as uuidv4 } from 'uuid'
import useAppStore from './useAppStore'

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
        
      createProject: (projectData) =>
        set((state) => {
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
          
          state.projects.push(newProject)
          state.currentProject = newProject
          
          // Update app store
          useAppStore.getState().setCurrentProject(newProject)
          useAppStore.getState().addNotification({
            type: 'success',
            title: 'Project Created',
            message: `Project "${newProject.name}" has been created successfully.`
          })
        }),
        
      updateProject: (projectId, updates) =>
        set((state) => {
          const projectIndex = state.projects.findIndex(p => p.id === projectId)
          
          if (projectIndex !== -1) {
            const updatedProject = {
              ...state.projects[projectIndex],
              ...updates,
              updatedAt: new Date().toISOString()
            }
            
            state.projects[projectIndex] = updatedProject
            
            // Update current project if it's the one being updated
            if (state.currentProject?.id === projectId) {
              state.currentProject = updatedProject
              useAppStore.getState().setCurrentProject(updatedProject)
            }
            
            useAppStore.getState().updateLastSaved()
          }
        }),
        
      deleteProject: (projectId) =>
        set((state) => {
          const projectToDelete = state.projects.find(p => p.id === projectId)
          
          if (projectToDelete) {
            state.projects = state.projects.filter(p => p.id !== projectId)
            
            // Clear current project if it's the one being deleted
            if (state.currentProject?.id === projectId) {
              state.currentProject = null
              useAppStore.getState().setCurrentProject(null)
            }
            
            useAppStore.getState().addNotification({
              type: 'info',
              title: 'Project Deleted',
              message: `Project "${projectToDelete.name}" has been deleted.`
            })
          }
        }),
        
      setCurrentProject: (project) =>
        set((state) => {
          state.currentProject = project
          useAppStore.getState().setCurrentProject(project)
        }),
        
      duplicateProject: (projectId) =>
        set((state) => {
          const originalProject = state.projects.find(p => p.id === projectId)
          
          if (originalProject) {
            const duplicatedProject = {
              ...originalProject,
              id: uuidv4(),
              name: `${originalProject.name} (Copy)`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
            
            state.projects.push(duplicatedProject)
            
            useAppStore.getState().addNotification({
              type: 'success',
              title: 'Project Duplicated',
              message: `Project "${duplicatedProject.name}" has been created.`
            })
          }
        }),
        
      archiveProject: (projectId) =>
        set((state) => {
          get().updateProject(projectId, { status: 'archived' })
        }),
        
      unarchiveProject: (projectId) =>
        set((state) => {
          get().updateProject(projectId, { status: 'active' })
        }),
        
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
      createProjectFromTemplate: (templateId, customData = {}) =>
        set((state) => {
          const template = state.templates.find(t => t.id === templateId)
          
          if (template) {
            const projectData = {
              name: customData.name || template.name,
              description: customData.description || template.description,
              mode: template.defaultMode,
              ...customData
            }
            
            get().createProject(projectData)
          }
        }),
        
      // Async operations placeholders (will be implemented with DataService)
      loadProjects: async () => {
        set((state) => {
          state.loadingProjects = true
          state.projectsError = null
        })
        
        try {
          // TODO: Implement with DataService in next step
          // const projects = await DataService.loadAllProjects()
          // get().setProjects(projects)
          
          // For now, just clear loading state
          set((state) => {
            state.loadingProjects = false
          })
        } catch (error) {
          set((state) => {
            state.loadingProjects = false
            state.projectsError = error.message
          })
        }
      },
      
      saveProject: async (project) => {
        try {
          // TODO: Implement with DataService in next step
          // await DataService.saveProject(project)
          useAppStore.getState().updateLastSaved()
        } catch (error) {
          useAppStore.getState().addNotification({
            type: 'error',
            title: 'Save Failed',
            message: `Failed to save project: ${error.message}`
          })
        }
      },
    })),
    {
      name: 'project-store',
    }
  )
)

export default useProjectStore