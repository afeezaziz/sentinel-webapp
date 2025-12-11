import { useState, useEffect } from 'react'
import {
  Search,
  Filter,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Building2,
  User,
  Shield,
  MoreHorizontal,
  Download,
  Eye
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'
import { supabase } from '../../lib/supabase'

interface Risk {
  id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  likelihood: 'low' | 'medium' | 'high'
  impact: 'low' | 'medium' | 'high'
  status: 'open' | 'mitigated' | 'accepted' | 'closed'
  created_at: string
  updated_at: string
  organization?: {
    id: string
    name: string
  }
  asset?: {
    id: string
    name: string
    type: string
  }
  assigned_user?: {
    id: string
    full_name: string
    email: string
  }
}

export default function AdminRiskList() {
  const [risks, setRisks] = useState<Risk[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [organizationFilter, setOrganizationFilter] = useState<string>('all')
  const [organizations, setOrganizations] = useState<Array<{id: string, name: string}>>([])

  useEffect(() => {
    fetchRisks()
    fetchOrganizations()
  }, [severityFilter, statusFilter, organizationFilter])

  const fetchRisks = async () => {
    try {
      setLoading(true)

      let query = supabase
        .from('risks')
        .select(`
          *,
          organizations!inner (
            id,
            name
          ),
          assets (
            id,
            name,
            type
          ),
          assigned_user (
            id,
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })

      // Apply filters
      if (severityFilter !== 'all') {
        query = query.eq('severity', severityFilter)
      }
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }
      if (organizationFilter !== 'all') {
        query = query.eq('organization_id', organizationFilter)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching risks:', error)
        return
      }

      const transformedRisks: Risk[] = (data || []).map((risk: any) => ({
        id: risk.id,
        title: risk.title,
        description: risk.description,
        severity: risk.severity,
        likelihood: risk.likelihood,
        impact: risk.impact,
        status: risk.status,
        created_at: risk.created_at,
        updated_at: risk.updated_at,
        organization: risk.organizations,
        asset: risk.assets,
        assigned_user: risk.assigned_user
      }))

      setRisks(transformedRisks)
    } catch (error) {
      console.error('Error fetching risks:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchOrganizations = async () => {
    try {
      const { data } = await supabase
        .from('organizations')
        .select('id, name')
        .order('name')

      if (data) {
        setOrganizations(data)
      }
    } catch (error) {
      console.error('Error fetching organizations:', error)
    }
  }

  const filteredRisks = risks.filter(risk =>
    risk.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    risk.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    risk.organization?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    risk.asset?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800'
      case 'mitigated':
        return 'bg-yellow-100 text-yellow-800'
      case 'accepted':
        return 'bg-blue-100 text-blue-800'
      case 'closed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const exportToCSV = () => {
    const headers = ['Title', 'Description', 'Severity', 'Status', 'Organization', 'Asset', 'Created Date', 'Updated Date']
    const csvData = filteredRisks.map(risk => [
      risk.title,
      risk.description,
      risk.severity,
      risk.status,
      risk.organization?.name || '',
      risk.asset?.name || '',
      formatDate(risk.created_at),
      formatDate(risk.updated_at)
    ])

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `risks_export_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const riskStats = {
    total: risks.length,
    critical: risks.filter(r => r.severity === 'critical').length,
    high: risks.filter(r => r.severity === 'high').length,
    open: risks.filter(r => r.status === 'open').length
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Risk Management</h1>
          <p className="text-slate-600 mt-1">System-wide risk monitoring and assessment</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Risks</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{riskStats.total}</p>
              </div>
              <Shield className="w-12 h-12 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Critical</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{riskStats.critical}</p>
              </div>
              <AlertTriangle className="w-12 h-12 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">High Priority</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{riskStats.high}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Open Risks</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{riskStats.open}</p>
              </div>
              <Eye className="w-12 h-12 text-slate-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search risks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="mitigated">Mitigated</option>
              <option value="accepted">Accepted</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={organizationFilter}
              onChange={(e) => setOrganizationFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Organizations</option>
              {organizations.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Risks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Risks ({filteredRisks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Risk</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Asset</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRisks.map((risk) => (
                  <TableRow key={risk.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-slate-900">{risk.title}</div>
                        <div className="text-sm text-slate-600 mt-1 line-clamp-2">{risk.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getSeverityColor(risk.severity)}>
                        {risk.severity.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-slate-600">
                        <Building2 className="w-4 h-4 mr-1" />
                        {risk.organization?.name || 'Unknown'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm font-medium text-slate-900">{risk.asset?.name || 'N/A'}</div>
                        <div className="text-xs text-slate-600">{risk.asset?.type || ''}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(risk.status)}>
                        {risk.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-slate-600">{formatDate(risk.created_at)}</div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit Risk</DropdownMenuItem>
                          <DropdownMenuItem>Assign User</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Change Status</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">Delete Risk</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {filteredRisks.length === 0 && !loading && (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No risks found</h3>
              <p className="text-slate-600">Try adjusting your search terms or filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}