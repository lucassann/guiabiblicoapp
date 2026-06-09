import type { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'

export async function bibleRoutes(app: FastifyInstance) {
  
  // Listar todos os livros
  app.get('/books', async (request, reply) => {
    const books = await prisma.book.findMany({
      select: {
        id: true,
        name: true,
        abbrev: true,
      },
      orderBy: {
        id: 'asc'
      }
    })
    return books
  })

  // Listar capítulos de um livro específico
  app.get('/books/:abbrev/chapters', async (request, reply) => {
    const { abbrev } = request.params as { abbrev: string }

    const book = await prisma.book.findFirst({
      where: { abbrev },
      include: {
        chapters: {
          select: {
            id: true,
            number: true
          },
          orderBy: {
            number: 'asc'
          }
        }
      }
    })

    if (!book) {
      return reply.status(404).send({ message: 'Livro não encontrado' })
    }

    return {
      book: book.name,
      chapters: book.chapters
    }
  })

  // Listar versículos de um capítulo
  app.get('/books/:abbrev/chapters/:chapterNumber/verses', async (request, reply) => {
    const { abbrev, chapterNumber } = request.params as { abbrev: string, chapterNumber: string }
    const { version } = request.query as { version?: string }
    const selectedVersion = version ? version.toLowerCase() : 'nvi'

    const book = await prisma.book.findFirst({
      where: { abbrev }
    })

    if (!book) {
      return reply.status(404).send({ message: 'Livro não encontrado' })
    }

    const chapter = await prisma.chapter.findFirst({
      where: {
        bookId: book.id,
        number: parseInt(chapterNumber)
      },
      include: {
        verses: {
          where: {
            version: selectedVersion
          },
          orderBy: {
            number: 'asc'
          }
        }
      }
    })

    if (!chapter) {
      return reply.status(404).send({ message: 'Capítulo não encontrado' })
    }

    return {
      book: book.name,
      chapter: chapter.number,
      version: selectedVersion,
      verses: chapter.verses
    }
  })

  // Listar comentários de um capítulo
  app.get('/books/:abbrev/chapters/:chapterNumber/commentaries', async (request, reply) => {
    const { abbrev, chapterNumber } = request.params as { abbrev: string, chapterNumber: string }

    const commentaries = await prisma.commentary.findMany({
      where: {
        bookAbbrev: abbrev.toLowerCase(),
        chapter: parseInt(chapterNumber)
      },
      orderBy: {
        verse: 'asc'
      }
    })

    return { commentaries }
  })
}
