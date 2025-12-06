import { PrismaClient } from '@prisma/client'
import { verify } from 'argon2'

const prisma = new PrismaClient()

async function testLogin() {
  try {
    const username = 'admin'
    const password = 'admin123'

    console.log(`Testing login with username: ${username}`)
    console.log(`Testing login with password: ${password}\n`)

    const user = await prisma.user.findUnique({
      where: { username },
      include: { role: true }
    })

    if (!user) {
      console.log('❌ User not found!')
      return
    }

    console.log('✅ User found in database')
    console.log(`   Username: ${user.username}`)
    console.log(`   Role: ${user.role.name}`)
    console.log(`   Password hash: ${user.passwordHash.substring(0, 30)}...\n`)

    console.log('Verifying password...')
    const isValid = await verify(user.passwordHash, password)

    if (isValid) {
      console.log('✅ Password is CORRECT!')
      console.log('\nCredentials work:')
      console.log(`   Username: ${username}`)
      console.log(`   Password: ${password}`)
    } else {
      console.log('❌ Password is INCORRECT!')
      console.log('\nThe password hash in the database does not match.')
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testLogin()
