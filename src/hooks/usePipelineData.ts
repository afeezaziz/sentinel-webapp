import { useState, useEffect, useCallback } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

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
  engineerNotes?: string
  pof?: number
  cof?: number
}

interface Asset {
  id: string
  name: string
  length: number
  maop: number
  diameter: string
  materialGrade: string
  installYear: number
  riskScore: number
  lastInspection: Date
  status: 'active' | 'maintenance' | 'inactive'
}

interface PipelineData {
  alerts: Alert[]
  assets: Asset[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

// Mock data for development (will be replaced with real Supabase calls)
const mockAlerts: Alert[] = [
  {
    id: '1',
    title: 'High Risk Excavation Activity Detected Near Pipeline Section A-12',
    riskScore: 9,
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    type: 'excavation',
    location: 'Pipeline KM 42.5, Near Industrial Zone',
    lat: 4.2,
    lng: 101.5,
    status: 'open',
    pof: 5,
    cof: 4
  },
  {
    id: '2',
    title: 'Unauthorized Vehicle Access Alert - Construction Vehicle Detected',
    riskScore: 6,
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    type: 'vehicle',
    location: 'Pipeline KM 28.3, Agricultural Area',
    lat: 4.5,
    lng: 102.0,
    status: 'open',
    pof: 3,
    cof: 3
  },
  {
    id: '3',
    title: 'Minor Ground Disturbance - Possible Animal Activity',
    riskScore: 3,
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    type: 'ground',
    location: 'Pipeline KM 67.8, Forest Reserve',
    lat: 4.8,
    lng: 102.5,
    status: 'resolved',
    pof: 2,
    cof: 1
  }
]

const mockAssets: Asset[] = [
  {
    id: '1',
    name: 'Pipeline Section A-1',
    length: 45.8,
    maop: 1440,
    diameter: '24"',
    materialGrade: 'X70',
    installYear: 2015,
    riskScore: 3.2,
    lastInspection: new Date('2024-11-15'),
    status: 'active'
  },
  {
    id: '2',
    name: 'Pipeline Section B-2',
    length: 67.3,
    maop: 1200,
    diameter: '36"',
    materialGrade: 'X65',
    installYear: 2012,
    riskScore: 6.8,
    lastInspection: new Date('2024-10-22'),
    status: 'active'
  }
]

export function usePipelineData(): PipelineData {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [subscription, setSubscription] = useState<RealtimeChannel | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // In a real implementation, replace these with actual Supabase calls:
      // const { data: alertsData, error: alertsError } = await supabase
      //   .from('alerts')
      //   .select('*')
      //   .order('timestamp', { ascending: false })

      // const { data: assetsData, error: assetsError } = await supabase
      //   .from('assets')
      //   .select('*')

      setAlerts(mockAlerts)
      setAssets(mockAssets)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
      console.error('Error fetching pipeline data:', err)
    } finally {
      setLoading(false)
    }
  }, []) // Remove dependency on setAlerts/setAssets to prevent re-creation

  // Set up real-time subscription for alerts - temporarily disabled for debugging
  // useEffect(() => {
  //   const setupRealtimeSubscription = async () => {
  //     try {
  //       // Real-time updates disabled temporarily
  //     } catch (err) {
  //       console.error('Error setting up realtime subscription:', err)
  //       setError('Failed to set up real-time updates')
  //     }
  //   }
  //
  //   setupRealtimeSubscription()
  //
  //   return () => {
  //     // Cleanup subscription
  //   }
  // }, [])

  // Initial data fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    alerts,
    assets,
    loading,
    error,
    refetch: fetchData
  }
}

// Utility functions for data manipulation
export const updateAlertStatus = async (alertId: string, status: Alert['status'], notes?: string): Promise<void> => {
  try {
    // In a real implementation:
    // await supabase
    //   .from('alerts')
    //   .update({ status, engineer_notes: notes })
    //   .eq('id', alertId)

    console.log(`Updating alert ${alertId} to status: ${status}`, notes)
  } catch (error) {
    console.error('Error updating alert status:', error)
    throw error
  }
}

export const createAsset = async (assetData: Omit<Asset, 'id' | 'riskScore' | 'lastInspection'>): Promise<Asset> => {
  try {
    // In a real implementation:
    // const { data, error } = await supabase
    //   .from('assets')
    //   .insert(assetData)
    //   .select()
    //   .single()

    const newAsset: Asset = {
      ...assetData,
      id: Date.now().toString(),
      riskScore: Math.random() * 10,
      lastInspection: new Date()
    }

    console.log('Creating new asset:', newAsset)
    return newAsset
  } catch (error) {
    console.error('Error creating asset:', error)
    throw error
  }
}

export const updateAsset = async (assetId: string, assetData: Partial<Asset>): Promise<Asset> => {
  try {
    // In a real implementation:
    // const { data, error } = await supabase
    //   .from('assets')
    //   .update(assetData)
    //   .eq('id', assetId)
    //   .select()
    //   .single()

    console.log(`Updating asset ${assetId}:`, assetData)
    return {
      id: assetId,
      ...assetData,
      riskScore: Math.random() * 10,
      lastInspection: new Date()
    } as Asset
  } catch (error) {
    console.error('Error updating asset:', error)
    throw error
  }
}