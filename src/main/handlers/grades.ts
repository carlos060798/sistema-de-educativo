import { ipcMain } from 'electron'
import { requireRole } from '@main/session'

export function setupGradeHandlers() {
  ipcMain.handle('grades:list', async (_, filter) => {
    try {
      requireRole(['admin', 'teacher', 'viewer'])
      return { success: true, data: [] }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('grades:getById', async (_, id: number) => {
    try {
      requireRole(['admin', 'teacher', 'viewer'])
      return { success: true, data: null }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('grades:create', async (_, data) => {
    try {
      requireRole(['admin', 'teacher'])
      return { success: true, data: null }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('grades:update', async (_, id: number, data) => {
    try {
      requireRole(['admin', 'teacher'])
      return { success: true, data: null }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('grades:delete', async (_, id: number) => {
    try {
      requireRole('admin')
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('grades:getByEnrollment', async (_, enrollmentId: number) => {
    try {
      requireRole(['admin', 'teacher', 'viewer'])
      return { success: true, data: [] }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('grades:calculateAverage', async (_, enrollmentId: number) => {
    try {
      requireRole(['admin', 'teacher', 'viewer'])
      return { success: true, data: { average: 0, weightedAverage: 0 } }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
