import { ipcMain } from 'electron'
import { requireRole } from '@main/session'
import { subjectService } from '@services/subjectService'

export function setupSubjectHandlers() {
  ipcMain.handle('subjects:list', async (_, filter) => {
    try {
      requireRole(['admin', 'teacher', 'viewer'])
      const subjects = await subjectService.list(filter)
      return { success: true, data: subjects }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('subjects:getById', async (_, id: number) => {
    try {
      requireRole(['admin', 'teacher', 'viewer'])
      const subject = await subjectService.getById(id)
      return { success: true, data: subject }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('subjects:create', async (_, data) => {
    try {
      const session = requireRole('admin')
      const subject = await subjectService.create(data, session.userId)
      return { success: true, data: subject }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('subjects:update', async (_, id: number, data) => {
    try {
      const session = requireRole('admin')
      const subject = await subjectService.update(id, data, session.userId)
      return { success: true, data: subject }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('subjects:delete', async (_, id: number) => {
    try {
      const session = requireRole('admin')
      await subjectService.delete(id, session.userId)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
