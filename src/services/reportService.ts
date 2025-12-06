import { studentRepository } from '@repositories/studentRepository'
import { courseRepository } from '@repositories/courseRepository'
import { gradeRepository } from '@repositories/gradeRepository'
import { teacherRepository } from '@repositories/teacherRepository'
import { subjectRepository } from '@repositories/subjectRepository'
import { getDatabase } from '@main/database'

interface StudentReportCard {
  student: {
    id: number
    firstName: string
    lastName: string
    studentCode: string | null
    email: string | null
  }
  period?: string
  grades: Array<{
    subject: string
    subjectCode: string | null
    gradeType: string | null
    score: number
    maxScore: number
    percentage: number
    weight: number
    period: string | null
  }>
  average: number
  weightedAverage: number
}

interface CourseRoster {
  course: {
    id: number
    name: string | null
    period: string | null
    subject: {
      code: string | null
      name: string
    }
    teacher: {
      firstName: string
      lastName: string
    } | null
  }
  students: Array<{
    id: number
    firstName: string
    lastName: string
    studentCode: string | null
    email: string | null
    status: string
    enrolledAt: Date
  }>
}

class ReportService {
  async generateStudentReportCard(studentId: number, period?: string): Promise<StudentReportCard> {
    const student = await studentRepository.findById(studentId)
    if (!student) {
      throw new Error('Estudiante no encontrado')
    }

    const db = getDatabase()

    // Obtener todas las inscripciones del estudiante
    const enrollments = await db.enrollment.findMany({
      where: {
        studentId,
        status: 'active'
      },
      include: {
        course: {
          include: {
            subject: true
          }
        },
        grades: true
      }
    })

    const grades: StudentReportCard['grades'] = []
    let totalScore = 0
    let totalMax = 0
    let totalWeightedScore = 0
    let totalWeight = 0

    for (const enrollment of enrollments) {
      for (const grade of enrollment.grades) {
        // Filtrar por período si se especifica
        if (period && grade.period !== period) {
          continue
        }

        const percentage = (grade.score / grade.maxScore) * 100

        grades.push({
          subject: enrollment.course.subject.name,
          subjectCode: enrollment.course.subject.code,
          gradeType: grade.gradeType,
          score: grade.score,
          maxScore: grade.maxScore,
          percentage: Math.round(percentage * 10) / 10,
          weight: grade.weight,
          period: grade.period
        })

        totalScore += grade.score
        totalMax += grade.maxScore
        totalWeightedScore += grade.score * grade.weight
        totalWeight += grade.weight
      }
    }

    const average = totalMax > 0 ? (totalScore / totalMax) * 100 : 0
    const weightedAverage = totalWeight > 0 ? (totalWeightedScore / totalWeight / totalMax * 100) : 0

    return {
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        studentCode: student.studentCode,
        email: student.email
      },
      period,
      grades,
      average: Math.round(average * 10) / 10,
      weightedAverage: Math.round(weightedAverage * 10) / 10
    }
  }

  async generateCourseRoster(courseId: number): Promise<CourseRoster> {
    const db = getDatabase()

    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        subject: true,
        teacher: true,
        enrollments: {
          include: {
            student: true
          },
          orderBy: {
            student: {
              lastName: 'asc'
            }
          }
        }
      }
    })

    if (!course) {
      throw new Error('Curso no encontrado')
    }

    const students = course.enrollments.map(enrollment => ({
      id: enrollment.student.id,
      firstName: enrollment.student.firstName,
      lastName: enrollment.student.lastName,
      studentCode: enrollment.student.studentCode,
      email: enrollment.student.email,
      status: enrollment.status,
      enrolledAt: enrollment.enrolledAt
    }))

    return {
      course: {
        id: course.id,
        name: course.name,
        period: course.period,
        subject: {
          code: course.subject.code,
          name: course.subject.name
        },
        teacher: course.teacher ? {
          firstName: course.teacher.firstName,
          lastName: course.teacher.lastName
        } : null
      },
      students
    }
  }

  async getSystemStatistics() {
    const db = getDatabase()

    const [
      totalStudents,
      activeStudents,
      totalTeachers,
      totalCourses,
      totalSubjects,
      totalEnrollments,
      totalGrades
    ] = await Promise.all([
      db.student.count(),
      db.student.count({ where: { status: 'active' } }),
      db.teacher.count(),
      db.course.count(),
      db.subject.count(),
      db.enrollment.count({ where: { status: 'active' } }),
      db.grade.count()
    ])

    return {
      students: {
        total: totalStudents,
        active: activeStudents,
        inactive: totalStudents - activeStudents
      },
      teachers: totalTeachers,
      courses: totalCourses,
      subjects: totalSubjects,
      enrollments: totalEnrollments,
      grades: totalGrades
    }
  }
}

export const reportService = new ReportService()
