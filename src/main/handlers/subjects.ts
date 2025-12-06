import { ipcMain } from 'electron'
import { requireRole } from '@main/session'

export function setupSubjectHandlers() {
  ipcMain.handle('subjects:list', async () => {
    try {
      requireRole(['admin', 'teacher', 'viewer'])
      return { success: true, data: [] }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('subjects:getById', async (_, id: number) => {
    try {
      requireRole(['admin', 'teacher', 'viewer'])
      return { success: true, data: null }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('subjects:create', async (_, data) => {
    try {
      requireRole('admin')
      return { success: true, data: null }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('subjects:update', async (_, id: number, data) => {
    try {
      requireRole('admin')
      return { success: true, data: null }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('subjects:delete', async (_, id: number) => {
    try {
      requireRole('admin')
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
