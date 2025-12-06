import { courseRepository, CourseFilter } from '@repositories/courseRepository'
import { getDatabase } from '@main/database'

export interface CreateCourseDto {
  subjectId: number
  teacherId?: number
  name?: string
  period?: string
}

export interface UpdateCourseDto {
  subjectId?: number
  teacherId?: number
  name?: string
  period?: string
}

export class CourseService {
  async list(filter?: CourseFilter) {
    return courseRepository.findAll(filter)
  }

  async getById(id: number) {
    const course = await courseRepository.findById(id)
    if (!course) {
      throw new Error('Course not found')
    }
    return course
  }

  async create(data: CreateCourseDto, userId: number) {
    if (!data.subjectId) {
      throw new Error('Subject is required')
    }

    const course = await courseRepository.create({
      subject: { connect: { id: data.subjectId } },
      ...(data.teacherId && { teacher: { connect: { id: data.teacherId } } }),
      name: data.name,
      period: data.period
    })

    const db = getDatabase()
    await db.auditLog.create({
      data: {
        userId,
        action: 'CREATE',
        objectType: 'Course',
        objectId: course.id,
        details: JSON.stringify({ name: course.name, period: course.period })
      }
    })

    return course
  }

  async update(id: number, data: UpdateCourseDto, userId: number) {
    await this.getById(id)

    const updated = await courseRepository.update(id, {
      ...(data.subjectId && { subject: { connect: { id: data.subjectId } } }),
      ...(data.teacherId !== undefined && {
        teacher: data.teacherId ? { connect: { id: data.teacherId } } : { disconnect: true }
      }),
      ...(data.name !== undefined && { name: data.name }),
      ...(data.period !== undefined && { period: data.period })
    })

    const db = getDatabase()
    await db.auditLog.create({
      data: {
        userId,
        action: 'UPDATE',
        objectType: 'Course',
        objectId: id,
        details: JSON.stringify(data)
      }
    })

    return updated
  }

  async delete(id: number, userId: number) {
    const course = await this.getById(id)

    // Verificar inscripciones
    if (course.enrollments && course.enrollments.length > 0) {
      throw new Error('Cannot delete course with enrollments')
    }

    await courseRepository.delete(id)

    const db = getDatabase()
    await db.auditLog.create({
      data: {
        userId,
        action: 'DELETE',
        objectType: 'Course',
        objectId: id,
        details: JSON.stringify({ name: course.name })
      }
    })
  }

  async getEnrollments(courseId: number) {
    return courseRepository.getEnrollments(courseId)
  }
}

export const courseService = new CourseService()
