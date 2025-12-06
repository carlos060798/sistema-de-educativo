import { enrollmentRepository } from '@repositories/enrollmentRepository'
import { getDatabase } from '@main/database'

export interface CreateEnrollmentDto {
  studentId: number
  courseId: number
}

export class EnrollmentService {
  async create(data: CreateEnrollmentDto, userId: number) {
    // Verificar que no exista ya
    const exists = await enrollmentRepository.exists(data.studentId, data.courseId)
    if (exists) {
      throw new Error('Student is already enrolled in this course')
    }

    const enrollment = await enrollmentRepository.create({
      student: { connect: { id: data.studentId } },
      course: { connect: { id: data.courseId } }
    })

    const db = getDatabase()
    await db.auditLog.create({
      data: {
        userId,
        action: 'CREATE',
        objectType: 'Enrollment',
        objectId: enrollment.id,
        details: JSON.stringify({ studentId: data.studentId, courseId: data.courseId })
      }
    })

    return enrollment
  }

  async delete(id: number, userId: number) {
    const enrollment = await enrollmentRepository.findById(id)
    if (!enrollment) {
      throw new Error('Enrollment not found')
    }

    await enrollmentRepository.delete(id)

    const db = getDatabase()
    await db.auditLog.create({
      data: {
        userId,
        action: 'DELETE',
        objectType: 'Enrollment',
        objectId: id
      }
    })
  }

  async getByStudent(studentId: number) {
    return enrollmentRepository.getByStudent(studentId)
  }
}

export const enrollmentService = new EnrollmentService()
