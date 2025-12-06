import { gradeRepository, GradeFilter } from '@repositories/gradeRepository'
import { getDatabase } from '@main/database'

export interface CreateGradeDto {
  enrollmentId: number
  period?: string
  gradeType?: string
  score: number
  maxScore?: number
  weight?: number
  notes?: string
}

export interface UpdateGradeDto {
  period?: string
  gradeType?: string
  score?: number
  maxScore?: number
  weight?: number
  notes?: string
}

export class GradeService {
  async list(filter?: GradeFilter) {
    return gradeRepository.findAll(filter)
  }

  async getById(id: number) {
    const grade = await gradeRepository.findById(id)
    if (!grade) {
      throw new Error('Grade not found')
    }
    return grade
  }

  async create(data: CreateGradeDto, userId: number) {
    if (!data.enrollmentId) {
      throw new Error('Enrollment is required')
    }

    if (data.score < 0 || (data.maxScore && data.score > data.maxScore)) {
      throw new Error('Invalid score value')
    }

    const grade = await gradeRepository.create({
      enrollment: { connect: { id: data.enrollmentId } },
      period: data.period,
      gradeType: data.gradeType,
      score: data.score,
      maxScore: data.maxScore || 100,
      weight: data.weight || 1.0,
      notes: data.notes
    })

    const db = getDatabase()
    await db.auditLog.create({
      data: {
        userId,
        action: 'CREATE',
        objectType: 'Grade',
        objectId: grade.id,
        details: JSON.stringify({ score: data.score, enrollmentId: data.enrollmentId })
      }
    })

    return grade
  }

  async update(id: number, data: UpdateGradeDto, userId: number) {
    await this.getById(id)

    if (data.score !== undefined) {
      if (data.score < 0 || (data.maxScore && data.score > data.maxScore)) {
        throw new Error('Invalid score value')
      }
    }

    const updated = await gradeRepository.update(id, data)

    const db = getDatabase()
    await db.auditLog.create({
      data: {
        userId,
        action: 'UPDATE',
        objectType: 'Grade',
        objectId: id,
        details: JSON.stringify(data)
      }
    })

    return updated
  }

  async delete(id: number, userId: number) {
    await this.getById(id)
    await gradeRepository.delete(id)

    const db = getDatabase()
    await db.auditLog.create({
      data: {
        userId,
        action: 'DELETE',
        objectType: 'Grade',
        objectId: id
      }
    })
  }

  async getByEnrollment(enrollmentId: number) {
    return gradeRepository.getByEnrollment(enrollmentId)
  }

  async calculateAverage(enrollmentId: number) {
    return gradeRepository.calculateAverage(enrollmentId)
  }
}

export const gradeService = new GradeService()
