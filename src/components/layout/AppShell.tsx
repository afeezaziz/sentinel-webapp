import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Activity,
  FileText,
  Settings,
  Menu,
  ChevronRight,
  User,
  LogOut,
  HelpCircle,
  AlertTriangle,
  Building2
} from 'lucide-react'
import { useSupabase } from '../../hooks/useSupabase'
import { Sheet, SheetContent } from '../ui/sheet'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<any>
  isHeader?: boolean
}

interface AppShellProps {
  children: React.ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useSupabase()
  const location = useLocation()
  const navigate = useNavigate()

  // Get user role from user object (now fetched from database)
  const userRole = user?.role || 'user'

  // Navigation for admin users (showing admin-specific pages)
  const adminNavigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Risk Management', href: '/admin/risks', icon: AlertTriangle },
    { name: 'Assets', href: '/admin/assets', icon: Activity },
    { name: 'Analytics', href: '/admin/analytics', icon: FileText },
    { name: 'Admin', href: '/admin', icon: Settings, isHeader: true },
    { name: 'Organizations', href: '/admin/organizations', icon: Building2 },
    { name: 'Users', href: '/admin/users', icon: User },
    { name: 'Audit Log', href: '/admin/audit-log', icon: Activity },
  ]

  // Navigation for regular users
  const userNavigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Risk Management', href: '/risks', icon: AlertTriangle },
    { name: 'Assets', href: '/assets', icon: Activity },
    { name: 'Analytics', href: '/analytics', icon: FileText },
  ]

  // Choose navigation based on user role
  const navigation: NavigationItem[] = userRole === 'admin' ? adminNavigation : userNavigation

  const getBreadcrumbPath = () => {
    const path = location.pathname.substring(1) // Remove leading slash
    return path.charAt(0).toUpperCase() + path.slice(1)
  }

  return (
    <div className="h-screen flex bg-slate-50">
      {/* ShadCN Sheet Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-white border-r border-slate-200 shadow-lg">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200 bg-white">
            <h1 className="text-xl font-bold text-slate-900">Sentinel</h1>
            {/* X button is provided by SheetContent by default, so no need for custom close button */}
          </div>

          {/* Navigation */}
          <nav className="px-3 py-6">
            <div className="space-y-1">
              {navigation.map((item, index) => {
                // Check if it's a header item
                if (item.isHeader) {
                  return (
                    <div key={index} className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {item.name}
                    </div>
                  )
                }

                const isActive = location.pathname === item.href
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors w-full
                      ${isActive
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }
                    `}
                  >
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.name}
                    {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                  </NavLink>
                )
              })}
            </div>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-slate-200">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
            <div className="flex items-center">
              {/* Sidebar toggle button inside Sheet context */}
              <div className="mr-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                  className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>

              {/* Breadcrumb */}
              <div className="flex items-center text-sm text-slate-500">
                <span>Sentinel</span>
                <ChevronRight className="mx-1 h-4 w-4" />
                <span className="font-medium text-slate-900">{getBreadcrumbPath()}</span>
              </div>
            </div>

            {/* User menu dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full border-2 border-slate-200 hover:border-slate-300 transition-colors p-0"
                >
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                    <User className="h-5 w-5 text-white" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.email}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      Pipeline Safety Engineer
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/help')}>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Help</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await logout()
                    navigate('/login')
                  }}
                  className="text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}