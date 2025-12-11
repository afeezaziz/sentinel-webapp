import { useState, useEffect } from 'react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { auditService } from '../services/auditService'

interface User extends SupabaseUser {
  role?: string
  organization_id?: string
}

export function useSupabase() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUserRole = async (authUser: SupabaseUser | null) => {
    if (!authUser) return authUser

    try {
      // Create a timeout promise to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Role fetch timeout')), 5000)
      })

      // Fetch user details from our users table with timeout
      const fetchPromise = supabase
        .from('users')
        .select('role, organization_id')
        .eq('id', authUser.id)
        .single()

      const { data: userData, error } = await Promise.race([fetchPromise, timeoutPromise]) as any

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.warn('Error fetching user role:', error)
        return authUser
      }

      // Return augmented user object with role
      return {
        ...authUser,
        role: userData?.role || 'user',
        organization_id: userData?.organization_id
      }
    } catch (error) {
      console.warn('Error fetching user role:', error)
      return authUser
    }
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const userWithRole = session?.user ? await fetchUserRole(session.user) : null
      setUser(userWithRole)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const userWithRole = session?.user ? await fetchUserRole(session.user) : null
        setUser(userWithRole)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const logout = async () => {
    // Log user logout before signing out
    if (user) {
      try {
        await auditService.logUserLogout()
      } catch (error) {
        console.warn('Failed to log logout event:', error)
      }
    }
    await supabase.auth.signOut()
  }

  return { user, loading, logout }
}