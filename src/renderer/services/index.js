// src/renderer/services/index.js
// Central export for all Projiki services

export { default as dataService } from './DataService'
export { default as backupService } from './BackupService'
export { default as searchService } from './SearchService'

// Service utilities and constants
export const SERVICE_STATUS = {
  INITIALIZING: 'initializing',
  READY: 'ready',
  ERROR: 'error',
  LOADING: 'loading'
}

export const FILE_FORMATS = {
  JSON: 'json',
  MARKDOWN: 'markdown'
}

export const BACKUP_TYPES = {
  FULL: 'full',
  PROJECT: 'project',
  INCREMENTAL: 'incremental'
}

// Service health check utility
export const checkServiceHealth = async () => {
  const health = {
    dataService: { status: SERVICE_STATUS.ERROR, message: '' },
    backupService: { status: SERVICE_STATUS.ERROR, message: '' },
    searchService: { status: SERVICE_STATUS.ERROR, message: '' },
    timestamp: new Date().toISOString()
  }

  try {
    // Check DataService
    const { dataService } = await import('./DataService')
    if (dataService.isInitialized) {
      const canAccess = await dataService.checkDataDirectory()
      if (canAccess) {
        health.dataService = { status: SERVICE_STATUS.READY, message: 'Data directory accessible' }
      } else {
        health.dataService = { status: SERVICE_STATUS.ERROR, message: 'Data directory not accessible' }
      }
    } else {
      health.dataService = { status: SERVICE_STATUS.INITIALIZING, message: 'Data service initializing' }
    }

    // Check BackupService
    const { backupService } = await import('./BackupService')
    const backups = await backupService.listBackups()
    health.backupService = { 
      status: SERVICE_STATUS.READY, 
      message: `${backups.length} backups available`,
      backupCount: backups.length
    }
    
    // Check SearchService
    const { searchService } = await import('./SearchService')
    const searchStats = searchService.getIndexStats()
    health.searchService = {
      status: SERVICE_STATUS.READY,
      message: `Search index: ${searchStats.totalItems} items`,
      indexStats: searchStats
    }

  } catch (error) {
    health.dataService.message = error.message
    health.backupService.message = error.message
    health.searchService.message = error.message
  }

  return health
}

// Initialize all services
export const initializeServices = async () => {
  console.log('🔧 Initializing Projiki services...')
  
  try {
    const { dataService } = await import('./DataService')
    const { searchService } = await import('./SearchService')
    
    // DataService initializes automatically in constructor
    // Just wait for it to complete
    let attempts = 0
    while (!dataService.isInitialized && attempts < 10) {
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
    }

    if (!dataService.isInitialized) {
      throw new Error('DataService initialization timeout')
    }
    
    // Initialize SearchService
    await searchService.initializeIndex()

    console.log('✅ All services initialized successfully')
    return true

  } catch (error) {
    console.error('❌ Service initialization failed:', error)
    throw error
  }
}

// Cleanup all services
export const cleanupServices = async () => {
  console.log('🧹 Cleaning up Projiki services...')
  
  try {
    const { dataService } = await import('./DataService')
    await dataService.cleanup()
    
    console.log('✅ Services cleanup completed')

  } catch (error) {
    console.error('❌ Service cleanup failed:', error)
  }
}