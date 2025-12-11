import { Navigate } from 'react-router-dom'
import { useSupabase } from '../hooks/useSupabase'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'engineer' | 'field_tech' | 'user'
}

interface UserWithRole {
  id: string
  role?: string
  user_metadata?: any
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useSupabase()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-slate-900"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Check if user has required role
  if (requiredRole) {
    const userWithRole = user as UserWithRole
    const userRole = userWithRole.role || 'user'

    // Define role hierarchy
    const roleHierarchy = {
      'user': 0,
      'field_tech': 1,
      'engineer': 2,
      'admin': 3
    }

    const requiredLevel = roleHierarchy[requiredRole]
    const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0

    if (userLevel < requiredLevel) {
      return <Navigate to="/dashboard" replace />
    }
  }

  return <>{children}</>
}