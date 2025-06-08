// src/renderer/components/common/SearchBar.jsx
import React, { useState, useRef, useEffect } from 'react'
import { useSearchStore } from '../../stores'

/**
 * SearchBar component - Real search with results
 */
const SearchBar = ({ className = '', onResultSelect = null }) => {
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef(null)
  const resultsRef = useRef(null)
  
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

  // Handle result selection
  const handleResultSelect = (result) => {
    console.log('🔍 Selected result:', result)
    
    if (onResultSelect) {
      onResultSelect(result)
    }
    
    setIsOpen(false)
    inputRef.current?.blur()
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
              <span>🔍</span>
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
              ✕
            </button>
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      {isOpen && query && (
        <div
          ref={resultsRef}
          className="fixed inset-x-4 mt-1 bg-bg-secondary border border-border-primary rounded-lg shadow-xl max-h-96 overflow-y-auto"
          style={{ 
            zIndex: 9999,
            top: inputRef.current ? inputRef.current.getBoundingClientRect().bottom + 4 : 'auto',
            left: inputRef.current ? inputRef.current.getBoundingClientRect().left : 'auto',
            right: inputRef.current ? window.innerWidth - inputRef.current.getBoundingClientRect().right : 'auto',
            maxWidth: inputRef.current ? inputRef.current.getBoundingClientRect().width : 'auto',
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
                      key={result.id}
                      onClick={() => handleResultSelect(result)}
                      className="w-full text-left px-3 py-2 rounded hover:bg-bg-tertiary transition-colors"
                    >
                      <div className="flex items-center">
                        <span className="mr-2">📁</span>
                        <div className="flex-1">
                          <div className="font-medium text-text-primary">{result.title}</div>
                          {result.content && (
                            <div className="text-sm text-text-secondary truncate">
                              {result.content.substring(0, 60)}...
                            </div>
                          )}
                          <div className="text-xs text-text-secondary mt-1">
                            Score: {result.score?.toFixed(1)} • {result.status}
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
                      key={result.id}
                      onClick={() => handleResultSelect(result)}
                      className="w-full text-left px-3 py-2 rounded hover:bg-bg-tertiary transition-colors"
                    >
                      <div className="flex items-center">
                        <span className="mr-2">
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

              {/* Notes & Snippets */}
              {searchResults.notes.length > 0 && (
                <div className="mb-2">
                  <div className="text-xs font-medium text-text-secondary px-2 mb-1">Notes</div>
                  {searchResults.notes.slice(0, 3).map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultSelect(result)}
                      className="w-full text-left px-3 py-2 rounded hover:bg-bg-tertiary transition-colors"
                    >
                      <div className="flex items-center">
                        <span className="mr-2">📄</span>
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

              {searchResults.snippets.length > 0 && (
                <div className="mb-2">
                  <div className="text-xs font-medium text-text-secondary px-2 mb-1">Snippets</div>
                  {searchResults.snippets.slice(0, 3).map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultSelect(result)}
                      className="w-full text-left px-3 py-2 rounded hover:bg-bg-tertiary transition-colors"
                    >
                      <div className="flex items-center">
                        <span className="mr-2">💾</span>
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
                className="mt-2 px-2 py-1 bg-gray-600 hover:bg-gray-500 text-white text-xs rounded"
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