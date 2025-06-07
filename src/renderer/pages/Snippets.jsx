import React from 'react';
import { Card, Button } from '../components/ui';

const Snippets = () => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Code Snippets</h1>
          <p className="text-text-secondary">Manage your reusable code snippets</p>
        </div>
        <Button variant="primary">
          New Snippet
        </Button>
      </div>

      <Card>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-accent/20 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
              <polyline points="16,18 22,12 16,6"/>
              <polyline points="8,6 2,12 8,18"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2 text-text-primary">No Snippets Yet</h3>
          <p className="text-text-secondary mb-4">Save your first code snippet</p>
          <Button variant="primary">Add Snippet</Button>
        </div>
      </Card>
    </div>
  );
};

export default Snippets;