// src/renderer/components/notes/UnsortedBin.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal, Button, Card } from '../ui';
import useNotesStore from '../../stores/useNotesStore';

const UnsortedBin = ({ isOpen, onClose }) => {
  const { 
    unsortedBin, 
    removeFromUnsortedBin, 
    convertBinItemToNote 
  } = useNotesStore();
  
  const [selectedItems, setSelectedItems] = useState(new Set());

  const handleSelectItem = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === unsortedBin.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(unsortedBin.map(item => item.id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (window.confirm(`Delete ${selectedItems.size} items?`)) {
      for (const itemId of selectedItems) {
        await removeFromUnsortedBin(itemId);
      }
      setSelectedItems(new Set());
    }
  };

  const handleConvertToNote = async (itemId) => {
    try {
      await convertBinItemToNote(itemId);
    } catch (error) {
      console.error('Failed to convert bin item to note:', error);
    }
  };

  const handleBulkConvert = async () => {
    try {
      for (const itemId of selectedItems) {
        await convertBinItemToNote(itemId);
      }
      setSelectedItems(new Set());
    } catch (error) {
      console.error('Failed to convert bin items:', error);
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      idea: '💡',
      note: '📝',
      todo: '✅',
      bug: '🐛',
      feature: '✨',
      meeting: '🤝'
    };
    return icons[type] || '📄';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Unsorted Bin (${unsortedBin.length} items)`}
      size="xl"
    >
      <div className="space-y-4">
        {/* Bulk Actions */}
        {unsortedBin.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-bg-secondary rounded-lg">
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedItems.size === unsortedBin.length && unsortedBin.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-border text-accent focus:ring-accent"
                />
                <span className="text-sm text-text-primary">
                  Select All ({selectedItems.size} selected)
                </span>
              </label>
            </div>
            
            {selectedItems.size > 0 && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="primary"
                  size="small"
                  onClick={handleBulkConvert}
                >
                  Convert to Notes ({selectedItems.size})
                </Button>
                <Button
                  variant="outline"
                  size="small"
                  onClick={handleDeleteSelected}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Delete ({selectedItems.size})
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Bin Items */}
        <div className="max-h-96 overflow-y-auto space-y-3">
          {unsortedBin.length === 0 ? (
            <Card padding="large" className="text-center">
              <div className="w-16 h-16 bg-accent/20 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                  <path d="M3 6h18l-2 13H5L3 6z"/>
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-text-primary">Bin is Empty</h3>
              <p className="text-text-secondary mb-4">
                Use Quick Capture to add ideas and thoughts to your bin
              </p>
            </Card>
          ) : (
            <AnimatePresence>
              {unsortedBin.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card 
                    padding="medium" 
                    className={`group hover:bg-bg-secondary transition-colors ${
                      selectedItems.has(item.id) ? 'ring-2 ring-accent bg-accent/5' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Checkbox */}
                      <label className="flex-shrink-0 mt-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.id)}
                          onChange={() => handleSelectItem(item.id)}
                          className="rounded border-border text-accent focus:ring-accent"
                        />
                      </label>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-lg">{getTypeIcon(item.type)}</span>
                          <span className="text-sm font-medium text-accent">
                            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                          </span>
                          <span className="text-xs text-text-muted">
                            {formatDate(item.createdAt)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-text-primary leading-relaxed">
                          {item.content}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="primary"
                          size="small"
                          onClick={() => handleConvertToNote(item.id)}
                          title="Convert to note"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14,2 14,8 20,8"/>
                          </svg>
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="small"
                          onClick={() => removeFromUnsortedBin(item.id)}
                          className="text-red-500 hover:text-red-600"
                          title="Delete item"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3,6 5,6 21,6"/>
                            <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2"/>
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between pt-4 border-t border-border">
          <div className="text-sm text-text-muted">
            {unsortedBin.length > 0 && (
              <span>
                {unsortedBin.length} items • 
                {selectedItems.size > 0 && ` ${selectedItems.size} selected`}
              </span>
            )}
          </div>
          
          <Button
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default UnsortedBin;