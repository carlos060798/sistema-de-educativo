import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUsers() {
  try {
    console.log('Checking database...\n')

    const users = await prisma.user.findMany({
      include: {
        role: true
      }
    })

    console.log(`Found ${users.length} users:\n`)

    users.forEach(user => {
      console.log(`- ID: ${user.id}`)
      console.log(`  Username: ${user.username}`)
      console.log(`  Role: ${user.role.name}`)
      console.log(`  Password Hash: ${user.passwordHash.substring(0, 20)}...`)
      console.log(`  Created: ${user.createdAt}\n`)
    })

    if (users.length === 0) {
      console.log('⚠️  No users found! You need to run the seed.')
      console.log('Run: npx prisma db seed')
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()
