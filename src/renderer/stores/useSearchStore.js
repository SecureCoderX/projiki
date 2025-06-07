// src/renderer/stores/useSearchStore.js
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import searchService from '../services/SearchService'

const useSearchStore = create()(
  devtools(
    immer((set, get) => ({
      // Search state
      query: '',
      isSearching: false,
      searchResults: {
        projects: [],
        tasks: [],
        notes: [],
        snippets: [],
        total: 0
      },
      searchHistory: JSON.parse(localStorage.getItem('projiki-search-history') || '[]'),
      
      // Search configuration
      searchOptions: {
        includeProjects: true,
        includeTasks: true,
        includeNotes: true,
        includeSnippets: true,
        caseSensitive: false,
        wholeWords: false,
        useRegex: false,
        searchInContent: true,
        searchInTags: true,
        maxResults: 100
      },
      
      // Advanced filters
      filters: {
        dateRange: {
          start: null,
          end: null
        },
        tags: [],
        status: [],
        priority: [],
        type: [],
        projectId: null // null means search all projects
      },
      
      // UI state
      showAdvancedFilters: false,
      selectedResultIndex: -1,
      suggestions: [],
      filterOptions: {
        tags: [],
        status: [],
        priority: [],
        projects: [],
        types: []
      },
      
      // Actions
      setQuery: (query) =>
        set((state) => {
          state.query = query
          if (query.trim() === '') {
            state.searchResults = {
              projects: [],
              tasks: [],
              notes: [],
              snippets: [],
              total: 0
            }
            state.selectedResultIndex = -1
            state.suggestions = []
          } else {
            // Get search suggestions
            state.suggestions = searchService.getSearchSuggestions(query, 5)
          }
        }),
        
      setSearching: (isSearching) =>
        set((state) => {
          state.isSearching = isSearching
        }),
        
      setSearchResults: (results) =>
        set((state) => {
          state.searchResults = {
            projects: results.projects || [],
            tasks: results.tasks || [],
            notes: results.notes || [],
            snippets: results.snippets || [],
            total: results.total || 0
          }
          state.isSearching = false
          state.selectedResultIndex = -1
        }),
        
      addToSearchHistory: (query) =>
        set((state) => {
          if (query.trim() && !state.searchHistory.includes(query)) {
            state.searchHistory.unshift(query)
            // Keep only last 20 searches
            if (state.searchHistory.length > 20) {
              state.searchHistory = state.searchHistory.slice(0, 20)
            }
            // Persist to localStorage
            localStorage.setItem('projiki-search-history', JSON.stringify(state.searchHistory))
          }
        }),
        
      clearSearchHistory: () =>
        set((state) => {
          state.searchHistory = []
          localStorage.removeItem('projiki-search-history')
        }),
        
      removeFromSearchHistory: (query) =>
        set((state) => {
          state.searchHistory = state.searchHistory.filter(h => h !== query)
          localStorage.setItem('projiki-search-history', JSON.stringify(state.searchHistory))
        }),
        
      // Search options
      updateSearchOptions: (options) =>
        set((state) => {
          state.searchOptions = { ...state.searchOptions, ...options }
        }),
        
      toggleSearchOption: (optionKey) =>
        set((state) => {
          state.searchOptions[optionKey] = !state.searchOptions[optionKey]
        }),
        
      // Filter management
      updateFilters: (filters) =>
        set((state) => {
          state.filters = { ...state.filters, ...filters }
        }),
        
      setDateRangeFilter: (start, end) =>
        set((state) => {
          state.filters.dateRange = { start, end }
        }),
        
      addTagFilter: (tag) =>
        set((state) => {
          if (!state.filters.tags.includes(tag)) {
            state.filters.tags.push(tag)
          }
        }),
        
      removeTagFilter: (tag) =>
        set((state) => {
          state.filters.tags = state.filters.tags.filter(t => t !== tag)
        }),
        
      addStatusFilter: (status) =>
        set((state) => {
          if (!state.filters.status.includes(status)) {
            state.filters.status.push(status)
          }
        }),
        
      removeStatusFilter: (status) =>
        set((state) => {
          state.filters.status = state.filters.status.filter(s => s !== status)
        }),
        
      addPriorityFilter: (priority) =>
        set((state) => {
          if (!state.filters.priority.includes(priority)) {
            state.filters.priority.push(priority)
          }
        }),
        
      removePriorityFilter: (priority) =>
        set((state) => {
          state.filters.priority = state.filters.priority.filter(p => p !== priority)
        }),
        
      setProjectFilter: (projectId) =>
        set((state) => {
          state.filters.projectId = projectId
        }),
        
      clearFilters: () =>
        set((state) => {
          state.filters = {
            dateRange: { start: null, end: null },
            tags: [],
            status: [],
            priority: [],
            type: [],
            projectId: null
          }
        }),
        
      // UI actions
      toggleAdvancedFilters: () =>
        set((state) => {
          state.showAdvancedFilters = !state.showAdvancedFilters
          
          // Load filter options when opening advanced filters
          if (state.showAdvancedFilters) {
            state.filterOptions = searchService.getFilterOptions()
          }
        }),
        
      setSelectedResultIndex: (index) =>
        set((state) => {
          const totalResults = state.searchResults.total
          if (index >= -1 && index < totalResults) {
            state.selectedResultIndex = index
          }
        }),
        
      navigateResults: (direction) =>
        set((state) => {
          const totalResults = state.searchResults.total
          if (totalResults === 0) return
          
          if (direction === 'up') {
            state.selectedResultIndex = state.selectedResultIndex <= 0 
              ? totalResults - 1 
              : state.selectedResultIndex - 1
          } else if (direction === 'down') {
            state.selectedResultIndex = state.selectedResultIndex >= totalResults - 1 
              ? 0 
              : state.selectedResultIndex + 1
          }
        }),
        
      // Search execution
      performSearch: async (query = null, customFilters = null) => {
        const searchQuery = query || get().query
        const searchFilters = customFilters || get().filters
        const searchOptions = get().searchOptions
        
        if (!searchQuery.trim()) {
          set((state) => {
            state.searchResults = {
              projects: [],
              tasks: [],
              notes: [],
              snippets: [],
              total: 0
            }
          })
          return
        }
        
        set((state) => {
          state.isSearching = true
        })
        
        try {
          console.log('🔍 Performing search:', searchQuery, 'Filters:', searchFilters)
          
          const results = await searchService.search(searchQuery, searchFilters, searchOptions)
          
          get().setSearchResults(results)
          get().addToSearchHistory(searchQuery)
          
          console.log('✅ Search completed:', results.total, 'results found')
          
          return results
          
        } catch (error) {
          console.error('❌ Failed to rebuild search index:', error)
          throw error
        }
      },
      
      updateSearchIndex: async (type, data) => {
        try {
          await searchService.updateIndex(type, data)
        } catch (error) {
          console.error('❌ Failed to update search index:', error)
        }
      },
      
      removeFromSearchIndex: (id) => {
        searchService.removeFromIndex(id)
      }
    })),
    {
      name: 'search-store',
    }
  )
)

export default useSearchStore