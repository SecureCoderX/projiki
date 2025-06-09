import React from 'react';
import { Card } from '../ui';

const TimelineView = ({ tasks = [] }) => {
  return (
    <div className="space-y-4">
      {tasks.length === 0 ? (
        <Card className="p-8 text-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 mx-auto mb-4">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
          <h3 className="text-lg font-medium text-text-primary mb-2">
            No Tasks in Timeline
          </h3>
          <p className="text-text-muted">
            Tasks with dates will appear here in timeline view.
          </p>
        </Card>
      ) : (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Timeline View
          </h3>
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                <div className={`w-3 h-3 rounded-full ${
                  task.status === 'done' ? 'bg-green-500' :
                  task.status === 'in-progress' ? 'bg-blue-500' :
                  'bg-gray-400'
                }`} />
                <div className="flex-1">
                  <h4 className="font-medium text-text-primary">{task.title}</h4>
                  <p className="text-sm text-text-muted">
                    {task.status} • Created {new Date(task.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default TimelineView;