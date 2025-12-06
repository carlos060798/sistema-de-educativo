import { PrismaClient } from '@prisma/client'
import { app } from 'electron'
import path from 'path'
import fs from 'fs'

let prisma: PrismaClient | null = null

export function getDatabasePath(): string {
  const userDataPath = app.getPath('userData')
  const dbDir = path.join(userDataPath, 'data')

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
  }

  return path.join(dbDir, 'database.db')
}

export function getBackupPath(): string {
  const userDataPath = app.getPath('userData')
  const backupDir = path.join(userDataPath, 'backups')

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
  }

  return backupDir
}

export function initDatabase(): PrismaClient {
  if (prisma) {
    return prisma
  }

  const dbPath = getDatabasePath()
  const databaseUrl = `file:${dbPath}`

  process.env.DATABASE_URL = databaseUrl

  prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl
      }
    },
    log: ['error', 'warn']
  })

  return prisma
}

export function getDatabase(): PrismaClient {
  if (!prisma) {
    throw new Error('Database not initialized. Call initDatabase() first.')
  }
  return prisma
}

export async function closeDatabase(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect()
    prisma = null
  }
}

export async function createBackup(): Promise<string> {
  const dbPath = getDatabasePath()
  const backupDir = getBackupPath()
  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '')
  const backupFileName = `backup_${timestamp}.db`
  const backupFilePath = path.join(backupDir, backupFileName)

  if (!fs.existsSync(dbPath)) {
    throw new Error('Database file not found')
  }

  fs.copyFileSync(dbPath, backupFilePath)

  cleanOldBackups()

  return backupFilePath
}

export function cleanOldBackups(): void {
  const backupDir = getBackupPath()
  const retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS || '30', 10)
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

  const files = fs.readdirSync(backupDir)

  files.forEach(file => {
    if (!file.endsWith('.db')) return

    const filePath = path.join(backupDir, file)
    const stats = fs.statSync(filePath)

    if (stats.mtime < cutoffDate) {
      fs.unlinkSync(filePath)
      console.log(`Deleted old backup: ${file}`)
    }
  })
}

export async function restoreBackup(backupPath: string): Promise<void> {
  const dbPath = getDatabasePath()

  if (!fs.existsSync(backupPath)) {
    throw new Error('Backup file not found')
  }

  await createBackup()

  if (prisma) {
    await closeDatabase()
  }

  fs.copyFileSync(backupPath, dbPath)

  initDatabase()
}

export function listBackups(): Array<{ filename: string; path: string; size: number; createdAt: Date }> {
  const backupDir = getBackupPath()
  const files = fs.readdirSync(backupDir)

  return files
    .filter(file => file.endsWith('.db'))
    .map(file => {
      const filePath = path.join(backupDir, file)
      const stats = fs.statSync(filePath)

      return {
        filename: file,
        path: filePath,
        size: stats.size,
        createdAt: stats.mtime
      }
    })
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}
