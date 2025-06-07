// src/renderer/hooks/index.js
// Central export for all custom hooks

export { 
  useAutoSave, 
  useProjectAutoSave, 
  useAppAutoSave 
} from './useAutoSave'

// Hook utilities
export const HOOK_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
}

// Re-export store hooks for convenience
export { 
  useStoreActions, 
  useStoreSelectors 
} from '../components/StoreProvider'