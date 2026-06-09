import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log('Limpando banco de dados...')
  await prisma.verse.deleteMany()
  await prisma.chapter.deleteMany()
  await prisma.book.deleteMany()
  await prisma.commentary.deleteMany()

  const bookNames: Record<string, string> = {
    gn: "Gênesis", ex: "Êxodo", lv: "Levítico", nm: "Números", dt: "Deuteronômio",
    js: "Josué", jz: "Juízes", rt: "Rute", "1sm": "1 Samuel", "2sm": "2 Samuel",
    "1rs": "1 Reis", "2rs": "2 Reis", "1cr": "1 Crônicas", "2cr": "2 Crônicas", ed: "Esdras",
    ne: "Neemias", et: "Ester", jo: "Jó", sl: "Salmos", pv: "Provérbios", ec: "Eclesiastes",
    ct: "Cânticos", is: "Isaías", jr: "Jeremias", lm: "Lamentações", ez: "Ezequiel", dn: "Daniel",
    os: "Oséias", jl: "Joel", am: "Amós", ob: "Obadias", jn: "Jonas", mq: "Miquéias",
    na: "Naum", hc: "Habacuque", sf: "Sofonias", ag: "Ageu", zc: "Zacarias", ml: "Malaquias",
    mt: "Mateus", mc: "Marcos", lc: "Lucas", joao: "João", at: "Atos", rm: "Romanos",
    "1co": "1 Coríntios", "2co": "2 Coríntios", gl: "Gálatas", ef: "Efésios", fp: "Filipenses",
    cl: "Colossenses", "1ts": "1 Tessalonicenses", "2ts": "2 Tessalonicenses", "1tm": "1 Timóteo",
    "2tm": "2 Timóteo", tt: "Tito", fm: "Filemom", hb: "Hebreus", tg: "Tiago", "1pe": "1 Pedro",
    "2pe": "2 Pedro", "1jo": "1 João", "2jo": "2 João", "3jo": "3 João", jd: "Judas", ap: "Apocalipse"
  }

  const versions = ['nvi', 'ARA', 'ACF', 'ARC', 'NVT']
  
  for (const version of versions) {
    console.log(`Lendo arquivo JSON da Bíblia (${version})...`)
    const filePath = version === 'nvi' 
      ? path.join(__dirname, 'bibles', 'pt_nvi.json')
      : path.join(__dirname, 'bibles', `${version}.json`)
    
    if (!fs.existsSync(filePath)) {
      console.log(`Arquivo ${version}.json não encontrado. Pulando...`)
      continue
    }

    const fileData = fs.readFileSync(filePath, 'utf-8').replace(/^\uFEFF/, '')
    const bibleData = JSON.parse(fileData)

    console.log(`Importando versão ${version}...`)

    for (const bookData of bibleData) {
      const abbrev = bookData.abbrev.toLowerCase()
      const name = bookNames[abbrev] || bookData.name || abbrev.toUpperCase()

      // Tenta achar ou criar o livro
      let book = await prisma.book.findUnique({
        where: { abbrev }
      })

      if (!book) {
        book = await prisma.book.create({
          data: { name, abbrev }
        })
      }

      const chapters = bookData.chapters
      for (let c = 0; c < chapters.length; c++) {
        const chapterNumber = c + 1
        
        // Tenta achar ou criar o capítulo
        let chapter = await prisma.chapter.findFirst({
          where: { bookId: book.id, number: chapterNumber }
        })

        if (!chapter) {
          chapter = await prisma.chapter.create({
            data: { number: chapterNumber, bookId: book.id }
          })
        }

        const versesData = chapters[c]
        const versesToInsert = versesData.map((textData: any, index: number) => {
          let parsedText = ''
          if (typeof textData === 'string') {
            parsedText = textData
          } else if (Array.isArray(textData)) {
            parsedText = textData.join(' ')
          } else if (textData && typeof textData === 'object') {
            // Se for um objeto com outras infos, tentamos extrair o texto
            parsedText = textData.text || JSON.stringify(textData)
          }

          return {
            number: index + 1,
            text: parsedText,
            version: version.toLowerCase(),
            chapterId: chapter.id
          }
        })

        await prisma.verse.createMany({
          data: versesToInsert
        })
      }
    }
  }

  console.log('Todas as versões da Bíblia importadas com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
