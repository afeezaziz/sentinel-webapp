import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix Leaflet default icon issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface MapCanvasProps {
  pipelineGeoJson?: GeoJSON.LineString
  alerts?: Array<{
    id: string
    lat: number
    lng: number
    riskScore: number
    title: string
    type: string
  }>
  mapView?: 'map' | 'satellite'
}

// Custom alert icons
const getAlertIcon = (riskScore: number) => {
  const color = riskScore >= 8 ? '#dc2626' : riskScore >= 5 ? '#f59e0b' : '#eab308'
  return L.divIcon({
    className: 'custom-alert-marker',
    html: `<div style="
      background-color: ${color};
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
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

// Alert data matching the AlertFeed and RiskList - only active, investigating, and monitoring
const dummyAlerts = [
  {
    id: '1',
    lat: 4.2,
    lng: 101.5,
    riskScore: 9,
    title: 'High Risk Excavation Activity Detected Near Pipeline Section A-12',
    type: 'excavation'
  },
  {
    id: '2',
    lat: 4.5,
    lng: 102.0,
    riskScore: 6,
    title: 'Unauthorized Vehicle Access Alert - Construction Vehicle Detected',
    type: 'vehicle'
  },
  {
    id: '4',
    lat: 5.0,
    lng: 103.0,
    riskScore: 7,
    title: 'Construction Activity Near Pipeline Right-of-Way',
    type: 'construction'
  },
  {
    id: '5',
    lat: 5.3,
    lng: 103.5,
    riskScore: 8,
    title: 'Heavy Machinery Movement Alert - Excavator Detected',
    type: 'excavation'
  },
  {
    id: '6',
    lat: 5.6,
    lng: 104.0,
    riskScore: 4,
    title: 'Soil Disturbance Alert - Possible Erosion',
    type: 'ground'
  }
]

export default function MapCanvas({
  pipelineGeoJson = dummyPipelineGeoJson,
  alerts = dummyAlerts,
  mapView = 'map'
}: MapCanvasProps) {
  const mapRef = useRef<L.Map>(null)

  // Convert GeoJSON coordinates to [lat, lng] format for Leaflet
  const pipelineCoordinates = pipelineGeoJson.coordinates.map(([lng, lat]) => [lat, lng])

  return (
    <div className="h-full w-full">
      <MapContainer
        ref={mapRef}
        center={[4.5, 102]} // Center of Malaysia
        zoom={8}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        {/* Tile layer based on mapView */}
        {mapView === 'map' ? (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
        ) : (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | &copy; <a href="https://www.maxar.com/">Maxar</a>'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        )}

        {/* Pipeline */}
        <Polyline
          positions={pipelineCoordinates}
          color="#3b82f6"
          weight={4}
          opacity={0.8}
        />

        {/* Alert markers */}
        {alerts.map((alert) => (
          <Marker
            key={alert.id}
            position={[alert.lat, alert.lng]}
            icon={getAlertIcon(alert.riskScore)}
          >
            <Popup>
              <div className="text-sm">
                <h4 className="font-semibold text-slate-900">{alert.title}</h4>
                <p className="text-slate-600 mt-1">
                  Risk Score: <span className={`font-medium ${
                    alert.riskScore >= 8 ? 'text-red-600' :
                    alert.riskScore >= 5 ? 'text-amber-600' : 'text-yellow-600'
                  }`}>{alert.riskScore}/10</span>
                </p>
                <p className="text-slate-500 text-xs mt-1">Type: {alert.type}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}