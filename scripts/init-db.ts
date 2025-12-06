import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function initDatabase() {
  try {
    console.log('Initializing database...')

    // Crear directorio de datos si no existe
    const dataDir = path.join(process.cwd(), 'prisma')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    // Ejecutar migraciones
    console.log('Running migrations...')
    execSync('npx prisma migrate deploy', { stdio: 'inherit' })

    // Ejecutar seed
    console.log('Seeding database...')
    execSync('npx prisma db seed', { stdio: 'inherit' })

    console.log('Database initialized successfully!')
  } catch (error) {
    console.error('Error initializing database:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

initDatabase()
