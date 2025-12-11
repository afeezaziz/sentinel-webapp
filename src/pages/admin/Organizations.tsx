import { useState, useEffect } from 'react'
import { Search, Plus, Building2, Users, Calendar, MoreHorizontal } from 'lucide-react'
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
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

interface Organization {
  id: string
  name: string
  subscription_tier: 'tier1' | 'tier2' | 'tier3'
  created_at: string
  // Computed fields from joins
  asset_count?: number
  user_count?: number
  last_active?: string
}

export default function Organizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchOrganizations()
  }, [])

  const fetchOrganizations = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('Fetching organizations...')

      // Use regular client with admin-friendly RLS
      const { data: orgs, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('Organizations response:', { orgs, error })

      if (error) {
        console.error('Supabase error:', error)
        setError(error.message)
        return
      }

      if (!orgs || orgs.length === 0) {
        console.log('No organizations found')
        setOrganizations([])
        return
      }

      // Transform the data to match our interface
      const transformedOrgs: Organization[] = orgs.map((org: any) => ({
        id: org.id,
        name: org.name,
        subscription_tier: org.subscription_tier,
        created_at: org.created_at,
        asset_count: 0, // We'll update these later
        user_count: 0,
        last_active: new Date().toISOString()
      }))

      console.log('Transformed organizations:', transformedOrgs)
      setOrganizations(transformedOrgs)

      // Try to get counts (this might fail due to RLS, so we make it optional)
      try {
        for (let i = 0; i < transformedOrgs.length; i++) {
          const org = transformedOrgs[i]

          try {
            // Get asset count
            const { count: assetCount } = await supabase
              .from('assets')
              .select('*', { count: 'exact', head: true })
              .eq('organization_id', org.id)

            transformedOrgs[i].asset_count = assetCount || 0
          } catch (assetError) {
            console.warn(`Error getting asset count for org ${org.id}:`, assetError)
          }

          try {
            // Get user count
            const { count: userCount } = await supabase
              .from('users')
              .select('*', { count: 'exact', head: true })
              .eq('organization_id', org.id)

            transformedOrgs[i].user_count = userCount || 0
          } catch (userError) {
            console.warn(`Error getting user count for org ${org.id}:`, userError)
          }
        }

        setOrganizations([...transformedOrgs])
      } catch (countError) {
        console.warn('Error getting counts (continuing without counts):', countError)
      }

    } catch (error) {
      console.error('Error fetching organizations:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const filteredOrgs = organizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'tier1':
        return 'bg-green-100 text-green-800'
      case 'tier2':
        return 'bg-blue-100 text-blue-800'
      case 'tier3':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Organizations</h1>
          <p className="text-slate-600 mt-1">Manage all organizations and their subscriptions</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Organization
        </Button>
      </div>

          {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading organizations</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <div className="-mx-2 -my-1.5 flex">
                  <button
                    type="button"
                    onClick={fetchOrganizations}
                    className="bg-red-50 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search organizations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Organizations Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Assets</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrgs.map((org) => (
                <TableRow
                  key={org.id}
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => navigate(`/admin/organizations/${org.id}`)}
                >
                  <TableCell>
                    <div className="font-medium text-slate-900">{org.name}</div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTierColor(org.subscription_tier)}>
                      {org.subscription_tier?.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-slate-600">
                      <Building2 className="w-4 h-4 mr-1" />
                      {org.asset_count || 0}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-slate-600">
                      <Users className="w-4 h-4 mr-1" />
                      {org.user_count || 0}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-slate-600">{formatDate(org.created_at)}</div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/admin/organizations/${org.id}`)
                        }}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>Manage Subscription</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Delete Organization</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Empty State */}
      {filteredOrgs.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No organizations found</h3>
          <p className="text-slate-600">Try adjusting your search terms</p>
        </div>
      )}
    </div>
  )
}