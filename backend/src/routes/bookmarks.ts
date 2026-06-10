import type { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { authenticate } from '../plugins/authenticate'

export async function bookmarksRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [authenticate] }, async (request, reply) => {
    const userReq = (request as any).user
    const userId = userReq.sub

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      include: {
        material: {
          select: { id: true, title: true, image: true, category: true }
        },
        section: {
          select: { id: true, title: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return { bookmarks }
  })
}