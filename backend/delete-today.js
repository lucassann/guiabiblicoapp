import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function run() {
  await prisma.dailyBread.deleteMany({})
  console.log("Deleted all daily breads to test fresh fallback.")
}
run()
