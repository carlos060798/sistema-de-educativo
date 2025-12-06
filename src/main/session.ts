import { SessionData } from '@types/index'

class SessionManager {
  private session: SessionData | null = null
  private sessionTimeout: NodeJS.Timeout | null = null
  private readonly timeoutMinutes: number

  constructor() {
    this.timeoutMinutes = parseInt(process.env.SESSION_TIMEOUT_MINUTES || '30', 10)
  }

  createSession(data: SessionData): void {
    this.session = data
    this.resetTimeout()
  }

  getSession(): SessionData | null {
    return this.session
  }

  clearSession(): void {
    this.session = null
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout)
      this.sessionTimeout = null
    }
  }

  isAuthenticated(): boolean {
    return this.session !== null
  }

  hasRole(role: string): boolean {
    return this.session?.role === role
  }

  hasAnyRole(roles: string[]): boolean {
    return this.session ? roles.includes(this.session.role) : false
  }

  canAccessTeacherData(teacherId: number): boolean {
    if (!this.session) return false
    if (this.session.role === 'admin') return true
    if (this.session.role === 'teacher' && this.session.teacherId === teacherId) return true
    return false
  }

  private resetTimeout(): void {
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout)
    }

    this.sessionTimeout = setTimeout(() => {
      console.log('Session expired due to inactivity')
      this.clearSession()
    }, this.timeoutMinutes * 60 * 1000)
  }

  refreshSession(): void {
    if (this.session) {
      this.resetTimeout()
    }
  }
}

export const sessionManager = new SessionManager()

export function requireAuth(): SessionData {
  const session = sessionManager.getSession()
  if (!session) {
    throw new Error('Not authenticated')
  }
  sessionManager.refreshSession()
  return session
}

export function requireRole(role: string | string[]): SessionData {
  const session = requireAuth()
  const roles = Array.isArray(role) ? role : [role]

  if (!sessionManager.hasAnyRole(roles)) {
    throw new Error('Insufficient permissions')
  }

  return session
}

export function requireTeacherAccess(teacherId: number): SessionData {
  const session = requireAuth()

  if (!sessionManager.canAccessTeacherData(teacherId)) {
    throw new Error('Cannot access other teacher data')
  }

  return session
}
