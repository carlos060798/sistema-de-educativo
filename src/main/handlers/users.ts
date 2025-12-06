import { ipcMain } from 'electron'
import { requireRole } from '@main/session'
import { userService } from '@services/userService'

export function setupUserHandlers() {
  ipcMain.handle('users:list', async () => {
    try {
      requireRole('admin')
      const users = await userService.list()
      return { success: true, data: users }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('users:create', async (_, data) => {
    try {
      const session = requireRole('admin')
      const user = await userService.create(data, session.userId)
      return { success: true, data: user }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('users:update', async (_, id: number, data) => {
    try {
      const session = requireRole('admin')
      const user = await userService.update(id, data, session.userId)
      return { success: true, data: user }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('users:delete', async (_, id: number) => {
    try {
      const session = requireRole('admin')
      await userService.delete(id, session.userId)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('users:changePassword', async (_, userId: number, newPassword: string) => {
    try {
      const session = requireRole('admin')
      await userService.changePassword(userId, newPassword, session.userId)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
