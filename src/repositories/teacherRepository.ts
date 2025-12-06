import { getDatabase } from '@main/database'
import { Teacher, Prisma } from '@prisma/client'

export interface TeacherFilter {
  search?: string
  hasUser?: boolean
}

export class TeacherRepository {
  async findAll(filter?: TeacherFilter) {
    const db = getDatabase()

    const where: Prisma.TeacherWhereInput = {}

    if (filter?.search) {
      where.OR = [
        { firstName: { contains: filter.search } },
        { lastName: { contains: filter.search } },
        { email: { contains: filter.search } }
      ]
    }

    if (filter?.hasUser !== undefined) {
      where.userId = filter.hasUser ? { not: null } : null
    }

    return db.teacher.findMany({
      where,
      include: {
        user: {
          include: {
            role: true
          }
        },
        courses: {
          include: {
            subject: true,
            _count: {
              select: { enrollments: true }
            }
          }
        }
      },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' }
      ]
    })
  }

  async findById(id: number) {
    const db = getDatabase()

    return db.teacher.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            role: true
          }
        },
        courses: {
          include: {
            subject: true,
            enrollments: {
              include: {
                student: true
              }
            }
          }
        }
      }
    })
  }

  async create(data: Prisma.TeacherCreateInput) {
    const db = getDatabase()
    return db.teacher.create({ data })
  }

  async update(id: number, data: Prisma.TeacherUpdateInput) {
    const db = getDatabase()
    return db.teacher.update({
      where: { id },
      data
    })
  }

  async delete(id: number) {
    const db = getDatabase()
    return db.teacher.delete({ where: { id } })
  }

  async findByUserId(userId: number) {
    const db = getDatabase()
    return db.teacher.findUnique({
      where: { userId },
      include: {
        courses: {
          include: {
            subject: true
          }
        }
      }
    })
  }
}

export const teacherRepository = new TeacherRepository()
