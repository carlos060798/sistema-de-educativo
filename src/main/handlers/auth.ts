import { ipcMain } from 'electron'
import { authService } from '@services/authService'

export function setupAuthHandlers() {
  ipcMain.handle('auth:login', async (_, username: string, password: string) => {
    try {
      const session = await authService.login(username, password)
      return { success: true, data: session }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('auth:logout', async () => {
    try {
      await authService.logout()
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('auth:getCurrentUser', async () => {
    try {
      const user = authService.getCurrentUser()
      return { success: true, data: user }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
