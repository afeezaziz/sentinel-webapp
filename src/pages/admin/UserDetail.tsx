import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Mail, Phone, Edit, Activity, Calendar, Building, CheckCircle, XCircle, AlertTriangle, Key, FileText, Eye, EyeOff } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { supabase } from '../../lib/supabase'

interface User {
  id: string
  full_name: string
  email: string
  role: 'admin' | 'engineer' | 'field_tech'
  organization_id?: string
  created_at: string
  // Joined organization data
  organization?: {
    id: string
    name: string
    subscription_tier?: string
  }
  // Additional metadata fields
  phone?: string
  bio?: string
  location?: string
  department?: string
  emergency_contact?: {
    name: string
    phone: string
    relationship: string
  }
}

interface Activity {
  id: string
  action: string
  details: string
  timestamp: string
  ip: string
  status: 'success' | 'warning' | 'error'
  userAgent?: string
}

export default function UserDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (id) {
      fetchUserDetails(id)
      fetchUserActivities(id)
    }
  }, [id])

  const fetchUserDetails = async (userId: string) => {
    try {
      setLoading(true)
      setError(null)

      console.log('Fetching user details for:', userId)

      // Fetch user with organization details
      const { data: userData, error } = await supabase
        .from('users')
        .select(`
          *,
          organizations (
            id,
            name,
            subscription_tier
          )
        `)
        .eq('id', userId)
        .single()

      console.log('User data response:', { userData, error })

      if (error) {
        console.error('Error fetching user:', error)
        setError(error.message)
        return
      }

      if (!userData) {
        setError('User not found')
        return
      }

      // Transform to match our interface
      const transformedUser: User = {
        id: userData.id,
        full_name: userData.full_name || 'Unknown User',
        email: userData.email || 'No email',
        role: userData.role || 'user',
        organization_id: userData.organization_id,
        created_at: userData.created_at,
        organization: userData.organizations,
        phone: userData.phone || userData.user_metadata?.phone,
        bio: userData.user_metadata?.bio,
        location: userData.user_metadata?.location,
        department: userData.user_metadata?.department,
        emergency_contact: userData.user_metadata?.emergency_contact
      }

      console.log('Transformed user:', transformedUser)
      setUser(transformedUser)

    } catch (error) {
      console.error('Error fetching user details:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const fetchUserActivities = async (userId: string) => {
    try {
      // For now, load activities from localStorage (audit logs)
      // In a real implementation, you'd fetch from a dedicated activities table
      const storedLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]')

      const userActivities: Activity[] = storedLogs
        .filter((log: any) => log.user?.id === userId || log.action.toLowerCase().includes(userId))
        .slice(0, 10) // Get last 10 activities
        .map((log: any) => ({
          id: log.id,
          action: log.action,
          details: log.details,
          timestamp: log.timestamp,
          ip: log.ipAddress,
          userAgent: log.userAgent,
          status: log.status
        }))

      // If no activities found, add some sample ones
      if (userActivities.length === 0) {
        const sampleActivities: Activity[] = [
          {
            id: '1',
            action: 'User Profile Created',
            details: 'User account was created',
            timestamp: new Date().toISOString(),
            ip: '127.0.0.1',
            status: 'success'
          }
        ]
        setActivities(sampleActivities)
      } else {
        setActivities(userActivities)
      }

    } catch (error) {
      console.error('Error fetching user activities:', error)
      setActivities([])
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'internal':
        return 'bg-blue-100 text-blue-800'
      case 'user':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Error Loading User</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <User className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">User Not Found</h2>
          <p className="text-slate-600 mb-4">The requested user could not be found.</p>
          <Button onClick={() => navigate('/admin/users')}>
            Back to Users
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
            onClick={() => navigate('/admin/users')}
            className="text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Users
          </Button>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{user.full_name}</h1>
              <div className="flex items-center space-x-3 mt-1">
                <Badge className={getRoleColor(user.role)}>
                  {user.role?.replace('_', ' ').toUpperCase() || 'USER'}
                </Badge>
                {user.organization && (
                  <Badge className="bg-blue-100 text-blue-800">
                    {user.organization.name}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Key className="w-4 h-4 mr-2" />
            Reset Password
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Edit className="w-4 h-4 mr-2" />
            Edit User
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Organization</p>
                <p className="text-lg font-bold text-slate-900 mt-1">{user.organization?.name || 'No Organization'}</p>
              </div>
              <Building className="w-8 h-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Department</p>
                <p className="text-lg font-bold text-slate-900 mt-1">{user.department || 'N/A'}</p>
              </div>
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Email</p>
                <p className="text-sm font-bold text-slate-900 mt-1">{user.email}</p>
              </div>
              <Calendar className="w-8 h-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Member Since</p>
                <p className="text-sm font-bold text-slate-900 mt-1">{formatDate(user.created_at)}</p>
              </div>
              <Activity className="w-8 h-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{user.email}</p>
                    <p className="text-sm text-slate-600">Email Address</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{user.phone || 'Not provided'}</p>
                    <p className="text-sm text-slate-600">Phone Number</p>
                  </div>
                </div>
                {user.location && (
                  <div className="flex items-center space-x-3">
                    <Building className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{user.location}</p>
                      <p className="text-sm text-slate-600">Location</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <p className="text-sm font-medium text-slate-900">{user.emergency_contact?.name || 'Not provided'}</p>
                </div>
                <div>
                  <Label>Relationship</Label>
                  <p className="text-sm font-medium text-slate-900">{user.emergency_contact?.relationship || 'Not provided'}</p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <p className="text-sm font-medium text-slate-900">{user.emergency_contact?.phone || 'Not provided'}</p>
                </div>
              </CardContent>
            </Card>

            {user.bio && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Bio</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700">{user.bio}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Role & Access</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">Current Role</p>
                    <p className="text-sm text-slate-600">
                      {user.role === 'admin' && 'Full administrative access to all organizations and users'}
                      {user.role === 'engineer' && 'Engineer access within assigned organization'}
                      {user.role === 'field_tech' && 'Field technician access for assigned tasks'}
                      {!user.role && 'Standard user access'}
                    </p>
                  </div>
                  <Badge className={getRoleColor(user.role)}>
                    {user.role?.replace('_', ' ').toUpperCase() || 'USER'}
                  </Badge>
                </div>

                {user.organization && (
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">Organization Access</p>
                      <p className="text-sm text-slate-600">
                        Access to data within {user.organization.name}
                      </p>
                    </div>
                    <div className={`w-3 h-3 rounded-full bg-green-500`}></div>
                  </div>
                )}

                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">Risk Management</p>
                    <p className="text-sm text-slate-600">
                      Can create and manage risk assessments
                    </p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${user.role !== 'field_tech' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                </div>

                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">Asset Management</p>
                    <p className="text-sm text-slate-600">
                      Can manage pipeline assets and infrastructure
                    </p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${user.role === 'admin' || user.role === 'engineer' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                </div>

                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">Analytics Access</p>
                    <p className="text-sm text-slate-600">
                      Can access analytics and reporting features
                    </p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${user.role === 'admin' || user.role === 'engineer' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Password Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Key className="w-4 h-4 mr-2" />
                  Update Password
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">Two-Factor Authentication</p>
                    <p className="text-sm text-slate-600">Add an extra layer of security</p>
                  </div>
                  <Badge className="bg-gray-100 text-gray-800">
                    Disabled
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">Session Timeout</p>
                    <p className="text-sm text-slate-600">Auto-logout after inactivity</p>
                  </div>
                  <span className="text-sm text-slate-600">30 minutes</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">Email Notifications</p>
                    <p className="text-sm text-slate-600">Receive updates via email</p>
                  </div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">SMS Notifications</p>
                    <p className="text-sm text-slate-600">Receive alerts via SMS</p>
                  </div>
                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Regional Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">Language</span>
                  <span className="text-sm text-slate-600">EN</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">Timezone</span>
                  <span className="text-sm text-slate-600">UTC</span>
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
                  <div key={activity.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getActivityIcon(activity.status)}
                        <div>
                          <p className="font-medium text-slate-900">{activity.action}</p>
                          <p className="text-sm text-slate-600 mt-1">{activity.details}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-xs text-slate-500">IP: {activity.ip}</span>
                            {activity.userAgent && (
                              <span className="text-xs text-slate-500">{activity.userAgent}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-slate-600 whitespace-nowrap ml-4">
                        {activity.timestamp}
                      </div>
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