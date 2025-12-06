import { ipcMain } from 'electron'
import { requireRole } from '@main/session'
import { courseService } from '@services/courseService'

export function setupCourseHandlers() {
  ipcMain.handle('courses:list', async (_, filter) => {
    try {
      requireRole(['admin', 'teacher', 'viewer'])
      const courses = await courseService.list(filter)
      return { success: true, data: courses }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('courses:getById', async (_, id: number) => {
    try {
      requireRole(['admin', 'teacher', 'viewer'])
      const course = await courseService.getById(id)
      return { success: true, data: course }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('courses:create', async (_, data) => {
    try {
      const session = requireRole(['admin', 'teacher'])
      const course = await courseService.create(data, session.userId)
      return { success: true, data: course }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('courses:update', async (_, id: number, data) => {
    try {
      const session = requireRole(['admin', 'teacher'])
      const course = await courseService.update(id, data, session.userId)
      return { success: true, data: course }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('courses:delete', async (_, id: number) => {
    try {
      const session = requireRole('admin')
      await courseService.delete(id, session.userId)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('courses:getEnrollments', async (_, courseId: number) => {
    try {
      requireRole(['admin', 'teacher', 'viewer'])
      const enrollments = await courseService.getEnrollments(courseId)
      return { success: true, data: enrollments }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
