import { userRepository } from '@repositories/userRepository'
import { hash } from 'argon2'
import { getDatabase } from '@main/database'

export interface CreateUserDto {
  username: string
  password: string
  roleId: number
}

export interface UpdateUserDto {
  username?: string
  roleId?: number
}

export class UserService {
  async list() {
    return userRepository.findAll()
  }

  async getById(id: number) {
    const user = await userRepository.findById(id)
    if (!user) {
      throw new Error('User not found')
    }
    return user
  }

  async create(data: CreateUserDto, currentUserId: number) {
    if (!data.username || data.username.trim().length === 0) {
      throw new Error('Username is required')
    }

    if (!data.password || data.password.length < 6) {
      throw new Error('Password must be at least 6 characters')
    }

    // Verificar username único
    const existing = await userRepository.findByUsername(data.username)
    if (existing) {
      throw new Error('Username already exists')
    }

    const passwordHash = await hash(data.password)

    const user = await userRepository.create({
      username: data.username,
      passwordHash,
      role: { connect: { id: data.roleId } }
    })

    const db = getDatabase()
    await db.auditLog.create({
      data: {
        userId: currentUserId,
        action: 'CREATE',
        objectType: 'User',
        objectId: user.id,
        details: JSON.stringify({ username: user.username })
      }
    })

    return user
  }

  async update(id: number, data: UpdateUserDto, currentUserId: number) {
    await this.getById(id)

    if (data.username) {
      const existing = await userRepository.findByUsername(data.username)
      if (existing && existing.id !== id) {
        throw new Error('Username already exists')
      }
    }

    const updated = await userRepository.update(id, {
      ...(data.username && { username: data.username }),
      ...(data.roleId && { role: { connect: { id: data.roleId } } })
    })

    const db = getDatabase()
    await db.auditLog.create({
      data: {
        userId: currentUserId,
        action: 'UPDATE',
        objectType: 'User',
        objectId: id,
        details: JSON.stringify(data)
      }
    })

    return updated
  }

  async delete(id: number, currentUserId: number) {
    const user = await this.getById(id)

    // No permitir eliminar el propio usuario
    if (id === currentUserId) {
      throw new Error('Cannot delete your own user account')
    }

    await userRepository.delete(id)

    const db = getDatabase()
    await db.auditLog.create({
      data: {
        userId: currentUserId,
        action: 'DELETE',
        objectType: 'User',
        objectId: id,
        details: JSON.stringify({ username: user.username })
      }
    })
  }

  async changePassword(userId: number, newPassword: string, currentUserId: number) {
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters')
    }

    const passwordHash = await hash(newPassword)
    await userRepository.updatePassword(userId, passwordHash)

    const db = getDatabase()
    await db.auditLog.create({
      data: {
        userId: currentUserId,
        action: 'UPDATE',
        objectType: 'User',
        objectId: userId,
        details: JSON.stringify({ action: 'password_changed' })
      }
    })
  }
}

export const userService = new UserService()
