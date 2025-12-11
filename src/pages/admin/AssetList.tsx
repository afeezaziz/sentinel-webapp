import { useState, useEffect } from 'react'
import {
  Search,
  Filter,
  Building2,
  MapPin,
  Activity,
  AlertTriangle,
  MoreHorizontal,
  Download,
  Wrench,
  Shield,
  Gauge
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

interface Asset {
  id: string
  name: string
  type: string
  location: string
  status: 'operational' | 'maintenance' | 'critical' | 'offline'
  condition: 'excellent' | 'good' | 'fair' | 'poor'
  created_at: string
  updated_at: string
  organization?: {
    id: string
    name: string
  }
  risk_count?: number
  last_inspection?: string
  criticality: 'low' | 'medium' | 'high' | 'critical'
}

export default function AdminAssetList() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [organizationFilter, setOrganizationFilter] = useState<string>('all')
  const [organizations, setOrganizations] = useState<Array<{id: string, name: string}>>([])
  const [assetTypes, setAssetTypes] = useState<string[]>([])

  useEffect(() => {
    fetchAssets()
    fetchOrganizations()
  }, [statusFilter, typeFilter, organizationFilter])

  const fetchAssets = async () => {
    try {
      setLoading(true)

      let query = supabase
        .from('assets')
        .select(`
          *,
          organizations!inner (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false })

      // Apply filters
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }
      if (typeFilter !== 'all') {
        query = query.eq('type', typeFilter)
      }
      if (organizationFilter !== 'all') {
        query = query.eq('organization_id', organizationFilter)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching assets:', error)
        return
      }

      // Get unique asset types
      const types = [...new Set((data || []).map((asset: any) => asset.type).filter(Boolean))]
      setAssetTypes(types)

      // Enhance assets with risk counts
      const transformedAssets: Asset[] = await Promise.all(
        (data || []).map(async (asset: any) => {
          let riskCount = 0
          try {
            const { count } = await supabase
              .from('risks')
              .select('*', { count: 'exact', head: true })
              .eq('asset_id', asset.id)
            riskCount = count || 0
          } catch (error) {
            console.warn('Error fetching risk count for asset:', asset.id)
          }

          return {
            id: asset.id,
            name: asset.name,
            type: asset.type || 'Unknown',
            location: asset.location || 'Unknown',
            status: asset.status || 'operational',
            condition: asset.condition || 'good',
            created_at: asset.created_at,
            updated_at: asset.updated_at,
            organization: asset.organizations,
            risk_count: riskCount,
            criticality: asset.criticality || 'medium'
          }
        })
      )

      setAssets(transformedAssets)
    } catch (error) {
      console.error('Error fetching assets:', error)
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

  const filteredAssets = assets.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.organization?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-green-100 text-green-800'
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800'
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'offline':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent':
        return 'bg-green-100 text-green-800'
      case 'good':
        return 'bg-blue-100 text-blue-800'
      case 'fair':
        return 'bg-yellow-100 text-yellow-800'
      case 'poor':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const exportToCSV = () => {
    const headers = ['Name', 'Type', 'Location', 'Status', 'Condition', 'Criticality', 'Organization', 'Risk Count', 'Created Date', 'Updated Date']
    const csvData = filteredAssets.map(asset => [
      asset.name,
      asset.type,
      asset.location,
      asset.status,
      asset.condition,
      asset.criticality,
      asset.organization?.name || '',
      asset.risk_count?.toString() || '0',
      formatDate(asset.created_at),
      formatDate(asset.updated_at)
    ])

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `assets_export_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const assetStats = {
    total: assets.length,
    operational: assets.filter(a => a.status === 'operational').length,
    maintenance: assets.filter(a => a.status === 'maintenance').length,
    critical: assets.filter(a => a.status === 'critical').length,
    totalRisks: assets.reduce((sum, asset) => sum + (asset.risk_count || 0), 0)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Asset Management</h1>
          <p className="text-slate-600 mt-1">System-wide asset monitoring and tracking</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Assets</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{assetStats.total}</p>
              </div>
              <Building2 className="w-12 h-12 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Operational</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{assetStats.operational}</p>
              </div>
              <Activity className="w-12 h-12 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Maintenance</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{assetStats.maintenance}</p>
              </div>
              <Wrench className="w-12 h-12 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Critical</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{assetStats.critical}</p>
              </div>
              <AlertTriangle className="w-12 h-12 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Risks</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{assetStats.totalRisks}</p>
              </div>
              <Shield className="w-12 h-12 text-orange-400" />
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
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="operational">Operational</option>
              <option value="maintenance">Maintenance</option>
              <option value="critical">Critical</option>
              <option value="offline">Offline</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              {assetTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
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

      {/* Assets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Assets ({filteredAssets.length})</CardTitle>
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
                  <TableHead>Asset</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Risks</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-slate-900">{asset.name}</div>
                        <div className="flex items-center mt-1">
                          <Badge className={getCriticalityColor(asset.criticality)}>
                            {asset.criticality.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-slate-900">{asset.type}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-slate-600">
                        <MapPin className="w-4 h-4 mr-1" />
                        {asset.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-slate-600">
                        <Building2 className="w-4 h-4 mr-1" />
                        {asset.organization?.name || 'Unknown'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(asset.status)}>
                        {asset.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getConditionColor(asset.condition)}>
                        {asset.condition.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1 text-orange-500" />
                        <span className="text-sm font-medium">{asset.risk_count || 0}</span>
                      </div>
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
                          <DropdownMenuItem>View Risks</DropdownMenuItem>
                          <DropdownMenuItem>Edit Asset</DropdownMenuItem>
                          <DropdownMenuItem>Schedule Inspection</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Change Status</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">Delete Asset</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {filteredAssets.length === 0 && !loading && (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No assets found</h3>
              <p className="text-slate-600">Try adjusting your search terms or filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}