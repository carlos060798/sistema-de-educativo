const { contextBridge, ipcRenderer } = require('electron')

// API expuesta al renderer de forma segura
contextBridge.exposeInMainWorld('electronAPI', {
  // Auth
  auth: {
    login: (username, password) =>
      ipcRenderer.invoke('auth:login', username, password),
    logout: () => ipcRenderer.invoke('auth:logout'),
    getCurrentUser: () => ipcRenderer.invoke('auth:getCurrentUser')
  },

  // Students
  students: {
    list: (filter) => ipcRenderer.invoke('students:list', filter),
    getById: (id) => ipcRenderer.invoke('students:getById', id),
    create: (data) => ipcRenderer.invoke('students:create', data),
    update: (id, data) => ipcRenderer.invoke('students:update', id, data),
    delete: (id) => ipcRenderer.invoke('students:delete', id)
  },

  // Teachers
  teachers: {
    list: (filter) => ipcRenderer.invoke('teachers:list', filter),
    getById: (id) => ipcRenderer.invoke('teachers:getById', id),
    create: (data) => ipcRenderer.invoke('teachers:create', data),
    update: (id, data) => ipcRenderer.invoke('teachers:update', id, data),
    delete: (id) => ipcRenderer.invoke('teachers:delete', id)
  },

  // Subjects
  subjects: {
    list: (filter) => ipcRenderer.invoke('subjects:list', filter),
    getById: (id) => ipcRenderer.invoke('subjects:getById', id),
    create: (data) => ipcRenderer.invoke('subjects:create', data),
    update: (id, data) => ipcRenderer.invoke('subjects:update', id, data),
    delete: (id) => ipcRenderer.invoke('subjects:delete', id)
  },

  // Courses
  courses: {
    list: (filter) => ipcRenderer.invoke('courses:list', filter),
    getById: (id) => ipcRenderer.invoke('courses:getById', id),
    create: (data) => ipcRenderer.invoke('courses:create', data),
    update: (id, data) => ipcRenderer.invoke('courses:update', id, data),
    delete: (id) => ipcRenderer.invoke('courses:delete', id),
    getEnrollments: (courseId) => ipcRenderer.invoke('courses:getEnrollments', courseId)
  },

  // Enrollments
  enrollments: {
    create: (data) => ipcRenderer.invoke('enrollments:create', data),
    delete: (id) => ipcRenderer.invoke('enrollments:delete', id),
    getByStudent: (studentId) => ipcRenderer.invoke('enrollments:getByStudent', studentId)
  },

  // Grades
  grades: {
    list: (filter) => ipcRenderer.invoke('grades:list', filter),
    getById: (id) => ipcRenderer.invoke('grades:getById', id),
    create: (data) => ipcRenderer.invoke('grades:create', data),
    update: (id, data) => ipcRenderer.invoke('grades:update', id, data),
    delete: (id) => ipcRenderer.invoke('grades:delete', id),
    getByEnrollment: (enrollmentId) => ipcRenderer.invoke('grades:getByEnrollment', enrollmentId),
    calculateAverage: (enrollmentId) => ipcRenderer.invoke('grades:calculateAverage', enrollmentId)
  },

  // Reports
  reports: {
    generateStudentReportCard: (studentId, period) =>
      ipcRenderer.invoke('reports:generateStudentReportCard', studentId, period),
    generateCourseRoster: (courseId) =>
      ipcRenderer.invoke('reports:generateCourseRoster', courseId),
    exportToPdf: (reportData, type) =>
      type === 'student'
        ? ipcRenderer.invoke('reports:exportStudentReportToPdf', reportData)
        : ipcRenderer.invoke('reports:exportCourseRosterToPdf', reportData),
    exportToExcel: (reportData, type) =>
      type === 'student'
        ? ipcRenderer.invoke('reports:exportStudentReportToExcel', reportData)
        : ipcRenderer.invoke('reports:exportCourseRosterToExcel', reportData),
    getSystemStatistics: () =>
      ipcRenderer.invoke('reports:getSystemStatistics')
  },

  // Database
  database: {
    createBackup: () => ipcRenderer.invoke('database:createBackup'),
    restoreBackup: (backupPath) => ipcRenderer.invoke('database:restoreBackup', backupPath),
    listBackups: () => ipcRenderer.invoke('database:listBackups')
  },

  // Users
  users: {
    list: () => ipcRenderer.invoke('users:list'),
    create: (data) => ipcRenderer.invoke('users:create', data),
    update: (id, data) => ipcRenderer.invoke('users:update', id, data),
    delete: (id) => ipcRenderer.invoke('users:delete', id),
    changePassword: (userId, newPassword) =>
      ipcRenderer.invoke('users:changePassword', userId, newPassword)
  }
})
