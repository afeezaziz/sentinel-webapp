import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Building2, Users, Calendar, Mail, Phone, Edit, Shield, Activity, Settings, FileText, Database, Clock, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { supabase } from '../../lib/supabase'

interface Organization {
  id: string
  name: string
  subscription_tier: 'tier1' | 'tier2' | 'tier3'
  created_at: string
  // Additional fields we'll fetch or compute
  user_count?: number
  asset_count?: number
  last_active?: string
}

interface User {
  id: string
  full_name: string
  email: string
  role: 'admin' | 'engineer' | 'field_tech'
  created_at: string
  last_sign_in_at?: string
}

interface Activity {
  id: string
  user: string
  action: string
  timestamp: string
  status: 'success' | 'warning' | 'error'
}

export default function OrganizationDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      fetchOrganizationData(id)
    }
  }, [id])

  const fetchOrganizationData = async (orgId: string) => {
    try {
      setLoading(true)
      setError(null)

      // Fetch organization data
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .single()

      if (orgError) {
        console.error('Error fetching organization:', orgError)
        setError(orgError.message)
        return
      }

      if (!orgData) {
        setError('Organization not found')
        return
      }

      // Transform to match our interface
      const organization: Organization = {
        id: orgData.id,
        name: orgData.name,
        subscription_tier: orgData.subscription_tier,
        created_at: orgData.created_at,
        user_count: 0,
        asset_count: 0,
        last_active: new Date().toISOString()
      }

      setOrganization(organization)

      // Get additional data (user count, asset count, users list)
      try {
        // Get user count and users list
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, full_name, email, role, created_at, last_sign_in_at')
          .eq('organization_id', orgId)
          .order('created_at', { ascending: false })

        if (!usersError && usersData) {
          organization.user_count = usersData.length
          const transformedUsers: User[] = usersData.map(user => ({
            id: user.id,
            full_name: user.full_name || 'Unknown',
            email: user.email || 'No email',
            role: user.role,
            created_at: user.created_at,
            last_sign_in_at: user.last_sign_in_at
          }))
          setUsers(transformedUsers)
        } else {
          console.warn('Error fetching users:', usersError)
        }
      } catch (userError) {
        console.warn('Could not fetch users data:', userError)
      }

      try {
        // Get asset count
        const { count: assetCount } = await supabase
          .from('assets')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', orgId)

        organization.asset_count = assetCount || 0
      } catch (assetError) {
        console.warn('Could not fetch asset count:', assetError)
      }

      // Update organization with counts
      setOrganization({ ...organization })

      // Mock activities for now (since we don't have an audit_logs table yet)
      const mockActivities: Activity[] = [
        { id: '1', user: 'System', action: 'Organization data loaded', timestamp: new Date().toISOString(), status: 'success' },
        { id: '2', user: 'System', action: 'User statistics updated', timestamp: new Date().toISOString(), status: 'success' }
      ]
      setActivities(mockActivities)

    } catch (error) {
      console.error('Error fetching organization data:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'tier3':
        return 'bg-purple-100 text-purple-800'
      case 'tier2':
        return 'bg-blue-100 text-blue-800'
      case 'tier1':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getActivityIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      default:
        return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-slate-900"></div>
      </div>
    )
  }

  if (error || !organization) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <AlertTriangle className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Error Loading Organization</h2>
          <p className="text-slate-600 mb-4">{error || 'Organization not found'}</p>
          <Button onClick={() => navigate('/admin/organizations')} variant="outline">
            Back to Organizations
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/organizations')}
            className="text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Organizations
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{organization.name}</h1>
            <p className="text-slate-600">Organization ID: {organization.id}</p>
          </div>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Edit className="w-4 h-4 mr-2" />
          Edit Organization
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Status</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  <Badge className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                </p>
              </div>
              <Shield className="w-8 h-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Assets</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{organization.asset_count || 0}</p>
              </div>
              <Building2 className="w-8 h-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Users</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{organization.user_count || 0}</p>
              </div>
              <Users className="w-8 h-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Tier</p>
                <p className="text-lg font-bold text-slate-900 mt-1">
                  <Badge className={getTierColor(organization.subscription_tier)}>
                    {organization.subscription_tier?.toUpperCase() || 'UNKNOWN'}
                  </Badge>
                </p>
              </div>
              <Settings className="w-8 h-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Organization Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Building2 className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{organization.name}</p>
                    <p className="text-sm text-slate-600">Organization Name</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{new Date(organization.created_at).toLocaleDateString()}</p>
                    <p className="text-sm text-slate-600">Created Date</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Database className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{organization.id}</p>
                    <p className="text-sm text-slate-600">Organization ID</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Settings className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{organization.subscription_tier?.toUpperCase() || 'UNKNOWN'}</p>
                    <p className="text-sm text-slate-600">Subscription Tier</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">Total Users</span>
                  <span className="text-sm text-slate-600">{organization.user_count || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">Total Assets</span>
                  <span className="text-sm text-slate-600">{organization.asset_count || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">Subscription Tier</span>
                  <Badge className={getTierColor(organization.subscription_tier)}>
                    {organization.subscription_tier?.toUpperCase() || 'UNKNOWN'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">Status</span>
                  <Badge className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Organization Users ({users.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{user.full_name}</p>
                        <p className="text-sm text-slate-600">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge className={
                        user.role === 'admin' ? 'bg-red-100 text-red-800' :
                        user.role === 'engineer' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }>
                        {user.role?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                      </Badge>
                      <Badge className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                      <div className="text-sm text-slate-600">
                        Created: {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">Current Tier</span>
                  <Badge className={getTierColor(organization.subscription_tier)}>
                    {organization.subscription_tier?.toUpperCase() || 'UNKNOWN'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">Organization ID</span>
                  <span className="text-sm text-slate-600">{organization.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">Member Since</span>
                  <span className="text-sm text-slate-600">{new Date(organization.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">Status</span>
                  <Badge className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">Total Users</span>
                  <span className="text-sm text-slate-600">{organization.user_count || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">Total Assets</span>
                  <span className="text-sm text-slate-600">{organization.asset_count || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">Data Storage</span>
                  <span className="text-sm text-slate-600">Standard</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">API Access</span>
                  <Badge className={organization.subscription_tier === 'tier3' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {organization.subscription_tier === 'tier3' ? 'Enabled' : 'Limited'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getActivityIcon(activity.status)}
                      <div>
                        <p className="font-medium text-slate-900">{activity.action}</p>
                        <p className="text-sm text-slate-600">by {activity.user}</p>
                      </div>
                    </div>
                    <div className="text-sm text-slate-600">
                      <Clock className="w-4 h-4 inline mr-1" />
                      {new Date(activity.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}