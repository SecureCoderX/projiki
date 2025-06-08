// src/renderer/stores/useTaskStore.js
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { v4 as uuidv4 } from 'uuid'
import useAppStore from './useAppStore'
import DataService from '../services/DataService'

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
        
      createTask: async (taskData) => {
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
        
        try {
          // Save task to DataService
          await DataService.saveTask(currentProject.id, newTask)
          
          // Update store
          set((state) => {
            state.tasks.push(newTask)
          })
          
          useAppStore.getState().addNotification({
            type: 'success',
            title: 'Task Created',
            message: `Task "${newTask.title}" has been created.`
          })
          
          useAppStore.getState().updateLastSaved()
          console.log('✅ Task created and saved:', newTask.title)
          return newTask
          
        } catch (error) {
          console.error('❌ Failed to create task:', error)
          useAppStore.getState().addNotification({
            type: 'error',
            title: 'Task Creation Failed',
            message: `Failed to create task: ${error.message}`
          })
          throw error
        }
      },
        
      updateTask: async (taskId, updates) => {
        const currentProject = useAppStore.getState().currentProject
        if (!currentProject) return
        
        try {
          const taskIndex = get().tasks.findIndex(t => t.id === taskId)
          
          if (taskIndex !== -1) {
            const updatedTask = {
              ...get().tasks[taskIndex],
              ...updates,
              updatedAt: new Date().toISOString()
            }
            
            // Save to DataService
            await DataService.saveTask(currentProject.id, updatedTask)
            
            // Update store
            set((state) => {
              state.tasks[taskIndex] = updatedTask
            })
            
            useAppStore.getState().updateLastSaved()
            console.log('✅ Task updated and saved:', updatedTask.title)
          }
        } catch (error) {
          console.error('❌ Failed to update task:', error)
          useAppStore.getState().addNotification({
            type: 'error',
            title: 'Update Failed',
            message: `Failed to update task: ${error.message}`
          })
          throw error
        }
      },
        
      deleteTask: async (taskId) => {
        const currentProject = useAppStore.getState().currentProject
        if (!currentProject) return
        
        try {
          const taskToDelete = get().tasks.find(t => t.id === taskId)
          
          if (taskToDelete) {
            // Remove from current tasks and save to DataService
            const updatedTasks = get().tasks.filter(t => t.id !== taskId)
            await DataService.saveTasks(currentProject.id, updatedTasks)
            
            // Update store
            set((state) => {
              state.tasks = state.tasks.filter(t => t.id !== taskId)
              state.selectedTasks = state.selectedTasks.filter(id => id !== taskId)
            })
            
            useAppStore.getState().addNotification({
              type: 'info',
              title: 'Task Deleted',
              message: `Task "${taskToDelete.title}" has been deleted.`
            })
            
            useAppStore.getState().updateLastSaved()
            console.log('✅ Task deleted:', taskToDelete.title)
          }
        } catch (error) {
          console.error('❌ Failed to delete task:', error)
          useAppStore.getState().addNotification({
            type: 'error',
            title: 'Delete Failed',
            message: `Failed to delete task: ${error.message}`
          })
          throw error
        }
      },
        
      moveTask: async (taskId, newPosition) => {
        await get().updateTask(taskId, { position: newPosition })
      },
        
      updateTaskStatus: async (taskId, newStatus) => {
        await get().updateTask(taskId, { status: newStatus })
      },
        
      updateTaskPriority: async (taskId, newPriority) => {
        const task = get().tasks.find(t => t.id === taskId)
        if (task) {
          await get().updateTask(taskId, { 
            metadata: { 
              ...task.metadata,
              priority: newPriority 
            } 
          })
        }
      },
        
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
      bulkUpdateTasks: async (taskIds, updates) => {
        for (const taskId of taskIds) {
          await get().updateTask(taskId, updates)
        }
      },
        
      bulkDeleteTasks: async (taskIds) => {
        for (const taskId of taskIds) {
          await get().deleteTask(taskId)
        }
      },
        
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
      
      // Load tasks for a specific project
      loadTasks: async (projectId) => {
        set((state) => {
          state.loadingTasks = true
          state.tasksError = null
        })
        
        try {
          console.log('📝 Loading tasks for project:', projectId)
          const tasks = await DataService.loadTasks(projectId)
          
          set((state) => {
            // Replace tasks for this project
            state.tasks = state.tasks.filter(t => t.projectId !== projectId).concat(tasks)
            state.loadingTasks = false
            state.tasksError = null
          })
          
          console.log(`✅ Loaded ${tasks.length} tasks`)
          return tasks
          
        } catch (error) {
          console.error('❌ Failed to load tasks:', error)
          set((state) => {
            state.loadingTasks = false
            state.tasksError = error.message
          })
          
          useAppStore.getState().addNotification({
            type: 'error',
            title: 'Load Failed',
            message: `Failed to load tasks: ${error.message}`
          })
          
          throw error
        }
      },
      
      // Save all tasks for a project
      saveTasks: async (projectId, tasks) => {
        try {
          await DataService.saveTasks(projectId, tasks)
          useAppStore.getState().updateLastSaved()
          console.log(`✅ Saved ${tasks.length} tasks for project:`, projectId)
        } catch (error) {
          console.error('❌ Failed to save tasks:', error)
          useAppStore.getState().addNotification({
            type: 'error',
            title: 'Save Failed',
            message: `Failed to save tasks: ${error.message}`
          })
          throw error
        }
      },

      // Save individual task
      saveTask: async (task) => {
        try {
          await DataService.saveTask(task.projectId, task)
          useAppStore.getState().updateLastSaved()
          console.log('✅ Task saved:', task.title)
        } catch (error) {
          console.error('❌ Failed to save task:', error)
          useAppStore.getState().addNotification({
            type: 'error',
            title: 'Save Failed',
            message: `Failed to save task: ${error.message}`
          })
          throw error
        }
      },

      // Save all tasks for current project
      saveCurrentProjectTasks: async () => {
        const currentProject = useAppStore.getState().currentProject
        if (currentProject) {
          const tasks = get().getCurrentProjectTasks()
          return await get().saveTasks(currentProject.id, tasks)
        }
      },
      
      // Initialize task store
      initialize: async () => {
        try {
          console.log('📝 Initializing task store...')
          // Task store doesn't need global initialization like project store
          // Tasks are loaded per-project when needed
          console.log('✅ Task store initialized')
        } catch (error) {
          console.error('❌ Failed to initialize task store:', error)
        }
      },
    })),
    {
      name: 'task-store',
    }
  )
)

export default useTaskStore