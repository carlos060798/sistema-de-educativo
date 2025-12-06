import { PrismaClient } from '@prisma/client'
import { hash } from 'argon2'
import path from 'path'
import fs from 'fs'
import os from 'os'

// Simular la ruta que usa Electron
const userDataPath = path.join(os.homedir(), 'AppData', 'Roaming', 'sistema-educativo')
const dbDir = path.join(userDataPath, 'data')
const dbPath = path.join(dbDir, 'database.db')

console.log(`Database path: ${dbPath}\n`)

// Crear directorio si no existe
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true})
  console.log('✅ Created database directory')
}

const databaseUrl = `file:${dbPath}`

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  }
})

async function main() {
  console.log('Seeding Electron database...\n')

  // Crear roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin' }
  })

  const teacherRole = await prisma.role.upsert({
    where: { name: 'teacher' },
    update: {},
    create: { name: 'teacher' }
  })

  const viewerRole = await prisma.role.upsert({
    where: { name: 'viewer' },
    update: {},
    create: { name: 'viewer' }
  })

  console.log('✅ Roles created')

  // Crear usuario administrador
  const adminPassword = await hash('admin123')

  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: adminPassword,
      roleId: adminRole.id
    }
  })

  console.log('✅ Admin user created')
  console.log(`   Username: admin`)
  console.log(`   Password: admin123`)

  // Crear materias de ejemplo
  const mathSubject = await prisma.subject.upsert({
    where: { code: 'MAT-001' },
    update: {},
    create: {
      code: 'MAT-001',
      name: 'Matemáticas',
      description: 'Matemáticas básicas'
    }
  })

  const scienceSubject = await prisma.subject.upsert({
    where: { code: 'SCI-001' },
    update: {},
    create: {
      code: 'SCI-001',
      name: 'Ciencias',
      description: 'Ciencias naturales'
    }
  })

  console.log('✅ Subjects created\n')
  console.log('Seeding completed successfully!')
  console.log('\nYou can now login with:')
  console.log('  Username: admin')
  console.log('  Password: admin123')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
