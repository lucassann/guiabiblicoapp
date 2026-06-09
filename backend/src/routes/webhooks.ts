import type { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

export async function webhooksRoutes(app: FastifyInstance) {
  // Rota que a Kiwify vai chamar (POST /api/webhooks/kiwify)
  app.post('/kiwify', async (request, reply) => {
    // Para validar a assinatura no futuro:
    // const signature = request.headers['x-kiwify-signature']
    // Opcional: Validar se a requisição veio mesmo da Kiwify usando o Webhook Token

    const payload = request.body as any
    console.log('[Kiwify Webhook] Recebido:', JSON.stringify(payload, null, 2))

    // A Kiwify manda os dados do comprador dentro de "Customer" ou no corpo raiz dependendo da versão
    // O campo "order_status" indica o que aconteceu (approved, refunded, chargeback)
    const orderStatus = payload.order_status
    
    // Dados do cliente
    const customer = payload.Customer || {}
    const email = customer.email
    const firstName = customer.first_name || 'Usuário'
    const lastName = customer.last_name || 'Kiwify'
    const mobile = customer.mobile || ''

    if (!email) {
      return reply.status(400).send({ error: 'E-mail não fornecido no payload' })
    }

    try {
      if (orderStatus === 'paid' || orderStatus === 'approved') {
        // Compra Aprovada
        const randomPassword = crypto.randomBytes(8).toString('hex') 

        const user = await prisma.user.upsert({
          where: { email },
          update: {
            role: 'VIP', 
          },
          create: {
            email,
            password_hash: randomPassword,
            role: 'VIP'
          }
        })

        console.log(`[Kiwify] Conta liberada/criada para: ${user.email}`)
      } 
      else if (orderStatus === 'refunded' || orderStatus === 'chargeback') {
        // Compra Reembolsada ou Contestada
        const user = await prisma.user.update({
          where: { email },
          data: { role: 'SUSPENDED' } 
        })

        console.log(`[Kiwify] Conta suspensa devido a reembolso: ${user.email}`)
      }
      else {
        console.log(`[Kiwify] Status não tratado: ${orderStatus}`)
      }

      return reply.send({ success: true })

    } catch (error) {
      console.error('[Kiwify Error] Falha ao processar webhook:', error)
      return reply.status(500).send({ error: 'Erro interno ao processar webhook' })
    }
  })
}
