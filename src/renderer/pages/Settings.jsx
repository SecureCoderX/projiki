import React from 'react';
import { Card, Input, Button, ThemeToggle } from '../components/ui';

const Settings = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Settings</h1>
        <p className="text-text-secondary">Configure your Projiki preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4 text-text-primary">Appearance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-text-primary">Theme</label>
                <p className="text-xs text-text-muted">Choose your preferred theme</p>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4 text-text-primary">General</h3>
          <div className="space-y-4">
            <Input
              label="Default Project Path"
              placeholder="/home/user/projects"
              helper="Where new projects will be created"
            />
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-text-primary">Auto-save</label>
                <p className="text-xs text-text-muted">Automatically save changes</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4 text-text-primary">About</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Version:</span>
              <span className="text-text-primary">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Platform:</span>
              <span className="text-text-primary">Linux</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">License:</span>
              <span className="text-text-primary">MIT</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4 text-text-primary">Actions</h3>
          <div className="space-y-3">
            <Button variant="secondary" className="w-full">
              Export Settings
            </Button>
            <Button variant="secondary" className="w-full">
              Import Settings
            </Button>
            <Button variant="danger" className="w-full">
              Reset to Defaults
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;