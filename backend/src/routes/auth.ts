import type { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', async (request, reply) => {
    const { email, password } = request.body as any

    if (!email || !password) {
      return reply.status(400).send({ message: 'E-mail e senha são obrigatórios' })
    }

    const userExists = await prisma.user.findUnique({
      where: { email }
    })

    if (userExists) {
      return reply.status(400).send({ message: 'E-mail já cadastrado' })
    }

    const password_hash = await bcrypt.hash(password, 6)

    const user = await prisma.user.create({
      data: {
        email,
        password_hash
      }
    })

    return reply.status(201).send({ message: 'Usuário criado com sucesso', userId: user.id })
  })

  app.post('/login', async (request, reply) => {
    const { email, password } = request.body as any

    if (!email || !password) {
      return reply.status(400).send({ message: 'E-mail e senha são obrigatórios' })
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return reply.status(401).send({ message: 'Credenciais inválidas' })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash)

    if (!isPasswordValid) {
      return reply.status(401).send({ message: 'Credenciais inválidas' })
    }

    const token = jwt.sign(
      { role: user.role },
      process.env.JWT_SECRET || 'super-secret',
      { subject: user.id, expiresIn: '7d' }
    )

    return reply.send({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    })
  })
}
