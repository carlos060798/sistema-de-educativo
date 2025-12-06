import { ipcMain } from 'electron'
import { requireRole } from '@main/session'
import { enrollmentService } from '@services/enrollmentService'

export function setupEnrollmentHandlers() {
  ipcMain.handle('enrollments:create', async (_, data) => {
    try {
      const session = requireRole(['admin', 'teacher'])
      const enrollment = await enrollmentService.create(data, session.userId)
      return { success: true, data: enrollment }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('enrollments:delete', async (_, id: number) => {
    try {
      const session = requireRole(['admin', 'teacher'])
      await enrollmentService.delete(id, session.userId)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('enrollments:getByStudent', async (_, studentId: number) => {
    try {
      requireRole(['admin', 'teacher', 'viewer'])
      const enrollments = await enrollmentService.getByStudent(studentId)
      return { success: true, data: enrollments }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
