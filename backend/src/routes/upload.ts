import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import fs from 'node:fs'
import path, { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pipeline } from 'node:stream/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
import { v4 as uuidv4 } from 'uuid'
import { authenticate } from '../plugins/authenticate'

export async function uploadRoutes(app: FastifyInstance) {
  app.post(
    '/',
    { preHandler: [authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const data = await request.file()

      if (!data) {
        return reply.status(400).send({ error: 'Nenhum arquivo enviado.' })
      }

      // Check if it is an image
      const mimeTypeRegex = /^(image)\/[a-zA-Z]+/
      const isValidFileFormat = mimeTypeRegex.test(data.mimetype)

      if (!isValidFileFormat) {
        return reply.status(400).send({ error: 'Formato de arquivo inválido. Apenas imagens são permitidas.' })
      }

      const fileId = uuidv4()
      const extension = path.extname(data.filename)
      const fileName = fileId.concat(extension)

      // Get the absolute path to public/uploads
      const uploadDir = path.resolve(__dirname, '../../public/uploads')
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }

      const filePath = path.resolve(uploadDir, fileName)
      const writeStream = fs.createWriteStream(filePath)

      await pipeline(data.file, writeStream)

      const port = process.env.PORT || 3333
      const fileUrl = `http://localhost:${port}/uploads/${fileName}`

      return reply.send({ url: fileUrl })
    }
  )
}
