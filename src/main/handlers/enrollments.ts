import { ipcMain } from 'electron'
import { requireRole } from '@main/session'

export function setupEnrollmentHandlers() {
  ipcMain.handle('enrollments:create', async (_, data) => {
    try {
      requireRole(['admin', 'teacher'])
      return { success: true, data: null }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('enrollments:delete', async (_, id: number) => {
    try {
      requireRole('admin')
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('enrollments:getByStudent', async (_, studentId: number) => {
    try {
      requireRole(['admin', 'teacher', 'viewer'])
      return { success: true, data: [] }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
