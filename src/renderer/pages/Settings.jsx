import React from 'react';
import { Card, Input, Button, ThemeToggle } from '../components/ui';
import useAppStore from '../stores/useAppStore';

const Settings = () => {
  const { addNotification } = useAppStore();

  const handleExportSettings = () => {
    try {
      const settings = {
        theme: localStorage.getItem('theme') || 'dark',
        autoSave: true,
        defaultProjectPath: localStorage.getItem('defaultProjectPath') || '',
        exportDate: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(settings, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `projiki-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      addNotification({
        type: 'success',
        title: 'Settings Exported',
        message: 'Your settings have been exported successfully'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Export Failed',
        message: 'Failed to export settings'
      });
    }
  };

  const handleImportSettings = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const settings = JSON.parse(text);
        
        if (settings.theme) {
          localStorage.setItem('theme', settings.theme);
        }
        if (settings.defaultProjectPath) {
          localStorage.setItem('defaultProjectPath', settings.defaultProjectPath);
        }

        addNotification({
          type: 'success',
          title: 'Settings Imported',
          message: 'Settings imported successfully. Refresh to see changes.'
        });
      } catch (error) {
        addNotification({
          type: 'error',
          title: 'Import Failed',
          message: 'Failed to import settings'
        });
      }
    };
    
    input.click();
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      try {
        // Reset theme to dark
        localStorage.setItem('theme', 'dark');
        // Clear default project path
        localStorage.removeItem('defaultProjectPath');
        
        addNotification({
          type: 'success',
          title: 'Settings Reset',
          message: 'Settings reset to defaults. Refresh to see changes.'
        });
      } catch (error) {
        addNotification({
          type: 'error',
          title: 'Reset Failed',
          message: 'Failed to reset settings'
        });
      }
    }
  };

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
            <Button 
              variant="secondary" 
              className="w-full"
              onClick={handleExportSettings}
            >
              Export Settings
            </Button>
            <Button 
              variant="secondary" 
              className="w-full"
              onClick={handleImportSettings}
            >
              Import Settings
            </Button>
            <Button 
              variant="danger" 
              className="w-full"
              onClick={handleResetToDefaults}
            >
              Reset to Defaults
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;