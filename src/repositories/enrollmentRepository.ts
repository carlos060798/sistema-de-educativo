import { getDatabase } from '@main/database'
import { Enrollment, Prisma } from '@prisma/client'

export class EnrollmentRepository {
  async create(data: Prisma.EnrollmentCreateInput) {
    const db = getDatabase()
    return db.enrollment.create({
      data,
      include: {
        student: true,
        course: {
          include: {
            subject: true,
            teacher: true
          }
        }
      }
    })
  }

  async delete(id: number) {
    const db = getDatabase()
    return db.enrollment.delete({ where: { id } })
  }

  async getByStudent(studentId: number) {
    const db = getDatabase()
    return db.enrollment.findMany({
      where: { studentId },
      include: {
        course: {
          include: {
            subject: true,
            teacher: true
          }
        },
        grades: true
      },
      orderBy: {
        enrolledAt: 'desc'
      }
    })
  }

  async getByCourse(courseId: number) {
    const db = getDatabase()
    return db.enrollment.findMany({
      where: { courseId },
      include: {
        student: true,
        grades: true
      }
    })
  }

  async findById(id: number) {
    const db = getDatabase()
    return db.enrollment.findUnique({
      where: { id },
      include: {
        student: true,
        course: {
          include: {
            subject: true,
            teacher: true
          }
        },
        grades: true
      }
    })
  }

  async exists(studentId: number, courseId: number) {
    const db = getDatabase()
    const enrollment = await db.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId
        }
      }
    })
    return !!enrollment
  }
}

export const enrollmentRepository = new EnrollmentRepository()
