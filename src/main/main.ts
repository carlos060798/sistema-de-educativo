import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import { initDatabase, closeDatabase, createBackup, restoreBackup, listBackups } from './database'
import { setupAuthHandlers } from './handlers/auth'
import { setupStudentHandlers } from './handlers/students'
import { setupTeacherHandlers } from './handlers/teachers'
import { setupSubjectHandlers } from './handlers/subjects'
import { setupCourseHandlers } from './handlers/courses'
import { setupEnrollmentHandlers } from './handlers/enrollments'
import { setupGradeHandlers } from './handlers/grades'
import { setupUserHandlers } from './handlers/users'
import { setupReportHandlers } from './handlers/reports'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let mainWindow: BrowserWindow | null = null

const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev')

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    webPreferences: {
      preload: isDev
        ? path.join(__dirname, '../../src/main/preload.cjs')
        : path.join(__dirname, '../preload/preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    show: false
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

async function setupDatabase() {
  try {
    console.log('Initializing database...')
    const db = initDatabase()

    // Aplicar migraciones si es necesario
    await db.$connect()
    console.log('Database connected successfully')

    // Crear backup automático si está habilitado
    if (process.env.AUTO_BACKUP_ENABLED === 'true') {
      scheduleAutoBackup()
    }
  } catch (error) {
    console.error('Database initialization failed:', error)
    throw error
  }
}

function scheduleAutoBackup() {
  // Backup diario a las 2 AM
  const now = new Date()
  const next2AM = new Date(now)
  next2AM.setHours(2, 0, 0, 0)

  if (next2AM <= now) {
    next2AM.setDate(next2AM.getDate() + 1)
  }

  const timeUntilBackup = next2AM.getTime() - now.getTime()

  setTimeout(async () => {
    try {
      await createBackup()
      console.log('Automatic backup created successfully')
      scheduleAutoBackup() // Programar siguiente backup
    } catch (error) {
      console.error('Automatic backup failed:', error)
    }
  }, timeUntilBackup)
}

function setupIpcHandlers() {
  // Database handlers
  ipcMain.handle('database:createBackup', async () => {
    try {
      const backupPath = await createBackup()
      return { success: true, data: backupPath }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('database:restoreBackup', async (_, backupPath: string) => {
    try {
      await restoreBackup(backupPath)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('database:listBackups', async () => {
    try {
      const backups = listBackups()
      return { success: true, data: backups }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Setup domain handlers
  setupAuthHandlers()
  setupStudentHandlers()
  setupTeacherHandlers()
  setupSubjectHandlers()
  setupCourseHandlers()
  setupEnrollmentHandlers()
  setupGradeHandlers()
  setupUserHandlers()
  setupReportHandlers()
}

app.whenReady().then(async () => {
  try {
    await setupDatabase()
    setupIpcHandlers()
    await createWindow()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
      }
    })
  } catch (error) {
    console.error('Application startup failed:', error)
    app.quit()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', async () => {
  await closeDatabase()
})

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error)
})

process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error)
})
