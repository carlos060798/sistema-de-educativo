import { contextBridge, ipcRenderer } from 'electron'

// API expuesta al renderer de forma segura
contextBridge.exposeInMainWorld('electronAPI', {
  // Auth
  auth: {
    login: (username: string, password: string) =>
      ipcRenderer.invoke('auth:login', username, password),
    logout: () => ipcRenderer.invoke('auth:logout'),
    getCurrentUser: () => ipcRenderer.invoke('auth:getCurrentUser')
  },

  // Students
  students: {
    list: (filter?: any) => ipcRenderer.invoke('students:list', filter),
    getById: (id: number) => ipcRenderer.invoke('students:getById', id),
    create: (data: any) => ipcRenderer.invoke('students:create', data),
    update: (id: number, data: any) => ipcRenderer.invoke('students:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('students:delete', id)
  },

  // Teachers
  teachers: {
    list: (filter?: any) => ipcRenderer.invoke('teachers:list', filter),
    getById: (id: number) => ipcRenderer.invoke('teachers:getById', id),
    create: (data: any) => ipcRenderer.invoke('teachers:create', data),
    update: (id: number, data: any) => ipcRenderer.invoke('teachers:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('teachers:delete', id)
  },

  // Subjects
  subjects: {
    list: (filter?: any) => ipcRenderer.invoke('subjects:list', filter),
    getById: (id: number) => ipcRenderer.invoke('subjects:getById', id),
    create: (data: any) => ipcRenderer.invoke('subjects:create', data),
    update: (id: number, data: any) => ipcRenderer.invoke('subjects:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('subjects:delete', id)
  },

  // Courses
  courses: {
    list: (filter?: any) => ipcRenderer.invoke('courses:list', filter),
    getById: (id: number) => ipcRenderer.invoke('courses:getById', id),
    create: (data: any) => ipcRenderer.invoke('courses:create', data),
    update: (id: number, data: any) => ipcRenderer.invoke('courses:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('courses:delete', id),
    getEnrollments: (courseId: number) => ipcRenderer.invoke('courses:getEnrollments', courseId)
  },

  // Enrollments
  enrollments: {
    create: (data: any) => ipcRenderer.invoke('enrollments:create', data),
    delete: (id: number) => ipcRenderer.invoke('enrollments:delete', id),
    getByStudent: (studentId: number) => ipcRenderer.invoke('enrollments:getByStudent', studentId)
  },

  // Grades
  grades: {
    list: (filter?: any) => ipcRenderer.invoke('grades:list', filter),
    getById: (id: number) => ipcRenderer.invoke('grades:getById', id),
    create: (data: any) => ipcRenderer.invoke('grades:create', data),
    update: (id: number, data: any) => ipcRenderer.invoke('grades:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('grades:delete', id),
    getByEnrollment: (enrollmentId: number) => ipcRenderer.invoke('grades:getByEnrollment', enrollmentId),
    calculateAverage: (enrollmentId: number) => ipcRenderer.invoke('grades:calculateAverage', enrollmentId)
  },

  // Reports
  reports: {
    generateStudentReportCard: (studentId: number, period?: string) =>
      ipcRenderer.invoke('reports:generateStudentReportCard', studentId, period),
    generateCourseRoster: (courseId: number) =>
      ipcRenderer.invoke('reports:generateCourseRoster', courseId),
    exportToPdf: (reportData: any, filename: string) =>
      ipcRenderer.invoke('reports:exportToPdf', reportData, filename),
    exportToExcel: (reportData: any, filename: string) =>
      ipcRenderer.invoke('reports:exportToExcel', reportData, filename)
  },

  // Database
  database: {
    createBackup: () => ipcRenderer.invoke('database:createBackup'),
    restoreBackup: (backupPath: string) => ipcRenderer.invoke('database:restoreBackup', backupPath),
    listBackups: () => ipcRenderer.invoke('database:listBackups')
  },

  // Users
  users: {
    list: () => ipcRenderer.invoke('users:list'),
    create: (data: any) => ipcRenderer.invoke('users:create', data),
    update: (id: number, data: any) => ipcRenderer.invoke('users:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('users:delete', id),
    changePassword: (userId: number, newPassword: string) =>
      ipcRenderer.invoke('users:changePassword', userId, newPassword)
  }
})

// Tipos para TypeScript
export interface ElectronAPI {
  auth: {
    login: (username: string, password: string) => Promise<any>
    logout: () => Promise<void>
    getCurrentUser: () => Promise<any>
  }
  students: {
    list: (filter?: any) => Promise<any>
    getById: (id: number) => Promise<any>
    create: (data: any) => Promise<any>
    update: (id: number, data: any) => Promise<any>
    delete: (id: number) => Promise<any>
  }
  teachers: {
    list: (filter?: any) => Promise<any>
    getById: (id: number) => Promise<any>
    create: (data: any) => Promise<any>
    update: (id: number, data: any) => Promise<any>
    delete: (id: number) => Promise<any>
  }
  subjects: {
    list: (filter?: any) => Promise<any>
    getById: (id: number) => Promise<any>
    create: (data: any) => Promise<any>
    update: (id: number, data: any) => Promise<any>
    delete: (id: number) => Promise<any>
  }
  courses: {
    list: (filter?: any) => Promise<any>
    getById: (id: number) => Promise<any>
    create: (data: any) => Promise<any>
    update: (id: number, data: any) => Promise<any>
    delete: (id: number) => Promise<any>
    getEnrollments: (courseId: number) => Promise<any>
  }
  enrollments: {
    create: (data: any) => Promise<any>
    delete: (id: number) => Promise<any>
    getByStudent: (studentId: number) => Promise<any>
  }
  grades: {
    list: (filter?: any) => Promise<any>
    getById: (id: number) => Promise<any>
    create: (data: any) => Promise<any>
    update: (id: number, data: any) => Promise<any>
    delete: (id: number) => Promise<any>
    getByEnrollment: (enrollmentId: number) => Promise<any>
    calculateAverage: (enrollmentId: number) => Promise<any>
  }
  reports: {
    generateStudentReportCard: (studentId: number, period?: string) => Promise<any>
    generateCourseRoster: (courseId: number) => Promise<any>
    exportToPdf: (reportData: any, filename: string) => Promise<any>
    exportToExcel: (reportData: any, filename: string) => Promise<any>
  }
  database: {
    createBackup: () => Promise<any>
    restoreBackup: (backupPath: string) => Promise<any>
    listBackups: () => Promise<any>
  }
  users: {
    list: () => Promise<any>
    create: (data: any) => Promise<any>
    update: (id: number, data: any) => Promise<any>
    delete: (id: number) => Promise<any>
    changePassword: (userId: number, newPassword: string) => Promise<any>
  }
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
