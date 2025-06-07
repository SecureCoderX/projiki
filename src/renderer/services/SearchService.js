// src/renderer/services/SearchService.js
import dataService from './DataService'

/**
 * SearchService - Advanced search and filtering across projects and tasks
 * Provides fast, flexible search with ranking and relevance scoring
 */
class SearchService {
  constructor() {
    this.searchIndex = new Map() // In-memory search index
    this.lastIndexUpdate = null
    this.indexUpdateInterval = 30000 // Re-index every 30 seconds
    this.stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
      'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 
      'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'
    ])
    
    this.initializeIndex()
  }

  // =============================================================================
  // INDEX MANAGEMENT
  // =============================================================================

  /**
   * Initialize the search index
   */
  async initializeIndex() {
    try {
      await this.rebuildIndex()
      console.log('🔍 SearchService initialized with search index')
    } catch (error) {
      console.error('❌ Failed to initialize SearchService:', error)
    }
  }

  /**
   * Rebuild the entire search index
   */
  async rebuildIndex() {
    try {
      this.searchIndex.clear()
      
      // Index all projects
      const projects = await dataService.loadAllProjects()
      for (const project of projects) {
        this.indexProject(project)
        
        // Index tasks for each project
        try {
          const tasks = await dataService.loadTasks(project.id)
          for (const task of tasks) {
            this.indexTask(task, project)
          }
        } catch (error) {
          console.warn(`⚠️ Failed to index tasks for project ${project.name}:`, error.message)
        }
      }
      
      this.lastIndexUpdate = new Date()
      console.log(`📚 Search index rebuilt: ${this.searchIndex.size} items indexed`)
      
    } catch (error) {
      console.error('❌ Failed to rebuild search index:', error)
      throw error
    }
  }

  /**
   * Index a single project
   */
  indexProject(project) {
    const searchableText = this.extractSearchableText(project, [
      'name', 'description'
    ])
    
    const tags = project.metadata?.tags || []
    const allText = [searchableText, ...tags].join(' ').toLowerCase()
    
    this.searchIndex.set(project.id, {
      id: project.id,
      type: 'project',
      title: project.name,
      content: project.description || '',
      searchableText: allText,
      tokens: this.tokenize(allText),
      tags: tags,
      status: project.status,
      priority: project.metadata?.priority || 'medium',
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      data: project
    })
  }

  /**
   * Index a single task
   */
  indexTask(task, project) {
    const searchableText = this.extractSearchableText(task, [
      'title', 'content'
    ])
    
    const tags = task.metadata?.tags || []
    const allText = [searchableText, ...tags, project?.name || ''].join(' ').toLowerCase()
    
    this.searchIndex.set(task.id, {
      id: task.id,
      type: task.type || 'task', // task, note, snippet, idea
      title: task.title,
      content: task.content || '',
      searchableText: allText,
      tokens: this.tokenize(allText),
      tags: tags,
      status: task.status,
      priority: task.metadata?.priority || 'medium',
      projectId: task.projectId,
      projectName: project?.name || 'Unknown Project',
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      data: task
    })
  }

  /**
   * Extract searchable text from an object
   */
  extractSearchableText(obj, fields) {
    return fields
      .map(field => obj[field] || '')
      .filter(text => text.trim())
      .join(' ')
  }

  /**
   * Tokenize text for search
   */
  tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
      .split(/\s+/)
      .filter(token => token.length > 2 && !this.stopWords.has(token))
      .filter((token, index, arr) => arr.indexOf(token) === index) // Remove duplicates
  }

  // =============================================================================
  // SEARCH OPERATIONS
  // =============================================================================

  /**
   * Perform a search across all indexed content
   */
  async search(query, filters = {}, options = {}) {
    try {
      // Check if index needs updating
      if (this.shouldUpdateIndex()) {
        await this.rebuildIndex()
      }

      const {
        includeProjects = true,
        includeTasks = true,
        includeNotes = true,
        includeSnippets = true,
        caseSensitive = false,
        wholeWords = false,
        useRegex = false,
        searchInContent = true,
        searchInTags = true,
        maxResults = 100
      } = options

      // Normalize query
      const normalizedQuery = caseSensitive ? query.trim() : query.toLowerCase().trim()
      
      if (!normalizedQuery) {
        return this.getEmptyResults()
      }

      // Get search tokens
      const queryTokens = useRegex ? [normalizedQuery] : this.tokenize(normalizedQuery)
      
      if (queryTokens.length === 0) {
        return this.getEmptyResults()
      }

      // Perform search
      const results = []
      
      for (const [id, item] of this.searchIndex) {
        // Apply type filters
        if (!this.shouldIncludeType(item.type, {
          includeProjects, includeTasks, includeNotes, includeSnippets
        })) {
          continue
        }

        // Apply other filters
        if (!this.passesFilters(item, filters)) {
          continue
        }

        // Calculate relevance score
        const score = this.calculateRelevance(item, queryTokens, {
          caseSensitive, wholeWords, useRegex, searchInContent, searchInTags
        })

        if (score > 0) {
          results.push({
            ...item,
            score,
            highlights: this.generateHighlights(item, queryTokens, { caseSensitive })
          })
        }
      }

      // Sort by relevance score (highest first)
      results.sort((a, b) => b.score - a.score)

      // Limit results
      const limitedResults = results.slice(0, maxResults)

      // Group results by type
      const groupedResults = this.groupResultsByType(limitedResults)

      console.log(`🔍 Search completed: "${query}" found ${limitedResults.length} results`)

      return {
        query: normalizedQuery,
        totalResults: results.length,
        ...groupedResults,
        searchTime: Date.now(),
        filters: filters
      }

    } catch (error) {
      console.error('❌ Search failed:', error)
      throw new Error(`Search failed: ${error.message}`)
    }
  }

  /**
   * Check if index should be updated
   */
  shouldUpdateIndex() {
    if (!this.lastIndexUpdate) return true
    
    const timeSinceUpdate = Date.now() - this.lastIndexUpdate.getTime()
    return timeSinceUpdate > this.indexUpdateInterval
  }

  /**
   * Check if item type should be included
   */
  shouldIncludeType(type, typeFilters) {
    switch (type) {
      case 'project':
        return typeFilters.includeProjects
      case 'task':
        return typeFilters.includeTasks
      case 'note':
        return typeFilters.includeNotes
      case 'snippet':
        return typeFilters.includeSnippets
      case 'idea':
        return typeFilters.includeSnippets // Ideas grouped with snippets
      default:
        return typeFilters.includeTasks // Default to tasks
    }
  }

  /**
   * Check if item passes all filters
   */
  passesFilters(item, filters) {
    // Date range filter
    if (filters.dateRange?.start || filters.dateRange?.end) {
      const itemDate = new Date(item.updatedAt)
      
      if (filters.dateRange.start && itemDate < new Date(filters.dateRange.start)) {
        return false
      }
      
      if (filters.dateRange.end && itemDate > new Date(filters.dateRange.end)) {
        return false
      }
    }

    // Tags filter
    if (filters.tags?.length > 0) {
      const hasMatchingTag = filters.tags.some(tag => 
        item.tags.some(itemTag => itemTag.toLowerCase().includes(tag.toLowerCase()))
      )
      if (!hasMatchingTag) return false
    }

    // Status filter
    if (filters.status?.length > 0) {
      if (!filters.status.includes(item.status)) return false
    }

    // Priority filter
    if (filters.priority?.length > 0) {
      if (!filters.priority.includes(item.priority)) return false
    }

    // Project filter
    if (filters.projectId && item.projectId !== filters.projectId && item.type !== 'project') {
      return false
    }

    return true
  }

  /**
   * Calculate relevance score for a search result
   */
  calculateRelevance(item, queryTokens, options) {
    let score = 0
    const { caseSensitive, wholeWords, useRegex, searchInContent, searchInTags } = options

    for (const token of queryTokens) {
      const searchToken = caseSensitive ? token : token.toLowerCase()
      
      // Title match (highest weight)
      if (this.textContains(item.title, searchToken, { caseSensitive, wholeWords, useRegex })) {
        score += 10
      }

      // Content match (medium weight)
      if (searchInContent && this.textContains(item.content, searchToken, { caseSensitive, wholeWords, useRegex })) {
        score += 5
      }

      // Tag match (high weight)
      if (searchInTags) {
        for (const tag of item.tags) {
          if (this.textContains(tag, searchToken, { caseSensitive, wholeWords, useRegex })) {
            score += 8
          }
        }
      }

      // Token match (low weight)
      if (item.tokens.includes(searchToken)) {
        score += 1
      }
    }

    // Boost recent items
    const daysSinceUpdate = (Date.now() - new Date(item.updatedAt)) / (1000 * 60 * 60 * 24)
    if (daysSinceUpdate < 7) {
      score *= 1.2 // 20% boost for items updated in last week
    }

    // Boost by priority
    const priorityBoost = { high: 1.3, medium: 1.0, low: 0.8 }
    score *= priorityBoost[item.priority] || 1.0

    return score
  }

  /**
   * Check if text contains search term
   */
  textContains(text, searchTerm, options) {
    if (!text) return false
    
    const { caseSensitive, wholeWords, useRegex } = options
    const searchText = caseSensitive ? text : text.toLowerCase()
    const term = caseSensitive ? searchTerm : searchTerm.toLowerCase()

    if (useRegex) {
      try {
        const regex = new RegExp(term, caseSensitive ? 'g' : 'gi')
        return regex.test(searchText)
      } catch {
        return searchText.includes(term) // Fallback to simple search
      }
    }

    if (wholeWords) {
      const regex = new RegExp(`\\b${term}\\b`, caseSensitive ? 'g' : 'gi')
      return regex.test(searchText)
    }

    return searchText.includes(term)
  }

  /**
   * Generate search highlights
   */
  generateHighlights(item, queryTokens, options) {
    const highlights = []
    const { caseSensitive } = options

    for (const token of queryTokens) {
      const searchToken = caseSensitive ? token : token.toLowerCase()
      
      // Find highlights in title
      if (item.title && item.title.toLowerCase().includes(searchToken)) {
        highlights.push({
          field: 'title',
          text: item.title,
          term: token
        })
      }

      // Find highlights in content (first 200 chars)
      if (item.content && item.content.toLowerCase().includes(searchToken)) {
        const content = item.content.substring(0, 200)
        highlights.push({
          field: 'content',
          text: content + (item.content.length > 200 ? '...' : ''),
          term: token
        })
      }
    }

    return highlights
  }

  /**
   * Group search results by type
   */
  groupResultsByType(results) {
    const grouped = {
      projects: [],
      tasks: [],
      notes: [],
      snippets: [],
      total: results.length
    }

    for (const result of results) {
      switch (result.type) {
        case 'project':
          grouped.projects.push(result)
          break
        case 'task':
          grouped.tasks.push(result)
          break
        case 'note':
          grouped.notes.push(result)
          break
        case 'snippet':
        case 'idea':
          grouped.snippets.push(result)
          break
        default:
          grouped.tasks.push(result) // Default to tasks
      }
    }

    return grouped
  }

  /**
   * Get empty search results
   */
  getEmptyResults() {
    return {
      projects: [],
      tasks: [],
      notes: [],
      snippets: [],
      total: 0,
      query: '',
      totalResults: 0,
      searchTime: Date.now(),
      filters: {}
    }
  }

  // =============================================================================
  // FILTER HELPERS
  // =============================================================================

  /**
   * Get available filter options from indexed data
   */
  getFilterOptions() {
    const options = {
      tags: new Set(),
      status: new Set(),
      priority: new Set(),
      projects: new Map(), // id -> name
      types: new Set()
    }

    for (const [id, item] of this.searchIndex) {
      // Collect tags
      item.tags.forEach(tag => options.tags.add(tag))
      
      // Collect status values
      options.status.add(item.status)
      
      // Collect priority values
      options.priority.add(item.priority)
      
      // Collect types
      options.types.add(item.type)
      
      // Collect projects
      if (item.type === 'project') {
        options.projects.set(item.id, item.title)
      }
    }

    return {
      tags: Array.from(options.tags).sort(),
      status: Array.from(options.status).sort(),
      priority: Array.from(options.priority).sort(),
      projects: Array.from(options.projects.entries()).map(([id, name]) => ({ id, name })),
      types: Array.from(options.types).sort()
    }
  }

  /**
   * Get search suggestions based on query
   */
  getSearchSuggestions(query, limit = 5) {
    if (!query || query.length < 2) return []

    const suggestions = new Set()
    const normalizedQuery = query.toLowerCase()

    for (const [id, item] of this.searchIndex) {
      // Suggest from titles
      if (item.title.toLowerCase().includes(normalizedQuery)) {
        suggestions.add(item.title)
      }

      // Suggest from tags
      item.tags.forEach(tag => {
        if (tag.toLowerCase().includes(normalizedQuery)) {
          suggestions.add(tag)
        }
      })

      if (suggestions.size >= limit) break
    }

    return Array.from(suggestions).slice(0, limit)
  }

  // =============================================================================
  // MAINTENANCE
  // =============================================================================

  /**
   * Update index when data changes
   */
  async updateIndex(type, data) {
    try {
      if (type === 'project') {
        this.indexProject(data)
      } else if (type === 'task') {
        // Need project data for task indexing
        const project = await dataService.loadProject(data.projectId)
        this.indexTask(data, project)
      }
      
      console.log(`🔍 Search index updated for ${type}: ${data.id}`)
    } catch (error) {
      console.error('❌ Failed to update search index:', error)
    }
  }

  /**
   * Remove item from index
   */
  removeFromIndex(id) {
    if (this.searchIndex.has(id)) {
      this.searchIndex.delete(id)
      console.log(`🗑️ Removed from search index: ${id}`)
    }
  }

  /**
   * Get index statistics
   */
  getIndexStats() {
    const stats = {
      totalItems: this.searchIndex.size,
      projects: 0,
      tasks: 0,
      notes: 0,
      snippets: 0,
      lastUpdate: this.lastIndexUpdate
    }

    for (const [id, item] of this.searchIndex) {
      switch (item.type) {
        case 'project':
          stats.projects++
          break
        case 'task':
          stats.tasks++
          break
        case 'note':
          stats.notes++
          break
        case 'snippet':
        case 'idea':
          stats.snippets++
          break
      }
    }

    return stats
  }
}

// Export singleton instance
const searchService = new SearchService()
export default searchService