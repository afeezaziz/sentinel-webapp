import { create } from 'zustand'

interface Alert {
  id: string
  title: string
  riskScore: number
  timestamp: Date
  type: 'excavation' | 'vehicle' | 'ground' | 'construction' | 'other'
  location: string
  lat: number
  lng: number
  status: 'open' | 'investigating' | 'resolved'
}

interface FilterOptions {
  riskLevel: 'all' | 'high' | 'medium' | 'low'
  status: 'all' | 'open' | 'investigating' | 'resolved'
  type: 'all' | 'excavation' | 'vehicle' | 'ground' | 'construction' | 'other'
  timeRange: 'all' | '1h' | '24h' | '7d' | '30d'
}

interface MapState {
  center: [number, number]
  zoom: number
  selectedAlertId: string | null
  showPipeline: boolean
  showHeatmap: boolean
}

interface UIState {
  sidebarOpen: boolean
  inspectionDrawerOpen: boolean
  selectedAlert: Alert | null
  theme: 'light' | 'dark'
}

interface AppState {
  // Alert selection and filters
  selectedAlertId: string | null
  setSelectedAlertId: (id: string | null) => void
  filters: FilterOptions
  updateFilters: (filters: Partial<FilterOptions>) => void
  resetFilters: () => void

  // Map state
  mapState: MapState
  setMapState: (state: Partial<MapState>) => void
  zoomToAlert: (alertId: string) => void

  // UI state
  uiState: UIState
  setUIState: (state: Partial<UIState>) => void
  toggleSidebar: () => void
  openInspectionDrawer: (alert: Alert) => void
  closeInspectionDrawer: () => void

  // User preferences
  userPreferences: {
    autoRefresh: boolean
    refreshInterval: number // seconds
    notifications: boolean
    soundAlerts: boolean
  }
  updateUserPreferences: (prefs: Partial<AppState['userPreferences']>) => void

  // Computed selectors
  getFilteredAlerts: (alerts: Alert[]) => Alert[]
  getAlertStats: (alerts: Alert[]) => {
    total: number
    high: number
    medium: number
    low: number
    byStatus: Record<string, number>
    byType: Record<string, number>
  }
}

const defaultFilters: FilterOptions = {
  riskLevel: 'all',
  status: 'all',
  type: 'all',
  timeRange: '24h'
}

const defaultMapState: MapState = {
  center: [4.5, 102], // Center of Malaysia
  zoom: 8,
  selectedAlertId: null,
  showPipeline: true,
  showHeatmap: false
}

const defaultUIState: UIState = {
  sidebarOpen: true,
  inspectionDrawerOpen: false,
  selectedAlert: null,
  theme: 'light'
}

export const useStore = create<AppState>((set, get) => ({
  // Alert selection and filters
  selectedAlertId: null,
  setSelectedAlertId: (id) => set({ selectedAlertId: id }),

  filters: defaultFilters,
  updateFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    })),

  resetFilters: () => set({ filters: defaultFilters }),

  // Map state
  mapState: defaultMapState,
  setMapState: (newState) =>
    set((state) => ({
      mapState: { ...state.mapState, ...newState }
    })),

  zoomToAlert: (alertId) => {
    const state = get()
    // This would be used to update map center/zoom to focus on an alert
    // Implementation would depend on map library integration
    set({
      selectedAlertId: alertId,
      mapState: {
        ...state.mapState,
        selectedAlertId: alertId
      }
    })
  },

  // UI state
  uiState: defaultUIState,
  setUIState: (newState) =>
    set((state) => ({
      uiState: { ...state.uiState, ...newState }
    })),

  toggleSidebar: () =>
    set((state) => ({
      uiState: {
        ...state.uiState,
        sidebarOpen: !state.uiState.sidebarOpen
      }
    })),

  openInspectionDrawer: (alert) =>
    set((state) => ({
      uiState: {
        ...state.uiState,
        inspectionDrawerOpen: true,
        selectedAlert: alert
      },
      selectedAlertId: alert.id
    })),

  closeInspectionDrawer: () =>
    set((state) => ({
      uiState: {
        ...state.uiState,
        inspectionDrawerOpen: false,
        selectedAlert: null
      }
    })),

  // User preferences
  userPreferences: {
    autoRefresh: true,
    refreshInterval: 30,
    notifications: true,
    soundAlerts: false
  },

  updateUserPreferences: (newPrefs) =>
    set((state) => ({
      userPreferences: { ...state.userPreferences, ...newPrefs }
    })),

  // Computed selectors
  getFilteredAlerts: (alerts) => {
    const { filters } = get()

    return alerts.filter((alert) => {
      // Risk level filter
      if (filters.riskLevel !== 'all') {
        const isHigh = alert.riskScore >= 8
        const isMedium = alert.riskScore >= 5 && alert.riskScore < 8
        const isLow = alert.riskScore < 5

        if (filters.riskLevel === 'high' && !isHigh) return false
        if (filters.riskLevel === 'medium' && !isMedium) return false
        if (filters.riskLevel === 'low' && !isLow) return false
      }

      // Status filter
      if (filters.status !== 'all' && alert.status !== filters.status) {
        return false
      }

      // Type filter
      if (filters.type !== 'all' && alert.type !== filters.type) {
        return false
      }

      // Time range filter
      if (filters.timeRange !== 'all') {
        const now = new Date()
        const alertTime = new Date(alert.timestamp)
        const diffMs = now.getTime() - alertTime.getTime()
        const diffHours = diffMs / (1000 * 60 * 60)

        switch (filters.timeRange) {
          case '1h':
            if (diffHours > 1) return false
            break
          case '24h':
            if (diffHours > 24) return false
            break
          case '7d':
            if (diffHours > 24 * 7) return false
            break
          case '30d':
            if (diffHours > 24 * 30) return false
            break
        }
      }

      return true
    })
  },

  getAlertStats: (alerts) => {
    const stats = {
      total: alerts.length,
      high: alerts.filter(a => a.riskScore >= 8).length,
      medium: alerts.filter(a => a.riskScore >= 5 && a.riskScore < 8).length,
      low: alerts.filter(a => a.riskScore < 5).length,
      byStatus: {} as Record<string, number>,
      byType: {} as Record<string, number>
    }

    // Count by status
    alerts.forEach(alert => {
      stats.byStatus[alert.status] = (stats.byStatus[alert.status] || 0) + 1
      stats.byType[alert.type] = (stats.byType[alert.type] || 0) + 1
    })

    return stats
  }
}))

// Selectors for specific state slices
export const useAlertFilters = () => useStore(state => ({
  filters: state.filters,
  updateFilters: state.updateFilters,
  resetFilters: state.resetFilters
}))

export const useMapState = () => useStore(state => state.mapState)

export const useUIState = () => useStore(state => state.uiState)

export const useUserPreferences = () => useStore(state => state.userPreferences)

export const useSelectedAlert = () => useStore(state => ({
  selectedAlertId: state.selectedAlertId,
  setSelectedAlertId: state.setSelectedAlertId
}))

// Computed hooks
export const useFilteredAlerts = (alerts: Alert[]) => {
  const getFilteredAlerts = useStore(state => state.getFilteredAlerts)
  return getFilteredAlerts(alerts)
}

export const useAlertStats = (alerts: Alert[]) => {
  const getAlertStats = useStore(state => state.getAlertStats)
  return getAlertStats(alerts)
}