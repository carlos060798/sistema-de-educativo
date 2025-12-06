import { getDatabase } from '@main/database'
import { Grade, Prisma } from '@prisma/client'

export interface GradeFilter {
  enrollmentId?: number
  period?: string
  gradeType?: string
}

export class GradeRepository {
  async findAll(filter?: GradeFilter) {
    const db = getDatabase()

    const where: Prisma.GradeWhereInput = {}

    if (filter?.enrollmentId) {
      where.enrollmentId = filter.enrollmentId
    }

    if (filter?.period) {
      where.period = filter.period
    }

    if (filter?.gradeType) {
      where.gradeType = filter.gradeType
    }

    return db.grade.findMany({
      where,
      include: {
        enrollment: {
          include: {
            student: true,
            course: {
              include: {
                subject: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  async findById(id: number) {
    const db = getDatabase()
    return db.grade.findUnique({
      where: { id },
      include: {
        enrollment: {
          include: {
            student: true,
            course: {
              include: {
                subject: true,
                teacher: true
              }
            }
          }
        }
      }
    })
  }

  async create(data: Prisma.GradeCreateInput) {
    const db = getDatabase()
    return db.grade.create({
      data,
      include: {
        enrollment: {
          include: {
            student: true,
            course: {
              include: {
                subject: true
              }
            }
          }
        }
      }
    })
  }

  async update(id: number, data: Prisma.GradeUpdateInput) {
    const db = getDatabase()
    return db.grade.update({
      where: { id },
      data,
      include: {
        enrollment: {
          include: {
            student: true,
            course: {
              include: {
                subject: true
              }
            }
          }
        }
      }
    })
  }

  async delete(id: number) {
    const db = getDatabase()
    return db.grade.delete({ where: { id } })
  }

  async getByEnrollment(enrollmentId: number) {
    const db = getDatabase()
    return db.grade.findMany({
      where: { enrollmentId },
      orderBy: {
        createdAt: 'asc'
      }
    })
  }

  async calculateAverage(enrollmentId: number) {
    const grades = await this.getByEnrollment(enrollmentId)

    if (grades.length === 0) {
      return {
        average: 0,
        weightedAverage: 0,
        totalGrades: 0
      }
    }

    // Promedio simple
    const sum = grades.reduce((acc, grade) => acc + grade.score, 0)
    const average = sum / grades.length

    // Promedio ponderado
    const totalWeight = grades.reduce((acc, grade) => acc + grade.weight, 0)
    const weightedSum = grades.reduce((acc, grade) => {
      return acc + (grade.score * grade.weight)
    }, 0)
    const weightedAverage = totalWeight > 0 ? weightedSum / totalWeight : 0

    return {
      average: Math.round(average * 100) / 100,
      weightedAverage: Math.round(weightedAverage * 100) / 100,
      totalGrades: grades.length
    }
  }
}

export const gradeRepository = new GradeRepository()
