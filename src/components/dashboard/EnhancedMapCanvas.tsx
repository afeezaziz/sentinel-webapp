import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Slider } from '../ui/slider'
import { Play, Pause, RotateCcw, Layers, MapPin, Maximize2, Minimize2 } from 'lucide-react'

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface ImageryLayer {
  id: string
  name: string
  url: string
  timestamp: Date
  type: 'satellite' | 'aerial' | 'street' | 'thermal'
}

interface EnhancedMapCanvasProps {
  pipelineGeoJson?: GeoJSON.LineString
  alerts?: Array<{
    id: string
    lat: number
    lng: number
    riskScore: number
    title: string
    type: string
  }>
  lat: number
  lng: number
  mapView?: 'map' | 'satellite'
  beforeAfterImagery?: {
    before: ImageryLayer
    after: ImageryLayer
  }
}

// Custom alert icons
const getAlertIcon = (riskScore: number) => {
  const color = riskScore >= 8 ? '#dc2626' : riskScore >= 5 ? '#f59e0b' : '#eab308'
  return L.divIcon({
    className: 'custom-alert-marker',
    html: `<div style="
      background-color: ${color};
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  })
}

// Dummy data for development
const dummyPipelineGeoJson: GeoJSON.LineString = {
  type: 'LineString',
  coordinates: [
    [101.0, 4.0],
    [101.5, 4.2],
    [102.0, 4.5],
    [102.5, 4.8],
    [103.0, 5.0],
    [103.5, 5.2],
  ]
}

const dummyBeforeAfterImagery = {
  before: {
    id: 'before',
    name: 'Before Excavation',
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
    timestamp: new Date('2024-12-09T10:00:00'),
    type: 'satellite' as const
  },
  after: {
    id: 'after',
    name: 'After Excavation Detected',
    url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop',
    timestamp: new Date('2024-12-10T14:30:00'),
    type: 'satellite' as const
  }
}

export default function EnhancedMapCanvas({
  pipelineGeoJson = dummyPipelineGeoJson,
  alerts = [],
  lat,
  lng,
  mapView = 'map',
  beforeAfterImagery = dummyBeforeAfterImagery
}: EnhancedMapCanvasProps) {
  const mapRef = useRef<L.Map>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [showBeforeAfter, setShowBeforeAfter] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [imageOpacity, setImageOpacity] = useState([100])

  // Convert GeoJSON coordinates to [lat, lng] format for Leaflet
  const pipelineCoordinates = pipelineGeoJson.coordinates.map(([lng, lat]) => [lat, lng])

  // Animation frames for before/after
  const animationFrames = [
    { opacity: 100, label: 'Before', timestamp: beforeAfterImagery.before.timestamp },
    { opacity: 50, label: 'Transition', timestamp: new Date('2024-12-10T12:15:00') },
    { opacity: 0, label: 'After', timestamp: beforeAfterImagery.after.timestamp }
  ]

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentFrame((prev) => (prev + 1) % animationFrames.length)
      }, 2000)
    }
    return () => clearInterval(interval)
  }, [isPlaying])

  useEffect(() => {
    setImageOpacity([animationFrames[currentFrame].opacity])
  }, [currentFrame])

  const resetAnimation = () => {
    setIsPlaying(false)
    setCurrentFrame(0)
    setImageOpacity([100])
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <div className={`h-full relative ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      {/* Controls Header */}
      <div className="absolute top-4 left-4 z-10 right-4">
        <div className="flex flex-col gap-3">
          {/* Top Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Map View Toggle */}
              <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-1">
                <Button
                  variant={mapView === 'map' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {/* Controlled by parent */}}
                  className="text-xs h-8 px-3"
                  disabled
                >
                  <Layers className="h-3 w-3 mr-1" />
                  Map
                </Button>
                <Button
                  variant={mapView === 'satellite' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {/* Controlled by parent */}}
                  className="text-xs h-8 px-3"
                  disabled
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  Satellite
                </Button>
              </div>

              {/* Before/After Toggle */}
              <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-1">
                <Button
                  variant={showBeforeAfter ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setShowBeforeAfter(!showBeforeAfter)}
                  className="text-xs h-8 px-3"
                >
                  Before/After
                </Button>
              </div>
            </div>

            {/* Fullscreen Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              className="bg-white shadow-lg"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>

          {/* Before/After Controls */}
          {showBeforeAfter && (
            <Card className="bg-white/95 backdrop-blur-sm">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-900">Timeline Comparison</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetAnimation}
                      className="h-7 w-7 p-0"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                    <Button
                      variant={isPlaying ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="h-7 w-7 p-0"
                    >
                      {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>

                {/* Timeline Slider */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>{animationFrames[0].label}</span>
                    <span>{animationFrames[animationFrames.length - 1].label}</span>
                  </div>
                  <Slider
                    value={[currentFrame]}
                    onValueChange={(value) => setCurrentFrame(value[0])}
                    max={animationFrames.length - 1}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-center text-xs text-slate-500">
                    {animationFrames[currentFrame].timestamp.toLocaleString()}
                  </div>
                </div>

                {/* Image Labels */}
                <div className="flex items-center justify-between mt-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Before: {beforeAfterImagery.before.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>After: {beforeAfterImagery.after.name}</span>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div className="h-full w-full">
        <MapContainer
          ref={mapRef}
          center={[lat, lng]}
          zoom={16}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          {/* Base Tile Layer */}
          <TileLayer
            attribution={mapView === 'map'
              ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | &copy; <a href="https://www.maxar.com/">Maxar</a>'
            }
            url={mapView === 'map'
              ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            }
          />

          {/* Before/After Image Overlay */}
          {showBeforeAfter && (
            <>
              {/* Before Image Layer */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  opacity: imageOpacity[0] / 100,
                  background: `url(${beforeAfterImagery.before.url}) center/cover`,
                  mixBlendMode: 'normal',
                  zIndex: 1000
                }}
              />

              {/* After Image Layer */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  opacity: (100 - imageOpacity[0]) / 100,
                  background: `url(${beforeAfterImagery.after.url}) center/cover`,
                  mixBlendMode: 'normal',
                  zIndex: 1001
                }}
              />
            </>
          )}

          {/* Pipeline */}
          <Polyline
            positions={pipelineCoordinates}
            color="#3b82f6"
            weight={4}
            opacity={0.8}
          />

          {/* Risk Location Marker */}
          <Marker
            position={[lat, lng]}
            icon={getAlertIcon(9)}
          >
            <Popup>
              <div className="text-sm">
                <h4 className="font-semibold text-slate-900">High Risk Excavation Activity</h4>
                <p className="text-slate-600 mt-1">Pipeline KM 42.5</p>
                <p className="text-slate-500 text-xs mt-1">Risk Score: 9/10</p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  )
}