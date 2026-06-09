import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Deletando materiais antigos...')
  await prisma.material.deleteMany() // Reseta os materiais

  console.log('📚 Semeando materiais super completos por categoria...')

  const materials = [
    // --- PREGADORES ---
    {
      title: "Kit Essencial do Pregador",
      description: "Esboços completos, técnicas de homilética e dicionário teológico para ministros da palavra.",
      image: "https://placehold.co/800x600/d97706/white?text=Kit+Pregador",
      isPremium: true,
      price: "R$ 49,90",
      link: "https://seulinkdevendas.com/kit-pregador",
      category: "PREGADORES"
    },
    {
      title: "Como Montar Seu Sermão",
      description: "Guia passo a passo gratuito de como estruturar mensagens bíblicas impactantes.",
      image: "https://placehold.co/800x600/d97706/white?text=Sermoes",
      isPremium: false,
      link: "https://seulink.com",
      category: "PREGADORES"
    },

    // --- MULHERES ---
    {
      title: "Devocional Mulheres Virtuosas",
      description: "365 devocionais diários voltados para os desafios e a força da mulher cristã moderna.",
      image: "https://placehold.co/800x600/db2777/white?text=Devocional",
      isPremium: true,
      price: "R$ 29,90",
      link: "https://seulinkdevendas.com/mulheres",
      category: "MULHERES"
    },
    {
      title: "Cura Emocional (Estudo)",
      description: "Série de estudos bíblicos focada na restauração emocional feminina.",
      image: "https://placehold.co/800x600/db2777/white?text=Cura+Emocional",
      isPremium: false,
      link: "https://seulink.com",
      category: "MULHERES"
    },

    // --- JOVENS ---
    {
      title: "Combo: Dinâmicas e Quebra-Gelo",
      description: "O maior acervo de dinâmicas divertidas e profundas para o seu ministério de jovens.",
      image: "https://placehold.co/800x600/2563eb/white?text=Dinamicas",
      isPremium: true,
      price: "R$ 19,90",
      link: "https://seulinkdevendas.com/jovens",
      category: "JOVENS"
    },
    {
      title: "Apologética para a Geração Z",
      description: "Como responder às maiores dúvidas da atualidade usando a Bíblia e a Ciência.",
      image: "https://placehold.co/800x600/2563eb/white?text=Apologetica",
      isPremium: false,
      link: "https://seulink.com",
      category: "JOVENS"
    },

    // --- CÉLULAS E IGREJA ---
    {
      title: "Plano de Multiplicação de Células",
      description: "E-book definitivo para treinar líderes de pequenos grupos e multiplicar com saúde.",
      image: "https://placehold.co/800x600/16a34a/white?text=Celulas",
      isPremium: true,
      price: "R$ 39,90",
      link: "https://seulinkdevendas.com/celulas",
      category: "CÉLULAS"
    },

    // --- ESTUDOS E MAPAS ---
    {
      title: "Atlas Bíblico em Alta Resolução",
      description: "Mapas detalhados das viagens de Paulo, êxodo e divisões das tribos para projetar na TV.",
      image: "https://placehold.co/800x600/9333ea/white?text=Atlas",
      isPremium: true,
      price: "R$ 59,90",
      link: "https://seulinkdevendas.com/atlas",
      category: "MAPAS"
    },
    {
      title: "Panorama do Antigo Testamento",
      description: "Material gratuito resumindo os principais temas de Gênesis a Malaquias.",
      image: "https://placehold.co/800x600/0891b2/white?text=Estudos",
      isPremium: false,
      link: "https://seulink.com",
      category: "ESTUDOS"
    },
    {
      title: "Hebreu Bíblico Essencial",
      description: "Aprenda a ler o original e extrair significados ocultos na tradução das escrituras.",
      image: "https://placehold.co/800x600/0891b2/white?text=Hebraico",
      isPremium: true,
      price: "R$ 89,90",
      link: "https://seulinkdevendas.com/hebraico",
      category: "ESTUDOS"
    },

    // --- CRIANÇAS E ANCIÕES ---
    {
      title: "Bíblia Ilustrada (Ministério Infantil)",
      description: "Material para impressão e colorir com as 50 maiores histórias da Bíblia.",
      image: "https://placehold.co/800x600/ea580c/white?text=Kids",
      isPremium: true,
      price: "R$ 15,90",
      link: "https://seulinkdevendas.com/kids",
      category: "CRIANÇAS"
    },
    {
      title: "Mentoria de Liderança Cristã",
      description: "Para pastores, anciões e líderes. Lidando com conflitos na congregação.",
      image: "https://placehold.co/800x600/475569/white?text=Lideranca",
      isPremium: true,
      price: "R$ 99,90",
      link: "https://seulinkdevendas.com/lideranca",
      category: "ANCIÕES"
    }
  ]

  for (const mat of materials) {
    await prisma.material.create({
      data: mat
    })
  }

  console.log('✅ Materiais semeados com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
