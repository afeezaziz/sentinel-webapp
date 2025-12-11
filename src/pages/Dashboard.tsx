import { useState, useEffect } from 'react'
import AlertFeed from '../components/dashboard/AlertFeed'
import MapCanvas from '../components/dashboard/MapCanvas'
import { Button } from '../components/ui/button'
import { Layers, MapPin } from 'lucide-react'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [isRiskFeedOpen, setIsRiskFeedOpen] = useState(true)
  const [mapView, setMapView] = useState<'map' | 'satellite'>('map')

  useEffect(() => {
    // Simple loading simulation
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full relative">
      {/* Full screen map container */}
      <div className="h-full w-full">
        <MapCanvas mapView={mapView} />
      </div>

      {/* Map View Toggle - Top Left */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-1">
          <Button
            variant={mapView === 'map' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMapView('map')}
            className="text-xs h-8 px-3"
          >
            <Layers className="h-3 w-3 mr-1" />
            Map
          </Button>
          <Button
            variant={mapView === 'satellite' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMapView('satellite')}
            className="text-xs h-8 px-3"
          >
            <MapPin className="h-3 w-3 mr-1" />
            Satellite
          </Button>
        </div>
      </div>

      {/* Risk Feed Toggle Button - Top Right (when closed) */}
      {!isRiskFeedOpen && (
        <div className="absolute top-4 right-4 z-10">
          <Button
            onClick={() => setIsRiskFeedOpen(true)}
            size="sm"
            className="bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-lg"
          >
            <MapPin className="h-4 w-4 mr-1" />
            Risk Feed
          </Button>
        </div>
      )}

      {/* Risk Feed Overlay - Top Right */}
      {isRiskFeedOpen && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-96 max-h-[80vh] overflow-hidden">
            {/* Risk Feed Header */}
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Risk Feed</h2>
                <p className="text-xs text-slate-600">Real-time pipeline monitoring alerts</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsRiskFeedOpen(false)}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>

            {/* Risk Feed Content */}
            <div className="h-[60vh] overflow-hidden">
              <AlertFeed />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}