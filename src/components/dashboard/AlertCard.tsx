import { Badge } from '../ui/badge'
import { AlertTriangle, AlertCircle, Info, Car, Construction, Shovel } from 'lucide-react'

interface AlertCardProps {
  id: string
  riskScore: number
  title: string
  timestamp: Date
  type: 'excavation' | 'vehicle' | 'ground' | 'construction' | 'other'
  location: string
  lat: number
  lng: number
  onClick?: () => void
}

const getRiskScoreVariant = (score: number): 'destructive' | 'default' | 'secondary' => {
  if (score >= 8) return 'destructive'
  if (score >= 5) return 'default'
  return 'secondary'
}

const getRiskScoreColor = (score: number): string => {
  if (score >= 8) return 'text-red-600'
  if (score >= 5) return 'text-amber-600'
  return 'text-yellow-600'
}

const getAlertIcon = (type: string) => {
  switch (type) {
    case 'excavation':
      return Shovel
    case 'vehicle':
      return Car
    case 'construction':
      return Construction
    case 'ground':
      return AlertCircle
    default:
      return Info
  }
}

const getAlertIconColor = (riskScore: number): string => {
  if (riskScore >= 8) return 'text-red-500'
  if (riskScore >= 5) return 'text-amber-500'
  return 'text-yellow-500'
}

const formatTimestamp = (date: Date): string => {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMins = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))

  if (diffInMins < 60) {
    return `${diffInMins}m ago`
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`
  } else {
    return date.toLocaleDateString()
  }
}

export default function AlertCard({
  id,
  riskScore,
  title,
  timestamp,
  type,
  location,
  lat,
  lng,
  onClick
}: AlertCardProps) {
  const Icon = getAlertIcon(type)

  return (
    <div
      className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 cursor-pointer transition-all duration-200"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Icon className={`h-4 w-4 ${getAlertIconColor(riskScore)}`} />
          <Badge variant={getRiskScoreVariant(riskScore)}>
            {riskScore}/10
          </Badge>
        </div>
        <span className="text-xs text-slate-500">
          {formatTimestamp(timestamp)}
        </span>
      </div>

      <h3 className="text-sm font-semibold text-slate-900 mb-1 line-clamp-2">
        {title}
      </h3>

      <p className="text-xs text-slate-600 mb-2">
        {location}
      </p>

      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium ${getRiskScoreColor(riskScore)}`}>
          {riskScore >= 8 ? 'High Risk' :
           riskScore >= 5 ? 'Medium Risk' : 'Low Risk'}
        </span>
      </div>
    </div>
  )
}