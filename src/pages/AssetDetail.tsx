import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
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
  FileText,
  Download,
  Upload,
  Eye,
  Calendar,
  MapPin,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  Wrench,
  Shield,
  Archive,
  Search,
  Filter,
  X,
  Plus
} from 'lucide-react'

interface AssetDocument {
  id: string
  name: string
  type: string
  category: 'design' | 'inspection' | 'maintenance' | 'compliance' | 'technical' | 'other'
  size: string
  uploadDate: Date
  uploadedBy: string
  description?: string
  url?: string
  tags?: string[]
}

interface AssetDetail {
  id: string
  name: string
  length: number
  maop: number
  diameter: string
  materialGrade: string
  wallThickness: number
  installYear: number
  manufacturer: string
  coating: string
  cathodicProtection: string
  routeDescription: string
  latitude: number
  longitude: number
  elevation: number
  operatingPressure: number
  designPressure: number
  testPressure: number
  temperature: number
  flowRate: number
  fluidType: string
  riskScore: number
  lastInspection: Date
  nextInspection: Date
  status: 'active' | 'maintenance' | 'inactive'
  condition: 'excellent' | 'good' | 'fair' | 'poor'
  documents: AssetDocument[]
  notes: string[]
  criticalFeatures: string[]
  environmentalConditions: string[]
  maintenanceHistory: Array<{
    date: Date
    type: string
    description: string
    performedBy: string
    status: string
  }>
  inspectionSchedule: Array<{
    type: string
    frequency: string
    lastDate: Date
    nextDate: Date
    responsible: string
  }>
}

// Dummy data for development
const dummyAssetDetails: Record<string, AssetDetail> = {
  '1': {
    id: '1',
    name: 'Pipeline Section A-1',
    length: 45.8,
    maop: 1440,
    diameter: '24"',
    materialGrade: 'X70',
    wallThickness: 0.375,
    installYear: 2015,
    manufacturer: 'U.S. Steel Corporation',
    coating: 'FBE (Fusion Bonded Epoxy)',
    cathodicProtection: 'Sacrificial Anode System',
    routeDescription: 'Runs from Kelang Terminal to Port Dickson Refinery through mixed terrain including industrial zones and residential areas',
    latitude: 3.1390,
    longitude: 101.6869,
    elevation: 45,
    operatingPressure: 1200,
    designPressure: 1440,
    testPressure: 2160,
    temperature: 65,
    flowRate: 850000,
    fluidType: 'Crude Oil',
    riskScore: 3.2,
    lastInspection: new Date('2024-11-15'),
    nextInspection: new Date('2025-05-15'),
    status: 'active',
    condition: 'good',
    criticalFeatures: ['High-pressure transmission line', 'Crosses 3 major highways', 'Parallel to existing utilities'],
    environmentalConditions: ['Tropical climate', 'High humidity', 'Corrosive soil conditions', 'Seismic zone 2'],
    notes: [
      'Regular cathodic protection monitoring shows optimal protection levels',
      'Smart pig inspection scheduled for Q2 2025',
      'Coating integrity maintained with annual inspections'
    ],
    maintenanceHistory: [
      {
        date: new Date('2024-08-10'),
        type: 'Routine Inspection',
        description: 'Quarterly visual inspection and cathodic protection survey',
        performedBy: 'Inspection Team Alpha',
        status: 'Completed'
      },
      {
        date: new Date('2024-03-15'),
        type: 'Maintenance',
        description: 'Replacement of sacrificial anodes at stations 15-20',
        performedBy: 'Maintenance Team Beta',
        status: 'Completed'
      }
    ],
    inspectionSchedule: [
      {
        type: 'Visual Inspection',
        frequency: 'Quarterly',
        lastDate: new Date('2024-11-15'),
        nextDate: new Date('2025-02-15'),
        responsible: 'Inspection Team Alpha'
      },
      {
        type: 'Cathodic Protection Survey',
        frequency: 'Bi-annually',
        lastDate: new Date('2024-08-10'),
        nextDate: new Date('2025-02-10'),
        responsible: 'Corrosion Team'
      },
      {
        type: 'Smart Pig Inspection',
        frequency: 'Every 3 years',
        lastDate: new Date('2022-06-20'),
        nextDate: new Date('2025-06-20'),
        responsible: 'Inline Inspection Team'
      }
    ],
    documents: [
      {
        id: '1',
        name: 'Pipeline Design Specifications.pdf',
        type: 'application/pdf',
        category: 'design',
        size: '2.4 MB',
        uploadDate: new Date('2024-01-15'),
        uploadedBy: 'Engineering Team',
        description: 'Complete design specifications and calculations',
        tags: ['design', 'engineering', 'specifications']
      },
      {
        id: '2',
        name: 'As-Built Drawings.dwg',
        type: 'application/dwg',
        category: 'design',
        size: '8.7 MB',
        uploadDate: new Date('2024-01-20'),
        uploadedBy: 'Drafting Department',
        description: 'Final as-built construction drawings',
        tags: ['construction', 'drawings', 'as-built']
      },
      {
        id: '3',
        name: 'Material Certificates.zip',
        type: 'application/zip',
        category: 'technical',
        size: '15.2 MB',
        uploadDate: new Date('2024-01-25'),
        uploadedBy: 'Quality Assurance',
        description: 'Mill test certificates and material documentation',
        tags: ['materials', 'certificates', 'quality']
      },
      {
        id: '4',
        name: 'Inspection Report_Q3_2024.pdf',
        type: 'application/pdf',
        category: 'inspection',
        size: '1.8 MB',
        uploadDate: new Date('2024-11-20'),
        uploadedBy: 'Inspection Team Alpha',
        description: 'Quarterly inspection results and recommendations',
        tags: ['inspection', 'quarterly', 'report']
      },
      {
        id: '5',
        name: 'Coating Inspection Report.pdf',
        type: 'application/pdf',
        category: 'maintenance',
        size: '3.1 MB',
        uploadDate: new Date('2024-08-15'),
        uploadedBy: 'Coating Specialist',
        description: 'Annual coating integrity assessment',
        tags: ['coating', 'maintenance', 'integrity']
      }
    ]
  }
}

export default function AssetDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [asset, setAsset] = useState<AssetDetail | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    name: '',
    description: '',
    category: 'other' as AssetDocument['category'],
    file: null as File | null
  })
  const [documentFilter, setDocumentFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    // Load asset data
    const assetData = dummyAssetDetails[id || '']
    if (assetData) {
      setAsset(assetData)
    }
  }, [id])

  const filteredDocuments = asset?.documents.filter(doc => {
    const matchesCategory = documentFilter === 'all' || doc.category === documentFilter
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesCategory && matchesSearch
  }) || []

  const getRiskScoreColor = (score: number) => {
    if (score >= 7) return 'text-red-600'
    if (score >= 4) return 'text-amber-600'
    return 'text-green-600'
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'text-green-600'
      case 'good': return 'text-emerald-600'
      case 'fair': return 'text-amber-600'
      case 'poor': return 'text-red-600'
      default: return 'text-slate-600'
    }
  }

  const getDocumentCategoryColor = (category: string) => {
    switch (category) {
      case 'design': return 'bg-blue-100 text-blue-800'
      case 'inspection': return 'bg-green-100 text-green-800'
      case 'maintenance': return 'bg-amber-100 text-amber-800'
      case 'compliance': return 'bg-purple-100 text-purple-800'
      case 'technical': return 'bg-slate-100 text-slate-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleFileUpload = () => {
    if (uploadForm.file && asset) {
      const newDocument: AssetDocument = {
        id: Date.now().toString(),
        name: uploadForm.file.name,
        type: uploadForm.file.type,
        category: uploadForm.category,
        size: `${(uploadForm.file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadDate: new Date(),
        uploadedBy: 'Current User',
        description: uploadForm.description
      }

      setAsset({
        ...asset,
        documents: [...asset.documents, newDocument]
      })

      setUploadForm({ name: '', description: '', category: 'other', file: null })
      setIsUploading(false)
    }
  }

  if (!asset) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Asset not found</h2>
          <Button onClick={() => navigate('/assets')} variant="outline">
            Back to Assets
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/assets')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Assets
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{asset.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant="outline" className={getConditionColor(asset.condition)}>
                  {asset.condition.charAt(0).toUpperCase() + asset.condition.slice(1)} Condition
                </Badge>
                <div className="flex items-center gap-1">
                  <Activity className="h-4 w-4 text-slate-400" />
                  <span className={`font-medium ${getRiskScoreColor(asset.riskScore)}`}>
                    Risk Score: {asset.riskScore.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-600">Total Documents</p>
                    <p className="text-lg font-semibold text-slate-900">{asset.documents.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-600">Next Inspection</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {asset.nextInspection.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-600">Pipeline Length</p>
                    <p className="text-lg font-semibold text-slate-900">{asset.length} km</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-600">Operating Pressure</p>
                    <p className="text-lg font-semibold text-slate-900">{asset.operatingPressure} psi</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Technical Specifications */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Technical Specifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Pipeline Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Diameter:</span>
                      <span className="text-sm font-medium">{asset.diameter}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Wall Thickness:</span>
                      <span className="text-sm font-medium">{asset.wallThickness}"</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Material Grade:</span>
                      <span className="text-sm font-medium">{asset.materialGrade}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Length:</span>
                      <span className="text-sm font-medium">{asset.length} km</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Pressure & Temperature</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Design Pressure:</span>
                      <span className="text-sm font-medium">{asset.designPressure} psi</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">MAOP:</span>
                      <span className="text-sm font-medium">{asset.maop} psi</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Test Pressure:</span>
                      <span className="text-sm font-medium">{asset.testPressure} psi</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Temperature:</span>
                      <span className="text-sm font-medium">{asset.temperature}°F</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Protection & Coating</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Coating:</span>
                      <span className="text-sm font-medium text-xs">{asset.coating}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">CP System:</span>
                      <span className="text-sm font-medium text-xs">{asset.cathodicProtection}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Fluid Type:</span>
                      <span className="text-sm font-medium">{asset.fluidType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Flow Rate:</span>
                      <span className="text-sm font-medium">{(asset.flowRate / 1000).toFixed(0)}k bpd</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Route Description</h3>
                <p className="text-sm text-slate-600">{asset.routeDescription}</p>
              </div>
            </CardContent>
          </Card>

          {/* Documents Section */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documents & Drawings
                </CardTitle>
                <Button size="sm" onClick={() => setIsUploading(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-4 mt-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={documentFilter} onValueChange={setDocumentFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="inspection">Inspection</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {filteredDocuments.length > 0 ? (
                <div className="space-y-2">
                  {filteredDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-slate-400" />
                        <div>
                          <h4 className="text-sm font-medium text-slate-900">{doc.name}</h4>
                          {doc.description && (
                            <p className="text-xs text-slate-600 mt-1">{doc.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={`text-xs ${getDocumentCategoryColor(doc.category)}`}>
                              {doc.category}
                            </Badge>
                            <span className="text-xs text-slate-500">{doc.size}</span>
                            <span className="text-xs text-slate-500">
                              Uploaded {doc.uploadDate.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-sm font-medium text-slate-900 mb-1">No documents found</h3>
                  <p className="text-sm text-slate-500">
                    {searchTerm ? 'Try adjusting your search terms' : 'Upload the first document for this asset'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Maintenance History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Maintenance History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {asset.maintenanceHistory.map((maintenance, index) => (
                  <div key={index} className="border-l-2 border-slate-200 pl-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-slate-900">{maintenance.type}</h4>
                        <p className="text-sm text-slate-600 mt-1">{maintenance.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                          <span>Date: {maintenance.date.toLocaleDateString()}</span>
                          <span>By: {maintenance.performedBy}</span>
                          <Badge variant="outline" className="text-xs">{maintenance.status}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      {/* Upload Modal */}
      {isUploading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Upload Document</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setIsUploading(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="file">File</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={(e) => setUploadForm({...uploadForm, file: e.target.files?.[0] || null})}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={uploadForm.category} onValueChange={(value: any) => setUploadForm({...uploadForm, category: value})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="inspection">Inspection</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter document description..."
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsUploading(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleFileUpload} disabled={!uploadForm.file} className="flex-1">
                  Upload Document
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}