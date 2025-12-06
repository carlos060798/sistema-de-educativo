import { ipcMain } from 'electron'
import { requireRole } from '@main/session'

export function setupTeacherHandlers() {
  ipcMain.handle('teachers:list', async (_, filter) => {
    try {
      requireRole(['admin', 'teacher', 'viewer'])
      // TODO: implement teacher service
      return { success: true, data: [] }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('teachers:getById', async (_, id: number) => {
    try {
      requireRole(['admin', 'teacher', 'viewer'])
      return { success: true, data: null }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('teachers:create', async (_, data) => {
    try {
      requireRole('admin')
      return { success: true, data: null }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('teachers:update', async (_, id: number, data) => {
    try {
      requireRole('admin')
      return { success: true, data: null }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('teachers:delete', async (_, id: number) => {
    try {
      requireRole('admin')
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
