import { hash, verify } from 'argon2'
import { getDatabase } from '@main/database'
import { sessionManager } from '@main/session'
import { SessionData } from '@types/index'

export class AuthService {
  async login(username: string, password: string): Promise<SessionData> {
    const db = getDatabase()

    const user = await db.user.findUnique({
      where: { username },
      include: {
        role: true,
        teacher: true
      }
    })

    if (!user) {
      throw new Error('Invalid credentials')
    }

    const isValid = await verify(user.passwordHash, password)

    if (!isValid) {
      throw new Error('Invalid credentials')
    }

    const sessionData: SessionData = {
      userId: user.id,
      username: user.username,
      role: user.role.name,
      teacherId: user.teacher?.id
    }

    sessionManager.createSession(sessionData)

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        objectType: 'User',
        objectId: user.id
      }
    })

    return sessionData
  }

  async logout(): Promise<void> {
    const session = sessionManager.getSession()

    if (session) {
      const db = getDatabase()
      await db.auditLog.create({
        data: {
          userId: session.userId,
          action: 'LOGOUT',
          objectType: 'User',
          objectId: session.userId
        }
      })
    }

    sessionManager.clearSession()
  }

  getCurrentUser(): SessionData | null {
    return sessionManager.getSession()
  }

  async hashPassword(password: string): Promise<string> {
    return hash(password)
  }

  async verifyPassword(hash: string, password: string): Promise<boolean> {
    return verify(hash, password)
  }
}

export const authService = new AuthService()
