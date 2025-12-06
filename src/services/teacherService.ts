import { teacherRepository, TeacherFilter } from '@repositories/teacherRepository'
import { getDatabase } from '@main/database'

export interface CreateTeacherDto {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  userId?: number
}

export interface UpdateTeacherDto {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  userId?: number
}

export class TeacherService {
  async list(filter?: TeacherFilter) {
    return teacherRepository.findAll(filter)
  }

  async getById(id: number) {
    const teacher = await teacherRepository.findById(id)
    if (!teacher) {
      throw new Error('Teacher not found')
    }
    return teacher
  }

  async create(data: CreateTeacherDto, userId: number) {
    // Validaciones
    this.validateTeacherData(data)

    // Crear profesor
    const teacher = await teacherRepository.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      ...(data.userId && {
        user: {
          connect: { id: data.userId }
        }
      })
    })

    // Auditoría
    const db = getDatabase()
    await db.auditLog.create({
      data: {
        userId,
        action: 'CREATE',
        objectType: 'Teacher',
        objectId: teacher.id,
        details: JSON.stringify({ name: `${teacher.firstName} ${teacher.lastName}` })
      }
    })

    return teacher
  }

  async update(id: number, data: UpdateTeacherDto, userId: number) {
    const teacher = await this.getById(id)

    // Validaciones
    if (data.firstName !== undefined || data.lastName !== undefined) {
      this.validateTeacherData({
        firstName: data.firstName || teacher.firstName,
        lastName: data.lastName || teacher.lastName
      })
    }

    // Actualizar
    const updated = await teacherRepository.update(id, {
      ...(data.firstName && { firstName: data.firstName }),
      ...(data.lastName && { lastName: data.lastName }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.userId !== undefined && {
        user: data.userId ? { connect: { id: data.userId } } : { disconnect: true }
      })
    })

    // Auditoría
    const db = getDatabase()
    await db.auditLog.create({
      data: {
        userId,
        action: 'UPDATE',
        objectType: 'Teacher',
        objectId: id,
        details: JSON.stringify(data)
      }
    })

    return updated
  }

  async delete(id: number, userId: number) {
    const teacher = await this.getById(id)

    // Verificar si tiene cursos activos
    const db = getDatabase()
    const coursesCount = await db.course.count({
      where: { teacherId: id }
    })

    if (coursesCount > 0) {
      throw new Error('Cannot delete teacher with active courses')
    }

    await teacherRepository.delete(id)

    // Auditoría
    await db.auditLog.create({
      data: {
        userId,
        action: 'DELETE',
        objectType: 'Teacher',
        objectId: id,
        details: JSON.stringify({ name: `${teacher.firstName} ${teacher.lastName}` })
      }
    })
  }

  private validateTeacherData(data: { firstName: string; lastName: string; email?: string }) {
    if (!data.firstName || data.firstName.trim().length === 0) {
      throw new Error('First name is required')
    }

    if (!data.lastName || data.lastName.trim().length === 0) {
      throw new Error('Last name is required')
    }

    if (data.email && !this.isValidEmail(data.email)) {
      throw new Error('Invalid email format')
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}

export const teacherService = new TeacherService()
