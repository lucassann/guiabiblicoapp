import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@guiabiblico.com'
  const password = '123'
  const password_hash = await bcrypt.hash(password, 6)

  await prisma.user.upsert({
    where: { email },
    update: { password_hash, role: 'ADMIN' },
    create: { email, password_hash, role: 'ADMIN' }
  })
  console.log('Admin criado: admin@guiabiblico.com / 123')
}

main()
