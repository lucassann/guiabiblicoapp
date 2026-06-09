import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../lib/prisma'
import { authenticate } from '../plugins/authenticate'

import { GoogleGenerativeAI } from '@google/generative-ai'

// ... in the routes function
export async function dailyBreadRoutes(app: FastifyInstance) {
  // GET /api/daily-bread/today (Público/Autenticado)
  app.get('/today', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const today = new Date()
      // Normalize to midnight to ignore time part
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

      let dailyBread = await prisma.dailyBread.findFirst({
        where: {
          date: {
            gte: startOfDay,
            lt: endOfDay
          }
        }
      })

      // Fallback: se não tiver o de hoje, gerar com IA
      if (!dailyBread) {
        try {
          const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
          const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
          
          const prompt = `
Você é um teólogo e pastor experiente.
Escolha UM versículo bíblico encorajador, inspirador ou de sabedoria.
Escreva um pequeno Estudo Bíblico/Reflexão (2 a 3 parágrafos curtos) sobre esse versículo.
Retorne APENAS um JSON válido, sem markdown, no seguinte formato:
{
  "verseReference": "Referência do versículo (ex: Mateus 6:33)",
  "verseText": "O texto do versículo",
  "study": "O texto da sua reflexão/estudo"
}
`
          const result = await model.generateContent(prompt)
          const response = await result.response
          let text = response.text()
          
          // Clean markdown from JSON if any
          if (text.includes('\`\`\`json')) {
            text = text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '')
          }
          if (text.includes('\`\`\`')) {
            text = text.replace(/\`\`\`/g, '')
          }
          
          const aiData = JSON.parse(text.trim())

          // Save to database
          dailyBread = await prisma.dailyBread.create({
            data: {
              date: startOfDay,
              verseReference: aiData.verseReference,
              verseText: aiData.verseText,
              study: aiData.study,
              imageUrl: '' // Sem imagem por padrão na IA
            }
          })
        } catch (aiError) {
          console.error("Erro na geração de IA, usando fallback local", aiError)
          
          const fallbackDevotionals = [
            {
              verseReference: "Filipenses 4:13",
              verseText: "Tudo posso naquele que me fortalece.",
              study: "### Contexto Histórico\nO apóstolo Paulo escreveu esta carta enquanto estava preso em Roma, aguardando um julgamento que poderia resultar em sua execução. Apesar de estar acorrentado, privado de liberdade e dependendo de doações para sobreviver, esta é conhecida como a 'Carta da Alegria'. É fascinante notar que a maior declaração de força do Novo Testamento não foi escrita por alguém no auge do sucesso terreno, mas por um homem em uma masmorra.\n\n### Exegese e Significado Profundo\nMuitas vezes, este versículo é retirado de contexto e usado como um 'slogan motivacional' para o sucesso financeiro ou conquistas pessoais. No entanto, ao ler os versículos anteriores (11 e 12), vemos Paulo dizendo: 'Aprendi a adaptar-me a toda e qualquer circunstância... aprendi o segredo de viver contente em toda e qualquer situação, seja bem alimentado, seja com fome, tendo muito, ou passando necessidade'.\nA verdadeira mensagem aqui não é 'Deus me dará superpoderes para conquistar meus desejos', mas sim: 'Cristo me dará resiliência para suportar qualquer provação sem perder a minha fé e a minha alegria'. A força mencionada por Paulo é a capacidade de permanecer inabalável diante da escassez e humilde diante da abundância.\n\n### Aplicação Prática\nQuais são as circunstâncias que estão tentando roubar a sua paz hoje? Você está enfrentando um momento de humilhação, escassez ou de uma dor profunda? Lembre-se que a sua fonte de poder não vem do seu próprio intelecto, conta bancária ou conexões humanas. A sua força vem de estar 'naquele' que o fortalece. Quando o seu suprimento humano acabar, o suprimento celestial entra em ação.\n\n### Oração do Dia\n*Senhor, perdoa-me por tantas vezes apoiar a minha força em coisas passageiras. Ajuda-me a encontrar o segredo do contentamento, sabendo que, independentemente da minha situação atual, a Tua graça me basta. Revigora o meu espírito hoje e me dá a resiliência de Cristo para vencer as batalhas desta semana. Em nome de Jesus, Amém.*"
            },
            {
              verseReference: "João 16:33",
              verseText: "Eu disse essas coisas para que em mim vocês tenham paz. Neste mundo vocês terão aflições; contudo, tenham ânimo! Eu venci o mundo.",
              study: "### Contexto Histórico\nEstas são algumas das últimas palavras de Jesus aos Seus discípulos antes de ser traído, preso e crucificado. Ele estava os preparando para o choque terrível que estava por vir. Os discípulos esperavam um Messias político que libertaria Israel do império romano com força e poder, mas Jesus lhes entregou uma realidade muito diferente: o sofrimento era inevitável.\n\n### Exegese e Significado Profundo\nA palavra grega usada para 'aflições' aqui é *thlipsis*, que significa pressão, angústia, perseguição ou esmagamento (como o processo de esmagar uvas para fazer vinho). Jesus foi brutalmente honesto. Ele não nos vendeu uma falsa ilusão de que o cristianismo seria um mar de rosas. Pelo contrário, Ele garantiu que a dor faria parte da jornada.\nContudo, a chave de ouro deste texto está na palavra 'ânimo' (ou coragem). Por que deveríamos ter coragem diante do esmagamento? Porque a batalha final já foi decidida. A expressão 'Eu venci o mundo' está no tempo perfeito do grego, indicando uma vitória que já aconteceu e cujos efeitos duram para sempre. \n\n### Aplicação Prática\nVocê está se sentindo esmagado (*thlipsis*) pelas circunstâncias hoje? Problemas financeiros, diagnósticos médicos assustadores ou conflitos familiares podem tentar roubar a sua paz. Mas preste atenção: Jesus disse que a paz é encontrada 'EM MIM', não na ausência de problemas. A paz bíblica (Shalom) não é um ambiente sem tempestades, é ter a âncora certa no meio do furacão.\n\n### Oração do Dia\n*Pai Celestial, a pressão deste mundo muitas vezes tenta me sufocar. Ensina-me a não buscar a paz na resolução imediata dos meus problemas, mas em habitar na Tua presença. Que a vitória de Cristo na cruz seja a fonte inesgotável da minha coragem diária. Ajuda-me a ter bom ânimo, pois sei que a última palavra sobre a minha vida não pertence às circunstâncias, mas a Ti. Amém.*"
            },
            {
              verseReference: "Provérbios 3:5-6",
              verseText: "Confie no Senhor de todo o seu coração e não se apoie em seu próprio entendimento; reconheça o Senhor em todos os seus caminhos, e ele endireitará as suas veredas.",
              study: "### Contexto Histórico\nO livro de Provérbios foi escrito majoritariamente pelo rei Salomão, o homem considerado o mais sábio de sua época. É um livro prático, focado em como viver bem diante de Deus e dos homens. O que torna este texto fascinante é que Salomão, um gênio intelectual que dominava botânica, literatura, arquitetura e política, está aconselhando: 'Não confie na sua própria inteligência'.\n\n### Exegese e Significado Profundo\nA palavra hebraica para 'confiar' é *batach*, que carrega o sentido de se jogar de costas sobre algo, sabendo que será segurado. É uma confiança que exige vulnerabilidade. O texto também usa a palavra 'todo' o coração, não permitindo uma confiança dividida (metade em Deus, metade no meu salário ou nas minhas habilidades).\nAlém disso, 'reconhecer' a Deus não significa apenas dar um 'bom dia' a Ele pela manhã, mas a palavra original *yada* significa conhecer intimamente, trazer Deus para dentro das engrenagens práticas da sua vida diária. Em troca, a promessa é clara: Ele 'endireitará' (tornará plano e removerá os obstáculos intransponíveis) o seu caminho.\n\n### Aplicação Prática\nNós sofremos da ilusão do controle. Planejamos nossos dias, finanças e carreiras acreditando que sabemos o que é melhor para nós. Mas a sabedoria divina nos convida a abrir mão desse controle. Qual é a área da sua vida que você está tentando resolver apenas com a força do seu próprio braço? Apresente essa questão a Deus hoje. Deixe que Ele assuma a direção, e observe como portas que você não conseguia abrir se abrirão naturalmente.\n\n### Oração do Dia\n*Senhor Deus, confesso que frequentemente me orgulho do meu próprio entendimento e tento guiar a minha própria vida. Hoje, eu escolho soltar o controle. Eu me jogo nos Teus braços de amor e sabedoria. Peço que o Senhor seja o diretor dos meus caminhos, das minhas finanças, da minha família e das minhas emoções. Endireita aquilo que está torto e guia os meus passos. Em nome de Jesus, Amém.*"
            }
          ]
          
          // Pick a random fallback devotional
          const randomDevotional = fallbackDevotionals[Math.floor(Math.random() * fallbackDevotionals.length)]

          dailyBread = await prisma.dailyBread.create({
            data: {
              date: startOfDay,
              verseReference: randomDevotional?.verseReference || '',
              verseText: randomDevotional?.verseText || '',
              study: randomDevotional?.study || '',
              imageUrl: ''
            }
          })
        }
      }

      return reply.send({ dailyBread })
    } catch (error) {
      console.error(error)
      return reply.status(500).send({ error: 'Erro ao buscar o pão diário' })
    }
  })

  // Listar todos os pães diários (Admin)
  app.get('/', { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const dailyBreads = await prisma.dailyBread.findMany({
        orderBy: { date: 'desc' }
      })
      return reply.send({ dailyBreads })
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao listar os devocionais' })
    }
  })

  // Criar um pão diário (Admin)
  app.post('/', { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const { date, verseText, verseReference, study, imageUrl } = request.body as any
      const newDailyBread = await prisma.dailyBread.create({
        data: {
          date: new Date(date),
          verseText,
          verseReference,
          study,
          imageUrl
        }
      })
      return reply.send({ dailyBread: newDailyBread })
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao criar o devocional' })
    }
  })

  // Atualizar (Admin)
  app.put('/:id', { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const { date, verseText, verseReference, study, imageUrl } = request.body as any
      const updated = await prisma.dailyBread.update({
        where: { id },
        data: {
          date: new Date(date),
          verseText,
          verseReference,
          study,
          imageUrl
        }
      })
      return reply.send({ dailyBread: updated })
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao atualizar' })
    }
  })

  // Deletar (Admin)
  app.delete('/:id', { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      await prisma.dailyBread.delete({ where: { id } })
      return reply.send({ message: 'Deletado com sucesso' })
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao deletar' })
    }
  })
}
