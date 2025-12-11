import { useState, useEffect } from 'react'
import { User, Settings as SettingsIcon, CreditCard, Bell, Save, AlertCircle } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Skeleton } from '../components/ui/skeleton'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { toast } from 'sonner'

interface OrganizationSettings {
  rowBuffer: number
  riskThreshold: number
  dataRegion: string
}

interface NotificationSettings {
  highRiskAlerts: boolean
  weeklySummaries: boolean
  alertEmailRecipients: string
}

interface BillingStats {
  pipelinesMonitored: number
  highResVerificationsUsed: number
  highResVerificationsLimit: number
  nextRenewalDate: string
}

// Mock data
const mockOrgSettings: OrganizationSettings = {
  rowBuffer: 50,
  riskThreshold: 7,
  dataRegion: 'AWS Asia Pacific'
}

const mockNotificationSettings: NotificationSettings = {
  highRiskAlerts: true,
  weeklySummaries: true,
  alertEmailRecipients: 'engineer@sentinel-ai.com, manager@pipeline.com'
}

const mockBillingStats: BillingStats = {
  pipelinesMonitored: 175,
  highResVerificationsUsed: 12,
  highResVerificationsLimit: 40,
  nextRenewalDate: '2025-03-15'
}

const mockMonthlyUsage = [
  { month: 'Jan', apiCalls: 2450, alerts: 45 },
  { month: 'Feb', apiCalls: 3120, alerts: 62 },
  { month: 'Mar', api_calls: 2890, alerts: 51 },
  { month: 'Apr', api_calls: 3560, alerts: 78 },
  { month: 'May', api_calls: 4200, alerts: 89 },
  { month: 'Jun', api_calls: 3980, alerts: 72 }
]

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Organization settings
  const [orgSettings, setOrgSettings] = useState<OrganizationSettings>(mockOrgSettings)
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(mockNotificationSettings)
  const [billingStats, setBillingStats] = useState<BillingStats>(mockBillingStats)

  useEffect(() => {
    // Simulate loading settings
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleSaveOrgSettings = async () => {
    setSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // In a real implementation, you would call your API:
      // await supabase
      //   .from('organizations')
      //   .update(orgSettings)
      //   .eq('id', organizationId)

      setOrgSettings(mockOrgSettings)
      toast.success('Organization settings saved successfully')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveNotificationSettings = async () => {
    setSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      setNotificationSettings(mockNotificationSettings)
      toast.success('Notification preferences saved successfully')
    } catch (error) {
      toast.error('Failed to save notification settings')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'organization', name: 'Organization', icon: SettingsIcon },
    { id: 'billing', name: 'Billing', icon: CreditCard },
    { id: 'notifications', name: 'Notifications', icon: Bell }
  ]

  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <Skeleton key={tab.id} className="h-10 w-24" />
            ))}
          </div>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i}>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">System Configuration</h1>
        <p className="text-slate-600 mt-2">Manage your organization settings, billing, and preferences</p>
      </div>

      {/* ShadCN Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.name}</span>
                <span className="sm:hidden">{tab.name.slice(0, 1)}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Manage your personal account settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="John" />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="Engineer" />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="engineer@sentinel-ai.com" />
              </div>

              <div>
                <Label htmlFor="role">Role</Label>
                <Input id="role" defaultValue="Pipeline Safety Engineer" readOnly />
              </div>

              <div className="pt-4">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Save Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organization Tab */}
        <TabsContent value="organization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Settings</CardTitle>
              <CardDescription>
                Set global defaults for new pipelines and risk assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="rowBuffer">Default ROW Buffer (meters)</Label>
                <Input
                  id="rowBuffer"
                  type="number"
                  value={orgSettings.rowBuffer}
                  onChange={(e) => setOrgSettings(prev => ({ ...prev, rowBuffer: parseInt(e.target.value) || 0 }))}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Default right-of-way buffer for new pipeline segments
                </p>
              </div>

              <div>
                <Label htmlFor="riskThreshold">Risk Threshold</Label>
                <div className="mt-2">
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      id="riskThreshold"
                      min="1"
                      max="10"
                      value={orgSettings.riskThreshold}
                      onChange={(e) => setOrgSettings(prev => ({ ...prev, riskThreshold: parseInt(e.target.value) }))}
                      className="flex-1"
                    />
                    <div className="w-12 text-center">
                      <Badge variant={orgSettings.riskThreshold >= 7 ? 'destructive' : 'default'}>
                        {orgSettings.riskThreshold}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Set "High Risk" threshold at PIRS above this value
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="dataRegion">Data Region</Label>
                <Input
                  id="dataRegion"
                  value={orgSettings.dataRegion}
                  readOnly
                  className="bg-slate-50"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Your data storage region (configured by Sentinel)
                </p>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleSaveOrgSettings}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {saving ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Defaults
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <div className="space-y-6">
            {/* Usage Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Usage Statistics</CardTitle>
                <CardDescription>
                  Your current usage and plan limits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {billingStats.pipelinesMonitored} km
                    </div>
                    <p className="text-sm text-slate-600">Pipelines Monitored</p>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {billingStats.highResVerificationsUsed} / {billingStats.highResVerificationsLimit}
                    </div>
                    <p className="text-sm text-slate-600">High-Res Verifications</p>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {new Date(billingStats.nextRenewalDate).toLocaleDateString()}
                    </div>
                    <p className="text-sm text-slate-600">Next Renewal Date</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usage Graph */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Activity</CardTitle>
                <CardDescription>
                  API calls and alerts processed per month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between space-x-2">
                  {mockMonthlyUsage.map((month, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-blue-100 rounded-t" style={{ height: `${(month.api_calls || month.apiCalls || 0) / 50}px` }}>
                        <div className="w-full bg-blue-600 rounded-t" style={{ height: `${(month.alerts / (month.api_calls || month.apiCalls || 1)) * 100}%` }}></div>
                      </div>
                      <div className="text-xs mt-2 text-slate-600">{month.month}</div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-600 rounded"></div>
                    <span className="text-sm text-slate-600">Alerts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-100 rounded"></div>
                    <span className="text-sm text-slate-600">API Calls</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Billing Info */}
            <Card>
              <CardHeader>
                <CardTitle>Plan & Billing</CardTitle>
                <CardDescription>
                  Current subscription and billing information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Professional Plan</h4>
                    <p className="text-sm text-slate-600">$499/month + usage-based billing</p>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Payment Method</h4>
                    <p className="text-sm text-slate-600">•••• 4242 (Visa)</p>
                  </div>
                  <Button variant="outline" size="sm">Update</Button>
                </div>
              </CardContent>
            </Card>
          </div>
    </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how and when you receive alerts and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Email Notifications</h4>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">High Risk Alerts</p>
                    <p className="text-sm text-slate-600">Receive immediate email for high-risk alerts (PIRS ≥ {orgSettings.riskThreshold})</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.highRiskAlerts}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, highRiskAlerts: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Weekly Summaries</p>
                    <p className="text-sm text-slate-600">Receive weekly summary of all pipeline activity</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.weeklySummaries}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, weeklySummaries: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Alert Email Recipients</h4>

                <div>
                  <Label htmlFor="emailRecipients">Email Addresses</Label>
                  <textarea
                    id="emailRecipients"
                    className="w-full p-2 border rounded-md min-h-[80px] resize-vertical"
                    placeholder="Enter email addresses separated by commas"
                    value={notificationSettings.alertEmailRecipients}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, alertEmailRecipients: e.target.value }))}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Additional email recipients that will receive alert notifications
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <p className="text-sm text-blue-800">
                  High-risk alerts are always sent immediately regardless of weekly summary settings.
                </p>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleSaveNotificationSettings}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {saving ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Preferences
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}