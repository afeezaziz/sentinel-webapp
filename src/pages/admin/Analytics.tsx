import { useState, useEffect } from 'react'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  AlertTriangle,
  Activity,
  PieChart,
  Calendar,
  Download,
  Filter,
  Shield
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { supabase } from '../../lib/supabase'

interface AnalyticsData {
  systemOverview: {
    totalOrganizations: number
    totalUsers: number
    totalAssets: number
    totalRisks: number
    activeUsers: number
    systemHealth: number
  }
  riskAnalytics: {
    bySeverity: Record<string, number>
    byStatus: Record<string, number>
    trend: Array<{ date: string; count: number }>
    topRiskTypes: Array<{ type: string; count: number }>
  }
  assetAnalytics: {
    byStatus: Record<string, number>
    byType: Record<string, number>
    byCondition: Record<string, number>
    utilizationRate: number
  }
  organizationMetrics: Array<{
    id: string
    name: string
    userCount: number
    assetCount: number
    riskCount: number
    riskScore: number
  }>
}

export default function AdminAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)

      // Get system overview
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

      const systemOverview = {
        totalOrganizations: orgCountResult.status === 'fulfilled' ? orgCountResult.value.count || 0 : 0,
        totalUsers: userCountResult.status === 'fulfilled' ? userCountResult.value.count || 0 : 0,
        totalAssets: assetCountResult.status === 'fulfilled' ? assetCountResult.value.count || 0 : 0,
        totalRisks: riskCountResult.status === 'fulfilled' ? riskCountResult.value.count || 0 : 0,
        activeUsers: Math.floor((userCountResult.status === 'fulfilled' ? userCountResult.value.count || 0 : 0) * 0.8), // Mock active users
        systemHealth: 95 // Mock system health
      }

      // Get risk analytics
      let riskBySeverity: Record<string, number> = {}
      let riskByStatus: Record<string, number> = {}

      try {
        const { data: risks } = await supabase.from('risks').select('severity, status')
        if (risks) {
          riskBySeverity = risks.reduce((acc, risk) => {
            acc[risk.severity] = (acc[risk.severity] || 0) + 1
            return acc
          }, {})
          riskByStatus = risks.reduce((acc, risk) => {
            acc[risk.status] = (acc[risk.status] || 0) + 1
            return acc
          }, {})
        }
      } catch (error) {
        console.warn('Error fetching risk analytics:', error)
      }

      // Mock trend data
      const riskTrend = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        count: Math.floor(Math.random() * 10) + 5
      }))

      const topRiskTypes = [
        { type: 'Equipment Failure', count: 25 },
        { type: 'Environmental', count: 18 },
        { type: 'Safety', count: 15 },
        { type: 'Operational', count: 12 },
        { type: 'Security', count: 8 }
      ]

      // Get asset analytics
      let assetByStatus: Record<string, number> = {}
      let assetByType: Record<string, number> = {}
      let assetByCondition: Record<string, number> = {}

      try {
        const { data: assets } = await supabase.from('assets').select('status, type, condition')
        if (assets) {
          assetByStatus = assets.reduce((acc, asset) => {
            acc[asset.status || 'unknown'] = (acc[asset.status || 'unknown'] || 0) + 1
            return acc
          }, {})
          assetByType = assets.reduce((acc, asset) => {
            acc[asset.type || 'unknown'] = (acc[asset.type || 'unknown'] || 0) + 1
            return acc
          }, {})
          assetByCondition = assets.reduce((acc, asset) => {
            acc[asset.condition || 'unknown'] = (acc[asset.condition || 'unknown'] || 0) + 1
            return acc
          }, {})
        }
      } catch (error) {
        console.warn('Error fetching asset analytics:', error)
      }

      // Get organization metrics
      let organizationMetrics: any[] = []
      try {
        const { data: orgs } = await supabase
          .from('organizations')
          .select('id, name')
          .limit(10)

        if (orgs) {
          organizationMetrics = await Promise.all(
            orgs.map(async (org) => {
              const [userCountResult, assetCountResult, riskCountResult] = await Promise.allSettled([
                supabase.from('users').select('*', { count: 'exact', head: true }).eq('organization_id', org.id),
                supabase.from('assets').select('*', { count: 'exact', head: true }).eq('organization_id', org.id),
                supabase.from('risks').select('*', { count: 'exact', head: true }).eq('organization_id', org.id)
              ])

              const userCount = userCountResult.status === 'fulfilled' ? userCountResult.value.count || 0 : 0
              const assetCount = assetCountResult.status === 'fulfilled' ? assetCountResult.value.count || 0 : 0
              const riskCount = riskCountResult.status === 'fulfilled' ? riskCountResult.value.count || 0 : 0

              // Calculate risk score (mock calculation)
              const riskScore = riskCount > 0 ? Math.min(100, (riskCount / Math.max(assetCount, 1)) * 50) : 0

              return {
                id: org.id,
                name: org.name,
                userCount,
                assetCount,
                riskCount,
                riskScore: Math.round(riskScore)
              }
            })
          )
        }
      } catch (error) {
        console.warn('Error fetching organization metrics:', error)
      }

      const analyticsData: AnalyticsData = {
        systemOverview,
        riskAnalytics: {
          bySeverity: riskBySeverity,
          byStatus: riskByStatus,
          trend: riskTrend,
          topRiskTypes
        },
        assetAnalytics: {
          byStatus: assetByStatus,
          byType: assetByType,
          byCondition: assetByCondition,
          utilizationRate: 87 // Mock utilization rate
        },
        organizationMetrics
      }

      setAnalyticsData(analyticsData)
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = () => {
    if (!analyticsData) return

    const reportData = {
      systemOverview: analyticsData.systemOverview,
      riskAnalytics: analyticsData.riskAnalytics,
      assetAnalytics: analyticsData.assetAnalytics,
      organizationMetrics: analyticsData.organizationMetrics,
      generatedAt: new Date().toISOString(),
      timeRange
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics_report_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-slate-900"></div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Analytics Unavailable</h2>
          <p className="text-slate-600">Unable to load analytics data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
          <p className="text-slate-600 mt-1">System-wide performance insights and metrics</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button variant="outline" onClick={exportReport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Organizations</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{analyticsData.systemOverview.totalOrganizations}</p>
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
                <p className="text-2xl font-bold text-slate-900 mt-2">{analyticsData.systemOverview.totalUsers}</p>
                <p className="text-xs text-green-600 mt-1">
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  {analyticsData.systemOverview.activeUsers} active
                </p>
              </div>
              <Users className="w-8 h-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Assets</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{analyticsData.systemOverview.totalAssets}</p>
                <p className="text-xs text-blue-600 mt-1">{analyticsData.assetAnalytics.utilizationRate}% utilized</p>
              </div>
              <Activity className="w-8 h-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Risks</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{analyticsData.systemOverview.totalRisks}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Critical Risks</p>
                <p className="text-2xl font-bold text-red-600 mt-2">{analyticsData.riskAnalytics.bySeverity.critical || 0}</p>
              </div>
              <Shield className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">System Health</p>
                <p className="text-2xl font-bold text-green-600 mt-2">{analyticsData.systemOverview.systemHealth}%</p>
              </div>
              <Activity className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              Risk Distribution by Severity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analyticsData.riskAnalytics.bySeverity).map(([severity, count]) => (
                <div key={severity} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      severity === 'critical' ? 'bg-red-500' :
                      severity === 'high' ? 'bg-orange-500' :
                      severity === 'medium' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`} />
                    <span className="font-medium capitalize">{severity}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-slate-600">
                      {((count / analyticsData.systemOverview.totalRisks) * 100).toFixed(1)}%
                    </div>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Asset Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Asset Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analyticsData.assetAnalytics.byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      status === 'operational' ? 'bg-green-500' :
                      status === 'maintenance' ? 'bg-yellow-500' :
                      status === 'critical' ? 'bg-red-500' :
                      'bg-gray-500'
                    }`} />
                    <span className="font-medium capitalize">{status}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-slate-600">
                      {((count / analyticsData.systemOverview.totalAssets) * 100).toFixed(1)}%
                    </div>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Risk Types */}
      <Card>
        <CardHeader>
          <CardTitle>Top Risk Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {analyticsData.riskAnalytics.topRiskTypes.map((riskType, index) => (
              <div key={riskType.type} className="p-4 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-900">#{index + 1}</span>
                  <Badge variant="outline">{riskType.count}</Badge>
                </div>
                <p className="text-sm text-slate-600">{riskType.type}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Organization Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-900">Organization</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900">Users</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900">Assets</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900">Risks</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900">Risk Score</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.organizationMetrics.map((org) => (
                  <tr key={org.id} className="border-b border-slate-100">
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">{org.name}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1 text-blue-500" />
                        {org.userCount}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <Activity className="w-4 h-4 mr-1 text-green-500" />
                        {org.assetCount}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1 text-red-500" />
                        {org.riskCount}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-20 bg-slate-200 rounded-full h-2 mr-2">
                          <div
                            className={`h-2 rounded-full ${
                              org.riskScore > 70 ? 'bg-red-500' :
                              org.riskScore > 40 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${org.riskScore}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{org.riskScore}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}