import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge } from '../components/ui';
import ModeToggle from '../components/modes/ModeToggle';
import ProjectForm from '../components/projects/ProjectForm';
import TaskForm from '../components/tasks/TaskForm';
import BugForm from '../components/tasks/BugForm';
import PromptForm from '../components/prompts/PromptForm';
import QuickCapture from '../components/notes/QuickCapture';
import useProjectStore from '../stores/useProjectStore';
import useTaskStore from '../stores/useTaskStore';
import useNotesStore from '../stores/useNotesStore';
import usePromptStore from '../stores/usePromptStore';
import useSnippetStore from '../stores/useSnippetStore';
import useAppStore from '../stores/useAppStore';

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Modal states
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showBugForm, setShowBugForm] = useState(false);
  const [showPromptForm, setShowPromptForm] = useState(false);
  const [showQuickCapture, setShowQuickCapture] = useState(false);

  // Get data from stores
  const projectsLength = useProjectStore(state => state.projects?.length || 0);
  const projects = useProjectStore(state => state.projects || []);
  const tasksLength = useTaskStore(state => state.tasks?.length || 0);
  const tasks = useTaskStore(state => state.tasks || []);
  const notesLength = useNotesStore(state => state.notes?.length || 0);
  const notes = useNotesStore(state => state.notes || []);
  const promptsLength = usePromptStore(state => state.prompts?.length || 0);
  const prompts = usePromptStore(state => state.prompts || []);
  const snippetsLength = useSnippetStore(state => state.snippets?.length || 0);
  const snippets = useSnippetStore(state => state.snippets || []);
  const currentMode = useAppStore(state => state.currentMode || 'structured');

  // Calculate comprehensive stats
  const stats = useMemo(() => {
    const activeProjects = projects.filter(p => p?.status === 'active');
    const completedTasks = tasks.filter(t => t?.status === 'completed');
    const bugs = tasks.filter(t => t?.type === 'bug');
    
    const today = new Date().toDateString();
    const todayTasks = completedTasks.filter(t => {
      if (!t?.updatedAt) return false;
      return new Date(t.updatedAt).toDateString() === today;
    });
    
    const avgProgress = activeProjects.length > 0 
      ? Math.round(activeProjects.reduce((acc, p) => acc + (p?.progress || 0), 0) / activeProjects.length)
      : 0;
    
    return {
      totalProjects: projectsLength,
      activeProjects: activeProjects.length,
      completedProjects: projects.filter(p => p?.status === 'completed').length,
      totalTasks: tasksLength,
      completedToday: todayTasks.length,
      avgProgress: avgProgress,
      totalBugs: bugs.length,
      openBugs: bugs.filter(b => b.status === 'open').length,
      vault: {
        prompts: promptsLength,
        snippets: snippetsLength,
        notes: notesLength
      }
    };
  }, [projects, tasks, projectsLength, tasksLength, notesLength, promptsLength, snippetsLength]);

  // Get recent activity
  const recentActivity = useMemo(() => {
    const activities = [];
    
    const recentNotes = [...notes].slice(-3);
    recentNotes.forEach(note => {
      if (note?.id) {
        activities.push({
          type: 'note',
          action: 'created',
          item: note.title || (note.content && note.content.substring(0, 30) + '...') || 'Untitled note',
          time: note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'Recently',
          id: note.id
        });
      }
    });

    const completedTasks = [...tasks].filter(t => t?.status === 'completed').slice(-3);
    completedTasks.forEach(task => {
      if (task?.id) {
        activities.push({
          type: 'task',
          action: 'completed',
          item: task.title || 'Untitled task',
          time: task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : 'Recently',
          id: task.id
        });
      }
    });

    const recentPrompts = [...prompts].slice(-2);
    recentPrompts.forEach(prompt => {
      if (prompt?.id) {
        activities.push({
          type: 'prompt',
          action: 'saved',
          item: prompt.title || 'Untitled prompt',
          time: prompt.createdAt ? new Date(prompt.createdAt).toLocaleDateString() : 'Recently',
          id: prompt.id
        });
      }
    });

    return [...activities].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);
  }, [notes, tasks, prompts, notesLength, tasksLength, promptsLength]);

  // Get active projects with progress
  const activeProjectsWithProgress = useMemo(() => {
    return projects
      .filter(p => p?.status === 'active')
      .map(project => {
        const projectTasks = tasks.filter(t => t?.projectId === project.id);
        const completedTasks = projectTasks.filter(t => t?.status === 'completed');
        const progress = projectTasks.length > 0 
          ? Math.round((completedTasks.length / projectTasks.length) * 100)
          : 0;
        
        return {
          ...project,
          taskCount: projectTasks.length,
          progress
        };
      })
      .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
      .slice(0, 3);
  }, [projects, tasks]);

  // Priority tasks for focus
  const priorityTasks = useMemo(() => {
    return tasks
      .filter(t => t?.status !== 'completed' && (t?.priority === 'high' || t?.priority === 'urgent'))
      .sort((a, b) => {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      })
      .slice(0, 3);
  }, [tasks]);

  // Quick Action Handlers
  const handleCreateProject = () => {
    setShowProjectForm(true);
  };

  const handleCreateTask = () => {
    setShowTaskForm(true);
  };

  const handleCreatePrompt = () => {
    setShowPromptForm(true);
  };

  const handleQuickCapture = () => {
    setShowQuickCapture(true);
  };

  const handleNavigateToProjects = () => {
    navigate('/projects');
  };

  const handleNavigateToVault = () => {
    navigate('/vault');
  };

  const handleNavigateToSnippets = () => {
    navigate('/snippets');
  };

  const handleNavigateToTasks = () => {
    navigate('/tasks');
  };

  const handleTrackMilestone = () => {
    // Navigate to tasks with bug tracking focus
    navigate('/tasks', { state: { filterType: 'milestone' } });
  };

  const handleReportBug = () => {
    // Open dedicated bug form
    setShowBugForm(true);
  };

  const handleBrainstorm = () => {
    // Open quick capture for brainstorming
    setShowQuickCapture(true);
  };

  // Mode-specific content configurations
  const getModeConfig = () => {
    if (currentMode === 'structured') {
      return {
        primaryColor: 'blue',
        accentColor: 'indigo',
        icon: '🧱',
        greeting: 'Ready to build systematically?',
        subtitle: 'Structured development workflow active',
        quickActions: [
          { label: 'New Project', icon: '📁', primary: true, action: handleCreateProject },
          { label: 'Create Task', icon: '✓', primary: false, action: handleCreateTask },
          { label: 'Track Milestone', icon: '🎯', primary: false, action: handleTrackMilestone },
          { label: 'Report Bug', icon: '🐛', primary: false, action: handleReportBug }
        ],
        focusAreas: ['Projects', 'Tasks', 'Timeline', 'Documentation']
      };
    } else {
      return {
        primaryColor: 'purple',
        accentColor: 'pink',
        icon: '🧠',
        greeting: 'Ready to flow and create?',
        subtitle: 'Creative AI-assisted workflow active',
        quickActions: [
          { label: 'Quick Capture', icon: '⚡', primary: true, action: handleQuickCapture },
          { label: 'New Prompt', icon: '🤖', primary: false, action: handleCreatePrompt },
          { label: 'Code Snippet', icon: '💾', primary: false, action: handleNavigateToSnippets },
          { label: 'Brainstorm', icon: '💡', primary: false, action: handleBrainstorm }
        ],
        focusAreas: ['AI Vault', 'Quick Notes', 'Code Snippets', 'Ideas']
      };
    }
  };

  const modeConfig = getModeConfig();

  const WelcomeHero = () => (
    <motion.div
      key={currentMode}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-gradient-to-r ${
        currentMode === 'structured' 
          ? 'from-blue-500/10 to-indigo-500/10 border-blue-200/20' 
          : 'from-purple-500/10 to-pink-500/10 border-purple-200/20'
      } rounded-lg p-6 mb-6 border backdrop-blur-sm`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <motion.span 
              className="text-3xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              {modeConfig.icon}
            </motion.span>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">
                {modeConfig.greeting}
              </h1>
              <p className="text-text-secondary">
                {modeConfig.subtitle}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-text-muted mt-3">
            <span>{stats.activeProjects} active projects</span>
            <span>•</span>
            <span>{stats.totalTasks} total tasks</span>
            {currentMode === 'structured' && stats.openBugs > 0 && (
              <>
                <span>•</span>
                <span className="text-orange-600">{stats.openBugs} open bugs</span>
              </>
            )}
            {currentMode === 'creative' && (
              <>
                <span>•</span>
                <span className="text-purple-600">{stats.vault.prompts} prompts saved</span>
              </>
            )}
          </div>
        </div>
        
        <ModeToggle variant="card" />
      </div>
    </motion.div>
  );

  const QuickActions = () => (
    <motion.div
      key={`actions-${currentMode}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">Quick Actions</h2>
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <span>Focus:</span>
          <div className="flex gap-1">
            {modeConfig.focusAreas.slice(0, 2).map((area, idx) => (
              <span key={idx} className={`px-2 py-1 rounded text-xs ${
                currentMode === 'structured' 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
              }`}>
                {area}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {modeConfig.quickActions.map((action, idx) => (
          <motion.div
            key={`${currentMode}-action-${idx}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + (idx * 0.05) }}
          >
            <Button 
              variant={action.primary ? "primary" : "secondary"} 
              className="flex items-center gap-2 h-12 w-full group transition-all duration-200 hover:scale-105"
              onClick={action.action}
            >
              <motion.span 
                className="text-lg"
                whileHover={{ scale: 1.2, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                {action.icon}
              </motion.span>
              <span className="font-medium">{action.label}</span>
            </Button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  const StatsCards = () => {
    const getStatsConfig = () => {
      if (currentMode === 'structured') {
        return [
          {
            label: 'Active Projects',
            value: stats.activeProjects,
            icon: '📁',
            color: 'blue',
            bgColor: 'bg-blue-500/20',
            textColor: 'text-blue-500'
          },
          {
            label: 'Total Tasks',
            value: stats.totalTasks,
            icon: '✓',
            color: 'green',
            bgColor: 'bg-green-500/20',
            textColor: 'text-green-500'
          },
          {
            label: 'Open Bugs',
            value: stats.openBugs,
            icon: '🐛',
            color: 'orange',
            bgColor: 'bg-orange-500/20',
            textColor: 'text-orange-500'
          },
          {
            label: 'Progress',
            value: `${stats.avgProgress}%`,
            icon: '📊',
            color: 'purple',
            bgColor: 'bg-purple-500/20',
            textColor: 'text-purple-500'
          }
        ];
      } else {
        return [
          {
            label: 'AI Prompts',
            value: stats.vault.prompts,
            icon: '🤖',
            color: 'purple',
            bgColor: 'bg-purple-500/20',
            textColor: 'text-purple-500'
          },
          {
            label: 'Code Snippets',
            value: stats.vault.snippets,
            icon: '💾',
            color: 'cyan',
            bgColor: 'bg-cyan-500/20',
            textColor: 'text-cyan-500'
          },
          {
            label: 'Quick Notes',
            value: stats.vault.notes,
            icon: '📝',
            color: 'yellow',
            bgColor: 'bg-yellow-500/20',
            textColor: 'text-yellow-500'
          },
          {
            label: 'Completed Today',
            value: stats.completedToday,
            icon: '⚡',
            color: 'green',
            bgColor: 'bg-green-500/20',
            textColor: 'text-green-500'
          }
        ];
      }
    };

    const statsConfig = getStatsConfig();

    return (
      <motion.div
        key={`stats-${currentMode}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="space-y-4"
      >
        <h2 className="text-lg font-semibold text-text-primary">
          {currentMode === 'structured' ? 'Project Overview' : 'Creative Flow Stats'}
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statsConfig.map((stat, idx) => (
            <motion.div
              key={`${currentMode}-stat-${idx}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + (idx * 0.05) }}
            >
              <Card className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-muted">{stat.label}</p>
                    <motion.p 
                      key={stat.value}
                      initial={{ scale: 1.2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`text-2xl font-bold ${stat.textColor}`}
                    >
                      {stat.value}
                    </motion.p>
                  </div>
                  <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <span className="text-xl">{stat.icon}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  };

  const MainContent = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="space-y-6"
      >
        {currentMode === 'structured' ? (
          <>
            <ActiveProjects />
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Development Focus</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-bg-tertiary rounded-lg">
                  <span className="text-text-primary">Bug Resolution</span>
                  <Badge variant="warning">{stats.openBugs} open</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-bg-tertiary rounded-lg">
                  <span className="text-text-primary">Project Completion</span>
                  <Badge variant="success">{stats.avgProgress}% avg</Badge>
                </div>
              </div>
            </Card>
          </>
        ) : (
          <>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">AI Creative Flow</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-500">{stats.vault.prompts}</div>
                    <div className="text-xs text-text-muted">Prompts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-500">{stats.vault.snippets}</div>
                    <div className="text-xs text-text-muted">Snippets</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-500">{stats.vault.notes}</div>
                    <div className="text-xs text-text-muted">Notes</div>
                  </div>
                </div>
                <Button variant="primary" className="w-full" onClick={handleNavigateToVault}>
                  Explore AI Vault
                </Button>
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Creative Projects</h3>
              {activeProjectsWithProgress.filter(p => p.mode === 'creative').length > 0 ? (
                <div className="space-y-3">
                  {activeProjectsWithProgress.filter(p => p.mode === 'creative').map(project => (
                    <div key={project.id} className="p-3 bg-bg-tertiary rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-text-primary">{project.name}</span>
                        <Badge variant="secondary">Creative</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-text-muted mb-3">No creative projects yet</p>
                  <Button variant="primary" onClick={handleCreateProject}>
                    Start Creative Project
                  </Button>
                </div>
              )}
            </Card>
          </>
        )}
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="space-y-6"
      >
        <RecentActivity />
        {currentMode === 'structured' ? <TodaysFocus /> : <QuickCaptureWidget />}
      </motion.div>
    </div>
  );

  const ActiveProjects = () => (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Active Projects</h3>
        <Button variant="ghost" size="small" onClick={handleNavigateToProjects}>
          View All
        </Button>
      </div>
      
      {activeProjectsWithProgress.length > 0 ? (
        <div className="space-y-4">
          {activeProjectsWithProgress.map(project => (
            <div key={project.id} className="flex items-center justify-between p-4 bg-bg-tertiary rounded-lg hover:bg-bg-secondary transition-colors cursor-pointer">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-medium text-text-primary">{project.name || 'Untitled Project'}</h4>
                  <Badge variant={project.mode === 'structured' ? 'primary' : 'secondary'} size="small">
                    {project.mode || 'structured'}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-text-muted">
                  <span>{project.taskCount} tasks</span>
                  {project.deadline && <span>Due {new Date(project.deadline).toLocaleDateString()}</span>}
                </div>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-text-muted mb-1">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-bg-primary rounded-full h-2">
                    <div 
                      className="bg-accent h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-text-muted mb-4">No active projects yet</p>
          <Button variant="primary" onClick={handleCreateProject}>
            Create Your First Project
          </Button>
        </div>
      )}
    </Card>
  );

  const RecentActivity = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      {recentActivity.length > 0 ? (
        <>
          <div className="space-y-3">
            {recentActivity.map((activity, idx) => (
              <div key={`${activity.type}-${activity.id}-${idx}`} className="flex items-center gap-3 p-3 bg-bg-tertiary rounded-lg">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  activity.type === 'note' ? 'bg-blue-500/20 text-blue-500' :
                  activity.type === 'task' ? 'bg-green-500/20 text-green-500' :
                  activity.type === 'prompt' ? 'bg-purple-500/20 text-purple-500' :
                  'bg-cyan-500/20 text-cyan-500'
                }`}>
                  {activity.type === 'note' ? '📝' : 
                   activity.type === 'task' ? '✓' : 
                   activity.type === 'prompt' ? '🤖' : '💾'}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-text-primary">
                    <span className="capitalize">{activity.action}</span> {activity.item}
                  </p>
                  <p className="text-xs text-text-muted">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="w-full mt-4">View All Activity</Button>
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-text-muted">No recent activity</p>
        </div>
      )}
    </Card>
  );

  const TodaysFocus = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Today's Focus</h3>
      {priorityTasks.length > 0 ? (
        <>
          <div className="space-y-3">
            {priorityTasks.map(task => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-bg-tertiary rounded-lg">
                <div>
                  <p className="text-sm font-medium text-text-primary">{task.title || 'Untitled Task'}</p>
                  <p className="text-xs text-text-muted">
                    {projects.find(p => p.id === task.projectId)?.name || 'No project'}
                  </p>
                </div>
                <Badge 
                  variant={task.priority === 'urgent' ? 'danger' : 'warning'} 
                  size="small"
                >
                  {task.priority || 'medium'}
                </Badge>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="w-full mt-4" onClick={handleNavigateToTasks}>
            View All Tasks
          </Button>
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-text-muted mb-2">All caught up! 🎉</p>
          <p className="text-xs text-text-muted">No high priority tasks for today</p>
        </div>
      )}
    </Card>
  );

  const QuickCaptureWidget = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Quick Capture</h3>
      <div className="space-y-3">
        <Button variant="primary" className="w-full flex items-center gap-2" onClick={handleQuickCapture}>
          <span>⚡</span>
          <span>Capture Idea</span>
        </Button>
        <Button variant="secondary" className="w-full flex items-center gap-2" onClick={handleCreatePrompt}>
          <span>🤖</span>
          <span>Save Prompt</span>
        </Button>
        <Button variant="secondary" className="w-full flex items-center gap-2" onClick={handleNavigateToSnippets}>
          <span>💾</span>
          <span>Code Snippet</span>
        </Button>
      </div>
      
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-text-muted mb-2">Recent captures</p>
        <div className="space-y-2">
          {notes.slice(-2).map((note, idx) => (
            <div key={note.id || idx} className="text-xs text-text-secondary p-2 bg-bg-tertiary rounded">
              {note.title || note.content?.substring(0, 30) + '...' || 'Untitled note'}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMode}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <WelcomeHero />
          <QuickActions />
          <StatsCards />
          <MainContent />
        </motion.div>
      </AnimatePresence>

      {/* Modal Components */}
      <ProjectForm
        isOpen={showProjectForm}
        onClose={() => setShowProjectForm(false)}
      />

      <TaskForm
        isOpen={showTaskForm}
        onClose={() => setShowTaskForm(false)}
        defaultStatus="todo"
        onSuccess={() => setShowTaskForm(false)}
      />

      <BugForm
        isOpen={showBugForm}
        onClose={() => setShowBugForm(false)}
        mode="create"
      />

      <PromptForm
        isOpen={showPromptForm}
        onClose={() => setShowPromptForm(false)}
        mode="create"
      />

      <QuickCapture
        isOpen={showQuickCapture}
        onClose={() => setShowQuickCapture(false)}
      />
    </div>
  );
};

export default Dashboard;