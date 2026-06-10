import type { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { authenticate } from '../plugins/authenticate'

export async function materialsRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [authenticate] }, async (request, reply) => {
    const materials = await prisma.material.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return { materials }
  })

  app.post('/', { preHandler: [authenticate] }, async (request, reply) => {
    const { title, description, image, isPremium, price, link, category } = request.body as any

    if (!title || !description || !image) {
      return reply.status(400).send({ message: 'Título, descrição e imagem são obrigatórios' })
    }

    const material = await prisma.material.create({
      data: {
        title,
        description,
        image,
        isPremium: isPremium || false,
        price,
        link,
        category: category || "GERAL"
      }
    })

    return reply.status(201).send({ message: 'Material criado com sucesso', material })
  })

  app.put('/:id', { preHandler: [authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const data = request.body as any

    const material = await prisma.material.update({
      where: { id },
      data
    })

    return { material }
  })

  app.delete('/:id', { preHandler: [authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }

    await prisma.material.delete({
      where: { id }
    })

    return { message: 'Material excluído com sucesso' }
  })

  app.get('/:id/content', { preHandler: [authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const material = await prisma.material.findUnique({
      where: { id },
      include: {
        sections: {
          where: { parentId: null },
          orderBy: { sortOrder: 'asc' },
          include: {
            children: {
              orderBy: { sortOrder: 'asc' }
            }
          }
        }
      }
    })

    if (!material) {
      return reply.status(404).send({ message: 'Material não encontrado' })
    }

    return { material }
  })

  app.post('/:id/sections', { preHandler: [authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { title, content, parentId, sortOrder } = request.body as any

    if (!title) {
      return reply.status(400).send({ message: 'Título da seção é obrigatório' })
    }

    const section = await prisma.materialSection.create({
      data: {
        materialId: id,
        title,
        content: content || '',
        parentId: parentId || null,
        sortOrder: sortOrder || 0
      }
    })

    return reply.status(201).send({ section })
  })

  app.put('/sections/:sectionId', { preHandler: [authenticate] }, async (request, reply) => {
    const { sectionId } = request.params as { sectionId: string }
    const data = request.body as any

    const section = await prisma.materialSection.update({
      where: { id: sectionId },
      data
    })

    return { section }
  })

  app.delete('/sections/:sectionId', { preHandler: [authenticate] }, async (request, reply) => {
    const { sectionId } = request.params as { sectionId: string }

    await prisma.materialSection.delete({
      where: { id: sectionId }
    })

    return { message: 'Seção excluída com sucesso' }
  })

  app.get('/:id/bookmark', { preHandler: [authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const userReq = (request as any).user
    const userId = userReq.sub

    let bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_materialId: { userId, materialId: id }
      }
    })

    return { bookmark }
  })

  app.post('/:id/bookmark', { preHandler: [authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const userReq = (request as any).user
    const userId = userReq.sub
    const { sectionId, progress } = request.body as any

    const bookmark = await prisma.bookmark.upsert({
      where: {
        userId_materialId: { userId, materialId: id }
      },
      update: {
        sectionId: sectionId || null,
        progress: progress || 0
      },
      create: {
        userId,
        materialId: id,
        sectionId: sectionId || null,
        progress: progress || 0
      }
    })

    return { bookmark }
  })
}