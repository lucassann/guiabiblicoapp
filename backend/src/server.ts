import fastify from 'fastify'
import cors from '@fastify/cors'
import fastifyMultipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import path, { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { authRoutes } from './routes/auth'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
import { bibleRoutes } from './routes/bible'
import { usersRoutes } from './routes/users'
import { webhooksRoutes } from './routes/webhooks'
import { materialsRoutes } from './routes/materials'
import { uploadRoutes } from './routes/upload'
import { dailyBreadRoutes } from './routes/daily-bread'

const app = fastify({ logger: true })

app.register(cors, {
  origin: '*', // Permitir todos em dev
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
})

app.register(fastifyMultipart, {
  limits: {
    fileSize: 10485760, // 10MB
  }
})

app.register(fastifyStatic, {
  root: path.resolve(__dirname, '../public/uploads'),
  prefix: '/uploads/',
})

app.register(authRoutes, { prefix: '/auth' })
app.register(bibleRoutes, { prefix: '/api/bible' })
app.register(usersRoutes, { prefix: '/api/users' })
app.register(webhooksRoutes, { prefix: '/api/webhooks' })
app.register(materialsRoutes, { prefix: '/api/materials' })
app.register(uploadRoutes, { prefix: '/api/upload' })
app.register(dailyBreadRoutes, { prefix: '/api/daily-bread' })

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3333
    await app.listen({ port, host: '::' })
    console.log(`Servidor rodando na porta ${port}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
