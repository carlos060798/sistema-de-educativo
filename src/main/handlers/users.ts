import { ipcMain } from 'electron'
import { requireRole } from '@main/session'

export function setupUserHandlers() {
  ipcMain.handle('users:list', async () => {
    try {
      requireRole('admin')
      return { success: true, data: [] }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('users:create', async (_, data) => {
    try {
      requireRole('admin')
      return { success: true, data: null }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('users:update', async (_, id: number, data) => {
    try {
      requireRole('admin')
      return { success: true, data: null }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('users:delete', async (_, id: number) => {
    try {
      requireRole('admin')
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('users:changePassword', async (_, userId: number, newPassword: string) => {
    try {
      requireRole('admin')
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
