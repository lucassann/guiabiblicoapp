import type { FastifyRequest, FastifyReply } from 'fastify'
import jwt from 'jsonwebtoken'

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization
    if (!authHeader) {
      return reply.status(401).send({ message: 'Token não fornecido' })
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return reply.status(401).send({ message: 'Token mal formatado' })
    }

    const token = parts[1]
    if (!token) {
      return reply.status(401).send({ message: 'Token mal formatado' })
    }

    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      return reply.status(500).send({ message: 'JWT_SECRET não configurado' })
    }
    const decoded = jwt.verify(token, jwtSecret)
    
    // Anexar informações do usuário à request, caso seja necessário nas rotas
    ;(request as any).user = decoded
  } catch (err) {
    return reply.status(401).send({ message: 'Token inválido ou expirado' })
  }
}
