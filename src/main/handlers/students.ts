import { ipcMain } from 'electron'
import { studentService } from '@services/studentService'
import { requireRole } from '@main/session'

export function setupStudentHandlers() {
  ipcMain.handle('students:list', async (_, filter) => {
    try {
      requireRole(['admin', 'teacher', 'viewer'])
      const students = await studentService.list(filter)
      return { success: true, data: students }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('students:getById', async (_, id: number) => {
    try {
      requireRole(['admin', 'teacher', 'viewer'])
      const student = await studentService.getById(id)
      return { success: true, data: student }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('students:create', async (_, data) => {
    try {
      const session = requireRole(['admin', 'teacher'])
      const student = await studentService.create(data, session.userId)
      return { success: true, data: student }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('students:update', async (_, id: number, data) => {
    try {
      const session = requireRole(['admin', 'teacher'])
      const student = await studentService.update(id, data, session.userId)
      return { success: true, data: student }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('students:delete', async (_, id: number) => {
    try {
      const session = requireRole('admin')
      await studentService.delete(id, session.userId)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
