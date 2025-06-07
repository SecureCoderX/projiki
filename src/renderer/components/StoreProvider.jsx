// src/renderer/components/StoreProvider.jsx
import React, { useEffect } from 'react'
import dataService from '../services/DataService'

/**
 * StoreProvider - now initializes the DataService
 */
const StoreProvider = ({ children }) => {
  useEffect(() => {
    const initializeServices = async () => {
      console.log('📦 StoreProvider initializing...')
      
      // Initialize DataService
      await dataService.initializeDirectories()
      
      // Test the service
      const settings = await dataService.loadSettings()
      console.log('⚙️ Settings loaded:', settings)
      
      // Get directory info
      const dirInfo = await dataService.getDataDirectoryInfo()
      console.log('📁 Data directory info:', dirInfo)
      
      console.log('✅ StoreProvider initialization complete')
    }
    
    initializeServices().catch(console.error)
  }, [])
  
  return <>{children}</>
}

export default StoreProvider