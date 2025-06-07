import React from 'react';
import { Card, Button } from '../components/ui';

const Notes = () => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Notes</h1>
          <p className="text-text-secondary">Write and organize your thoughts</p>
        </div>
        <Button variant="primary">
          New Note
        </Button>
      </div>

      <Card>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-accent/20 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2 text-text-primary">No Notes Yet</h3>
          <p className="text-text-secondary mb-4">Create your first note</p>
          <Button variant="primary">Create Note</Button>
        </div>
      </Card>
    </div>
  );
};

export default Notes;