import { getDatabase } from '@main/database'
import { Course, Prisma } from '@prisma/client'

export interface CourseFilter {
  search?: string
  subjectId?: number
  teacherId?: number
  period?: string
}

export class CourseRepository {
  async findAll(filter?: CourseFilter) {
    const db = getDatabase()

    const where: Prisma.CourseWhereInput = {}

    if (filter?.search) {
      where.OR = [
        { name: { contains: filter.search } },
        { period: { contains: filter.search } },
        { subject: { name: { contains: filter.search } } },
        { teacher: {
          OR: [
            { firstName: { contains: filter.search } },
            { lastName: { contains: filter.search } }
          ]
        }}
      ]
    }

    if (filter?.subjectId) {
      where.subjectId = filter.subjectId
    }

    if (filter?.teacherId) {
      where.teacherId = filter.teacherId
    }

    if (filter?.period) {
      where.period = filter.period
    }

    return db.course.findMany({
      where,
      include: {
        subject: true,
        teacher: true,
        _count: {
          select: { enrollments: true }
        }
      },
      orderBy: [
        { period: 'desc' },
        { subject: { name: 'asc' } }
      ]
    })
  }

  async findById(id: number) {
    const db = getDatabase()

    return db.course.findUnique({
      where: { id },
      include: {
        subject: true,
        teacher: true,
        enrollments: {
          include: {
            student: true,
            grades: true
          }
        }
      }
    })
  }

  async create(data: Prisma.CourseCreateInput) {
    const db = getDatabase()
    return db.course.create({
      data,
      include: {
        subject: true,
        teacher: true
      }
    })
  }

  async update(id: number, data: Prisma.CourseUpdateInput) {
    const db = getDatabase()
    return db.course.update({
      where: { id },
      data,
      include: {
        subject: true,
        teacher: true
      }
    })
  }

  async delete(id: number) {
    const db = getDatabase()
    return db.course.delete({ where: { id } })
  }

  async getEnrollments(courseId: number) {
    const db = getDatabase()

    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        enrollments: {
          include: {
            student: true,
            grades: true
          },
          orderBy: {
            student: {
              lastName: 'asc'
            }
          }
        }
      }
    })

    return course?.enrollments || []
  }
}

export const courseRepository = new CourseRepository()
