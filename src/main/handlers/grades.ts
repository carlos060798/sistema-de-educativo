import { ipcMain } from 'electron'
import { requireRole } from '@main/session'
import { gradeService } from '@services/gradeService'

export function setupGradeHandlers() {
  ipcMain.handle('grades:list', async (_, filter) => {
    try {
      requireRole(['admin', 'teacher', 'viewer'])
      const grades = await gradeService.list(filter)
      return { success: true, data: grades }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('grades:getById', async (_, id: number) => {
    try {
      requireRole(['admin', 'teacher', 'viewer'])
      const grade = await gradeService.getById(id)
      return { success: true, data: grade }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('grades:create', async (_, data) => {
    try {
      const session = requireRole(['admin', 'teacher'])
      const grade = await gradeService.create(data, session.userId)
      return { success: true, data: grade }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('grades:update', async (_, id: number, data) => {
    try {
      const session = requireRole(['admin', 'teacher'])
      const grade = await gradeService.update(id, data, session.userId)
      return { success: true, data: grade }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('grades:delete', async (_, id: number) => {
    try {
      const session = requireRole(['admin', 'teacher'])
      await gradeService.delete(id, session.userId)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('grades:getByEnrollment', async (_, enrollmentId: number) => {
    try {
      requireRole(['admin', 'teacher', 'viewer'])
      const grades = await gradeService.getByEnrollment(enrollmentId)
      return { success: true, data: grades }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('grades:calculateAverage', async (_, enrollmentId: number) => {
    try {
      requireRole(['admin', 'teacher', 'viewer'])
      const average = await gradeService.calculateAverage(enrollmentId)
      return { success: true, data: average }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
