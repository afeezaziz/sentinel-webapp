import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import { ScrollArea } from '../components/ui/scroll-area'
import {
  AlertTriangle,
  Search,
  Filter,
  Eye,
  Archive,
  CheckCircle,
  Clock,
  XCircle,
  ArrowUpDown
} from 'lucide-react'

// Extended dummy data for risk list
const dummyRisks = [
  {
    id: '1',
    title: 'High Risk Excavation Activity Detected Near Pipeline Section A-12',
    description: 'Unauthorized excavation equipment detected within 100m of critical pipeline infrastructure',
    riskScore: 9,
    status: 'active' as const,
    priority: 'critical' as const,
    type: 'excavation' as const,
    location: 'Pipeline KM 42.5, Near Industrial Zone',
    lat: 4.2,
    lng: 101.5,
    createdAt: new Date('2024-12-10T14:30:00'),
    updatedAt: new Date('2024-12-11T09:15:00'),
    assignedTo: 'John Smith',
    reportedBy: 'Automated Monitoring System',
    category: 'Third-Party Damage'
  },
  {
    id: '2',
    title: 'Unauthorized Vehicle Access Alert - Construction Vehicle Detected',
    description: 'Heavy construction vehicle entering restricted pipeline right-of-way area',
    riskScore: 6,
    status: 'active' as const,
    priority: 'high' as const,
    type: 'vehicle' as const,
    location: 'Pipeline KM 28.3, Agricultural Area',
    lat: 4.5,
    lng: 102.0,
    createdAt: new Date('2024-12-10T13:45:00'),
    updatedAt: new Date('2024-12-10T16:20:00'),
    assignedTo: 'Sarah Johnson',
    reportedBy: 'Security Patrol',
    category: 'Security Breach'
  },
  {
    id: '3',
    title: 'Minor Ground Disturbance - Possible Animal Activity',
    description: 'Small ground disturbance detected, likely caused by animal activity',
    riskScore: 3,
    status: 'resolved' as const,
    priority: 'low' as const,
    type: 'ground' as const,
    location: 'Pipeline KM 67.8, Forest Reserve',
    lat: 4.8,
    lng: 102.5,
    createdAt: new Date('2024-12-09T11:30:00'),
    updatedAt: new Date('2024-12-09T15:45:00'),
    assignedTo: 'Mike Wilson',
    reportedBy: 'Aerial Inspection',
    category: 'Natural Causes'
  },
  {
    id: '4',
    title: 'Construction Activity Near Pipeline Right-of-Way',
    description: 'Building construction activity detected near pipeline easement',
    riskScore: 7,
    status: 'investigating' as const,
    priority: 'high' as const,
    type: 'construction' as const,
    location: 'Pipeline KM 89.2, Residential Area',
    lat: 5.0,
    lng: 103.0,
    createdAt: new Date('2024-12-10T10:15:00'),
    updatedAt: new Date('2024-12-11T08:30:00'),
    assignedTo: 'Emily Davis',
    reportedBy: 'Ground Patrol',
    category: 'Encroachment'
  },
  {
    id: '5',
    title: 'Heavy Machinery Movement Alert - Excavator Detected',
    description: 'Heavy excavator operation in close proximity to pipeline corridor',
    riskScore: 8,
    status: 'active' as const,
    priority: 'critical' as const,
    type: 'excavation' as const,
    location: 'Pipeline KM 156.7, Commercial District',
    lat: 5.3,
    lng: 103.5,
    createdAt: new Date('2024-12-11T07:45:00'),
    updatedAt: new Date('2024-12-11T08:00:00'),
    assignedTo: 'Robert Brown',
    reportedBy: 'Satellite Monitoring',
    category: 'Third-Party Damage'
  },
  {
    id: '6',
    title: 'Soil Disturbance Alert - Possible Erosion',
    description: 'Significant soil erosion detected near pipeline supports',
    riskScore: 4,
    status: 'monitoring' as const,
    priority: 'medium' as const,
    type: 'ground' as const,
    location: 'Pipeline KM 203.1, Rural Area',
    lat: 5.6,
    lng: 104.0,
    createdAt: new Date('2024-12-08T14:20:00'),
    updatedAt: new Date('2024-12-10T12:15:00'),
    assignedTo: 'Lisa Anderson',
    reportedBy: 'Routine Inspection',
    category: 'Environmental'
  },
  {
    id: '7',
    title: 'Critical: Unauthorized Drilling Activity Detected',
    description: 'Unauthorized drilling operation detected within pipeline protection zone',
    riskScore: 9,
    status: 'archived' as const,
    priority: 'critical' as const,
    type: 'excavation' as const,
    location: 'Pipeline KM 278.9, Industrial Complex',
    lat: 5.9,
    lng: 104.5,
    createdAt: new Date('2024-12-05T09:30:00'),
    updatedAt: new Date('2024-12-07T16:45:00'),
    assignedTo: 'James Miller',
    reportedBy: 'Emergency Response Team',
    category: 'Third-Party Damage'
  }
]

type StatusType = 'active' | 'investigating' | 'resolved' | 'monitoring' | 'archived'
type PriorityType = 'critical' | 'high' | 'medium' | 'low'

export default function RiskList() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusType | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<PriorityType | 'all'>('all')
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt' | 'riskScore'>('updatedAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const filteredAndSortedRisks = useMemo(() => {
    let filtered = dummyRisks.filter(risk => {
      const matchesSearch = risk.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           risk.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           risk.category.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || risk.status === statusFilter
      const matchesPriority = priorityFilter === 'all' || risk.priority === priorityFilter

      return matchesSearch && matchesStatus && matchesPriority
    })

    // Sort the filtered risks
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy]
      let bValue: any = b[sortBy]

      if (aValue instanceof Date) aValue = aValue.getTime()
      if (bValue instanceof Date) bValue = bValue.getTime()

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [searchTerm, statusFilter, priorityFilter, sortBy, sortOrder])

  const getStatusIcon = (status: StatusType) => {
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
    }
  }

  const getStatusColor = (status: StatusType) => {
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
    }
  }

  const getPriorityColor = (priority: PriorityType) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
    }
  }

  const toggleSort = (field: 'createdAt' | 'updatedAt' | 'riskScore') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Risk Management</h1>
        <p className="text-slate-600 mt-1">Comprehensive view of all pipeline risks and incidents</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search risks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="monitoring">Monitoring</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            {/* Priority Filter */}
            <Select value={priorityFilter} onValueChange={(value: any) => setPriorityFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            {/* Stats */}
            <div className="flex items-center justify-center bg-slate-50 rounded-lg">
              <span className="text-sm font-medium text-slate-600">
                {filteredAndSortedRisks.length} of {dummyRisks.length} risks
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Table */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Risk</TableHead>
                  <TableHead>Title & Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort('riskScore')}>
                    <div className="flex items-center gap-1">
                      Risk Score
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort('updatedAt')}>
                    <div className="flex items-center gap-1">
                      Last Updated
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedRisks.map((risk) => (
                  <TableRow key={risk.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <div
                          className={`w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                            risk.riskScore >= 8 ? 'bg-red-500' :
                            risk.riskScore >= 5 ? 'bg-amber-500' : 'bg-green-500'
                          }`}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-slate-900 line-clamp-2">
                          {risk.title}
                        </div>
                        <div className="text-sm text-slate-500 mt-1">
                          {risk.location}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`flex items-center gap-1 w-fit ${getStatusColor(risk.status)}`}>
                        {getStatusIcon(risk.status)}
                        <span className="capitalize">{risk.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getPriorityColor(risk.priority)}>
                        <span className="capitalize">{risk.priority}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${
                          risk.riskScore >= 8 ? 'text-red-600' :
                          risk.riskScore >= 5 ? 'text-amber-600' : 'text-green-600'
                        }`}>
                          {risk.riskScore}/10
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-slate-900">{risk.assignedTo}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-slate-600">
                        {risk.updatedAt.toLocaleDateString()}
                        <div className="text-xs text-slate-500">
                          {risk.updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/risk/${risk.id}`)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {filteredAndSortedRisks.length === 0 && (
        <Card className="mt-6">
          <CardContent className="py-12">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No risks found</h3>
              <p className="text-slate-500">Try adjusting your filters or search terms</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}