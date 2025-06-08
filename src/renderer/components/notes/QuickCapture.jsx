// src/renderer/components/notes/QuickCapture.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Modal, Button } from '../ui';
import useNotesStore from '../../stores/useNotesStore';

const QuickCapture = ({ isOpen, onClose }) => {
  const { addToUnsortedBin, createNote } = useNotesStore();
  
  const [content, setContent] = useState('');
  const [type, setType] = useState('idea');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef(null);

  // Focus textarea when modal opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setContent('');
      setType('idea');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (saveType) => {
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    try {
      if (saveType === 'bin') {
        // Save to unsorted bin
        await addToUnsortedBin(content.trim(), type);
      } else {
        // Create note directly
        const title = content.trim().split('\n')[0].substring(0, 50);
        await createNote({
          title: title || 'Quick Note',
          content: content.trim(),
          type
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Failed to save quick capture:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    // Ctrl/Cmd + Enter to save to bin
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit('bin');
    }
    // Ctrl/Cmd + Shift + Enter to create note
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit('note');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quick Capture"
      size="lg"
    >
      <div className="space-y-4">
        {/* Type Selector */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Type
          </label>
          <div className="flex flex-wrap gap-2">
            {['idea', 'note', 'todo', 'bug', 'feature', 'meeting'].map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`
                  px-3 py-1 rounded-full text-sm font-medium transition-colors
                  ${type === t 
                    ? 'bg-accent text-white' 
                    : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
                  }
                `}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content Input */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Content
          </label>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What's on your mind? Start typing..."
            className="w-full h-32 px-3 py-2 border border-border rounded-lg resize-none bg-bg-primary text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors duration-200"
          />
          <div className="mt-2 text-xs text-text-muted">
            <div className="flex justify-between">
              <span>{content.length} characters</span>
              <span>
                <kbd className="px-1 py-0.5 bg-bg-secondary rounded text-xs">⌘/Ctrl</kbd> + 
                <kbd className="px-1 py-0.5 bg-bg-secondary rounded text-xs ml-1">Enter</kbd> for bin, 
                <kbd className="px-1 py-0.5 bg-bg-secondary rounded text-xs ml-1">⌘/Ctrl</kbd> + 
                <kbd className="px-1 py-0.5 bg-bg-secondary rounded text-xs ml-1">Shift</kbd> + 
                <kbd className="px-1 py-0.5 bg-bg-secondary rounded text-xs ml-1">Enter</kbd> for note
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-bg-secondary rounded-lg p-4">
          <h4 className="text-sm font-medium text-text-primary mb-3">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-600">
                  <path d="M3 6h18l-2 13H5L3 6z"/>
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </div>
              <p className="text-sm font-medium text-text-primary">Save to Bin</p>
              <p className="text-xs text-text-muted">Organize later</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>
              <p className="text-sm font-medium text-text-primary">Create Note</p>
              <p className="text-xs text-text-muted">Full note now</p>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => handleSubmit('bin')}
              disabled={!content.trim() || isSubmitting}
              className="border-orange-200 text-orange-600 hover:bg-orange-50"
            >
              {isSubmitting ? 'Saving...' : 'Save to Bin'}
            </Button>
            <Button
              variant="primary"
              onClick={() => handleSubmit('note')}
              disabled={!content.trim() || isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Note'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default QuickCapture;