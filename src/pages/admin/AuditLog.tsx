import { useState, useEffect } from 'react'
import { Search, Filter, Download, Calendar, User, Server, Shield, AlertTriangle, CheckCircle, XCircle, Clock, Activity, Database, Settings, Eye, MoreHorizontal } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
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
import { Badge } from '../../components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'

interface AuditLog {
  id: string
  timestamp: string
  user?: {
    id: string
    name: string
    email: string
    organization: string
  }
  action: string
  category: 'user_management' | 'data_access' | 'system' | 'api' | 'security' | 'cron_job'
  details: string
  status: 'success' | 'warning' | 'error' | 'info'
  ipAddress: string
  userAgent?: string
  metadata?: {
    affectedEntity?: string
    entityType?: string
    oldValue?: string
    newValue?: string
    duration?: number
    responseCode?: number
  }
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export default function AuditLog() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('7days')

  useEffect(() => {
    fetchAuditLogs()
  }, [])

  const fetchAuditLogs = async () => {
    try {
      setLoading(true)

      // Load logs from localStorage (for demo purposes)
      const storedLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]')

      // If no logs in storage, add some sample logs for demonstration
      if (storedLogs.length === 0) {
        const sampleLogs: AuditLog[] = [
          {
            id: '1',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
            user: {
              id: '1',
              name: 'System User',
              email: 'system@sentinel.com',
              organization: 'System'
            },
            action: 'System Initialized',
            category: 'system',
            details: 'Audit logging system initialized',
            status: 'success',
            ipAddress: '127.0.0.1',
            severity: 'low'
          }
        ]
        localStorage.setItem('auditLogs', JSON.stringify(sampleLogs))
        setLogs(sampleLogs)
      } else {
        setLogs(storedLogs)
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (log.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter

    return matchesSearch && matchesCategory && matchesStatus && matchesSeverity
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case 'info':
      default:
        return <Activity className="w-4 h-4 text-blue-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'info':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'user_management':
        return <User className="w-4 h-4 text-slate-600" />
      case 'data_access':
        return <Database className="w-4 h-4 text-slate-600" />
      case 'system':
        return <Server className="w-4 h-4 text-slate-600" />
      case 'api':
        return <Activity className="w-4 h-4 text-slate-600" />
      case 'security':
        return <Shield className="w-4 h-4 text-slate-600" />
      case 'cron_job':
        return <Clock className="w-4 h-4 text-slate-600" />
      default:
        return <Activity className="w-4 h-4 text-slate-600" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500 text-white'
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const exportLogs = () => {
    // Mock export functionality
    console.log('Exporting logs...')
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Audit Log</h1>
          <p className="text-slate-600 mt-1">Monitor all system activities and user actions</p>
        </div>
        <Button onClick={exportLogs} className="bg-blue-600 hover:bg-blue-700">
          <Download className="w-4 h-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Events</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{logs.length}</p>
              </div>
              <Activity className="w-8 h-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Success Rate</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {Math.round((logs.filter(l => l.status === 'success').length / logs.length) * 100)}%
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Warnings</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {logs.filter(l => l.status === 'warning').length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Errors</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {logs.filter(l => l.status === 'error').length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="user_management">User Management</SelectItem>
                <SelectItem value="data_access">Data Access</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="api">API</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="cron_job">Cron Jobs</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>

            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24hours">Last 24 Hours</SelectItem>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>System Activities</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium text-slate-900">{log.timestamp}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.user ? (
                        <div className="text-sm">
                          <div className="font-medium text-slate-900">{log.user.name}</div>
                          <div className="text-slate-600">{log.user.organization}</div>
                        </div>
                      ) : (
                        <div className="flex items-center text-slate-600">
                          <Server className="w-4 h-4 mr-1" />
                          System
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(log.category)}
                        <span className="capitalize text-sm">
                          {log.category.replace('_', ' ')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-slate-900">{log.action}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(log.status)}
                        <Badge className={getStatusColor(log.status)}>
                          {log.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getSeverityColor(log.severity)}>
                        {log.severity.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-slate-600">{log.ipAddress}</div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate text-sm text-slate-600" title={log.details}>
                        {log.details}
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
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>View Context</DropdownMenuItem>
                          <DropdownMenuItem>Export Entry</DropdownMenuItem>
                          {log.status === 'error' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                Investigate Issue
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Empty State */}
      {filteredLogs.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Activity className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No logs found</h3>
            <p className="text-slate-600">Try adjusting your search terms or filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}