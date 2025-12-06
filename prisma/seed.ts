import { PrismaClient } from '@prisma/client'
import { hash } from 'argon2'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

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

  console.log('Roles created:', { adminRole, teacherRole, viewerRole })

  // Crear usuario administrador por defecto
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

  console.log('Admin user created:', adminUser)

  // Crear algunos datos de ejemplo
  const mathSubject = await prisma.subject.create({
    data: {
      code: 'MAT-001',
      name: 'Matemáticas',
      description: 'Matemáticas básicas'
    }
  })

  const scienceSubject = await prisma.subject.create({
    data: {
      code: 'SCI-001',
      name: 'Ciencias',
      description: 'Ciencias naturales'
    }
  })

  console.log('Subjects created:', { mathSubject, scienceSubject })

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
