import { getDatabase } from '@main/database'
import { CreateStudentDto, UpdateStudentDto, StudentFilter } from '@types/index'

export class StudentRepository {
  async findAll(filter?: StudentFilter) {
    const db = getDatabase()

    const where: any = {}

    if (filter?.status) {
      where.status = filter.status
    }

    if (filter?.gradeLevel) {
      where.gradeLevel = filter.gradeLevel
    }

    if (filter?.search) {
      where.OR = [
        { firstName: { contains: filter.search, mode: 'insensitive' } },
        { lastName: { contains: filter.search, mode: 'insensitive' } },
        { studentCode: { contains: filter.search, mode: 'insensitive' } },
        { identification: { contains: filter.search, mode: 'insensitive' } }
      ]
    }

    const students = await db.student.findMany({
      where,
      orderBy: { lastName: 'asc' }
    })

    return students
  }

  async findById(id: number) {
    const db = getDatabase()
    return db.student.findUnique({
      where: { id },
      include: {
        enrollments: {
          include: {
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

  async create(data: CreateStudentDto) {
    const db = getDatabase()
    return db.student.create({
      data: {
        studentCode: data.studentCode,
        firstName: data.firstName,
        lastName: data.lastName,
        identification: data.identification,
        email: data.email,
        gradeLevel: data.gradeLevel,
        status: data.status || 'active'
      }
    })
  }

  async update(id: number, data: UpdateStudentDto) {
    const db = getDatabase()
    return db.student.update({
      where: { id },
      data: {
        studentCode: data.studentCode,
        firstName: data.firstName,
        lastName: data.lastName,
        identification: data.identification,
        email: data.email,
        gradeLevel: data.gradeLevel,
        status: data.status
      }
    })
  }

  async delete(id: number) {
    const db = getDatabase()
    return db.student.delete({
      where: { id }
    })
  }
}

export const studentRepository = new StudentRepository()
