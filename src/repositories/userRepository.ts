import { getDatabase } from '@main/database'
import { User, Prisma } from '@prisma/client'

export class UserRepository {
  async findAll() {
    const db = getDatabase()
    return db.user.findMany({
      include: {
        role: true,
        teacher: true
      },
      orderBy: {
        username: 'asc'
      }
    })
  }

  async findById(id: number) {
    const db = getDatabase()
    return db.user.findUnique({
      where: { id },
      include: {
        role: true,
        teacher: true
      }
    })
  }

  async findByUsername(username: string) {
    const db = getDatabase()
    return db.user.findUnique({
      where: { username },
      include: {
        role: true,
        teacher: true
      }
    })
  }

  async create(data: Prisma.UserCreateInput) {
    const db = getDatabase()
    return db.user.create({
      data,
      include: {
        role: true
      }
    })
  }

  async update(id: number, data: Prisma.UserUpdateInput) {
    const db = getDatabase()
    return db.user.update({
      where: { id },
      data,
      include: {
        role: true,
        teacher: true
      }
    })
  }

  async delete(id: number) {
    const db = getDatabase()
    return db.user.delete({ where: { id } })
  }

  async updatePassword(id: number, passwordHash: string) {
    const db = getDatabase()
    return db.user.update({
      where: { id },
      data: { passwordHash }
    })
  }
}

export const userRepository = new UserRepository()
