import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScrollArea } from '../ui/scroll-area'
import AlertCard from './AlertCard'
import { Button } from '../ui/button'
import { Filter, AlertTriangle } from 'lucide-react'

// Risk data that matches RiskList component - only active, investigating, and monitoring risks
const riskData = [
  {
    id: '1',
    riskScore: 9,
    title: 'High Risk Excavation Activity Detected Near Pipeline Section A-12',
    description: 'Unauthorized excavation equipment detected within 100m of critical pipeline infrastructure',
    timestamp: new Date('2024-12-11T09:15:00'),
    type: 'excavation' as const,
    location: 'Pipeline KM 42.5, Near Industrial Zone',
    lat: 4.2,
    lng: 101.5,
    status: 'active' as const,
    priority: 'critical' as const,
    assignedTo: 'John Smith',
    category: 'Third-Party Damage'
  },
  {
    id: '2',
    riskScore: 6,
    title: 'Unauthorized Vehicle Access Alert - Construction Vehicle Detected',
    description: 'Heavy construction vehicle entering restricted pipeline right-of-way area',
    timestamp: new Date('2024-12-10T16:20:00'),
    type: 'vehicle' as const,
    location: 'Pipeline KM 28.3, Agricultural Area',
    lat: 4.5,
    lng: 102.0,
    status: 'active' as const,
    priority: 'high' as const,
    assignedTo: 'Sarah Johnson',
    category: 'Security Breach'
  },
  {
    id: '4',
    riskScore: 7,
    title: 'Construction Activity Near Pipeline Right-of-Way',
    description: 'Building construction activity detected near pipeline easement',
    timestamp: new Date('2024-12-11T08:30:00'),
    type: 'construction' as const,
    location: 'Pipeline KM 89.2, Residential Area',
    lat: 5.0,
    lng: 103.0,
    status: 'investigating' as const,
    priority: 'high' as const,
    assignedTo: 'Emily Davis',
    category: 'Encroachment'
  },
  {
    id: '5',
    riskScore: 8,
    title: 'Heavy Machinery Movement Alert - Excavator Detected',
    description: 'Heavy excavator operation in close proximity to pipeline corridor',
    timestamp: new Date('2024-12-11T08:00:00'),
    type: 'excavation' as const,
    location: 'Pipeline KM 156.7, Commercial District',
    lat: 5.3,
    lng: 103.5,
    status: 'active' as const,
    priority: 'critical' as const,
    assignedTo: 'Robert Brown',
    category: 'Third-Party Damage'
  },
  {
    id: '6',
    riskScore: 4,
    title: 'Soil Disturbance Alert - Possible Erosion',
    description: 'Significant soil erosion detected near pipeline supports',
    timestamp: new Date('2024-12-10T12:15:00'),
    type: 'ground' as const,
    location: 'Pipeline KM 203.1, Rural Area',
    lat: 5.6,
    lng: 104.0,
    status: 'monitoring' as const,
    priority: 'medium' as const,
    assignedTo: 'Lisa Anderson',
    category: 'Environmental'
  }
]

// Filter for only active, investigating, and monitoring risks
const dummyAlerts = riskData.filter(risk =>
  risk.status === 'active' || risk.status === 'investigating' || risk.status === 'monitoring'
)

type FilterType = 'all' | 'high' | 'medium' | 'low'

export default function AlertFeed() {
  const navigate = useNavigate()
  const [alerts] = useState(dummyAlerts)
  const [filter, setFilter] = useState<FilterType>('all')

  const filteredAlerts = alerts.filter(alert => {
    switch (filter) {
      case 'high':
        return alert.riskScore >= 8
      case 'medium':
        return alert.riskScore >= 5 && alert.riskScore < 8
      case 'low':
        return alert.riskScore < 5
      default:
        return true
    }
  })

  const handleAlertClick = (alert: typeof dummyAlerts[0]) => {
    // Navigate to risk detail page instead of opening drawer
    navigate(`/risk/${alert.id}`)
  }

  const filterButtons: { label: string; value: FilterType; count: number }[] = [
    { label: 'All', value: 'all', count: alerts.length },
    { label: 'High', value: 'high', count: alerts.filter(a => a.riskScore >= 8).length },
    { label: 'Medium', value: 'medium', count: alerts.filter(a => a.riskScore >= 5 && a.riskScore < 8).length },
    { label: 'Low', value: 'low', count: alerts.filter(a => a.riskScore < 5).length },
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Filter Controls */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Filter by Risk</span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-slate-500">
            <AlertTriangle className="h-3 w-3" />
            <span>{filteredAlerts.length} alerts</span>
          </div>
        </div>

        <div className="flex space-x-1">
          {filterButtons.map(({ label, value, count }) => (
            <Button
              key={value}
              variant={filter === value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(value)}
              className="text-xs h-7"
            >
              {label}
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                filter === value
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {count}
              </span>
            </Button>
          ))}
        </div>
      </div>

      {/* Alert List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No alerts match the selected filter</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                {...alert}
                onClick={() => handleAlertClick(alert)}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}