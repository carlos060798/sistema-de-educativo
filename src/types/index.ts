// ===== TIPOS COMPARTIDOS =====

export interface SessionData {
  userId: number
  username: string
  role: string
  teacherId?: number
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export interface ListResponse<T> {
  items: T[]
  total: number
  page?: number
  pageSize?: number
}

// ===== FILTROS =====

export interface StudentFilter {
  search?: string
  status?: 'active' | 'inactive'
  gradeLevel?: string
}

export interface CourseFilter {
  teacherId?: number
  subjectId?: number
  period?: string
}

export interface GradeFilter {
  studentId?: number
  courseId?: number
  period?: string
}

// ===== DTOs PARA CREACIÓN/ACTUALIZACIÓN =====

export interface CreateStudentDto {
  studentCode?: string
  firstName: string
  lastName: string
  identification?: string
  email?: string
  gradeLevel?: string
  status?: 'active' | 'inactive'
}

export interface UpdateStudentDto extends Partial<CreateStudentDto> {
  id: number
}

export interface CreateTeacherDto {
  userId?: number
  firstName: string
  lastName: string
  email?: string
  phone?: string
}

export interface UpdateTeacherDto extends Partial<CreateTeacherDto> {
  id: number
}

export interface CreateSubjectDto {
  code?: string
  name: string
  description?: string
}

export interface UpdateSubjectDto extends Partial<CreateSubjectDto> {
  id: number
}

export interface CreateCourseDto {
  subjectId: number
  teacherId?: number
  name?: string
  period?: string
}

export interface UpdateCourseDto extends Partial<CreateCourseDto> {
  id: number
}

export interface CreateEnrollmentDto {
  studentId: number
  courseId: number
}

export interface CreateGradeDto {
  enrollmentId: number
  period?: string
  gradeType?: string
  score: number
  maxScore?: number
  weight?: number
  notes?: string
}

export interface UpdateGradeDto extends Partial<CreateGradeDto> {
  id: number
}

export interface CreateUserDto {
  username: string
  password: string
  roleId: number
}

// ===== TIPOS PARA CÁLCULOS =====

export interface GradeCalculation {
  enrollmentId: number
  studentId: number
  courseId: number
  grades: Array<{
    score: number
    maxScore: number
    weight: number
    gradeType?: string
    period?: string
  }>
  average: number
  weightedAverage: number
  totalPoints: number
  maxPoints: number
}

// ===== TIPOS PARA REPORTES =====

export interface StudentReportCard {
  student: {
    id: number
    fullName: string
    studentCode?: string
    gradeLevel?: string
  }
  courses: Array<{
    courseName: string
    subjectName: string
    teacherName: string
    grades: Array<{
      period?: string
      gradeType?: string
      score: number
      maxScore: number
      percentage: number
    }>
    average: number
  }>
  overallAverage: number
  generatedAt: Date
}

export interface CourseRoster {
  course: {
    id: number
    name: string
    subjectName: string
    teacherName: string
    period?: string
  }
  students: Array<{
    id: number
    fullName: string
    studentCode?: string
    enrolledAt: Date
    grades: Array<{
      period?: string
      gradeType?: string
      score: number
      maxScore: number
    }>
    average?: number
  }>
  generatedAt: Date
}

// ===== TIPOS PARA BACKUP =====

export interface BackupInfo {
  filename: string
  path: string
  size: number
  createdAt: Date
}

export interface RestoreOptions {
  backupPath: string
  createBackupBefore?: boolean
}
