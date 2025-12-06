import { ipcMain } from 'electron'
import { requireRole, sessionManager } from '@main/session'
import { teacherService } from '@services/teacherService'

export function setupTeacherHandlers() {
  ipcMain.handle('teachers:list', async (_, filter) => {
    try {
      requireRole(['admin', 'teacher', 'viewer'])
      const teachers = await teacherService.list(filter)
      return { success: true, data: teachers }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('teachers:getById', async (_, id: number) => {
    try {
      requireRole(['admin', 'teacher', 'viewer'])
      const teacher = await teacherService.getById(id)
      return { success: true, data: teacher }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('teachers:create', async (_, data) => {
    try {
      const session = requireRole('admin')
      const teacher = await teacherService.create(data, session.userId)
      return { success: true, data: teacher }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('teachers:update', async (_, id: number, data) => {
    try {
      const session = requireRole('admin')
      const teacher = await teacherService.update(id, data, session.userId)
      return { success: true, data: teacher }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('teachers:delete', async (_, id: number) => {
    try {
      const session = requireRole('admin')
      await teacherService.delete(id, session.userId)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
