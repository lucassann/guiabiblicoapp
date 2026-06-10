import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'
import { authenticate } from '../plugins/authenticate'

export async function usersRoutes(app: FastifyInstance) {
  // GET /api/users (List all users for Admin Panel)
  app.get('/', { preHandler: [authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
      })

      // Hide passwords
      const safeUsers = users.map(u => {
        const { password_hash, ...safeUser } = u
        return safeUser
      })

      return reply.send({ users: safeUsers })
    } catch (error) {
      console.error(error)
      return reply.status(500).send({ error: 'Erro ao buscar usuários' })
    }
  })

  // GET /api/users/me (Fetch profile and calculate streak)
  app.get('/me', { preHandler: [authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userReq = (request as any).user
      const userId = userReq.sub

      let user = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        return reply.status(404).send({ error: 'Usuário não encontrado' })
      }

      const today = new Date()
      // Normalize to midnight
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      
      let newStreak = user.streakDays
      let needsUpdate = false

      if (!user.lastLoginDate) {
        // First ever login recorded
        newStreak = 1
        needsUpdate = true
      } else {
        const lastLogin = new Date(user.lastLoginDate)
        const lastLoginStart = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate())
        
        // Difference in days
        const diffTime = Math.abs(todayStart.getTime() - lastLoginStart.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays === 1) {
          // Logged in yesterday
          newStreak += 1
          needsUpdate = true
        } else if (diffDays > 1) {
          // Missed a day or more
          newStreak = 1
          needsUpdate = true
        }
        // If diffDays === 0, logged in today already, no change to streak
      }

      if (needsUpdate) {
        user = await prisma.user.update({
          where: { id: userId },
          data: {
            streakDays: newStreak,
            lastLoginDate: today
          }
        })
      }

      // Hide password
      const { password_hash, ...safeUser } = user

      return reply.send({ user: safeUser })
    } catch (error) {
      console.error(error)
      return reply.status(500).send({ error: 'Erro ao buscar perfil' })
    }
  })

  // PUT /api/users/password (Change password)
  app.put('/password', { preHandler: [authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userReq = (request as any).user
      const userId = userReq.sub
      const { currentPassword, newPassword } = request.body as { currentPassword: string; newPassword: string }

      if (!currentPassword || !newPassword) {
        return reply.status(400).send({ error: 'Senha atual e nova senha são obrigatórias' })
      }
      if (newPassword.length < 3) {
        return reply.status(400).send({ error: 'Nova senha deve ter no mínimo 3 caracteres' })
      }

      const user = await prisma.user.findUnique({ where: { id: userId } })
      if (!user) return reply.status(404).send({ error: 'Usuário não encontrado' })

      const valid = await bcrypt.compare(currentPassword, user.password_hash)
      if (!valid) return reply.status(400).send({ error: 'Senha atual incorreta' })

      const password_hash = await bcrypt.hash(newPassword, 6)
      await prisma.user.update({
        where: { id: userId },
        data: { password_hash }
      })

      return reply.send({ message: 'Senha alterada com sucesso' })
    } catch (error) {
      console.error(error)
      return reply.status(500).send({ error: 'Erro ao alterar senha' })
    }
  })

  // PUT /api/users/avatar
  app.put('/avatar', { preHandler: [authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userReq = (request as any).user
      const userId = userReq.sub
      const { avatarId } = request.body as { avatarId: string }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { avatarId }
      })

      const { password_hash, ...safeUser } = updatedUser
      return reply.send({ user: safeUser })
    } catch (error) {
      console.error(error)
      return reply.status(500).send({ error: 'Erro ao atualizar avatar' })
    }
  })
}
