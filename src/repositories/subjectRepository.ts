import { getDatabase } from '@main/database'
import { Subject, Prisma } from '@prisma/client'

export interface SubjectFilter {
  search?: string
}

export class SubjectRepository {
  async findAll(filter?: SubjectFilter) {
    const db = getDatabase()

    const where: Prisma.SubjectWhereInput = {}

    if (filter?.search) {
      where.OR = [
        { name: { contains: filter.search } },
        { code: { contains: filter.search } },
        { description: { contains: filter.search } }
      ]
    }

    return db.subject.findMany({
      where,
      include: {
        courses: {
          include: {
            teacher: true,
            _count: {
              select: { enrollments: true }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })
  }

  async findById(id: number) {
    const db = getDatabase()

    return db.subject.findUnique({
      where: { id },
      include: {
        courses: {
          include: {
            teacher: true,
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

  async findByCode(code: string) {
    const db = getDatabase()
    return db.subject.findUnique({
      where: { code }
    })
  }

  async create(data: Prisma.SubjectCreateInput) {
    const db = getDatabase()
    return db.subject.create({ data })
  }

  async update(id: number, data: Prisma.SubjectUpdateInput) {
    const db = getDatabase()
    return db.subject.update({
      where: { id },
      data
    })
  }

  async delete(id: number) {
    const db = getDatabase()
    return db.subject.delete({ where: { id } })
  }
}

export const subjectRepository = new SubjectRepository()
