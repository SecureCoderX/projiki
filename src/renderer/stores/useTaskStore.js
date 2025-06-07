// src/renderer/stores/useTaskStore.js
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { v4 as uuidv4 } from 'uuid'
import useAppStore from './useAppStore'

const useTaskStore = create()(
  devtools(
    immer((set, get) => ({
      // Task state
      tasks: [],
      selectedTasks: [],
      loadingTasks: false,
      tasksError: null,
      
      // Task view state
      currentView: 'kanban', // 'kanban' | 'timeline' | 'list' | 'creative'
      groupBy: 'status', // 'status' | 'priority' | 'assignee' | 'tag'
      sortBy: 'updatedAt', // 'createdAt' | 'updatedAt' | 'priority' | 'title'
      sortOrder: 'desc', // 'asc' | 'desc'
      
      // Filter state
      statusFilter: [], // Empty means all statuses
      priorityFilter: [],
      tagFilter: [],
      
      // Actions
      setLoadingTasks: (loading) =>
        set((state) => {
          state.loadingTasks = loading
        }),
        
      setTasksError: (error) =>
        set((state) => {
          state.tasksError = error
        }),
        
      setTasks: (tasks) =>
        set((state) => {
          state.tasks = tasks
          state.loadingTasks = false
          state.tasksError = null
        }),
        
      createTask: (taskData) =>
        set((state) => {
          const currentProject = useAppStore.getState().currentProject
          
          if (!currentProject) {
            useAppStore.getState().addNotification({
              type: 'error',
              title: 'No Project Selected',
              message: 'Please select a project before creating tasks.'
            })
            return
          }
          
          const newTask = {
            id: uuidv4(),
            projectId: currentProject.id,
            title: taskData.title || 'Untitled Task',
            content: taskData.content || '',
            type: taskData.type || 'task', // 'task' | 'note' | 'snippet' | 'idea'
            status: taskData.status || 'todo',
            mode: taskData.mode || currentProject.mode,
            position: taskData.position || { x: 0, y: 0 },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            metadata: {
              tags: taskData.tags || [],
              priority: taskData.priority || 'medium',
              estimatedTime: taskData.estimatedTime || null,
              actualTime: taskData.actualTime || null,
              dependencies: taskData.dependencies || [],
              assignee: taskData.assignee || null,
              ...taskData.metadata
            }
          }
          
          state.tasks.push(newTask)
          
          useAppStore.getState().addNotification({
            type: 'success',
            title: 'Task Created',
            message: `Task "${newTask.title}" has been created.`
          })
          
          useAppStore.getState().updateLastSaved()
        }),
        
      updateTask: (taskId, updates) =>
        set((state) => {
          const taskIndex = state.tasks.findIndex(t => t.id === taskId)
          
          if (taskIndex !== -1) {
            const updatedTask = {
              ...state.tasks[taskIndex],
              ...updates,
              updatedAt: new Date().toISOString()
            }
            
            state.tasks[taskIndex] = updatedTask
            useAppStore.getState().updateLastSaved()
          }
        }),
        
      deleteTask: (taskId) =>
        set((state) => {
          const taskToDelete = state.tasks.find(t => t.id === taskId)
          
          if (taskToDelete) {
            state.tasks = state.tasks.filter(t => t.id !== taskId)
            state.selectedTasks = state.selectedTasks.filter(id => id !== taskId)
            
            useAppStore.getState().addNotification({
              type: 'info',
              title: 'Task Deleted',
              message: `Task "${taskToDelete.title}" has been deleted.`
            })
            
            useAppStore.getState().updateLastSaved()
          }
        }),
        
      moveTask: (taskId, newPosition) =>
        set((state) => {
          get().updateTask(taskId, { position: newPosition })
        }),
        
      updateTaskStatus: (taskId, newStatus) =>
        set((state) => {
          get().updateTask(taskId, { status: newStatus })
        }),
        
      updateTaskPriority: (taskId, newPriority) =>
        set((state) => {
          get().updateTask(taskId, { 
            metadata: { 
              ...state.tasks.find(t => t.id === taskId)?.metadata,
              priority: newPriority 
            } 
          })
        }),
        
      // Selection management
      selectTask: (taskId) =>
        set((state) => {
          if (!state.selectedTasks.includes(taskId)) {
            state.selectedTasks.push(taskId)
          }
        }),
        
      deselectTask: (taskId) =>
        set((state) => {
          state.selectedTasks = state.selectedTasks.filter(id => id !== taskId)
        }),
        
      toggleTaskSelection: (taskId) =>
        set((state) => {
          if (state.selectedTasks.includes(taskId)) {
            state.selectedTasks = state.selectedTasks.filter(id => id !== taskId)
          } else {
            state.selectedTasks.push(taskId)
          }
        }),
        
      selectAllTasks: () =>
        set((state) => {
          const currentProject = useAppStore.getState().currentProject
          if (currentProject) {
            state.selectedTasks = state.tasks
              .filter(t => t.projectId === currentProject.id)
              .map(t => t.id)
          }
        }),
        
      clearSelection: () =>
        set((state) => {
          state.selectedTasks = []
        }),
        
      // Bulk operations
      bulkUpdateTasks: (taskIds, updates) =>
        set((state) => {
          taskIds.forEach(taskId => {
            get().updateTask(taskId, updates)
          })
        }),
        
      bulkDeleteTasks: (taskIds) =>
        set((state) => {
          taskIds.forEach(taskId => {
            get().deleteTask(taskId)
          })
        }),
        
      // View management
      setCurrentView: (view) =>
        set((state) => {
          state.currentView = view
        }),
        
      setGroupBy: (groupBy) =>
        set((state) => {
          state.groupBy = groupBy
        }),
        
      setSortBy: (sortBy) =>
        set((state) => {
          state.sortBy = sortBy
        }),
        
      setSortOrder: (order) =>
        set((state) => {
          state.sortOrder = order
        }),
        
      // Filter management
      setStatusFilter: (statuses) =>
        set((state) => {
          state.statusFilter = statuses
        }),
        
      setPriorityFilter: (priorities) =>
        set((state) => {
          state.priorityFilter = priorities
        }),
        
      setTagFilter: (tags) =>
        set((state) => {
          state.tagFilter = tags
        }),
        
      clearFilters: () =>
        set((state) => {
          state.statusFilter = []
          state.priorityFilter = []
          state.tagFilter = []
        }),
        
      // Getters and computed values
      getCurrentProjectTasks: () => {
        const currentProject = useAppStore.getState().currentProject
        if (!currentProject) return []
        
        return get().tasks.filter(t => t.projectId === currentProject.id)
      },
      
      getFilteredTasks: () => {
        const state = get()
        let tasks = state.getCurrentProjectTasks()
        
        // Apply filters
        if (state.statusFilter.length > 0) {
          tasks = tasks.filter(t => state.statusFilter.includes(t.status))
        }
        
        if (state.priorityFilter.length > 0) {
          tasks = tasks.filter(t => state.priorityFilter.includes(t.metadata.priority))
        }
        
        if (state.tagFilter.length > 0) {
          tasks = tasks.filter(t => 
            t.metadata.tags.some(tag => state.tagFilter.includes(tag))
          )
        }
        
        // Apply sorting
        tasks.sort((a, b) => {
          let aValue, bValue
          
          switch (state.sortBy) {
            case 'title':
              aValue = a.title.toLowerCase()
              bValue = b.title.toLowerCase()
              break
            case 'priority':
              const priorityOrder = { low: 1, medium: 2, high: 3 }
              aValue = priorityOrder[a.metadata.priority]
              bValue = priorityOrder[b.metadata.priority]
              break
            case 'createdAt':
            case 'updatedAt':
              aValue = new Date(a[state.sortBy])
              bValue = new Date(b[state.sortBy])
              break
            default:
              return 0
          }
          
          if (state.sortOrder === 'asc') {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
          } else {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
          }
        })
        
        return tasks
      },
      
      getTasksByType: (type) => {
        return get().getCurrentProjectTasks().filter(t => t.type === type)
      },
      
      getTasksByStatus: (status) => {
        return get().getCurrentProjectTasks().filter(t => t.status === status)
      },
      
      getSelectedTasksData: () => {
        const state = get()
        return state.tasks.filter(t => state.selectedTasks.includes(t.id))
      },
      
      getTaskStats: () => {
        const tasks = get().getCurrentProjectTasks()
        return {
          total: tasks.length,
          todo: tasks.filter(t => t.status === 'todo').length,
          inProgress: tasks.filter(t => t.status === 'in-progress').length,
          done: tasks.filter(t => t.status === 'done').length,
          blocked: tasks.filter(t => t.status === 'blocked').length,
          byType: {
            task: tasks.filter(t => t.type === 'task').length,
            note: tasks.filter(t => t.type === 'note').length,
            snippet: tasks.filter(t => t.type === 'snippet').length,
            idea: tasks.filter(t => t.type === 'idea').length,
          }
        }
      },
      
      getAllTaskTags: () => {
        const tasks = get().getCurrentProjectTasks()
        const allTags = tasks.flatMap(t => t.metadata.tags)
        return [...new Set(allTags)].sort()
      },
      
      // Async operations with DataService integration
      loadTasks: async (projectId) => {
        const { taskStoreIntegration } = await import('../services/StoreDataIntegration')
        return await taskStoreIntegration.loadTasks(projectId, set, get)
      },
      
      saveTasks: async (projectId, tasks) => {
        const { taskStoreIntegration } = await import('../services/StoreDataIntegration')
        return await taskStoreIntegration.saveTasks(projectId, tasks, set, get)
      },

      saveTask: async (task) => {
        const { taskStoreIntegration } = await import('../services/StoreDataIntegration')
        return await taskStoreIntegration.saveTask(task, set, get)
      },

      saveCurrentProjectTasks: async () => {
        const currentProject = useAppStore.getState().currentProject
        if (currentProject) {
          const tasks = get().getCurrentProjectTasks()
          return await get().saveTasks(currentProject.id, tasks)
        }
      },
    })),
    {
      name: 'task-store',
    }
  )
)

export default useTaskStore