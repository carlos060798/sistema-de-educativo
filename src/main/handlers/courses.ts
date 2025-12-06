import { ipcMain } from 'electron'
import { requireRole } from '@main/session'

export function setupCourseHandlers() {
  ipcMain.handle('courses:list', async (_, filter) => {
    try {
      requireRole(['admin', 'teacher', 'viewer'])
      return { success: true, data: [] }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('courses:getById', async (_, id: number) => {
    try {
      requireRole(['admin', 'teacher', 'viewer'])
      return { success: true, data: null }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('courses:create', async (_, data) => {
    try {
      requireRole(['admin', 'teacher'])
      return { success: true, data: null }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('courses:update', async (_, id: number, data) => {
    try {
      requireRole(['admin', 'teacher'])
      return { success: true, data: null }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('courses:delete', async (_, id: number) => {
    try {
      requireRole('admin')
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('courses:getEnrollments', async (_, courseId: number) => {
    try {
      requireRole(['admin', 'teacher', 'viewer'])
      return { success: true, data: [] }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
