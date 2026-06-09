import type { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { authenticate } from '../plugins/authenticate'

export async function materialsRoutes(app: FastifyInstance) {
  // Listar todos os materiais (Público/Autenticado)
  app.get('/', { preHandler: [authenticate] }, async (request, reply) => {
    const materials = await prisma.material.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return { materials }
  })

  // Criar material (Admin)
  app.post('/', { preHandler: [authenticate] }, async (request, reply) => {
    const { title, description, image, isPremium, price, link, category } = request.body as any

    if (!title || !description || !image || !link) {
      return reply.status(400).send({ message: 'Título, descrição, imagem e link são obrigatórios' })
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

  // Atualizar material (Admin)
  app.put('/:id', { preHandler: [authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const data = request.body as any

    const material = await prisma.material.update({
      where: { id },
      data
    })

    return { material }
  })

  // Excluir material (Admin)
  app.delete('/:id', { preHandler: [authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }

    await prisma.material.delete({
      where: { id }
    })

    return { message: 'Material excluído com sucesso' }
  })
}
