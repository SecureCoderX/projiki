// src/renderer/components/common/SearchBar.jsx
import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSearchStore } from '../../stores'

/**
 * SearchBar component - Real search with results and navigation
 */
const SearchBar = ({ className = '', onResultSelect = null }) => {
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef(null)
  const resultsRef = useRef(null)
  const navigate = useNavigate()
  
  // Search store
  const query = useSearchStore(state => state.query)
  const setQuery = useSearchStore(state => state.setQuery)
  const isSearching = useSearchStore(state => state.isSearching)
  const searchResults = useSearchStore(state => state.searchResults)
  const performSearch = useSearchStore(state => state.performSearch)
  const resetSearch = useSearchStore(state => state.resetSearch)

  // Handle input change with debounced search
  const handleInputChange = (e) => {
    const value = e.target.value
    setQuery(value)
    
    if (value.trim()) {
      setIsOpen(true)
      // Trigger search after short delay
      setTimeout(() => {
        if (useSearchStore.getState().query === value) {
          performSearch(value).catch(console.error)
        }
      }, 300)
    } else {
      setIsOpen(false)
      resetSearch()
    }
  }

  // Handle search submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (query.trim()) {
      try {
        await performSearch()
        setIsOpen(true)
      } catch (error) {
        console.error('Search failed:', error)
      }
    }
  }

  // Handle result selection with navigation
  const handleResultSelect = (result) => {
    console.log('🔍 Selected result:', result)
    
    // Call custom callback if provided
    if (onResultSelect) {
      onResultSelect(result)
    }
    
    // Navigate based on result type
    try {
      switch (result.type) {
        case 'project':
          console.log('📁 Navigating to project:', result.id)
          navigate(`/projects/${result.id}`)
          break
          
        case 'task':
          console.log('📝 Navigating to project with task:', result.projectId)
          // Navigate to project workspace and optionally highlight the task
          navigate(`/projects/${result.projectId}`, { 
            state: { 
              highlightTask: result.id,
              activeTab: 'tasks'
            } 
          })
          break
          
        case 'note':
          console.log('📄 Navigating to project with note:', result.projectId)
          // Navigate to project workspace notes tab
          navigate(`/projects/${result.projectId}`, { 
            state: { 
              highlightNote: result.id,
              activeTab: 'notes'
            } 
          })
          break
          
        case 'snippet':
          console.log('💾 Navigating to snippets page')
          // Navigate to snippets page
          navigate('/snippets', {
            state: {
              highlightSnippet: result.id,
              searchQuery: result.title
            }
          })
          break
          
        case 'prompt':
          console.log('🤖 Navigating to vault page')
          // Navigate to vault/prompts page
          navigate('/vault', {
            state: {
              highlightPrompt: result.id,
              searchQuery: result.title
            }
          })
          break
          
        default:
          console.log('❓ Unknown result type, navigating to dashboard')
          navigate('/dashboard')
      }
    } catch (error) {
      console.error('❌ Navigation failed:', error)
      // Fallback to dashboard if navigation fails
      navigate('/dashboard')
    }
    
    // Close search dropdown
    setIsOpen(false)
    inputRef.current?.blur()
    
    // Clear search after navigation
    setTimeout(() => {
      setQuery('')
      resetSearch()
    }, 100)
  }

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }

  const totalResults = searchResults.total
  const hasResults = totalResults > 0

  return (
    <div className={`relative ${className}`} style={{ zIndex: 60 }}>
      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            placeholder="Search projects, tasks, notes..."
            className="w-full px-4 py-2 pl-10 pr-12 bg-bg-secondary border border-border-primary rounded-lg 
                     text-text-primary placeholder-text-secondary
                     focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent
                     transition-all duration-200 relative z-60"
          />
          
          {/* Search Icon */}
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary z-60">
            {isSearching ? (
              <div className="animate-spin w-4 h-4 border-2 border-accent-primary border-t-transparent rounded-full" />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            )}
          </div>
          
          {/* Clear Button */}
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                resetSearch()
                setIsOpen(false)
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary z-60"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      {isOpen && query && (
        <div
          ref={resultsRef}
          className="absolute inset-x-0 mt-1 bg-bg-secondary border border-border-primary rounded-lg shadow-xl max-h-96 overflow-y-auto z-50"
          style={{ 
            top: '100%',
            minWidth: '320px'
          }}
        >
          {/* Loading State */}
          {isSearching && (
            <div className="p-4 text-center text-text-secondary">
              <div className="mb-2">🔍</div>
              <div>Searching...</div>
            </div>
          )}

          {/* Search Results */}
          {!isSearching && hasResults && (
            <div className="p-2">
              <div className="text-xs text-text-secondary mb-2 px-2">
                {totalResults} result{totalResults !== 1 ? 's' : ''} found
              </div>
              
              {/* Projects */}
              {searchResults.projects.length > 0 && (
                <div className="mb-2">
                  <div className="text-xs font-medium text-text-secondary px-2 mb-1">Projects</div>
                  {searchResults.projects.slice(0, 3).map((result) => (
                    <button
                      key={`project-${result.id}`}
                      onClick={() => handleResultSelect(result)}
                      className="w-full text-left px-3 py-2 rounded hover:bg-bg-tertiary transition-colors focus:bg-bg-tertiary focus:outline-none"
                    >
                      <div className="flex items-center">
                        <span className="mr-3 text-blue-500">📁</span>
                        <div className="flex-1">
                          <div className="font-medium text-text-primary">{result.title}</div>
                          {result.content && (
                            <div className="text-sm text-text-secondary truncate">
                              {result.content.substring(0, 60)}...
                            </div>
                          )}
                          <div className="text-xs text-text-secondary mt-1">
                            {result.status} • Score: {result.score?.toFixed(1)}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {/* Tasks */}
              {searchResults.tasks.length > 0 && (
                <div className="mb-2">
                  <div className="text-xs font-medium text-text-secondary px-2 mb-1">Tasks</div>
                  {searchResults.tasks.slice(0, 5).map((result) => (
                    <button
                      key={`task-${result.id}`}
                      onClick={() => handleResultSelect(result)}
                      className="w-full text-left px-3 py-2 rounded hover:bg-bg-tertiary transition-colors focus:bg-bg-tertiary focus:outline-none"
                    >
                      <div className="flex items-center">
                        <span className="mr-3 text-green-500">
                          {result.type === 'task' ? '📝' : 
                           result.type === 'note' ? '📄' : 
                           result.type === 'snippet' ? '💾' : '💡'}
                        </span>
                        <div className="flex-1">
                          <div className="font-medium text-text-primary">{result.title}</div>
                          <div className="text-xs text-text-secondary">
                            {result.projectName} • {result.status} • Score: {result.score?.toFixed(1)}
                          </div>
                          {result.content && (
                            <div className="text-sm text-text-secondary truncate mt-1">
                              {result.content.substring(0, 50)}...
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Notes */}
              {searchResults.notes.length > 0 && (
                <div className="mb-2">
                  <div className="text-xs font-medium text-text-secondary px-2 mb-1">Notes</div>
                  {searchResults.notes.slice(0, 3).map((result) => (
                    <button
                      key={`note-${result.id}`}
                      onClick={() => handleResultSelect(result)}
                      className="w-full text-left px-3 py-2 rounded hover:bg-bg-tertiary transition-colors focus:bg-bg-tertiary focus:outline-none"
                    >
                      <div className="flex items-center">
                        <span className="mr-3 text-purple-500">📄</span>
                        <div className="flex-1">
                          <div className="font-medium text-text-primary">{result.title}</div>
                          <div className="text-xs text-text-secondary">
                            {result.projectName} • Score: {result.score?.toFixed(1)}
                          </div>
                          {result.content && (
                            <div className="text-sm text-text-secondary truncate mt-1">
                              {result.content.substring(0, 50)}...
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Snippets */}
              {searchResults.snippets.length > 0 && (
                <div className="mb-2">
                  <div className="text-xs font-medium text-text-secondary px-2 mb-1">Code Snippets</div>
                  {searchResults.snippets.slice(0, 3).map((result) => (
                    <button
                      key={`snippet-${result.id}`}
                      onClick={() => handleResultSelect(result)}
                      className="w-full text-left px-3 py-2 rounded hover:bg-bg-tertiary transition-colors focus:bg-bg-tertiary focus:outline-none"
                    >
                      <div className="flex items-center">
                        <span className="mr-3 text-cyan-500">💾</span>
                        <div className="flex-1">
                          <div className="font-medium text-text-primary">{result.title}</div>
                          <div className="text-xs text-text-secondary">
                            {result.projectName} • Score: {result.score?.toFixed(1)}
                          </div>
                          {result.data?.language && (
                            <div className="text-xs text-accent mt-1">
                              {result.data.language}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Prompts */}
              {searchResults.prompts?.length > 0 && (
                <div className="mb-2">
                  <div className="text-xs font-medium text-text-secondary px-2 mb-1">AI Prompts</div>
                  {searchResults.prompts.slice(0, 3).map((result) => (
                    <button
                      key={`prompt-${result.id}`}
                      onClick={() => handleResultSelect(result)}
                      className="w-full text-left px-3 py-2 rounded hover:bg-bg-tertiary transition-colors focus:bg-bg-tertiary focus:outline-none"
                    >
                      <div className="flex items-center">
                        <span className="mr-3 text-indigo-500">🤖</span>
                        <div className="flex-1">
                          <div className="font-medium text-text-primary">{result.title}</div>
                          <div className="text-xs text-text-secondary">
                            {result.projectName} • Score: {result.score?.toFixed(1)}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* No Results */}
          {!isSearching && query && !hasResults && (
            <div className="p-4 text-center text-text-secondary">
              <div className="mb-2">🔍</div>
              <div>No results found for "{query}"</div>
              <div className="text-sm mt-1">Try a different search term</div>
              <button
                onClick={() => {
                  console.log('🔄 Rebuilding search index...')
                  useSearchStore.getState().rebuildIndex()
                }}
                className="mt-2 px-3 py-1 bg-accent hover:bg-accent/80 text-white text-xs rounded transition-colors"
              >
                Rebuild Search Index
              </button>
            </div>
          )}
          
          {/* Empty State */}
          {!query && (
            <div className="p-4 text-center text-text-secondary">
              <div className="mb-2">🔍</div>
              <div>Start typing to search</div>
              <div className="text-sm mt-1">Search across projects, tasks, and notes</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBar