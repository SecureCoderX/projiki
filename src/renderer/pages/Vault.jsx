import React from 'react';
import { Card, Button } from '../components/ui';

const Vault = () => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Prompt Vault</h1>
          <p className="text-text-secondary">Store and organize your AI prompts</p>
        </div>
        <Button variant="primary">
          New Prompt
        </Button>
      </div>

      <Card>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-accent/20 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2 text-text-primary">No Prompts Yet</h3>
          <p className="text-text-secondary mb-4">Save your first AI prompt to get started</p>
          <Button variant="primary">Add Prompt</Button>
        </div>
      </Card>
    </div>
  );
};

export default Vault;