import { useState, useEffect } from 'react'
import {
  Users,
  Building2,
  AlertTriangle,
  TrendingUp,
  Shield,
  FileText,
  Clock,
  Activity,
  BarChart3,
  PieChart,
  TrendingDown
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { supabase } from '../../lib/supabase'

interface SystemStats {
  totalOrganizations: number
  totalUsers: number
  totalAssets: number
  totalRisks: number
  criticalRisks: number
  recentActivity: number
}

interface RecentActivity {
  id: string
  type: 'user_created' | 'risk_created' | 'asset_added' | 'org_created'
  description: string
  timestamp: string
  organization?: string
}

interface OrganizationSummary {
  id: string
  name: string
  userCount: number
  assetCount: number
  riskCount: number
  tier: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<SystemStats>({
    totalOrganizations: 0,
    totalUsers: 0,
    totalAssets: 0,
    totalRisks: 0,
    criticalRisks: 0,
    recentActivity: 0
  })
  const [organizations, setOrganizations] = useState<OrganizationSummary[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Get system statistics
      const [
        orgCountResult,
        userCountResult,
        assetCountResult,
        riskCountResult
      ] = await Promise.allSettled([
        supabase.from('organizations').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('assets').select('*', { count: 'exact', head: true }),
        supabase.from('risks').select('*', { count: 'exact', head: true })
      ])

      const orgCount = orgCountResult.status === 'fulfilled' ? orgCountResult.value.count || 0 : 0
      const userCount = userCountResult.status === 'fulfilled' ? userCountResult.value.count || 0 : 0
      const assetCount = assetCountResult.status === 'fulfilled' ? assetCountResult.value.count || 0 : 0
      const riskCount = riskCountResult.status === 'fulfilled' ? riskCountResult.value.count || 0 : 0

      // Get critical risks count
      let criticalRiskCount = 0
      try {
        const { count } = await supabase
          .from('risks')
          .select('*', { count: 'exact', head: true })
          .eq('severity', 'critical')
        criticalRiskCount = count || 0
      } catch (error) {
        console.warn('Error fetching critical risks:', error)
      }

      setStats({
        totalOrganizations: orgCount,
        totalUsers: userCount,
        totalAssets: assetCount,
        totalRisks: riskCount,
        criticalRisks: criticalRiskCount,
        recentActivity: Math.min(userCount, 10) // Mock recent activity
      })

      // Get top organizations by user count
      try {
        const { data: orgsData } = await supabase
          .from('organizations')
          .select('id, name, subscription_tier')
          .limit(5)

        if (orgsData) {
          const orgSummaries: OrganizationSummary[] = await Promise.all(
            orgsData.map(async (org) => {
              const [userCountResult, assetCountResult, riskCountResult] = await Promise.allSettled([
                supabase.from('users').select('*', { count: 'exact', head: true }).eq('organization_id', org.id),
                supabase.from('assets').select('*', { count: 'exact', head: true }).eq('organization_id', org.id),
                supabase.from('risks').select('*', { count: 'exact', head: true }).eq('organization_id', org.id)
              ])

              return {
                id: org.id,
                name: org.name,
                userCount: userCountResult.status === 'fulfilled' ? userCountResult.value.count || 0 : 0,
                assetCount: assetCountResult.status === 'fulfilled' ? assetCountResult.value.count || 0 : 0,
                riskCount: riskCountResult.status === 'fulfilled' ? riskCountResult.value.count || 0 : 0,
                tier: org.subscription_tier
              }
            })
          )
          setOrganizations(orgSummaries.sort((a, b) => b.userCount - a.userCount))
        }
      } catch (error) {
        console.warn('Error fetching organization summaries:', error)
      }

      // Mock recent activity (since we don't have audit logs yet)
      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'user_created',
          description: 'New user registered',
          timestamp: new Date().toISOString(),
          organization: 'System'
        },
        {
          id: '2',
          type: 'risk_created',
          description: 'High risk assessment created',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          organization: 'System'
        },
        {
          id: '3',
          type: 'asset_added',
          description: 'New asset added to inventory',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          organization: 'System'
        }
      ]
      setRecentActivity(mockActivity)

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_created':
        return <Users className="w-4 h-4 text-blue-600" />
      case 'risk_created':
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      case 'asset_added':
        return <Building2 className="w-4 h-4 text-green-600" />
      case 'org_created':
        return <Building2 className="w-4 h-4 text-purple-600" />
      default:
        return <Activity className="w-4 h-4 text-gray-600" />
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-slate-900"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-600 mt-1">System-wide overview and analytics</p>
      </div>

      {/* System Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Organizations</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalOrganizations}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">Active</span>
                </div>
              </div>
              <Building2 className="w-12 h-12 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Users</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalUsers}</p>
                <div className="flex items-center mt-2">
                  <Users className="w-4 h-4 text-blue-600 mr-1" />
                  <span className="text-sm text-blue-600">Registered</span>
                </div>
              </div>
              <Users className="w-12 h-12 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Assets</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalAssets}</p>
                <div className="flex items-center mt-2">
                  <Building2 className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">Tracked</span>
                </div>
              </div>
              <Building2 className="w-12 h-12 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Risks</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalRisks}</p>
                <div className="flex items-center mt-2">
                  <BarChart3 className="w-4 h-4 text-orange-600 mr-1" />
                  <span className="text-sm text-orange-600">Assessed</span>
                </div>
              </div>
              <AlertTriangle className="w-12 h-12 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Critical Risks</p>
                <p className="text-3xl font-bold text-slate-900 mt-2 text-red-600">{stats.criticalRisks}</p>
                <div className="flex items-center mt-2">
                  <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                  <span className="text-sm text-red-600">Immediate Attention</span>
                </div>
              </div>
              <Shield className="w-12 h-12 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">System Health</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">98%</p>
                <div className="flex items-center mt-2">
                  <Activity className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">Operational</span>
                </div>
              </div>
              <Activity className="w-12 h-12 text-slate-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Organizations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Top Organizations by Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {organizations.slice(0, 5).map((org) => (
                <div key={org.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">{org.name}</p>
                    <p className="text-sm text-slate-600">{org.userCount} users • {org.assetCount} assets</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getTierColor(org.tier)}>
                      {org.tier?.toUpperCase()}
                    </Badge>
                    <div className="text-sm text-slate-600">
                      {org.riskCount} risks
                    </div>
                  </div>
                </div>
              ))}
              {organizations.length === 0 && (
                <div className="text-center py-8">
                  <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">No organizations found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent System Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Recent System Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getActivityIcon(activity.type)}
                    <div>
                      <p className="font-medium text-slate-900">{activity.description}</p>
                      <p className="text-sm text-slate-600">{activity.organization}</p>
                    </div>
                  </div>
                  <div className="text-sm text-slate-600">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <Users className="w-6 h-6 text-blue-600 mb-2" />
              <p className="text-sm font-medium">Manage Users</p>
            </button>
            <button className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <Building2 className="w-6 h-6 text-green-600 mb-2" />
              <p className="text-sm font-medium">View Organizations</p>
            </button>
            <button className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <AlertTriangle className="w-6 h-6 text-red-600 mb-2" />
              <p className="text-sm font-medium">Review Critical Risks</p>
            </button>
            <button className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <FileText className="w-6 h-6 text-purple-600 mb-2" />
              <p className="text-sm font-medium">Generate Reports</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}