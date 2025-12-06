import { subjectRepository, SubjectFilter } from '@repositories/subjectRepository'
import { getDatabase } from '@main/database'

export interface CreateSubjectDto {
  code?: string
  name: string
  description?: string
}

export interface UpdateSubjectDto {
  code?: string
  name?: string
  description?: string
}

export class SubjectService {
  async list(filter?: SubjectFilter) {
    return subjectRepository.findAll(filter)
  }

  async getById(id: number) {
    const subject = await subjectRepository.findById(id)
    if (!subject) {
      throw new Error('Subject not found')
    }
    return subject
  }

  async create(data: CreateSubjectDto, userId: number) {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Subject name is required')
    }

    // Verificar código único
    if (data.code) {
      const existing = await subjectRepository.findByCode(data.code)
      if (existing) {
        throw new Error('Subject code already exists')
      }
    }

    const subject = await subjectRepository.create({
      code: data.code,
      name: data.name,
      description: data.description
    })

    // Auditoría
    const db = getDatabase()
    await db.auditLog.create({
      data: {
        userId,
        action: 'CREATE',
        objectType: 'Subject',
        objectId: subject.id,
        details: JSON.stringify({ name: subject.name, code: subject.code })
      }
    })

    return subject
  }

  async update(id: number, data: UpdateSubjectDto, userId: number) {
    await this.getById(id)

    if (data.name !== undefined && data.name.trim().length === 0) {
      throw new Error('Subject name cannot be empty')
    }

    // Verificar código único si se está actualizando
    if (data.code) {
      const existing = await subjectRepository.findByCode(data.code)
      if (existing && existing.id !== id) {
        throw new Error('Subject code already exists')
      }
    }

    const updated = await subjectRepository.update(id, data)

    // Auditoría
    const db = getDatabase()
    await db.auditLog.create({
      data: {
        userId,
        action: 'UPDATE',
        objectType: 'Subject',
        objectId: id,
        details: JSON.stringify(data)
      }
    })

    return updated
  }

  async delete(id: number, userId: number) {
    const subject = await this.getById(id)

    // Verificar si tiene cursos
    const db = getDatabase()
    const coursesCount = await db.course.count({
      where: { subjectId: id }
    })

    if (coursesCount > 0) {
      throw new Error('Cannot delete subject with associated courses')
    }

    await subjectRepository.delete(id)

    // Auditoría
    await db.auditLog.create({
      data: {
        userId,
        action: 'DELETE',
        objectType: 'Subject',
        objectId: id,
        details: JSON.stringify({ name: subject.name })
      }
    })
  }
}

export const subjectService = new SubjectService()
