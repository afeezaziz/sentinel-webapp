import { supabase } from '../lib/supabase'

export interface AuditLogEntry {
  action: string
  category: 'user_management' | 'data_access' | 'system' | 'api' | 'security' | 'cron_job'
  details: string
  status: 'success' | 'warning' | 'error' | 'info'
  metadata?: {
    affectedEntity?: string
    entityType?: string
    oldValue?: string
    newValue?: string
    duration?: number
    responseCode?: number
  }
  severity: 'low' | 'medium' | 'high' | 'critical'
  user?: {
    id: string
    name: string
    email: string
    organization: string
  }
}

class AuditService {
  private supabase = supabase

  async log(entry: Omit<AuditLogEntry, 'timestamp' | 'ipAddress' | 'userAgent'>) {
    try {
      // Get current user information
      const { data: { user } } = await this.supabase.auth.getUser()

      // Get IP address (this would normally come from the request context)
      const ipAddress = await this.getClientIP()

      // Get user agent
      const userAgent = navigator.userAgent

      // Construct the full audit entry
      const auditEntry: AuditLogEntry & {
        timestamp: string
        ipAddress: string
        userAgent?: string
      } = {
        ...entry,
        timestamp: new Date().toISOString(),
        ipAddress,
        userAgent,
        user: user ? {
          id: user.id,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown',
          email: user.email || 'unknown@example.com',
          organization: user.user_metadata?.organization || 'Unknown Organization'
        } : undefined
      }

      // In a real implementation, this would be sent to a backend API
      // For now, we'll store it in localStorage for demonstration
      this.storeAuditEntry(auditEntry)

      // Also send to console for development debugging
      console.log('Audit Log:', auditEntry)

      return auditEntry
    } catch (error) {
      console.error('Failed to log audit entry:', error)
      throw error
    }
  }

  private async getClientIP(): Promise<string> {
    // Return placeholder IP to prevent network calls that could hang
    return '127.0.0.1'
  }

  private storeAuditEntry(entry: any) {
    // Store in localStorage for demonstration
    const existingLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]')
    existingLogs.unshift(entry)

    // Keep only the last 1000 entries in localStorage
    if (existingLogs.length > 1000) {
      existingLogs.splice(1000)
    }

    localStorage.setItem('auditLogs', JSON.stringify(existingLogs))
  }

  async getLogs(filters?: {
    category?: string
    status?: string
    severity?: string
    dateRange?: {
      start: string
      end: string
    }
    userId?: string
  }) {
    try {
      // In a real implementation, this would fetch from the backend API
      // For now, we'll return from localStorage
      const logs = JSON.parse(localStorage.getItem('auditLogs') || '[]')

      let filteredLogs = logs

      if (filters) {
        if (filters.category) {
          filteredLogs = filteredLogs.filter((log: any) => log.category === filters.category)
        }
        if (filters.status) {
          filteredLogs = filteredLogs.filter((log: any) => log.status === filters.status)
        }
        if (filters.severity) {
          filteredLogs = filteredLogs.filter((log: any) => log.severity === filters.severity)
        }
        if (filters.userId) {
          filteredLogs = filteredLogs.filter((log: any) => log.user?.id === filters.userId)
        }
        if (filters.dateRange) {
          filteredLogs = filteredLogs.filter((log: any) => {
            const logDate = new Date(log.timestamp)
            const startDate = new Date(filters.dateRange!.start)
            const endDate = new Date(filters.dateRange!.end)
            return logDate >= startDate && logDate <= endDate
          })
        }
      }

      return {
        data: filteredLogs,
        total: filteredLogs.length
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error)
      throw error
    }
  }

  // Convenience methods for common audit events
  async logUserLogin(success: boolean, email?: string, error?: string) {
    return this.log({
      action: success ? 'User Login' : 'Failed Login Attempt',
      category: 'user_management',
      details: success
        ? `Successful login for ${email}`
        : `Failed login attempt: ${error || 'Invalid credentials'}`,
      status: success ? 'success' : 'error',
      severity: success ? 'low' : 'high'
    })
  }

  async logUserLogout() {
    return this.log({
      action: 'User Logout',
      category: 'user_management',
      details: 'User logged out',
      status: 'success',
      severity: 'low'
    })
  }

  async logDataAccess(entity: string, action: string, entityId?: string) {
    return this.log({
      action: `${entity} ${action}`,
      category: 'data_access',
      details: `${action} ${entity.toLowerCase()}${entityId ? ` ${entityId}` : ''}`,
      status: 'success',
      severity: 'medium',
      metadata: {
        affectedEntity: entityId || entity,
        entityType: entity.toLowerCase()
      }
    })
  }

  async logPermissionChange(targetUser: string, permissions: string[]) {
    return this.log({
      action: 'User Permissions Modified',
      category: 'user_management',
      details: `Modified permissions for user ${targetUser}`,
      status: 'success',
      severity: 'high',
      metadata: {
        affectedEntity: targetUser,
        entityType: 'user',
        newValue: permissions.join(', ')
      }
    })
  }

  async logSystemEvent(event: string, details: string, status: 'success' | 'error' = 'success', severity: 'low' | 'medium' | 'high' | 'critical' = 'low') {
    return this.log({
      action: event,
      category: 'system',
      details,
      status,
      severity
    })
  }

  async logSecurityEvent(event: string, details: string, severity: 'high' | 'critical' = 'high') {
    return this.log({
      action: event,
      category: 'security',
      details,
      status: severity === 'critical' ? 'error' : 'warning',
      severity
    })
  }

  async logAPIEvent(endpoint: string, method: string, status: number, duration?: number) {
    const isSuccess = status >= 200 && status < 300

    return this.log({
      action: `API ${method} ${endpoint}`,
      category: 'api',
      details: `${method} request to ${endpoint} - ${status}`,
      status: isSuccess ? 'success' : (status >= 400 && status < 500 ? 'warning' : 'error'),
      severity: status >= 500 ? 'high' : 'low',
      metadata: {
        responseCode: status,
        duration
      }
    })
  }

  async logCronJob(jobName: string, details: string, duration?: number, status: 'success' | 'error' = 'success') {
    return this.log({
      action: `Cron Job: ${jobName}`,
      category: 'cron_job',
      details,
      status,
      severity: status === 'success' ? 'low' : 'medium',
      metadata: {
        duration,
        affectedEntity: jobName,
        entityType: 'cron_job'
      }
    })
  }
}

// Create singleton instance
export const auditService = new AuditService()

// Export convenience hooks
export const useAudit = () => {
  return {
    log: auditService.log.bind(auditService),
    logUserLogin: auditService.logUserLogin.bind(auditService),
    logUserLogout: auditService.logUserLogout.bind(auditService),
    logDataAccess: auditService.logDataAccess.bind(auditService),
    logPermissionChange: auditService.logPermissionChange.bind(auditService),
    logSystemEvent: auditService.logSystemEvent.bind(auditService),
    logSecurityEvent: auditService.logSecurityEvent.bind(auditService),
    logAPIEvent: auditService.logAPIEvent.bind(auditService),
    logCronJob: auditService.logCronJob.bind(auditService)
  }
}

export default auditService