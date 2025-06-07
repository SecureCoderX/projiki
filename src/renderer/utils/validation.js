// src/renderer/utils/validation.js

/**
 * Data validation utilities for Projiki
 * Ensures data integrity and provides schema validation
 */

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

export const PROJECT_SCHEMA = {
  id: { type: 'string', required: true, minLength: 1 },
  name: { type: 'string', required: true, minLength: 1, maxLength: 200 },
  description: { type: 'string', required: false, maxLength: 1000 },
  mode: { type: 'enum', required: true, values: ['structured', 'creative', 'hybrid'] },
  status: { type: 'enum', required: true, values: ['active', 'paused', 'completed', 'archived'] },
  createdAt: { type: 'string', required: true, format: 'iso-date' },
  updatedAt: { type: 'string', required: true, format: 'iso-date' },
  settings: {
    type: 'object',
    required: true,
    properties: {
      defaultView: { type: 'enum', values: ['kanban', 'timeline', 'list', 'creative'] },
      autoSave: { type: 'boolean' },
      syncFrequency: { type: 'number', min: 1000 }
    }
  },
  metadata: {
    type: 'object',
    required: true,
    properties: {
      tags: { type: 'array', items: { type: 'string' } },
      priority: { type: 'enum', values: ['low', 'medium', 'high'] },
      deadline: { type: 'string', format: 'iso-date', required: false },
      estimatedHours: { type: 'number', min: 0, required: false }
    }
  }
}

export const TASK_SCHEMA = {
  id: { type: 'string', required: true, minLength: 1 },
  projectId: { type: 'string', required: true, minLength: 1 },
  title: { type: 'string', required: true, minLength: 1, maxLength: 300 },
  content: { type: 'string', required: false, maxLength: 10000 },
  type: { type: 'enum', required: true, values: ['task', 'note', 'snippet', 'idea'] },
  status: { type: 'enum', required: true, values: ['todo', 'in-progress', 'done', 'blocked'] },
  mode: { type: 'enum', required: true, values: ['structured', 'creative'] },
  position: {
    type: 'object',
    required: true,
    properties: {
      x: { type: 'number' },
      y: { type: 'number' }
    }
  },
  createdAt: { type: 'string', required: true, format: 'iso-date' },
  updatedAt: { type: 'string', required: true, format: 'iso-date' },
  metadata: {
    type: 'object',
    required: true,
    properties: {
      tags: { type: 'array', items: { type: 'string' } },
      priority: { type: 'enum', values: ['low', 'medium', 'high'] },
      estimatedTime: { type: 'number', min: 0, required: false },
      actualTime: { type: 'number', min: 0, required: false },
      dependencies: { type: 'array', items: { type: 'string' } },
      assignee: { type: 'string', required: false }
    }
  }
}

export const SETTINGS_SCHEMA = {
  version: { type: 'string', required: true },
  createdAt: { type: 'string', required: true, format: 'iso-date' },
  updatedAt: { type: 'string', required: true, format: 'iso-date' },
  preferences: {
    type: 'object',
    required: true,
    properties: {
      autoSave: { type: 'boolean' },
      autoSaveInterval: { type: 'number', min: 1000 },
      createBackups: { type: 'boolean' },
      maxBackups: { type: 'number', min: 1, max: 50 },
      defaultProjectMode: { type: 'enum', values: ['structured', 'creative', 'hybrid'] },
      exportFormat: { type: 'enum', values: ['json', 'markdown'] }
    }
  },
  statistics: {
    type: 'object',
    required: true,
    properties: {
      totalProjects: { type: 'number', min: 0 },
      totalTasks: { type: 'number', min: 0 },
      appLaunches: { type: 'number', min: 0 },
      lastLaunch: { type: 'string', format: 'iso-date' }
    }
  }
}

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

/**
 * Validate a value against a schema property
 */
function validateProperty(value, schema, propertyName = 'value') {
  const errors = []

  // Check required
  if (schema.required && (value === undefined || value === null)) {
    errors.push(`${propertyName} is required`)
    return errors
  }

  // Skip validation if value is undefined/null and not required
  if (value === undefined || value === null) {
    return errors
  }

  // Type validation
  switch (schema.type) {
    case 'string':
      if (typeof value !== 'string') {
        errors.push(`${propertyName} must be a string`)
      } else {
        if (schema.minLength && value.length < schema.minLength) {
          errors.push(`${propertyName} must be at least ${schema.minLength} characters`)
        }
        if (schema.maxLength && value.length > schema.maxLength) {
          errors.push(`${propertyName} must be no more than ${schema.maxLength} characters`)
        }
        if (schema.format === 'iso-date' && !isValidISODate(value)) {
          errors.push(`${propertyName} must be a valid ISO date string`)
        }
      }
      break

    case 'number':
      if (typeof value !== 'number' || isNaN(value)) {
        errors.push(`${propertyName} must be a number`)
      } else {
        if (schema.min !== undefined && value < schema.min) {
          errors.push(`${propertyName} must be at least ${schema.min}`)
        }
        if (schema.max !== undefined && value > schema.max) {
          errors.push(`${propertyName} must be no more than ${schema.max}`)
        }
      }
      break

    case 'boolean':
      if (typeof value !== 'boolean') {
        errors.push(`${propertyName} must be a boolean`)
      }
      break

    case 'array':
      if (!Array.isArray(value)) {
        errors.push(`${propertyName} must be an array`)
      } else if (schema.items) {
        value.forEach((item, index) => {
          const itemErrors = validateProperty(item, schema.items, `${propertyName}[${index}]`)
          errors.push(...itemErrors)
        })
      }
      break

    case 'object':
      if (typeof value !== 'object' || Array.isArray(value)) {
        errors.push(`${propertyName} must be an object`)
      } else if (schema.properties) {
        Object.entries(schema.properties).forEach(([key, propSchema]) => {
          const propErrors = validateProperty(value[key], propSchema, `${propertyName}.${key}`)
          errors.push(...propErrors)
        })
      }
      break

    case 'enum':
      if (!schema.values.includes(value)) {
        errors.push(`${propertyName} must be one of: ${schema.values.join(', ')}`)
      }
      break
  }

  return errors
}

/**
 * Validate an object against a schema
 */
function validateObject(obj, schema) {
  if (!obj || typeof obj !== 'object') {
    return { isValid: false, errors: ['Data must be an object'] }
  }

  const errors = []

  Object.entries(schema).forEach(([key, propSchema]) => {
    const propErrors = validateProperty(obj[key], propSchema, key)
    errors.push(...propErrors)
  })

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validate a project object
 */
export function validateProject(project) {
  return validateObject(project, PROJECT_SCHEMA)
}

/**
 * Validate a task object
 */
export function validateTask(task) {
  return validateObject(task, TASK_SCHEMA)
}

/**
 * Validate settings object
 */
export function validateSettings(settings) {
  return validateObject(settings, SETTINGS_SCHEMA)
}

/**
 * Validate an array of projects
 */
export function validateProjects(projects) {
  if (!Array.isArray(projects)) {
    return { isValid: false, errors: ['Projects must be an array'] }
  }

  const allErrors = []
  let validCount = 0

  projects.forEach((project, index) => {
    const validation = validateProject(project)
    if (validation.isValid) {
      validCount++
    } else {
      validation.errors.forEach(error => {
        allErrors.push(`Project ${index}: ${error}`)
      })
    }
  })

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    validCount,
    totalCount: projects.length
  }
}

/**
 * Validate an array of tasks
 */
export function validateTasks(tasks) {
  if (!Array.isArray(tasks)) {
    return { isValid: false, errors: ['Tasks must be an array'] }
  }

  const allErrors = []
  let validCount = 0

  tasks.forEach((task, index) => {
    const validation = validateTask(task)
    if (validation.isValid) {
      validCount++
    } else {
      validation.errors.forEach(error => {
        allErrors.push(`Task ${index}: ${error}`)
      })
    }
  })

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    validCount,
    totalCount: tasks.length
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Check if a string is a valid ISO date
 */
function isValidISODate(dateString) {
  try {
    const date = new Date(dateString)
    return date.toISOString() === dateString
  } catch {
    return false
  }
}

/**
 * Sanitize and validate project name
 */
export function sanitizeProjectName(name) {
  if (!name || typeof name !== 'string') {
    return 'Untitled Project'
  }

  return name
    .trim()
    .replace(/[<>:"/\\|?*]/g, '') // Remove invalid filename characters
    .substring(0, 200) // Limit length
    || 'Untitled Project'
}

/**
 * Sanitize and validate task title
 */
export function sanitizeTaskTitle(title) {
  if (!title || typeof title !== 'string') {
    return 'Untitled Task'
  }

  return title
    .trim()
    .substring(0, 300) // Limit length
    || 'Untitled Task'
}

/**
 * Validate and sanitize tags array
 */
export function sanitizeTags(tags) {
  if (!Array.isArray(tags)) {
    return []
  }

  return tags
    .filter(tag => typeof tag === 'string' && tag.trim())
    .map(tag => tag.trim().toLowerCase())
    .filter((tag, index, arr) => arr.indexOf(tag) === index) // Remove duplicates
    .slice(0, 20) // Limit number of tags
}

/**
 * Create a default project object with validation
 */
export function createDefaultProject(overrides = {}) {
  const defaultProject = {
    id: overrides.id || `project-${Date.now()}`,
    name: sanitizeProjectName(overrides.name) || 'Untitled Project',
    description: overrides.description || '',
    mode: overrides.mode || 'structured',
    status: overrides.status || 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    settings: {
      defaultView: 'kanban',
      autoSave: true,
      syncFrequency: 30000,
      ...overrides.settings
    },
    metadata: {
      tags: sanitizeTags(overrides.tags) || [],
      priority: overrides.priority || 'medium',
      deadline: overrides.deadline || null,
      estimatedHours: overrides.estimatedHours || null,
      ...overrides.metadata
    }
  }

  const validation = validateProject(defaultProject)
  if (!validation.isValid) {
    console.warn('Created project has validation errors:', validation.errors)
  }

  return defaultProject
}

/**
 * Create a default task object with validation
 */
export function createDefaultTask(projectId, overrides = {}) {
  const defaultTask = {
    id: overrides.id || `task-${Date.now()}`,
    projectId,
    title: sanitizeTaskTitle(overrides.title) || 'Untitled Task',
    content: overrides.content || '',
    type: overrides.type || 'task',
    status: overrides.status || 'todo',
    mode: overrides.mode || 'structured',
    position: overrides.position || { x: 0, y: 0 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
      tags: sanitizeTags(overrides.tags) || [],
      priority: overrides.priority || 'medium',
      estimatedTime: overrides.estimatedTime || null,
      actualTime: overrides.actualTime || null,
      dependencies: overrides.dependencies || [],
      assignee: overrides.assignee || null,
      ...overrides.metadata
    }
  }

  const validation = validateTask(defaultTask)
  if (!validation.isValid) {
    console.warn('Created task has validation errors:', validation.errors)
  }

  return defaultTask
}