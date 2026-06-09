import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Limpando comentários antigos...')
  await prisma.commentary.deleteMany()

  console.log('Inserindo comentários de amostra (Matthew Henry - Gênesis 1)...')

  const sampleCommentaries = [
    {
      bookAbbrev: 'gn',
      chapter: 1,
      verse: 1,
      text: "A primeira frase da Bíblia é a chave fundamental da teologia. Ela nos mostra que Deus é o criador de todas as coisas e que antes de todas as coisas existirem, Deus já era. 'No princípio, Deus' nos ensina a dependência absoluta de toda a criação em relação a Ele."
    },
    {
      bookAbbrev: 'gn',
      chapter: 1,
      verse: 2,
      text: "A terra era sem forma e vazia. A criação de Deus começou com o caos, para que o Seu poder, sabedoria e bondade pudessem ser manifestados na ordem e beleza que Ele logo traria. O Espírito de Deus 'pairava' sobre as águas, trazendo vida àquilo que era estéril."
    },
    {
      bookAbbrev: 'gn',
      chapter: 1,
      verse: 3,
      text: "A luz foi a primeira coisa criada. Isso nos ensina que a luz, a pureza, a revelação e a vida vêm pela Palavra de Deus. 'Haja luz' é uma demonstração do poder absoluto da Palavra divina. O que Deus diz, acontece imediatamente."
    },
    {
      bookAbbrev: 'gn',
      chapter: 1,
      verse: 26,
      text: "Aqui temos o conselho da Trindade: 'Façamos o homem'. O homem foi o coroamento da criação, feito com cuidado especial, à imagem de Deus, com inteligência, vontade, santidade e domínio sobre as criaturas."
    }
  ]

  await prisma.commentary.createMany({
    data: sampleCommentaries
  })

  console.log('Comentários de amostra inseridos com sucesso!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
