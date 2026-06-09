import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@guiabiblico.com'
  const password = '1234567'
  const password_hash = await bcrypt.hash(password, 6)

  await prisma.user.update({
    where: { email },
    data: { password_hash }
  })
  console.log('Senha atualizada com sucesso para 1234567')
}

main()
