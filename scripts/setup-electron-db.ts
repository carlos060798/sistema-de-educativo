import { execSync } from 'child_process'
import path from 'path'
import fs from 'fs'
import os from 'os'

// Ruta de la base de datos de Electron
const userDataPath = path.join(os.homedir(), 'AppData', 'Roaming', 'sistema-educativo')
const dbDir = path.join(userDataPath, 'data')
const dbPath = path.join(dbDir, 'database.db')

console.log('=== Setup Electron Database ===\n')
console.log(`Database path: ${dbPath}\n`)

// Crear directorio si no existe
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
  console.log('✅ Created database directory')
}

// Configurar URL de la base de datos
const databaseUrl = `file:${dbPath}`
process.env.DATABASE_URL = databaseUrl

console.log('Applying migrations...')
try {
  execSync('npx prisma migrate deploy', { stdio: 'inherit' })
  console.log('✅ Migrations applied\n')
} catch (error) {
  console.error('❌ Failed to apply migrations')
  process.exit(1)
}

console.log('Running seed...')
try {
  execSync('npx tsx scripts/seed-electron-db.ts', { stdio: 'inherit' })
} catch (error) {
  console.error('❌ Failed to seed database')
  process.exit(1)
}

console.log('\n=== Setup Complete ===')
console.log('\nYou can now login with:')
console.log('  Username: admin')
console.log('  Password: admin123')
