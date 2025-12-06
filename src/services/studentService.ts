import { studentRepository } from '@repositories/studentRepository'
import { CreateStudentDto, UpdateStudentDto, StudentFilter } from '@types/index'
import { getDatabase } from '@main/database'

export class StudentService {
  async list(filter?: StudentFilter) {
    return studentRepository.findAll(filter)
  }

  async getById(id: number) {
    const student = await studentRepository.findById(id)
    if (!student) {
      throw new Error('Student not found')
    }
    return student
  }

  async create(data: CreateStudentDto, userId: number) {
    this.validateStudentData(data)

    const student = await studentRepository.create(data)

    const db = getDatabase()
    await db.auditLog.create({
      data: {
        userId,
        action: 'CREATE',
        objectType: 'Student',
        objectId: student.id,
        details: JSON.stringify({ studentCode: student.studentCode, name: `${student.firstName} ${student.lastName}` })
      }
    })

    return student
  }

  async update(id: number, data: UpdateStudentDto, userId: number) {
    this.validateStudentData(data)

    const student = await studentRepository.update(id, data)

    const db = getDatabase()
    await db.auditLog.create({
      data: {
        userId,
        action: 'UPDATE',
        objectType: 'Student',
        objectId: student.id
      }
    })

    return student
  }

  async delete(id: number, userId: number) {
    await studentRepository.delete(id)

    const db = getDatabase()
    await db.auditLog.create({
      data: {
        userId,
        action: 'DELETE',
        objectType: 'Student',
        objectId: id
      }
    })
  }

  private validateStudentData(data: Partial<CreateStudentDto>) {
    if (data.firstName && data.firstName.trim().length === 0) {
      throw new Error('First name is required')
    }

    if (data.lastName && data.lastName.trim().length === 0) {
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

export const studentService = new StudentService()
