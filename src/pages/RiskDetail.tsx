import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import EnhancedMapCanvas from '../components/dashboard/EnhancedMapCanvas'
import ImageGallery from '../components/dashboard/ImageGallery'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Textarea } from '../components/ui/textarea'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import { ScrollArea } from '../components/ui/scroll-area'
import {
  ArrowLeft,
  Save,
  AlertTriangle,
  MapPin,
  Calendar,
  User,
  FileText,
  Shield,
  Activity,
  Clock,
  CheckCircle,
  Archive,
  Search,
  Upload,
  Grid3x3,
  ListTodo,
  AlertCircle,
  X
} from 'lucide-react'

// Action item interface
interface ActionItem {
  id: string
  title: string
  description: string
  assignedTo: string
  status: 'pending' | 'in-progress' | 'completed'
  dueDate: Date
  createdAt: Date
}

// Risk data structure
interface Risk {
  id: string
  title: string
  description: string
  riskScore: number
  status: 'active' | 'investigating' | 'resolved' | 'monitoring' | 'archived'
  priority: 'critical' | 'high' | 'medium' | 'low'
  type: string
  location: string
  lat: number
  lng: number
  createdAt: Date
  updatedAt: Date
  assignedTo: string
  reportedBy: string
  category: string
  mitigation?: string
  notes?: string
  attachments?: string[]
  estimatedResolution?: Date
  actualResolution?: Date
  impact: string
  likelihood: string
  alertSummary?: string
  locationImages?: Array<{
    id: string
    url: string
    title: string
    description?: string
    timestamp: Date
    type: 'satellite' | 'aerial' | 'ground' | 'thermal' | 'street'
    location?: string
    source?: string
    tags?: string[]
  }>
  actionItems?: ActionItem[]
}

// Dummy risk data
const dummyRisks: Record<string, Risk> = {
  '1': {
    id: '1',
    title: 'High Risk Excavation Activity Detected Near Pipeline Section A-12',
    description: 'Unauthorized excavation equipment detected within 100m of critical pipeline infrastructure. Heavy machinery observed operating near pipeline right-of-way without proper permits.',
    riskScore: 9,
    status: 'active',
    priority: 'critical',
    type: 'excavation',
    location: 'Pipeline KM 42.5, Near Industrial Zone',
    lat: 4.2,
    lng: 101.5,
    createdAt: new Date('2024-12-10T14:30:00'),
    updatedAt: new Date('2024-12-11T09:15:00'),
    assignedTo: 'John Smith',
    reportedBy: 'Automated Monitoring System',
    category: 'Third-Party Damage',
    mitigation: 'Contact property owner immediately. Deploy ground inspection team within 2 hours. Monitor activity 24/7 until resolved.',
    notes: 'Property owner contacted. Ground team deployed. Excavation equipment belongs to unauthorized contractor.',
    attachments: ['satellite_image.jpg', 'risk_assessment.pdf'],
    estimatedResolution: new Date('2024-12-12T17:00:00'),
    impact: 'Catastrophic - Potential pipeline rupture leading to environmental disaster and service interruption',
    likelihood: 'High - Activity confirmed within 100m of pipeline',
    alertSummary: 'Automated monitoring system detected excavation activity within 100m of pipeline infrastructure. Multiple sensors confirmed presence of heavy machinery operating without proper authorization.',
    locationImages: [
      {
        id: '1',
        url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop',
        title: 'Satellite View - Risk Location',
        description: 'High-resolution satellite imagery showing excavation activity near pipeline',
        timestamp: new Date('2024-12-10T14:30:00'),
        type: 'satellite',
        location: 'Pipeline KM 42.5',
        source: 'Satellite Monitoring System',
        tags: ['excavation', 'high-risk', 'active']
      },
      {
        id: '2',
        url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
        title: 'Aerial Survey - Equipment Detection',
        description: 'Aerial imagery confirming presence of heavy excavation equipment',
        timestamp: new Date('2024-12-10T15:45:00'),
        type: 'aerial',
        location: 'Pipeline KM 42.5',
        source: 'Drone Surveillance',
        tags: ['equipment', 'verification', 'survey']
      },
      {
        id: '3',
        url: 'https://images.unsplash.com/photo-1603726847544-5a5b5e7b4b9b?w=800&h=600&fit=crop',
        title: 'Ground Inspection - Site Assessment',
        description: 'Ground-level inspection showing excavation proximity to pipeline markers',
        timestamp: new Date('2024-12-10T17:20:00'),
        type: 'ground',
        location: 'Pipeline KM 42.5',
        source: 'Field Inspection Team',
        tags: ['ground-truth', 'inspection', 'assessment']
      },
      {
        id: '4',
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
        title: 'Pipeline Right-of-Way - Context View',
        description: 'Wider view showing pipeline right-of-way and surrounding industrial area',
        timestamp: new Date('2024-12-09T10:00:00'),
        type: 'aerial',
        location: 'Pipeline KM 42.5',
        source: 'Routine Surveillance',
        tags: ['context', 'baseline', 'roi']
      },
      {
        id: '5',
        url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
        title: 'Thermal Imaging - Heat Detection',
        description: 'Thermal imagery showing equipment heat signatures',
        timestamp: new Date('2024-12-10T16:30:00'),
        type: 'thermal',
        location: 'Pipeline KM 42.5',
        source: 'Thermal Monitoring',
        tags: ['thermal', 'equipment', 'active']
      },
      {
        id: '6',
        url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop',
        title: 'Street Level View - Access Points',
        description: 'Street-level imagery showing access routes to the excavation site',
        timestamp: new Date('2024-12-10T18:00:00'),
        type: 'street',
        location: 'Pipeline KM 42.5',
        source: 'Mobile Patrol',
        tags: ['access', 'routes', 'security']
      }
    ],
    actionItems: [
      {
        id: '1',
        title: 'Contact Property Owner',
        description: 'Immediately contact the property owner to cease excavation activities',
        assignedTo: 'John Smith',
        status: 'completed',
        dueDate: new Date('2024-12-11T10:00:00'),
        createdAt: new Date('2024-12-10T14:45:00')
      },
      {
        id: '2',
        title: 'Deploy Ground Inspection Team',
        description: 'Dispatch inspection team to verify excavation proximity to pipeline',
        assignedTo: 'Sarah Johnson',
        status: 'in-progress',
        dueDate: new Date('2024-12-11T16:00:00'),
        createdAt: new Date('2024-12-10T15:00:00')
      },
      {
        id: '3',
        title: 'Issue Stop Work Order',
        description: 'Formal stop work order for unauthorized excavation activities',
        assignedTo: 'Mike Wilson',
        status: 'pending',
        dueDate: new Date('2024-12-11T18:00:00'),
        createdAt: new Date('2024-12-10T16:30:00')
      }
    ]
  },
  '2': {
    id: '2',
    title: 'Unauthorized Vehicle Access Alert - Construction Vehicle Detected',
    description: 'Heavy construction vehicle entering restricted pipeline right-of-way area. Vehicle identified as excavator with no authorization for access.',
    riskScore: 6,
    status: 'investigating',
    priority: 'high',
    type: 'vehicle',
    location: 'Pipeline KM 28.3, Agricultural Area',
    lat: 4.5,
    lng: 102.0,
    createdAt: new Date('2024-12-10T13:45:00'),
    updatedAt: new Date('2024-12-10T16:20:00'),
    assignedTo: 'Sarah Johnson',
    reportedBy: 'Security Patrol',
    category: 'Security Breach',
    mitigation: 'Verify vehicle authorization. Contact security team for immediate intervention. Document incident for legal action.',
    notes: 'Security team dispatched. Vehicle owner identified as local construction company.',
    impact: 'High - Potential damage to pipeline infrastructure and safety hazards',
    likelihood: 'Medium - Single incident, may be accidental',
    alertSummary: 'Security cameras detected unauthorized construction vehicle entering pipeline right-of-way. Vehicle appears to be performing excavation work without proper permits.',
    locationImages: [
      {
        id: 'v1',
        url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop',
        title: 'Security Camera - Vehicle Detection',
        description: 'Security camera footage showing unauthorized vehicle access',
        timestamp: new Date('2024-12-10T13:45:00'),
        type: 'street',
        location: 'Pipeline KM 28.3',
        source: 'Security Cameras',
        tags: ['vehicle', 'unauthorized', 'security']
      }
    ]
  }
}

export default function RiskDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [mapView, setMapView] = useState<'map' | 'satellite'>('map')
  const [risk, setRisk] = useState<Risk | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Risk>>({})

  useEffect(() => {
    // Load risk data
    const riskData = dummyRisks[id || '']
    if (riskData) {
      setRisk(riskData)
      setEditForm({
        mitigation: riskData.mitigation,
        notes: riskData.notes,
        status: riskData.status,
        priority: riskData.priority,
        assignedTo: riskData.assignedTo
      })
    }
  }, [id])

  const handleSave = () => {
    if (risk) {
      // Update risk with form data
      const updatedRisk = {
        ...risk,
        ...editForm,
        updatedAt: new Date()
      }
      setRisk(updatedRisk)
      setIsEditing(false)
      // TODO: Save to backend
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <AlertTriangle className="h-4 w-4" />
      case 'investigating':
        return <Search className="h-4 w-4" />
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />
      case 'monitoring':
        return <Clock className="h-4 w-4" />
      case 'archived':
        return <Archive className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-red-100 text-red-800'
      case 'investigating':
        return 'bg-blue-100 text-blue-800'
      case 'resolved':
        return 'bg-green-100 text-green-800'
      case 'monitoring':
        return 'bg-yellow-100 text-yellow-800'
      case 'archived':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  
  if (!risk) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Risk not found</h2>
          <Button onClick={() => navigate('/risks')} variant="outline">
            Back to Risk List
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex">
      {/* Left Panel - Enhanced Map */}
      <div className="flex-1 relative">
        <EnhancedMapCanvas
          lat={risk.lat}
          lng={risk.lng}
          mapView={mapView}
          alerts={[
            {
              id: risk.id,
              lat: risk.lat,
              lng: risk.lng,
              riskScore: risk.riskScore,
              title: risk.title,
              type: risk.type
            }
          ]}
        />
      </div>

      {/* Right Panel - Risk Details */}
      <div className="w-[500px] bg-white border-l border-slate-200 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/risks')}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Risk List
              </Button>
              <div className="flex gap-2">
                <Button
                  variant={isEditing ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (isEditing) {
                      handleSave()
                    } else {
                      setIsEditing(true)
                    }
                  }}
                >
                  {isEditing ? (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  ) : (
                    'Edit Risk'
                  )}
                </Button>
              </div>
            </div>

            {/* Risk Title and Status */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900 mb-3">{risk.title}</h1>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge className={`flex items-center gap-1 ${getStatusColor(risk.status)}`}>
                  {getStatusIcon(risk.status)}
                  <span className="capitalize">{risk.status}</span>
                </Badge>
                <Badge variant="outline" className={getPriorityColor(risk.priority)}>
                  <span className="capitalize">{risk.priority}</span>
                </Badge>
                <div className="flex items-center gap-1">
                  <span className={`font-bold text-lg ${
                    risk.riskScore >= 8 ? 'text-red-600' :
                    risk.riskScore >= 5 ? 'text-amber-600' : 'text-green-600'
                  }`}>
                    {risk.riskScore}/10
                  </span>
                  <span className="text-sm text-slate-500">Risk Score</span>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Location</Label>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-900">{risk.location}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Category</Label>
                    <span className="text-sm text-slate-900 block mt-1">{risk.category}</span>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Type</Label>
                    <span className="text-sm text-slate-900 capitalize block mt-1">{risk.type}</span>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Reported By</Label>
                    <span className="text-sm text-slate-900 block mt-1">{risk.reportedBy}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Assessment */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-slate-600">Description</Label>
                  <p className="text-sm text-slate-900 mt-1">{risk.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Impact</Label>
                    <p className="text-sm text-slate-900 mt-1">{risk.impact}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Likelihood</Label>
                    <p className="text-sm text-slate-900 mt-1">{risk.likelihood}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assignment and Status */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Assignment & Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={editForm.status}
                        onValueChange={(value: any) => setEditForm({...editForm, status: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="investigating">Investigating</SelectItem>
                          <SelectItem value="monitoring">Monitoring</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={editForm.priority}
                        onValueChange={(value: any) => setEditForm({...editForm, priority: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="assignedTo">Assigned To</Label>
                      <Input
                        id="assignedTo"
                        value={editForm.assignedTo || ''}
                        onChange={(e) => setEditForm({...editForm, assignedTo: e.target.value})}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Assigned To</Label>
                      <span className="text-sm text-slate-900 block mt-1">{risk.assignedTo}</span>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Created</Label>
                      <div className="text-sm text-slate-900 mt-1">
                        {risk.createdAt.toLocaleDateString()} {risk.createdAt.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mitigation Actions */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Mitigation Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div>
                    <Label htmlFor="mitigation">Mitigation Plan</Label>
                    <Textarea
                      id="mitigation"
                      value={editForm.mitigation || ''}
                      onChange={(e) => setEditForm({...editForm, mitigation: e.target.value})}
                      placeholder="Describe the mitigation actions..."
                      className="mt-1"
                      rows={4}
                    />
                  </div>
                ) : (
                  <p className="text-sm text-slate-900">{risk.mitigation || 'No mitigation plan defined.'}</p>
                )}
              </CardContent>
            </Card>

            {/* Alert Summary */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Alert Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-900">{risk.alertSummary || 'No alert summary available.'}</p>
              </CardContent>
            </Card>

            {/* Risk Assessment Matrix */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Grid3x3 className="h-5 w-5" />
                  Risk Assessment Matrix
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Risk Matrix Grid */}
                  <div className="grid grid-cols-5 gap-1 text-xs">
                    {/* Header Row */}
                    <div className="font-semibold text-center p-2 bg-slate-100">Impact \ Likelihood</div>
                    <div className="font-semibold text-center p-2 bg-slate-100">Very Low</div>
                    <div className="font-semibold text-center p-2 bg-slate-100">Low</div>
                    <div className="font-semibold text-center p-2 bg-slate-100">Medium</div>
                    <div className="font-semibold text-center p-2 bg-slate-100">High</div>

                    {/* Catastrophic Impact */}
                    <div className="font-semibold text-center p-2 bg-slate-100">Catastrophic</div>
                    <div className="text-center p-2 bg-orange-100">High</div>
                    <div className="text-center p-2 bg-red-100">Critical</div>
                    <div className="text-center p-2 bg-red-100">Critical</div>
                    <div className="text-center p-2 bg-red-200">Critical</div>

                    {/* Major Impact */}
                    <div className="font-semibold text-center p-2 bg-slate-100">Major</div>
                    <div className="text-center p-2 bg-yellow-100">Medium</div>
                    <div className="text-center p-2 bg-orange-100">High</div>
                    <div className="text-center p-2 bg-red-100">Critical</div>
                    <div className="text-center p-2 bg-red-100">Critical</div>

                    {/* Moderate Impact */}
                    <div className="font-semibold text-center p-2 bg-slate-100">Moderate</div>
                    <div className="text-center p-2 bg-green-100">Low</div>
                    <div className="text-center p-2 bg-yellow-100">Medium</div>
                    <div className="text-center p-2 bg-orange-100">High</div>
                    <div className="text-center p-2 bg-red-100">Critical</div>

                    {/* Minor Impact */}
                    <div className="font-semibold text-center p-2 bg-slate-100">Minor</div>
                    <div className="text-center p-2 bg-green-100">Low</div>
                    <div className="text-center p-2 bg-green-100">Low</div>
                    <div className="text-center p-2 bg-yellow-100">Medium</div>
                    <div className="text-center p-2 bg-orange-100">High</div>
                  </div>

                  {/* Current Risk Assessment */}
                  <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                    <div className="text-sm font-medium text-slate-700 mb-2">Current Risk Assessment:</div>
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-xs text-slate-600">Impact:</span>
                        <span className="ml-1 text-sm font-medium">Catastrophic</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-600">Likelihood:</span>
                        <span className="ml-1 text-sm font-medium">High</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-600">Risk Level:</span>
                        <span className="ml-1 text-sm font-bold text-red-600">Critical</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Imagery Gallery */}
            <ImageGallery
              images={risk.locationImages || []}
              title="Location Imagery & Evidence"
              className="mb-4"
            />

            {/* Action Items */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListTodo className="h-5 w-5" />
                  Action Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                {risk.actionItems && risk.actionItems.length > 0 ? (
                  <div className="space-y-3">
                    {risk.actionItems.map((item) => (
                      <div key={item.id} className="p-3 border border-slate-200 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-sm font-medium text-slate-900">{item.title}</h4>
                          <Badge
                            variant={item.status === 'completed' ? 'default' :
                                     item.status === 'in-progress' ? 'secondary' : 'outline'}
                            className="text-xs"
                          >
                            {item.status === 'completed' ? 'Completed' :
                             item.status === 'in-progress' ? 'In Progress' : 'Pending'}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600 mb-2">{item.description}</p>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>Assigned to: {item.assignedTo}</span>
                          <span>Due: {item.dueDate.toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-slate-50 rounded-lg">
                    <ListTodo className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No action items available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={editForm.notes || ''}
                    onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                    placeholder="Add notes..."
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-slate-900">{risk.notes || 'No notes available.'}</p>
                )}
              </CardContent>
            </Card>

            {/* Attachments */}
            {risk.attachments && risk.attachments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Attachments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {risk.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                        <span className="text-sm text-slate-700">{attachment}</span>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}