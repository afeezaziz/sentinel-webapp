import { useState } from 'react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../ui/sheet'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import RiskMatrix from '../widgets/RiskMatrix'
import ImageSlider from '../widgets/ImageSlider'

interface InspectionDrawerProps {
  isOpen: boolean
  onClose: () => void
  alert: {
    id: string
    title: string
    riskScore: number
    timestamp: Date
    type: string
    location: string
    lat: number
    lng: number
    pof?: number // Probability of Failure
    cof?: number // Consequence of Failure
    status?: 'open' | 'investigating' | 'resolved'
    engineerNotes?: string
  }
  onSave?: (alertId: string, updates: { status: string, notes: string }) => void
}

export default function InspectionDrawer({
  isOpen,
  onClose,
  alert,
  onSave
}: InspectionDrawerProps) {
  const [status, setStatus] = useState<'open' | 'investigating' | 'resolved'>(
    alert.status || 'open'
  )
  const [notes, setNotes] = useState(alert.engineerNotes || '')

  const handleSave = () => {
    onSave?.(alert.id, {
      status,
      notes
    })
  }

  const getStatusVariant = (status: string): 'destructive' | 'default' | 'secondary' => {
    switch (status) {
      case 'resolved':
        return 'secondary'
      case 'investigating':
        return 'default'
      case 'open':
      default:
        return 'destructive'
    }
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'resolved':
        return 'text-green-600'
      case 'investigating':
        return 'text-blue-600'
      case 'open':
      default:
        return 'text-red-600'
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Inspection Details</span>
            <Badge variant={getStatusVariant(status)}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          </SheetTitle>
          <SheetDescription>
            Review and verify the alert with visual inspection and risk assessment.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Alert Summary */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="font-semibold text-slate-900 mb-2">Alert Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Risk Score:</span>
                <span className={`font-medium ${
                  alert.riskScore >= 8 ? 'text-red-600' :
                  alert.riskScore >= 5 ? 'text-amber-600' : 'text-yellow-600'
                }`}>
                  {alert.riskScore}/10
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Type:</span>
                <span className="font-medium">{alert.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Location:</span>
                <span className="font-medium">{alert.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Coordinates:</span>
                <span className="font-medium text-xs">{alert.lat.toFixed(4)}, {alert.lng.toFixed(4)}</span>
              </div>
            </div>
          </div>

          {/* Risk Matrix */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Risk Assessment Matrix</h3>
            <RiskMatrix
              pof={alert.pof || Math.floor(alert.riskScore / 2) + 1}
              cof={alert.cof || Math.ceil(alert.riskScore / 2) + 1}
            />
          </div>

          {/* Verification Imagery */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Verification Imagery</h3>
            <ImageSlider
              beforeSrc="https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop&auto=format"
              afterSrc="https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=400&h=300&fit=crop&auto=format"
              beforeLabel="Before (24h ago)"
              afterLabel="After (Current)"
            />
          </div>

          {/* Action Items */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">Action Items</h3>

            {/* Status Update */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Status</label>
              <div className="flex space-x-2">
                {['open', 'investigating', 'resolved'].map((statusOption) => (
                  <Button
                    key={statusOption}
                    variant={status === statusOption ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatus(statusOption as any)}
                  >
                    {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Engineer Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Engineer Notes
              </label>
              <textarea
                className="w-full min-h-[100px] px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                placeholder="Enter inspection notes, observations, and recommendations..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Save Button */}
            <div className="flex space-x-3">
              <Button onClick={handleSave} className="flex-1">
                Save Changes
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}