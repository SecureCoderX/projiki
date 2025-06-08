// src/renderer/components/ui/CodeEditor.jsx
import React, { useState, useRef } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import useAppStore from '../../stores/useAppStore';

const CodeEditor = ({ 
  value = '', 
  onChange, 
  language = 'javascript', 
  placeholder = 'Enter your code here...', 
  error,
  className = '',
  readOnly = false,
  showLineNumbers = true,
  height = '300px'
}) => {
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef(null);
  const { theme } = useAppStore();

  // Language mappings for syntax highlighter
  const getLanguageForHighlighter = (lang) => {
    const mappings = {
      'c++': 'cpp',
      'c#': 'csharp',
      'objective-c': 'objectivec',
      'shell': 'bash',
      'powershell': 'powershell',
      'json': 'json',
      'yaml': 'yaml',
      'markdown': 'markdown',
      'html': 'markup',
      'scss': 'scss',
      'css': 'css',
      'sql': 'sql'
    };
    return mappings[lang] || lang;
  };

  const handleChange = (e) => {
    if (!readOnly && onChange) {
      onChange(e.target.value);
    }
  };

  const handleKeyDown = (e) => {
    // Handle tab insertion
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const spaces = '  '; // 2 spaces for tab
      
      const newValue = value.substring(0, start) + spaces + value.substring(end);
      onChange?.(newValue);
      
      // Set cursor position after the inserted spaces
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + spaces.length;
        }
      }, 0);
    }
  };

  const syntaxHighlighterStyle = theme === 'dark' ? vscDarkPlus : vs;

  // Read-only version - just show syntax highlighted code
  if (readOnly) {
    return (
      <div className={`${className}`}>
        <div 
          className={`
            relative border rounded-lg overflow-hidden
            ${error ? 'border-red-500' : 'border-border'}
            bg-bg-secondary
          `}
          style={{ height }}
        >
          <div className="absolute top-2 right-2 z-10 px-2 py-1 bg-bg-primary border border-border rounded text-xs text-text-muted font-mono">
            {language.toUpperCase()}
          </div>

          <div className="h-full overflow-auto">
            <SyntaxHighlighter
              language={getLanguageForHighlighter(language)}
              style={syntaxHighlighterStyle}
              customStyle={{
                margin: 0,
                padding: showLineNumbers ? '12px 12px 12px 60px' : '12px',
                background: 'transparent',
                fontSize: '14px',
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                lineHeight: '22px',
                minHeight: '100%'
              }}
              showLineNumbers={showLineNumbers}
              lineNumberStyle={{
                color: theme === 'dark' ? '#6b7280' : '#9ca3af',
                paddingRight: '12px',
                marginRight: '12px',
                borderRight: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
                fontSize: '12px'
              }}
              wrapLines={true}
              PreTag="div"
            >
              {value || placeholder}
            </SyntaxHighlighter>
          </div>
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  // Editable version - simple textarea only, no overlays
  return (
    <div className={`${className}`}>
      <div 
        className={`
          relative border rounded-lg overflow-hidden transition-colors duration-200
          ${focused ? 'ring-2 ring-accent border-accent' : 'border-border hover:border-text-muted'}
          ${error ? 'border-red-500 ring-2 ring-red-500/20' : ''}
          bg-bg-primary
        `}
        style={{ height }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-bg-secondary border-b border-border">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-text-muted font-mono">{language.toUpperCase()}</span>
            <span className="text-xs text-text-muted">•</span>
            <span className="text-xs text-text-muted">
              {value.split('\n').length} lines
            </span>
          </div>
          <div className="text-xs text-text-muted">
            Tab for indentation
          </div>
        </div>

        {/* Simple editor area */}
        <div className="relative" style={{ height: `calc(${height} - 40px)` }}>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={!value ? placeholder : ''}
            className={`
              w-full h-full resize-none border-none outline-none bg-transparent
              font-mono text-sm p-3
              text-text-primary placeholder-text-muted
              scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent
            `}
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
              fontSize: '14px',
              lineHeight: '22px',
              letterSpacing: '0.025em',
              tabSize: 2
            }}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />

          {/* Empty State */}
          {!value && !focused && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-text-muted text-sm text-center">
                <div className="mb-2">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto opacity-50">
                    <polyline points="16,18 22,12 16,6"/>
                    <polyline points="8,6 2,12 8,18"/>
                  </svg>
                </div>
                <p>Start typing your {language} code</p>
                <p className="text-xs mt-1 opacity-75">Syntax highlighting available</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
};

export default CodeEditor;